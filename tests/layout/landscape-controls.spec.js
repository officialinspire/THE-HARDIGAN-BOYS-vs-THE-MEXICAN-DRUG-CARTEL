const {test, expect} = require('@playwright/test');
const URL = '/index.html?debug=true&skipIntro=1&mute=1&noAnimations=1&noSave=1';
test('landscape menu is one stack and status controls stay inside their bar', async ({page}, info) => {
    await page.goto(URL);
    await page.locator('#main-menu-content.menu-ready').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const menu = await page.evaluate(() => {
        const rects = [...document.querySelectorAll('#main-menu-content .menu-btn')].map(el => {
            const r = el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
        });
        const c=document.getElementById('scene-container').getBoundingClientRect();
        const bg=positioningSystem.getBackgroundRect();
        return {rects,titleBottom:c.top+bg.offsetY+bg.renderedH*.36};
    });
    expect(menu.rects).toHaveLength(4);
    for(let i=0;i<menu.rects.length;i++) {
        const r=menu.rects[i];
        expect(r.width).toBeGreaterThan(200);expect(r.height).toBeGreaterThanOrEqual(44);
        expect(Math.abs(r.left-menu.rects[0].left)).toBeLessThan(1);
        expect(Math.abs(r.width-menu.rects[0].width)).toBeLessThan(1);
        if(i) expect(r.top).toBeGreaterThanOrEqual(menu.rects[i-1].bottom+5);
        expect(r.bottom).toBeLessThanOrEqual(info.project.use.viewport.height);
    }
    expect(menu.rects[0].top).toBeGreaterThanOrEqual(menu.titleBottom);
    await page.screenshot({path:info.outputPath('ui-menu-stack.png')});
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(()=>gameState.currentSceneId==='S1_LIVING_ROOM_INTRO'&&!sceneRenderer.isTransitioning);
    const issues = await page.evaluate(() => {
        const hud=document.getElementById('hud'), h=hud.getBoundingClientRect(), css=getComputedStyle(hud,'::before');
        const bar={left:h.left+parseFloat(css.left),top:h.top+parseFloat(css.top),width:parseFloat(css.width),height:parseFloat(css.height)};
        bar.right=bar.left+bar.width;bar.bottom=bar.top+bar.height;
        const failures=[];
        const buttons=[...document.querySelectorAll('#hud-buttons button')];
        for(const b of buttons) {
            const r=b.getBoundingClientRect(), icon=b.querySelector('svg').getBoundingClientRect();
            if(r.width<44||r.height<44||r.left<bar.left+2||r.right>bar.right-2||r.top<bar.top+2||r.bottom>bar.bottom-2) failures.push({id:b.id,kind:'button-outside-bar'});
            if(icon.width<20||icon.height<20||Math.abs((icon.left+icon.width/2)-(r.left+r.width/2))>1||Math.abs((icon.top+icon.height/2)-(r.top+r.height/2))>1) failures.push({id:b.id,kind:'icon-not-centered'});
            if(!b.getAttribute('aria-label')) failures.push({id:b.id,kind:'missing-label'});
        }
        const title=document.getElementById('scene-title'), original=title.textContent;
        const controls=document.getElementById('hud-buttons').getBoundingClientRect();
        for(const scene of Object.values(SCENES)) {
            title.textContent=scene.title||'';const r=title.getBoundingClientRect();
            if(r.right>controls.left-8||r.left<bar.left+2||r.top<bar.top||r.bottom>bar.bottom||title.scrollWidth>title.clientWidth+1||title.scrollHeight>title.clientHeight+1) failures.push({title:scene.title,kind:'title-overlap-or-clipping'});
        }
        title.textContent=original;
        return failures;
    });
    expect(issues).toEqual([]);
    await page.waitForFunction(()=>document.getElementById('scene-title').classList.contains('title-visible'));
    await page.screenshot({path:info.outputPath('ui-status-bar.png')});
    await expect(page.getByRole('button',{name:'Inventory',exact:true})).toBeEnabled();
    await expect(page.getByRole('button',{name:'Notebook',exact:true})).toBeEnabled();
    await page.getByRole('button',{name:'Pause menu',exact:true}).click();
    await expect(page.locator('#pause-menu')).toBeVisible();
});
