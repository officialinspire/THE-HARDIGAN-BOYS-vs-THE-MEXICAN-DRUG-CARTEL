const { test, expect } = require('@playwright/test');
const URL = '/index.html?debug=true&skipIntro=1&mute=1&noAnimations=1';
async function boot(page, url = URL) {
    await page.goto(url);
    await expect(page.locator('#btn-new-game')).toBeVisible({ timeout: 30000 });
    await page.waitForFunction(() => !sceneRenderer.isTransitioning);
}
async function scene(page, id) {
    await page.waitForFunction(() => !sceneRenderer.isTransitioning);
    await page.evaluate(id => window.__HB_DEBUG__.jumpToScene(id), id);
    await page.waitForFunction(id => gameState.currentSceneId === id && !sceneRenderer.isTransitioning, id);
}

test('all authored scenes and required assets validate', async ({ page }, info) => {
    test.skip(info.project.name !== 'iphone-se-landscape-667x375');
    test.setTimeout(120000);
    await boot(page);
    const report = await page.evaluate(() => window.__HB_DEBUG__.validateAllScenes());
    await info.attach('scene-validation', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
    expect(report.totals.error).toBe(0);
});

test('save survives reload and continue restores inventory and route', async ({ page }) => {
    await boot(page);
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    await page.evaluate(() => {
        inventory.add('conspiracy_notebook');
        gameState.flags.HELPED_NEIGHBORS = true;
        saveSystem.save();
    });
    await boot(page);
    await expect(page.locator('#btn-continue-game')).toBeEnabled();
    await page.locator('#btn-continue-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    expect(await page.evaluate(() => ({ items: gameState.inventory, helped: gameState.flags.HELPED_NEIGHBORS })))
        .toEqual({ items: ['conspiracy_notebook'], helped: true });
    // Regression: owning the notebook after resume used to make the room's
    // exploration prerequisite impossible to satisfy.
    await page.evaluate(() => SCENES.S1_LIVING_ROOM_INTRO.hotspots.find(h => h.id === 'notebook').onClick());
    expect(await page.evaluate(() => gameState.objectsClicked.has('notebook'))).toBe(true);
});

test('blocked storage still boots and starts a playable session', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
        get() { throw new DOMException('Storage blocked', 'SecurityError'); }
    }));
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await boot(page);
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    expect(await page.evaluate(() => saveSystem.hasSave())).toBe(true);
    expect(errors).toEqual([]);
});

for (const badSave of ['{broken', '{"currentSceneId":"missing","inventory":[],"notebook":[],"flags":{}}', '{"currentSceneId":"S1_LIVING_ROOM_INTRO","inventory":"bad","notebook":[],"flags":{}}']) {
    test(`corrupt save is safely rejected: ${badSave.slice(0, 35)}`, async ({ page }) => {
        await page.addInitScript(value => localStorage.setItem('hardigan_brothers_save', value), badSave);
        await boot(page);
        await expect(page.locator('#btn-continue-game')).toBeDisabled();
        await page.locator('#btn-new-game').click();
        await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    });
}

test('route-specific dialogue resets when replaying scenes', async ({ page }) => {
    await boot(page);
    const original = await page.evaluate(() => authoredSceneDialogue.get('S9_FINAL_WAREHOUSE_SHOWDOWN')[1].text);
    await scene(page, 'S9_FINAL_WAREHOUSE_SHOWDOWN');
    expect(await page.evaluate(() => SCENES.S9_FINAL_WAREHOUSE_SHOWDOWN.dialogue[1].text)).not.toBe(original);
    await page.evaluate(() => { gameState.inventory = ['neighbors_usb']; });
    await scene(page, 'S9_FINAL_WAREHOUSE_SHOWDOWN');
    expect(await page.evaluate(() => SCENES.S9_FINAL_WAREHOUSE_SHOWDOWN.dialogue[1].text)).toBe(original);
});

test('portrait rotation returns to a usable landscape menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await expect(page.locator('#orientation-overlay')).toBeVisible();
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('#orientation-overlay')).toBeHidden();
    await expect(page.locator('#btn-new-game')).toBeVisible();
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
});

