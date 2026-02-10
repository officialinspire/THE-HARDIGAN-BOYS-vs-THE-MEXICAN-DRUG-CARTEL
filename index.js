// ============================================
// THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL
// COMPLETE GAME ENGINE WITH ALL FIXES
// ============================================

// ===== GAMEBOY-STYLE SFX GENERATOR =====
const SFXGenerator = {
    audioContext: null,
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.warn('Web Audio API not supported');
        }
    },
    
    playButtonClick() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3 * (gameState.settings.sfxVolume / 100), this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    },
    
    playDialogueAdvance() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.2 * (gameState.settings.sfxVolume / 100), this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    },

    playContinueButton() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25 * (gameState.settings.sfxVolume / 100), this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.08);
    },
    
    playMenuOpen() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25 * (gameState.settings.sfxVolume / 100), this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    },

    playLampClick() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15 * (gameState.settings.sfxVolume / 100), this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.08);
    },

    playTVClick() {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2 * (gameState.settings.sfxVolume / 100), this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.12);
    }
};

// ===== GLOBAL GAME STATE =====
const gameState = {
    currentSceneId: 'S0_MAIN_MENU',
    inventory: [],
    notebook: [],
    flags: {
        HELPED_ICE: false,
        HELPED_NEIGHBORS: false,
        TOOK_CARTEL_DEAL: false,
        WORKING_WITH_CIA: false,
        INDEPENDENT_OPERATORS: false,
        CARTEL_TARGET: false,
        SECRETLY_AGAINST_CARTEL: false,
        ALLIED_WITH_ORTEGA: false,
        ALLIED_WITH_LUPITA: false,
        DOUBLE_CROSSED_SOMEONE: false,
        SAVED_NEIGHBORS: false,
        CARTEL_DEFEATED: false,
        DISILLUSIONED: false,
        LOYAL_TO_RIVERAS: false,
        OPPORTUNIST: false,
        SUSPICIOUS_TO_FEDS: false
    },
    settings: {
        musicVolume: 70,
        sfxVolume: 80,
        showHotspots: true
    },
    currentDialogueIndex: 0,
    objectsClicked: new Set(),
    dialogueLock: false,
    actionLock: false,
    sceneTransitioning: false,
    lighting: {
        lampOn: false,
        tvOn: false
    }
};



const errorLogger = {
    log(context, error, meta = {}) {
        console.error(`[${context}]`, error, meta);
    }
};

const spriteTransparencyProcessor = {
    whiteThreshold: 238,
    edgeColorTolerance: 40,
    edgeBrightnessFloor: 110,

    _getDominantEdgeColor(pixels, width, height) {
        const bins = new Map();
        const pushPixel = (x, y) => {
            const i = (y * width + x) * 4;
            const a = pixels[i + 3];
            if (a < 8) return;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const key = `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`;
            const bucket = bins.get(key) || { count: 0, r: 0, g: 0, b: 0 };
            bucket.count += 1;
            bucket.r += r;
            bucket.g += g;
            bucket.b += b;
            bins.set(key, bucket);
        };

        for (let x = 0; x < width; x++) {
            pushPixel(x, 0);
            pushPixel(x, height - 1);
        }
        for (let y = 1; y < height - 1; y++) {
            pushPixel(0, y);
            pushPixel(width - 1, y);
        }

        let winner = null;
        bins.forEach(bucket => {
            if (!winner || bucket.count > winner.count) {
                winner = bucket;
            }
        });

        if (!winner || winner.count === 0) return null;

        return {
            r: winner.r / winner.count,
            g: winner.g / winner.count,
            b: winner.b / winner.count,
        };
    },

    _isNearColor(r, g, b, target) {
        if (!target) return false;
        const dr = r - target.r;
        const dg = g - target.g;
        const db = b - target.b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        const brightness = (r + g + b) / 3;
        return distance <= this.edgeColorTolerance && brightness >= this.edgeBrightnessFloor;
    },

    _removeConnectedEdgeBackground(pixels, width, height, targetColor) {
        if (!targetColor) return 0;

        const visited = new Uint8Array(width * height);
        const queue = [];
        const push = (x, y) => {
            if (x < 0 || y < 0 || x >= width || y >= height) return;
            const idx = y * width + x;
            if (visited[idx]) return;
            visited[idx] = 1;
            queue.push(idx);
        };

        for (let x = 0; x < width; x++) {
            push(x, 0);
            push(x, height - 1);
        }
        for (let y = 1; y < height - 1; y++) {
            push(0, y);
            push(width - 1, y);
        }

        let removed = 0;
        while (queue.length > 0) {
            const idx = queue.pop();
            const x = idx % width;
            const y = Math.floor(idx / width);
            const i = idx * 4;

            if (pixels[i + 3] === 0) continue;

            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const nearWhite = r >= this.whiteThreshold && g >= this.whiteThreshold && b >= this.whiteThreshold;

            if (nearWhite || this._isNearColor(r, g, b, targetColor)) {
                pixels[i + 3] = 0;
                removed += 1;
                push(x + 1, y);
                push(x - 1, y);
                push(x, y + 1);
                push(x, y - 1);
            }
        }

        return removed;
    },

    makeWhitePixelsTransparent(imageEl) {
        if (!imageEl || imageEl.dataset.whiteRemoved === 'true') return;

        const process = () => {
            try {
                const canvas = document.createElement('canvas');
                const width = imageEl.naturalWidth || imageEl.width;
                const height = imageEl.naturalHeight || imageEl.height;
                if (!width || !height) return;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return;

                ctx.drawImage(imageEl, 0, 0, width, height);
                const imageData = ctx.getImageData(0, 0, width, height);
                const pixels = imageData.data;
                const threshold = this.whiteThreshold;
                const edgeColor = this._getDominantEdgeColor(pixels, width, height);

                this._removeConnectedEdgeBackground(pixels, width, height, edgeColor);

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    if (r >= threshold && g >= threshold && b >= threshold) {
                        pixels[i + 3] = 0;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                imageEl.dataset.whiteRemoved = 'true';
                imageEl.src = canvas.toDataURL('image/png');
            } catch (error) {
                errorLogger.log('sprite-transparency', error, { src: imageEl.src });
            }
        };

        if (imageEl.complete && imageEl.naturalWidth > 0) {
            process();
        } else {
            imageEl.addEventListener('load', process, { once: true });
        }
    }
};

function getMissingAssetPlaceholder(src, width = 200, height = 120) {
    const filename = (src || 'missing-asset').split('/').pop();
    const label = encodeURIComponent(filename);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23151515' stroke='%23ffd700' stroke-width='2'/%3E%3Ctext x='50%25' y='50%25' fill='%23ffd700' font-size='12' text-anchor='middle' dominant-baseline='middle'%3E${label}%3C/text%3E%3C/svg%3E`;
}

function safeAsync(handler, context) {
    return async (...args) => {
        try {
            return await handler(...args);
        } catch (error) {
            errorLogger.log(context, error, { args });
            return null;
        }
    };
}

const mobileOptimizer = {
    resizeDebounceMs: 300,
    init() {
        this.setupTouchGuards();
        this.setupIOSBouncePrevention();
        this.setupOrientationLock();
    },

    isMobile() {
        return window.matchMedia('(max-width: 1024px)').matches || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    },

    setupTouchGuards() {
        let lastTouch = 0;
        document.addEventListener('touchend', (event) => {
            const target = event.target.closest('button, .dialogue-choice, .hud-btn, .menu-btn, .overlay-close, .hotspot, .scene-item');
            if (!target) return;

            const now = Date.now();
            if (now - lastTouch < 350) {
                event.preventDefault();
            }
            lastTouch = now;
        }, { passive: false });
    },

    setupIOSBouncePrevention() {
        document.body.addEventListener('touchmove', (event) => {
            const scrollContainer = event.target.closest('#dialogue-text, #inventory-grid, #notebook-text-overlay, .overlay-content');
            if (!scrollContainer) {
                event.preventDefault();
            }
        }, { passive: false });
    },

    async setupOrientationLock() {
        if (!this.isMobile()) return;
        if (screen.orientation && screen.orientation.lock) {
            try {
                await screen.orientation.lock('landscape');
            } catch (error) {
                errorLogger.log('orientation-lock', error);
            }
        }

        const applyOrientationState = () => {
            const isPortrait = window.matchMedia('(orientation: portrait)').matches;
            const overlay = document.getElementById('orientation-overlay');
            if (!overlay) return;
            overlay.classList.toggle('hidden', !isPortrait || !this.isMobile());
            overlay.setAttribute('aria-hidden', (!isPortrait || !this.isMobile()).toString());
        };

        window.addEventListener('orientationchange', applyOrientationState);
        window.addEventListener('resize', applyOrientationState);
        applyOrientationState();
    }
};

const assetLoader = {
    errors: [],
    loadedAssets: new Set(),
    maxConcurrentLoads: 6,

    updateProgress(progress, statusText) {
        const progressBar = document.getElementById('loading-progress-bar');
        const progressText = document.getElementById('loading-progress-text');
        const status = document.getElementById('loading-status');
        const progressTrack = document.getElementById('loading-progress-track');

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        if (status && statusText) status.textContent = statusText;
        if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(Math.round(progress)));
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    },

    registerImageFallback(img, src) {
        img.addEventListener('error', () => {
            const filename = src.split('/').pop();
            errorLogger.log('asset-fallback', new Error(`Missing asset: ${src}`), { filename });
            img.alt = `Missing asset: ${filename}`;
            img.src = getMissingAssetPlaceholder(src, img.width || 240, img.height || 140);
        }, { once: true });
    },

    getCriticalAssets() {
        const sceneAssets = [
            SCENES.S0_MAIN_MENU?.background,
            SCENES.S1_LIVING_ROOM_INTRO?.background,
            SCENES.S2_ICE_RAID_WINDOW?.background
        ].filter(Boolean);

        return [
            ...new Set([
                ...sceneAssets,
                './assets/menu_dialogue/dialogue-bubble-large-left.png',
                './assets/menu_dialogue/dialogue-bubble-large-right.png',
                './assets/ui/ui_main_menu_bg.png'
            ])
        ];
    },

    async preloadSingleAsset(src) {
        if (!src || this.loadedAssets.has(src)) return;

        await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssets.add(src);
                resolve();
            };
            img.onerror = () => {
                this.errors.push(src);
                errorLogger.log('preload-assets', new Error(`Failed to preload image`), { src });
                resolve();
            };
            img.src = src;
        });
    },

    async preloadAssets(assetList) {
        const assets = assetList || this.getCriticalAssets();
        const total = assets.length || 1;
        let completed = 0;

        this.updateProgress(0, 'Loading critical assets...');

        for (let i = 0; i < assets.length; i += this.maxConcurrentLoads) {
            const chunk = assets.slice(i, i + this.maxConcurrentLoads);
            await Promise.all(chunk.map(async (src) => {
                await this.preloadSingleAsset(src);
                completed += 1;
                this.updateProgress((completed / total) * 100, `Loaded ${completed}/${total}`);
            }));
        }

        this.updateProgress(100, this.errors.length ? `Loaded with ${this.errors.length} warning(s)` : 'Assets loaded');
    },

    lazyLoadSceneAssets(scene) {
        if (!scene) return;
        const lazyAssets = [];
        (scene.characters || []).forEach(char => {
            if (char?.sprite) {
                lazyAssets.push(`./assets/characters/${char.sprite}`);
            }
        });
        (scene.items || []).forEach(item => {
            if (item?.id) lazyAssets.push(`./assets/items/item_${item.id}.png`);
        });
        safeAsync(() => Promise.all(lazyAssets.map(src => this.preloadSingleAsset(src))), 'lazy-load-scene-assets')();
    }
};

