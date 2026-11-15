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
    const settings=await page.evaluate(()=>({...gameState.settings}));
    await page.locator('#btn-options').click();
    await page.locator('#settings-overlay').waitFor();
    await expect(page.locator('#music-volume')).toHaveValue(String(settings.musicVolume));
    await expect(page.locator('#sfx-volume')).toHaveValue(String(settings.sfxVolume));
    expect(await page.locator('#show-hotspots').isChecked()).toBe(settings.showHotspots);
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

    await page.evaluate(() => {
        inventory.add('conspiracy_notebook');
        inventory.add('tv_remote');
        notebook.add('CLUE — Opening room', 'The notebook keeps collected clues available while exploring. Review this entry and turn the page to inspect more clues.');
    });
    await page.locator('#btn-inventory').click();
    await page.locator('#inventory-overlay').waitFor();
    await fits(page, '#inventory-overlay .overlay-content');
    await shot(page, info, 'inventory');
    await page.locator('#inventory-overlay .overlay-close').click();
    await page.locator('#btn-notebook').click();
    await page.locator('#notebook-overlay').waitFor();
    await fits(page, '.notebook-ui, #notebook-text-overlay, #notebook-close');
    expect(await page.locator('#notebook-text-overlay').evaluate(el => el.scrollWidth <= el.clientWidth+1)).toBe(true);
    await shot(page, info, 'notebook');
    await page.locator('#notebook-close').click();
    await page.evaluate(() => showItemInfo('tv_remote'));
    await page.locator('#modal-overlay').waitFor();
    await fits(page, '#modal-overlay .modal-content, #modal-close, #modal-title, #modal-body, #modal-ok, #modal-use-btn');
    await shot(page, info, 'item');
    await page.locator('#modal-close').click();
    await expect(page.locator('#modal-overlay')).toBeHidden();
});

test('scene-owned entrances cancel stale sprites and settle cleanly with motion', async ({page}, info) => {
    test.skip(info.project.name !== 'iphone-se-landscape-667x375');
    await page.goto(URL.replace('&noAnimations=1',''));
    await page.locator('#main-menu-content.menu-ready').waitFor();
    await page.evaluate(() => __HB_DEBUG__.jumpToScene('S1_LIVING_ROOM_INTRO'));
    await page.waitForFunction(() => gameState.currentSceneId==='S1_LIVING_ROOM_INTRO' && !sceneRenderer.isTransitioning);
    await page.waitForFunction(() => [...document.querySelectorAll('.character-sprite')].every(el=>el.complete&&el.naturalWidth>0&&el.classList.contains('visible')&&getComputedStyle(el).opacity==='1'));
    const settle=await page.locator('.character-sprite').evaluateAll(elements=>elements.map(el=>({id:el.id,x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
    await shot(page, info, 'characters');
    await page.evaluate(async () => {
        await sceneRenderer.showDialogue({speaker:'HANK',text:'A clean speech panel keeps its name, caption, and controls inside the visible border.',position:'left',next:'NEXT_DIALOGUE'});
        __HB_DEBUG__.finishTyping();
    });
    await page.waitForFunction(() => !document.getElementById('dialogue-continue').classList.contains('hidden'));
    const panel=await page.locator('#dialogue-container').evaluate(el=>{
        const box=el.getBoundingClientRect();
        return {background:getComputedStyle(el).backgroundColor, inside:['dialogue-speaker','dialogue-text','dialogue-continue'].every(id=>{
            const r=document.getElementById(id).getBoundingClientRect();return r.left>=box.left+4&&r.right<=box.right-4&&r.top>=box.top+4&&r.bottom<=box.bottom-4;
        })};
    });
    expect(panel).toEqual({background:'rgb(244, 239, 217)',inside:true});
    await shot(page, info, 'speech');

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

// Alpha-bearing art used to bypass cleanup and keep its white sticker fringe.
test('matte cleanup removes an outside fringe and preserves enclosed whites', async ({page}, info) => {
    test.skip(info.project.name !== 'iphone-se-landscape-667x375');
    await boot(page);
    const result = await page.evaluate(async () => {
        const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
        const ctx=canvas.getContext('2d');
        ctx.fillStyle='#fff8e8';ctx.fillRect(8,8,48,48);
        ctx.fillStyle='#151515';ctx.fillRect(12,12,40,40);
        ctx.fillStyle='#ffffff';ctx.fillRect(18,18,28,28);
        const img=new Image();img.src=canvas.toDataURL();await img.decode();
        spriteTransparencyProcessor.makeWhitePixelsTransparent(img);await img.decode();
        ctx.clearRect(0,0,64,64);ctx.drawImage(img,0,0);
        const alpha=(x,y)=>ctx.getImageData(x,y,1,1).data[3];
        return {outside:alpha(1,1),fringe:alpha(9,9),outline:alpha(13,13),inside:alpha(30,30)};
    });
    expect(result).toEqual({outside:0,fringe:0,outline:255,inside:255});
});