test('stalled preloads and intro recover without an endless loading screen', async ({ page }, info) => {
    test.skip(info.project.name !== 'iphone-se-landscape-667x375');
    test.setTimeout(45000);
    await page.addInitScript(() => {
        HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
        // Critical preloads never receive onload/onerror.
        window.Image = class { set src(_) {} };
    });
    await boot(page, URL.replace('&skipIntro=1', ''));
    await expect(page.locator('#loading-screen')).toBeHidden();
    await expect(page.locator('#intro-video-screen')).toBeHidden();
});

for (const [label, ending, helped] of [
    ['Destroy the USB publicly', 'E_HAPPY', true],
    ['Destroy the USB publicly', 'E_SAD', false],
    ['Upload everything to the internet', 'E_IRONIC_MEDIA', true],
    ['Fake-destroy it but keep a copy', 'E_CHAOTIC', true],
]) {
    test(`final choice reaches ${ending}`, async ({ page }, info) => {
        test.skip(!['iphone-se-landscape-667x375', 'desktop-1920x1080'].includes(info.project.name));
        await boot(page);
        // Explicit final-scene fixture; exercises the real item/choice handlers,
        // not a claim to cover every full story route.
        await page.evaluate(helped => {
            gameState.inventory = ['neighbors_usb'];
            gameState.flags.HELPED_NEIGHBORS = helped;
        }, helped);
        await scene(page, 'S9_FINAL_WAREHOUSE_SHOWDOWN');
        await page.waitForTimeout(700);
        await page.evaluate(() => {
            // Final-choice fixture replaces the scene's opening dialogue.
            gameState.dialogueLock = false;
            handleItemUse('neighbors_usb');
        });
        for (let step = 0; step < 15; step++) {
            if (await page.getByRole('button', { name: label, exact: true }).isVisible()) break;
            await page.evaluate(() => window.__HB_DEBUG__.finishTyping());
            const next = page.locator('#dialogue-continue');
            if (await next.isVisible()) await next.click();
            await page.waitForTimeout(350);
        }
        await page.getByRole('button', { name: label, exact: true }).click();
        await page.waitForFunction(id => gameState.currentSceneId === id && !sceneRenderer.isTransitioning, ending);
    });
}

test('analytics queues attributed starts once, and SDK failure never blocks play', async ({ page }) => {
    await page.addInitScript(() => { window.recorded = []; });
    await page.route('**/vendor/posthog.js*', async route => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await route.fulfill({ contentType: 'application/javascript', body: `window.posthog = {
            init(token, config) { window.sdkConfig = config; config.loaded(this); },
            register() {}, capture(event, properties) { window.recorded.push({event, properties}); }
        };` });
    });
    await boot(page, URL + '&analytics_test=1&utm_source=shopify&utm_campaign=hardigan_release&placement=hero');
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => window.recorded.some(e => e.event === 'game_started'));
    const events = await page.evaluate(() => window.recorded);
    expect(events.filter(e => e.event === 'game_opened')).toHaveLength(1);
    expect(events.filter(e => e.event === 'game_started')).toHaveLength(1);
    expect(events.find(e => e.event === 'game_started').properties).toMatchObject({
        game: 'hardigan_boys', utm_source: 'shopify', utm_campaign: 'hardigan_release', placement: 'hero', is_test: true
    });
    expect(await page.evaluate(() => window.sdkConfig.disable_session_recording)).toBe(true);
    await page.unroute('**/vendor/posthog.js*');
    await page.route('**/vendor/posthog.js*', route => route.abort());
    await boot(page, URL + '&analytics_test=1');
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
});

test('debug/test sessions do not send analytics by default', async ({ page }) => {
    let requests = 0;
    page.on('request', r => { if (/posthog|analytics-config/.test(r.url())) requests++; });
    await boot(page);
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    expect(requests).toBe(0);
});

