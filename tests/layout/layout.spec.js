// Layout regression smoke suite.
//
// For each viewport (one Playwright project per viewport — see
// playwright.config.js) this:
//   1. Loads the main menu (?debug=true&skipIntro=1&mute=1&noAnimations=1&noSave=1).
//   2. Jumps to each representative high-risk scene (tests/layout/scenes.js).
//   3. Shows a representative narration / short-speech / long-speech /
//      choice dialogue entry pulled from that scene's OWN authored data.
//   4. Waits for fonts + the dialogue pipeline to settle, then calls the
//      existing window.__HB_DEBUG__.validateCurrentLayout().
//   5. Fails on: console errors (excluding the documented sprite-fallback
//      404 noise), missing required assets, text/content overflow, dialogue
//      rendered outside the game frame, a hidden/offscreen continue button,
//      or a choice button outside the safe area.
//   6. Saves a screenshot + JSON layout snapshot as artifacts either way.
//
// Deliberately NOT asserted: fragile pixel-perfect box positions. The one
// exception is authored `bubbleLayout` entries, which get a tolerance
// check against the same scaled-rect math the engine itself uses — see
// checkBubbleLayoutTolerance() in helpers.js.
const { test, expect } = require('@playwright/test');
const VIEWPORTS = require('./viewports');
const SCENES_TO_TEST = require('./scenes');
const {
  saveArtifacts,
  describeContext,
  pickRepresentativeDialogueEntries,
  showDialogueEntryByIndex,
  isDialogueSettled,
  checkBubbleLayoutTolerance,
} = require('./helpers');

const DEBUG_URL = '/index.html?debug=true&skipIntro=1&mute=1&noAnimations=1&noSave=1';

// Maps 1:1 onto the task's fail list. `missing-speaker-sprite` and
// `duplicate-*` violations are still captured in the saved JSON snapshot for
// visibility, but intentionally don't fail this suite — they're the static
// demoValidator's job (see DEMO_VALIDATION_REPORT.md), not a live-render
// smoke test's.
const FAIL_VIOLATION_TYPES = new Set([
  'dialogue-outside-frame',
  'text-overflow',
  'content-overflow',
  'continue-button-hidden-or-offscreen',
  'choice-outside-safe-area',
  'missing-asset',
]);

const BUBBLE_TOLERANCE_PX = 4;
const CASE_ORDER = ['narration', 'shortSpeech', 'longSpeech', 'choice'];

// buildSpriteCandidates() (index.js) deliberately tries directional sprite
// filenames before falling back to a working one — an earlier candidate
// 404ing is expected, documented behavior (see DEMO_VALIDATION_REPORT.md),
// not a bug, so it's excluded from the "no console errors" invariant.
// Anything else — including a *background*, item, UI, or bubble 404 (none
// of which have a fallback chain) — still fails.
function isExpectedSpriteFallbackNoise(url) {
  return /\/assets\/characters\//.test(url);
}

// screen.orientation.lock() is a real, gracefully try/caught call
// (index.js's requestLandscapeOrientation()) that simply isn't supported
// outside an actual mobile/PWA context — headless Chromium included. It's
// already non-fatal in the app (only errorLogger.log()s, which happens to
// go through console.error), so it isn't a regression to fail this suite
// on.
function isExpectedOrientationLockNoise(text) {
  return /orientation-lock/i.test(text);
}

/**
 * Browser-generated "Failed to load resource: ..." console messages carry
 * no URL in msg.text() — Chromium doesn't put it there — so filtering them
 * by text (an earlier version of this file tried that) can never actually
 * match isExpectedSpriteFallbackNoise() and silently fails every test that
 * touches any fallback-chain sprite. page.on('response') gives the real
 * URL, so resource-load failures are tracked there instead; the console
 * listener below is left to genuine app-level console.error() calls
 * (uncaught logic errors), which always have meaningful, non-URL-dependent
 * text and need no filtering.
 */
function attachConsoleCapture(page) {
  const errors = [];

  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));

  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource/i.test(text)) return;
    if (isExpectedOrientationLockNoise(text)) return;
    errors.push(text);
  });

  page.on('response', response => {
    if (response.ok()) return;
    const url = response.url();
    if (isExpectedSpriteFallbackNoise(url)) return;
    errors.push(`Failed to load resource: ${url} (status ${response.status()})`);
  });

  return errors;
}

test('main menu loads cleanly', async ({ page }, testInfo) => {
  const consoleErrors = attachConsoleCapture(page);

  await page.goto(DEBUG_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__HB_DEBUG__, null, { timeout: 10_000 });
  await page.waitForFunction(
    () => typeof sceneRenderer !== 'undefined' && !sceneRenderer.isTransitioning,
    null,
    { timeout: 10_000 }
  );
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => ({
    currentSceneId: gameState.currentSceneId,
    menuVisible: !!document.getElementById('main-menu-content'),
  }));

  const ctx = `viewport="${testInfo.project.name}" scene="S0_MAIN_MENU" case="main-menu-load"`;
  await saveArtifacts({
    page, viewportName: testInfo.project.name, sceneId: 'S0_MAIN_MENU', caseName: 'main-menu',
    snapshot: { state, consoleErrors },
  });

  expect(state.currentSceneId, `${ctx} metric=currentSceneId`).toBe('S0_MAIN_MENU');
  expect(state.menuVisible, `${ctx} metric=menuVisible`).toBe(true);
  expect(consoleErrors, `${ctx} metric=consoleErrors`).toEqual([]);
});

