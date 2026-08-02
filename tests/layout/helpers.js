// Shared helpers for the layout smoke suite.
//
// Two kinds of function live here:
//   - "Browser-side" functions (documented as such below) are passed
//     directly to page.evaluate()/page.waitForFunction() by Playwright,
//     which serializes the function SOURCE and runs it inside the page.
//     They must not close over anything from this Node module — all
//     inputs come through the args parameter, and they may only reference
//     globals that exist on the page (SCENES, sceneRenderer,
//     positioningSystem, gameState, window.__HB_DEBUG__, document, ...).
//   - "Node-side" functions do normal Node things (fs, path) and are only
//     ever called from layout.spec.js itself, never passed to evaluate().

const fs = require('fs');
const path = require('path');

// ===== Node-side =====

const ARTIFACT_ROOT = path.join(__dirname, '..', '..', 'test-results', 'layout');
const BASELINE_ROOT = path.join(__dirname, 'baseline');
const UPDATE_BASELINE = process.env.HB_UPDATE_BASELINE === '1';

function slug(...parts) {
  return parts
    .map(p => String(p).trim().replace(/[^a-zA-Z0-9._-]+/g, '-'))
    .join('__');
}

/**
 * Screenshot + JSON layout-snapshot artifact pair for one (viewport, scene,
 * case) combination. Always written under test-results/ (gitignored,
 * regenerated every run). Also mirrored into tests/layout/baseline/ (the
 * one tracked, "approved" set) when running under `npm run
 * test:layout:update` (HB_UPDATE_BASELINE=1) — see baseline/README.md.
 */
