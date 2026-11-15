const {test, expect} = require('@playwright/test');
const URL='/index.html?debug=true&mute=1&noAnimations=1';
test.beforeEach(async ({}, info) => test.skip(info.project.name !== 'iphone-se-landscape-667x375'));
async function menu(page) {
    await expect(page.locator('#btn-new-game')).toBeVisible({timeout:20000});
    await page.waitForFunction(()=>HBStartup.phase==='ready' && !sceneRenderer.isTransitioning);
}
test('gesture gates video, rapid skip ends once, then menu and first scene work',async({page})=>{
    await page.addInitScript(()=>{
        window.videoPlays=0;
        const play=HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play=function(){
            if(this.id==='intro-video'){window.videoPlays++;return Promise.resolve();}
            return play.call(this);
        };
    });
    await page.goto(URL);
    await expect(page.locator('#touch-start-btn')).toBeVisible();
    expect(await page.evaluate(()=>window.videoPlays)).toBe(0);
    await page.locator('#touch-start-btn').click();
    await expect(page.locator('#intro-video-screen')).toBeVisible();
    expect(await page.evaluate(()=>HBStartup.blocksAudio)).toBe(true);
    await page.evaluate(()=>{
        document.getElementById('intro-skip-btn').click();
        document.getElementById('intro-video').dispatchEvent(new Event('ended'));
        document.getElementById('intro-skip-btn').click();
    });
    await menu(page);
    expect(await page.evaluate(()=>window.videoPlays)).toBe(1);
    expect(await page.locator('#intro-video').getAttribute('src')).toBeNull();
    await page.locator('#btn-new-game').click();
    await page.waitForFunction(()=>gameState.currentSceneId==='S1_LIVING_ROOM_INTRO'&&!sceneRenderer.isTransitioning);
    expect(await page.locator('.hotspot-debug-label').count()).toBe(0);
});
test('natural credit end and rejected playback both reach the menu',async({page})=>{
    await page.addInitScript(()=>{
        HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
    });
    await page.goto(URL);
    await page.locator('#touch-start-btn').click();
    await page.evaluate(()=>document.getElementById('intro-video').dispatchEvent(new Event('ended')));
    await menu(page);
    await page.addInitScript(()=>{
        HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};
    });
    await page.goto(URL);
    await page.locator('#touch-start-btn').click();
    await menu(page);
});
test('newest music request owns the player and muting cancels all fades',async({page})=>{
    await page.addInitScript(()=>{
        HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
    });
    await page.goto('/index.html?debug=true&skipIntro=1&noAnimations=1');
    await menu(page);
    const state=await page.evaluate(async()=>{
        audioManager.playMusic('main-menu-theme.mp3');
        audioManager.playMusic('game-menu-theme.mp3');
        audioManager.playMusic('Hardigan Noir Tension.mp3');
        audioManager.setMuted(true);
        await new Promise(r=>setTimeout(r,850));
        return {track:audioManager.currentTrack, volume:audioManager.musicPlayer.volume,timer:audioManager.fadeTimer};
    });
    expect(state).toEqual({track:'Hardigan Noir Tension.mp3',volume:0,timer:null});
});
