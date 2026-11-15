const { test, expect } = require('@playwright/test');
const URL = '/index.html?debug=true&skipIntro=1&mute=1&noAnimations=1';
async function boot(page) {
    await page.goto(URL);
    await page.locator('#main-menu-content.menu-ready').waitFor();
    await page.waitForFunction(() => !sceneRenderer.isTransitioning);
}
async function fits(page, selector, minHeight = 0) {
    const failures = await page.locator(selector).evaluateAll((elements, minHeight) => elements.flatMap(el => {
        const r = el.getBoundingClientRect();
        const bad = r.width < 1 || r.height < minHeight || r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1 || el.scrollWidth > el.clientWidth + 2;
        return bad ? [{id:el.id, rect:{x:r.x,y:r.y,width:r.width,height:r.height},scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}] : [];
    }), minHeight);
    expect(failures).toEqual([]);
}
async function shot(page, info, name) { await page.screenshot({path:info.outputPath(`ui-${name}.png`)}); }

test('startup hierarchy fits without overlapping text or controls', async ({page}, info) => {
    await page.goto(URL.replace('&skipIntro=1',''));
    await page.locator('#touch-start-btn').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await fits(page, '.start-content, .start-content > *');
    const boxes = await page.locator('.start-content > *').evaluateAll(elements => elements.map(el => {
        const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};
    }));
    for(let i=1;i<boxes.length;i++) expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i-1].bottom - 1);
    await fits(page, '#touch-start-btn', 44);
    await shot(page, info, 'startup');
});

test('all menu controls, settings and phone pause controls fit', async ({page}, info) => {
    await boot(page);
    await fits(page, '#main-menu-content .menu-btn', 44);
    expect(await page.locator('#main-menu-content .menu-btn').count()).toBe(4);
    await shot(page, info, 'menu');
    await page.locator('#btn-options').click();
    await page.locator('#settings-overlay').waitFor();
    await fits(page, '#settings-overlay .overlay-content');
    await page.locator('#settings-overlay .overlay-close').evaluate(el => el.scrollIntoView({block:'nearest'}));
    await fits(page, '#settings-overlay .overlay-close', 44);
    await shot(page, info, 'settings');
    await page.locator('#settings-overlay .overlay-close').click();
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(() => gameState.currentSceneId==='S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    await page.locator('#btn-pause').click();
    await page.locator('#pause-menu').waitFor();
    await fits(page, '.phone-ui, .phone-buttons button', 44);
    const inside = await page.locator('.phone-ui').evaluate(el => {
        const r=el.getBoundingClientRect();return [...el.querySelectorAll('button')].every(b=>{
            const q=b.getBoundingClientRect();return q.left>=r.left+r.width*.19 && q.right<=r.left+r.width*.81 && q.top>=r.top+r.height*.14 && q.bottom<=r.top+r.height*.82;
        });
    });
    expect(inside).toBe(true);
    await shot(page, info, 'pause');
    await page.locator('#btn-resume').click();
    await expect(page.locator('#pause-menu')).toBeHidden();
});

test('scene-owned entrances cancel stale sprites and settle cleanly with motion', async ({page}, info) => {
    test.skip(info.project.name !== 'iphone-se-landscape-667x375');
    await page.goto(URL.replace('&noAnimations=1',''));
    await page.locator('#main-menu-content.menu-ready').waitFor();
    await page.evaluate(() => __HB_DEBUG__.jumpToScene('S1_LIVING_ROOM_INTRO'));
    await page.waitForFunction(() => gameState.currentSceneId==='S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    await page.waitForFunction(() => [...document.querySelectorAll('.character-sprite')].every(el=>el.complete&&el.naturalWidth>0&&el.classList.contains('visible')&&getComputedStyle(el).opacity==='1'));
    const settle=await page.locator('.character-sprite').evaluateAll(elements=>elements.map(el=>({id:el.id,x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
    await page.waitForTimeout(600);
    expect(await page.locator('.character-sprite').evaluateAll(elements=>elements.map(el=>({id:el.id,x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})))).toEqual(settle);
    await page.evaluate(() => {
        window.staleCharacter = sceneRenderer.addCharacter({id:'stale-qc',name:'STALE',sprite:'char_hank_thinking-left.png',position:'left'},700);
        sceneRenderer.loadScene('S0_MAIN_MENU');
    });
    await page.locator('#main-menu-content.menu-ready').waitFor();
    await page.evaluate(() => window.staleCharacter);
    await page.waitForTimeout(800);
    expect(await page.locator('.character-sprite').count()).toBe(0);
});