async function saveArtifacts({ page, viewportName, sceneId, caseName, snapshot }) {
  const baseName = slug(viewportName, sceneId, caseName);
  const dirs = [ARTIFACT_ROOT];
  if (UPDATE_BASELINE) dirs.push(BASELINE_ROOT);

  const written = [];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
    const pngPath = path.join(dir, `${baseName}.png`);
    await page.screenshot({ path: pngPath });
    written.push(pngPath);

    if (snapshot !== undefined) {
      const jsonPath = path.join(dir, `${baseName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2));
      written.push(jsonPath);
    }
  }
  return written;
}

/** Builds the "scene=... dialogue=... viewport=... metric=..." prefix every
 * assertion message in the suite uses, so a failure is self-identifying
 * even when read outside the Playwright reporter (e.g. a CI log grep). */
function describeContext({ viewportLabel, sceneId, caseName, entry }) {
  const parts = [
    `viewport="${viewportLabel}"`,
    `scene="${sceneId}"`,
    `case="${caseName}"`,
  ];
  if (entry) {
    parts.push(`dialogueIndex=${entry.index}`, `speaker="${entry.speaker}"`);
  }
  return parts.join(' ');
}

// ===== Browser-side (passed to page.evaluate) =====

/**
 * Reads SCENES[sceneId].dialogue (browser global, never crosses the
 * Node/browser boundary as an object — only this JSON-safe summary does)
 * and picks the first entry matching each representative category. A scene
 * need not have all four; the caller skips categories that come back null.
 */
function pickRepresentativeDialogueEntries(sceneId) {
  const SYSTEM_SPEAKERS = new Set(['NARRATION', 'SYSTEM']);
  const CHOICE_SPEAKERS = new Set(['CHOICE', 'FINAL CHOICE']);
  const scene = typeof SCENES !== 'undefined' ? SCENES[sceneId] : null;
  const dialogue = scene && Array.isArray(scene.dialogue) ? scene.dialogue : [];
  const picks = {};

  dialogue.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const speaker = entry.speaker;
    const text = entry.text || '';

    if (!picks.choice && CHOICE_SPEAKERS.has(speaker) && Array.isArray(entry.choices) && entry.choices.length > 0) {
      picks.choice = { index, speaker, textLength: text.length, choiceCount: entry.choices.length };
      return;
    }
    if (!picks.narration && (!speaker || SYSTEM_SPEAKERS.has(speaker)) && text) {
      picks.narration = { index, speaker: speaker || 'NARRATION', textLength: text.length };
      return;
    }
    if (speaker && !SYSTEM_SPEAKERS.has(speaker) && !CHOICE_SPEAKERS.has(speaker) && text) {
      if (!picks.shortSpeech && text.length > 0 && text.length <= 70) {
        picks.shortSpeech = { index, speaker, textLength: text.length, hasBubbleLayout: !!entry.bubbleLayout };
      }
      if (!picks.longSpeech && text.length >= 150) {
        picks.longSpeech = { index, speaker, textLength: text.length, hasBubbleLayout: !!entry.bubbleLayout };
      }
    }
  });

  return picks;
}

/** Re-reads the entry by index (never passes it across the evaluate
 * boundary — dialogue entries carry functions, which aren't cloneable) and
 * shows it via the same debug entry point DEVELOPMENT.md documents. */
async function showDialogueEntryByIndex({ sceneId, index }) {
  const entry = SCENES[sceneId].dialogue[index];
  gameState.dialogueLock = false;
  await window.__HB_DEBUG__.showDialogue(entry);
  return { ok: true };
}

/** Predicate for page.waitForFunction: true once typing has finished and
 * (for choice entries) the real choice buttons have rendered. */
function isDialogueSettled(expectChoices) {
  if (typeof sceneRenderer === 'undefined') return false;
  if (sceneRenderer.isTyping) return false;
  if (expectChoices) {
    return document.querySelectorAll('#dialogue-choices .dialogue-choice').length > 0;
  }
  return true;
}

/**
 * For an entry authored with `bubbleLayout` (native 1920x1080-space rect):
 * compares the box's actual left/top against the same scaled-rect
 * computation the engine itself uses (positioningSystem.calculateHotspotPosition),
 * i.e. what layoutDialogue()'s 'authored' mode is supposed to produce.
 * `expectedWithinSafe` tells the caller whether the unclamped authored
 * position should have fit the safe area on this viewport — if it
 * shouldn't have (small/compact viewports legitimately clamp), the caller
 * treats a tolerance miss as expected clamping, not a regression.
 */
function checkBubbleLayoutTolerance({ sceneId, index }) {
  const entry = SCENES[sceneId] && SCENES[sceneId].dialogue[index];
  const bl = entry && entry.bubbleLayout;
  if (!bl) return null;

  const expected = positioningSystem.calculateHotspotPosition(bl.left, bl.top, bl.width, bl.height);
  const expectedLeft = parseFloat(expected.left);
  const expectedTop = parseFloat(expected.top);
  const expectedWidth = parseFloat(expected.width);
  const expectedHeight = parseFloat(expected.height);

  const box = document.getElementById('dialogue-box');
  const actualLeft = parseFloat(box.style.left);
  const actualTop = parseFloat(box.style.top);

  const safe = positioningSystem.getDialogueSafeRect();
  const expectedWithinSafe = !!safe &&
    expectedLeft >= safe.left - 0.5 &&
    expectedTop >= safe.top - 0.5 &&
    (expectedLeft + expectedWidth) <= safe.right + 0.5 &&
    (expectedTop + expectedHeight) <= safe.bottom + 0.5;

  return {
    expectedLeft, expectedTop, actualLeft, actualTop,
    deltaLeft: Math.abs(actualLeft - expectedLeft),
    deltaTop: Math.abs(actualTop - expectedTop),
    expectedWithinSafe,
  };
}

module.exports = {
  ARTIFACT_ROOT,
  BASELINE_ROOT,
  UPDATE_BASELINE,
  slug,
  saveArtifacts,
  describeContext,
  pickRepresentativeDialogueEntries,
  showDialogueEntryByIndex,
  isDialogueSettled,
  checkBubbleLayoutTolerance,
};