// ===== AUDIO MANAGEMENT =====
const audioManager = {
    musicPlayer: null,
    sfxPlayer: null,
    currentTrack: null,
    maxConcurrentSfx: 2,
    activeSfx: 0,
    
    init() {
        this.musicPlayer = document.getElementById('music-player');
        this.sfxPlayer = document.getElementById('sfx-player');
        this.updateVolumes();
        SFXGenerator.init();
    },
    
    playMusic(filename, fadeIn = true) {
        try {
            if (!filename || this.currentTrack === filename) return;

            const fadeOut = () => {
                return new Promise(resolve => {
                    if (!this.musicPlayer.paused) {
                        let vol = this.musicPlayer.volume;
                        const fadeInterval = setInterval(() => {
                            vol -= 0.05;
                            if (vol <= 0) {
                                clearInterval(fadeInterval);
                                this.musicPlayer.pause();
                                this.musicPlayer.volume = 0;
                                resolve();
                            } else {
                                this.musicPlayer.volume = vol;
                            }
                        }, 50);
                    } else {
                        resolve();
                    }
                });
            };

            fadeOut().then(() => {
                this.musicPlayer.src = `./audio/${filename}`;
                const targetVol = gameState.settings.musicVolume / 100;

                // Always fade in music for smooth transitions
                this.musicPlayer.volume = 0;
                this.musicPlayer.play().catch(err => errorLogger.log('audio-play-music', err, { filename }));

                if (fadeIn) {
                    let vol = 0;
                    const fadeInInterval = setInterval(() => {
                        vol += 0.03;
                        if (vol >= targetVol) {
                            clearInterval(fadeInInterval);
                            this.musicPlayer.volume = targetVol;
                        } else {
                            this.musicPlayer.volume = vol;
                        }
                    }, 50);
                } else {
                    // Even if fadeIn is false, do a quick fade for smoothness
                    setTimeout(() => {
                        this.musicPlayer.volume = targetVol;
                    }, 100);
                }

                this.currentTrack = filename;
            });
        } catch (error) {
            errorLogger.log('audio-playMusic', error, { filename });
        }
    },
    
    playSFX(filename) {
        try {
            if (!filename) return;
            if (this.activeSfx >= this.maxConcurrentSfx) {
                return;
            }

            this.activeSfx += 1;
            this.sfxPlayer.src = `./audio/${filename}`;
            this.sfxPlayer.volume = gameState.settings.sfxVolume / 100;
            this.sfxPlayer.play()
                .catch(err => errorLogger.log('audio-playSFX', err, { filename }))
                .finally(() => {
                    setTimeout(() => {
                        this.activeSfx = Math.max(0, this.activeSfx - 1);
                    }, 120);
                });
        } catch (error) {
            errorLogger.log('audio-playSFX', error, { filename });
        }
    },
    
    updateVolumes() {
        if (this.musicPlayer) {
            this.musicPlayer.volume = gameState.settings.musicVolume / 100;
        }
        if (this.sfxPlayer) {
            this.sfxPlayer.volume = gameState.settings.sfxVolume / 100;
        }
    }
};

// ===== SAVE/LOAD SYSTEM =====
const saveSystem = {
    SAVE_KEY: 'hardigan_brothers_save',
    
    save() {
        const saveData = {
            currentSceneId: gameState.currentSceneId,
            inventory: gameState.inventory,
            notebook: gameState.notebook,
            flags: gameState.flags,
            timestamp: Date.now()
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        console.log('Game saved successfully');
        return true;
    },
    
    load() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                gameState.currentSceneId = data.currentSceneId;
                gameState.inventory = data.inventory || [];
                gameState.notebook = data.notebook || [];
                gameState.flags = { ...gameState.flags, ...data.flags };
                console.log('Game loaded successfully');
                return true;
            } catch (err) {
                console.error('Failed to load save:', err);
                return false;
            }
        }
        return false;
    },
    
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },
    
    deleteSave() {
        localStorage.removeItem(this.SAVE_KEY);
    }
};

// ===== LIGHTING EFFECTS SYSTEM =====
const lightingEffects = {
    updateLighting() {
        const sceneContainer = document.getElementById('scene-container');

        // Remove existing lighting overlays
        const existingOverlay = document.getElementById('lighting-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create new overlay based on current state
        if (gameState.lighting.lampOn || gameState.lighting.tvOn) {
            const overlay = document.createElement('div');
            overlay.id = 'lighting-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                transition: opacity 0.5s ease;
            `;

            if (gameState.lighting.lampOn && !gameState.lighting.tvOn) {
                // Warm incandescent lamp glow
                overlay.style.background = `
                    radial-gradient(ellipse 40% 50% at 85% 30%,
                        rgba(255, 220, 150, 0.4) 0%,
                        rgba(255, 200, 100, 0.2) 30%,
                        transparent 70%)
                `;
            } else if (gameState.lighting.tvOn && !gameState.lighting.lampOn) {
                // Cool blue TV glow
                overlay.style.background = `
                    radial-gradient(ellipse 35% 40% at 18% 50%,
                        rgba(120, 180, 255, 0.3) 0%,
                        rgba(100, 150, 220, 0.15) 40%,
                        transparent 70%)
                `;
            } else if (gameState.lighting.lampOn && gameState.lighting.tvOn) {
                // Both lights on - combined glow
                overlay.style.background = `
                    radial-gradient(ellipse 40% 50% at 85% 30%,
                        rgba(255, 220, 150, 0.35) 0%,
                        rgba(255, 200, 100, 0.15) 30%,
                        transparent 60%),
                    radial-gradient(ellipse 35% 40% at 18% 50%,
                        rgba(120, 180, 255, 0.25) 0%,
                        rgba(100, 150, 220, 0.12) 40%,
                        transparent 60%)
                `;
            }

            sceneContainer.appendChild(overlay);
        } else {
            // Both lights off - darken the room
            const overlay = document.createElement('div');
            overlay.id = 'lighting-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                background: rgba(0, 0, 0, 0.5);
                transition: opacity 0.5s ease;
            `;
            sceneContainer.appendChild(overlay);
        }
    },

    toggleLamp() {
        gameState.lighting.lampOn = !gameState.lighting.lampOn;
        SFXGenerator.playLampClick();
        this.updateLighting();
    },

    toggleTV() {
        gameState.lighting.tvOn = !gameState.lighting.tvOn;
        SFXGenerator.playTVClick();
        this.updateLighting();
    }
};

// ===== INVENTORY SYSTEM =====
const inventory = {
    add(itemId) {
        if (!gameState.inventory.includes(itemId)) {
            gameState.inventory.push(itemId);
            console.log(`Added to inventory: ${itemId}`);
            SFXGenerator.playMenuOpen();
            saveSystem.save();
        }
    },
    
    remove(itemId) {
        const index = gameState.inventory.indexOf(itemId);
        if (index > -1) {
            gameState.inventory.splice(index, 1);
            saveSystem.save();
        }
    },
    
    has(itemId) {
        return gameState.inventory.includes(itemId);
    },
    
    show() {
        SFXGenerator.playMenuOpen();
        const overlay = document.getElementById('inventory-overlay');
        const grid = document.getElementById('inventory-grid');
        
        grid.innerHTML = '';
        
        if (gameState.inventory.length === 0) {
            grid.innerHTML = '<div class="inventory-empty">No items yet</div>';
        } else {
            gameState.inventory.forEach(itemId => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.innerHTML = `
                    <img src="./assets/items/item_${itemId}.png" alt="${itemId}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'80\\' height=\\'80\\'%3E%3Crect fill=\\'none\\' width=\\'80\\' height=\\'80\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23666\\' font-size=\\'12\\'%3EITEM%3C/text%3E%3C/svg%3E'">
                    <div class="inventory-item-name">${itemId.replace(/_/g, ' ')}</div>
                `;
                grid.appendChild(itemDiv);
            });
        }
        
        overlay.classList.remove('hidden');
    }
};

// ===== NOTEBOOK SYSTEM =====
const notebook = {
    add(title, content) {
        gameState.notebook.push({ title, content, timestamp: Date.now() });
        saveSystem.save();
    },
    
    show() {
        SFXGenerator.playMenuOpen();
        const overlay = document.getElementById('notebook-overlay');
        const entriesDiv = document.getElementById('notebook-entries');
        
        entriesDiv.innerHTML = '';
        
        if (gameState.notebook.length === 0) {
            entriesDiv.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; margin-top: 20px;">No entries yet...</p>';
        } else {
            gameState.notebook.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'notebook-entry';
                entryDiv.innerHTML = `
                    <div class="notebook-entry-title">${entry.title}</div>
                    <div>${entry.content}</div>
                `;
                entriesDiv.appendChild(entryDiv);
            });
        }
        
        overlay.classList.remove('hidden');
    }
};