test('touch controls complete the opening room and a story branch on a phone', async ({ browser }, info) => {
    test.skip(info.project.name !== 'iphone-se-landscape-667x375');
    test.setTimeout(120000);
    const context = await browser.newContext({
        viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('hardigan_brothers_tutorial_seen', 'true'));
    try {
        await boot(page);
        await page.locator('#btn-new-game').tap();
        await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
        await page.waitForTimeout(700);
        async function readDialogueUntilIdle(sceneId) {
            for (let step = 0; step < 50; step++) {
                const state = await page.evaluate(() => ({
                    scene: gameState.currentSceneId, busy: sceneRenderer.isTransitioning,
                    hidden: document.getElementById('dialogue-box').classList.contains('hidden'),
                    typing: sceneRenderer.isTyping,
                    choices: document.querySelectorAll('#dialogue-choices .dialogue-choice').length
                }));
                if (state.scene !== sceneId || (!state.busy && state.hidden) || state.choices) return;
                if (!state.busy) {
                    if (state.typing) await page.locator('#dialogue-box').tap();
                    else if (await page.locator('#dialogue-continue').isVisible()) await page.locator('#dialogue-continue').tap();
                }
                await page.waitForTimeout(350);
            }
            throw new Error(`Dialogue did not settle in ${sceneId}`);
        }
        await readDialogueUntilIdle('S1_LIVING_ROOM_INTRO');
        for (const id of ['tv_remote', 'television', 'lamp', 'notebook', 'window']) {
            await page.locator(`[data-hotspot-id="${id}"]`).tap();
            await page.waitForTimeout(350);
            await readDialogueUntilIdle('S1_LIVING_ROOM_INTRO');
        }
        await page.waitForFunction(() => gameState.currentSceneId === 'S2_ICE_RAID_WINDOW' && !sceneRenderer.isTransitioning);
        await page.waitForTimeout(700);
        await readDialogueUntilIdle('S2_ICE_RAID_WINDOW');
        await page.getByRole('button', { name: /sneak/i }).tap();
        await page.waitForFunction(() => gameState.currentSceneId === 'S3B_RIVERA_BACKYARD' && !sceneRenderer.isTransitioning);
        await page.locator('#btn-pause').tap();
        await expect(page.locator('#pause-menu')).toBeVisible();
        await page.locator('#btn-resume').tap();
        await expect(page.locator('#pause-menu')).toBeHidden();
        expect(errors).toEqual([]);
        await page.screenshot({ path: info.outputPath('phone-touch-story.png') });
    } finally { await context.close(); }
});

test('a rejected dialogue request cannot erase the active Continue action', async ({ page }) => {
    await boot(page);
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId === 'S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    await page.waitForFunction(() => gameState.dialogueLock && dialoguePager.state !== null);
    const result = await page.evaluate(async () => {
        const entry = gameState.currentDialogueEntry;
        const pager = dialoguePager.state;
        await sceneRenderer.showDialogue({ speaker: 'NARRATION', text: 'Must not replace the active line.' });
        return { sameEntry: gameState.currentDialogueEntry === entry, samePager: dialoguePager.state === pager };
    });
    expect(result).toEqual({ sameEntry: true, samePager: true });
    await page.evaluate(() => window.__HB_DEBUG__.finishTyping());
    await expect(page.locator('#dialogue-continue')).toBeVisible();
    await page.locator('#dialogue-continue').click();
    await page.waitForFunction(() => dialoguePager.state !== null);
});

test('scene requests made during a fade drain to the latest scene', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => {
        sceneRenderer.loadScene('S1_LIVING_ROOM_INTRO');
        sceneRenderer.loadScene('S2_ICE_RAID_WINDOW');
    });
    await page.waitForFunction(() => gameState.currentSceneId === 'S2_ICE_RAID_WINDOW' && !sceneRenderer.isTransitioning);
    expect(await page.evaluate(() => sceneRenderer.transitionQueue)).toEqual([]);
    await page.waitForFunction(() => dialoguePager.state !== null && !sceneRenderer.isTransitioning);
    expect(await page.evaluate(() => sceneRenderer.currentScene.id)).toBe('S2_ICE_RAID_WINDOW');
});