for (const sceneId of SCENES_TO_TEST) {
  test.describe(sceneId, () => {
    test.describe.configure({ mode: 'serial' });

    /** @type {import('@playwright/test').Page} */
    let page;
    let consoleErrors;
    let errorCursor = 0;

    test.beforeAll(async ({ browser }, testInfo) => {
      const vp = VIEWPORTS.find(v => v.name === testInfo.project.name);
      // Manually-created pages (needed so every case in this scene shares
      // one page/session) don't inherit the project's viewport the way the
      // `page` fixture does, so it's passed explicitly here.
      page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      consoleErrors = attachConsoleCapture(page);

      await page.goto(DEBUG_URL, { waitUntil: 'load' });
      await page.waitForFunction(() => !!window.__HB_DEBUG__, null, { timeout: 10_000 });
      await page.waitForFunction(
        () => typeof sceneRenderer !== 'undefined' && !sceneRenderer.isTransitioning,
        null,
        { timeout: 10_000 }
      );

      const jumpResult = await page.evaluate((id) => window.__HB_DEBUG__.jumpToScene(id), sceneId);
      expect(jumpResult.ok, `scene="${sceneId}" metric=jumpToScene error=${jumpResult.error || 'none'}`).toBe(true);

      await page.waitForFunction(
        () => typeof sceneRenderer !== 'undefined' && !sceneRenderer.isTransitioning,
        null,
        { timeout: 10_000 }
      );
      // Scenes stagger addCharacter() slide-ins (200ms + 400ms per
      // character); give the slowest representative scene (S9, 3
      // characters) room to finish before the first dialogue case runs.
      await page.waitForTimeout(1800);
      errorCursor = consoleErrors.length; // scene-load noise isn't attributed to a dialogue case
    });

    test.afterAll(async () => {
      if (page) await page.close();
    });

    for (const caseName of CASE_ORDER) {
      test(caseName, async ({}, testInfo) => {
        const viewportName = testInfo.project.name;
        const picks = await page.evaluate(pickRepresentativeDialogueEntries, sceneId);
        const entry = picks[caseName];
        test.skip(!entry, `scene "${sceneId}" has no representative "${caseName}" dialogue entry`);

        const ctx = describeContext({ viewportLabel: viewportName, sceneId, caseName, entry });

        await page.evaluate(showDialogueEntryByIndex, { sceneId, index: entry.index });
        await page.evaluate(() => window.__HB_DEBUG__.finishTyping());
        await page.waitForFunction(isDialogueSettled, caseName === 'choice', { timeout: 8_000 });
        // Let showDialogue()'s post-settle requestAnimationFrame chain
        // (final position/overflow settle pass) finish.
        await page.waitForTimeout(250);
        await page.evaluate(() => document.fonts && document.fonts.ready);

        const validation = await page.evaluate(() => window.__HB_DEBUG__.validateCurrentLayout());
        const failingViolations = (validation.violations || []).filter(v => FAIL_VIOLATION_TYPES.has(v.type));

        const newConsoleErrors = consoleErrors.slice(errorCursor);
        errorCursor = consoleErrors.length;

        const saveWriteCheck = await page.evaluate(() => localStorage.getItem('hardigan_brothers_save'));

        let bubbleTolerance = null;
        if (entry.hasBubbleLayout) {
          bubbleTolerance = await page.evaluate(checkBubbleLayoutTolerance, { sceneId, index: entry.index });
        }

        await saveArtifacts({
          page, viewportName, sceneId, caseName,
          snapshot: {
            entry,
            allViolations: validation.violations,
            failingViolations,
            newConsoleErrors,
            bubbleTolerance,
            saveWriteCheck,
          },
        });

        expect(failingViolations, `${ctx} metric=layoutViolations`).toEqual([]);
        expect(newConsoleErrors, `${ctx} metric=consoleErrors`).toEqual([]);
        expect(saveWriteCheck, `${ctx} metric=noSaveWrites`).toBeNull();

        if (bubbleTolerance && bubbleTolerance.expectedWithinSafe) {
          const withinTolerance =
            bubbleTolerance.deltaLeft <= BUBBLE_TOLERANCE_PX &&
            bubbleTolerance.deltaTop <= BUBBLE_TOLERANCE_PX;
          expect(
            withinTolerance,
            `${ctx} metric=bubbleLayoutTolerance ` +
              `delta=(${bubbleTolerance.deltaLeft.toFixed(1)},${bubbleTolerance.deltaTop.toFixed(1)})px ` +
              `tolerance=${BUBBLE_TOLERANCE_PX}px`
          ).toBe(true);
        }
      });
    }
  });
}