// ===== RESPONSIVE POSITIONING SYSTEM =====
const positioningSystem = {
    // Reference dimensions for the background art (designed at 16:9)
    REF_WIDTH: 1920,
    REF_HEIGHT: 1080,

    // Safe zones for UI elements
    HUD_TOP: 80,       // top 80px reserved for HUD
    DIALOGUE_BOTTOM: 200, // bottom 200px reserved for dialogue

    // Named character zones: defines horizontal positioning as fraction of usable width
    // Each zone has a left-anchor fraction and whether it uses left or right CSS property
    zones: {
        'left':    { anchor: 0.05, side: 'left' },
        'left-2':  { anchor: 0.22, side: 'left' },
        'center':  { anchor: 0.50, side: 'left', centered: true },
        'right':   { anchor: 0.05, side: 'right' },
        'right-2': { anchor: 0.22, side: 'right' },
    },

    /**
     * Get the actual rendered area of the background image within the container.
     * Accounts for object-fit: contain vs cover and different screen sizes.
     */
    getBackgroundRect() {
        const container = document.getElementById('scene-container');
        const bg = document.getElementById('scene-background');
        if (!container || !bg) return null;

        const containerW = container.clientWidth;
        const containerH = container.clientHeight;

        // Natural dimensions of loaded background, fallback to reference
        const natW = bg.naturalWidth || this.REF_WIDTH;
        const natH = bg.naturalHeight || this.REF_HEIGHT;

        const containerRatio = containerW / containerH;
        const imageRatio = natW / natH;

        let renderedW, renderedH, offsetX, offsetY;

        // Detect if we are in portrait mobile mode (cover) or normal (contain)
        const isCover = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;

        if (isCover) {
            // object-fit: cover — image fills container, may be cropped
            if (containerRatio > imageRatio) {
                renderedW = containerW;
                renderedH = containerW / imageRatio;
            } else {
                renderedH = containerH;
                renderedW = containerH * imageRatio;
            }
            offsetX = (containerW - renderedW) / 2;
            offsetY = (containerH - renderedH) / 2;
        } else {
            // object-fit: contain — image fits inside container with letterboxing
            if (containerRatio > imageRatio) {
                renderedH = containerH;
                renderedW = containerH * imageRatio;
            } else {
                renderedW = containerW;
                renderedH = containerW / imageRatio;
            }
            offsetX = (containerW - renderedW) / 2;
            offsetY = (containerH - renderedH) / 2;
        }

        return {
            containerW,
            containerH,
            renderedW,
            renderedH,
            offsetX,
            offsetY,
            scaleX: renderedW / natW,
            scaleY: renderedH / natH,
        };
    },

    /**
     * Calculate pixel position for a character in a named zone.
     * Returns an object with CSS properties to apply via style.
     */
    calculateCharacterPosition(zoneName) {
        const zone = this.zones[zoneName] || this.zones['center'];
        const rect = this.getBackgroundRect();

        if (!rect) {
            // Fallback: return percentage-based positioning
            return this._fallbackCharacterPosition(zoneName);
        }

        const { containerW, containerH, renderedW, renderedH, offsetX, offsetY } = rect;

        // Usable vertical area: from HUD safe zone to dialogue safe zone
        const hudPx = this.HUD_TOP * (renderedH / this.REF_HEIGHT);
        const dialoguePx = this.DIALOGUE_BOTTOM * (renderedH / this.REF_HEIGHT);

        // Bottom of character: above dialogue zone, anchored to bottom of rendered bg
        const bottomFromContainer = Math.max(0, containerH - (offsetY + renderedH));

        const result = {
            bottom: bottomFromContainer + 'px',
        };

        if (zone.centered) {
            // Center zone: position at 50% of container, translate to center
            result.left = (offsetX + renderedW * zone.anchor) + 'px';
            result.transform = 'translateX(-50%)';
            result.right = 'auto';
        } else if (zone.side === 'right') {
            // Right-side zones: position from right edge of rendered area
            const rightFromContainer = containerW - (offsetX + renderedW) + (renderedW * zone.anchor);
            result.right = rightFromContainer + 'px';
            result.left = 'auto';
        } else {
            // Left-side zones: position from left edge of rendered area
            result.left = (offsetX + renderedW * zone.anchor) + 'px';
            result.right = 'auto';
        }

        // Dynamic max dimensions based on rendered background size
        result.maxWidth = (renderedW * 0.35) + 'px';
        result.maxHeight = (renderedH * 0.55) + 'px';

        return result;
    },

    /**
     * Fallback percentage-based positioning (used when rect calculation fails).
     */
    _fallbackCharacterPosition(zoneName) {
        const fallbacks = {
            'left':    { left: '5%', right: 'auto', bottom: '0' },
            'left-2':  { left: '22%', right: 'auto', bottom: '0' },
            'center':  { left: '50%', right: 'auto', bottom: '0', transform: 'translateX(-50%)' },
            'right':   { right: '5%', left: 'auto', bottom: '0' },
            'right-2': { right: '22%', left: 'auto', bottom: '0' },
        };
        return fallbacks[zoneName] || fallbacks['center'];
    },

    /**
     * Calculate pixel position for an item/hotspot given percentage coordinates.
     * Converts percentage x/y/width/height relative to the background image
     * into absolute pixel positions within the container.
     */
    calculateItemPosition(x, y, width, height) {
        const rect = this.getBackgroundRect();

        if (!rect) {
            // Fallback: return original percentages
            return {
                left: x + '%',
                top: y + '%',
                width: width + '%',
                height: height + '%',
            };
        }

        const { renderedW, renderedH, offsetX, offsetY } = rect;

        return {
            left: (offsetX + (x / 100) * renderedW) + 'px',
            top: (offsetY + (y / 100) * renderedH) + 'px',
            width: ((width / 100) * renderedW) + 'px',
            height: ((height / 100) * renderedH) + 'px',
        };
    },

    /**
     * Calculate pixel position for a hotspot given native image coordinates.
     * Converts pixel x/y/width/height in 1920×1080 image space into
     * absolute pixel positions within the container, accounting for
     * object-fit scaling and letterboxing/pillarboxing offsets.
     *
     * @param {number} imgX - X position in native image pixels (0-1920)
     * @param {number} imgY - Y position in native image pixels (0-1080)
     * @param {number} imgW - Width in native image pixels
     * @param {number} imgH - Height in native image pixels
     * @returns {object} CSS position properties {left, top, width, height} in px
     */
    calculateHotspotPosition(imgX, imgY, imgW, imgH) {
        const rect = this.getBackgroundRect();

        if (!rect) {
            // Fallback: convert native coords to percentages
            return {
                left: (imgX / this.REF_WIDTH * 100) + '%',
                top: (imgY / this.REF_HEIGHT * 100) + '%',
                width: (imgW / this.REF_WIDTH * 100) + '%',
                height: (imgH / this.REF_HEIGHT * 100) + '%',
            };
        }

        const { renderedW, renderedH, offsetX, offsetY, scaleX, scaleY } = rect;

        return {
            left: (offsetX + imgX * scaleX) + 'px',
            top: (offsetY + imgY * scaleY) + 'px',
            width: (imgW * scaleX) + 'px',
            height: (imgH * scaleY) + 'px',
        };
    },

    /**
     * Apply calculated position styles to an element.
     */
    applyPosition(element, posStyles) {
        Object.keys(posStyles).forEach(prop => {
            element.style[prop] = posStyles[prop];
        });
    },

    /**
     * Recalculate and reapply positions for all characters, items, and hotspots
     * currently in the scene. Called on window resize.
     */
    recalculateAll() {
        // Recalculate character positions
        const characters = document.querySelectorAll('.character-sprite');
        characters.forEach(charEl => {
            const zoneName = charEl.dataset.zone;
            if (zoneName) {
                const pos = this.calculateCharacterPosition(zoneName);
                // Preserve existing transforms for animations
                const isVisible = charEl.classList.contains('visible');
                const isSlideLeft = charEl.classList.contains('slide-in-left');
                const isSlideRight = charEl.classList.contains('slide-in-right');

                this.applyPosition(charEl, pos);

                // Re-apply animation transforms if needed (CSS classes handle this,
                // but we need to clear inline transform conflicts for non-centered zones)
                if (pos.transform && zoneName !== 'center') {
                    // Non-center zones don't need transform
                } else if (zoneName === 'center' && isVisible) {
                    charEl.style.transform = 'translateX(-50%)';
                }
            }
        });

        // Recalculate item positions
        const items = document.querySelectorAll('.scene-item');
        items.forEach(itemEl => {
            const x = parseFloat(itemEl.dataset.origX);
            const y = parseFloat(itemEl.dataset.origY);
            const w = parseFloat(itemEl.dataset.origW);
            const h = parseFloat(itemEl.dataset.origH);
            if (!isNaN(x) && !isNaN(y)) {
                const pos = this.calculateItemPosition(x, y, w, h);
                this.applyPosition(itemEl, pos);
            }
        });

        // Recalculate hotspot positions
        const hotspots = document.querySelectorAll('.hotspot');
        hotspots.forEach(hotspotEl => {
            const x = parseFloat(hotspotEl.dataset.origX);
            const y = parseFloat(hotspotEl.dataset.origY);
            const w = parseFloat(hotspotEl.dataset.origW);
            const h = parseFloat(hotspotEl.dataset.origH);
            if (!isNaN(x) && !isNaN(y)) {
                let pos;
                if (hotspotEl.dataset.coordSystem === 'native') {
                    pos = this.calculateHotspotPosition(x, y, w, h);
                } else {
                    pos = this.calculateItemPosition(x, y, w, h);
                }
                this.applyPosition(hotspotEl, pos);

                // Update debug label if present
                const label = hotspotEl.querySelector('.hotspot-debug-label');
                if (label) {
                    label.textContent = `${hotspotEl.dataset.hotspotId || ''} [${Math.round(parseFloat(pos.left))}，${Math.round(parseFloat(pos.top))} ${Math.round(parseFloat(pos.width))}×${Math.round(parseFloat(pos.height))}]`;
                }
            }
        });
    },
};


