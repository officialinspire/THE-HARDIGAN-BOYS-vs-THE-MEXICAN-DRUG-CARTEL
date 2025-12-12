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
    objectsClicked: new Set()
};

// ===== AUDIO MANAGEMENT =====
const audioManager = {
    musicPlayer: null,
    sfxPlayer: null,
    currentTrack: null,
    
    init() {
        this.musicPlayer = document.getElementById('music-player');
        this.sfxPlayer = document.getElementById('sfx-player');
        this.updateVolumes();
        SFXGenerator.init();
    },
    
    playMusic(filename, fadeIn = true) {
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
            this.musicPlayer.play().catch(err => console.warn('Audio play failed:', err));

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
    },
    
    playSFX(filename) {
        if (!filename) return;
        this.sfxPlayer.src = `./audio/${filename}`;
        this.sfxPlayer.volume = gameState.settings.sfxVolume / 100;
        this.sfxPlayer.play().catch(err => console.warn('SFX play failed:', err));
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


// ===== SCENE RENDERING =====
const sceneRenderer = {
    currentScene: null,
    
    async loadScene(sceneId) {
        const scene = SCENES[sceneId];
        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }

        this.currentScene = scene;
        gameState.currentSceneId = sceneId;
        gameState.currentDialogueIndex = 0;
        gameState.objectsClicked.clear();

        // Fade to black (fade in overlay)
        await this.fadeTransition(true);

        // Clear scene with character slide-out animations
        this.clearScene();

        // Wait for clear animations
        await new Promise(resolve => setTimeout(resolve, 800));

        const bg = document.getElementById('scene-background');
        bg.src = scene.background;

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

        // Always play music with fade in for smooth transitions
        if (scene.music) {
            audioManager.playMusic(scene.music, true);
        }

        // Fade from black (fade out overlay)
        await this.fadeTransition(false);

        if (scene.dialogue && scene.dialogue.length > 0) {
            setTimeout(() => {
                this.showDialogue(scene.dialogue[0]);
            }, 500);
        }

        if (scene.onEnter) {
            scene.onEnter();
        }

        saveSystem.save();
    },
    
    clearScene() {
        // Slide out characters before clearing
        const characters = document.querySelectorAll('.character-sprite');
        characters.forEach((char, index) => {
            setTimeout(() => {
                char.classList.remove('visible');
            }, index * 100);
        });

        // Wait for animations to complete before clearing
        setTimeout(() => {
            document.getElementById('character-layer').innerHTML = '';
            document.getElementById('item-layer').innerHTML = '';
            document.getElementById('hotspot-layer').innerHTML = '';
            document.getElementById('dialogue-box').classList.add('hidden');
        }, characters.length * 100 + 600);
    },
    
    loadCharacters(characters) {
        const charLayer = document.getElementById('character-layer');
        
        characters.forEach((char, index) => {
            const img = document.createElement('img');
            img.className = `character-sprite char-${char.position || 'center'}`;
            
            let spriteName = char.sprite;
            if (char.position === 'left' && !spriteName.includes('-left') && !spriteName.includes('-right')) {
                spriteName = spriteName.replace('.png', '-left.png');
            } else if (char.position === 'right' && !spriteName.includes('-left') && !spriteName.includes('-right')) {
                spriteName = spriteName.replace('.png', '-right.png');
            }
            
            img.src = `./assets/characters/${spriteName}`;
            img.alt = char.name;
            img.style.zIndex = index + 1;
            
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
            div.style.left = item.x + '%';
            div.style.top = item.y + '%';
            div.style.width = item.width + '%';
            div.style.height = item.height + '%';
            div.title = item.label || '';

            const img = document.createElement('img');
            img.src = `./assets/items/item_${item.id}.png`;
            img.alt = item.label || item.id;
            div.appendChild(img);

            div.addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                if (item.onClick) {
                    item.onClick();
                    // Mark as collected visually
                    div.classList.add('collected');
                }
            });

            itemLayer.appendChild(div);
        });
    },

    loadHotspots(hotspots) {
        const hotspotLayer = document.getElementById('hotspot-layer');

        hotspots.forEach(hotspot => {
            const div = document.createElement('div');
            div.className = 'hotspot';
            div.style.left = hotspot.x + '%';
            div.style.top = hotspot.y + '%';
            div.style.width = hotspot.width + '%';
            div.style.height = hotspot.height + '%';
            div.title = hotspot.label || '';

            div.addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                if (hotspot.onClick) {
                    hotspot.onClick();
                }
            });

            hotspotLayer.appendChild(div);
        });
    },
    
    showDialogue(dialogueEntry) {
        const dialogueBox = document.getElementById('dialogue-box');
        const dialogueContainer = document.getElementById('dialogue-container');
        const dialogueBubble = document.getElementById('dialogue-bubble');
        const speaker = document.getElementById('dialogue-speaker');
        const text = document.getElementById('dialogue-text');
        const choicesDiv = document.getElementById('dialogue-choices');
        const continueBtn = document.getElementById('dialogue-continue');

        choicesDiv.innerHTML = '';
        continueBtn.classList.add('hidden');

        const isNarration = !dialogueEntry.speaker || dialogueEntry.speaker === 'NARRATION' || dialogueEntry.speaker === 'SYSTEM';

        if (isNarration) {
            // Use stylish container for narrative events
            dialogueContainer.classList.add('narrative-mode');
            speaker.className = 'narration';
            text.className = 'narration';
            speaker.textContent = '';
        } else {
            // Remove narrative mode and use speech bubble matching character position
            dialogueContainer.classList.remove('narrative-mode');
            const isLeft = dialogueEntry.position === 'left';
            dialogueBubble.src = isLeft ?
                './assets/menu_dialogue/dialogue-bubble-large-left.png' :
                './assets/menu_dialogue/dialogue-bubble-large-right.png';
            speaker.className = '';
            text.className = '';
            speaker.textContent = dialogueEntry.speaker;
        }

        dialogueBox.classList.remove('hidden');
        text.textContent = dialogueEntry.text || '';

        SFXGenerator.playDialogueAdvance();
        
        if (dialogueEntry.choices && dialogueEntry.choices.length > 0) {
            dialogueEntry.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'dialogue-choice';
                btn.textContent = choice.text;
                btn.addEventListener('click', () => {
                    SFXGenerator.playButtonClick();
                    if (choice.action) {
                        choice.action();
                    }
                });
                choicesDiv.appendChild(btn);
            });
        } else if (dialogueEntry.next) {
            continueBtn.classList.remove('hidden');
            continueBtn.onclick = () => {
                SFXGenerator.playDialogueAdvance();
                if (dialogueEntry.next === 'NEXT_DIALOGUE') {
                    this.nextDialogue();
                } else if (typeof dialogueEntry.next === 'function') {
                    dialogueEntry.next();
                } else {
                    this.loadScene(dialogueEntry.next);
                }
            };
        } else {
            setTimeout(() => {
                this.nextDialogue();
            }, 3000);
        }
    },
    
    nextDialogue() {
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

        items: [
            {
                id: 'tv_remote',
                label: 'TV Remote',
                x: 56,
                y: 68,
                width: 5,
                height: 4,
                onClick() {
                    if (!inventory.has('tv_remote')) {
                        inventory.add('tv_remote');
                        sceneRenderer.showDialogue({
                            speaker: 'JONAH',
                            text: "Got the remote! Now I can... wait, it doesn't work.",
                            position: 'right',
                            next: 'NEXT_DIALOGUE'
                        });
                    } else {
                        sceneRenderer.showDialogue({
                            speaker: 'JONAH',
                            text: "The remote doesn't work. Batteries are probably dead... or the universe is just against us.",
                            position: 'right',
                            next: 'NEXT_DIALOGUE'
                        });
                    }
                }
            }
        ],

        hotspots: [
            {
                id: 'television',
                label: 'Television',
                x: 10, y: 38, width: 18, height: 25,
                onClick() {
                    if (!gameState.objectsClicked.has('television')) {
                        gameState.objectsClicked.add('television');
                        sceneRenderer.showDialogue({
                            speaker: 'JONAH',
                            text: "Channel cycle, baby! News, reality TV, more news... It's all the same panic with different fonts.",
                            position: 'right',
                            next: 'NEXT_DIALOGUE'
                        });
                    }
                }
            },
            {
                id: 'window',
                label: 'Window',
                x: 30, y: 12, width: 20, height: 32,
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
                x: 82, y: 25, width: 10, height: 35,
                onClick() {
                    if (!gameState.objectsClicked.has('lamp')) {
                        gameState.objectsClicked.add('lamp');
                        sceneRenderer.showDialogue({
                            speaker: 'HANK',
                            text: "Mood lighting for the collapse of the republic.",
                            position: 'left',
                            next: 'NEXT_DIALOGUE'
                        });
                    }
                }
            },
            {
                id: 'notebook',
                label: "Hank's Conspiracy Notebook",
                x: 35, y: 70, width: 10, height: 8,
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
                text: "(offscreen) If either of you used this much energy on school, we'd be rich by now!",
                next: () => {
                    document.getElementById('dialogue-box').classList.add('hidden');
                }
            }
        ]
    },
    
    // ===== S2: THE RAID =====
    S2_ICE_RAID_WINDOW: {
        id: 'S2_ICE_RAID_WINDOW',
        title: 'The Raid',
        background: './assets/backgrounds/bg_street_suburb_raid_night.png',
        music: 'Dark Police Intensity.mp3',
        
        characters: [
            { id: 'ice_agent', name: 'ICE AGENT', sprite: 'char_ice_generic_1.png', position: 'right' }
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
                speaker: 'MOM',
                text: "Away from the window. Now. Both of you.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Mom, they're taking Carlos. He literally coached the neighborhood soccer team.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MOM',
                text: "We are not getting involved. Do you hear me?",
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
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'center' },
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
    
    // Resume button
    document.getElementById('btn-resume').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        document.getElementById('pause-menu').classList.add('hidden');
        const currentScene = SCENES[gameState.currentSceneId];
        if (currentScene && currentScene.music) {
            audioManager.playMusic(currentScene.music);
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initializing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL...');
    
    // Initialize audio
    audioManager.init();
    
    // Setup UI handlers
    setupUIHandlers();
    
    // Apply hotspot setting
    if (gameState.settings.showHotspots) {
        document.body.classList.add('show-hotspots');
    }
    
    // Load main menu
    sceneRenderer.loadScene('S0_MAIN_MENU');
    
    console.log('✅ Game initialized successfully!');
});
