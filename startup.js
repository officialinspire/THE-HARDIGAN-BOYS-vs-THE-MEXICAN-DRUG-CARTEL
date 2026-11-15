/* Boot owns the intro and black curtain; the game owns all subsequent scenes. */
window.HBStartup = {
    phase: 'waiting',
    get blocksAudio() { return this.phase !== 'ready'; },
    init(assetsReady) {
        const start = document.getElementById('start-screen');
        const button = document.getElementById('touch-start-btn');
        const video = document.getElementById('intro-video');
        const screen = document.getElementById('intro-video-screen');
        const skip = document.getElementById('intro-skip-btn');
        const curtain = document.getElementById('startup-curtain');
        let watchdog, remaining = 20000, activeAt = 0;
        const arm = () => {
            clearTimeout(watchdog);
            activeAt = performance.now();
            watchdog = setTimeout(finish, Math.max(0, remaining));
        };
        const onKey = event => { if (event.code === 'Escape') finish(); };
        const finish = async () => {
            if (this.phase !== 'intro') return;
            this.phase = 'transition';
            clearTimeout(watchdog);
            document.removeEventListener('keydown', onKey);
            video.pause(); // Stop sound immediately, including rapid skip + ended races.
            video.muted = true;
            video.removeAttribute('src');
            video.load();
            screen.classList.add('hidden');
            curtain.classList.add('active');
            audioManager.silence();
            await assetsReady;
            assetLoader.hideLoadingScreen();
            sceneRenderer.loadScene('S0_MAIN_MENU');
            // Wait for the actual scene runner, including its final fade.
            const reveal = () => {
                if (sceneRenderer.isTransitioning || !document.getElementById('btn-new-game')) {
                    requestAnimationFrame(reveal); return;
                }
                this.phase = 'ready';
                curtain.classList.remove('active');
                audioManager.playMusic(SCENES.S0_MAIN_MENU.music);
            };
            requestAnimationFrame(reveal);
        };
        video.addEventListener('ended', finish);
        video.addEventListener('error', finish);
        skip.addEventListener('click', finish);
        button.addEventListener('click', () => {
            if (this.phase !== 'waiting') return;
            this.phase = 'intro';
            start.classList.add('hidden');
            assetLoader.hideLoadingScreen();
            screen.classList.remove('hidden');
            audioManager.silence();
            // Both resume() and play() are invoked directly in the gesture.
            SFXGenerator.audioContext?.resume().catch(() => {});
            audioManager.unlock();
            video.muted = HB_FLAG_MUTE || gameState.settings.musicVolume === 0;
            video.volume = gameState.settings.musicVolume / 100;
            video.play().catch(() => { if (this.phase === 'intro') finish(); });
            document.addEventListener('keydown', onKey);
            arm();
        });
        document.addEventListener('visibilitychange', () => {
            if (this.phase === 'intro') {
                if (document.hidden) {
                    remaining -= performance.now() - activeAt;
                    clearTimeout(watchdog); video.pause();
                } else {
                    arm(); video.play().catch(finish);
                }
            }
        });
        if ('serviceWorker' in navigator && !HB_DEBUG_ENABLED && location.protocol === 'https:') {
            navigator.serviceWorker.register('./asset-cache.js').catch(() => {});
        }
    }
};
// Pause media and cancel fades in the background; resume only the current owner.
document.addEventListener('visibilitychange', () => {
    if (document.hidden) audioManager.silence();
    else if (!window.HBStartup.blocksAudio && audioManager.currentTrack) audioManager.playMusic(audioManager.currentTrack);
});
window.addEventListener('pagehide', () => audioManager.silence());
window.addEventListener('pageshow', () => {
    if (!document.hidden && !window.HBStartup.blocksAudio && audioManager.currentTrack) audioManager.playMusic(audioManager.currentTrack);
});