// ===== SCENE RENDERING =====
const sceneRenderer = {
    currentScene: null,

    // Transition queue system
    transitionQueue: [],
    isTransitioning: false,

    // Transition state callbacks
    onTransitionStart: null,
    onTransitionComplete: null,
    validZones: new Set(['left', 'left-2', 'center', 'right-2', 'right']),

    normalizeZoneName(zoneName) {
        return this.validZones.has(zoneName) ? zoneName : 'center';
    },

    normalizeCharacterZones(characters) {
        const sideCounts = { left: 0, right: 0 };

        return (characters || []).map(char => {
            const normalized = { ...char };

            normalized.position = this.normalizeZoneName(normalized.position || 'center');

            if (normalized.position === 'left') {
                sideCounts.left += 1;
                if (sideCounts.left > 1) normalized.position = 'left-2';
            } else if (normalized.position === 'right') {
                sideCounts.right += 1;
                if (sideCounts.right > 1) normalized.position = 'right-2';
            }

            return normalized;
        });
    },

    addCharacter(char, slideDelay = 100) {
        const charLayer = document.getElementById('character-layer');
        const existingZones = new Set(Array.from(charLayer.querySelectorAll('.character-sprite')).map(el => el.dataset.zone));
        let resolvedZone = char.position || 'center';
        if (resolvedZone === 'left' && existingZones.has('left')) resolvedZone = 'left-2';
        if (resolvedZone === 'right' && existingZones.has('right')) resolvedZone = 'right-2';

        const img = document.createElement('img');
        const zoneName = this.normalizeZoneName(resolvedZone);
        img.className = `character-sprite char-${zoneName}`;
        img.dataset.zone = zoneName;
        img.dataset.characterId = char.id || '';
        img.dataset.characterName = (char.name || '').toUpperCase();
        img.id = char.id ? `char-${char.id}` : undefined;

        let spriteName = char.sprite;
        if (char.position === 'left' && !spriteName.includes('-left') && !spriteName.includes('-right')) {
            spriteName = spriteName.replace('.png', '-left.png');
        } else if (char.position === 'right' && !spriteName.includes('-left') && !spriteName.includes('-right')) {
            spriteName = spriteName.replace('.png', '-right.png');
        }

        const spriteSrc = `./assets/characters/${spriteName}`;
        img.src = spriteSrc;
        img.alt = char.name;
        assetLoader.registerImageFallback(img, spriteSrc);
        spriteTransparencyProcessor.makeWhitePixelsTransparent(img);

        // Apply calculated pixel position
        const pos = positioningSystem.calculateCharacterPosition(zoneName);
        positioningSystem.applyPosition(img, pos);

        img.onerror = () => {
            if (spriteName !== char.sprite) {
                console.warn(`Directional sprite ${spriteName} not found, using ${char.sprite}`);
                img.src = `./assets/characters/${char.sprite}`;
            }
        };

        if (char.position === 'left') {
            img.classList.add('slide-in-left');
        } else if (char.position === 'right') {
            img.classList.add('slide-in-right');
        }

        charLayer.appendChild(img);

        setTimeout(() => {
            img.classList.add('visible');
        }, slideDelay);
    },

    removeCharacter(charId, slideOut = true) {
        const char = document.getElementById(`char-${charId}`);
        if (char) {
            if (slideOut) {
                char.classList.remove('visible');
                setTimeout(() => {
                    char.remove();
                }, 600);
            } else {
                char.remove();
            }
        }
    },

    // Public API: queues scene transitions to prevent race conditions
    loadScene(sceneId) {
        this.queueSceneTransition(sceneId);
    },

    queueSceneTransition(sceneId) {
        this.transitionQueue.push(sceneId);

        if (!this.isTransitioning) {
            this._processQueue();
        }
    },

    async _processQueue() {
        if (this.transitionQueue.length === 0) {
            return;
        }

        // Skip to the latest queued scene (intermediate requests are stale)
        const sceneId = this.transitionQueue[this.transitionQueue.length - 1];
        this.transitionQueue = [];

        await this._executeSceneLoad(sceneId);

        // Process any scenes queued during this transition
        if (this.transitionQueue.length > 0) {
            this._processQueue();
        }
    },

    async _executeSceneLoad(sceneId) {
        const scene = SCENES[sceneId];
        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }

        try {
            // Set transitioning state
            this.isTransitioning = true;
            gameState.sceneTransitioning = true;
            gameState.dialogueLock = false;
            gameState.actionLock = false;

            // Block all interactions during transition
            this._setInteractionBlocking(true);

            // Fire transition start callback
            if (this.onTransitionStart) {
                try { this.onTransitionStart(sceneId); } catch (e) { errorLogger.log('onTransitionStart', e, { sceneId }); }
            }

            this.currentScene = scene;
            gameState.currentSceneId = sceneId;
            gameState.currentDialogueIndex = 0;
            gameState.objectsClicked.clear();

            // Fade to black (fade in overlay)
            await this.fadeTransition(true);

            // Clear scene and wait for all character removal animations to complete
            await this.clearScene();

            const bg = document.getElementById('scene-background');
            assetLoader.registerImageFallback(bg, scene.background);
            bg.src = scene.background;

            // Ensure background loads before fading in
            await new Promise(resolve => {
                if (bg.complete) {
                    resolve();
                } else {
                    bg.onload = () => resolve();
                    bg.onerror = () => resolve(); // Continue even if image fails
                }
            });

            document.getElementById('scene-title').textContent = scene.title || '';

            if (scene.characters) {
                this.loadCharacters(scene.characters);
            }

            if (scene.items) {
                this.loadItems(scene.items);
            }

            if (scene.hotspots) {
                this.loadHotspots(scene.hotspots);
            }

            // Lazy-load non-critical assets for future interactions
            assetLoader.lazyLoadSceneAssets(scene);

            // Always play music with fade in for smooth transitions
            if (scene.music) {
                audioManager.playMusic(scene.music, true);
            }

            // Fade from black (fade out overlay)
            await this.fadeTransition(false);

            if (scene.dialogue && scene.dialogue.length > 0) {
                setTimeout(() => {
                    // Guard: don't show dialogue if another transition started
                    if (!this.isTransitioning) {
                        this.showDialogue(scene.dialogue[0]);
                    }
                }, 500);
            }

            if (scene.onEnter) {
                try {
                    scene.onEnter();
                } catch (error) {
                    errorLogger.log('scene-onEnter', error, { sceneId });
                }
            }

            // Fire transition complete callback
            if (this.onTransitionComplete) {
                try { this.onTransitionComplete(sceneId); } catch (e) { errorLogger.log('onTransitionComplete', e, { sceneId }); }
            }

            saveSystem.save();
        } catch (error) {
            errorLogger.log('scene-transition', error, { sceneId });
            document.getElementById('dialogue-box').classList.add('hidden');
        } finally {
            // Clear transitioning state
            this.isTransitioning = false;
            gameState.sceneTransitioning = false;

            // Unblock interactions
            this._setInteractionBlocking(false);
        }
    },

    _setInteractionBlocking(block) {
        const container = document.getElementById('scene-container');
        if (block) {
            container.classList.add('scene-transitioning');
        } else {
            container.classList.remove('scene-transitioning');
        }
    },
    
    clearScene() {
        return new Promise(resolve => {
            const characters = document.querySelectorAll('.character-sprite');
            const charCount = characters.length;

            // Stagger character slide-out animations
            characters.forEach((char, index) => {
                setTimeout(() => {
                    char.classList.remove('visible');
                }, index * 100);
            });

            // Calculate actual animation completion time
            const animationTime = charCount > 0 ? (charCount * 100 + 600) : 0;

            // Wait for all slide-out animations, then clear DOM
            setTimeout(() => {
                document.getElementById('character-layer').replaceChildren();
                document.getElementById('item-layer').replaceChildren();
                document.getElementById('hotspot-layer').replaceChildren();
                document.getElementById('dialogue-box').classList.add('hidden');

                // Remove police light effect if present
                const policeLight = document.getElementById('police-light-effect');
                if (policeLight) {
                    policeLight.remove();
                }

                // Remove any stale detached character nodes to keep memory usage stable
                document.querySelectorAll('.character-sprite:not(#character-layer .character-sprite)').forEach(node => node.remove());

                resolve();
            }, animationTime);
        });
    },
    
    loadCharacters(characters) {
        const charLayer = document.getElementById('character-layer');
        const normalizedCharacters = this.normalizeCharacterZones(characters);

        normalizedCharacters.forEach((char, index) => {
            const img = document.createElement('img');
            const zoneName = this.normalizeZoneName(char.position || 'center');
            img.className = `character-sprite char-${zoneName}`;
            img.dataset.zone = zoneName;
            img.dataset.characterId = char.id || '';
            img.dataset.characterName = (char.name || '').toUpperCase();

            let spriteName = char.sprite;
            if (char.position === 'left' && !spriteName.includes('-left') && !spriteName.includes('-right')) {
                spriteName = spriteName.replace('.png', '-left.png');
            } else if (char.position === 'right' && !spriteName.includes('-left') && !spriteName.includes('-right')) {
                spriteName = spriteName.replace('.png', '-right.png');
            }

            const spriteSrc = `./assets/characters/${spriteName}`;
            img.src = spriteSrc;
            img.alt = char.name;
            assetLoader.registerImageFallback(img, spriteSrc);
            spriteTransparencyProcessor.makeWhitePixelsTransparent(img);
            img.style.zIndex = index + 1;

            // Apply calculated pixel position
            const pos = positioningSystem.calculateCharacterPosition(zoneName);
            positioningSystem.applyPosition(img, pos);

            img.onerror = () => {
                if (spriteName !== char.sprite) {
                    console.warn(`Directional sprite ${spriteName} not found, using ${char.sprite}`);
                    img.src = `./assets/characters/${char.sprite}`;
                }
            };

            if (char.position === 'left') {
                img.classList.add('slide-in-left');
            } else if (char.position === 'right') {
                img.classList.add('slide-in-right');
            }

            charLayer.appendChild(img);

            setTimeout(() => {
                img.classList.add('visible');
            }, 100 + (index * 200));
        });
    },
    
    loadItems(items) {
        const itemLayer = document.getElementById('item-layer');

        items.forEach(item => {
            // Skip if item already collected
            if (inventory.has(item.id)) {
                return;
            }

            const div = document.createElement('div');
            div.className = 'scene-item';
            div.id = `scene-item-${item.id}`;

            // Store original percentage coords for resize recalculation
            div.dataset.origX = item.x;
            div.dataset.origY = item.y;
            div.dataset.origW = item.width;
            div.dataset.origH = item.height;

            // Apply calculated pixel position
            const pos = positioningSystem.calculateItemPosition(item.x, item.y, item.width, item.height);
            positioningSystem.applyPosition(div, pos);

            div.title = item.label || '';

            const img = document.createElement('img');
            const itemSrc = `./assets/items/item_${item.id}.png`;
            img.src = itemSrc;
            img.alt = item.label || item.id;
            assetLoader.registerImageFallback(img, itemSrc);
            div.appendChild(img);

            div.addEventListener('click', () => {
                if (gameState.actionLock || gameState.sceneTransitioning) return;
                gameState.actionLock = true;
                SFXGenerator.playButtonClick();
                if (item.onClick) {
                    item.onClick();
                    // Mark as collected visually
                    div.classList.add('collected');
                }
                setTimeout(() => {
                    gameState.actionLock = false;
                }, 300);
            });

            itemLayer.appendChild(div);
        });
    },

    loadHotspots(hotspots) {
        const hotspotLayer = document.getElementById('hotspot-layer');

        hotspots.forEach(hotspot => {
            const div = document.createElement('div');
            div.className = 'hotspot';

            // Determine coordinate system: native (1920×1080 pixels) or percentage
            const isNative = hotspot.coordSystem === 'native';

            // Store original coords and coordinate system for resize recalculation
            div.dataset.origX = hotspot.x;
            div.dataset.origY = hotspot.y;
            div.dataset.origW = hotspot.width;
            div.dataset.origH = hotspot.height;
            div.dataset.coordSystem = isNative ? 'native' : 'percentage';
            div.dataset.hotspotId = hotspot.id || '';

            // Apply calculated pixel position using the appropriate conversion
            let pos;
            if (isNative) {
                pos = positioningSystem.calculateHotspotPosition(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
            } else {
                pos = positioningSystem.calculateItemPosition(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
            }
            positioningSystem.applyPosition(div, pos);

            div.title = hotspot.label || '';

            // Debug label: shows hotspot id and computed screen coordinates
            const debugLabel = document.createElement('span');
            debugLabel.className = 'hotspot-debug-label';
            debugLabel.textContent = `${hotspot.id || ''} [${Math.round(parseFloat(pos.left))}，${Math.round(parseFloat(pos.top))} ${Math.round(parseFloat(pos.width))}×${Math.round(parseFloat(pos.height))}]`;
            div.appendChild(debugLabel);

            div.addEventListener('click', (e) => {
                // Debug: log click position in native image coordinates
                if (gameState.settings.showHotspots) {
                    const rect = positioningSystem.getBackgroundRect();
                    if (rect) {
                        const containerRect = document.getElementById('scene-container').getBoundingClientRect();
                        const clickX = e.clientX - containerRect.left;
                        const clickY = e.clientY - containerRect.top;
                        const imgX = Math.round((clickX - rect.offsetX) / rect.scaleX);
                        const imgY = Math.round((clickY - rect.offsetY) / rect.scaleY);
                        console.log(`[Hotspot Debug] Click on "${hotspot.id || hotspot.label}" → native image coords: (${imgX}, ${imgY}) | screen: (${Math.round(clickX)}, ${Math.round(clickY)})`);
                    }
                }

                if (gameState.actionLock || gameState.sceneTransitioning) return;
                gameState.actionLock = true;
                SFXGenerator.playButtonClick();
                if (hotspot.onClick) {
                    hotspot.onClick();
                }
                setTimeout(() => {
                    gameState.actionLock = false;
                }, 300);
            });

            hotspotLayer.appendChild(div);
        });
    },
    
    showDialogue(dialogueEntry) {
        try {
            // Block dialogue during scene transitions
            if (this.isTransitioning) {
                console.log('Scene transition in progress, blocking dialogue');
                return;
            }

            // Prevent multiple dialogues from showing simultaneously
            if (gameState.dialogueLock) {
                console.log('Dialogue already showing, ignoring request');
                return;
            }

            gameState.dialogueLock = true;

            // Call onShow callback if it exists (for character slide-ins, etc.)
            if (dialogueEntry.onShow) {
                dialogueEntry.onShow();
            }

            const dialogueBox = document.getElementById('dialogue-box');
            const dialogueContainer = document.getElementById('dialogue-container');
            const dialogueBubble = document.getElementById('dialogue-bubble');
            const speaker = document.getElementById('dialogue-speaker');
            const text = document.getElementById('dialogue-text');
            const choicesDiv = document.getElementById('dialogue-choices');
            const continueBtn = document.getElementById('dialogue-continue');

            choicesDiv.innerHTML = '';
            continueBtn.classList.add('hidden');

            // Clear previous position classes and inline overrides from bounds clamping
            dialogueBox.classList.remove('dialogue-left', 'dialogue-right', 'dialogue-center');
            dialogueBox.style.left = '';
            dialogueBox.style.right = '';
            dialogueBox.style.top = '';
            dialogueBox.style.bottom = '';

            const isNarration = !dialogueEntry.speaker || dialogueEntry.speaker === 'NARRATION' || dialogueEntry.speaker === 'SYSTEM';
            const isChoice = dialogueEntry.speaker === 'CHOICE' || dialogueEntry.speaker === 'FINAL CHOICE';

            if (isNarration) {
                dialogueContainer.classList.add('narrative-mode');
                dialogueBox.classList.add('dialogue-center');
                speaker.className = 'narration';
                text.className = 'narration';
                speaker.textContent = '';
            } else if (isChoice) {
                dialogueContainer.classList.add('narrative-mode');
                dialogueBox.classList.add('dialogue-center');
                speaker.className = 'choice-speaker';
                text.className = 'choice-text';
                speaker.textContent = dialogueEntry.speaker;
            } else {
                dialogueContainer.classList.remove('narrative-mode');

                const pos = this.normalizeZoneName(dialogueEntry.position || 'left');
                const isLeft = pos === 'left' || pos === 'left-2';
                const isRight = pos === 'right' || pos === 'right-2';

                if (isLeft) {
                    dialogueBox.classList.add('dialogue-left');
                } else if (isRight) {
                    dialogueBox.classList.add('dialogue-right');
                } else {
                    dialogueBox.classList.add('dialogue-center');
                }

                dialogueBubble.src = isLeft ?
                    './assets/menu_dialogue/dialogue-bubble-large-left.png' :
                    './assets/menu_dialogue/dialogue-bubble-large-right.png';
                speaker.className = '';
                text.className = '';
                speaker.textContent = dialogueEntry.speaker;

                this._positionDialogueNearCharacter(dialogueBox, pos, dialogueEntry);
            }

            dialogueBox.classList.remove('hidden');
            this._clampDialogueToViewport(dialogueBox);
            text.textContent = dialogueEntry.text || '';

            SFXGenerator.playDialogueAdvance();

            if (dialogueEntry.choices && dialogueEntry.choices.length > 0) {
                dialogueEntry.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'dialogue-choice';
                    btn.textContent = choice.text;
                    btn.addEventListener('click', () => {
                        if (gameState.actionLock || this.isTransitioning) return;
                        gameState.actionLock = true;
                        gameState.dialogueLock = false;
                        SFXGenerator.playButtonClick();
                        if (choice.action) {
                            choice.action();
                        }
                        gameState.actionLock = false;
                    });
                    choicesDiv.appendChild(btn);
                });
            } else if (dialogueEntry.next) {
                continueBtn.classList.remove('hidden');
                continueBtn.onclick = () => {
                    if (gameState.actionLock || this.isTransitioning) return;
                    gameState.actionLock = true;
                    gameState.dialogueLock = false;
                    SFXGenerator.playContinueButton();
                    if (dialogueEntry.next === 'NEXT_DIALOGUE') {
                        this.nextDialogue();
                    } else if (typeof dialogueEntry.next === 'function') {
                        dialogueEntry.next();
                    } else {
                        this.loadScene(dialogueEntry.next);
                    }
                    gameState.actionLock = false;
                };
            } else {
                setTimeout(() => {
                    gameState.dialogueLock = false;
                    this.nextDialogue();
                }, 3000);
            }
        } catch (error) {
            errorLogger.log('dialogue-render', error, { sceneId: gameState.currentSceneId, dialogueEntry });
            const dialogueBox = document.getElementById('dialogue-box');
            if (dialogueBox) {
                dialogueBox.classList.add('hidden');
            }
            gameState.dialogueLock = false;
            setTimeout(() => this.nextDialogue(), 500);
        }
    },

    _clampDialogueToViewport(dialogueBox) {
        // After render, ensure the dialogue box stays within the scene container
        requestAnimationFrame(() => {
            const container = document.getElementById('scene-container');
            if (!container) return;
            const containerRect = container.getBoundingClientRect();
            const boxRect = dialogueBox.getBoundingClientRect();

            // Clamp left edge: don't go past container left
            if (boxRect.left < containerRect.left) {
                dialogueBox.style.left = '2%';
                dialogueBox.style.right = 'auto';
            }
            // Clamp right edge: don't go past container right
            if (boxRect.right > containerRect.right) {
                dialogueBox.style.right = '2%';
                dialogueBox.style.left = 'auto';
            }
            // Clamp top: don't overlap HUD (keep at least 15% from top)
            if (boxRect.top < containerRect.top + containerRect.height * 0.12) {
                dialogueBox.style.bottom = 'auto';
                dialogueBox.style.top = '15%';
            }
            // Clamp bottom: don't go off screen
            if (boxRect.bottom > containerRect.bottom) {
                dialogueBox.style.bottom = '2%';
                dialogueBox.style.top = 'auto';
            }
        });
    },

    _resolveDialogueCharacter(zoneName, dialogueEntry) {
        const speakerName = (dialogueEntry?.speaker || '').toUpperCase().trim();
        const sceneChars = this.currentScene?.characters || [];

        const bySpeakerMeta = sceneChars.find(char => {
            const charName = (char.name || '').toUpperCase().trim();
            return speakerName && charName === speakerName;
        });

        if (bySpeakerMeta?.id) {
            const byId = document.querySelector(`#character-layer .character-sprite[data-character-id="${bySpeakerMeta.id}"]`);
            if (byId) return byId;
        }

        if (speakerName) {
            const byName = Array.from(document.querySelectorAll('#character-layer .character-sprite'))
                .find(el => (el.dataset.characterName || '').trim() === speakerName);
            if (byName) return byName;
        }

        const possibleZones = [zoneName];
        if (zoneName === 'left') possibleZones.push('left-2');
        if (zoneName === 'left-2') possibleZones.push('left');
        if (zoneName === 'right') possibleZones.push('right-2');
        if (zoneName === 'right-2') possibleZones.push('right');

        for (const zone of possibleZones) {
            const characterEl = document.querySelector(`#character-layer .character-sprite[data-zone="${zone}"]`);
            if (characterEl) return characterEl;
        }

        return null;
    },

    _positionDialogueNearCharacter(dialogueBox, zoneName, dialogueEntry) {
        const container = document.getElementById('scene-container');
        if (!container || !dialogueBox || !zoneName) return;

        const characterEl = this._resolveDialogueCharacter(zoneName, dialogueEntry);

        if (!characterEl) return;

        requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect();
            const charRect = characterEl.getBoundingClientRect();
            const boxRect = dialogueBox.getBoundingClientRect();

            const margin = 20;
            const topPx = Math.max(
                containerRect.height * 0.14,
                (charRect.top - containerRect.top) - boxRect.height - margin
            );

            const charLeft = charRect.left - containerRect.left;
            const charRight = charRect.right - containerRect.left;
            const minLeft = containerRect.width * 0.02;
            const maxLeft = containerRect.width - boxRect.width - minLeft;
            let leftPx;

            if (zoneName.startsWith('left')) {
                // Comic-style: bubble floats up and to the right of left-side speaker.
                leftPx = charLeft + (charRect.width * 0.55);
            } else if (zoneName.startsWith('right')) {
                // Mirror placement for right-side speaker.
                leftPx = charRight - boxRect.width - (charRect.width * 0.15);
            } else {
                leftPx = (charLeft + charRight) / 2 - (boxRect.width / 2);
            }

            leftPx = Math.min(maxLeft, Math.max(minLeft, leftPx));

            dialogueBox.style.left = `${leftPx}px`;
            dialogueBox.style.right = 'auto';
            dialogueBox.style.top = `${topPx}px`;
            dialogueBox.style.bottom = 'auto';
            dialogueBox.style.transform = 'none';
        });
    },

    nextDialogue() {
        // Block dialogue advancement during transitions
        if (this.isTransitioning) return;

        gameState.currentDialogueIndex++;
        const scene = this.currentScene;

        if (scene.dialogue && gameState.currentDialogueIndex < scene.dialogue.length) {
            this.showDialogue(scene.dialogue[gameState.currentDialogueIndex]);
        } else {
            document.getElementById('dialogue-box').classList.add('hidden');
        }
    },
    
    fadeTransition(fadeIn) {
        return new Promise(resolve => {
            const overlay = document.getElementById('fade-overlay');

            if (fadeIn) {
                overlay.classList.add('active');
                setTimeout(resolve, 700);
            } else {
                setTimeout(() => {
                    overlay.classList.remove('active');
                    setTimeout(resolve, 700);
                }, 100);
            }
        });
    }
};


// ===== SCENE DEFINITIONS =====
const SCENES = {
    // ===== MAIN MENU =====
    S0_MAIN_MENU: {
        id: 'S0_MAIN_MENU',
        title: '',
        background: './assets/ui/ui_main_menu_bg.png',
        music: 'main-menu-theme.mp3',
        characters: [],
        hotspots: [],
        dialogue: [],
        
        onEnter() {
            // Clear main menu specific class and setup
            document.body.classList.add('main-menu');

            // Start music automatically with fade in
            audioManager.playMusic('main-menu-theme.mp3', true);

            const container = document.getElementById('hotspot-layer');
            container.innerHTML = `
                <div id="main-menu-content">
                    <h1 id="main-menu-title">THE HARDIGAN BOYS<br>VS.<br>THE MEXICAN DRUG CARTEL</h1>
                    <button class="menu-btn" id="btn-new-game">NEW GAME</button>
                    <button class="menu-btn" id="btn-continue-game">CONTINUE</button>
                    <button class="menu-btn" id="btn-options">OPTIONS</button>
                </div>
            `;


            document.getElementById('btn-new-game').addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                gameState.inventory = [];
                gameState.notebook = [];
                gameState.objectsClicked.clear();
                for (let key in gameState.flags) {
                    gameState.flags[key] = false;
                }
                saveSystem.deleteSave();
                document.body.classList.remove('main-menu');
                sceneRenderer.loadScene('S1_LIVING_ROOM_INTRO');
            });
            
            const continueBtn = document.getElementById('btn-continue-game');
            if (!saveSystem.hasSave()) {
                continueBtn.disabled = true;
            } else {
                continueBtn.addEventListener('click', () => {
                    SFXGenerator.playButtonClick();
                    if (saveSystem.load()) {
                        document.body.classList.remove('main-menu');
                        sceneRenderer.loadScene(gameState.currentSceneId);
                    }
                });
            }

            document.getElementById('btn-options').addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                document.getElementById('settings-overlay').classList.remove('hidden');
            });

            // Fade in menu buttons with staggered animation after menu loads
            setTimeout(() => {
                const menuButtons = document.querySelectorAll('.menu-btn');
                menuButtons.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.classList.add('fade-in');
                    }, index * 150); // 150ms delay between each button
                });
            }, 300); // Start after 300ms to let the scene fade in first
        }
    },
    
    // ===== S1: LIVING ROOM INTRO - CORRECTED HOTSPOTS =====
    S1_LIVING_ROOM_INTRO: {
        id: 'S1_LIVING_ROOM_INTRO',
        title: 'Another Normal Night',
        background: './assets/backgrounds/bg_hardigan_livingroom_night_02.png',
        music: 'Hardigan Noir Tension.mp3',

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_excited.png', position: 'right' }
        ],

        items: [],

        hotspots: [
            {
                id: 'tv_remote',
                label: 'TV Remote',
                coordSystem: 'native',
                x: 922,
                y: 756,
                width: 96,
                height: 43,
                onClick() {
                    gameState.objectsClicked.add('remote');
                    lightingEffects.toggleTV();
                    sceneRenderer.showDialogue({
                        speaker: 'JONAH',
                        text: gameState.lighting.tvOn ?
                            "*click* There we go. Peak entertainment: the news yelling about cartels." :
                            "*click* And... off it goes. Back to existential silence.",
                        position: 'right',
                        next: 'NEXT_DIALOGUE'
                    });
                }
            },
            {
                id: 'television',
                label: 'Television',
                coordSystem: 'native',
                x: 192, y: 410, width: 346, height: 270,
                onClick() {
                    gameState.objectsClicked.add('television');
                    lightingEffects.toggleTV();
                    sceneRenderer.showDialogue({
                        speaker: 'JONAH',
                        text: gameState.lighting.tvOn ?
                            "*click* Channel cycle, baby! News, reality TV, more news... It's all the same panic with different fonts." :
                            "*click* Annnnd it's off. Who needs information anyway?",
                        position: 'right',
                        next: 'NEXT_DIALOGUE'
                    });
                }
            },
            {
                id: 'window',
                label: 'Window',
                coordSystem: 'native',
                x: 576, y: 130, width: 384, height: 346,
                onClick() {
                    if (!gameState.objectsClicked.has('window')) {
                        gameState.objectsClicked.add('window');
                        sceneRenderer.showDialogue({
                            speaker: 'JONAH',
                            text: "Uh. Hank? There's like... a lot of lights outside.",
                            position: 'right',
                            next: () => {
                                sceneRenderer.showDialogue({
                                    speaker: 'HANK',
                                    text: "Relax, it's probably just your DoorDash finally escaping ICE detention.",
                                    position: 'left',
                                    next: () => {
                                        if (gameState.objectsClicked.size >= 2) {
                                            sceneRenderer.loadScene('S2_ICE_RAID_WINDOW');
                                        } else {
                                            document.getElementById('dialogue-box').classList.add('hidden');
                                        }
                                    }
                                });
                            }
                        });
                    } else if (gameState.objectsClicked.size >= 2) {
                        sceneRenderer.loadScene('S2_ICE_RAID_WINDOW');
                    }
                }
            },
            {
                id: 'lamp',
                label: 'Lamp',
                coordSystem: 'native',
                x: 1574, y: 270, width: 192, height: 378,
                onClick() {
                    gameState.objectsClicked.add('lamp');
                    lightingEffects.toggleLamp();
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: gameState.lighting.lampOn ?
                            "*click* There. Mood lighting for the collapse of the republic." :
                            "*click* Lights off. Very noir. Very ominous.",
                        position: 'left',
                        next: 'NEXT_DIALOGUE'
                    });
                }
            },
            {
                id: 'notebook',
                label: "Hank's Conspiracy Notebook",
                coordSystem: 'native',
                x: 730, y: 670, width: 192, height: 86,
                onClick() {
                    if (!inventory.has('conspiracy_notebook')) {
                        gameState.objectsClicked.add('notebook');
                        inventory.add('conspiracy_notebook');
                        notebook.add('THE NOTEBOOK', 'Hank\'s conspiracy theories and "research". Everything connects, apparently.');
                        sceneRenderer.showDialogue({
                            speaker: 'HANK',
                            text: "Ah yes, my research. Every thread connects. Every pattern matters. Mostly.",
                            position: 'left',
                            next: 'NEXT_DIALOGUE'
                        });
                    } else {
                        // Open notebook directly
                        notebook.show();
                    }
                }
            }
        ],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Northern Virginia. Quiet suburbia. Two brothers, one algorithm-rotted nation, and a foreign policy degree from TikTok University.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "I'm telling you, Jonah, everything connects. Private prisons, avocado prices, and your For You Page.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "You say this every time we run out of chips, dude.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MOM',
                text: "If either of you used this much energy on school, we'd be rich by now!",
                position: 'right',
                next: () => {
                    // Slide out Mom after her dialogue
                    sceneRenderer.removeCharacter('mom');
                    document.getElementById('dialogue-box').classList.add('hidden');
                },
                onShow: () => {
                    // Slide in Mom when her dialogue appears (use right-2 so she doesn't overlap with Jonah)
                    sceneRenderer.addCharacter({
                        id: 'mom',
                        name: 'MOM',
                        sprite: 'char_mom_annoyed.png',
                        position: 'right-2'
                    }, 100);
                }
            }
        ],

        onEnter() {
            // Initialize lighting - start with both off for dramatic effect
            gameState.lighting.lampOn = false;
            gameState.lighting.tvOn = false;
            lightingEffects.updateLighting();

            // Add subtle police light strobing effect to window
            const sceneContainer = document.getElementById('scene-container');
            const policeLight = document.createElement('div');
            policeLight.id = 'police-light-effect';
            policeLight.style.cssText = `
                position: absolute;
                top: 12%;
                left: 30%;
                width: 20%;
                height: 32%;
                pointer-events: none;
                z-index: 2;
                opacity: 0;
                animation: policeLightStrobe 3s ease-in-out infinite;
            `;
            sceneContainer.appendChild(policeLight);

            // Add CSS animation if not already present
            if (!document.getElementById('police-light-style')) {
                const style = document.createElement('style');
                style.id = 'police-light-style';
                style.textContent = `
                    @keyframes policeLightStrobe {
                        0%, 100% {
                            opacity: 0;
                            background: transparent;
                        }
                        10% {
                            opacity: 0.15;
                            background: radial-gradient(ellipse at center, rgba(255, 0, 0, 0.4) 0%, transparent 70%);
                        }
                        15% {
                            opacity: 0;
                        }
                        20% {
                            opacity: 0.15;
                            background: radial-gradient(ellipse at center, rgba(0, 0, 255, 0.4) 0%, transparent 70%);
                        }
                        25% {
                            opacity: 0;
                        }
                        30% {
                            opacity: 0.15;
                            background: radial-gradient(ellipse at center, rgba(255, 0, 0, 0.4) 0%, transparent 70%);
                        }
                        35% {
                            opacity: 0;
                        }
                        50%, 90% {
                            opacity: 0;
                            background: transparent;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    },
    
    // ===== S2: THE RAID =====
    S2_ICE_RAID_WINDOW: {
        id: 'S2_ICE_RAID_WINDOW',
        title: 'The Raid',
        background: './assets/backgrounds/bg_street_suburb_raid_night.png',
        music: 'Dark Police Intensity.mp3',

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused-right.png', position: 'right' }
        ],

        hotspots: [],

        dialogue: [
            {
                speaker: 'JONAH',
                text: "Okay. That's… definitely ICE.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "No way. They'd never raid a quiet cul-de-sac with a Whole Foods loyalty card.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Bro, that's the Riveras' house.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Mom, they're taking Carlos. He literally coached the neighborhood soccer team.",
                position: 'left',
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    // Remove Jonah before adding Ice Agent and Mr. Rivera
                    sceneRenderer.removeCharacter('jonah');

                    // Add Ice Agent and Mr. Rivera on the right side when Hank points them out
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'ice_agent',
                            name: 'ICE AGENT',
                            sprite: 'char_ice_generic_1.png',
                            position: 'right'
                        }, 100);
                    }, 300);
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'mr_rivera',
                            name: 'MR. RIVERA',
                            sprite: 'char_carlos_detained.png',
                            position: 'right-2'
                        }, 100);
                    }, 500);
                }
            },
            {
                speaker: 'MOM',
                text: "Away from the window. Now. Both of you.",
                position: 'left',
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    // Add Mom on the left side (adjacent to Hank)
                    sceneRenderer.addCharacter({
                        id: 'mom',
                        name: 'MOM',
                        sprite: 'char_mom_worried.png',
                        position: 'left-2'
                    }, 100);
                }
            },
            {
                speaker: 'MOM',
                text: "We are not getting involved. Do you hear me?",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'What do you do?',
                        choices: [
                            {
                                text: 'Listen to Mom - stay inside and watch',
                                action() {
                                    gameState.flags.HELPED_ICE = true;
                                    sceneRenderer.loadScene('S3A_FRONT_YARD_FROM_DISTANCE');
                                }
                            },
                            {
                                text: 'Sneak out the back door to help the Riveras',
                                action() {
                                    gameState.flags.HELPED_NEIGHBORS = true;
                                    if (!inventory.has('house_key')) {
                                        inventory.add('house_key');
                                    }
                                    sceneRenderer.loadScene('S3B_RIVERA_BACKYARD');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    // ===== S3A: GOOD CITIZENS PATH =====
    S3A_FRONT_YARD_FROM_DISTANCE: {
        id: 'S3A_FRONT_YARD_FROM_DISTANCE',
        title: 'Good Citizens',
        background: './assets/backgrounds/bg_hardigan_livingroom_night_03.png',
        music: 'Empty Hallways (Ambient Mix).mp3',
        
        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_excited.png', position: 'right' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'TV ANCHOR',
                text: "Sources say the operation targets a dangerous trafficking network hidden in quiet communities like yours.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "(uneasy) They made Carlos look like a Bond villain for being late on rent.",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'What do you do?',
                        choices: [
                            {
                                text: 'Call ICE tip line / cooperate with authorities',
                                action() {
                                    gameState.flags.HELPED_ICE = true;
                                    gameState.flags.WORKING_WITH_CIA = true;
                                    sceneRenderer.loadScene('S4A1_ICE_FOLLOWUP');
                                }
                            },
                            {
                                text: 'Refuse - just watch in silence',
                                action() {
                                    gameState.flags.DISILLUSIONED = true;
                                    sceneRenderer.loadScene('S4A2_GUILT_AND_GOSSIP');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    // ===== S3B: HELP NEIGHBORS PATH =====
    S3B_RIVERA_BACKYARD: {
        id: 'S3B_RIVERA_BACKYARD',
        title: 'Illegal Backyard Heroism',
        background: './assets/backgrounds/bg_rivera_backyard_night.png',
        music: 'The Raid Escape.mp3',

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_scared_left.png', position: 'left-2' },
            { id: 'sofia', name: 'SOFIA', sprite: 'char_sofia_upset.png', position: 'right' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'SOFIA',
                text: "You shouldn't be here.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We saw ICE. We thought we could… help?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Unless you have a helicopter and a non-extradition treaty, you're late.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Here. Take this USB drive. It has contacts, numbers... everything. My dad thought it would clear his name. Maybe you can use it.",
                position: 'right',
                next: () => {
                    inventory.add('neighbors_usb');
                    notebook.add('RIVERA USB', 'Contains sensitive contacts and information. Could clear the Riveras... or condemn them further.');
                    
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'How do you respond?',
                        choices: [
                            {
                                text: "We'll use this to clear his name. Promise.",
                                action() {
                                    gameState.flags.HELPED_NEIGHBORS = true;
                                    gameState.flags.LOYAL_TO_RIVERAS = true;
                                    sceneRenderer.loadScene('S4B_SCHOOL_AFTERSHOCK');
                                }
                            },
                            {
                                text: "We'll… see what's on it.",
                                action() {
                                    gameState.flags.HELPED_NEIGHBORS = true;
                                    gameState.flags.OPPORTUNIST = true;
                                    sceneRenderer.loadScene('S4B_SCHOOL_AFTERSHOCK');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    // ===== S4A1: ICE FOLLOW-UP =====
    S4A1_ICE_FOLLOWUP: {
        id: 'S4A1_ICE_FOLLOWUP',
        title: 'Friendly Federal Harassment',
        background: './assets/backgrounds/bg_hardigan_livingroom_day.png',
        music: 'Empty Hallways (Ambient Mix).mp3',
        
        characters: [
            { id: 'agent_smith', name: 'AGENT SMITH', sprite: 'char_ice_smith_smirk.png', position: 'center' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'AGENT SMITH',
                text: "Morning. Just following up on your very patriotic phone call.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "(whisper) We snitched so hard we got customer service.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We just… reported what we saw on TV.",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'What do you tell Agent Smith?',
                        choices: [
                            {
                                text: 'Cooperate fully with ICE',
                                action() {
                                    gameState.flags.WORKING_WITH_CIA = true;
                                    inventory.add('burner_phone');
                                    notebook.add('BURNER PHONE', 'Given by Agent Smith. They want us to report any "unusual activity."');
                                    sceneRenderer.loadScene('S4A2_GUILT_AND_GOSSIP');
                                }
                            },
                            {
                                text: 'Backpedal - "I think we overreacted"',
                                action() {
                                    gameState.flags.SUSPICIOUS_TO_FEDS = true;
                                    sceneRenderer.loadScene('S4A2_GUILT_AND_GOSSIP');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    // ===== S4A2: GUILT AND GOSSIP =====
    S4A2_GUILT_AND_GOSSIP: {
        id: 'S4A2_GUILT_AND_GOSSIP',
        title: 'We Just Watched',
        background: './assets/backgrounds/bg_school_hallway_day.png',
        music: 'Empty Hallways (Ambient Mix).mp3',
        
        characters: [],
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "School the next day. The gossip mill is in overdrive.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'RANDOM STUDENT',
                text: "I heard the dad was totally cartel.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "(muttering) Yeah, or super convenient for a press conference.",
                position: 'left',
                next: () => {
                    sceneRenderer.loadScene('S6_INTEL_ENTANGLEMENT');
                }
            }
        ]
    },
    
    // ===== S4B: SCHOOL AFTERSHOCK =====
    S4B_SCHOOL_AFTERSHOCK: {
        id: 'S4B_SCHOOL_AFTERSHOCK',
        title: 'Aftermath',
        background: './assets/backgrounds/bg_school_hallway_day.png',
        music: 'Empty Hallways (Ambient Mix).mp3',
        
        characters: [
            { id: 'sofia', name: 'SOFIA', sprite: 'char_sofia_neutral.png', position: 'right' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'RANDOM STUDENT',
                text: "I heard the dad was totally cartel.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'ANOTHER STUDENT',
                text: "My cousin's friend said ICE only hits houses if you're like, super guilty.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "(muttering) Yeah, or super convenient for a press conference.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "You still have the drive?",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Yeah. Feels like holding a grenade filled with subpoenas.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Good. Because you're not the only ones who want it.",
                position: 'right',
                next: () => {
                    sceneRenderer.loadScene('S6_INTEL_ENTANGLEMENT');
                }
            }
        ]
    },
    
    // ===== S6: INTEL ENTANGLEMENT =====
    S6_INTEL_ENTANGLEMENT: {
        id: 'S6_INTEL_ENTANGLEMENT',
        title: 'Ms. Gray Enters the Chat',
        background: './assets/backgrounds/bg_cia_office.png',
        music: 'Classified Silence.mp3',
        
        characters: [
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_amused.png', position: 'center' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'MS. GRAY',
                text: "Relax, I'm not ICE. I have better fonts on my PowerPoints.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Are you like, CIA-cia or TikTok-cia?",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "The one that doesn't dance on camera.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "That USB you have? It's... complicated. Could clear the Riveras. Could also make things much worse.",
                next: () => {
                    if (inventory.has('neighbors_usb')) {
                        sceneRenderer.showDialogue({
                            speaker: 'CHOICE',
                            text: 'What do you do with the USB?',
                            choices: [
                                {
                                    text: 'Hand over the USB to Ms. Gray',
                                    action() {
                                        gameState.flags.WORKING_WITH_CIA = true;
                                        inventory.remove('neighbors_usb');
                                        notebook.add('DECISION', 'Gave the USB to the CIA. They said they\'d "handle it."');
                                        sceneRenderer.loadScene('S7B_CARTEL_TARGETING');
                                    }
                                },
                                {
                                    text: 'Keep the USB - stay independent',
                                    action() {
                                        gameState.flags.INDEPENDENT_OPERATORS = true;
                                        sceneRenderer.loadScene('S7A_CARTEL_CONTACT');
                                    }
                                }
                            ]
                        });
                    } else {
                        sceneRenderer.loadScene('S7B_CARTEL_TARGETING');
                    }
                }
            }
        ]
    },
    
    // ===== S7A: CARTEL CONTACT =====
    S7A_CARTEL_CONTACT: {
        id: 'S7A_CARTEL_CONTACT',
        title: 'Business Opportunity',
        background: './assets/backgrounds/bg_cartel_safehouse_night.png',
        music: 'Safehouse Ambience.mp3',
        
        characters: [
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_calm.png', position: 'left' },
            { id: 'cartel_boss', name: 'EL LICENCIADO', sprite: 'char_cartel_boss_menacing.png', position: 'right' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'EL LICENCIADO',
                text: "So. Two suburban boys with the one USB everyone wants.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Fun fact: this is not what we meant by 'side hustle.'",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'How do you respond?',
                        choices: [
                            {
                                text: 'Take the cartel deal',
                                action() {
                                    gameState.flags.TOOK_CARTEL_DEAL = true;
                                    notebook.add('CARTEL DEAL', 'Agreed to help route shipments. In exchange, they protect the Riveras.');
                                    sceneRenderer.loadScene('S8_PRE_FINAL');
                                }
                            },
                            {
                                text: 'Pretend to cooperate (plan secret betrayal)',
                                action() {
                                    gameState.flags.TOOK_CARTEL_DEAL = true;
                                    gameState.flags.SECRETLY_AGAINST_CARTEL = true;
                                    notebook.add('DOUBLE CROSS', 'Pretending to work with the cartel... but planning betrayal.');
                                    sceneRenderer.loadScene('S8_PRE_FINAL');
                                }
                            },
                            {
                                text: 'Refuse completely',
                                action() {
                                    gameState.flags.CARTEL_TARGET = true;
                                    sceneRenderer.loadScene('S7B_CARTEL_TARGETING');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    // ===== S7B: CARTEL TARGETING =====
    S7B_CARTEL_TARGETING: {
        id: 'S7B_CARTEL_TARGETING',
        title: 'Snitches with Sneakers',
        background: './assets/backgrounds/bg_street_suburb_hardigan_house.png',
        music: 'Covert Investigation.mp3',
        
        characters: [],
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "They're watching. Unmarked cars. Social media hints. The cartel knows.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We might have made a mistake.",
                position: 'left',
                next: () => {
                    sceneRenderer.loadScene('S8_PRE_FINAL');
                }
            }
        ]
    },
    
    // ===== S8: PRE-FINAL =====
    S8_PRE_FINAL: {
        id: 'S8_PRE_FINAL',
        title: 'Everyone Wants a Piece',
        background: './assets/backgrounds/bg_airport_cartel_landing_strip.png',
        music: 'Covert Investigation.mp3',
        
        characters: [
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk.png', position: 'center' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Meetings at airports. Deals at docks. Venezuelan conspiracies. Everything's converging.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Time to see if you boys are serious. The warehouse. Tonight.",
                next: () => {
                    sceneRenderer.loadScene('S9_FINAL_WAREHOUSE_SHOWDOWN');
                }
            }
        ]
    },
    
    // ===== S9: FINAL WAREHOUSE SHOWDOWN =====
    S9_FINAL_WAREHOUSE_SHOWDOWN: {
        id: 'S9_FINAL_WAREHOUSE_SHOWDOWN',
        title: 'Diplomacy, but Make It Stupid',
        background: './assets/backgrounds/bg_warehouse_night.png',
        music: 'Warehouse Night Suspense.mp3',
        
        characters: [
            { id: 'cartel_boss', name: 'EL LICENCIADO', sprite: 'char_cartel_boss_menacing.png', position: 'left' },
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_threatening.png', position: 'right' }
        ],
        
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Everyone's here. Cartel. CIA. Maybe even the Riveras. All eyes on you.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'EL LICENCIADO',
                text: "So who gets the USB, boys?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "Choose wisely. Or don't. Either way makes for good paperwork.",
                position: 'right',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'FINAL CHOICE',
                        text: 'What do you do with the USB?',
                        choices: [
                            {
                                text: 'Destroy the USB publicly',
                                action() {
                                    if (gameState.flags.HELPED_NEIGHBORS) {
                                        gameState.flags.SAVED_NEIGHBORS = true;
                                        sceneRenderer.loadScene('E_HAPPY');
                                    } else {
                                        sceneRenderer.loadScene('E_SAD');
                                    }
                                }
                            },
                            {
                                text: 'Upload everything to the internet',
                                action() {
                                    sceneRenderer.loadScene('E_IRONIC_MEDIA');
                                }
                            },
                            {
                                text: 'Fake-destroy it but keep a copy',
                                action() {
                                    gameState.flags.DOUBLE_CROSSED_SOMEONE = true;
                                    sceneRenderer.loadScene('E_CHAOTIC');
                                }
                            },
                            {
                                text: 'Give it to the cartel',
                                action() {
                                    gameState.flags.TOOK_CARTEL_DEAL = true;
                                    sceneRenderer.loadScene('E_CHAOTIC');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    // ===== ENDINGS =====
    E_HAPPY: {
        id: 'E_HAPPY',
        title: 'We Saved Who We Could',
        background: './assets/backgrounds/bg_hardigan_livingroom_day.png',
        music: 'Empty Hallways (Ambient Mix).mp3',
        
        characters: [],
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "The Riveras are back. Carlos is cleared. The street is quiet again. You did what you could.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Not bad for a couple of suburban kids with a conspiracy notebook.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Does this mean we're heroes? Or just... less terrible?",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'NARRATION',
                text: "ENDING: THE HAPPY ENDING (Well, Happy-ish)\n\nThanks for playing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL",
                next: () => {
                    setTimeout(() => {
                        sceneRenderer.loadScene('S0_MAIN_MENU');
                    }, 5000);
                }
            }
        ]
    },
    
    E_SAD: {
        id: 'E_SAD',
        title: 'People Become Statistics',
        background: './assets/backgrounds/bg_rivera_livingroom_normal.png',
        music: 'Muted Aftermath.mp3',
        
        characters: [],
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "The Riveras' house has a FOR RENT sign. Carlos was deported. The news moved on.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We tried to do the right thing. Or... did we?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'NARRATION',
                text: "ENDING: THE SAD ENDING (Some People Become Statistics)\n\nThanks for playing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL",
                next: () => {
                    setTimeout(() => {
                        sceneRenderer.loadScene('S0_MAIN_MENU');
                    }, 5000);
                }
            }
        ]
    },
    
    E_CHAOTIC: {
        id: 'E_CHAOTIC',
        title: 'Multilateral Dumbassery',
        background: './assets/backgrounds/bg_river_dock_night.png',
        music: 'Dark Police Intensity.mp3',
        
        characters: [
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk.png', position: 'center' }
        ],
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Chaos at the warehouse. Explosions. Leaks. International incident. And somehow... you're on a boat.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Welcome to the game, boys. You played it... interestingly.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Are we fugitives now? Or entrepreneurs? I genuinely can't tell.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'NARRATION',
                text: "ENDING: THE CHAOTIC ENDING (Everybody's Mad, Nobody Wins)\n\nThanks for playing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL",
                next: () => {
                    setTimeout(() => {
                        sceneRenderer.loadScene('S0_MAIN_MENU');
                    }, 5000);
                }
            }
        ]
    },
    
    E_IRONIC_MEDIA: {
        id: 'E_IRONIC_MEDIA',
        title: 'Everyone Has a Narrative',
        background: './assets/backgrounds/bg_hardigan_livingroom_night_02.png',
        music: 'Hardigan Noir Tension.mp3',
        
        characters: [],
        hotspots: [],
        
        dialogue: [
            {
                speaker: 'NARRATION',
                text: "You uploaded everything. The truth is out there. And... everyone interpreted it differently.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We gave them the facts. And they made it into... content.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "At least we got, like, a really good engagement rate?",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'NARRATION',
                text: "ENDING: THE IRONIC MEDIA ENDING (Truth Becomes Just Another Story)\n\nThanks for playing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL",
                next: () => {
                    setTimeout(() => {
                        sceneRenderer.loadScene('S0_MAIN_MENU');
                    }, 5000);
                }
            }
        ]
    }
};

const sceneIntegrity = {
    validateAndNormalize() {
        const validZones = new Set(['left', 'left-2', 'center', 'right-2', 'right']);

        Object.values(SCENES).forEach(scene => {
            if (!scene || typeof scene !== 'object') return;

            scene.characters = (scene.characters || []).map((char, idx) => {
                const normalized = { ...char };
                normalized.position = validZones.has(normalized.position) ? normalized.position : 'center';
                if (!normalized.id) {
                    normalized.id = `${scene.id || 'scene'}-char-${idx}`;
                }
                return normalized;
            });

            const fallbackZoneBySpeaker = new Map(
                scene.characters
                    .filter(char => char?.name && char?.position)
                    .map(char => [String(char.name).toUpperCase(), char.position])
            );

            scene.dialogue = (scene.dialogue || []).map(entry => {
                if (!entry || typeof entry !== 'object') return entry;
                const normalizedEntry = { ...entry };
                if (normalizedEntry.position && !validZones.has(normalizedEntry.position)) {
                    normalizedEntry.position = 'center';
                }
                if (!normalizedEntry.position && normalizedEntry.speaker) {
                    const inferredZone = fallbackZoneBySpeaker.get(String(normalizedEntry.speaker).toUpperCase());
                    if (inferredZone) normalizedEntry.position = inferredZone;
                }
                return normalizedEntry;
            });
        });
    }
};

// ===== UI EVENT HANDLERS =====
function setupUIHandlers() {
    // Inventory button
    document.getElementById('btn-inventory').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        inventory.show();
    });
    
    // Notebook button
    document.getElementById('btn-notebook').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        notebook.show();
    });
    
    // Notebook close button
    document.getElementById('notebook-close').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        document.getElementById('notebook-overlay').classList.add('hidden');
    });
    
    // Pause button
    document.getElementById('btn-pause').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        document.getElementById('pause-menu').classList.remove('hidden');
        audioManager.playMusic('game-menu-theme.mp3');
    });
    
    const closePauseMenu = () => {
        document.getElementById('pause-menu').classList.add('hidden');
        const currentScene = SCENES[gameState.currentSceneId];
        if (currentScene && currentScene.music) {
            audioManager.playMusic(currentScene.music);
        }
    };

    // Resume button
    document.getElementById('btn-resume').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        closePauseMenu();
    });

    // Clicking outside the phone closes the pause menu for faster gameplay flow.
    document.getElementById('pause-menu').addEventListener('click', (event) => {
        if (event.target.id === 'pause-menu') {
            SFXGenerator.playButtonClick();
            closePauseMenu();
        }
    });
    
    // Save button
    document.getElementById('btn-save').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        if (saveSystem.save()) {
            alert('Game saved successfully!');
        }
    });
    
    // Settings button
    document.getElementById('btn-settings').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('settings-overlay').classList.remove('hidden');
    });
    
    // Main menu button
    document.getElementById('btn-main-menu').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        if (confirm('Return to main menu? (Progress will be saved)')) {
            saveSystem.save();
            document.getElementById('pause-menu').classList.add('hidden');
            sceneRenderer.loadScene('S0_MAIN_MENU');
        }
    });
    
    // Close buttons for overlays
    document.querySelectorAll('.overlay-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            SFXGenerator.playButtonClick();
            e.target.closest('.overlay').classList.add('hidden');
        });
    });
    
    // Music volume slider
    const musicVol = document.getElementById('music-volume');
    const musicDisplay = document.getElementById('music-volume-display');
    musicVol.addEventListener('input', (e) => {
        gameState.settings.musicVolume = parseInt(e.target.value);
        musicDisplay.textContent = e.target.value + '%';
        audioManager.updateVolumes();
    });
    
    // SFX volume slider
    const sfxVol = document.getElementById('sfx-volume');
    const sfxDisplay = document.getElementById('sfx-volume-display');
    sfxVol.addEventListener('input', (e) => {
        gameState.settings.sfxVolume = parseInt(e.target.value);
        sfxDisplay.textContent = e.target.value + '%';
        audioManager.updateVolumes();
    });
    
    // Show hotspots checkbox
    const showHotspots = document.getElementById('show-hotspots');
    showHotspots.addEventListener('change', (e) => {
        gameState.settings.showHotspots = e.target.checked;
        if (e.target.checked) {
            document.body.classList.add('show-hotspots');
        } else {
            document.body.classList.remove('show-hotspots');
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', safeAsync(async () => {
    console.log('🎮 Initializing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL...');

    // Initialize audio
    audioManager.init();
    mobileOptimizer.init();

    // Normalize scene data before the first scene loads.
    sceneIntegrity.validateAndNormalize();

    // Setup UI handlers
    setupUIHandlers();

    // Apply hotspot setting
    if (gameState.settings.showHotspots) {
        document.body.classList.add('show-hotspots');
    }

    await assetLoader.preloadAssets();

    // Debug: log click position in native image coordinates when debug mode is on
    document.getElementById('scene-container').addEventListener('click', (e) => {
        if (!gameState.settings.showHotspots) return;
        const rect = positioningSystem.getBackgroundRect();
        if (!rect) return;
        const containerRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - containerRect.left;
        const clickY = e.clientY - containerRect.top;
        const imgX = Math.round((clickX - rect.offsetX) / rect.scaleX);
        const imgY = Math.round((clickY - rect.offsetY) / rect.scaleY);
        const pctX = ((clickX - rect.offsetX) / rect.renderedW * 100).toFixed(1);
        const pctY = ((clickY - rect.offsetY) / rect.renderedH * 100).toFixed(1);
        console.log(`[Debug] Click → native: (${imgX}, ${imgY}) | percent: (${pctX}%, ${pctY}%) | screen: (${Math.round(clickX)}, ${Math.round(clickY)})`);
    });

    // Responsive positioning: recalculate on resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            try {
                positioningSystem.recalculateAll();
            } catch (error) {
                errorLogger.log('resize-recalculate', error);
            }
        }, mobileOptimizer.resizeDebounceMs);
    });

    // Also recalculate on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            try {
                positioningSystem.recalculateAll();
            } catch (error) {
                errorLogger.log('orientation-recalculate', error);
            }
        }, 300);
    });

    // Load main menu
    sceneRenderer.loadScene('S0_MAIN_MENU');
    setTimeout(() => assetLoader.hideLoadingScreen(), 250);

    console.log('✅ Game initialized successfully!');
}, 'bootstrap'));
