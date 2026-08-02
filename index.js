// ============================================
// THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL
// COMPLETE GAME ENGINE WITH ALL FIXES
// ============================================

// ===== GAMEBOY-STYLE SFX GENERATOR =====
const SFXGenerator = {
    audioContext: null,
    muted: false, // set by __HB_DEBUG__.setAudioEnabled() / ?mute=1

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Audio context often starts suspended - need user interaction to resume
            if (this.audioContext.state === 'suspended') {
                console.log('AudioContext suspended, waiting for user interaction...');
            }
            
            // Resume audio context on any user interaction
            const resumeAudio = () => {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        console.log('AudioContext resumed successfully');
                    }).catch(err => {
                        console.warn('Failed to resume AudioContext:', err);
                    });
                }
            };
            
            // Attach to multiple event types for better compatibility
            ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'].forEach(eventType => {
                document.addEventListener(eventType, resumeAudio, {
                    once: true,
                    passive: true,
                    capture: true
                });
            });
            
            // Also try to resume when playing any sound
            this._originalPlay = this.playButtonClick.bind(this);
        } catch(e) {
            console.warn('Web Audio API not supported:', e);
            this.audioContext = null;
        }
    },

    _ensureAudioContext() {
        if (!this.audioContext || this.muted) return false;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Failed to resume audio:', err);
            });
        }
        
        return true;
    },
    
    playButtonClick() {
        if (!this._ensureAudioContext()) return;
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
        if (!this._ensureAudioContext()) return;
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
        if (!this._ensureAudioContext()) return;
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

    playDialoguePop() {
        if (!this._ensureAudioContext()) return;
        const now = this.audioContext.currentTime;
        const masterGain = this.audioContext.createGain();
        masterGain.gain.setValueAtTime(0.22 * (gameState.settings.sfxVolume / 100), now);
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        masterGain.connect(this.audioContext.destination);

        const osc = this.audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.09);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
    },

    playDialogueWhooshClose() {
        if (!this._ensureAudioContext()) return;
        const now = this.audioContext.currentTime;
        const bufferSize = this.audioContext.sampleRate * 0.22;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i += 1) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = noiseBuffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(380, now + 0.2);
        filter.Q.setValueAtTime(0.9, now);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2 * (gameState.settings.sfxVolume / 100), now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        source.start(now);
        source.stop(now + 0.22);
    },
    
    playMenuOpen() {
        if (!this._ensureAudioContext()) return;
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
        if (!this._ensureAudioContext()) return;
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
        if (!this._ensureAudioContext()) return;
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

const DEBUG = window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1' ||
              window.location.search.includes('debug=true');
const DEV_FORCE_WHITE_STRIP = false;

// ===== DEBUG/TESTING URL FLAGS =====
// ?debug=true unlocks window.__HB_DEBUG__, a deterministic test API (see bottom of file).
// ?skipIntro=1 bypasses the studio intro video and loads the main menu directly.
// ?mute=1 silences music/SFX from boot. ?noAnimations=1 disables CSS animations/transitions.
// ?noSave=1 makes saveSystem.save() a no-op (still returns true) so automated
// runs (e.g. the Playwright layout smoke tests) never touch localStorage,
// regardless of Playwright's own per-context storage isolation.
// None of these flags change behavior unless explicitly present in the URL.
const HB_URL_PARAMS = new URLSearchParams(window.location.search);
const HB_DEBUG_ENABLED = HB_URL_PARAMS.get('debug') === 'true';
const HB_FLAG_SKIP_INTRO = HB_URL_PARAMS.get('skipIntro') === '1';
const HB_FLAG_MUTE = HB_URL_PARAMS.get('mute') === '1';
const HB_FLAG_NO_ANIMATIONS = HB_URL_PARAMS.get('noAnimations') === '1';
const HB_FLAG_NO_SAVE = HB_URL_PARAMS.get('noSave') === '1';

const SETTINGS_STORAGE_KEY = 'HB_SETTINGS_V1';

// ===== GLOBAL GAME STATE =====
const gameState = {
    currentSceneId: 'S0_MAIN_MENU',
    inventory: [],
    notebook: [],
    journalSeen: {},
    storyProgress: {
        currentChapter: null,
        lastSceneTitle: null,
        lastObjective: null
    },
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
        SUSPICIOUS_TO_FEDS: false,
        BURNER_USED_AT_FACILITY: false
    },
    settings: {
        musicVolume: 70,
        sfxVolume: 80,
        showHotspots: true
    },
    currentDialogueIndex: 0,
    currentDialogueEntry: null,
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


const BUILTIN_HOTSPOT_PATCHES = {
    S1_LIVING_ROOM_INTRO: {
        ops: [
            { op: 'upsert', hotspot: { id: 'window', x: 304, y: 121, w: 520, h: 343, type: 'scene', target: '', z: 0 } }
        ]
    }
};

const Dev = {
    storageKeys: {
        enabled: 'DEV_MODE_ENABLED',
        toolsEnabled: 'DEV_TOOLS_ENABLED',
        activeTool: 'DEV_ACTIVE_TOOL',
        patches: 'DEV_PATCHES',
        layouts: 'DEV_LAYOUTS'
    },
    enabled: false,
    toolsEnabled: false,
    activeTool: null,
    session: {
        enabled: false,
        toolsEnabled: false,
        activeTool: null
    },
    ui: {
        updateFloatingButton() {
            const floatingButton = document.getElementById('dev-floating-btn');
            if (!floatingButton) return;
            floatingButton.classList.toggle('hidden', !Dev.enabled);
        }
    },
    kernel: {
        initialized: false,

        initOnce() {
            if (this.initialized) {
                Dev.updateStatus();
                Dev.tools.applyForCurrentScene();
                return;
            }
            this.initialized = true;
            Dev.init();
        }
    },
    tools: {
        attachedTool: null,
        attachedRoot: null,
        traceHandlers: null,

        getSceneRoot() {
            return document.getElementById('scene-container') || document.getElementById('game-root') || document.body;
        },

        detachCurrent() {
            if (this.attachedTool === 'trace' && this.attachedRoot && this.traceHandlers) {
                this.attachedRoot.removeEventListener('click', this.traceHandlers.click);
                this.attachedRoot.removeEventListener('mousemove', this.traceHandlers.mousemove);
                this.attachedRoot.removeEventListener('touchmove', this.traceHandlers.touchmove);
                this.attachedRoot.removeEventListener('mouseleave', this.traceHandlers.mouseleave);
            }
            this.attachedTool = null;
            this.attachedRoot = null;
            if (!Dev.trace.isActive()) {
                Dev.trace.hideHighlight();
            }
        },

        attachTrace(sceneRoot) {
            if (!sceneRoot) return;
            if (!this.traceHandlers) {
                this.traceHandlers = {
                    click: (event) => {
                        Dev.trace.recordClick(event);
                    },
                    mousemove: (event) => {
                        Dev.trace.updatePointer(event.clientX, event.clientY);
                    },
                    touchmove: (event) => {
                        const touch = event.touches && event.touches[0];
                        if (!touch) return;
                        Dev.trace.updatePointer(touch.clientX, touch.clientY);
                    },
                    mouseleave: () => {
                        Dev.trace.hideHighlight();
                    }
                };
            }

            sceneRoot.addEventListener('click', this.traceHandlers.click);
            sceneRoot.addEventListener('mousemove', this.traceHandlers.mousemove);
            sceneRoot.addEventListener('touchmove', this.traceHandlers.touchmove, { passive: true });
            sceneRoot.addEventListener('mouseleave', this.traceHandlers.mouseleave);
            this.attachedTool = 'trace';
            this.attachedRoot = sceneRoot;
        },

        applyForCurrentScene() {
            const sceneRoot = this.getSceneRoot();
            this.detachCurrent();
            Dev.hotspots.cancelInteraction();
            Dev.layout.cancelDrag();

            if (Dev.toolsEnabled && Dev.activeTool === 'trace') {
                this.attachTrace(sceneRoot);
            }

            Dev.hotspots.render();
            Dev.layout.render();
            Dev.bubbleSlots.render();
            Dev.updateStatus();
        }
    },
    trace: {
        logs: [],
        maxLogs: 10,
        highlightEl: null,
        pendingPointer: null,
        hoverRaf: null,
        lastHoverKey: null,

        isActive() {
            return Dev.toolsEnabled && Dev.activeTool === 'trace';
        },

        ensureHighlightEl() {
            if (this.highlightEl && this.highlightEl.isConnected) return this.highlightEl;
            const container = document.getElementById('scene-container');
            if (!container) return null;
            const el = document.createElement('div');
            el.id = 'dev-hit-highlight';
            container.appendChild(el);
            this.highlightEl = el;
            return el;
        },

        hideHighlight() {
            const el = this.ensureHighlightEl();
            if (!el) return;
            el.style.display = 'none';
            el.dataset.label = '';
            this.lastHoverKey = null;
        },

        hitTest(x, y) {
            const scene = sceneRenderer.currentScene;
            const hotspots = sceneRenderer.currentHotspots || scene?.hotspots || [];
            for (let i = hotspots.length - 1; i >= 0; i -= 1) {
                const hotspot = hotspots[i];
                const isNative = hotspot.coordSystem === 'native';
                const left = isNative ? hotspot.x : (hotspot.x / 100) * positioningSystem.REF_WIDTH;
                const top = isNative ? hotspot.y : (hotspot.y / 100) * positioningSystem.REF_HEIGHT;
                const width = isNative ? hotspot.width : (hotspot.width / 100) * positioningSystem.REF_WIDTH;
                const height = isNative ? hotspot.height : (hotspot.height / 100) * positioningSystem.REF_HEIGHT;
                const contains = x >= left && x <= left + width && y >= top && y <= top + height;
                if (contains) {
                    return {
                        hotspot,
                        rect: { left, top, width, height },
                        orderIndex: i
                    };
                }
            }
            return null;
        },

        mapClientToScene(clientX, clientY) {
            return positioningSystem.clientToNative(clientX, clientY);
        },

        formatTarget(target) {
            if (!target) return 'unknown';
            const tag = target.tagName ? target.tagName.toLowerCase() : 'node';
            const id = target.id ? `#${target.id}` : '';
            const className = target.classList && target.classList.length ? `.${Array.from(target.classList).slice(0, 2).join('.')}` : '';
            return `${tag}${id}${className}`;
        },

        recordClick(event) {
            if (!this.isActive()) return;
            const targetEl = event.target instanceof Element ? event.target : null;
            if (targetEl?.closest('#dev-hotspot-editor-layer') || targetEl?.closest('.dev-layout-resize-handle') || targetEl?.closest('.dev-layout-handle')) return;
            const coords = this.mapClientToScene(event.clientX, event.clientY);
            if (!coords) return;
            const hit = this.hitTest(coords.x, coords.y);
            const entry = {
                sceneId: gameState.currentSceneId,
                x: Math.round(coords.x),
                y: Math.round(coords.y),
                hitId: hit?.hotspot?.id || null,
                hitType: hit ? 'hotspot' : 'none',
                target: this.formatTarget(event.target),
                time: new Date().toISOString()
            };
            this.logs.unshift(entry);
            this.logs = this.logs.slice(0, this.maxLogs);
            this.renderLogs();
        },

        renderLogs() {
            const list = document.getElementById('devTraceList');
            if (!list) return;
            list.innerHTML = '';
            this.logs.forEach(log => {
                const li = document.createElement('li');
                const shortTime = log.time.split('T')[1]?.replace('Z', '')?.split('.')[0] || log.time;
                li.textContent = `[${shortTime}] ${log.sceneId} @ (${log.x}, ${log.y}) hit=${log.hitId || 'null'} type=${log.hitType} target=${log.target}`;
                list.appendChild(li);
            });
            if (!this.logs.length) {
                const li = document.createElement('li');
                li.textContent = 'No click events yet.';
                list.appendChild(li);
            }
        },

        updatePointer(clientX, clientY) {
            this.pendingPointer = { clientX, clientY };
            if (this.hoverRaf) return;
            this.hoverRaf = requestAnimationFrame(() => {
                this.hoverRaf = null;
                const point = this.pendingPointer;
                this.pendingPointer = null;
                if (!point) return;
                this.flushPointer(point.clientX, point.clientY);
            });
        },

        flushPointer(clientX, clientY) {
            if (!this.isActive()) {
                this.hideHighlight();
                return;
            }
            const coords = this.mapClientToScene(clientX, clientY);
            if (!coords) return;
            const hit = this.hitTest(coords.x, coords.y);
            const hoverKey = hit?.hotspot?.id ? `hotspot:${hit.hotspot.id}` : 'none';
            const el = this.ensureHighlightEl();
            if (!el || !hit) {
                if (this.lastHoverKey !== 'none') {
                    this.hideHighlight();
                    this.lastHoverKey = 'none';
                }
                return;
            }
            if (this.lastHoverKey === hoverKey) return;
            const pos = positioningSystem.calculateHotspotPosition(hit.rect.left, hit.rect.top, hit.rect.width, hit.rect.height);
            el.style.left = pos.left;
            el.style.top = pos.top;
            el.style.width = pos.width;
            el.style.height = pos.height;
            el.style.display = 'block';
            el.dataset.label = `${hit.hotspot.id || 'unknown'} → ${hit.hotspot.target || hit.hotspot.label || 'no-target'}`;
            this.lastHoverKey = hoverKey;
        }
    },

    hotspots: {
        selectedId: null,
        snapEnabled: true,
        snapSize: 8,
        lockGameplay: true,
        autoIdEnabled: true,
        overlayEl: null,
        panelEl: null,
        validationWarnings: [],
        interaction: null,
        interactionRaf: null,
        boxById: new Map(),
        undoByScene: new Map(),

        isActive() {
            return Dev.toolsEnabled && (Dev.activeTool === 'hotspots' || Dev.activeTool === 'trace');
        },

        cancelInteraction() {
            this.interaction = null;
            this.interactionRaf = null;
        },

        shouldBlockGameplay() {
            return this.isActive() && this.lockGameplay;
        },

        pushUndoSnapshot(sceneId, patchSnapshot) {
            if (!sceneId || !patchSnapshot) return;
            const stack = this.undoByScene.get(sceneId) || [];
            stack.push({ ops: Array.isArray(patchSnapshot.ops) ? [...patchSnapshot.ops] : [] });
            while (stack.length > 50) stack.shift();
            this.undoByScene.set(sceneId, stack);
        },

        undoLastOp() {
            const sceneId = gameState.currentSceneId;
            const stack = this.undoByScene.get(sceneId) || [];
            if (!stack.length) return;
            const prevPatch = stack.pop();
            this.undoByScene.set(sceneId, stack);
            this.setScenePatch(sceneId, prevPatch);
            sceneRenderer.refreshCurrentHotspots();
            this.render();
        },

        makeAutoId(sceneId) {
            const normalizedSceneId = sceneId || gameState.currentSceneId || 'SCENE';
            const prefix = `${normalizedSceneId}_hs_`;
            const hotspots = this.getCurrentHotspots();
            let max = 0;
            hotspots.forEach((hotspot) => {
                const id = hotspot?.id || '';
                if (!id.startsWith(prefix)) return;
                const value = Number.parseInt(id.slice(prefix.length), 10);
                if (Number.isFinite(value) && value > max) max = value;
            });
            return `${prefix}${String(max + 1).padStart(2, '0')}`;
        },

        loadAllPatches() {
            try {
                const raw = localStorage.getItem(Dev.storageKeys.patches);
                return raw ? JSON.parse(raw) : {};
            } catch (error) {
                errorLogger.log('dev-hotspot-load-patches', error);
                return {};
            }
        },

        saveAllPatches(patches) {
            localStorage.setItem(Dev.storageKeys.patches, JSON.stringify(patches));
        },

        getScenePatch(sceneId) {
            const builtinOps = (BUILTIN_HOTSPOT_PATCHES[sceneId] && BUILTIN_HOTSPOT_PATCHES[sceneId].ops) || [];
            const patches = this.loadAllPatches();
            const localOps = (patches[sceneId] && patches[sceneId].ops) || [];
            return { ops: [...builtinOps, ...localOps] };
        },

        setScenePatch(sceneId, patch) {
            const patches = this.loadAllPatches();
            patches[sceneId] = { ops: Array.isArray(patch.ops) ? patch.ops : [] };
            this.saveAllPatches(patches);
        },

        getRuntimeHotspots(sceneId, baseHotspots = []) {
            const patch = this.getScenePatch(sceneId);
            return this.applyOps(baseHotspots, patch.ops || []);
        },

        applyOps(baseHotspots = [], ops = []) {
            const byId = new Map((baseHotspots || []).map(h => [h.id, { ...h }]));

            (ops || []).forEach(op => {
                if (!op || !op.op) return;
                if (op.op === 'delete' && op.id) {
                    byId.delete(op.id);
                }
                if (op.op === 'upsert' && op.hotspot?.id) {
                    const incoming = op.hotspot;
                    const prev = byId.get(incoming.id) || { id: incoming.id, coordSystem: 'native' };
                    byId.set(incoming.id, {
                        ...prev,
                        id: incoming.id,
                        x: Number.isFinite(incoming.x) ? incoming.x : prev.x,
                        y: Number.isFinite(incoming.y) ? incoming.y : prev.y,
                        width: Number.isFinite(incoming.w) ? incoming.w : prev.width,
                        height: Number.isFinite(incoming.h) ? incoming.h : prev.height,
                        type: incoming.type ?? prev.type,
                        target: incoming.target ?? prev.target,
                        z: Number.isFinite(incoming.z) ? incoming.z : prev.z,
                        coordSystem: 'native'
                    });
                }
            });

            return Array.from(byId.values()).sort((a, b) => (a.z || 0) - (b.z || 0));
        },

        upsertHotspot(sceneId, hotspotData) {
            if (!sceneId || !hotspotData?.id) return;
            const patch = this.getScenePatch(sceneId);
            const ops = (patch.ops || []).filter(op => !(op.op === 'upsert' && op.hotspot?.id === hotspotData.id) && !(op.op === 'delete' && op.id === hotspotData.id));
            ops.push({ op: 'upsert', hotspot: hotspotData });
            this.setScenePatch(sceneId, { ops });
        },

        deleteHotspot(sceneId, id) {
            if (!sceneId || !id) return;
            const patch = this.getScenePatch(sceneId);
            const ops = (patch.ops || []).filter(op => !(op.op === 'upsert' && op.hotspot?.id === id) && !(op.op === 'delete' && op.id === id));
            ops.push({ op: 'delete', id });
            this.setScenePatch(sceneId, { ops });
        },

        ensureOverlayEl() {
            if (this.overlayEl && this.overlayEl.isConnected) return this.overlayEl;
            const container = document.getElementById('scene-container');
            if (!container) return null;
            const el = document.createElement('div');
            el.id = 'dev-hotspot-editor-layer';
            container.appendChild(el);
            this.overlayEl = el;
            this.bindOverlayEvents();
            return el;
        },

        ensureBox(hotspotId) {
            let box = this.boxById.get(hotspotId);
            if (box && box.isConnected) return box;
            const overlay = this.ensureOverlayEl();
            if (!overlay) return null;

            box = document.createElement('div');
            box.className = 'dev-hotspot-box';
            box.dataset.hotspotId = hotspotId;

            const label = document.createElement('span');
            label.className = 'dev-hotspot-label';
            box.appendChild(label);

            ['nw', 'ne', 'sw', 'se'].forEach((corner) => {
                const handle = document.createElement('span');
                handle.className = 'dev-hotspot-handle';
                handle.dataset.corner = corner;
                box.appendChild(handle);
            });

            overlay.appendChild(box);
            this.boxById.set(hotspotId, box);
            return box;
        },

        removeStaleBoxes(activeIds) {
            this.boxById.forEach((box, hotspotId) => {
                if (activeIds.has(hotspotId)) return;
                box.remove();
                this.boxById.delete(hotspotId);
            });
        },

        ensurePanel() {
            if (this.panelEl && this.panelEl.isConnected) return this.panelEl;
            const hubPanel = document.getElementById('devHubPanel');
            if (!hubPanel) return null;
            const panel = document.createElement('div');
            panel.id = 'devHotspotPanel';
            panel.className = 'dev-trace-panel hidden';
            panel.innerHTML = `
                <h3>Hotspot Editor</h3>
                <div class="dev-hotspot-actions">
                    <button type="button" id="dev-export-patch" class="dev-hub-btn">Export Patch JSON</button>
                    <button type="button" id="dev-export-report" class="dev-hub-btn">Export Fix Report</button>
                    <button type="button" id="dev-undo-hotspot" class="dev-hub-btn">Undo Last Op</button>
                </div>
                <div class="dev-hotspot-toggles">
                    <label><input type="checkbox" id="dev-lock-gameplay" checked> Lock gameplay while editing</label>
                    <label><input type="checkbox" id="dev-auto-id" checked> Auto-ID new hotspots</label>
                    <label><input type="checkbox" id="dev-snap-toggle" checked> Snap to grid</label>
                    <label>Grid size <input type="number" id="dev-grid-size" min="1" max="128" value="8"></label>
                </div>
                <div id="devHotspotMeta"></div>
                <ul id="devHotspotWarnings"></ul>
            `;
            const footer = hubPanel.querySelector('.dev-hub-footer');
            hubPanel.insertBefore(panel, footer);
            this.panelEl = panel;
            panel.querySelector('#dev-export-patch').addEventListener('click', () => this.exportPatchJSON());
            panel.querySelector('#dev-export-report').addEventListener('click', () => this.exportFixReport());
            panel.querySelector('#dev-undo-hotspot').addEventListener('click', () => this.undoLastOp());
            panel.querySelector('#dev-lock-gameplay').addEventListener('change', (event) => {
                this.lockGameplay = event.target.checked;
                this.render();
            });
            panel.querySelector('#dev-auto-id').addEventListener('change', (event) => {
                this.autoIdEnabled = event.target.checked;
            });
            panel.querySelector('#dev-snap-toggle').addEventListener('change', (event) => {
                this.snapEnabled = event.target.checked;
                this.render();
            });
            panel.querySelector('#dev-grid-size').addEventListener('change', (event) => {
                const next = Math.max(1, Math.min(128, Number.parseInt(event.target.value, 10) || 8));
                this.snapSize = next;
                event.target.value = String(next);
                this.render();
            });
            return panel;
        },

        mapClientToScene(clientX, clientY) {
            return Dev.trace.mapClientToScene(clientX, clientY);
        },

        snap(value) {
            if (!this.snapEnabled) return value;
            return Math.round(value / this.snapSize) * this.snapSize;
        },

        clampRect(rect) {
            const x1 = Math.max(0, Math.min(positioningSystem.REF_WIDTH, rect.x));
            const y1 = Math.max(0, Math.min(positioningSystem.REF_HEIGHT, rect.y));
            const x2 = Math.max(0, Math.min(positioningSystem.REF_WIDTH, rect.x + rect.w));
            const y2 = Math.max(0, Math.min(positioningSystem.REF_HEIGHT, rect.y + rect.h));
            return {
                x: Math.round(Math.min(x1, x2)),
                y: Math.round(Math.min(y1, y2)),
                w: Math.round(Math.abs(x2 - x1)),
                h: Math.round(Math.abs(y2 - y1))
            };
        },

        toPatchShape(hotspot) {
            return {
                id: hotspot.id,
                x: Math.round(hotspot.x || 0),
                y: Math.round(hotspot.y || 0),
                w: Math.round(hotspot.width || 0),
                h: Math.round(hotspot.height || 0),
                type: hotspot.type || 'scene',
                target: hotspot.target || '',
                z: Number.isFinite(hotspot.z) ? hotspot.z : 0
            };
        },

        getCurrentHotspots() {
            return sceneRenderer.currentHotspots || [];
        },

        getById(id) {
            return this.getCurrentHotspots().find(h => h.id === id);
        },

        bindOverlayEvents() {
            const overlay = this.ensureOverlayEl();
            if (!overlay || overlay.dataset.bound === 'true') return;
            overlay.dataset.bound = 'true';

            overlay.addEventListener('pointerdown', (event) => {
                if (!this.isActive()) return;
                if (event.button !== 0) return;
                const point = this.mapClientToScene(event.clientX, event.clientY);
                if (!point) return;
                overlay.setPointerCapture(event.pointerId);
                const handle = event.target.closest('.dev-hotspot-handle');
                const box = event.target.closest('.dev-hotspot-box');

                if (handle && box) {
                    this.selectedId = box.dataset.hotspotId;
                    this.interaction = { mode: 'resize', corner: handle.dataset.corner, start: point, original: this.toPatchShape(this.getById(this.selectedId) || {}) };
                    this.render();
                    return;
                }

                if (box) {
                    this.selectedId = box.dataset.hotspotId;
                    this.interaction = { mode: 'move', start: point, original: this.toPatchShape(this.getById(this.selectedId) || {}) };
                    this.render();
                    return;
                }

                if (event.shiftKey) {
                    const newId = this.autoIdEnabled ? this.makeAutoId(gameState.currentSceneId) : `dev_hs_${Date.now()}`;
                    this.selectedId = newId;
                    this.interaction = { mode: 'create', start: point, newId };
                } else {
                    this.selectedId = null;
                    this.interaction = null;
                }
                event.preventDefault();
                this.render();
            });

            overlay.addEventListener('pointermove', (event) => {
                if (!this.isActive() || !this.interaction) return;
                this.interaction.latestClientX = event.clientX;
                this.interaction.latestClientY = event.clientY;
                if (this.interactionRaf) {
                    event.preventDefault();
                    return;
                }

                this.interactionRaf = requestAnimationFrame(() => {
                    this.interactionRaf = null;
                    if (!this.isActive() || !this.interaction) return;
                    const point = this.mapClientToScene(this.interaction.latestClientX, this.interaction.latestClientY);
                    if (!point) return;
                    const sceneId = gameState.currentSceneId;
                    const interaction = this.interaction;
                    if (!interaction.initialPatch) {
                        interaction.initialPatch = this.getScenePatch(sceneId);
                    }
                    let rect;

                    if (interaction.mode === 'create') {
                        rect = this.clampRect({
                            x: this.snap(interaction.start.x),
                            y: this.snap(interaction.start.y),
                            w: this.snap(point.x) - this.snap(interaction.start.x),
                            h: this.snap(point.y) - this.snap(interaction.start.y)
                        });
                        this.upsertHotspot(sceneId, { id: interaction.newId, ...rect, type: 'scene', target: '', z: 0 });
                    }

                    if (interaction.mode === 'move') {
                        const dx = this.snap(point.x - interaction.start.x);
                        const dy = this.snap(point.y - interaction.start.y);
                        rect = this.clampRect({ x: interaction.original.x + dx, y: interaction.original.y + dy, w: interaction.original.w, h: interaction.original.h });
                        this.upsertHotspot(sceneId, { ...interaction.original, ...rect });
                    }

                    if (interaction.mode === 'resize') {
                        const orig = interaction.original;
                        let x = orig.x;
                        let y = orig.y;
                        let w = orig.w;
                        let h = orig.h;
                        const px = this.snap(point.x);
                        const py = this.snap(point.y);
                        if (interaction.corner.includes('n')) {
                            h = (orig.y + orig.h) - py;
                            y = py;
                        }
                        if (interaction.corner.includes('s')) {
                            h = py - orig.y;
                        }
                        if (interaction.corner.includes('w')) {
                            w = (orig.x + orig.w) - px;
                            x = px;
                        }
                        if (interaction.corner.includes('e')) {
                            w = px - orig.x;
                        }
                        rect = this.clampRect({ x, y, w, h });
                        this.upsertHotspot(sceneId, { ...orig, ...rect });
                    }

                    sceneRenderer.refreshCurrentHotspots({ reapplyTools: false });
                    this.render(true);
                });
                event.preventDefault();
            });

            overlay.addEventListener('pointerup', (event) => {
                const interaction = this.interaction;
                if (interaction?.initialPatch) {
                    const sceneId = gameState.currentSceneId;
                    const latestPatch = this.getScenePatch(sceneId);
                    if (JSON.stringify(interaction.initialPatch) !== JSON.stringify(latestPatch)) {
                        this.pushUndoSnapshot(sceneId, interaction.initialPatch);
                    }
                }
                this.interaction = null;
                this.interactionRaf = null;
                if (overlay.hasPointerCapture(event.pointerId)) {
                    overlay.releasePointerCapture(event.pointerId);
                }
            });

            overlay.addEventListener('pointercancel', (event) => {
                this.interaction = null;
                this.interactionRaf = null;
                if (overlay.hasPointerCapture(event.pointerId)) {
                    overlay.releasePointerCapture(event.pointerId);
                }
            });
        },

        render(skipPanelUpdate = false) {
            const overlay = this.ensureOverlayEl();
            const panel = this.ensurePanel();
            if (!overlay || !panel) return;

            const active = this.isActive();
            overlay.classList.toggle('active', active);
            overlay.classList.toggle('allow-click-through', active && !this.lockGameplay);
            panel.classList.toggle('hidden', !active);
            if (!active) {
                this.removeStaleBoxes(new Set());
                return;
            }

            const lockToggle = panel.querySelector('#dev-lock-gameplay');
            const autoIdToggle = panel.querySelector('#dev-auto-id');
            const snapToggle = panel.querySelector('#dev-snap-toggle');
            const gridInput = panel.querySelector('#dev-grid-size');
            if (lockToggle) lockToggle.checked = this.lockGameplay;
            if (autoIdToggle) autoIdToggle.checked = this.autoIdEnabled;
            if (snapToggle) snapToggle.checked = this.snapEnabled;
            if (gridInput) gridInput.value = String(this.snapSize);

            const hotspots = this.getCurrentHotspots();
            const activeIds = new Set();
            hotspots.forEach(hotspot => {
                activeIds.add(hotspot.id);
                const pos = positioningSystem.calculateHotspotPosition(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
                const box = this.ensureBox(hotspot.id);
                if (!box) return;
                if (hotspot.id === this.selectedId) box.classList.add('selected');
                else box.classList.remove('selected');
                box.style.left = pos.left;
                box.style.top = pos.top;
                box.style.width = pos.width;
                box.style.height = pos.height;
                box.dataset.hotspotId = hotspot.id;
                const label = box.querySelector('.dev-hotspot-label');
                if (label) label.textContent = hotspot.id;
            });
            this.removeStaleBoxes(activeIds);

            if (skipPanelUpdate) return;

            const validation = this.validateScene(gameState.currentSceneId, hotspots);
            this.validationWarnings = validation.warnings;
            const meta = panel.querySelector('#devHotspotMeta');
            const undoCount = (this.undoByScene.get(gameState.currentSceneId) || []).length;
            meta.textContent = `Scene: ${gameState.currentSceneId} | Hotspots: ${hotspots.length} | Snap: ${this.snapEnabled ? `ON (${this.snapSize}px)` : 'OFF'} | Gameplay lock: ${this.lockGameplay ? 'ON' : 'OFF'} | Undo: ${undoCount}`;
            const warningsEl = panel.querySelector('#devHotspotWarnings');
            warningsEl.innerHTML = '';
            validation.warnings.forEach(w => {
                const li = document.createElement('li');
                li.textContent = w;
                warningsEl.appendChild(li);
            });
            if (!validation.warnings.length) {
                const li = document.createElement('li');
                li.textContent = 'No validation warnings.';
                warningsEl.appendChild(li);
            }
        },

        validateScene(sceneId, hotspots) {
            const warnings = [];
            const overlaps = [];
            const outOfBounds = [];
            let zeroSize = 0;
            let invalidTargets = 0;

            const nativeRects = hotspots.map(h => {
                const rect = { id: h.id, x: h.x || 0, y: h.y || 0, w: h.width || 0, h: h.height || 0, target: h.target };
                if (rect.w <= 0 || rect.h <= 0) zeroSize += 1;
                if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > positioningSystem.REF_WIDTH || rect.y + rect.h > positioningSystem.REF_HEIGHT) {
                    outOfBounds.push(rect.id);
                }
                if (rect.target && !SCENES[rect.target]) {
                    invalidTargets += 1;
                    warnings.push(`Invalid target sceneId on ${rect.id}: ${rect.target}`);
                }
                return rect;
            });

            for (let i = 0; i < nativeRects.length; i += 1) {
                for (let j = i + 1; j < nativeRects.length; j += 1) {
                    const a = nativeRects[i];
                    const b = nativeRects[j];
                    const intersects = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
                    if (intersects) overlaps.push(`${a.id} ↔ ${b.id}`);
                }
            }

            if (zeroSize) warnings.push(`Zero-size hotspots: ${zeroSize}`);
            if (outOfBounds.length) warnings.push(`Out-of-bounds hotspots: ${outOfBounds.join(', ')}`);
            if (overlaps.length) warnings.push(`Overlaps: ${overlaps.join(', ')}`);

            return { sceneId, warnings, overlaps, outOfBounds, zeroSize, invalidTargets };
        },

        async copyText(value) {
            try {
                await navigator.clipboard.writeText(value);
                return true;
            } catch (_error) {
                return false;
            }
        },

        downloadText(filename, text, type = 'text/plain') {
            const blob = new Blob([text], { type });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(a.href);
        },

        async exportPatchJSON() {
            const sceneId = gameState.currentSceneId;
            const patch = this.getScenePatch(sceneId);
            const text = JSON.stringify({ [sceneId]: patch }, null, 2);
            const copied = await this.copyText(text);
            if (!copied) this.downloadText(`${sceneId}.patch.json`, text, 'application/json');
        },

        async exportFixReport() {
            const sceneId = gameState.currentSceneId;
            const report = this.buildFixReport(sceneId);
            const copied = await this.copyText(report);
            if (!copied) this.downloadText(`${sceneId}.fix-report.txt`, report, 'text/plain');
        },

        buildFixReport(sceneId) {
            const base = SCENES[sceneId]?.hotspots || [];
            const patched = this.getCurrentHotspots();
            const baseMap = new Map(base.map(h => [h.id, h]));
            const addedIds = [];
            const editedIds = [];

            patched.forEach(h => {
                const prev = baseMap.get(h.id);
                if (!prev) {
                    addedIds.push(h.id);
                    return;
                }
                if (prev.x !== h.x || prev.y !== h.y || prev.width !== h.width || prev.height !== h.height || (prev.target || '') !== (h.target || '')) {
                    editedIds.push(h.id);
                }
                baseMap.delete(h.id);
            });

            const deletedIds = Array.from(baseMap.keys());
            const check = this.validateScene(sceneId, patched);
            const layoutSnapshot = Dev.layout.loadLayouts();

            const actions = [];
            if (check.invalidTargets > 0) actions.push('- Fix invalid target sceneIds (they break navigation).');
            if (check.zeroSize > 0) actions.push('- Resize zero-size hotspots to clickable sizes.');
            if (check.outOfBounds.length > 0) actions.push('- Move out-of-bounds hotspots back inside the reference frame.');
            if (check.overlaps.length > 0) actions.push('- Resolve overlapping hotspots or set clear z-order ownership.');
            if (!actions.length) actions.push('- No blocking issues detected. You can ship this patch.');

            return [
                `=== Hotspot Fix Report ===`,
                `sceneId: ${sceneId}`,
                `generatedAt: ${new Date().toISOString()}`,
                '',
                'Summary:',
                `- added hotspots: ${addedIds.length}${addedIds.length ? ` (${addedIds.join(', ')})` : ''}`,
                `- edited hotspots: ${editedIds.length}${editedIds.length ? ` (${editedIds.join(', ')})` : ''}`,
                `- deleted hotspots: ${deletedIds.length}${deletedIds.length ? ` (${deletedIds.join(', ')})` : ''}`,
                '',
                'Validation:',
                `- invalid targets: ${check.invalidTargets}`,
                `- overlaps: ${check.overlaps.length}`,
                `- out-of-bounds: ${check.outOfBounds.length}`,
                `- zero-size: ${check.zeroSize}`,
                ...(check.warnings.length ? check.warnings.map(w => `  * ${w}`) : ['  * No validation warnings.']),
                '',
                'Actionable next steps:',
                ...actions,
                '',
                'Layout JSON:',
                JSON.stringify(layoutSnapshot, null, 2)
            ].join('\n');
        }
    },

    layout: {
        dragging: null,
        selectedPanelKey: null,
        listenersBound: false,
        moveRaf: null,

        panelConfigs: [
            { key: 'speech-bubble', selector: '[data-layout-panel="speech-bubble"]' },
            { key: 'narrative-box', selector: '[data-layout-panel="narrative-box"]' }
        ],

        isActive() {
            return Dev.toolsEnabled && Dev.activeTool === 'layout';
        },

        breakpointKey() {
            return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
        },

        loadLayouts() {
            try {
                const raw = localStorage.getItem(Dev.storageKeys.layouts);
                const parsed = raw ? JSON.parse(raw) : {};
                return { desktop: parsed.desktop || {}, mobile: parsed.mobile || {} };
            } catch (error) {
                errorLogger.log('dev-layout-load', error);
                return { desktop: {}, mobile: {} };
            }
        },

        saveLayouts(layouts) {
            localStorage.setItem(Dev.storageKeys.layouts, JSON.stringify(layouts));
        },

        getCurrentLayouts() {
            const all = this.loadLayouts();
            return all[this.breakpointKey()] || {};
        },

        setPanelLayout(panelKey, layout) {
            const all = this.loadLayouts();
            const bp = this.breakpointKey();
            all[bp] = all[bp] || {};
            all[bp][panelKey] = layout;
            this.saveLayouts(all);
        },

        applyLayoutToPanel(panel, layout) {
            const container = document.getElementById('scene-container');
            if (!container || !panel || !layout) return;
            panel.classList.add('dev-layout-target');
            panel.style.position = 'absolute';
            panel.style.left = `${Math.round(layout.left || 0)}px`;
            panel.style.top = `${Math.round(layout.top || 0)}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.transform = 'none';
            panel.style.margin = '0';
            if (layout.width) panel.style.width = `${Math.round(layout.width)}px`;
            if (layout.height) panel.style.height = `${Math.round(layout.height)}px`;
        },

        clearPanelLayout(panel) {
            if (!panel) return;
            panel.classList.remove('dev-layout-target');
            panel.style.position = '';
            panel.style.left = '';
            panel.style.top = '';
            panel.style.right = '';
            panel.style.bottom = '';
            panel.style.transform = '';
            panel.style.margin = '';
            panel.style.width = '';
            panel.style.height = '';
            const handle = panel.querySelector(':scope > .dev-layout-handle');
            if (handle) handle.remove();
        },

        applySavedLayouts() {
            if (!this.isActive()) return;
            const layouts = this.getCurrentLayouts();
            this.panelConfigs.forEach(config => {
                const panel = document.querySelector(config.selector);
                if (!panel) return;
                const saved = layouts[config.key];
                if (saved) this.applyLayoutToPanel(panel, saved);
                this.ensureHandle(panel);
            });
        },

        clearAllPanelLayouts() {
            this.panelConfigs.forEach(config => {
                const panel = document.querySelector(config.selector);
                if (panel) this.clearPanelLayout(panel);
            });
        },

        ensureHandle(panel) {
            if (!panel || panel.querySelector(':scope > .dev-layout-handle')) return;
            const handle = document.createElement('div');
            handle.className = 'dev-layout-handle';
            handle.textContent = 'Drag';
            panel.prepend(handle);

            ['e', 's', 'se'].forEach((direction) => {
                const resizeHandle = document.createElement('span');
                resizeHandle.className = 'dev-layout-resize-handle';
                resizeHandle.dataset.resize = direction;
                panel.appendChild(resizeHandle);
            });
        },

        clampPosition(panel, left, top) {
            const container = document.getElementById('scene-container');
            if (!container || !panel) return { left, top };
            const maxLeft = Math.max(0, container.clientWidth - panel.offsetWidth);
            const maxTop = Math.max(0, container.clientHeight - panel.offsetHeight);
            return {
                left: Math.min(maxLeft, Math.max(0, left)),
                top: Math.min(maxTop, Math.max(0, top))
            };
        },

        savePanelFromElement(panel) {
            const panelKey = panel?.dataset?.layoutPanel;
            if (!panelKey) return;
            const left = parseFloat(panel.style.left) || 0;
            const top = parseFloat(panel.style.top) || 0;
            this.setPanelLayout(panelKey, {
                left,
                top,
                width: panel.offsetWidth,
                height: panel.offsetHeight
            });
        },

        cancelDrag() {
            if (!this.dragging) return;
            const { panel } = this.dragging;
            panel.classList.remove('dev-layout-dragging');
            panel.classList.remove('dev-layout-resizing');
            panel.style.transform = 'none';
            this.dragging = null;
            this.moveRaf = null;
        },

        exportPatchJSON() {
            const layouts = this.loadLayouts();
            const sceneId = gameState.currentSceneId || 'global';
            const payload = {
                sceneId,
                generatedAt: new Date().toISOString(),
                layouts
            };
            const json = JSON.stringify(payload, null, 2);
            navigator.clipboard.writeText(json).then(() => {
                const status = document.getElementById('devHubStatus');
                if (status) status.textContent = `Layout JSON copied to clipboard (${json.length} chars)`;
            }).catch(() => {
                console.log('Layout export:\n' + json);
                const status = document.getElementById('devHubStatus');
                if (status) status.textContent = 'Layout JSON logged to console (clipboard failed)';
            });
            return json;
        },

        generateFixReport() {
            const layouts = this.loadLayouts();
            const container = document.getElementById('scene-container');
            const containerRect = container ? container.getBoundingClientRect() : { width: 1920, height: 1080 };
            const lines = [
                '=== Dialogue Layout Fix Report ===',
                `sceneId: ${gameState.currentSceneId || 'global'}`,
                `generatedAt: ${new Date().toISOString()}`,
                `viewport: ${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`,
                ''
            ];

            ['desktop', 'mobile'].forEach(bp => {
                const bpLayouts = layouts[bp] || {};
                const keys = Object.keys(bpLayouts);
                lines.push(`[${bp}] ${keys.length} panel(s) with overrides:`);
                keys.forEach(key => {
                    const l = bpLayouts[key];
                    const outOfBounds = (l.left < 0 || l.top < 0 ||
                        (l.left + (l.width || 0)) > containerRect.width ||
                        (l.top + (l.height || 0)) > containerRect.height);
                    lines.push(`  ${key}: left=${Math.round(l.left)} top=${Math.round(l.top)}` +
                        (l.width ? ` w=${Math.round(l.width)}` : '') +
                        (l.height ? ` h=${Math.round(l.height)}` : '') +
                        (outOfBounds ? ' ⚠️ OUT OF BOUNDS' : ' ✓'));
                });
                if (!keys.length) lines.push('  (no overrides)');
                lines.push('');
            });

            lines.push('Actionable CSS to hardcode these positions:');
            ['desktop', 'mobile'].forEach(bp => {
                const bpLayouts = layouts[bp] || {};
                Object.entries(bpLayouts).forEach(([key, l]) => {
                    const selector = this.panelConfigs.find(c => c.key === key)?.selector || `[data-layout-panel="${key}"]`;
                    const mediaWrap = bp === 'mobile' ? '@media (max-width: 768px) ' : '';
                    lines.push(`${mediaWrap}${selector} { left: ${Math.round(l.left)}px; top: ${Math.round(l.top)}px;` +
                        (l.width ? ` width: ${Math.round(l.width)}px;` : '') +
                        (l.height ? ` height: ${Math.round(l.height)}px;` : '') +
                        ' }');
                });
            });

            return lines.join('\n');
        },

        clampSize(panel, width, height, baseLeft = null, baseTop = null) {
            const container = document.getElementById('scene-container');
            if (!container || !panel) return { width, height };
            const minWidth = Math.max(120, Math.round(container.clientWidth * 0.12));
            const minHeight = Math.max(60, Math.round(container.clientHeight * 0.1));
            const left = Number.isFinite(baseLeft) ? baseLeft : (parseFloat(panel.style.left) || 0);
            const top = Number.isFinite(baseTop) ? baseTop : (parseFloat(panel.style.top) || 0);
            const maxWidth = Math.max(minWidth, container.clientWidth - left);
            const maxHeight = Math.max(minHeight, container.clientHeight - top);
            return {
                width: Math.min(maxWidth, Math.max(minWidth, width)),
                height: Math.min(maxHeight, Math.max(minHeight, height))
            };
        },

        handlePointerDown(event) {
            if (!this.isActive() || event.button !== 0) return;
            const panel = event.target.closest('[data-layout-panel]');
            if (!panel) return;
            const resizeDirection = event.target.closest('.dev-layout-resize-handle')?.dataset?.resize || null;
            const fromHandle = Boolean(event.target.closest('.dev-layout-handle'));
            if (!resizeDirection && !fromHandle && !event.altKey) return;
            const container = document.getElementById('scene-container');
            if (!container) return;
            const panelRect = panel.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const currentLeft = panelRect.left - containerRect.left;
            const currentTop = panelRect.top - containerRect.top;
            const start = this.clampPosition(panel, currentLeft, currentTop);
            const startSize = this.clampSize(panel, panelRect.width, panelRect.height, start.left, start.top);
            this.applyLayoutToPanel(panel, { left: start.left, top: start.top, width: startSize.width, height: startSize.height });
            this.ensureHandle(panel);
            panel.setPointerCapture?.(event.pointerId);
            this.dragging = {
                panel,
                panelKey: panel?.dataset?.layoutPanel || null,
                pointerId: event.pointerId,
                mode: resizeDirection ? 'resize' : 'move',
                resizeDirection,
                startX: event.clientX,
                startY: event.clientY,
                baseLeft: start.left,
                baseTop: start.top,
                baseWidth: startSize.width,
                baseHeight: startSize.height,
                previewLeft: start.left,
                previewTop: start.top,
                previewWidth: startSize.width,
                previewHeight: startSize.height
            };
            this.selectedPanelKey = this.dragging.panelKey;
            panel.classList.add(this.dragging.mode === 'resize' ? 'dev-layout-resizing' : 'dev-layout-dragging');
            panel.style.transform = 'translate3d(0px, 0px, 0px)';
            event.preventDefault();
        },

        handlePointerMove(event) {
            if (!this.dragging || !this.isActive()) return;
            this.dragging.latestClientX = event.clientX;
            this.dragging.latestClientY = event.clientY;
            if (this.moveRaf) {
                event.preventDefault();
                return;
            }
            this.moveRaf = requestAnimationFrame(() => {
                this.moveRaf = null;
                if (!this.dragging || !this.isActive()) return;
                const { panel, startX, startY, baseLeft, baseTop, baseWidth, baseHeight, mode, resizeDirection, latestClientX, latestClientY } = this.dragging;
                const deltaX = latestClientX - startX;
                const deltaY = latestClientY - startY;

                if (mode === 'move') {
                    const next = this.clampPosition(panel, baseLeft + deltaX, baseTop + deltaY);
                    this.dragging.previewLeft = next.left;
                    this.dragging.previewTop = next.top;
                    const moveX = next.left - baseLeft;
                    const moveY = next.top - baseTop;
                    panel.style.transform = `translate3d(${Math.round(moveX)}px, ${Math.round(moveY)}px, 0px)`;
                    const status = document.getElementById('devHubStatus');
                    if (status && this.dragging) {
                        const r = this.dragging.panel.getBoundingClientRect();
                        const c = document.getElementById('scene-container').getBoundingClientRect();
                        status.textContent = `${this.dragging.panelKey}: x=${Math.round(r.left - c.left)} y=${Math.round(r.top - c.top)} w=${Math.round(r.width)} h=${Math.round(r.height)}`;
                    }
                    return;
                }

                let width = baseWidth;
                let height = baseHeight;
                if (resizeDirection?.includes('e')) width = baseWidth + deltaX;
                if (resizeDirection?.includes('s')) height = baseHeight + deltaY;
                const clamped = this.clampSize(panel, width, height, baseLeft, baseTop);
                this.dragging.previewWidth = clamped.width;
                this.dragging.previewHeight = clamped.height;
                panel.style.width = `${Math.round(clamped.width)}px`;
                panel.style.height = `${Math.round(clamped.height)}px`;
                const status = document.getElementById('devHubStatus');
                if (status && this.dragging) {
                    const r = this.dragging.panel.getBoundingClientRect();
                    const c = document.getElementById('scene-container').getBoundingClientRect();
                    status.textContent = `${this.dragging.panelKey}: x=${Math.round(r.left - c.left)} y=${Math.round(r.top - c.top)} w=${Math.round(r.width)} h=${Math.round(r.height)}`;
                }
            });
            event.preventDefault();
        },

        handlePointerUp(event) {
            if (!this.dragging) return;
            const { panel, previewLeft, previewTop, previewWidth, previewHeight, mode, pointerId } = this.dragging;
            panel.classList.remove('dev-layout-dragging');
            panel.classList.remove('dev-layout-resizing');
            panel.style.transform = 'none';
            if (event && Number.isFinite(pointerId) && panel.hasPointerCapture?.(pointerId)) {
                panel.releasePointerCapture(pointerId);
            }
            this.applyLayoutToPanel(panel, {
                left: previewLeft,
                top: previewTop,
                width: previewWidth,
                height: previewHeight
            });
            this.ensureHandle(panel);
            this.savePanelFromElement(panel);
            this.dragging = null;
            this.moveRaf = null;
        },

        resetLayouts() {
            const all = this.loadLayouts();
            all[this.breakpointKey()] = {};
            this.saveLayouts(all);
            this.clearAllPanelLayouts();
        },


        resetCurrentPanel() {
            if (!this.selectedPanelKey) return;
            const all = this.loadLayouts();
            const bp = this.breakpointKey();
            if (all[bp] && all[bp][this.selectedPanelKey]) {
                delete all[bp][this.selectedPanelKey];
                this.saveLayouts(all);
            }
            const panel = document.querySelector(`[data-layout-panel="${this.selectedPanelKey}"]`);
            if (panel) this.clearPanelLayout(panel);
        },

        snapPanelsToSafeMargins() {
            const container = document.getElementById('scene-container');
            if (!container) return;
            const safeMargin = Math.round(Math.min(container.clientWidth, container.clientHeight) * 0.05);

            this.panelConfigs.forEach((config) => {
                const panel = document.querySelector(config.selector);
                if (!panel) return;
                const rect = panel.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const currentLeft = rect.left - containerRect.left;
                const currentTop = rect.top - containerRect.top;
                const maxLeft = Math.max(0, container.clientWidth - panel.offsetWidth);
                const maxTop = Math.max(0, container.clientHeight - panel.offsetHeight);
                const rightGap = container.clientWidth - (currentLeft + panel.offsetWidth);
                const bottomGap = container.clientHeight - (currentTop + panel.offsetHeight);

                let nextLeft = currentLeft;
                let nextTop = currentTop;

                if (currentLeft < safeMargin) nextLeft = safeMargin;
                else if (rightGap < safeMargin) nextLeft = maxLeft - safeMargin;

                if (currentTop < safeMargin) nextTop = safeMargin;
                else if (bottomGap < safeMargin) nextTop = maxTop - safeMargin;

                const clamped = this.clampPosition(panel, nextLeft, nextTop);
                this.applyLayoutToPanel(panel, { left: clamped.left, top: clamped.top });
                this.ensureHandle(panel);
                this.savePanelFromElement(panel);
            });
        },

        ensurePanel() {
            const hubPanel = document.getElementById('devHubPanel');
            if (!hubPanel || document.getElementById('devLayoutPanel')) return;
            const panel = document.createElement('section');
            panel.id = 'devLayoutPanel';
            panel.className = 'dev-trace-panel hidden';
            panel.innerHTML = `
                <h3>UI Layout Editor</h3>
                <div class="dev-hotspot-actions">
                    <button type="button" id="dev-export-layout" class="dev-hub-btn">Export Layout JSON</button>
                    <button type="button" id="dev-layout-report" class="dev-hub-btn">Layout Fix Report</button>
                    <button type="button" id="dev-reset-layout" class="dev-hub-btn">Reset Layout</button>
                    <button type="button" id="dev-snap-safe-margins" class="dev-hub-btn">Snap To Safe Margins</button>
                    <button type="button" id="dev-reset-current-panel" class="dev-hub-btn">Reset Current Panel</button>
                </div>
                <p>Drag with the top strip (or hold <strong>Alt</strong> and drag any panel area). Resize with the cyan edge/corner grips.</p>
            `;
            const footer = hubPanel.querySelector('.dev-hub-footer');
            hubPanel.insertBefore(panel, footer);
            document.getElementById('dev-export-layout')?.addEventListener('click', () => Dev.layout.exportPatchJSON());
            document.getElementById('dev-layout-report')?.addEventListener('click', () => {
                const report = Dev.layout.generateFixReport();
                const output = document.getElementById('dev-validation-output');
                if (output) output.textContent = report;
                navigator.clipboard.writeText(report).catch(() => {});
            });
            panel.querySelector('#dev-reset-layout').addEventListener('click', () => this.resetLayouts());
            panel.querySelector('#dev-snap-safe-margins').addEventListener('click', () => this.snapPanelsToSafeMargins());
            panel.querySelector('#dev-reset-current-panel').addEventListener('click', () => this.resetCurrentPanel());
        },

        render() {
            const panel = document.getElementById('devLayoutPanel');
            if (panel) {
                panel.classList.toggle('hidden', !this.isActive());
            }
            if (this.isActive()) {
                this.applySavedLayouts();
            } else {
                this.cancelDrag();
                this.clearAllPanelLayouts();
            }
        },

        init() {
            if (this.listenersBound) return;
            this.listenersBound = true;
            document.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
            document.addEventListener('pointermove', (event) => this.handlePointerMove(event));
            document.addEventListener('pointerup', (event) => this.handlePointerUp(event));
            document.addEventListener('pointercancel', (event) => this.handlePointerUp(event));
        }
    },

    bubbleSlots: {
        _overlayEls: null,

        isActive() {
            return Dev.toolsEnabled && (Dev.activeTool === 'layout' || Dev.activeTool === 'bubbleSlots');
        },

        _ensureOverlayEls() {
            const container = document.getElementById('scene-container');
            if (!container) return null;
            if (this._overlayEls && this._overlayEls.every(el => el.isConnected)) return this._overlayEls;
            if (this._overlayEls) {
                this._overlayEls.forEach(el => el.remove());
            }
            const slots = sceneRenderer.DEFAULT_SPEECH_BUBBLE_SLOTS;
            this._overlayEls = Object.entries(slots).map(([zone]) => {
                const el = document.createElement('div');
                el.className = 'dev-bubble-slot-overlay';
                el.dataset.bubbleSlot = zone;
                const label = document.createElement('span');
                label.className = 'dev-bubble-slot-label';
                label.textContent = zone;
                el.appendChild(label);
                container.appendChild(el);
                return el;
            });
            return this._overlayEls;
        },

        render() {
            if (!this.isActive()) {
                if (this._overlayEls) {
                    this._overlayEls.forEach(el => el.remove());
                    this._overlayEls = null;
                }
                return;
            }
            const els = this._ensureOverlayEls();
            if (!els) return;
            const slotEntries = Object.entries(sceneRenderer.DEFAULT_SPEECH_BUBBLE_SLOTS);
            els.forEach((el, i) => {
                const [, rect] = slotEntries[i];
                const pos = positioningSystem.calculateHotspotPosition(rect.left, rect.top, rect.width, rect.height);
                el.style.left = pos.left;
                el.style.top = pos.top;
                el.style.width = pos.width;
                el.style.height = pos.height;
            });
        }
    },

    listenersBound: false,

    syncSession() {
        this.session.enabled = this.enabled;
        this.session.toolsEnabled = this.toolsEnabled;
        this.session.activeTool = this.activeTool;
    },

    init() {
        this.enabled = localStorage.getItem(this.storageKeys.enabled) === 'true';
        this.toolsEnabled = localStorage.getItem(this.storageKeys.toolsEnabled) === 'true';
        this.activeTool = localStorage.getItem(this.storageKeys.activeTool) || null;
        this.syncSession();

        const modal = document.getElementById('devHubModal');
        const toggle = document.getElementById('dev-tools-enabled-toggle');
        const closeBtn = document.getElementById('btn-close-dev-hub');
        const exitBtn = document.getElementById('btn-exit-dev-mode');
        const floatingButton = document.getElementById('dev-floating-btn');
        const runValidateBtn = document.getElementById('dev-run-validate-now');
        const validateAllBtn = document.getElementById('dev-validate-all-scenes');
        const downloadValidationJsonBtn = document.getElementById('dev-download-validation-json');
        const jumpInput = document.getElementById('dev-scene-jump-input');
        const jumpBtn = document.getElementById('dev-scene-jump-btn');

        if (!modal || !toggle || !closeBtn || !exitBtn || !floatingButton) return;

        toggle.checked = this.toolsEnabled;

        // FPS counter — only active in dev mode
        if (Dev.enabled && !document.getElementById('dev-fps')) {
            let frameCount = 0;
            let lastFpsTime = performance.now();
            const fpsEl = document.createElement('div');
            fpsEl.id = 'dev-fps';
            fpsEl.style.cssText = 'position:fixed;top:4px;left:4px;z-index:13000;color:#0f0;font:12px monospace;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;pointer-events:none;';
            document.body.appendChild(fpsEl);

            const updateFps = () => {
                frameCount++;
                const now = performance.now();
                if (now - lastFpsTime >= 1000) {
                    fpsEl.textContent = `${frameCount} FPS`;
                    frameCount = 0;
                    lastFpsTime = now;
                }
                if (Dev.enabled) requestAnimationFrame(updateFps);
            };
            requestAnimationFrame(updateFps);
        }

        if (!this.listenersBound) {
            this.listenersBound = true;

            modal.addEventListener('click', (event) => {
                if (event.target.dataset.devClose === 'true') {
                    this.closeHub();
                }
            });

            toggle.addEventListener('change', (event) => {
                SFXGenerator.playButtonClick();
                this.setToolsEnabled(event.target.checked);
            });

            closeBtn.addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                this.closeHub();
            });

            exitBtn.addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                this.setEnabled(false);
                this.setToolsEnabled(false);
                this.setActiveTool(null);
                this.closeHub();
            });

            floatingButton.addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                this.openHub();
            });

            if (runValidateBtn) {
                runValidateBtn.addEventListener('click', () => {
                    SFXGenerator.playButtonClick();
                    this.runValidationNow();
                });
            }

            if (validateAllBtn) {
                validateAllBtn.addEventListener('click', () => {
                    SFXGenerator.playButtonClick();
                    this.runDemoValidationAll();
                });
            }

            if (downloadValidationJsonBtn) {
                downloadValidationJsonBtn.addEventListener('click', () => {
                    SFXGenerator.playButtonClick();
                    if (!demoValidator.lastReport) {
                        const output = document.getElementById('dev-validation-output');
                        if (output) output.textContent = 'Run "Validate All Scenes" first — no report to download yet.';
                        return;
                    }
                    const text = JSON.stringify(demoValidator.lastReport, null, 2);
                    this.hotspots.downloadText('demo-validation-report.json', text, 'application/json');
                });
            }

            const performJump = () => {
                const sceneId = jumpInput?.value?.trim();
                if (!sceneId || !SCENES[sceneId]) return;
                sceneRenderer.loadScene(sceneId);
                this.updateStatus();
            };
            if (jumpBtn) {
                jumpBtn.addEventListener('click', () => {
                    SFXGenerator.playButtonClick();
                    performJump();
                });
            }
            if (jumpInput) {
                jumpInput.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    performJump();
                });
            }

            modal.querySelectorAll('[data-dev-action]').forEach(button => {
                button.addEventListener('click', (event) => {
                    SFXGenerator.playButtonClick();
                    if (event.currentTarget.dataset.devAction === 'click-trace') {
                        this.setActiveTool('trace');
                    }
                    if (event.currentTarget.dataset.devAction === 'hotspot-editor') {
                        this.setActiveTool('hotspots');
                    }
                    if (event.currentTarget.dataset.devAction === 'ui-layout-editor') {
                        this.setActiveTool('layout');
                    }
                    if (event.currentTarget.dataset.devAction === 'bubble-slots-overlay') {
                        this.setActiveTool('bubbleSlots');
                    }
                    if (event.currentTarget.dataset.devAction === 'validate') {
                        this.runValidationNow();
                    }
                    if (event.currentTarget.dataset.devAction === 'export') {
                        this.hotspots.exportFixReport();
                    }
                    if (event.currentTarget.dataset.devAction === 'clear-dev-storage') {
                        localStorage.removeItem(this.storageKeys.patches);
                        localStorage.removeItem(this.storageKeys.layouts);
                        this.hotspots.undoByScene.clear();
                        sceneRenderer.refreshCurrentHotspots();
                        this.layout.resetLayouts();
                    }
                    this.updateStatus();
                });
            });

            document.addEventListener('keydown', (event) => {
                const isTyping = event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable);
                if (isTyping) return;
                if (event.key === 'F2') {
                    event.preventDefault();
                    if (modal.classList.contains('hidden')) {
                        this.openHub();
                    } else {
                        this.closeHub();
                    }
                    return;
                }
                if (event.key === 'Escape' && event.shiftKey) {
                    event.preventDefault();
                    this.setToolsEnabled(false);
                    this.setActiveTool(null);
                    this.updateStatus();
                    return;
                }
                if (event.key.toLowerCase() === 't') {
                    this.setActiveTool('trace');
                    this.updateStatus();
                }
                if (event.key.toLowerCase() === 'g' && this.hotspots.isActive()) {
                    event.preventDefault();
                    this.hotspots.snapEnabled = !this.hotspots.snapEnabled;
                    this.hotspots.render();
                }
                if (event.key.toLowerCase() === 'd' && event.ctrlKey && this.hotspots.isActive() && this.hotspots.selectedId) {
                    event.preventDefault();
                    const source = this.hotspots.getById(this.hotspots.selectedId);
                    if (source) {
                        const clone = this.hotspots.toPatchShape(source);
                        clone.id = `${clone.id}_copy_${Date.now()}`;
                        clone.x += this.hotspots.snapSize;
                        clone.y += this.hotspots.snapSize;
                        this.hotspots.pushUndoSnapshot(gameState.currentSceneId, this.hotspots.getScenePatch(gameState.currentSceneId));
                        this.hotspots.upsertHotspot(gameState.currentSceneId, clone);
                        this.hotspots.selectedId = clone.id;
                        sceneRenderer.refreshCurrentHotspots();
                        this.hotspots.render();
                    }
                }
                if (event.key === 'Delete' && this.hotspots.isActive() && this.hotspots.selectedId) {
                    event.preventDefault();
                    this.hotspots.pushUndoSnapshot(gameState.currentSceneId, this.hotspots.getScenePatch(gameState.currentSceneId));
                    this.hotspots.deleteHotspot(gameState.currentSceneId, this.hotspots.selectedId);
                    this.hotspots.selectedId = null;
                    sceneRenderer.refreshCurrentHotspots();
                    this.hotspots.render();
                }
                if (event.key.toLowerCase() === 'z' && event.ctrlKey && this.hotspots.isActive()) {
                    event.preventDefault();
                    this.hotspots.undoLastOp();
                }
            });
        }

        this.trace.renderLogs();
        this.hotspots.ensurePanel();
        this.layout.ensurePanel();
        this.layout.init();
        this.ui.updateFloatingButton();
        this.tools.applyForCurrentScene();
        this.updateStatus();
    },

    openHub() {
        const modal = document.getElementById('devHubModal');
        if (!modal) return;
        this.setEnabled(true);
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        this.updateStatus();
    },

    closeHub() {
        const modal = document.getElementById('devHubModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    },

    setEnabled(value) {
        this.enabled = Boolean(value);
        localStorage.setItem(this.storageKeys.enabled, String(this.enabled));
        this.syncSession();
        this.ui.updateFloatingButton();
        this.updateStatus();
    },

    setToolsEnabled(value) {
        this.toolsEnabled = Boolean(value);
        localStorage.setItem(this.storageKeys.toolsEnabled, String(this.toolsEnabled));
        const toggle = document.getElementById('dev-tools-enabled-toggle');
        if (toggle) {
            toggle.checked = this.toolsEnabled;
        }
        if (!this.toolsEnabled) {
            this.trace.hideHighlight();
        }
        this.syncSession();
        this.tools.applyForCurrentScene();
        this.updateStatus();
    },

    setActiveTool(tool) {
        const normalizedTool = tool || null;
        this.activeTool = normalizedTool;
        if (this.activeTool) {
            localStorage.setItem(this.storageKeys.activeTool, this.activeTool);
        } else {
            localStorage.removeItem(this.storageKeys.activeTool);
        }
        if (!this.trace.isActive()) {
            this.trace.hideHighlight();
        }
        this.syncSession();
        this.tools.applyForCurrentScene();
        this.updateStatus();
    },

    updateStatus() {
        const status = document.getElementById('devHubStatus');
        const tracePanel = document.getElementById('devTracePanel');
        if (!status) return;
        const sceneLabel = gameState.currentSceneId === 'S0_MAIN_MENU' ? 'menu' : (gameState.currentSceneId || 'menu');
        status.innerHTML = `currentSceneId: <strong>${sceneLabel}</strong><br>devEnabled: <strong>${this.enabled}</strong><br>toolsEnabled: <strong>${this.toolsEnabled}</strong><br>activeTool: <strong>${this.activeTool || 'none'}</strong>`;

        document.querySelectorAll('[data-dev-action]').forEach(button => {
            const action = button.dataset.devAction;
            const isActive = (action === 'click-trace' && this.activeTool === 'trace')
                || (action === 'hotspot-editor' && this.activeTool === 'hotspots')
                || (action === 'ui-layout-editor' && this.activeTool === 'layout')
                || (action === 'bubble-slots-overlay' && this.activeTool === 'bubbleSlots');
            button.classList.toggle('active', isActive);
        });

        if (tracePanel) {
            const showTracePanel = this.toolsEnabled && this.activeTool === 'trace';
            tracePanel.classList.toggle('hidden', !showTracePanel);
            if (showTracePanel) {
                this.trace.renderLogs();
            }
        }

        this.ui.updateFloatingButton();
        this.hotspots.render();
        this.layout.render();
        this.bubbleSlots.render();
    },

    runValidationNow() {
        this.setActiveTool('hotspots');
        this.hotspots.render();
        const output = document.getElementById('dev-validation-output');
        if (!output) return;
        const sceneId = gameState.currentSceneId;
        const hotspots = this.hotspots.getCurrentHotspots();
        const check = this.hotspots.validateScene(sceneId, hotspots);
        const actions = [];
        if (check.invalidTargets > 0) actions.push('Fix invalid target sceneIds.');
        if (check.zeroSize > 0) actions.push('Resize zero-size hotspots.');
        if (check.outOfBounds.length > 0) actions.push(`Move out-of-bounds hotspots: ${check.outOfBounds.join(', ')}`);
        if (check.overlaps.length > 0) actions.push(`Review overlapping pairs: ${check.overlaps.join('; ')}`);
        if (!actions.length) actions.push('No blocking issues found.');
        output.textContent = [
            `sceneId=${sceneId}`,
            `hotspots=${hotspots.length}`,
            `invalidTargets=${check.invalidTargets} overlaps=${check.overlaps.length} outOfBounds=${check.outOfBounds.length} zeroSize=${check.zeroSize}`,
            '',
            'nextSteps:',
            ...actions.map(action => `- ${action}`)
        ].join('\n');
    },

    /**
     * Runs the full demo-readiness validator (demoValidator.validateAll())
     * across every SCENES entry — structure, characters, dialogue, and live
     * asset probes — without entering any scene. Read-only: never mutates
     * SCENES, save data, or the currently-loaded scene/game state.
     */
    async runDemoValidationAll() {
        const output = document.getElementById('dev-validation-output');
        if (output) {
            output.textContent = 'Running full demo validation across all scenes... this probes every referenced asset and may take a few seconds.';
        }
        const report = await demoValidator.validateAll();
        if (output) output.textContent = report.markdown;
        this.updateStatus();
        return report;
    },

    validateScenes() {
        const NON_CHARACTER_SPEAKERS = new Set(['NARRATION', 'SYSTEM', 'CHOICE', 'FINAL CHOICE']);
        const lines = [];

        Object.values(SCENES).forEach(scene => {
            if (!scene || typeof scene !== 'object') return;
            const sceneId = scene.id || '(unknown)';
            const issues = [];

            const dialogue = scene.dialogue;
            if (!Array.isArray(dialogue) || dialogue.length === 0) {
                issues.push('no dialogue array or empty');
            } else {
                const charKeys = new Set(
                    (scene.characters || []).flatMap(c => {
                        const entries = [];
                        if (c.name) entries.push(String(c.name).toUpperCase());
                        if (c.id) entries.push(String(c.id).toUpperCase());
                        return entries;
                    })
                );

                dialogue.forEach((entry, idx) => {
                    if (!entry || typeof entry !== 'object') return;
                    const speaker = entry.speaker;
                    const prefix = `dialogue[${idx}]`;

                    if (speaker === 'CHOICE' || speaker === 'FINAL CHOICE') {
                        if (!Array.isArray(entry.choices) || entry.choices.length === 0) {
                            issues.push(`${prefix} (${speaker}): no choices array or empty`);
                        } else {
                            entry.choices.forEach((choice, ci) => {
                                if (!choice.text) {
                                    issues.push(`${prefix} (${speaker}) choice[${ci}]: missing text`);
                                }
                                if (!choice.action && !choice.next) {
                                    issues.push(`${prefix} (${speaker}) choice[${ci}]: no action or next`);
                                }
                            });
                        }
                    } else if (!NON_CHARACTER_SPEAKERS.has(speaker)) {
                        if (!entry.position || !sceneRenderer.validZones.has(entry.position)) {
                            issues.push(`${prefix} (${speaker}): missing/invalid position`);
                        }
                        if (speaker && !charKeys.has(String(speaker).toUpperCase())) {
                            issues.push(`${prefix}: speaker "${speaker}" not in scene.characters`);
                        }
                    }

                    if (!entry.text && entry.text !== 0) {
                        issues.push(`${prefix}: missing/empty text`);
                    }
                });
            }

            if (issues.length > 0) {
                lines.push(`${sceneId}:`);
                issues.forEach(issue => lines.push(`  • ${issue}`));
            }
        });

        if (lines.length === 0) {
            console.log('[Dev.validateScenes] All scenes OK.');
        } else {
            console.log('[Dev.validateScenes]\n' + lines.join('\n'));
        }
    }
};

const spriteTransparencyProcessor = {
    whiteThreshold: 235,
    _cache: new Map(),

    _imageHasAnyAlpha(imageEl) {
        try {
            const width = imageEl.naturalWidth || imageEl.width;
            const height = imageEl.naturalHeight || imageEl.height;
            if (!width || !height) return false;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return false;

            ctx.drawImage(imageEl, 0, 0, width, height);
            const pixels = ctx.getImageData(0, 0, width, height).data;

            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] < 255) return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    makeWhitePixelsTransparent(imageEl) {
        if (!imageEl || imageEl.dataset.whiteRemoved === 'true') return;

        if (!DEV_FORCE_WHITE_STRIP && imageEl.complete && this._imageHasAnyAlpha(imageEl)) {
            imageEl.dataset.whiteRemoved = 'true';
            return;
        }

        const originalSrc = imageEl.dataset.spriteCandidate || imageEl.src;

        const cached = this._cache.get(originalSrc);
        if (cached) {
            imageEl.src = cached;
            imageEl.dataset.whiteRemoved = 'true';
            return;
        }

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

            const indexOf = (x, y) => (y * width + x) * 4;
            const isNearWhite = (x, y) => {
                const i = indexOf(x, y);
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const minChannel = Math.min(r, g, b);
                const maxChannel = Math.max(r, g, b);
                return pixels[i + 3] > 0
                    && minChannel >= threshold
                    && (maxChannel - minChannel) <= 22;
            };

            const visited = new Uint8Array(width * height);
            const queue = [];
            const push = (x, y) => {
                if (x < 0 || y < 0 || x >= width || y >= height) return;
                const idx = y * width + x;
                if (visited[idx]) return;
                visited[idx] = 1;
                queue.push([x, y]);
            };

            for (let x = 0; x < width; x += 1) {
                push(x, 0);
                push(x, height - 1);
            }
            for (let y = 1; y < height - 1; y += 1) {
                push(0, y);
                push(width - 1, y);
            }

            let changed = 0;
            while (queue.length > 0) {
                const [x, y] = queue.shift();
                if (!isNearWhite(x, y)) continue;

                const i = indexOf(x, y);
                pixels[i + 3] = 0;
                changed += 1;

                push(x + 1, y);
                push(x - 1, y);
                push(x, y + 1);
                push(x, y - 1);
            }

            if (changed > 0) {
                ctx.putImageData(imageData, 0, 0);
                const processedUrl = canvas.toDataURL('image/png');
                this._cache.set(originalSrc, processedUrl);
                imageEl.src = processedUrl;

                if (this._cache.size > 30) {
                    const firstKey = this._cache.keys().next().value;
                    this._cache.delete(firstKey);
                }
            }
            imageEl.dataset.whiteRemoved = 'true';
        } catch (error) {
            console.warn('sprite-transparency safety net failed:', error);
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
        this.syncViewportHeight();
        this.setupTouchGuards();
        this.setupIOSBouncePrevention();
        this.setupImmersiveMode();
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

    syncViewportHeight() {
        const updateViewportHeight = () => {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`);
        };

        updateViewportHeight();
        window.visualViewport?.addEventListener('resize', updateViewportHeight);
        window.addEventListener('resize', updateViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateViewportHeight, 80);
        });
    },

    setupImmersiveMode() {
        if (!this.isMobile()) return;

        const requestFullscreen = async () => {
            const root = document.documentElement;
            if (document.fullscreenElement || !root) return;

            const fn = root.requestFullscreen
                || root.webkitRequestFullscreen
                || root.msRequestFullscreen;

            if (typeof fn === 'function') {
                try {
                    await fn.call(root);
                } catch (error) {
                    errorLogger.log('fullscreen-request', error);
                }
            }

            // Fallback for browsers that ignore fullscreen request (mobile Safari).
            window.scrollTo(0, 1);
        };

        const onceOptions = { passive: true, once: true };
        document.addEventListener('pointerup', requestFullscreen, onceOptions);
        document.addEventListener('touchend', requestFullscreen, onceOptions);
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
            const orientationQuery = window.matchMedia('(orientation: portrait)');
            const isPortrait = orientationQuery.matches || window.innerHeight > window.innerWidth;
            const overlay = document.getElementById('orientation-overlay');
            if (!overlay) return;
            overlay.classList.toggle('hidden', !isPortrait || !this.isMobile());
            overlay.setAttribute('aria-hidden', (!isPortrait || !this.isMobile()).toString());
        };

        const orientationQuery = window.matchMedia('(orientation: portrait)');
        const queryListener = () => applyOrientationState();

        if (typeof orientationQuery.addEventListener === 'function') {
            orientationQuery.addEventListener('change', queryListener);
        } else if (typeof orientationQuery.addListener === 'function') {
            orientationQuery.addListener(queryListener);
        }

        if (window.screen?.orientation?.addEventListener) {
            window.screen.orientation.addEventListener('change', applyOrientationState);
        }

        window.addEventListener('orientationchange', applyOrientationState);
        window.addEventListener('resize', applyOrientationState);
        window.addEventListener('pageshow', applyOrientationState);
        document.addEventListener('visibilitychange', applyOrientationState);
        applyOrientationState();

        // Some mobile browsers (notably iOS Safari) can skip orientation events.
        setTimeout(applyOrientationState, 250);
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

    registerBackgroundFallback(bg, src) {
        bg.addEventListener('error', () => {
            const filename = src.split('/').pop();
            console.error(`Missing background: ${src}`);
            bg.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23111'/%3E%3Cstop offset='1' stop-color='%23000'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' fill='%23ffd700' font-size='36' text-anchor='middle' dominant-baseline='middle' font-family='monospace'%3E${encodeURIComponent(filename)}%3C/text%3E%3C/svg%3E`;
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

    async preloadSingleAsset(src, options = {}) {
        const { logErrors = true } = options;
        if (!src || this.loadedAssets.has(src)) return;

        await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssets.add(src);
                resolve();
            };
            img.onerror = () => {
                // logErrors:false calls (lazyLoadSceneAssets' parallel
                // sprite-candidate warm-up, next-scene background prefetch)
                // are speculative/best-effort — an individual candidate
                // 404ing there is expected whenever a later candidate in
                // the same fallback chain succeeds, so it must not
                // permanently pollute assetLoader.errors (which
                // hbGetMissingAssetInfo()/validateCurrentLayout() treats as
                // authoritative "this asset is missing" signals). A
                // genuinely missing asset still surfaces via the DOM
                // placeholder check (registerImageFallback/
                // registerBackgroundFallback) when it's actually rendered.
                if (logErrors) {
                    this.errors.push(src);
                    errorLogger.log('preload-assets', new Error(`Failed to preload image`), { src });
                }
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
                const zoneName = char.position || 'center';
                const spriteCandidates = sceneRenderer.buildSpriteCandidates(char.sprite, zoneName);
                spriteCandidates.forEach(candidate => lazyAssets.push(`./assets/characters/${candidate}`));
            }
        });
        (scene.items || []).forEach(item => {
            if (item?.id) lazyAssets.push(`./assets/items/item_${item.id}.png`);
        });
        const uniqueAssets = [...new Set(lazyAssets)];
        safeAsync(() => Promise.all(uniqueAssets.map(src => this.preloadSingleAsset(src, { logErrors: false }))), 'lazy-load-scene-assets')();
    }
};

// ===== AUDIO MANAGEMENT =====
const audioManager = {
    musicPlayer: null,
    sfxPlayer: null,
    currentTrack: null,
    musicTrackVolumeMultipliers: {
        'The Briefing Room (Somber Ambient).mp3': 0.45
    },
    maxConcurrentSfx: 2,
    activeSfx: 0,
    muted: false, // set by __HB_DEBUG__.setAudioEnabled() / ?mute=1

    init() {
        this.musicPlayer = document.getElementById('music-player');
        this.sfxPlayer = document.getElementById('sfx-player');
        this.updateVolumes();
        SFXGenerator.init();
    },

    // Debug/testing hook: mute or restore music+SFX playback deterministically.
    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            if (this.musicPlayer) { try { this.musicPlayer.pause(); } catch (_) {} this.musicPlayer.volume = 0; }
            if (this.sfxPlayer) { try { this.sfxPlayer.pause(); } catch (_) {} this.sfxPlayer.volume = 0; }
        } else {
            this.updateVolumes();
        }
    },

    playMusic(filename, fadeIn = true) {
        try {
            if (this.muted) return;
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
                const volumeMultiplier = this.musicTrackVolumeMultipliers[filename] ?? 1;
                const targetVol = (gameState.settings.musicVolume / 100) * volumeMultiplier;

                // Always fade in music for smooth transitions
                this.musicPlayer.volume = 0;
                this.musicPlayer.play().catch(err => {
                    // Browser autoplay/user-interruption can abort pending play() promises.
                    if (err?.name === 'AbortError') return;
                    errorLogger.log('audio-play-music', err, { filename });
                });

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
            if (this.muted) return;
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
            const volumeMultiplier = this.musicTrackVolumeMultipliers[this.currentTrack] ?? 1;
            this.musicPlayer.volume = (gameState.settings.musicVolume / 100) * volumeMultiplier;
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
        // ?noSave=1 — used by automated tests (see HB_FLAG_NO_SAVE) so a
        // full playthrough of scene transitions never touches localStorage.
        if (HB_FLAG_NO_SAVE) return true;
        const saveData = {
            currentSceneId: gameState.currentSceneId,
            inventory: gameState.inventory,
            notebook: gameState.notebook,
            journalSeen: gameState.journalSeen,
            storyProgress: gameState.storyProgress,
            flags: gameState.flags,
            timestamp: Date.now()
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        if (DEBUG) console.log('Game saved');
        return true;
    },
    
    load() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                gameState.inventory = data.inventory || [];
                gameState.notebook = data.notebook || [];
                gameState.journalSeen = data.journalSeen || {};
                gameState.storyProgress = {
                    ...gameState.storyProgress,
                    ...(data.storyProgress || {})
                };
                gameState.flags = { ...gameState.flags, ...data.flags };
                if (DEBUG) console.log('Game loaded');
                return data.currentSceneId || null;
            } catch (err) {
                console.error('Failed to load save:', err);
                return null;
            }
        }
        return null;
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

const ITEM_DISPLAY_NAMES = {
    house_key: 'HOUSE KEY',
    conspiracy_notebook: 'CONSPIRACY NOTEBOOK',
    neighbors_usb: 'NEIGHBORS USB',
    burner_phone: 'BURNER PHONE',
    moms_nurse_badge: "MOM'S NURSE BADGE",
    fake_fbi_badge: 'FAKE FBI BADGE',
    cartel_usb: 'CARTEL USB',
    mysterious_passport: 'MYSTERIOUS PASSPORT',
    tv_remote: 'TV REMOTE'
};

const ITEM_JOURNAL_HINTS = {
    neighbors_usb: 'NEIGHBORS USB — This drive is the key to everything. When Sofia asks if you still have it at school, open INVENTORY and USE it to show her. Later at the CIA office, Ms. Gray will ask about it too — USE it again to trigger the choice that shapes your alliance.',
    burner_phone: 'BURNER PHONE — Smith gave you this as a leash, but it can be your tool. At the ICE processing facility, open INVENTORY and USE the burner phone to secretly document the room. If the cartel puts you under surveillance, USE it again to call for backup.',
    house_key: 'HOUSE KEY — Got you out the back door during the raid. May open side paths if the family needs to move quickly or secretly in later scenes.',
    moms_nurse_badge: "MOM'S NURSE BADGE — A real hospital ID. Could grant access to restricted areas or establish trust in official-looking situations. Hold onto it.",
    fake_fbi_badge: 'FAKE FBI BADGE — Use sparingly. When facing Ortega in the Venezuelan backroom, open INVENTORY and USE this badge to establish credibility and negotiate a better deal. Could also work on cartel contacts who respect federal authority.',
    cartel_usb: 'CARTEL USB — Serious leverage. The cartel\'s own data turned against them. Secure it until the warehouse showdown, where it can tip the final confrontation.',
    mysterious_passport: 'MYSTERIOUS PASSPORT — A clean alias. Before heading to the warehouse as "Marco Delgado," open INVENTORY and USE this passport to confirm your cover identity with Ms. Gray. Do not skip this step.',
    tv_remote: 'TV REMOTE — The channel that started it all. Hank and Jonah\'s night changed when the news broke. Might reveal hidden broadcast clues if used in the right scene.'
};

let statusToastTimerId = null;

function getPrettyItemName(itemId) {
    const normalizedItemId = itemId.startsWith('item_') ? itemId.slice(5) : itemId;
    return ITEM_DISPLAY_NAMES[normalizedItemId] || normalizedItemId.replace(/_/g, ' ').toUpperCase();
}

function showStatusToast(msg, ms = 1400) {
    const toast = document.getElementById('status-toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.remove('is-show');
    void toast.offsetWidth;
    toast.classList.add('is-show');

    if (statusToastTimerId) {
        clearTimeout(statusToastTimerId);
    }

    statusToastTimerId = setTimeout(() => {
        toast.classList.remove('is-show');
        statusToastTimerId = null;
    }, ms);
}

function addJournalOnce(key, title, content) {
    if (!key || gameState.journalSeen[key]) return;

    notebook.add(title, content);
    gameState.journalSeen[key] = true;
    saveSystem.save();
}

// ===== INVENTORY SYSTEM =====
const inventory = {
    add(itemId) {
        if (!gameState.inventory.includes(itemId)) {
            gameState.inventory.push(itemId);
            console.log(`Added to inventory: ${itemId}`);

            const hintContent = ITEM_JOURNAL_HINTS[itemId];
            if (hintContent) {
                addJournalOnce(
                    `itemhint_${itemId}`,
                    `ITEM CLUE: ${getPrettyItemName(itemId)}`,
                    hintContent
                );
            }

            SFXGenerator.playMenuOpen();
            saveSystem.save();
            showStatusToast(`ITEM ACQUIRED: ${getPrettyItemName(itemId)}`);
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
        renderInventory();
        
        overlay.classList.remove('hidden');
    }
};

function renderInventory() {
    const inventoryGrid = document.getElementById('inventory-grid');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = '';

    if (!gameState.inventory || gameState.inventory.length === 0) {
        inventoryGrid.innerHTML = '<div class="inventory-empty">No items yet</div>';
        return;
    }

    gameState.inventory.forEach(itemId => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.dataset.itemId = itemId;

        const img = document.createElement('img');
        img.src = `./assets/items/item_${itemId}.png`;
        img.alt = itemId.replace(/_/g, ' ');
        img.draggable = false;
        img.onerror = () => {
            img.src = getMissingAssetPlaceholder(itemId, 80, 80);
        };

        const itemName = document.createElement('div');
        itemName.className = 'inventory-item-name';
        itemName.textContent = itemId.replace(/_/g, ' ');

        itemDiv.appendChild(img);
        itemDiv.appendChild(itemName);

        let touchStartTime = 0;
        const handleItemClick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (event.type === 'click' && Date.now() - touchStartTime < 500) {
                return;
            }

            SFXGenerator.playButtonClick();
            showItemInfo(itemId);
        };

        itemDiv.addEventListener('touchstart', () => {
            touchStartTime = Date.now();
        }, { passive: true });
        itemDiv.addEventListener('touchend', handleItemClick, { passive: false });
        itemDiv.addEventListener('click', handleItemClick);

        inventoryGrid.appendChild(itemDiv);
    });
}

// ===== UI MODAL HELPER =====
const uiModal = {
    show({ title, bodyHtml, bodyText, actionBtn }) {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');

        titleEl.textContent = title;
        if (bodyHtml) {
            bodyEl.innerHTML = bodyHtml;
        } else {
            bodyEl.textContent = bodyText || '';
        }

        overlay.classList.remove('hidden');

        const hide = () => this.hide();

        const okBtn = document.getElementById('modal-ok');
        const closeBtn = document.getElementById('modal-close');
        const useBtn = document.getElementById('modal-use-btn');

        okBtn.onclick = hide;
        closeBtn.onclick = hide;
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };

        if (actionBtn && useBtn) {
            useBtn.textContent = actionBtn.label || 'USE ITEM';
            useBtn.classList.remove('hidden');
            useBtn.onclick = () => {
                this.hide();
                actionBtn.onClick();
            };
        } else if (useBtn) {
            useBtn.classList.add('hidden');
            useBtn.onclick = null;
        }
    },

    hide() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }
};

function showItemInfo(itemId) {
    // Clicking the conspiracy notebook in inventory opens the notebook overlay
    if (itemId === 'conspiracy_notebook') {
        document.getElementById('inventory-overlay').classList.add('hidden');
        notebook.show();
        return;
    }
    const itemName = itemId.replace(/_/g, ' ').toUpperCase();
    const infoText = getItemDescription(itemId);
    uiModal.show({
        title: itemName,
        bodyText: infoText,
        actionBtn: {
            label: 'USE ITEM',
            onClick: () => {
                document.getElementById('inventory-overlay').classList.add('hidden');
                handleItemUse(itemId);
            }
        }
    });
}

function handleItemUse(itemId) {
    const currentScene = SCENES[gameState.currentSceneId];
    if (!currentScene) {
        showStatusToast("Can't use that right now.");
        return;
    }
    const useHandler = currentScene.itemUses && currentScene.itemUses[itemId];
    if (useHandler && typeof useHandler.action === 'function') {
        SFXGenerator.playButtonClick();
        useHandler.action();
    } else {
        showStatusToast(`Can't use that here right now.`, 2200);
    }
}

function getItemDescription(itemId) {
    const descriptions = {
        house_key: 'Your house key. Essential for coming and going.',
        conspiracy_notebook: "Hank's conspiracy theory notebook. Contains questionable geopolitical hot takes.",
        neighbors_usb: 'USB drive from the Riveras. Contains unknown data.',
        burner_phone: 'Burner phone. For when you need to stay off the grid.',
        moms_nurse_badge: "Mom's hospital badge. Might grant access to restricted areas.",
        fake_fbi_badge: 'Convincing fake FBI badge. Use with caution.',
        cartel_usb: 'Cartel USB drive. Handle with extreme care.',
        mysterious_passport: "Passport with your photo but someone else's name.",
        tv_remote: 'TV remote. Channel surfing at its finest.'
    };

    const normalizedItemId = itemId.startsWith('item_') ? itemId.slice(5) : itemId;
    return descriptions[normalizedItemId] || 'A mysterious item.';
}

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
            // Category prefix → CSS tag class mapping
            const TAG_CLASSES = {
                'STATUS':                  'journal-tag-status',
                'FINAL SCENE':             'journal-tag-status',
                'ACTION REQUIRED':         'journal-tag-action',
                'ACTION AVAILABLE':        'journal-tag-action',
                'OPTIONAL ACTION':         'journal-tag-action',
                'CLUE':                    'journal-tag-clue',
                'KEY CONTACT':             'journal-tag-clue',
                'NEXT STEP':               'journal-tag-clue',
                'CHOICE AHEAD':            'journal-tag-clue',
                'UPCOMING':                'journal-tag-clue',
                'INCOMING ITEM':           'journal-tag-clue',
                'INTEL GATHERED':          'journal-tag-result',
                'CONFIRMED':               'journal-tag-result',
                'CREDIBILITY ESTABLISHED': 'journal-tag-result',
                'COVER CONFIRMED':         'journal-tag-result',
                'UNDERCOVER READY':        'journal-tag-result',
                'READY':                   'journal-tag-result',
                'IMPROVED OFFER':          'journal-tag-result',
                'CIA INFORMED':            'journal-tag-result',
                'BACKUP CALLED':           'journal-tag-result',
                'WILDCARD':                'journal-tag-story',
                'MOMENT OF TRUTH':         'journal-tag-story',
                'DECISION POINT':          'journal-tag-story',
                'BLUFF ATTEMPTED':         'journal-tag-story',
                'BLUFF RESULT':            'journal-tag-story',
            };

            gameState.notebook.forEach((entry, index) => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'notebook-entry';
                const entryNumber = String(index + 1).padStart(2, '0');

                // Parse "CATEGORY — Subject" from title
                const dashIdx = entry.title.indexOf(' \u2014 ');
                let category = null;
                let subject = entry.title;
                if (dashIdx !== -1) {
                    const prefix = entry.title.slice(0, dashIdx);
                    if (TAG_CLASSES[prefix] !== undefined || prefix === 'NOTE') {
                        category = prefix;
                        subject = entry.title.slice(dashIdx + 3);
                    }
                }

                const tagClass = category ? (TAG_CLASSES[category] || 'journal-tag-note') : '';
                const tagHTML = category
                    ? `<span class="journal-tag ${tagClass}">${category}</span>`
                    : '';

                // Format timestamp as readable date + time
                const date = new Date(entry.timestamp);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                entryDiv.innerHTML = `
                    <div class="journal-entry-header">
                        ${tagHTML}
                        <span class="journal-entry-num">#${entryNumber}</span>
                        <span class="journal-entry-date">${dateStr} \u00b7 ${timeStr}</span>
                    </div>
                    <div class="notebook-entry-title">${subject}</div>
                    <div class="notebook-entry-body">${entry.content}</div>
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

        const isCover = false; // Standardized on contain for consistent positioning

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
            nativeScaleX: renderedW / this.REF_WIDTH,
            nativeScaleY: renderedH / this.REF_HEIGHT,
        };
    },

    /** Reads a plain-pixel CSS custom property (e.g. "8px") off :root. */
    _getCSSPixelVar(varName, fallbackPx) {
        try {
            const raw = getComputedStyle(document.documentElement).getPropertyValue(varName);
            const px = parseFloat(raw);
            return Number.isFinite(px) ? px : fallbackPx;
        } catch (_) {
            return fallbackPx;
        }
    },

    /**
     * The HUD's actual reserved band, measured from the live #hud::before bar
     * (its computed top+height) rather than assumed. This tracks whichever
     * breakpoint's HUD sizing is currently active instead of a single fixed
     * reference constant applied uniformly to every viewport.
     */
    _getHUDBottomPx(rect) {
        try {
            const hudEl = document.getElementById('hud');
            if (hudEl) {
                const hudBefore = getComputedStyle(hudEl, '::before');
                const hudTop = parseFloat(hudBefore.top);
                const hudHeight = parseFloat(hudBefore.height);
                if (Number.isFinite(hudTop) && Number.isFinite(hudHeight)) {
                    return hudTop + hudHeight;
                }
            }
        } catch (_) {
            // fall through to the reference-scaled estimate below
        }
        return rect ? (this.HUD_TOP * rect.nativeScaleY) : this.HUD_TOP;
    },

    /**
     * Safe placement rectangle for the dialogue box, in scene-container-local
     * pixels. Pass an explicit padPx to override; otherwise the pad and HUD
     * reservation are derived from live CSS (--dlg-safe-pad, --dlg-bottom-safe,
     * #hud::before) so compact-landscape breakpoints get their own correctly
     * scaled reservation instead of one fixed reference-space assumption.
     */
    getDialogueSafeRect(padPx) {
        const rect = this.getBackgroundRect();
        const container = document.getElementById('scene-container');
        if (!container) return null;

        const resolvedPad = Number.isFinite(padPx) ? padPx : this._getCSSPixelVar('--dlg-safe-pad', 12);

        // Fallback if background rect isn't available yet
        if (!rect) {
            return {
                left: resolvedPad,
                top: resolvedPad,
                right: container.clientWidth - resolvedPad,
                bottom: container.clientHeight - resolvedPad
            };
        }

        // Never reserve above the visible background art's own top edge.
        const hudBottomPx = Math.max(rect.offsetY, this._getHUDBottomPx(rect));
        const bottomPad = resolvedPad + this._getCSSPixelVar('--dlg-bottom-safe', 8);

        return {
            left: rect.offsetX + resolvedPad,
            right: rect.offsetX + rect.renderedW - resolvedPad,
            top: hudBottomPx + resolvedPad,
            bottom: rect.offsetY + rect.renderedH - bottomPad
        };
    },

    clientToNative(clientX, clientY) {
        const container = document.getElementById('scene-container');
        if (!container) return null;
        const containerRect = container.getBoundingClientRect();
        const rect = this.getBackgroundRect();
        const localX = clientX - containerRect.left;
        const localY = clientY - containerRect.top;

        if (!rect) {
            return {
                x: (localX / Math.max(1, containerRect.width)) * this.REF_WIDTH,
                y: (localY / Math.max(1, containerRect.height)) * this.REF_HEIGHT,
                localX,
                localY
            };
        }

        const x = (localX - rect.offsetX) / rect.nativeScaleX;
        const y = (localY - rect.offsetY) / rect.nativeScaleY;
        return {
            x: Number.isFinite(x) ? x : 0,
            y: Number.isFinite(y) ? y : 0,
            localX,
            localY
        };
    },

    /**
     * Calculate pixel position for a character in a named zone.
     * Returns an object with CSS properties to apply via style.
     *
     * `layout.offsetX`/`layout.offsetY` are the character's own authored
     * nudge (px, in reference-image space is NOT assumed — they're applied
     * directly in rendered pixels so they scale visually the same way the
     * zone anchor itself does at any viewport size). Positive X moves the
     * character right, positive Y moves it down. Baked directly into
     * left/right/bottom (not a transform) so they never conflict with the
     * slide-in/visible animation's translateX, and recalculateAll() must
     * pass the same offsets back in on every resize/orientation change so a
     * character's final position never drifts from what was authored.
     */
    calculateCharacterPosition(zoneName, layout = {}) {
        const zone = this.zones[zoneName] || this.zones['center'];
        const rect = this.getBackgroundRect();
        const charOffsetX = Number.isFinite(layout.offsetX) ? layout.offsetX : 0;
        const charOffsetY = Number.isFinite(layout.offsetY) ? layout.offsetY : 0;

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
            bottom: (bottomFromContainer - charOffsetY) + 'px',
        };

        if (zone.centered) {
            // Center zone: position at 50% of container, translate to center.
            // Composes --char-scale so this inline transform (which always
            // wins over the CSS class rule of the same name) doesn't strip
            // per-character scale from centered characters.
            result.left = (offsetX + renderedW * zone.anchor + charOffsetX) + 'px';
            result.transform = 'translateX(-50%) scale(var(--char-scale, 1))';
            result.right = 'auto';
        } else if (zone.side === 'right') {
            // Right-side zones: position from right edge of rendered area
            const rightFromContainer = containerW - (offsetX + renderedW) + (renderedW * zone.anchor);
            result.right = (rightFromContainer - charOffsetX) + 'px';
            result.left = 'auto';
        } else {
            // Left-side zones: position from left edge of rendered area
            result.left = (offsetX + renderedW * zone.anchor + charOffsetX) + 'px';
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

        const { offsetX, offsetY, nativeScaleX, nativeScaleY } = rect;

        return {
            left: (offsetX + imgX * nativeScaleX) + 'px',
            top: (offsetY + imgY * nativeScaleY) + 'px',
            width: (imgW * nativeScaleX) + 'px',
            height: (imgH * nativeScaleY) + 'px',
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
                // Read back the character's own authored nudge so repeated
                // resize/orientation events keep reproducing the exact same
                // slot + offsets rather than losing them on recalculation.
                const offsetX = parseFloat(charEl.dataset.offsetX) || 0;
                const offsetY = parseFloat(charEl.dataset.offsetY) || 0;
                const pos = this.calculateCharacterPosition(zoneName, { offsetX, offsetY });
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
                    charEl.style.transform = 'translateX(-50%) scale(var(--char-scale, 1))';
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


// ===== DIALOGUE PAGINATION SYSTEM =====
// THE single system that decides how dialogue text (speech AND narration)
// is split across pages, and what the action area (continue/more/choices)
// looks like on each page. Replaces two previously-overlapping systems (a
// dead "bubble paging" implementation and a live "generic dialogue paging"
// implementation) that measured fit by mutating the LIVE typewriter DOM and
// only discovered the continue-button/choices footprint after deciding
// whether text fit.
//
// Pipeline (see render()):
//   1. resolve final dialogue layout rectangle   (sceneRenderer.layoutDialogue)
//   2. wait for required fonts                   (document.fonts.ready, timeout)
//   3. calculate available content height         (_getAvailableContentHeightPx)
//   4. measure speaker, text, action area, padding (_measure, offscreen clone)
//   5. paginate text at word/sentence boundaries   (_paginate)
//   6. render/type the selected page               (_renderPage)
//   7. render the correct action area               (_finalizePageAction)
//   8. run a final overflow assertion                (_assertNoOverflow)
//
// Font size is NOT dynamically shrunk anywhere in this system — floors are
// the CSS clamp() values already in styles.css (see --dlg-text-size etc.),
// which are the single source of truth for "explicit readable font floors".
// Pagination is the only adaptive mechanism for making content fit.
const dialoguePager = {
    FONTS_READY_TIMEOUT_MS: 300,
    PAGE_SAFETY_MARGIN_PX: 4,

    // State for the entry currently being displayed. Fully replaced (never
    // patched) by render(), and cleared by reset() — see reset() call sites
    // in sceneRenderer (showDialogue, _closeDialogueThen, clearScene) for
    // the "resets completely between entries and scenes" guarantee.
    state: null,
    _activeToken: 0,
    _measureClone: null,

    reset() {
        this.state = null;
        this._activeToken++;
        const choicesDiv = document.getElementById('dialogue-choices');
        if (choicesDiv) choicesDiv.style.maxHeight = '';
    },

    // ===== offscreen measurement clone =====
    // A hidden, off-screen mirror of #dialogue-content's structure. All
    // pagination measurement happens against this clone's elements, never
    // against the live #dialogue-text/#dialogue-speaker/#dialogue-choices —
    // so measuring never corrupts (or races with) the live typewriter DOM.
    _getMeasureClone() {
        if (this._measureClone && document.body.contains(this._measureClone.root)) {
            return this._measureClone;
        }

        const root = document.createElement('div');
        root.className = 'dlg-measure-root';
        root.setAttribute('aria-hidden', 'true');

        const content = document.createElement('div');
        content.className = 'dlg-measure-content';
        const speaker = document.createElement('div');
        speaker.className = 'dlg-measure-speaker';
        const text = document.createElement('div');
        text.className = 'dlg-measure-text';
        const actionArea = document.createElement('div');
        actionArea.className = 'dlg-measure-action';
        const choices = document.createElement('div');
        choices.className = 'dlg-measure-choices';
        const continueBtn = document.createElement('div');
        continueBtn.className = 'dlg-measure-continue';

        actionArea.appendChild(choices);
        actionArea.appendChild(continueBtn);
        content.appendChild(speaker);
        content.appendChild(text);
        content.appendChild(actionArea);
        root.appendChild(content);
        document.body.appendChild(root);

        const clone = { root, content, speaker, text, actionArea, choices, continueBtn };
        this._measureClone = clone;
        return clone;
    },

    /** Copies the resolved (computed) styles that affect sizing from the live, correctly-CSS-matched elements onto the clone's inline styles. */
    _syncMeasureClone(clone, live, containerWidthPx) {
        const copyProps = (from, to, props) => {
            const cs = getComputedStyle(from);
            props.forEach(p => { to.style[p] = cs[p]; });
        };

        clone.content.style.width = containerWidthPx + 'px';
        copyProps(live.content, clone.content, ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap', 'gap']);

        copyProps(live.speaker, clone.speaker, [
            'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing',
            'textTransform', 'marginBottom', 'marginTop', 'whiteSpace', 'width'
        ]);
        clone.speaker.style.textAlign = getComputedStyle(live.speaker).textAlign;

        copyProps(live.text, clone.text, [
            'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing',
            'marginBottom', 'padding', 'wordBreak', 'overflowWrap', 'hyphens', 'width'
        ]);
        clone.text.style.whiteSpace = 'pre-wrap';
        clone.text.style.textAlign = getComputedStyle(live.text).textAlign;
        clone.text.style.maxHeight = 'none';

        copyProps(live.continueBtn, clone.continueBtn, ['fontSize', 'fontFamily', 'padding', 'minHeight', 'minWidth', 'lineHeight', 'marginTop']);

        const choicesCs = getComputedStyle(live.choices);
        clone.choices.style.display = choicesCs.display;
        clone.choices.style.flexDirection = choicesCs.flexDirection;
        clone.choices.style.gap = choicesCs.gap;
        clone.choices.style.marginTop = choicesCs.marginTop;
        clone.choices.style.width = choicesCs.width;
    },

    /** One real (but detached/invisible) choice button, styled like the live ones, for accurate height measurement. */
    _buildMeasureChoiceButton(liveClassSample, text) {
        const btn = document.createElement('button');
        btn.className = 'dialogue-choice';
        btn.textContent = text;
        btn.style.position = 'static';
        return btn;
    },

    // ===== fonts =====
    async _waitForFonts() {
        if (!document.fonts || !document.fonts.ready) return;
        try {
            await Promise.race([
                document.fonts.ready,
                new Promise(resolve => setTimeout(resolve, this.FONTS_READY_TIMEOUT_MS))
            ]);
        } catch (_) {
            // Font loading failed/unsupported — proceed with whatever fonts
            // are currently active rather than blocking dialogue forever.
        }
    },

    // ===== available height =====
    _getAvailableContentHeightPx(dialogueBox, container, content) {
        const containerStyle = getComputedStyle(container);
        let maxH = parseFloat(container.style.maxHeight);
        if (!Number.isFinite(maxH)) maxH = parseFloat(containerStyle.maxHeight);

        if (!Number.isFinite(maxH)) {
            // No explicit cap active (e.g. character/top-center placement, or
            // a mode with no matching max-height rule) — fall back to the
            // live safe area so pages are never planned to overlap the HUD
            // or run off-screen.
            const safe = positioningSystem.getDialogueSafeRect();
            const boxRect = dialogueBox.getBoundingClientRect();
            maxH = safe ? Math.max(120, safe.bottom - boxRect.top) : 300;
        }

        const contentStyle = getComputedStyle(content);
        const paddingV = (parseFloat(contentStyle.paddingTop) || 0) + (parseFloat(contentStyle.paddingBottom) || 0);
        return Math.max(60, maxH - paddingV);
    },

    // ===== measuring speaker / action area / budget =====
    _measure(dialogueBox, dialogueEntry) {
        const container = document.getElementById('dialogue-container');
        const content = document.getElementById('dialogue-content');
        const speakerEl = document.getElementById('dialogue-speaker');
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');
        const continueEl = document.getElementById('dialogue-continue');

        const clone = this._getMeasureClone();
        const containerWidthPx = container.getBoundingClientRect().width;
        this._syncMeasureClone(clone, { content, speaker: speakerEl, text: textEl, choices: choicesEl, continueBtn: continueEl }, containerWidthPx);

        const availableContentHeight = this._getAvailableContentHeightPx(dialogueBox, container, content);

        // Speaker: an empty speaker (narration) costs nothing; otherwise
        // measure its real border-box height on the clone. getBoundingClientRect()
        // never includes margin, so margin-bottom (the actual inter-block spacing
        // in speech-bubble/default mode — narrative mode uses #dialogue-content's
        // gap instead) is measured separately below and added on top.
        const speakerText = speakerEl.textContent || '';
        clone.speaker.textContent = speakerText;
        const speakerHeight = speakerText ? clone.speaker.getBoundingClientRect().height : 0;
        const speakerMarginPx = speakerHeight > 0 ? (parseFloat(getComputedStyle(clone.speaker).marginBottom) || 0) : 0;
        const textMarginPx = parseFloat(getComputedStyle(clone.text).marginBottom) || 0;

        // Action area: whichever will actually be shown once the FINAL page
        // is reached — choices (if any) are always taller than a single
        // continue button, so budgeting for them up front means the last
        // page never has to fight the choices panel for space afterward.
        const hasChoices = Array.isArray(dialogueEntry.choices) && dialogueEntry.choices.length > 0;
        let actionAreaHeight = 0;
        let actionAreaMarginPx = 0;
        if (hasChoices) {
            clone.choices.innerHTML = '';
            dialogueEntry.choices.forEach(choice => {
                clone.choices.appendChild(this._buildMeasureChoiceButton(null, choice.text || ''));
            });
            actionAreaHeight = clone.choices.getBoundingClientRect().height;
            actionAreaMarginPx = parseFloat(getComputedStyle(clone.choices).marginTop) || 0;
        } else if (dialogueEntry.next) {
            clone.continueBtn.textContent = 'continue';
            actionAreaHeight = clone.continueBtn.getBoundingClientRect().height;
            actionAreaMarginPx = parseFloat(getComputedStyle(clone.continueBtn).marginTop) || 0;
        }

        const contentStyle = getComputedStyle(content);
        const gapPx = parseFloat(contentStyle.rowGap) || parseFloat(contentStyle.gap) || 0;
        const blockCount = 1 + (speakerHeight > 0 ? 1 : 0) + (actionAreaHeight > 0 ? 1 : 0);
        const gapsTotal = gapPx * Math.max(0, blockCount - 1);

        const textBudgetPx = Math.max(24, availableContentHeight - speakerHeight - speakerMarginPx - actionAreaHeight - actionAreaMarginPx - gapsTotal - textMarginPx - this.PAGE_SAFETY_MARGIN_PX);

        return { clone, container, content, speakerEl, textEl, choicesEl, continueEl, availableContentHeight, speakerHeight, actionAreaHeight, textBudgetPx, hasChoices };
    },

    // ===== pagination =====
    /** Splits fullText into pages that each fit within textBudgetPx, using the offscreen clone. Sentence boundaries are preferred, then words. Never caps the page count — a page that would still overflow is split further instead of being merged. */
    _paginate(metrics, fullText) {
        const clone = metrics.clone;
        const textBudgetPx = metrics.textBudgetPx;

        // Preserve intentional line breaks (the typewriter supports them —
        // see getCharDelay's '\n' handling) but collapse incidental runs of
        // horizontal whitespace/blank lines from source formatting.
        const txt = String(fullText || '')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/ *\n */g, '\n')
            .trim();
        if (!txt) return [''];

        const fits = (candidate) => {
            clone.text.textContent = candidate;
            return clone.text.scrollHeight <= textBudgetPx + 0.5;
        };

        if (fits(txt)) return [txt];

        // Prefer paragraph, then sentence, then word boundaries.
        const paragraphs = txt.split(/\n{2,}/);
        const sentenceUnits = [];
        paragraphs.forEach((para, i) => {
            const sentences = para.split(/(?<=[.!?])\s+/).filter(Boolean);
            sentences.forEach((s, j) => {
                sentenceUnits.push(j === 0 && i > 0 ? '\n\n' + s : s);
            });
        });
        const units = sentenceUnits.length > 1 ? sentenceUnits : txt.split(' ');

        const splitToWords = (unit) => {
            const words = unit.split(' ');
            const result = [];
            let buf = '';
            for (const w of words) {
                const trial = buf ? `${buf} ${w}` : w;
                if (fits(trial)) {
                    buf = trial;
                } else {
                    if (buf) result.push(buf);
                    // A lone word that still doesn't fit the budget is a
                    // floor/box-size mismatch pagination can't solve by
                    // itself — emit it anyway rather than looping forever;
                    // the final overflow assertion will flag it in dev.
                    buf = w;
                }
            }
            if (buf) result.push(buf);
            return result.length ? result : [unit];
        };

        const pages = [];
        let current = '';
        for (const unit of units) {
            const next = current ? `${current} ${unit}` : unit;
            if (fits(next)) {
                current = next;
                continue;
            }
            if (current) pages.push(current);
            if (fits(unit)) {
                current = unit;
            } else {
                const forced = splitToWords(unit);
                pages.push(...forced.slice(0, -1));
                current = forced[forced.length - 1] || '';
            }
        }
        if (current) pages.push(current);

        return pages.length ? pages : [txt];
    },

    // ===== choices panel clamp (post-render, after real buttons exist) =====
    /** For many/long choices: makes ONLY #dialogue-choices internally scrollable within the remaining safe-panel space, rather than letting it overflow the container or hiding the overflow outright. */
    _clampChoicesPanel(dialogueBox) {
        const container = document.getElementById('dialogue-container');
        const content = document.getElementById('dialogue-content');
        const speakerEl = document.getElementById('dialogue-speaker');
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');
        if (!container || !content || !choicesEl) return;

        const availableContentHeight = this._getAvailableContentHeightPx(dialogueBox, container, content);
        const contentStyle = getComputedStyle(content);
        const gapPx = parseFloat(contentStyle.rowGap) || parseFloat(contentStyle.gap) || 0;
        const speakerH = speakerEl && speakerEl.textContent ? speakerEl.getBoundingClientRect().height : 0;
        const speakerMarginPx = speakerH > 0 ? (parseFloat(getComputedStyle(speakerEl).marginBottom) || 0) : 0;
        const textH = textEl ? textEl.getBoundingClientRect().height : 0;
        const textMarginPx = textEl ? (parseFloat(getComputedStyle(textEl).marginBottom) || 0) : 0;
        const choicesMarginPx = parseFloat(getComputedStyle(choicesEl).marginTop) || 0;
        const blockCount = 1 + (speakerH > 0 ? 1 : 0) + (textH > 0 ? 1 : 0);
        const usedBySiblings = speakerH + speakerMarginPx + textH + textMarginPx + choicesMarginPx + gapPx * Math.max(0, blockCount - 1);
        const choicesBudget = Math.max(60, availableContentHeight - usedBySiblings);

        if (choicesEl.scrollHeight > choicesBudget + 1) {
            choicesEl.style.maxHeight = choicesBudget + 'px';
        } else {
            choicesEl.style.maxHeight = '';
        }
    },

    // ===== final overflow assertion =====
    /** Marks dialogueBox.dataset.overflow and warns in DEBUG if the container/content/text still overflow their own box after everything has rendered. An element whose own overflow-y is auto/scroll is excluded — that's a deliberate, reachable scrollbar (e.g. #dialogue-container.narrative-mode's compact-landscape fallback, or #dialogue-choices — see _clampChoicesPanel), not silent clipping. */
    _assertNoOverflow(dialogueBox) {
        const container = document.getElementById('dialogue-container');
        const content = document.getElementById('dialogue-content');
        const text = document.getElementById('dialogue-text');

        const isScrollable = (el) => {
            const overflowY = getComputedStyle(el).overflowY;
            return overflowY === 'auto' || overflowY === 'scroll';
        };
        const overflowing = [container, content, text].some(el =>
            el && el.scrollHeight > el.clientHeight + 1 && !isScrollable(el)
        );
        dialogueBox.dataset.overflow = overflowing ? 'true' : 'false';

        if (overflowing && DEBUG) {
            console.warn('[dialoguePager] dialogue box still overflows after pagination — this should not happen; the final page/floor combination does not fit.', {
                speaker: this.state?.entry?.speaker,
                page: this.state ? `${this.state.pageIndex + 1}/${this.state.pages.length}` : null,
                container: container && { scrollHeight: container.scrollHeight, clientHeight: container.clientHeight },
                content: content && { scrollHeight: content.scrollHeight, clientHeight: content.clientHeight },
                text: text && { scrollHeight: text.scrollHeight, clientHeight: text.clientHeight },
            });
        }
    },

    // ===== main pipeline =====
    /** Steps 1-5: resolve layout, wait for fonts, measure, and paginate. Does not render anything yet — call renderCurrentPage() (via sceneRenderer) to show the first page. */
    async prepare(dialogueBox, dialogueEntry, sceneRendererRef) {
        const token = ++this._activeToken;

        // 1. resolve final dialogue layout rectangle
        let layoutMode = sceneRendererRef.layoutDialogue(dialogueBox, dialogueEntry);

        // 2. wait for required fonts (safe timeout)
        await this._waitForFonts();
        if (token !== this._activeToken) return null; // superseded by a newer entry

        // Geometry can shift slightly once web fonts swap in — re-resolve
        // before measuring so step 3/4 read the settled box.
        layoutMode = sceneRendererRef.layoutDialogue(dialogueBox, dialogueEntry);

        // 3 + 4. calculate available height; measure speaker/text/action-area/padding
        const metrics = this._measure(dialogueBox, dialogueEntry);

        // 5. paginate text at word/sentence boundaries
        const pages = this._paginate(metrics, dialogueEntry.text || '');

        this.state = { entry: dialogueEntry, pages, pageIndex: 0, layoutMode, metrics, token };
        return this.state;
    },

    /** Steps 6-8 for the current page: type it out, wire the tap/click
     * advance behavior, and (once typing finishes) render the correct
     * action area and run the overflow assertion. */
    renderCurrentPage(dialogueBox, sceneRendererRef) {
        const s = this.state;
        if (!s) return;
        const { pages, pageIndex } = s;
        const pageText = pages[pageIndex];
        const isLastPage = pageIndex === pages.length - 1;
        const textEl = document.getElementById('dialogue-text');
        const continueBtn = document.getElementById('dialogue-continue');
        const choicesDiv = document.getElementById('dialogue-choices');

        sceneRendererRef._cleanupTypewriter(textEl);
        textEl.textContent = '';
        choicesDiv.innerHTML = '';
        choicesDiv.style.maxHeight = '';

        // The continue/more button is always the visible action while a page
        // is typing — choices (if any) only replace it once the LAST page's
        // text has fully finished (see _finalizePageAction).
        continueBtn.classList.remove('hidden');
        continueBtn.textContent = isLastPage ? 'continue' : 'more...';
        continueBtn.setAttribute('aria-label', isLastPage ? 'Continue dialogue' : 'Show more dialogue');
        continueBtn.onclick = () => this._onActionClick(dialogueBox, sceneRendererRef);

        sceneRendererRef.typeText(textEl, pageText, {
            onFinish: () => {
                this._finalizePageAction(dialogueBox, sceneRendererRef, isLastPage);
                this._assertNoOverflow(dialogueBox);
            }
        });
    },

    /** First tap while typing completes the current page; the next tap
     * advances (to the next page, or — on the last page with no choices —
     * to whatever the entry's `next` specifies). */
    _onActionClick(dialogueBox, sceneRendererRef) {
        const textEl = document.getElementById('dialogue-text');
        if (sceneRendererRef.isTyping) {
            sceneRendererRef.finishTypeText(textEl);
            return;
        }
        if (gameState.actionLock || sceneRendererRef.isTransitioning) return;

        const s = this.state;
        if (!s) return;
        const isLastPage = s.pageIndex === s.pages.length - 1;

        if (!isLastPage) {
            SFXGenerator.playContinueButton();
            s.pageIndex++;
            this.renderCurrentPage(dialogueBox, sceneRendererRef);
            return;
        }

        // Last page, no choices — choices replace the continue button
        // entirely once typing finishes, so reaching here means a plain
        // `next` advance (scene change, function, or next dialogue line).
        gameState.actionLock = true;
        gameState.dialogueLock = false;
        SFXGenerator.playContinueButton();
        sceneRendererRef._closeDialogueThen(() => {
            sceneRendererRef._advanceDialogueEntry(s.entry);
            gameState.actionLock = false;
        });
    },

    /** Step 7: render the action area appropriate to this entry, once the
     * last page's text has fully typed out. Intermediate pages keep the
     * "more..." button already wired by renderCurrentPage(). */
    _finalizePageAction(dialogueBox, sceneRendererRef, isLastPage) {
        if (!isLastPage) return;

        const entry = this.state.entry;
        const continueBtn = document.getElementById('dialogue-continue');

        if (entry.choices && entry.choices.length > 0) {
            continueBtn.classList.add('hidden');
            continueBtn.onclick = null;
            this._renderChoices(entry, sceneRendererRef);
            // Measure/clamp AFTER the real choice buttons are in the DOM.
            this._clampChoicesPanel(dialogueBox);
        } else if (entry.next) {
            continueBtn.classList.remove('hidden');
            continueBtn.textContent = 'continue';
            continueBtn.setAttribute('aria-label', 'Continue dialogue');
            // onclick is already _onActionClick from renderCurrentPage, which
            // now resolves to "last page, no choices" -> advance the entry.
        } else {
            continueBtn.classList.add('hidden');
            setTimeout(() => {
                gameState.dialogueLock = false;
                sceneRendererRef._closeDialogueThen(() => sceneRendererRef.nextDialogue());
            }, 3000);
        }
    },

    /** Builds the real, interactive choice buttons (single implementation —
     * previously duplicated once for single-page entries and once inside
     * the old per-page pagination renderer). */
    _renderChoices(dialogueEntry, sceneRendererRef) {
        const choicesDiv = document.getElementById('dialogue-choices');
        choicesDiv.innerHTML = '';

        dialogueEntry.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-choice';
            btn.textContent = choice.text;
            let touchStartTime = 0;
            let touchStartPos = null;

            const handleChoiceClick = () => {
                if (gameState.actionLock || sceneRendererRef.isTransitioning) return;
                gameState.actionLock = true;
                gameState.dialogueLock = false;
                SFXGenerator.playButtonClick();
                if (choice.action) choice.action();
                // Release on a short delay, like the item/hotspot click
                // handlers — releasing synchronously right after a
                // synchronous choice.action() call provided no real
                // protection (nothing can run between two lines of
                // synchronous JS), so a second real click landing in that
                // same tick was never actually blocked by this lock.
                setTimeout(() => {
                    gameState.actionLock = false;
                }, 300);
            };

            const handleInteraction = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.type === 'click' && touchStartTime > Date.now() - 500) return;
                if (e.type === 'touchend' && touchStartPos) {
                    const t = e.changedTouches[0];
                    if (Math.abs(t.clientX - touchStartPos.x) > 10 || Math.abs(t.clientY - touchStartPos.y) > 10) return;
                }
                handleChoiceClick();
            };

            btn.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                const t = e.touches[0];
                touchStartPos = { x: t.clientX, y: t.clientY };
            }, { passive: true });
            btn.addEventListener('touchend', handleInteraction, { passive: false });
            btn.addEventListener('click', handleInteraction);
            choicesDiv.appendChild(btn);
        });

        // Preload assets for scenes the choices might lead to (gives the
        // player's reading time as a preload window).
        dialogueEntry.choices.forEach(choice => {
            if (!choice.action) return;
            const actionStr = choice.action.toString();
            Object.keys(SCENES).forEach(sceneId => {
                if (actionStr.includes(`'${sceneId}'`) || actionStr.includes(`"${sceneId}"`)) {
                    const targetScene = SCENES[sceneId];
                    if (targetScene) {
                        assetLoader.lazyLoadSceneAssets(targetScene);
                        if (targetScene.background) {
                            assetLoader.preloadSingleAsset(targetScene.background, { logErrors: false });
                        }
                    }
                }
            });
        });
    },

    /** Called on resize/orientation change for an already-displayed entry.
     * Repositioning itself is handled by sceneRenderer (layoutDialogue +
     * clamp) before this runs — this only re-clamps the choices panel (its
     * budget depends on the container's current size) and re-asserts
     * overflow. Never re-paginates: jumping the reader to a different page
     * mid-read would be more jarring than a rare, brief size mismatch.
     */
    reflow(dialogueBox) {
        if (!this.state) return;
        const choicesDiv = document.getElementById('dialogue-choices');
        if (choicesDiv && choicesDiv.children.length > 0) {
            this._clampChoicesPanel(dialogueBox);
        }
        this._assertNoOverflow(dialogueBox);
    },
};

// ===== SCENE RENDERING =====
const sceneRenderer = {
    currentScene: null,
    currentHotspots: [],

    // Transition queue system
    transitionQueue: [],
    isTransitioning: false,
    dialogueExitDurationMs: 220,
    dialogueEnterDurationMs: 250,
    dialogueTypeSpeedMs: 24,

    // Transition state callbacks
    onTransitionStart: null,
    onTransitionComplete: null,
    validZones: new Set(['left', 'left-2', 'center', 'right-2', 'right']),
    DEFAULT_SPEECH_BUBBLE_SLOTS: {
        'left':    { left: 120,  top: 120, width: 720, height: 420 },
        'left-2':  { left: 160,  top: 270, width: 720, height: 420 },
        'right':   { left: 1080, top: 120, width: 720, height: 420 },
        'right-2': { left: 1040, top: 270, width: 720, height: 420 },
    },
    // Deterministic stacking order by slot — independent of DOM insertion
    // order, so composition never depends on which character loaded first.
    // An explicit char.zIndex always overrides this default.
    DEFAULT_CHARACTER_Z_INDEX: { left: 3, 'left-2': 2, center: 4, 'right-2': 2, right: 3 },
    // Populated by normalizeCharacterZones() each scene load; read by the
    // debug validator (hbValidateLayout) to surface duplicate-slot warnings.
    _lastCharacterLayoutWarnings: [],
    isTyping: false,

    /**
     * THE single place scene-authored character data becomes a resolved
     * layout. Treats `slot` (new canonical field) / `position` (legacy
     * field, still fully supported) as authoritative — neither this nor any
     * caller may remap a slot to avoid a collision; see
     * normalizeCharacterZones() for how collisions are surfaced instead.
     * Pure function: no DOM access, safe to call before a background/layer
     * exists.
     */
    resolveCharacterLayout(char) {
        const rawSlot = char.slot || char.position || 'center';
        const slot = this.normalizeZoneName(rawSlot);
        return {
            ...char,
            slot,
            // Keep `.position` in sync so every existing call site that
            // still reads `.position` (addCharacter, dialogue anchoring,
            // sprite dataset) continues to work unchanged.
            position: slot,
            scale: (typeof char.scale === 'number' && isFinite(char.scale) && char.scale > 0) ? char.scale : 1,
            offsetX: (typeof char.offsetX === 'number' && isFinite(char.offsetX)) ? char.offsetX : 0,
            offsetY: (typeof char.offsetY === 'number' && isFinite(char.offsetY)) ? char.offsetY : 0,
            zIndex: (typeof char.zIndex === 'number' && isFinite(char.zIndex)) ? char.zIndex : (this.DEFAULT_CHARACTER_Z_INDEX[slot] ?? 3),
            // Fractions (0-1) of the sprite's own rendered box where the
            // visible head actually is — null means "unknown", callers fall
            // back to the old top-of-rect assumption for compatibility.
            headAnchorX: (typeof char.headAnchorX === 'number' && isFinite(char.headAnchorX)) ? char.headAnchorX : null,
            headAnchorY: (typeof char.headAnchorY === 'number' && isFinite(char.headAnchorY)) ? char.headAnchorY : null,
        };
    },

    _bindDialogueTapHandlers() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (!dialogueBox || dialogueBox.dataset.tapHandlerBound === 'true') return;

        let touchStartTime = 0;
        let touchStartPos = null;

        const handleAdvanceTap = (e) => {
            const textEl = document.getElementById('dialogue-text');
            const continueBtn = document.getElementById('dialogue-continue');
            const choicesDiv = document.getElementById('dialogue-choices');
            const dialogueBox = document.getElementById('dialogue-box');
            if (!textEl || !continueBtn || !choicesDiv) return;

            if (e.target.closest('#dialogue-choices') || e.target.closest('#dialogue-continue')) {
                return;
            }

            // dialoguePager wires #dialogue-continue's onclick identically for
            // every page (single or multi) — first tap finishes typing (via
            // this same isTyping check), the next tap advances. No separate
            // "paging active" branch needed.
            if (this.isTyping) {
                e.preventDefault();
                e.stopPropagation();
                this.finishTypeText(textEl);
                return;
            }

            const hasChoices = choicesDiv.children.length > 0;
            const canContinue = !continueBtn.classList.contains('hidden') && typeof continueBtn.onclick === 'function';
            if (!hasChoices && canContinue) {
                e.preventDefault();
                e.stopPropagation();
                continueBtn.click();
            }
        };

        const handleInteraction = (e) => {
            if (e.type === 'click' && touchStartTime > Date.now() - 500) {
                return;
            }

            if (e.type === 'touchend' && touchStartPos) {
                const touch = e.changedTouches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                const deltaY = Math.abs(touch.clientY - touchStartPos.y);
                if (deltaX > 10 || deltaY > 10) {
                    return;
                }
            }

            handleAdvanceTap(e);
        };

        dialogueBox.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
        }, { passive: true });

        dialogueBox.addEventListener('touchend', handleInteraction, { passive: false });
        dialogueBox.addEventListener('click', handleInteraction);
        dialogueBox.dataset.tapHandlerBound = 'true';
    },

    typeText(el, fullText, options = {}) {
        if (!el) return { finish: () => {}, cancel: () => {} };

        this.cancelTypeText(el);

        const emphasisData = this._parseEmphasisMarkup(fullText);
        const resolvedText = emphasisData.text;
        const charDelayMs = Number.isFinite(options.charDelayMs) ? options.charDelayMs : this.dialogueTypeSpeedMs;
        const disabled = options.disabled === true;
        const onFinish = typeof options.onFinish === 'function' ? options.onFinish : null;
        const onCancel = typeof options.onCancel === 'function' ? options.onCancel : null;

        this._renderTypeTextAtIndex(el, emphasisData, 0);
        el.dataset.typing = 'true';
        this.isTyping = true;

        let index = 0;
        let timeoutId = null;
        let rafId = null;
        let done = false;

        const scheduleNextTick = (delayMs) => {
            timeoutId = window.setTimeout(() => {
                rafId = window.requestAnimationFrame(tick);
            }, delayMs);
        };

        const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(timeoutId);
            window.cancelAnimationFrame(rafId);
            this._renderTypeTextAtIndex(el, emphasisData, resolvedText.length);
            el.dataset.typing = 'false';
            this.isTyping = false;
            delete el._typeTextController;
            if (onFinish) onFinish();
        };

        const cancel = () => {
            if (done) return;
            done = true;
            clearTimeout(timeoutId);
            window.cancelAnimationFrame(rafId);
            el.dataset.typing = 'false';
            this.isTyping = false;
            delete el._typeTextController;
            if (onCancel) onCancel();
        };

        if (disabled || resolvedText.length === 0 || charDelayMs <= 0) {
            finish();
            return { finish, cancel };
        }

        const tick = () => {
            if (done) return;

            index += 1;
            this._renderTypeTextAtIndex(el, emphasisData, index);

            if (index >= resolvedText.length) {
                finish();
                return;
            }

            const currentChar = resolvedText[index - 1] || '';
            const prevChar = resolvedText[index - 2] || '';
            const delayMs = Number.isFinite(options.charDelayMs)
                ? charDelayMs
                : this.getCharDelay(currentChar, prevChar);

            scheduleNextTick(delayMs);
        };

        const initialDelayMs = Number.isFinite(options.charDelayMs)
            ? charDelayMs
            : this.getCharDelay(resolvedText[0] || '', '');

        scheduleNextTick(initialDelayMs);

        const controller = { finish, cancel };
        el._typeTextController = controller;
        return controller;
    },

    getCharDelay(char, prevChar) {
        const baseDelay = 20 + Math.floor(Math.random() * 11);

        if (char === '\n') {
            return baseDelay + 150;
        }

        if (char === '.' && prevChar === '.') {
            return baseDelay + 200 + Math.floor(Math.random() * 101);
        }

        if (char === ',' || char === '.') {
            return baseDelay + 120;
        }

        return baseDelay;
    },

    finishTypeText(el) {
        if (!el?._typeTextController) return false;
        el._typeTextController.finish();
        return true;
    },

    cancelTypeText(el) {
        if (!el?._typeTextController) {
            this.isTyping = false;
            if (el) el.dataset.typing = 'false';
            return false;
        }
        el._typeTextController.cancel();
        return true;
    },

    _cleanupTypewriter(el = document.getElementById('dialogue-text')) {
        this.cancelTypeText(el);
        this.isTyping = false;
    },

    _parseEmphasisMarkup(fullText) {
        const fallbackText = String(fullText || '');

        try {
            const tokens = fallbackText.split(/(\s+)/);
            const ranges = [];
            const parsedTokens = [];
            let currentIndex = 0;

            tokens.forEach((token) => {
                if (!token) return;

                if (/^\s+$/.test(token)) {
                    parsedTokens.push(token);
                    currentIndex += token.length;
                    return;
                }

                const parsed = this._parseEmphasisToken(token);
                parsedTokens.push(parsed.text);

                if (parsed.className) {
                    ranges.push({
                        start: currentIndex,
                        end: currentIndex + parsed.text.length,
                        className: parsed.className
                    });
                }

                currentIndex += parsed.text.length;
            });

            return {
                text: parsedTokens.join(''),
                ranges
            };
        } catch (error) {
            errorLogger.log('Dialogue emphasis parsing fallback', error, { fullText: fallbackText });
            return {
                text: fallbackText,
                ranges: []
            };
        }
    },

    _parseEmphasisToken(token = '') {
        if (token.length >= 3 && token.startsWith('*') && token.endsWith('*')) {
            const inner = token.slice(1, -1);
            if (inner && !inner.includes('*')) {
                return { text: inner, className: 'emphasis-angry' };
            }
        }

        if (token.length >= 3 && token.startsWith('_') && token.endsWith('_')) {
            const inner = token.slice(1, -1);
            if (inner && !inner.includes('_')) {
                return { text: inner, className: 'emphasis-whisper' };
            }
        }

        if (token.length >= 3 && token.startsWith('!') && token.endsWith('!')) {
            const inner = token.slice(1, -1);
            if (inner && !inner.includes('!')) {
                return { text: inner, className: 'emphasis-important' };
            }
        }

        return { text: token, className: '' };
    },

    _renderTypeTextAtIndex(el, emphasisData, charCount) {
        if (!el) return;

        const text = String(emphasisData?.text || '');
        const ranges = Array.isArray(emphasisData?.ranges) ? emphasisData.ranges : [];
        const clampedCount = Math.max(0, Math.min(charCount, text.length));

        if (ranges.length === 0) {
            el.textContent = text.slice(0, clampedCount);
            return;
        }

        const escaped = this._escapeHtml(text.slice(0, clampedCount));
        if (!escaped) {
            el.textContent = '';
            return;
        }

        let cursor = 0;
        let html = '';

        ranges.forEach((range) => {
            const start = Math.max(0, Math.min(range.start, clampedCount));
            const end = Math.max(start, Math.min(range.end, clampedCount));
            if (end <= start) return;

            if (cursor < start) {
                html += this._escapeHtml(text.slice(cursor, start));
            }

            const content = this._escapeHtml(text.slice(start, end));
            html += `<span class="${range.className}">${content}</span>`;
            cursor = end;
        });

        if (cursor < clampedCount) {
            html += this._escapeHtml(text.slice(cursor, clampedCount));
        }

        el.innerHTML = html;
    },

    _escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    _measureDialogueTextHeight(textEl, fullText) {
        if (!textEl) return 0;

        const previousText = textEl.textContent;
        const previousHtml = textEl.innerHTML;
        const previousMinHeight = textEl.style.minHeight;
        const emphasisData = this._parseEmphasisMarkup(fullText);

        textEl.style.minHeight = '0px';
        textEl.textContent = emphasisData.text;
        const measuredHeight = Math.ceil(textEl.scrollHeight || 0);

        textEl.innerHTML = previousHtml;
        if (textEl.textContent !== previousText) {
            textEl.textContent = previousText;
        }
        textEl.style.minHeight = previousMinHeight;

        return measuredHeight;
    },

    getZoneSide(zoneName = '') {
        if (String(zoneName).startsWith('left')) return 'left';
        if (String(zoneName).startsWith('right')) return 'right';
        return null;
    },

    buildSpriteCandidates(spriteName, zoneName) {
        if (!spriteName) return [];

        const candidates = [];
        const seen = new Set();
        const add = (value) => {
            if (!value || seen.has(value)) return;
            seen.add(value);
            candidates.push(value);
        };

        const side = this.getZoneSide(zoneName);
        const sideSuffix = side ? `-${side}` : '';
        const sideUnderscore = side ? `_${side}` : '';
        const hasDirectionalSuffix = /(?:-|_)(left|right)\.png$/i.test(spriteName);
        const baseName = spriteName.replace(/(?:-|_)(left|right)\.png$/i, '.png');

        if (side && !hasDirectionalSuffix) {
            add(baseName.replace(/\.png$/i, `${sideSuffix}.png`));
            add(baseName.replace(/\.png$/i, `${sideUnderscore}.png`));
            add(baseName.replace(/\.png$/i, `${sideSuffix}.png.png`));
            add(baseName.replace(/\.png$/i, `${sideUnderscore}.png.png`));
        }

        add(spriteName);

        if (spriteName.endsWith('.png')) {
            add(`${spriteName}.png`);
        }

        if (hasDirectionalSuffix) {
            add(spriteName.replace(/-left\.png$/i, '_left.png'));
            add(spriteName.replace(/-right\.png$/i, '_right.png'));
            add(spriteName.replace(/_left\.png$/i, '-left.png'));
            add(spriteName.replace(/_right\.png$/i, '-right.png'));
        }

        add(baseName);

        if (side) {
            // Last resort: use opposite-side art if that's all we have.
            const opposite = side === 'left' ? 'right' : 'left';
            add(baseName.replace(/\.png$/i, `-${opposite}.png`));
            add(baseName.replace(/\.png$/i, `_${opposite}.png`));
        }

        return candidates;
    },

    attachSpriteFallback(img, spriteCandidates) {
        // Validate inputs
        if (!img) {
            console.error('attachSpriteFallback: no img element provided');
            return;
        }

        if (!Array.isArray(spriteCandidates) || spriteCandidates.length === 0) {
            console.error('attachSpriteFallback: invalid sprite candidates', { spriteCandidates });
            // Show placeholder immediately
            const placeholderSrc = getMissingAssetPlaceholder('unknown-character.png', 240, 320);
            img.src = placeholderSrc;
            img.alt = 'Missing character sprite';
            return;
        }

        let candidateIndex = 0;

        const applyCandidate = () => {
            if (candidateIndex >= spriteCandidates.length) {
                // All candidates failed - show placeholder
                const lastTried = spriteCandidates[spriteCandidates.length - 1] || 'unknown';
                console.error(`All character sprite candidates failed for ${lastTried}`, {
                    candidates: spriteCandidates
                });

                const placeholderSrc = getMissingAssetPlaceholder(lastTried, 240, 320);
                img.src = placeholderSrc;
                img.alt = `Missing: ${lastTried}`;
                return;
            }

            const spriteName = spriteCandidates[candidateIndex];
            const spriteSrc = `./assets/characters/${spriteName}`;
            img.dataset.spriteCandidate = spriteName;
            img.dataset.candidateIndex = candidateIndex;
            img.src = spriteSrc;
        };

        // Success handler - only process transparency after successful load
        img.onload = () => {
            // Only process if this is an actual sprite (not placeholder)
            if (!img.src.includes('data:image/svg')) {
                spriteTransparencyProcessor.makeWhitePixelsTransparent(img);
            }
        };

        // Error handler - try next candidate
        img.onerror = () => {
            const failedSprite = img.dataset.spriteCandidate || 'unknown';
            candidateIndex += 1;

            if (candidateIndex < spriteCandidates.length) {
                const nextSprite = spriteCandidates[candidateIndex];
                console.warn(`Character sprite ${failedSprite} missing, trying ${nextSprite} (${candidateIndex + 1}/${spriteCandidates.length})`);
                applyCandidate();
            } else {
                // All failed, apply placeholder
                applyCandidate();
            }
        };

        // Start the fallback chain
        applyCandidate();
    },

    normalizeZoneName(zoneName) {
        return this.validZones.has(zoneName) ? zoneName : 'center';
    },

    /**
     * Resolves each scene character's authored slot/position through
     * resolveCharacterLayout() — authoritative, never remapped. If two
     * characters claim the same slot this does NOT silently move either one
     * (that was the old behavior); it records a warning (surfaced by the
     * debug validator as a `duplicate-slot` violation) and leaves both
     * characters exactly where the scene author put them. addCharacter()
     * must not run a second, independent remap on top of this one.
     */
    normalizeCharacterZones(characters) {
        this._lastCharacterLayoutWarnings = [];

        const resolved = (characters || []).map(char => this.resolveCharacterLayout(char));

        const bySlot = new Map();
        resolved.forEach(char => {
            if (!bySlot.has(char.slot)) bySlot.set(char.slot, []);
            bySlot.get(char.slot).push(char);
        });
        bySlot.forEach((group, slot) => {
            if (group.length <= 1) return;
            const ids = group.map(c => c.id || c.name || '(unnamed)');
            const warning = {
                type: 'duplicate-slot',
                sceneId: this.currentScene?.id || null,
                slot,
                characters: ids,
            };
            this._lastCharacterLayoutWarnings.push(warning);
            console.warn(`[sceneRenderer] Duplicate character slot "${slot}" claimed by: ${ids.join(', ')} — both will render in the same spot (scene "${warning.sceneId}"). Assign distinct slot/position values.`);
        });

        return resolved;
    },

    /**
     * Adds one character sprite to the scene. Always resolves the character
     * through resolveCharacterLayout() itself — the SAME schema resolution
     * normalizeCharacterZones() uses — so a character added later via a
     * dialogue onClick/onEnter callback (not part of the scene's initial
     * `characters` array) gets identical slot/scale/offset/zIndex/head-anchor
     * handling. There is no second remap here: whatever slot the caller
     * resolved (or the raw scene data specifies) is authoritative.
     *
     * Sequenced in three explicit phases: load the sprite asset, THEN apply
     * the deterministic position/layout metadata, THEN start the entry
     * (slide-in) animation — so composition never depends on how far
     * along the asset fetch happened to be.
     */
    async addCharacter(char, slideDelay = 100) {
        const resolvedChar = this.resolveCharacterLayout(char);
        const charLayer = document.getElementById('character-layer');
        const zoneName = resolvedChar.slot;

        const bg = document.getElementById('scene-background');
        if (bg && !bg.complete) {
            await new Promise(resolve => {
                bg.addEventListener('load', resolve, { once: true });
                bg.addEventListener('error', resolve, { once: true });
                setTimeout(resolve, 1000);
            });
        }

        // ===== 1. Load sprite asset first (detached — no DOM/positioning
        // dependency; images load regardless of DOM attachment) =====
        const img = document.createElement('img');
        img.alt = resolvedChar.name || '';
        const spriteCandidates = this.buildSpriteCandidates(resolvedChar.sprite, zoneName);

        await new Promise(resolve => {
            let resolved = false;
            const finish = () => {
                if (resolved) return;
                resolved = true;
                resolve();
            };

            this.attachSpriteFallback(img, spriteCandidates);

            // Poll briefly since attachSpriteFallback has its own onload
            const pollInterval = setInterval(() => {
                if (img.dataset.whiteRemoved === 'true' || (img.complete && img.src.includes('data:image'))) {
                    clearInterval(pollInterval);
                    requestAnimationFrame(() => requestAnimationFrame(finish));
                }
            }, 50);

            // Safety timeout
            setTimeout(() => {
                clearInterval(pollInterval);
                finish();
            }, 2500);
        });

        // ===== 2. Apply deterministic position + layout metadata =====
        img.className = `character-sprite char-${zoneName}`;
        img.dataset.zone = zoneName;
        img.dataset.slot = zoneName;
        img.dataset.characterId = resolvedChar.id || '';
        img.dataset.characterName = (resolvedChar.name || '').toUpperCase();
        if (resolvedChar.id) img.id = `char-${resolvedChar.id}`;
        img.dataset.offsetX = String(resolvedChar.offsetX);
        img.dataset.offsetY = String(resolvedChar.offsetY);
        if (resolvedChar.headAnchorX !== null) img.dataset.headAnchorX = String(resolvedChar.headAnchorX);
        if (resolvedChar.headAnchorY !== null) img.dataset.headAnchorY = String(resolvedChar.headAnchorY);
        img.style.zIndex = resolvedChar.zIndex;
        // Scale composes with the slide-in/visible transform via a CSS
        // custom property (see styles.css) instead of JS setting `transform`
        // directly, so it never fights the slide animation.
        img.style.setProperty('--char-scale', String(resolvedChar.scale));

        const pos = positioningSystem.calculateCharacterPosition(zoneName, {
            offsetX: resolvedChar.offsetX,
            offsetY: resolvedChar.offsetY,
        });
        positioningSystem.applyPosition(img, pos);

        // Add slide direction class (starts offscreen + transparent via CSS)
        const side = this.getZoneSide(zoneName);
        if (side === 'left') img.classList.add('slide-in-left');
        else if (side === 'right') img.classList.add('slide-in-right');

        charLayer.appendChild(img);

        // ===== 3. Start entry animation =====
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

    /**
     * Swap a character's sprite expression in-place without re-positioning.
     * Usage: sceneRenderer.swapExpression('hank', 'char_hank_angry-left.png');
     */
    swapExpression(charId, newSprite) {
        const img = document.getElementById(`char-${charId}`);
        if (!img) {
            console.warn(`swapExpression: character '${charId}' not found in scene`);
            return;
        }

        const zoneName = img.dataset.zone || 'center';
        const candidates = this.buildSpriteCandidates(newSprite, zoneName);

        if (candidates.length === 0) return;

        // Subtle flash transition for expression change
        img.style.transition = 'opacity 0.15s ease';
        img.style.opacity = '0.7';

        // Detach old error handler and set new src
        const oldOnError = img.onerror;
        const oldOnLoad = img.onload;
        let candidateIdx = 0;

        const tryNext = () => {
            if (candidateIdx >= candidates.length) {
                // All failed — restore original
                img.onerror = oldOnError;
                img.onload = oldOnLoad;
                img.style.opacity = '1';
                return;
            }
            img.src = `./assets/characters/${candidates[candidateIdx]}`;
            candidateIdx += 1;
        };

        img.onerror = () => tryNext();
        img.onload = () => {
            // Process transparency on new expression
            if (!img.src.includes('data:image/svg')) {
                img.dataset.whiteRemoved = 'false'; // Force reprocess
                spriteTransparencyProcessor.makeWhitePixelsTransparent(img);
            }

            // Fade back in
            requestAnimationFrame(() => {
                img.style.opacity = '1';
                setTimeout(() => {
                    img.style.transition = '';
                    img.onerror = oldOnError;
                    img.onload = oldOnLoad;
                }, 200);
            });
        };

        tryNext();
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

        this.isTransitioning = true;
        gameState.sceneTransitioning = true;

        try {
            // _executeSceneLoad() fires onTransitionStart/onTransitionComplete
            // itself (with try/catch protection), scoped to the actual
            // transition work — do not fire them here too. Doing so
            // double-invoked every callback once per transition.
            await this._executeSceneLoad(sceneId);

        } catch (error) {
            // Log detailed error for debugging
            errorLogger.log('scene-transition-failed', error, {
                sceneId,
                currentScene: this.currentScene?.id,
                timestamp: new Date().toISOString()
            });

            // Show user-friendly error
            console.error('Scene transition failed:', sceneId, error);

            // Try to recover by showing error overlay
            const fadeOverlay = document.getElementById('fade-overlay');
            if (fadeOverlay) {
                fadeOverlay.style.opacity = '0.95';
                fadeOverlay.style.pointerEvents = 'all';
                fadeOverlay.innerHTML = `
                    <div style="text-align: center; color: #FFD700; padding: 40px;">
                        <h2>Scene Transition Error</h2>
                        <p style="color: #fff; margin: 20px 0;">Failed to load scene: ${sceneId}</p>
                        <button onclick="location.reload()" style="
                            padding: 12px 24px;
                            background: #FFD700;
                            color: #000;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Reload Game</button>
                    </div>
                `;
            }

        } finally {
            // CRITICAL: Always unlock, even if transition failed
            this.isTransitioning = false;
            gameState.sceneTransitioning = false;
        }
    },

    _getPredictedNextScenes(scene) {
        const predicted = new Set();

        (scene.dialogue || []).forEach(entry => {
            // Direct scene ID references
            if (typeof entry.next === 'string' && entry.next !== 'NEXT_DIALOGUE' && SCENES[entry.next]) {
                predicted.add(entry.next);
            }

            // Choice targets
            (entry.choices || []).forEach(choice => {
                // We can't peek into function bodies, but we can check
                // if the choice action source mentions loadScene
                // For now, just preload based on known scene flow
            });
        });

        // Also check hotspot targets
        (scene.hotspots || []).forEach(hs => {
            if (hs.target && SCENES[hs.target]) {
                predicted.add(hs.target);
            }
        });

        return Array.from(predicted);
    },

    async _executeSceneLoad(sceneId) {
        const scene = SCENES[sceneId];
        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }

        document.body.classList.toggle('main-menu', sceneId === 'S0_MAIN_MENU');
        if (sceneId === 'S0_MAIN_MENU') {
            document.getElementById('scene-title').textContent = '';
        }

        // Only show spinner for initial load, not scene transitions
        if (gameState.currentSceneId === 'S0_MAIN_MENU' && sceneId !== 'S0_MAIN_MENU') {
            showTransitionLoader();
        }

        const alreadyRunning = this.transition?.isRunning;
        if (!alreadyRunning) {
            this.transition.isRunning = true;
        }

        try {
            if (!alreadyRunning) {
                await this._fadeOverlay(true);
            }

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
            gameState.storyProgress.currentChapter = scene.chapter || scene.chapterId || null;
            gameState.storyProgress.lastSceneTitle = scene.title || sceneId;
            gameState.storyProgress.lastObjective = scene.objective || null;

            if (Array.isArray(scene.journal)) {
                scene.journal.forEach(entry => {
                    if (!entry) return;
                    addJournalOnce(entry.key, entry.title, entry.content);
                });
            }

            Dev.updateStatus();
            gameState.currentDialogueIndex = 0;
            gameState.objectsClicked.clear();

            // Fade to black (fade in overlay)
            await this.fadeTransition(true);

            // Clear scene and wait for all character removal animations to complete
            await this.clearScene();

            const bg = document.getElementById('scene-background');
            assetLoader.registerBackgroundFallback(bg, scene.background);
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

            // Add cinematic zoom-in on background
            bg.classList.add('scene-entering');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bg.classList.remove('scene-entering');
                    bg.classList.add('scene-entered');
                });
            });

            const titleEl = document.getElementById('scene-title');
            titleEl.textContent = scene.title || '';
            titleEl.classList.remove('title-visible', 'title-animate');

            // Animate title after fade-from-black
            if (scene.title && sceneId !== 'S0_MAIN_MENU') {
                setTimeout(() => {
                    titleEl.classList.add('title-animate');
                    // After animation, keep visible
                    setTimeout(() => {
                        titleEl.classList.remove('title-animate');
                        titleEl.classList.add('title-visible');
                    }, 800);
                }, 200); // Start slightly after fade completes
            }

            if (sceneId !== 'S0_MAIN_MENU') {
                this._showSceneTitleFx(scene.title || sceneId);
            }

            if (scene.characters) {
                await this.loadCharacters(scene.characters);
            }

            if (scene.items) {
                this.loadItems(scene.items);
            }

            if (scene.hotspots) {
                const runtimeHotspots = Dev.hotspots.getRuntimeHotspots(sceneId, scene.hotspots);
                this.currentHotspots = runtimeHotspots;
                this.loadHotspots(runtimeHotspots);
            }

            // Lazy-load non-critical assets for future interactions
            assetLoader.lazyLoadSceneAssets(scene);

            // Predictively preload next scene's assets during dialogue reading time
            const predictedScenes = this._getPredictedNextScenes(scene);
            predictedScenes.forEach(nextSceneId => {
                const nextScene = SCENES[nextSceneId];
                if (nextScene) {
                    assetLoader.lazyLoadSceneAssets(nextScene);
                    // Also preload the background
                    if (nextScene.background) {
                        assetLoader.preloadSingleAsset(nextScene.background, { logErrors: false });
                    }
                }
            });

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
            Dev.tools.applyForCurrentScene();
        } catch (error) {
            errorLogger.log('scene-transition', error, { sceneId });
            this._cleanupTypewriter(document.getElementById('dialogue-text'));
            document.getElementById('dialogue-box').classList.add('hidden');
            throw error;
        } finally {
            // Keep visual continuity as the last scene elements settle.
            await new Promise(resolve => setTimeout(resolve, 100));
            hideTransitionLoader(); // Safe to call even if not shown

            // Clear transitioning state
            this.isTransitioning = false;
            gameState.sceneTransitioning = false;

            // Unblock interactions
            this._setInteractionBlocking(false);

            if (!alreadyRunning) {
                await this._fadeOverlay(false);
                this.transition.isRunning = false;
            }
        }
    },

    refreshCurrentHotspots(options = {}) {
        const shouldReapplyTools = options.reapplyTools !== false;
        const sceneId = gameState.currentSceneId;
        const scene = SCENES[sceneId];
        if (!scene) return;
        const hotspotLayer = document.getElementById('hotspot-layer');
        if (!hotspotLayer) return;
        hotspotLayer.replaceChildren();
        this.currentHotspots = Dev.hotspots.getRuntimeHotspots(sceneId, scene.hotspots || []);
        this.loadHotspots(this.currentHotspots);
        if (shouldReapplyTools) {
            Dev.tools.applyForCurrentScene();
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
        // Clear every scene-owned timer before tearing down the old scene —
        // otherwise a reanchor/lock-safety timer from the previous scene can
        // fire mid-transition (or into the new scene) and touch a dialogue
        // box/lock state that no longer belongs to it.
        clearTimeout(this._dialogueReanchorTimer);
        clearTimeout(this._dialogueLockTimeout);

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
                const bg = document.getElementById('scene-background');
                if (bg) {
                    bg.classList.remove('scene-entering', 'scene-entered');
                }

                document.getElementById('character-layer').replaceChildren();
                document.getElementById('item-layer').replaceChildren();
                document.getElementById('hotspot-layer').replaceChildren();
                this.currentHotspots = [];
                this._cleanupTypewriter(document.getElementById('dialogue-text'));
                dialoguePager.reset();
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
    
    async loadCharacters(characters) {
        const normalizedCharacters = this.normalizeCharacterZones(characters);

        if (normalizedCharacters.length > 0) {
            for (let i = 0; i < normalizedCharacters.length; i++) {
                // Stagger: first character at 200ms, then 400ms between each
                await this.addCharacter(normalizedCharacters[i], 200 + (i * 400));
            }
        }
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
                if (Dev.hotspots.shouldBlockGameplay() || gameState.actionLock || gameState.sceneTransitioning) return;
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

            // Scale minimum touch target to viewport — 44px at 1920, proportionally smaller at smaller viewports
            const rect = positioningSystem.getBackgroundRect();
            if (rect) {
                const scaledMin = Math.max(30, Math.round(44 * rect.nativeScaleX));
                div.style.minWidth = `${scaledMin}px`;
                div.style.minHeight = `${scaledMin}px`;
            }

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

            let touchStartTime = 0;
            let touchStartPos = null;

            const handleHotspotClick = () => {
                if (Dev.hotspots.shouldBlockGameplay() || gameState.actionLock || gameState.sceneTransitioning) return;
                gameState.actionLock = true;
                SFXGenerator.playButtonClick();
                if (hotspot.onClick) {
                    hotspot.onClick();
                } else if (hotspot.target && SCENES[hotspot.target]) {
                    sceneRenderer.loadScene(hotspot.target);
                }
                setTimeout(() => {
                    gameState.actionLock = false;
                }, 300);
            };

            const handleInteraction = (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (e.type === 'click') {
                    Dev.trace.recordClick(e);
                }

                // Prevent double-firing on devices that support both touch and click
                if (e.type === 'click' && touchStartTime > Date.now() - 500) {
                    return;
                }

                // For touch events, check if this was a tap (not a scroll)
                if (e.type === 'touchend' && touchStartPos) {
                    const touch = e.changedTouches[0];
                    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

                    // If moved more than 10px, treat as scroll not tap
                    if (deltaX > 10 || deltaY > 10) {
                        return;
                    }

                    // Debug: log tap position in native image coordinates
                    if (gameState.settings.showHotspots) {
                        const nativePoint = positioningSystem.clientToNative(touch.clientX, touch.clientY);
                        if (nativePoint && DEBUG) {
                            const imgX = Math.round(nativePoint.x);
                            const imgY = Math.round(nativePoint.y);
                            console.log(`[Hotspot Debug] Tap on "${hotspot.id || hotspot.label}" → native image coords: (${imgX}, ${imgY}) | screen: (${Math.round(nativePoint.localX)}, ${Math.round(nativePoint.localY)})`);
                        }
                    }
                }

                // Debug: log click position in native image coordinates
                if (e.type === 'click' && gameState.settings.showHotspots) {
                    const nativePoint = positioningSystem.clientToNative(e.clientX, e.clientY);
                    if (nativePoint && DEBUG) {
                        const imgX = Math.round(nativePoint.x);
                        const imgY = Math.round(nativePoint.y);
                        console.log(`[Hotspot Debug] Click on "${hotspot.id || hotspot.label}" → native image coords: (${imgX}, ${imgY}) | screen: (${Math.round(nativePoint.localX)}, ${Math.round(nativePoint.localY)})`);
                    }
                }

                handleHotspotClick();
            };

            div.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                const touch = e.touches[0];
                touchStartPos = { x: touch.clientX, y: touch.clientY };
            }, { passive: true });

            div.addEventListener('touchend', handleInteraction, { passive: false });
            div.addEventListener('click', handleInteraction);

            hotspotLayer.appendChild(div);
        });
    },
    
    async _ensureSpeakerPresent(dialogueEntry) {
        const speaker = dialogueEntry.speaker;
        const characterId = dialogueEntry.characterId;
        const isSpecialSpeaker = speaker === 'NARRATION' || speaker === 'SYSTEM' || speaker === 'CHOICE' || speaker === 'FINAL CHOICE';
        if (isSpecialSpeaker || (!speaker && !characterId)) {
            return;
        }
        const speakerUpper = (speaker || '').toUpperCase();
        const characterIdLower = (characterId || '').toLowerCase();

        // characterId first, exact speaker name second — matches the same
        // priority _resolveDialogueCharacter()/_setSpeakingCharacter() use.
        const existing = Array.from(document.querySelectorAll('#character-layer .character-sprite'))
            .find(el =>
                (characterId && (el.dataset.characterId || '').toLowerCase() === characterIdLower) ||
                (speakerUpper && (el.dataset.characterName || '').toUpperCase() === speakerUpper)
            );
        if (existing) return;

        const chars = this.currentScene?.characters || [];
        const found = chars.find(c =>
            (characterId && (c.id || '').toLowerCase() === characterIdLower) ||
            (speakerUpper && (c.name || '').toUpperCase() === speakerUpper) ||
            (speakerUpper && (c.id || '').toLowerCase() === speakerUpper.toLowerCase())
        );
        if (found) {
            await this.addCharacter(found, 0);
        } else {
            if (!this._ensureSpeakerWarned) this._ensureSpeakerWarned = new Set();
            const warnKey = `${this.currentScene?.id}:${characterId || speaker}`;
            if (!this._ensureSpeakerWarned.has(warnKey)) {
                this._ensureSpeakerWarned.add(warnKey);
                console.warn(`[sceneRenderer] Speaker "${characterId || speaker}" not found in scene "${this.currentScene?.id}"`);
            }
        }
    },

    /**
     * Highlights the sprite belonging to the current speaker. Resolution
     * priority: explicit characterId first, exact id/name match second —
     * there is no zone fallback here (highlighting the wrong sprite by
     * zone guesswork is worse than highlighting none).
     */
    _setSpeakingCharacter(speakerName, characterId) {
        const sprites = Array.from(document.querySelectorAll('#character-layer .character-sprite'));
        if (!sprites.length) return;

        const normalizedSpeaker = String(speakerName || '').trim().toUpperCase();
        const normalizedCharacterId = String(characterId || '').trim().toUpperCase();
        const isSpecialSpeaker = ['NARRATION', 'SYSTEM', 'CHOICE', 'FINAL CHOICE'].includes(normalizedSpeaker);

        if (isSpecialSpeaker || (!normalizedSpeaker && !normalizedCharacterId)) {
            sprites.forEach(sprite => sprite.classList.remove('is-speaking'));
            return;
        }

        // Priority 1: explicit characterId
        let matchingSprite = normalizedCharacterId
            ? sprites.find(sprite => (sprite.dataset.characterId || '').toUpperCase() === normalizedCharacterId)
            : null;

        // Priority 2: exact id/name match via the speaker string
        if (!matchingSprite && normalizedSpeaker) {
            matchingSprite = sprites.find(sprite => {
                const byName = (sprite.dataset.characterName || '').toUpperCase() === normalizedSpeaker;
                if (byName) return true;

                const spriteCharacterId = (sprite.dataset.characterId || '').toUpperCase();
                if (spriteCharacterId && spriteCharacterId === normalizedSpeaker) return true;

                const spriteId = (sprite.id || '').replace(/^char-/, '').toUpperCase();
                return spriteId && spriteId === normalizedSpeaker;
            });
        }

        sprites.forEach(sprite => {
            sprite.classList.toggle('is-speaking', sprite === matchingSprite);
        });
    },

    async showDialogue(dialogueEntry) {
        try {
            this._bindDialogueTapHandlers();
            gameState.currentDialogueEntry = dialogueEntry;
            this._setSpeakingCharacter(dialogueEntry?.speaker, dialogueEntry?.characterId);
            // Pagination state resets completely for every new entry — see
            // dialoguePager.reset() (also called from _closeDialogueThen()
            // and clearScene() for the close/scene-transition cases).
            dialoguePager.reset();

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

            // Safety: auto-release lock after 30 seconds to prevent permanent lockout
            clearTimeout(this._dialogueLockTimeout);
            this._dialogueLockTimeout = setTimeout(() => {
                if (gameState.dialogueLock) {
                    console.warn('Dialogue lock safety timeout — releasing stuck lock');
                    gameState.dialogueLock = false;
                }
            }, 30000);

            // Call onShow callback if it exists (for character slide-ins, etc.)
            if (dialogueEntry.onShow) {
                try {
                    const onShowResult = dialogueEntry.onShow();
                    if (onShowResult && typeof onShowResult.catch === 'function') {
                        onShowResult.catch(error => {
                            errorLogger.log('dialogue-onShow-async', error, {
                                sceneId: gameState.currentSceneId,
                                speaker: dialogueEntry.speaker
                            });
                        });
                    }
                } catch (error) {
                    errorLogger.log('dialogue-onShow', error, {
                        sceneId: gameState.currentSceneId,
                        speaker: dialogueEntry.speaker
                    });
                }
            }

            // bubbleDelay: hold off showing the dialogue box so a character can
            // finish sliding in before the speech bubble pops in.
            if (dialogueEntry.bubbleDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, dialogueEntry.bubbleDelay));
            }

            const dialogueBox = document.getElementById('dialogue-box');
            const dialogueContainer = document.getElementById('dialogue-container');
            const dialogueBubble = document.getElementById('dialogue-bubble');
            const speaker = document.getElementById('dialogue-speaker');
            const text = document.getElementById('dialogue-text');
            const choicesDiv = document.getElementById('dialogue-choices');
            const continueBtn = document.getElementById('dialogue-continue');

            this._cleanupTypewriter(text);

            // Set positioning mode based on dialogue type
            if (dialogueEntry.type === 'narration' || !dialogueEntry.speaker) {
                dialogueBox.setAttribute('data-mode', 'narration');
            } else {
                dialogueBox.removeAttribute('data-mode');
            }

            choicesDiv.innerHTML = '';
            continueBtn.classList.add('hidden');
            dialogueBox.classList.remove('dialogue-enter', 'dialogue-exit');
            dialogueBox.classList.add('dialogue-positioning');
            // Make the box layout-visible (but opacity-hidden) before measurements.
            // .hidden uses display:none !important which makes getBoundingClientRect()
            // return all-zeros, breaking dialoguePager measurement and positioning logic.
            dialogueBox.classList.remove('hidden');

            // Clear previous position/size classes and inline overrides from the prior
            // entry so a mode that doesn't set width/height (character/narrative/
            // top-center) doesn't inherit a stale authored/zone-slot rectangle.
            dialogueBox.classList.remove('dialogue-left', 'dialogue-right', 'dialogue-center', 'dialogue-offscreen', 'dialogue-anchored');
            dialogueBox.style.left = '';
            dialogueBox.style.right = '';
            dialogueBox.style.top = '';
            dialogueBox.style.bottom = '';
            dialogueBox.style.width = '';
            dialogueBox.style.height = '';
            dialogueBox.style.transform = '';

            const isNarration = !dialogueEntry.speaker || dialogueEntry.speaker === 'NARRATION' || dialogueEntry.speaker === 'SYSTEM';
            const isChoice = dialogueEntry.speaker === 'CHOICE' || dialogueEntry.speaker === 'FINAL CHOICE';
            let speechPos = 'left';

            if (isNarration) {
                dialogueBox.dataset.layoutPanel = 'narrative-box';
                dialogueContainer.classList.add('narrative-mode');
                dialogueBox.classList.add('dialogue-center');
                speaker.className = 'narration';
                text.className = 'narration';
                speaker.textContent = '';
            } else if (isChoice) {
                dialogueBox.dataset.layoutPanel = 'narrative-box';
                dialogueContainer.classList.add('narrative-mode');
                dialogueBox.classList.add('dialogue-center');
                speaker.className = 'choice-speaker';
                text.className = 'choice-text';
                speaker.textContent = dialogueEntry.speaker;
            } else {
                await this._ensureSpeakerPresent(dialogueEntry);

                dialogueBox.dataset.layoutPanel = 'speech-bubble';
                dialogueContainer.classList.remove('narrative-mode');

                const pos = this.normalizeZoneName(dialogueEntry.position || 'left');
                speechPos = pos;
                const isLeft = pos === 'left' || pos === 'left-2';
                const isRight = pos === 'right' || pos === 'right-2';

                if (isLeft) {
                    dialogueBox.classList.add('dialogue-left');
                } else if (isRight) {
                    dialogueBox.classList.add('dialogue-right');
                } else {
                    dialogueBox.classList.add('dialogue-center');
                }

                speaker.className = '';
                text.className = '';
                speaker.textContent = dialogueEntry.speaker;
                dialogueBox.dataset.zone = pos;
            }

            this._activeDialogueEntry = dialogueEntry;

            // The dialoguePager pipeline (see its own docstring for the full
            // 8-step breakdown):
            //   1. resolve layout rect      -> layoutDialogue() (pre-fit pass)
            //   2. wait for fonts           -> document.fonts.ready + timeout
            //   3-4. measure available height, speaker, action area, padding
            //   5. paginate at word/sentence boundaries
            // prepare() runs 1-5 and returns null only if a newer entry
            // superseded this call while awaiting fonts.
            const pagerState = await dialoguePager.prepare(dialogueBox, dialogueEntry, this);
            if (!pagerState) return;

            this._debugAssertAuthoredLayout(dialogueBox, dialogueEntry, pagerState.layoutMode);
            this._clampDialogueToViewport(dialogueBox, { preserveCentered: pagerState.layoutMode === 'narrative' });
            Dev.layout.applySavedLayouts();

            // The delayed re-anchor exists so a still-sliding-in character can be
            // re-measured once its animation settles. Only meaningful for explicit
            // character-relative mode — authored/zone-slot rects never depend on
            // character position, so they must never be re-anchored here.
            clearTimeout(this._dialogueReanchorTimer);
            if (pagerState.layoutMode === 'character') {
                this._dialogueReanchorTimer = setTimeout(() => {
                    if (this._activeDialogueEntry !== dialogueEntry || dialogueBox.classList.contains('hidden')) return;
                    this.layoutDialogue(dialogueBox, dialogueEntry);
                    this._clampDialogueToViewport(dialogueBox);
                }, 180);
            }

            // 6-8: type the first page, wire tap/advance, render the action
            // area once typing finishes, and assert no overflow.
            dialoguePager.renderCurrentPage(dialogueBox, this);

            // Reveal after positioning settles (double-rAF ensures layout is
            // applied). Reapply the same resolved mode once more for
            // late-settling fonts/assets — see layoutDialogue()'s docstring
            // for why this never changes the mode — then let the pager
            // re-clamp the choices panel/re-assert against the settled box.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const settledMode = this.layoutDialogue(dialogueBox, dialogueEntry);
                    this._clampDialogueToViewport(dialogueBox, { preserveCentered: settledMode === 'narrative' });
                    dialoguePager.reflow(dialogueBox);
                    dialogueBox.classList.remove('dialogue-positioning');
                    this._animateDialogueEntry();
                });
            });
        } catch (error) {
            errorLogger.log('dialogue-render', error, { sceneId: gameState.currentSceneId, dialogueEntry });
            const dialogueBox = document.getElementById('dialogue-box');
            if (dialogueBox) {
                this._cleanupTypewriter(document.getElementById('dialogue-text'));
                dialogueBox.classList.add('hidden');
            }
            gameState.dialogueLock = false;
            setTimeout(() => this.nextDialogue(), 500);
        }
    },

    /**
     * Resolves a dialogue entry's `next` field — 'NEXT_DIALOGUE' advances
     * within the current scene, a function runs arbitrary logic (scene
     * change, flag updates, etc.), and a string loads that scene directly.
     * Single implementation used by dialoguePager's continue-button handler
     * (previously duplicated inline for the single-page and per-page-
     * pagination code paths).
     */
    _advanceDialogueEntry(dialogueEntry) {
        if (dialogueEntry.next === 'NEXT_DIALOGUE') {
            this.nextDialogue();
        } else if (typeof dialogueEntry.next === 'function') {
            dialogueEntry.next();
        } else if (dialogueEntry.next) {
            this.loadScene(dialogueEntry.next);
        }
    },

    _clampDialogueToViewport(dialogueBox, options = {}) {
        const preserveCentered = Boolean(options.preserveCentered);

        const container = document.getElementById('scene-container');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const boxRect = dialogueBox.getBoundingClientRect();
        // Pad/HUD reservation now comes from live CSS (--dlg-safe-pad,
        // #hud::before) via getDialogueSafeRect() itself — no isMobile heuristic needed.
        const safe = positioningSystem.getDialogueSafeRect();
        if (!safe) return;

        const minLeft = safe.left;
        const maxRight = safe.right;
        const minTop = safe.top;
        const maxBottom = safe.bottom;

        if (preserveCentered) {
            const centeredLeft = (containerRect.width - boxRect.width) / 2;
            let centeredTop = (containerRect.height - boxRect.height) / 2;
            centeredTop = Math.max(minTop, centeredTop);
            centeredTop = Math.min(maxBottom - boxRect.height, centeredTop);

            dialogueBox.style.left = `${Math.max(minLeft, centeredLeft)}px`;
            dialogueBox.style.right = 'auto';
            dialogueBox.style.top = `${Math.max(minTop, centeredTop)}px`;
            dialogueBox.style.bottom = 'auto';
            dialogueBox.style.transform = 'none';
            return;
        }

        let left = boxRect.left - containerRect.left;
        let top = boxRect.top - containerRect.top;

        if (left < minLeft) left = minLeft;
        if (left + boxRect.width > maxRight) left = maxRight - boxRect.width;
        if (top < minTop) top = minTop;
        if (top + boxRect.height > maxBottom) top = maxBottom - boxRect.height;

        const shouldAdjust = Math.abs((boxRect.left - containerRect.left) - left) > 1
            || Math.abs((boxRect.top - containerRect.top) - top) > 1;

        if (shouldAdjust) {
            dialogueBox.style.left = `${Math.max(minLeft, left)}px`;
            dialogueBox.style.right = 'auto';
            dialogueBox.style.top = `${Math.max(minTop, top)}px`;
            dialogueBox.style.bottom = 'auto';
            dialogueBox.style.transform = 'none';
        }
    },

    /**
     * Speaker -> sprite resolution priority: explicit dialogueEntry.characterId
     * first (exact, unambiguous), then exact character id/name match, then
     * fuzzy name matching, then zone fallback last.
     */
    _resolveDialogueCharacter(zoneName, dialogueEntry) {
        const characterId = (dialogueEntry?.characterId || '').trim();
        if (characterId) {
            const byCharacterId = document.querySelector(`#character-layer .character-sprite[data-character-id="${characterId}"]`);
            if (byCharacterId) return byCharacterId;
        }

        const speakerName = (dialogueEntry?.speaker || '').toUpperCase().trim();
        const normalizeSpeakerToken = (value) => (value || '')
            .toUpperCase()
            .replace(/[^A-Z0-9 ]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const normalizedSpeaker = normalizeSpeakerToken(speakerName);
        const sceneChars = this.currentScene?.characters || [];

        const bySpeakerMeta = sceneChars.find(char => {
            const charName = (char.name || '').toUpperCase().trim();
            const normalizedChar = normalizeSpeakerToken(charName);
            return normalizedSpeaker && (
                charName === speakerName
                || normalizedChar === normalizedSpeaker
                || normalizedChar.includes(normalizedSpeaker)
                || normalizedSpeaker.includes(normalizedChar)
            );
        });

        if (bySpeakerMeta?.id) {
            const byId = document.querySelector(`#character-layer .character-sprite[data-character-id="${bySpeakerMeta.id}"]`);
            if (byId) return byId;
        }

        if (speakerName) {
            const byName = Array.from(document.querySelectorAll('#character-layer .character-sprite'))
                .find(el => {
                    const charName = (el.dataset.characterName || '').trim();
                    const normalizedChar = normalizeSpeakerToken(charName);
                    return charName === speakerName
                        || normalizedChar === normalizedSpeaker
                        || normalizedChar.includes(normalizedSpeaker)
                        || normalizedSpeaker.includes(normalizedChar);
                });
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
        if (!characterEl) {
            this._positionDialogueTopCenter(dialogueBox);
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const charRect = characterEl.getBoundingClientRect();
        const boxRect = dialogueBox.getBoundingClientRect();

        const isMobile = window.matchMedia('(max-width: 1024px)').matches;
        const gap = isMobile ? 2 : 8;

        // Safe placement area (inside rendered background & below HUD).
        // Pad/HUD reservation comes from live CSS via getDialogueSafeRect() itself.
        const safe = positioningSystem.getDialogueSafeRect();
        if (!safe) return;

        const isLeftZone = zoneName.startsWith('left');
        const isRightZone = zoneName.startsWith('right');
        const isSecondaryZone = zoneName.endsWith('-2');

        // Anchor point: above character head (scene-container local coords).
        // headAnchorX/headAnchorY (fractions 0-1 of the sprite's OWN box)
        // are authored per-character metadata for where the visible head
        // actually sits — most sprite PNGs have transparent padding above
        // the head, so charRect.top alone is not the head. When a character
        // doesn't carry that metadata, fall back to the previous zone-based
        // heuristic (secondary speakers get a slight inward bias) so
        // existing scenes render identically.
        const innerAnchorRatio = isLeftZone ? 0.58 : 0.42;
        const defaultAnchorRatio = 0.5;
        const headAnchorXFrac = parseFloat(characterEl.dataset.headAnchorX);
        const headAnchorYFrac = parseFloat(characterEl.dataset.headAnchorY);
        const anchorRatio = Number.isFinite(headAnchorXFrac)
            ? headAnchorXFrac
            : (isSecondaryZone ? innerAnchorRatio : defaultAnchorRatio);
        const anchorX = charRect.left - containerRect.left + (charRect.width * anchorRatio);
        const headY = (charRect.top - containerRect.top)
            + (Number.isFinite(headAnchorYFrac) ? charRect.height * headAnchorYFrac : 0);
        const extraLift = isSecondaryZone ? (isMobile ? 8 : 14) : 0;
        let topPx = headY - boxRect.height - gap - extraLift;

        // Decide which tail side to use
        let tailSide = 'left';
        if (zoneName.startsWith('right')) tailSide = 'right';
        if (zoneName.startsWith('left')) tailSide = 'left';
        dialogueBox.dataset.tail = tailSide;

        // Tail "x" position within the bubble (tuned for your bubble PNGs)
        // (tail isn't at the extreme corner; it's inset a bit)
        const TAIL_X_LEFT = isSecondaryZone ? 0.18 : 0.14;
        const TAIL_X_RIGHT = isSecondaryZone ? 0.82 : 0.86;
        const tailX = (tailSide === 'left') ? TAIL_X_LEFT : TAIL_X_RIGHT;

        // Place bubble so tail aligns near anchorX
        let leftPx = anchorX - (boxRect.width * tailX);

        // Push secondary bubbles inward from screen edges for cleaner composition.
        if (isSecondaryZone && isLeftZone) leftPx += boxRect.width * 0.05;
        if (isSecondaryZone && isRightZone) leftPx -= boxRect.width * 0.05;

        // Clamp to safe rect
        leftPx = Math.max(safe.left, Math.min(leftPx, safe.right - boxRect.width));
        topPx = Math.max(safe.top, Math.min(topPx, safe.bottom - boxRect.height));

        dialogueBox.style.left = `${leftPx}px`;
        dialogueBox.style.right = 'auto';
        dialogueBox.style.top = `${topPx}px`;
        dialogueBox.style.bottom = 'auto';
        dialogueBox.style.transform = 'none';

        // Ensure bubble image matches the chosen tail side
        this._applyDialogueBubbleTail(dialogueBox, zoneName);
    },

    _applyDialogueBubbleTail(dialogueBox, zoneName) {
        const dialogueBubble = document.getElementById('dialogue-bubble');
        if (!dialogueBox || !dialogueBubble) return;

        // Determine which SIDE the tail should be on (left tail for left speaker, right tail for right speaker)
        let tailSide = dialogueBox.dataset.tail || 'left';

        if (typeof zoneName === 'string') {
            if (zoneName.startsWith('left')) tailSide = 'left';
            if (zoneName.startsWith('right')) tailSide = 'right';
        }

        dialogueBox.dataset.tail = tailSide;

        // Keep explicit mapping so we don't accidentally regress to swapped tails.
        const TAIL_IMAGE_BY_SIDE = {
            left: './assets/menu_dialogue/dialogue-bubble-large-left.png',
            right: './assets/menu_dialogue/dialogue-bubble-large-right.png',
        };

        dialogueBubble.src = TAIL_IMAGE_BY_SIDE[tailSide] || TAIL_IMAGE_BY_SIDE.left;
    },

    /**
     * True on phone/tablet landscape viewports where vertical space is scarce
     * enough that an authored/zone bubble height must be treated as a cap
     * rather than a fixed value. Mirrors the CSS compact-landscape queries.
     */
    _isCompactLandscape() {
        return window.matchMedia('(max-width: 1024px) and (orientation: landscape)').matches
            || window.matchMedia('(max-height: 500px)').matches;
    },

    /**
     * THE canonical dialogue layout entry point — the only method allowed to set
     * dialogueBox position/size. Resolves exactly one placement mode per call,
     * in strict precedence order, and applies it:
     *
     *   1. narration/choice        -> centered narrative layout
     *   2. speech w/ bubbleLayout  -> authored native-coordinate rectangle
     *   3. speech w/ a valid zone  -> DEFAULT_SPEECH_BUBBLE_SLOTS rectangle
     *   4. layoutMode: 'character' -> character-relative placement (explicit opt-in)
     *   5. (fallback)              -> top-center safe placement
     *
     * An authored bubbleLayout (tier 2) always wins over character-relative
     * positioning — it is never re-anchored near a character. layoutDialogue()
     * is a pure function of (dialogueEntry, current DOM/character state), so it
     * is safe to call repeatedly (initial render, post-fit reflow, settle
     * reflow, resize/orientation) without ever changing the resolved mode for
     * a given entry. The resolved mode is recorded on dialogueBox.dataset.layoutMode.
     */
    layoutDialogue(dialogueBox, dialogueEntry, options = {}) {
        if (!dialogueBox || !dialogueEntry) return null;

        // Clear any compact-landscape height cap left by a previous call/entry —
        // the branches below re-derive it fresh for whichever mode resolves.
        const containerEl = document.getElementById('dialogue-container');
        if (containerEl) containerEl.style.maxHeight = '';

        const isNarration = !dialogueEntry.speaker || dialogueEntry.speaker === 'NARRATION' || dialogueEntry.speaker === 'SYSTEM';
        const isChoice = dialogueEntry.speaker === 'CHOICE' || dialogueEntry.speaker === 'FINAL CHOICE';
        const zone = this.normalizeZoneName(dialogueEntry.position || 'left');

        let mode;
        if (isNarration || isChoice) {
            mode = 'narrative';
            dialogueBox.classList.remove('dialogue-anchored');
            this._positionNarrativeDialogue(dialogueBox);
        } else if (dialogueEntry.bubbleLayout) {
            mode = 'authored';
            this._positionDialogueInSlot(dialogueBox, zone, dialogueEntry);
            dialogueBox.classList.add('dialogue-anchored');
        } else if (dialogueEntry.layoutMode === 'character') {
            mode = 'character';
            this._positionDialogueNearCharacter(dialogueBox, zone, dialogueEntry);
            dialogueBox.classList.add('dialogue-anchored');
        } else if (positioningSystem.getBackgroundRect()) {
            mode = 'zone-slot';
            this._positionDialogueInSlot(dialogueBox, zone, dialogueEntry);
            dialogueBox.classList.add('dialogue-anchored');
        } else {
            mode = 'top-center';
            this._positionDialogueTopCenter(dialogueBox);
            this._applyDialogueBubbleTail(dialogueBox, zone);
            dialogueBox.classList.add('dialogue-anchored');
        }

        dialogueBox.dataset.layoutMode = mode;
        return mode;
    },

    /**
     * Debug-only invariant check (no-ops outside DEBUG, never throws): confirms
     * an authored bubbleLayout entry's applied rect still matches its scaled
     * expected position, within tolerance, at the point right before viewport
     * clamping runs. Exists to catch any regression that re-introduces an
     * unconditional character-relative re-anchor after layoutDialogue().
     */
    _debugAssertAuthoredLayout(dialogueBox, dialogueEntry, mode, tolerancePx = 2) {
        if (!DEBUG || !dialogueBox || mode !== 'authored' || !dialogueEntry?.bubbleLayout) return;
        try {
            const bl = dialogueEntry.bubbleLayout;
            const expected = positioningSystem.calculateHotspotPosition(
                bl.left || 0, bl.top || 0, bl.width || 400, bl.height || 300
            );
            const expectedLeft = parseFloat(expected.left);
            const expectedTop = parseFloat(expected.top);
            const actualLeft = parseFloat(dialogueBox.style.left);
            const actualTop = parseFloat(dialogueBox.style.top);
            const deltaLeft = Math.abs(actualLeft - expectedLeft);
            const deltaTop = Math.abs(actualTop - expectedTop);
            const withinTolerance = deltaLeft <= tolerancePx && deltaTop <= tolerancePx;
            console.assert(
                withinTolerance,
                `[layoutDialogue] authored rect drifted before clamp — speaker=${dialogueEntry.speaker} ` +
                `deltaLeft=${deltaLeft.toFixed(1)}px deltaTop=${deltaTop.toFixed(1)}px (tolerance ${tolerancePx}px)`,
                { bubbleLayout: bl, expected: { left: expectedLeft, top: expectedTop }, actual: { left: actualLeft, top: actualTop } }
            );
        } catch (_) {
            // Debug-only guard: an assertion must never break gameplay.
        }
    },

    _positionDialogueInSlot(dialogueBox, zoneName, dialogueEntry) {
        if (!dialogueBox || !dialogueEntry) return;

        // 1. Normalize zone, falling back through available values to ensure a valid string
        const zone = this.normalizeZoneName(zoneName || dialogueEntry.position || 'left');

        // If positioningSystem cannot report a background rect yet, fall back to the
        // final tier (top-center) rather than character-relative positioning — an
        // authored/zone-slot entry must never be re-anchored near a character.
        if (!positioningSystem.getBackgroundRect()) {
            this._positionDialogueTopCenter(dialogueBox);
            this._applyDialogueBubbleTail(dialogueBox, zone);
            return;
        }

        // 2 & 3. Determine source rect in 1920×1080 reference space
        let rect;
        if (dialogueEntry.bubbleLayout) {
            rect = dialogueEntry.bubbleLayout;
        } else {
            rect = this.DEFAULT_SPEECH_BUBBLE_SLOTS[zone] || this.DEFAULT_SPEECH_BUBBLE_SLOTS['left'];
        }

        // 4. Convert reference coords to current screen coordinates
        const pos = positioningSystem.calculateHotspotPosition(rect.left, rect.top, rect.width, rect.height);

        // 5. Apply position styles, clearing any centering overrides
        dialogueBox.style.left      = pos.left;
        dialogueBox.style.top       = pos.top;
        dialogueBox.style.width     = pos.width;
        dialogueBox.style.right     = 'auto';
        dialogueBox.style.bottom    = 'auto';
        dialogueBox.style.transform = 'none';

        // #dialogue-container (the element that actually renders the bubble
        // art/text) does not inherit #dialogue-box's height — it sizes itself
        // via CSS min/max-height. On desktop/portrait those CSS ranges were
        // tuned to match the scaled rect, so setting a fixed height here is
        // safe. In compact landscape, a scaled authored/zone height can fall
        // below the CSS min-height floor, so treat it as a MAX instead: the
        // box auto-sizes to content (never forced taller than needed) but is
        // capped at the authored footprint (never taller than intended,
        // overflow handled by the existing pagination system).
        const containerEl = document.getElementById('dialogue-container');
        if (this._isCompactLandscape()) {
            dialogueBox.style.height = 'auto';
            if (containerEl) containerEl.style.maxHeight = pos.height;
        } else {
            dialogueBox.style.height = pos.height;
            if (containerEl) containerEl.style.maxHeight = '';
        }

        // 6. Tail side: left-side zones get a left tail, right-side zones get a right tail
        const tailSide = zone.startsWith('right') ? 'right' : 'left';
        dialogueBox.dataset.tail = tailSide;
        this._applyDialogueBubbleTail(dialogueBox, zone);
    },

    _positionDialogueTopCenter(dialogueBox) {
        const container = document.getElementById('scene-container');
        if (!container || !dialogueBox) return;

        {
            const containerRect = container.getBoundingClientRect();
            const boxRect = dialogueBox.getBoundingClientRect();
            const leftPx = Math.max(
                containerRect.width * 0.02,
                (containerRect.width - boxRect.width) / 2,
            );

            dialogueBox.classList.add('dialogue-offscreen');
            dialogueBox.style.left = `${leftPx}px`;
            dialogueBox.style.right = 'auto';
            dialogueBox.style.top = `${containerRect.height * 0.16}px`;
            dialogueBox.style.bottom = 'auto';
            dialogueBox.style.transform = 'none';
        }
    },

    _positionNarrativeDialogue(dialogueBox) {
        const container = document.getElementById('scene-container');
        if (!container || !dialogueBox) return;

        {
            const containerRect = container.getBoundingClientRect();
            const boxRect = dialogueBox.getBoundingClientRect();
            const leftPx = Math.max(containerRect.width * 0.02, (containerRect.width - boxRect.width) / 2);
            const topPx = Math.max(containerRect.height * 0.12, (containerRect.height - boxRect.height) / 2);

            dialogueBox.style.left = `${leftPx}px`;
            dialogueBox.style.right = 'auto';
            dialogueBox.style.top = `${topPx}px`;
            dialogueBox.style.bottom = 'auto';
            dialogueBox.style.transform = 'none';
        }
    },

    repositionActiveDialogue() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (!dialogueBox || dialogueBox.classList.contains('hidden')) return;

        // Use the entry actually on screen, not scene.dialogue[currentDialogueIndex] —
        // that index can be stale (e.g. dialogue shown ad hoc via onClick handlers,
        // or via the debug API) and previously caused resize to follow different
        // rules than the initial render.
        const dialogueEntry = this._activeDialogueEntry
            || gameState.currentDialogueEntry
            || this.currentScene?.dialogue?.[gameState.currentDialogueIndex];
        if (!dialogueEntry) return;

        // No re-pagination here — dialoguePager.reflow() only re-clamps the
        // choices panel and re-asserts overflow against the settled geometry.
        const layoutMode = this.layoutDialogue(dialogueBox, dialogueEntry);
        this._debugAssertAuthoredLayout(dialogueBox, dialogueEntry, layoutMode);
        this._clampDialogueToViewport(dialogueBox, { preserveCentered: layoutMode === 'narrative' });
        dialoguePager.reflow(dialogueBox);
    },

    nextDialogue() {
        // Block dialogue advancement during transitions
        if (this.isTransitioning) return;

        gameState.currentDialogueIndex++;
        const scene = this.currentScene;

        if (scene.dialogue && gameState.currentDialogueIndex < scene.dialogue.length) {
            this._closeDialogueThen(() => {
                this.showDialogue(scene.dialogue[gameState.currentDialogueIndex]);
            });
        } else {
            // CRITICAL: Release dialogue lock when we've exhausted all dialogue
            gameState.dialogueLock = false;
            this._closeDialogueThen(() => {
                document.getElementById('dialogue-box').classList.add('hidden');
            });
        }
    },

    _animateDialogueEntry() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (!dialogueBox) return;

        dialogueBox.classList.remove('dialogue-exit', 'hidden');
        dialogueBox.classList.add('dialogue-enter');
        void dialogueBox.offsetWidth;
        SFXGenerator.playDialogueAdvance();
        SFXGenerator.playDialoguePop();

        window.setTimeout(() => {
            dialogueBox.classList.remove('dialogue-enter');
        }, 350);
    },

    _closeDialogueThen(nextAction) {
        const dialogueBox = document.getElementById('dialogue-box');
        const textEl = document.getElementById('dialogue-text');
        this._cleanupTypewriter(textEl);
        dialoguePager.reset();
        if (!dialogueBox || dialogueBox.classList.contains('hidden')) {
            gameState.dialogueLock = false; // Safety release
            if (typeof nextAction === 'function') nextAction();
            return;
        }

        dialogueBox.classList.remove('dialogue-enter');
        dialogueBox.classList.add('dialogue-exit');
        SFXGenerator.playDialogueWhooshClose();

        window.setTimeout(() => {
            dialogueBox.classList.add('hidden');
            dialogueBox.classList.remove('dialogue-exit');
            gameState.dialogueLock = false; // Always release after close animation
            if (typeof nextAction === 'function') nextAction();
        }, this.dialogueExitDurationMs);
    },
    
    fadeTransition(fadeIn) {
        return new Promise(resolve => {
            const overlay = document.getElementById('fade-overlay');
            
            if (fadeIn) {
                // Fade TO black — slightly faster for snappiness
                overlay.style.transition = 'opacity 0.5s ease-in';
                overlay.classList.add('active');
                setTimeout(resolve, 550);
            } else {
                // Fade FROM black — slower, more cinematic reveal
                overlay.style.transition = 'opacity 0.8s ease-out';
                setTimeout(() => {
                    overlay.classList.remove('active');
                    setTimeout(resolve, 850);
                }, 50); // Tiny delay lets new content settle before revealing
            }
        });
    },

    async _fadeOverlay(on) {
        const el = this.transition.overlayEl;
        if (!el) return;
        el.classList.toggle('is-on', !!on);
        await this._waitMs(240); // match CSS
    },

    _showSceneTitleFx(titleText) {
        const fx = this.transition.titleFxEl;

        if (!fx) return;

        fx.textContent = titleText || '';
        fx.classList.remove('is-show');
        // force reflow
        void fx.offsetWidth;
        fx.classList.add('is-show');

        // auto-hide after ~1.2s
        clearTimeout(fx._t);
        fx._t = setTimeout(() => fx.classList.remove('is-show'), 1200);
    },

    _waitMs(ms) { return new Promise(r => setTimeout(r, ms)); },
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
            const sceneContainer = document.getElementById('scene-container');
            sceneContainer?.classList.remove('scene-transitioning');
            gameState.sceneTransitioning = false;
            gameState.actionLock = false;
            gameState.dialogueLock = false;

            const dialogueBox = document.getElementById('dialogue-box');
            if (dialogueBox) {
                dialogueBox.classList.add('hidden');
                dialogueBox.classList.remove('dialogue-enter', 'dialogue-exit', 'dialogue-left', 'dialogue-right', 'dialogue-center');
            }

            // Start music automatically with fade in
            audioManager.playMusic('main-menu-theme.mp3', true);

            const container = document.getElementById('hotspot-layer');
            container.innerHTML = `
                <div id="main-menu-content" data-layout-panel="menu-prompts">
                    <h1 id="main-menu-title">THE HARDIGAN BOYS<br>VS.<br>THE MEXICAN DRUG CARTEL</h1>
                    <button class="menu-btn" id="btn-new-game">NEW GAME</button>
                    <button class="menu-btn" id="btn-continue-game">CONTINUE</button>
                    <button class="menu-btn" id="btn-options">OPTIONS</button>
                    <button class="menu-btn" id="btn-developer-mode">DEVELOPER MODE</button>
                </div>
            `;


            document.getElementById('btn-new-game').addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                gameState.inventory = [];
                gameState.notebook = [];
                gameState.journalSeen = {};
                gameState.storyProgress = {
                    currentChapter: null,
                    lastSceneTitle: null,
                    lastObjective: null
                };
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
                    const savedSceneId = saveSystem.load();
                    if (savedSceneId) {
                        document.body.classList.remove('main-menu');
                        sceneRenderer.loadScene(savedSceneId);
                    }
                });
            }

            document.getElementById('btn-options').addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                document.getElementById('settings-overlay').classList.remove('hidden');
            });

            document.getElementById('btn-developer-mode').addEventListener('click', () => {
                SFXGenerator.playButtonClick();
                Dev.openHub();
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
        checkProgression(delay = 0) {
            // Only transition after window_dialogue_shown is set, which happens
            // inside the window onClick once all other clickables have been explored.
            const attemptTransition = () => {
                if (gameState.objectsClicked.has('window_dialogue_shown')) {
                    sceneRenderer.loadScene('S2_ICE_RAID_WINDOW');
                }
            };

            if (delay > 0) {
                setTimeout(attemptTransition, delay);
            } else {
                attemptTransition();
            }
        },

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
                x: 558,
                y: 802,
                width: 138,
                height: 54,
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

                    SCENES.S1_LIVING_ROOM_INTRO.checkProgression(2000);
                }
            },
            {
                id: 'television',
                label: 'Television',
                coordSystem: 'native',
                x: 112, y: 416, width: 272, height: 216,
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

                    SCENES.S1_LIVING_ROOM_INTRO.checkProgression(2000);
                }
            },
            {
                id: 'window',
                label: 'Window',
                coordSystem: 'native',
                x: 304, y: 121, width: 520, height: 343,
                onClick() {
                    gameState.objectsClicked.add('window');

                    // All non-window clickables must be explored before Jonah's
                    // transition dialogue is unlocked.
                    const allOthersClicked =
                        gameState.objectsClicked.has('remote') &&
                        gameState.objectsClicked.has('television') &&
                        gameState.objectsClicked.has('lamp') &&
                        gameState.objectsClicked.has('notebook');

                    if (allOthersClicked && !gameState.objectsClicked.has('window_dialogue_shown')) {
                        // Unlock: play Jonah's lights line then transition to Scene 2.
                        gameState.objectsClicked.add('window_dialogue_shown');
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
                                        sceneRenderer.loadScene('S2_ICE_RAID_WINDOW');
                                    }
                                });
                            }
                        });
                    } else if (!allOthersClicked) {
                        // Generic prompt while the room hasn't been fully explored yet.
                        sceneRenderer.showDialogue({
                            speaker: 'HANK',
                            text: "Hmm. Something feels off out there... let me get my bearings first.",
                            position: 'left',
                            next: 'NEXT_DIALOGUE'
                        });
                    }
                    // If window_dialogue_shown is already set the transition is already
                    // underway — do nothing.
                }
            },
            {
                id: 'lamp',
                label: 'Lamp',
                coordSystem: 'native',
                x: 1528, y: 450, width: 272, height: 424,
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

                    SCENES.S1_LIVING_ROOM_INTRO.checkProgression(2000);
                }
            },
            {
                id: 'notebook',
                label: "Hank's Conspiracy Notebook",
                coordSystem: 'native',
                x: 458, y: 722, width: 119, height: 76,
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

                    SCENES.S1_LIVING_ROOM_INTRO.checkProgression(2000);
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
                // Matches her actual spawn slot below (onShow adds her at
                // 'right-2', not 'right') so the default zone-slot bubble
                // anchors next to where she actually renders.
                position: 'right-2',
                text: "If either of you used this much energy on school, we'd be rich by now!",
                // Wait for Mom's slide-in animation to finish before the speech bubble pops in.
                bubbleDelay: 900,
                next: () => {
                    // Slide Mom out, then unlock explore phase — Jonah's lights line
                    // is gated behind the window hotspot after all other clickables are done.
                    sceneRenderer.removeCharacter('mom', true);
                    setTimeout(() => {
                        sceneRenderer._cleanupTypewriter(document.getElementById('dialogue-text'));
                        document.getElementById('dialogue-box').classList.add('hidden');
                        gameState.dialogueLock = false;
                    }, 700);
                },
                onShow: () => {
                    // Add Mom so she slides in from the right before her bubble appears.
                    sceneRenderer.addCharacter({
                        id: 'mom',
                        name: 'MOM',
                        sprite: 'char_mom_worried-right.png',
                        position: 'right-2'
                    }, 100);
                }
            }
        ],

        onEnter() {
            // Journal: Act I status
            addJournalOnce('status_s1', 'ACT I — A Normal Night', 'Northern Virginia. Hank and Jonah are home. Something feels off outside. Explore the room before looking out the window — click the TV, lamp, notebook, and remote first. The window is the last stop.');

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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s2', 'THE RAID — ICE Takes the Riveras', 'ICE agents are raiding the Riveras\' house. Carlos Rivera is being detained. Mom says stay inside — but this is a major choice point. Staying means the cooperation path. Sneaking out means getting involved.');
            addJournalOnce('clue_s2_choice', 'CHOICE AHEAD — Two Paths', 'If you sneak out to help the Riveras, you\'ll pick up the HOUSE KEY and head into the backyard. That path leads to Sofia and the USB drive that drives the whole story. If you stay, you\'ll deal with ICE agents at your door the next morning.');
        },

        dialogue: [
            {
                speaker: 'JONAH',
                text: "Okay. That's… definitely ICE.",
                position: 'left-2',
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
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Mom, they're taking Carlos. He literally coached the neighborhood soccer team.",
                position: 'left',
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    // Keep four visible characters (Hank/Jonah left, ICE/Carlos right)
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'ice_agent',
                            name: 'ICE AGENT',
                            sprite: 'char_ice_generic_1-right.png',
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
                speaker: 'MRS. RIVERA',
                text: "Please! Don't take him — he hasn't done anything wrong!",
                position: 'right',
                bubbleDelay: 800,
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    // Remove ICE agent to make room, then slide Mrs. Rivera in from the right
                    sceneRenderer.removeCharacter('ice_agent', false);
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'mrs_rivera',
                            name: 'MRS. RIVERA',
                            sprite: 'char_luisa_pleading.png',
                            position: 'right'
                        }, 100);
                    }, 200);
                }
            },
            {
                speaker: 'MR. RIVERA',
                text: "I'm innocent! I swear — I have nothing to do with any of this!",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MOM',
                text: "Away from the window. NOW! Both of you.",
                position: 'left',
                bubbleDelay: 1300,
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    // Swap ICE agent back in to replace Mrs. Rivera (char_luisa-pleading)
                    sceneRenderer.removeCharacter('mrs_rivera', false);
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'ice_agent',
                            name: 'ICE AGENT',
                            sprite: 'char_ice_generic_1-right.png',
                            position: 'right'
                        }, 100);
                    }, 200);
                    // Replace Hank with Mom on the left
                    sceneRenderer.removeCharacter('hank', false);
                    sceneRenderer.addCharacter({
                        id: 'mom',
                        name: 'MOM',
                        sprite: 'char_mom_worried-left.png',
                        position: 'left'
                    }, 60);
                }
            },
            {
                speaker: 'MOM',
                text: "We are not getting involved. Do you hear me?",
                position: 'left',
                next: () => {
                    // Mom slides out to the left, then Hank slides in from the left to replace her
                    sceneRenderer.removeCharacter('mom', true);
                    // Release the 'left' zone immediately so Hank can claim it.
                    // Without this, Mom's DOM element lingers for 600ms during her slide-out
                    // and the zone-collision guard in addCharacter would redirect Hank to
                    // 'left-2' (where Jonah already is) instead of the far-left position.
                    const momEl = document.getElementById('char-mom');
                    if (momEl) momEl.dataset.zone = '';
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'hank',
                            name: 'HANK',
                            sprite: 'char_hank_panicked-left.png',
                            position: 'left'
                        }, 60);
                    }, 180);

                    // Wait for Hank's slide-in to complete before showing the choice box.
                    setTimeout(() => {
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
                    }, 1100);
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused-left.png', position: 'left-2' },
            { id: 'mom', name: 'MOM', sprite: 'char_mom_worried.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s3a', 'PATH A — You Stayed Inside', 'You chose not to get involved. The Riveras are being taken while you watch from behind the window. The TV news is already spinning the story. Mom is relieved — but Hank is unsettled.');
            addJournalOnce('clue_s3a_next', 'NEXT STEP — Cooperate or Resist?', 'You can call the ICE tip line and cooperate fully with authorities, or refuse and just go silent. Cooperating opens the federal path with Agent Smith. Refusing leads to guilt and gossip at school next day.');
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "TV Anchor: \"Sources say the operation targets a dangerous trafficking network hidden in quiet communities like yours.\"",
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
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_scared.png', position: 'left-2' },
            { id: 'sofia', name: 'SOFIA', sprite: 'char_sofia_upset.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s3b', 'PATH B — Into the Backyard', 'You snuck out to help. The HOUSE KEY got you here. Sofia Rivera is in the backyard — scared, alone, and about to hand you something that will change everything. Listen carefully to what she says.');
            addJournalOnce('clue_s3b_usb', 'INCOMING ITEM — The USB Drive', 'Sofia is going to give you a USB drive with sensitive data. This is the most important item in the game. You\'ll need to USE it at school when she asks if you still have it, and again at the CIA office when Ms. Gray asks about it.');
        },

        dialogue: [
            {
                speaker: 'SOFIA',
                text: "You shouldn't be here.",
                position: 'right',
                bubbleLayout: { left: 1137, top: 313, width: 737, height: 336 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We saw ICE. We thought we could… help?",
                position: 'left',
                bubbleLayout: { left: 723, top: 265, width: 737, height: 336 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Unless you have a helicopter and a non-extradition treaty, you're late.",
                position: 'right',
                bubbleLayout: { left: 1030, top: 244, width: 863, height: 312 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Here. Take this USB drive. It has contacts, numbers... everything. My dad thought it would clear his name. Maybe you can use it.",
                position: 'right',
                bubbleLayout: { left: 1134, top: 199, width: 729, height: 293 },
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'ice_generic_1', name: 'ICE AGENT', sprite: 'char_ice_generic_1-right.png', position: 'right' },
            { id: 'agent_smith', name: 'AGENT SMITH', sprite: 'char_ice_smith_smirk.png', position: 'right-2' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s4a1', 'STATUS — Federal Follow-Up', 'You called the tip line. Agent Smith showed up. He\'s at your door with a generic ICE agent. This is the official cooperation path. Whatever you tell them here determines how suspicious you look to the feds.');
            addJournalOnce('clue_s4a1_badge', 'CLUE — The FAKE FBI BADGE', 'If you find a fake FBI badge later, it could be useful when dealing with officials who don\'t know you. Cooperating fully with Smith now puts you deeper in the federal pocket.');
        },

        dialogue: [
            {
                speaker: 'AGENT SMITH',
                text: "Morning. Just following up on your very patriotic phone call.",
                position: 'right-2',
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

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused-left.png', position: 'left-2' },
            { id: 'student_1', name: 'RANDOM STUDENT', sprite: 'char_random-student-01.png', position: 'right' },
            { id: 'student_2', name: 'ANOTHER STUDENT', sprite: 'char_random-student-02-right.png', position: 'right-2' }
        ],
        hotspots: [],

        onEnter() {
            addJournalOnce('status_s4a2', 'STATUS — Guilt and Gossip', 'School hallway. The rumor mill is already spinning wild stories about the Riveras. Hank knows the truth is messier. You can follow the ICE van to the processing facility or head home. Following the van leads to the ICE Processing Room scene.');
            addJournalOnce('clue_s4a2_facility', 'CLUE — The Processing Facility', 'If you follow the ICE van, you\'ll end up inside a federal processing room. If you already have — or get — a BURNER PHONE there, USE it in inventory to document what you see. That intel could matter later.');
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "School the next day. The gossip mill is in overdrive.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'RANDOM STUDENT',
                text: "I heard the dad was totally cartel.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "(muttering) Yeah, or super convenient for a press conference.",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'What do you do next?',
                        choices: [
                            {
                                text: 'Follow the ICE van to the processing facility',
                                action() {
                                    sceneRenderer.loadScene('S4C_ICE_PROCESSING_ROOM');
                                }
                            },
                            {
                                text: 'Head home — this is getting too real',
                                action() {
                                    sceneRenderer.loadScene('S6_INTEL_ENTANGLEMENT');
                                }
                            }
                        ]
                    });
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'student_1', name: 'RANDOM STUDENT', sprite: 'char_random-student-01.png', position: 'right-2' },
            { id: 'student_2', name: 'ANOTHER STUDENT', sprite: 'char_random-student-02-right.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s4b', 'STATUS — School Aftershock', 'School the next day. The gossip is already mutating the truth. Sofia Rivera pulls you aside — she wants to confirm you still have the drive her dad gave you.');
            addJournalOnce('clue_s4b_usb_gate', 'ACTION REQUIRED — Show Sofia the USB', 'When Sofia asks "You still have the drive?" — she needs proof. Open your INVENTORY and USE the NEIGHBORS USB to show it to her. This unlocks the next part of the conversation and sets up the meeting at her place tonight.');
        },

        itemUses: {
            neighbors_usb: {
                action() {
                    addJournalOnce('used_usb_s4b', 'CONFIRMED — USB Shown to Sofia', 'You showed Sofia the drive at school. She confirmed other people want it too. Meeting at her place tonight — she\'s cracked the encryption and has something big to share.');
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(pulls out the USB) Right here. Feels like holding a grenade filled with subpoenas.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                speaker: 'SOFIA',
                                text: "Good. Because you're not the only ones who want it.",
                                position: 'right',
                                next: 'NEXT_DIALOGUE'
                            });
                        }
                    });
                }
            }
        },

        dialogue: [
            {
                speaker: 'RANDOM STUDENT',
                text: "I heard the dad was totally cartel.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'ANOTHER STUDENT',
                text: "My cousin's friend said ICE only hits houses if you're like, super guilty.",
                position: 'right',
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
                bubbleDelay: 600,
                next: () => {
                    // Gate: player must USE neighbors_usb from inventory to continue
                    gameState.dialogueLock = false;
                    document.getElementById('dialogue-box').classList.add('hidden');
                    showStatusToast('💡 Open INVENTORY — USE the NEIGHBORS USB to show Sofia!', 4000);
                },
                onShow: () => {
                    sceneRenderer.removeCharacter('student_1', true);
                    sceneRenderer.removeCharacter('student_2', true);
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'sofia',
                            name: 'SOFIA',
                            sprite: 'char_sofia_annoyed-right.png',
                            position: 'right'
                        }, 100);
                    }, 300);
                }
            },
            {
                // Reached via NEXT_DIALOGUE from the itemUses "Good" response (index 3 → 4)
                speaker: 'SOFIA',
                text: "Come to my place tonight — both of you. Around eight.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Your place? Why can't we just talk here?",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Because what I have to show you isn't something you discuss in a hallway.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Fine. We'll be there.",
                position: 'left',
                next: () => {
                    sceneRenderer.loadScene('S5_SOFIA_INTEL');
                }
            }
        ]
    },

    // ===== S5: SOFIA'S INTEL =====
    S5_SOFIA_INTEL: {
        id: 'S5_SOFIA_INTEL',
        title: 'Sofia\'s Intel',
        background: './assets/backgrounds/bg_s5_sofia_intel.png',
        music: 'Classified Silence.mp3',

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'sofia', name: 'SOFIA', sprite: 'char_sofia_hacker.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s5', 'STATUS — Sofia\'s Intel Reveal', 'Sofia cracked the USB drive. What\'s on it is bigger than expected: a DEA informant list and a cartel payment ledger with names of U.S. officials. Someone used ICE to recover this drive from the Riveras — not immigration enforcement.');
            addJournalOnce('clue_s5_gray', 'KEY CONTACT — CIA Analyst Gray', 'CIA analyst "Ms. Gray" has been building an independent case against the Mendoza operation for two years. She\'s the only one who can authenticate this data safely. Sofia wants you to take it to her. Next stop: the CIA research annex.');
        },

        dialogue: [
            {
                speaker: 'SOFIA',
                text: "I cracked the drive last night. Four hours, two energy drinks, and one very concerning moment where I thought the NSA was watching my webcam.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Were they?",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Probably. But that's not the point.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "The drive has two things on it. A DEA informant list — active witnesses against the MENDOZA cartel. And a payment ledger: shell companies, routing numbers, and names of U.S. officials who've been taking cartel money for six years.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "So the ICE raid wasn't about your dad's immigration status.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Someone fed ICE a tip that my dad was hiding cartel assets — a lie, designed to get armed agents inside our house to recover this drive before anyone could read what's on it.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "So your dad got deported... over a USB drive.",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "My dad got disappeared over what's ON the drive. Big difference.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "(quiet) That's not paranoia. That's a conspiracy with a budget.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "There's a CIA analyst named Gray who's been building an independent case against the MENDOZA operation for two years. She's the only person who can authenticate this data without it getting buried by the same people who are on the ledger.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "You want us to walk into a CIA office.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "It's technically a 'federal research annex.' The parking lot smells like burnt coffee and bad decisions. You'll fit right in.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "I just want to state, for the record, that I am a minor.",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "So are we. Let's go.",
                position: 'left',
                next: () => {
                    sceneRenderer.loadScene('S6_INTEL_ENTANGLEMENT');
                }
            }
        ]
    },

    // ===== S4C: ICE PROCESSING ROOM =====
    S4C_ICE_PROCESSING_ROOM: {
        id: 'S4C_ICE_PROCESSING_ROOM',
        title: 'The Processing Room',
        background: './assets/backgrounds/bg_ice_processing_room.png',
        music: 'Bureaucratic Cold.mp3',

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_scared.png', position: 'left-2' },
            { id: 'agent_smith', name: 'AGENT SMITH', sprite: 'char_ice_smith_stern-right.png', position: 'right-2' },
            { id: 'specialops', name: 'SPECIAL OPS', sprite: 'char_specialops_masked-right.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s4c', 'STATUS — Inside the ICE Facility', 'You followed the van to a federal processing room. Rows of detainees. Fluorescent lights. A masked operative who doesn\'t belong here. Agent Smith gives you a burner phone — use it wisely.');
            addJournalOnce('clue_s4c_burner', 'ACTION AVAILABLE — Document the Room', 'Smith gives you a BURNER PHONE. While you\'re inside this facility, open your INVENTORY and USE the burner phone to secretly photograph the layout. That intel could expose what\'s really happening here. The masked Special Ops figure is not ICE — note it in your journal.');
        },

        itemUses: {
            burner_phone: {
                action() {
                    gameState.flags.BURNER_USED_AT_FACILITY = true;
                    addJournalOnce('used_burner_s4c', 'INTEL GATHERED — Facility Documented', 'Used the burner phone to photograph the processing room layout while Smith wasn\'t watching. The masked operative, the layout, and the number of detainees are all on record now. Smith doesn\'t know.');
                    sceneRenderer.showDialogue({
                        speaker: 'NARRATION',
                        text: "You angle the burner phone and quietly capture the room — the rows, the masked figure, the unmarked equipment. Smith doesn't notice. This evidence could matter later.",
                        next: 'NEXT_DIALOGUE'
                    });
                }
            }
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "You tail the ICE van to a nondescript warehouse. Inside: rows of detainees, fluorescent lights, clipboards.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'AGENT SMITH',
                text: "You shouldn't be here, boys. This is a federal processing facility.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "(quiet) Who's the guy in the mask? That's not ICE gear.",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SPECIAL OPS',
                text: "...",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Smith, what is Special Ops doing at an immigration facility?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'AGENT SMITH',
                text: "Interagency cooperation. Nothing to see here. I'd suggest you use your phone for something other than cameras, son.",
                next: () => {
                    if (!inventory.has('burner_phone')) {
                        inventory.add('burner_phone');
                        notebook.add('BURNER PHONE', 'Agent Smith handed it over. "Stay in touch." — feels like a leash, not a gift.');
                    }
                    sceneRenderer.showDialogue({
                        speaker: 'NARRATION',
                        text: "Smith presses a burner phone into Hank's hand and walks away. The masked operative watches from the far wall.",
                        next: () => {
                            notebook.add('SPECIAL OPS SIGHTING', 'Armed operative at ICE processing site. No badge visible. Who does he answer to?');
                            sceneRenderer.loadScene('S6_INTEL_ENTANGLEMENT');
                        }
                    });
                }
            }
        ]
    },

    // ===== S6: INTEL ENTANGLEMENT =====
    S6_INTEL_ENTANGLEMENT: {
        id: 'S6_INTEL_ENTANGLEMENT',
        title: 'Ms. Gray Enters the Chat',
        background: './assets/backgrounds/bg_cia_office.png',
        music: 'The Briefing Room (Somber Ambient).mp3',
        
        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_amused.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s6', 'STATUS — CIA Contact: Ms. Gray', 'You\'re at the federal research annex. CIA analyst Ms. Gray has been waiting for someone with that USB. This is the biggest decision point so far: hand it over or stay independent.');
            if (inventory.has('neighbors_usb')) {
                addJournalOnce('clue_s6_usb_gate', 'ACTION REQUIRED — Hand Over or Keep the USB', 'Ms. Gray is going to ask about the USB drive. When she does, open your INVENTORY and USE the NEIGHBORS USB to put it on the table. That triggers the choice: give it to the CIA or keep it and go to the cartel.');
            }
        },

        itemUses: {
            neighbors_usb: {
                action() {
                    addJournalOnce('used_usb_s6', 'DECISION POINT — The USB is on the Table', 'You placed the USB in front of Ms. Gray. Now she wants it. You have to decide: let the CIA take it, or keep it and find another play.');
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'What do you do with the USB?',
                        choices: [
                            {
                                text: 'Hand over the USB to Ms. Gray',
                                action() {
                                    gameState.flags.WORKING_WITH_CIA = true;
                                    inventory.remove('neighbors_usb');
                                    notebook.add('DECISION', 'Gave the USB to the CIA. They said they\'d "handle it." Whether that\'s good or bad depends on who Gray really answers to.');
                                    sceneRenderer.loadScene('S7B_CARTEL_TARGETING');
                                }
                            },
                            {
                                text: 'Keep the USB — stay independent',
                                action() {
                                    gameState.flags.INDEPENDENT_OPERATORS = true;
                                    notebook.add('DECISION', 'Kept the USB. Gray wasn\'t happy. Now we need another angle — the cartel might be the only other option.');
                                    sceneRenderer.loadScene('S7A_CARTEL_CONTACT');
                                }
                            }
                        ]
                    });
                }
            }
        },

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
                        // Gate: player must USE neighbors_usb from inventory to trigger the choice
                        gameState.dialogueLock = false;
                        document.getElementById('dialogue-box').classList.add('hidden');
                        showStatusToast('💡 Open INVENTORY — USE the NEIGHBORS USB to show Ms. Gray!', 4000);
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_scared.png', position: 'left-2' },
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk.png', position: 'right-2' },
            { id: 'cartel_boss', name: 'ANDREAS "THE BUTCHER" MENDOZA', sprite: 'char_cartel_boss_menacing-right.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s7a', 'STATUS — Cartel Safehouse', 'You kept the USB and now you\'re sitting across from Andreas "The Butcher" Mendoza. Lupita brokered this. The cartel wants a delivery route. In exchange: the Riveras stay safe, and you get a fake passport.');
            addJournalOnce('clue_s7a_badge', 'OPTIONAL ACTION — Try the Fake FBI Badge', 'If you have the FAKE FBI BADGE in your inventory, this is a moment to USE it. Flashing federal credentials at the cartel is a bluff — but Mendoza respects authority. It might shift his offer or reveal how much he really knows about your situation.');
        },

        itemUses: {
            fake_fbi_badge: {
                action() {
                    addJournalOnce('used_badge_s7a', 'BLUFF ATTEMPTED — FBI Badge at Cartel Meeting', 'You flashed the fake FBI badge at Mendoza. He stared at it for a long moment. Then he laughed — but it was the kind of laugh that means he\'s recalculating.');
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(holds up the badge) Federal Bureau of Investigation. We're not here to negotiate — we're here to audit.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                // Shortened speaker label (full name is
                                // 'ANDREAS "THE BUTCHER" MENDOZA', see
                                // scene.characters below) — the full name
                                // wraps to 3 lines in the compact-landscape
                                // dialogue header, overflowing the bubble.
                                // characterId keeps sprite/speaker-highlight
                                // resolution correct despite the shortened
                                // label (see _ensureSpeakerPresent()).
                                speaker: 'MENDOZA',
                                characterId: 'cartel_boss',
                                text: "(long pause, then laughs) FBI. In my safehouse. Handing me a badge. Either you're very brave or completely insane.",
                                position: 'right',
                                next: () => {
                                    sceneRenderer.showDialogue({
                                        speaker: 'LUPITA',
                                        text: "(whispering) What are you doing?! Put that away!",
                                        position: 'right-2',
                                        next: () => {
                                            addJournalOnce('badge_bluff_result', 'BLUFF RESULT — Mendoza Is Watching', 'The badge bluff didn\'t scare him, but it changed the dynamic. Mendoza is now treating you as more of a wildcard than a pawn. This might affect his final offer.');
                                            gameState.flags.DOUBLE_CROSSED_SOMEONE = true;
                                            sceneRenderer.showDialogue({
                                                speaker: 'MENDOZA',
                                                characterId: 'cartel_boss',
                                                text: "Sit down. Let's talk like people who might both survive tonight.",
                                                position: 'right',
                                                next: 'NEXT_DIALOGUE'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        },

        dialogue: [
            {
                speaker: 'MENDOZA',
                characterId: 'cartel_boss',
                text: "So. Two suburban boys with the one USB everyone wants.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "[whispering] Don't show fear. He can smell it.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Fun fact: this is not what we meant by 'side hustle.'",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "What exactly do you want from us? Spell it out.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MENDOZA',
                characterId: 'cartel_boss',
                text: "One shipment. Domestic delivery address that won't raise flags. In return, the Rivera family is untouched. Permanently.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "And this—",
                position: 'right-2',
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    // Lupita slides the passport across — player receives it regardless of choice
                    inventory.add('mysterious_passport');
                    notebook.add('MYSTERIOUS PASSPORT', 'A passport with Hank\'s photo but a different name. Lupita said it was "in case things get complicated." That\'s not comforting.');
                }
            },
            {
                speaker: 'LUPITA',
                text: "—is your exit plan. Passport, clean alias. Use it if you need to disappear after this is over.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Is that a passport with MY face on it? How did you even—you know what, never mind.",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "...",
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
                            },
                            {
                                text: 'Meet Ortega — "I heard there\'s a third player"',
                                action() {
                                    sceneRenderer.loadScene('S7C_VENEZ_BACKROOM_ORTEGA');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },

    // ===== S7C: VENEZUELAN BACKROOM - ORTEGA =====
    S7C_VENEZ_BACKROOM_ORTEGA: {
        id: 'S7C_VENEZ_BACKROOM_ORTEGA',
        title: 'The Backroom Sermon',
        background: './assets/backgrounds/bg_venez_backroom.png',
        music: 'Consulate Backroom.mp3',

        characters: [
            { id: 'hank_disguise', name: 'HANK', sprite: 'char_hank_in_disguise-right.png', position: 'left' },
            { id: 'ortega', name: 'ORTEGA', sprite: 'char_ortega_ranting-right.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s7c', 'STATUS — Ortega\'s Backroom', 'You slipped away to meet Ortega — a Venezuelan operative who has access to ICE targeting lists. He\'s the one who flagged the Rivera house. He claims it was a mistake and wants the USB to protect his own operation.');
            addJournalOnce('clue_s7c_badge', 'ACTION AVAILABLE — Use the Fake FBI Badge', 'Ortega respects authority. If you have the FAKE FBI BADGE in your inventory, USE it now to establish credibility before he pitches his deal. A federal identity gives you leverage in this negotiation — he\'ll offer better terms if he thinks you have institutional backing.');
        },

        itemUses: {
            fake_fbi_badge: {
                action() {
                    addJournalOnce('used_badge_s7c', 'CREDIBILITY ESTABLISHED — Badge Used with Ortega', 'You showed Ortega the FBI badge before he could set the terms. He paused, reassessed, and shifted his pitch. The badge bought you a better opening position in this negotiation.');
                    gameState.flags.ALLIED_WITH_ORTEGA = true;
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(slides the badge across the table) Before you start — you should know who you're dealing with.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                speaker: 'ORTEGA',
                                text: "(examines the badge carefully) FBI. Interesting. Then you already know more about the Rivera situation than you've let on.",
                                position: 'right',
                                next: () => {
                                    sceneRenderer.showDialogue({
                                        speaker: 'ORTEGA',
                                        text: "All right. Different terms then. I'll clear the Riveras completely — no conditions — if you hand me the USB quietly and we both pretend this conversation never happened.",
                                        position: 'right',
                                        next: () => {
                                            addJournalOnce('ortega_badge_deal', 'IMPROVED OFFER — Ortega\'s Terms (Badge Bonus)', 'Badge use paid off. Ortega offered a clean deal: Riveras cleared with no strings, in exchange for the USB and silence. This is a better deal than the no-badge version. Check the NOTEBOOK for how to respond.');
                                            sceneRenderer.showDialogue({
                                                speaker: 'HANK',
                                                text: "(thinks for a beat) That's... actually a cleaner offer than I expected.",
                                                position: 'left',
                                                next: 'NEXT_DIALOGUE'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Hank slips out the back. A different flag on the wall. A different kind of danger.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'ORTEGA',
                text: "You're not cartel. You're not CIA. Interesting. Sit down.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "I heard you're the reason the Riveras were flagged in the first place.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'ORTEGA',
                text: "ICE is a tool. Mendoza is a tool. Everyone's a tool when you hold the real data. That USB? I need it more than either of them.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'ORTEGA',
                text: "The Riveras were collateral damage. Wrong family, right neighbor. That's all. Help me and I'll make it right.",
                position: 'right',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'How do you respond to Ortega?',
                        choices: [
                            {
                                text: 'Agree to work with Ortega',
                                action() {
                                    gameState.flags.ALLIED_WITH_ORTEGA = true;
                                    notebook.add('ORTEGA ALLIANCE', 'Ortega claims the Riveras were collateral. He wants the USB — offered to clear them in exchange.');
                                    notebook.add('CLUE — ORTEGA', 'Ortega has access to ICE targeting lists. He knew which house to flag. Follow the data trail.');
                                    sceneRenderer.loadScene('S8_PRE_FINAL');
                                }
                            },
                            {
                                text: 'Walk out — this is above our pay grade',
                                action() {
                                    gameState.flags.CARTEL_TARGET = true;
                                    notebook.add('ORTEGA REFUSED', 'Walked away from Ortega. He knows our faces now.');
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

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked-left.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_scared.png', position: 'left-2' }
        ],
        hotspots: [],

        itemUses: {
            burner_phone: {
                action() {
                    addJournalOnce('used_burner_s7b', 'BACKUP CALLED — Burner Used Under Surveillance', 'Called Ms. Gray on the burner while the cartel was watching. She\'s aware of the surveillance and says her team is already moving. This buys a little time before the airport meeting.');
                    gameState.flags.WORKING_WITH_CIA = true;
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(dials quickly, head down) Gray. They're outside. Black car, engine running. Yes — right now.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                speaker: 'NARRATION',
                                text: "A brief crackle of static. Then: \"I see them. Don't go outside. My team is three minutes away.\" Hank exhales for the first time all day.",
                                next: () => {
                                    addJournalOnce('cia_aware_surveillance', 'CIA INFORMED — Gray Knows About the Cartel Car', 'Ms. Gray has eyes on the cartel surveillance vehicle. Her team is nearby. This changes the dynamic at the upcoming airport meeting — she\'ll have coverage in place.');
                                    sceneRenderer.showDialogue({
                                        speaker: 'JONAH',
                                        text: "Did she say three minutes? What happens at three minutes?",
                                        // Jonah's actual scene slot is left-2 (see
                                        // scene.characters below) — 'right' put his
                                        // bubble on the opposite side of the screen
                                        // from his sprite.
                                        position: 'left-2',
                                        next: 'NEXT_DIALOGUE'
                                    });
                                }
                            });
                        }
                    });
                }
            }
        },

        onEnter() {
            addJournalOnce('status_s7b', 'STATUS — Under Surveillance', 'The cartel knows. There\'s an unmarked car outside that\'s been there for an hour. You\'re being watched. If you have the BURNER PHONE, this is the time to USE it — call Ms. Gray for backup before things escalate.');
            addJournalOnce('clue_s7b_burner', 'ACTION AVAILABLE — Call for Backup', 'Open your INVENTORY and USE the BURNER PHONE to contact Ms. Gray while the surveillance car is still watching. Letting her know about the cartel\'s presence gives the CIA a heads-up before the airport meeting and may give you better support later.');

            // Surveillance operative slides in from right as soon as scene loads,
            // slightly larger than the default character cap (35%/55% of the
            // background) — scale: 1.257 reproduces the same rendered size as
            // the previous post-hoc maxWidth/maxHeight override (0.44/0.35 =
            // 0.68/0.55 ~= 1.257), but through the character layout schema's
            // own reference-space-relative `scale` field instead of a
            // pixel-computing .then() callback.
            sceneRenderer.addCharacter({
                id: 'cartel_surveillance',
                name: 'CARTEL SURVEILLANCE',
                sprite: 'char_cartel-surveillance.png',
                position: 'right',
                scale: 1.257
            }, 400);
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "They're watching. Unmarked cars. Social media hints. The cartel knows.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Hank. Don't look now. The car across the street... it's been there for an hour.",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Yeah. I see it. We may have made a very, very significant mistake.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "My hobbies used to be gaming and snacks. How did we end up here?",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "We need to move. Now. Before that car decides to move first.",
                position: 'left',
                next: () => {
                    sceneRenderer.loadScene('S7D_AFTERMATH_PANIC');
                }
            }
        ]
    },
    
    // ===== S7D: AFTERMATH — PANIC IN THE KITCHEN =====
    S7D_AFTERMATH_PANIC: {
        id: 'S7D_AFTERMATH_PANIC',
        title: 'No Good Options',
        background: './assets/backgrounds/bg_hardigan_livingroom_night_02.png',
        music: 'Hardigan Noir Tension.mp3',

        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking-right.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'right' }
        ],
        hotspots: [],

        onEnter() {
            addJournalOnce('status_s7d', 'STATUS — No Good Options', 'Blinds pulled. Door locked. The cartel knows where you live. Jonah\'s listing options: cops (compromised), CIA (wants the USB for herself), or run (no destination). Hank is already making a plan for the airport meeting — but it has to be on their terms.');
            addJournalOnce('clue_s7d_airport', 'NEXT MOVE — The Airport Meeting', 'You can call Ms. Gray now to coordinate before the airport, or show up and improvise. Calling Gray sets up CIA backup. Going in blind is riskier but keeps your options open. Either way — the warehouse showdown is after this.');
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "They lock the door. Pull the blinds. The kind of quiet that means something bad is coming.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Okay. Options. Go to the cops. Go to the CIA lady. Or... run.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "The cops are in someone's pocket. Ms. Gray wants the USB for herself. And we have nowhere to run TO.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "So... show up to the meeting? At the airport? Like they want?",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "On our terms. With a plan. Not theirs.",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'How do you want to play this?',
                        choices: [
                            {
                                text: 'Call Ms. Gray — work a deal before the meeting',
                                action() {
                                    gameState.flags.WORKING_WITH_CIA = true;
                                    notebook.add('CIA CONTACT', 'Called Ms. Gray before the airport meeting. She has a plan. So do we.');
                                    sceneRenderer.loadScene('S8_PRE_FINAL');
                                }
                            },
                            {
                                text: 'Go straight to the airport — improvise',
                                action() {
                                    notebook.add('GOING IN BLIND', 'Showed up to the cartel meeting without backup. Classic Hardigan move.');
                                    sceneRenderer.loadScene('S8_PRE_FINAL');
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },

    // ===== S8: PRE-FINAL =====
    S8_PRE_FINAL: {
        id: 'S8_PRE_FINAL',
        title: 'Everyone Wants a Piece',
        background: './assets/backgrounds/bg_airport_cartel_landing_strip.png',
        music: 'Safehouse Ambience.mp3',

        characters: [
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk.png', position: 'right' },
            { id: 'elgato', name: 'EL GATO', sprite: 'char_elgato_neutral-right.png', position: 'right-2' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s8', 'STATUS — Everyone Wants a Piece', 'The airport landing strip. Lupita and El Gato are here. All factions are converging. CIA wants the USB buried, cartel wants it weaponized, Venezuela wants it gone. The warehouse showdown is tonight.');
            addJournalOnce('clue_s8_passport', 'UPCOMING — Confirm Your Cover', 'Before the warehouse, you\'ll brief with Ms. Gray. She\'ll set up your cover identity as "Marco Delgado." When she does — have your MYSTERIOUS PASSPORT ready in INVENTORY. You\'ll need to USE it to lock in the alias before going in.');
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Meetings at airports. Deals at docks. Venezuelan conspiracies. Everything converging at once.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'EL GATO',
                text: "You made it. I wasn't sure you would.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "The CIA wants it. The cartel wants it. The Venezuelans want it. And somehow you two are in the middle.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'EL GATO',
                text: "Whoever controls that USB controls the outcome. That's why everyone's smiling at you right now.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Don't let it go to your head. Tonight decides everything. The warehouse. All parties present.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'EL GATO',
                text: "One piece of advice? Walk in like you already know how it ends.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Time to see if you boys are serious. The warehouse. Tonight.",
                position: 'right',
                next: () => {
                    sceneRenderer.loadScene('S8B_HANK_DISGUISE_BRIEFING');
                }
            }
        ]
    },
    
    // ===== S8B: HANK IN DISGUISE — CIA BRIEFING =====
    S8B_HANK_DISGUISE_BRIEFING: {
        id: 'S8B_HANK_DISGUISE_BRIEFING',
        title: 'The Undercover Idiot',
        background: './assets/backgrounds/bg_cia_office.png',
        music: 'Classified Silence.mp3',

        characters: [
            { id: 'hank_disguise', name: 'HANK', sprite: 'char_hank_in_disguise-right.png', position: 'left' },
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_amused-right.png', position: 'right' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s8b', 'STATUS — The Undercover Briefing', 'One hour before the warehouse. Ms. Gray is sending Hank in as "Marco Delgado" — independent courier. Jonah stays outside. The USB is the key card to the ending. Don\'t lose it.');
            if (inventory.has('mysterious_passport')) {
                addJournalOnce('clue_s8b_passport_gate', 'ACTION REQUIRED — Confirm Your Cover Identity', 'Ms. Gray needs you to confirm your alias before you go in. When she finishes the briefing, open your INVENTORY and USE the MYSTERIOUS PASSPORT to lock in the "Marco Delgado" cover. This step is required before heading to the warehouse.');
            }
        },

        itemUses: {
            mysterious_passport: {
                action() {
                    addJournalOnce('used_passport_s8b', 'COVER CONFIRMED — Marco Delgado is Ready', 'You showed the passport to Ms. Gray. She verified the alias, memorized the cover story, and confirmed the extraction signal. The "Marco Delgado" identity is locked in. You\'re ready for the warehouse.');
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(holds up the passport) Marco Delgado. Independent courier. Allergic to being shot.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                speaker: 'MS. GRAY',
                                text: "(takes the passport, scans it, hands it back) Good. The alias is clean. When you're inside, you don't know me. You don't know Jonah. You're just a delivery guy who got in over his head.",
                                position: 'right',
                                next: () => {
                                    sceneRenderer.showDialogue({
                                        speaker: 'HANK',
                                        text: "That's... uncomfortably accurate.",
                                        position: 'left',
                                        next: () => {
                                            gameState.flags.WORKING_WITH_CIA = true;
                                            addJournalOnce('undercover_ready', 'READY — Heading to the Warehouse', 'Cover confirmed. Ms. Gray\'s team is positioned outside. Jonah is backup. Hank goes in as Marco Delgado. The USB decides the ending. Whatever you do with it in that warehouse — it\'s permanent.');
                                            sceneRenderer.loadScene('S9_FINAL_WAREHOUSE_SHOWDOWN');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "One hour before the warehouse. Ms. Gray has a plan. Hank is already regretting agreeing to it.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "You walk in as 'Marco Delgado' — independent courier. Here's the alias, the cover story, and the emergency extraction number.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Marco Delgado. Right. And if they recognize me?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "Improvise. You've been doing it since Tuesday.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "That is... not reassuring.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "Your job is simple: get inside, confirm the principals are there, and stall until my team positions. Don't be a hero.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "What about Jonah?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "Jonah stays outside. He's backup. Or a distraction. Honestly, same thing.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "He's going to be so offended by that.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "Go. And Hank — don't lose the USB. Whatever happens in there, that drives the ending.",
                position: 'right',
                next: () => {
                    if (inventory.has('mysterious_passport')) {
                        // Gate: player must USE passport to confirm their cover before going in
                        gameState.dialogueLock = false;
                        document.getElementById('dialogue-box').classList.add('hidden');
                        showStatusToast('💡 Open INVENTORY — USE the MYSTERIOUS PASSPORT to confirm your cover identity!', 4500);
                    } else {
                        gameState.flags.WORKING_WITH_CIA = true;
                        notebook.add('UNDERCOVER OPERATION', 'Hank going in as "Marco Delgado". Ms. Gray\'s team is outside. This plan has about a 40% chance of working, which is better than our usual average.');
                        sceneRenderer.loadScene('S9_FINAL_WAREHOUSE_SHOWDOWN');
                    }
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
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_threatening.png', position: 'left' },
            { id: 'elgato', name: 'EL GATO', sprite: 'char_elgato_intense-right.png', position: 'right' },
            { id: 'cartel_boss', name: 'ANDREAS "THE BUTCHER" MENDOZA', sprite: 'char_cartel_boss_menacing-right.png', position: 'right-2' }
        ],

        hotspots: [],

        onEnter() {
            addJournalOnce('status_s9', 'FINAL SCENE — The Warehouse Showdown', 'Everyone showed up. CIA on the left. Cartel on the right. El Gato in the middle. And two suburban teenagers holding the USB that apparently runs the world. This is it.');
            addJournalOnce('clue_s9_usb_final', 'ACTION REQUIRED — Use the USB to Force the Confrontation', 'When Mendoza asks who gets the USB, don\'t just answer — open INVENTORY and USE the NEIGHBORS USB (or CARTEL USB) to physically produce it. That\'s the moment that triggers the final choice. The whole room is waiting for you to make a move.');
        },

        itemUses: {
            neighbors_usb: {
                action() {
                    addJournalOnce('used_usb_final', 'MOMENT OF TRUTH — USB Produced at the Showdown', 'You held up the USB in front of all three factions. The room went quiet. Now every eye in that warehouse is on it — and on you. Time to decide who gets it.');
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(holds up the USB drive) Right here. The thing everyone came for. And I'm the one holding it.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                // Shortened speaker label — see the S7A note
                                // on the first MENDOZA line for why.
                                speaker: 'MENDOZA',
                                characterId: 'cartel_boss',
                                text: "Smart boy. Now — choose.",
                                position: 'right-2',
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
                            });
                        }
                    });
                }
            },
            cartel_usb: {
                action() {
                    addJournalOnce('used_cartel_usb_final', 'WILDCARD — Cartel USB Produced at the Showdown', 'You pulled out the cartel\'s own USB drive instead. Mendoza\'s expression changed instantly. This wasn\'t the data he expected. The room is suddenly much more dangerous — but you have more leverage than before.');
                    gameState.flags.DOUBLE_CROSSED_SOMEONE = true;
                    sceneRenderer.showDialogue({
                        speaker: 'HANK',
                        text: "(produces a different USB) Actually — the one everyone THINKS they want? That's not what I have. THIS is what Mendoza doesn't want anyone else to see.",
                        position: 'left',
                        next: () => {
                            sceneRenderer.showDialogue({
                                speaker: 'MENDOZA',
                                characterId: 'cartel_boss',
                                text: "(very quietly) Where did you get that.",
                                position: 'right-2',
                                next: () => {
                                    sceneRenderer.showDialogue({
                                        speaker: 'FINAL CHOICE',
                                        text: 'What do you do with the cartel\'s USB?',
                                        choices: [
                                            {
                                                text: 'Upload the cartel data live — burn it all down',
                                                action() {
                                                    sceneRenderer.loadScene('E_IRONIC_MEDIA');
                                                }
                                            },
                                            {
                                                text: 'Use it as leverage — demand the Riveras go free',
                                                action() {
                                                    gameState.flags.SAVED_NEIGHBORS = true;
                                                    sceneRenderer.loadScene('E_CHAOTIC');
                                                }
                                            }
                                        ]
                                    });
                                }
                            });
                        }
                    });
                }
            }
        },

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "The warehouse. Everyone showed up. Of course they did.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'NARRATION',
                text: "Cartel on the right. CIA on the left. Two suburban teenagers in the middle holding a USB drive that apparently runs the world.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MENDOZA',
                characterId: 'cartel_boss',
                text: "I admire the audacity. Walking in here like you have leverage.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "They do have leverage. That's the problem.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'EL GATO',
                text: "Everyone wants something different. CIA wants it buried. Cartel wants it weaponized. Venezuela wants it disappeared.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MENDOZA',
                characterId: 'cartel_boss',
                text: "So who gets the USB, boys? Choose before someone chooses for you.",
                position: 'right-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MS. GRAY',
                text: "Choose wisely. Or don't. Either way makes for excellent paperwork.",
                position: 'left',
                next: () => {
                    const hasUsb = inventory.has('neighbors_usb') || inventory.has('cartel_usb');
                    if (hasUsb) {
                        // Gate: player must USE a USB from inventory to force the confrontation
                        gameState.dialogueLock = false;
                        document.getElementById('dialogue-box').classList.add('hidden');
                        const usbName = inventory.has('neighbors_usb') ? 'NEIGHBORS USB' : 'CARTEL USB';
                        showStatusToast(`💡 Open INVENTORY — USE the ${usbName} to make your move!`, 4500);
                    } else {
                        // No USB in inventory — player already gave it away, skip to ending
                        addJournalOnce('no_usb_final', 'NOTE — No USB in Hand', 'The USB was already handed over earlier. The decision was made before this moment. The ending reflects that choice.');
                        sceneRenderer.showDialogue({
                            speaker: 'FINAL CHOICE',
                            text: 'What do you do?',
                            choices: [
                                {
                                    text: 'Stand with the CIA — let Gray control the outcome',
                                    action() {
                                        gameState.flags.WORKING_WITH_CIA = true;
                                        sceneRenderer.loadScene('E_SAD');
                                    }
                                },
                                {
                                    text: 'Walk away — this isn\'t your fight anymore',
                                    action() {
                                        sceneRenderer.loadScene('E_CHAOTIC');
                                    }
                                }
                            ]
                        });
                    }
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
        
        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_smirk-right.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_excited-right.png', position: 'right' }
        ],
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
        
        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' }
        ],
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
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left' },
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk.png', position: 'right' }
        ],
        hotspots: [],

        dialogue: [
            {
                speaker: 'NARRATION',
                text: "Chaos at the warehouse. Explosions. A diplomatic incident with three countries. Someone set a forklift on fire.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'NARRATION',
                text: "And somehow... you're on a boat. At 2am. With Lupita.",
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Welcome to the game, boys. You played it... interestingly.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Are we fugitives now? Or entrepreneurs? I genuinely cannot tell.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Both. Neither. It depends who's asking and how much they're offering.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Hank. What did we do.",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "The CIA is furious. The cartel is reorganizing. Ortega is already spinning it as a Venezuelan intelligence success.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "And the Riveras?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'LUPITA',
                text: "Safe. For now. Nobody's touching them — too much heat. You accidentally created a standoff.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "So we won? By losing completely?",
                position: 'left',
                next: () => {
                    sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'How do you feel about this outcome?',
                        choices: [
                            {
                                text: '"Honestly? I\'ll take it."',
                                action() {
                                    sceneRenderer.showDialogue({
                                        speaker: 'JONAH',
                                        text: "Honestly? I'll take it.",
                                        position: 'left',
                                        next: 'NEXT_DIALOGUE'
                                    });
                                    // Continue to ending narration after a beat
                                    setTimeout(() => {
                                        sceneRenderer.showDialogue({
                                            speaker: 'NARRATION',
                                            text: "ENDING: MULTILATERAL DUMBASSERY\n(Everybody's Mad, Nobody Wins — But The Riveras Are Okay)\n\nThanks for playing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL",
                                            next: () => {
                                                setTimeout(() => {
                                                    sceneRenderer.loadScene('S0_MAIN_MENU');
                                                }, 5000);
                                            }
                                        });
                                    }, 2500);
                                }
                            },
                            {
                                text: '"This is not what I planned."',
                                action() {
                                    sceneRenderer.showDialogue({
                                        speaker: 'LUPITA',
                                        text: "Nobody plans for this. That's what makes it interesting.",
                                        position: 'right',
                                        next: 'NEXT_DIALOGUE'
                                    });
                                    setTimeout(() => {
                                        sceneRenderer.showDialogue({
                                            speaker: 'NARRATION',
                                            text: "ENDING: MULTILATERAL DUMBASSERY\n(Everybody's Mad, Nobody Wins — But The Riveras Are Okay)\n\nThanks for playing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL",
                                            next: () => {
                                                setTimeout(() => {
                                                    sceneRenderer.loadScene('S0_MAIN_MENU');
                                                }, 5000);
                                            }
                                        });
                                    }, 2500);
                                }
                            }
                        ]
                    });
                }
            }
        ]
    },
    
    E_IRONIC_MEDIA: {
        id: 'E_IRONIC_MEDIA',
        title: 'Everyone Has a Narrative',
        background: './assets/backgrounds/bg_hardigan_livingroom_night_02.png',
        music: 'Hardigan Noir Tension.mp3',
        
        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'right' }
        ],
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
        const sceneIds = new Set(Object.keys(SCENES));

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

        const flowWarnings = [];
        Object.values(SCENES).forEach(scene => {
            const dialogue = scene?.dialogue || [];
            dialogue.forEach((entry, idx) => {
                if (!entry || typeof entry !== 'object') return;

                if (typeof entry.next === 'string' && entry.next !== 'NEXT_DIALOGUE' && !sceneIds.has(entry.next)) {
                    flowWarnings.push(`${scene.id} dialogue[${idx}] has unknown next scene: ${entry.next}`);
                }

                if (Array.isArray(entry.choices)) {
                    entry.choices.forEach((choice, choiceIdx) => {
                        if (!choice || typeof choice !== 'object') return;
                        if (typeof choice.next === 'string' && !sceneIds.has(choice.next)) {
                            flowWarnings.push(`${scene.id} dialogue[${idx}] choice[${choiceIdx}] has unknown next scene: ${choice.next}`);
                        }
                    });
                }
            });
        });

        if (flowWarnings.length > 0) {
            console.warn('Scene flow warnings detected:', flowWarnings);
        }

        // Audit background assets
        const bgWarnings = [];
        Object.values(SCENES).forEach(scene => {
            if (!scene?.background) return;
            const img = new Image();
            img.onerror = () => {
                console.warn(`⚠️ Missing background asset: ${scene.background} (scene: ${scene.id})`);
            };
            img.src = scene.background;
        });
    }
};

// ===== DEMO READINESS VALIDATOR =====
// Read-only static analysis of SCENES plus best-effort live asset probing.
// Never mutates SCENES, save data, or live game/scene state: every check
// either reads existing data directly, or (for character layout) goes
// through sceneRenderer.resolveCharacterLayout(), which is itself a pure
// function returning a new object rather than mutating its input. Duplicate
// slot detection here is computed independently of
// sceneRenderer._lastCharacterLayoutWarnings so this validator never
// clobbers that shared field for whatever scene is actually loaded.
//
// Two entry points call demoValidator.validateAll():
//   - Dev Hub "Validate All Scenes" button (see Dev.runDemoValidationAll)
//   - window.__HB_DEBUG__.validateAllScenes() for automated tests
//
// Both resolve to:
//   { ok, generatedAt, durationMs, sceneCount, totals: {error,warning,info}, findings[], markdown }
// where every finding is { sceneId, category, severity, message, fix }.
const demoValidator = {
    SEVERITY: { ERROR: 'error', WARNING: 'warning', INFO: 'info' },
    ASSET_TIMEOUT_MS: 6000,
    ASSET_CONCURRENCY: 8,
    SYSTEM_SPEAKERS: new Set(['NARRATION', 'SYSTEM', 'CHOICE', 'FINAL CHOICE']),
    GLOBAL_SCENE_LABEL: '(global)',

    _imageProbeCache: new Map(),
    _audioProbeCache: new Map(),
    lastReport: null,

    // ===== asset probing (pure network reads, memoized per session) =====
    probeImage(src) {
        if (!src) return Promise.resolve(false);
        if (this._imageProbeCache.has(src)) return this._imageProbeCache.get(src);
        const p = new Promise(resolve => {
            const img = new Image();
            let settled = false;
            const finish = (ok) => { if (settled) return; settled = true; resolve(ok); };
            img.onload = () => finish(true);
            img.onerror = () => finish(false);
            img.src = src;
            setTimeout(() => finish(false), this.ASSET_TIMEOUT_MS);
        });
        this._imageProbeCache.set(src, p);
        return p;
    },

    probeAudio(src) {
        if (!src) return Promise.resolve(false);
        if (this._audioProbeCache.has(src)) return this._audioProbeCache.get(src);
        const p = new Promise(resolve => {
            const audio = new Audio();
            let settled = false;
            const finish = (ok) => { if (settled) return; settled = true; resolve(ok); };
            audio.addEventListener('loadedmetadata', () => finish(true), { once: true });
            audio.addEventListener('error', () => finish(false), { once: true });
            audio.preload = 'metadata';
            audio.src = src;
            setTimeout(() => finish(false), this.ASSET_TIMEOUT_MS);
        });
        this._audioProbeCache.set(src, p);
        return p;
    },

    async probeMany(paths, prober) {
        const unique = [...new Set((paths || []).filter(Boolean))];
        const results = new Map();
        for (let i = 0; i < unique.length; i += this.ASSET_CONCURRENCY) {
            const chunk = unique.slice(i, i + this.ASSET_CONCURRENCY);
            await Promise.all(chunk.map(async src => {
                results.set(src, await prober.call(this, src));
            }));
        }
        return results;
    },

    // ===== read-only source-text introspection =====
    // Function#toString() returns a function's original source text without
    // executing it — used for best-effort discovery of characters spawned,
    // flags set, and inventory ids touched inside onClick/onEnter/next/action
    // callbacks, which the validator otherwise can't see without actually
    // playing the scene (out of scope — see acceptance criterion 1).
    _collectSceneFunctionSources(scene) {
        const sources = [];
        const addFn = (fn) => {
            if (typeof fn === 'function') {
                try { sources.push(fn.toString()); } catch (_) { /* ignore */ }
            }
        };

        addFn(scene.onEnter);
        addFn(scene.checkProgression);
        (scene.hotspots || []).forEach(h => addFn(h?.onClick));
        (scene.items || []).forEach(it => addFn(it?.onClick));
        Object.values(scene.itemUses || {}).forEach(use => addFn(use?.action));
        (scene.dialogue || []).forEach(entry => {
            if (!entry) return;
            addFn(entry.next);
            addFn(entry.onShow);
            (entry.choices || []).forEach(choice => {
                addFn(choice?.action);
                addFn(choice?.next);
            });
        });
        return sources.join('\n');
    },

    _harvestDynamicCharacterIds(sceneSource) {
        const ids = new Set();
        const re = /addCharacter\(\s*\{[^}]*?\bid\s*:\s*['"]([\w.-]+)['"]/g;
        let m;
        while ((m = re.exec(sceneSource))) ids.add(m[1]);
        return ids;
    },

    _harvestFlagsAndItems(sceneSource) {
        const flagsRead = new Set();
        const flagsWritten = new Set();
        const itemsGranted = new Set();
        const itemsChecked = new Set();
        let m;

        const flagWriteRe = /gameState\.flags\.(\w+)\s*=(?!=)/g;
        while ((m = flagWriteRe.exec(sceneSource))) flagsWritten.add(m[1]);
        const flagReadRe = /gameState\.flags\.(\w+)/g;
        while ((m = flagReadRe.exec(sceneSource))) flagsRead.add(m[1]);

        const grantRe = /inventory\.add\(\s*['"]([\w.-]+)['"]/g;
        while ((m = grantRe.exec(sceneSource))) itemsGranted.add(m[1]);
        const checkRe = /inventory\.(?:has|remove)\(\s*['"]([\w.-]+)['"]/g;
        while ((m = checkRe.exec(sceneSource))) itemsChecked.add(m[1]);

        return { flagsRead, flagsWritten, itemsGranted, itemsChecked };
    },

    // ===== per-scene checks =====
    checkSceneStructure(findings, key, scene, ctx) {
        const sceneId = scene.id || key;

        // scene key matches scene.id
        if (scene.id !== key) {
            findings.push({
                sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                message: `SCENES key "${key}" does not match scene.id "${scene.id}".`,
                fix: `Set scene.id to "${key}" (or rename the SCENES key to "${scene.id}").`,
            });
        }

        // unique scene IDs
        const idValue = scene.id || key;
        const keysWithSameId = ctx.idToKeys.get(idValue) || [];
        if (keysWithSameId.length > 1) {
            findings.push({
                sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                message: `scene.id "${idValue}" is shared by SCENES keys: ${keysWithSameId.join(', ')}.`,
                fix: 'Give each scene a unique id — duplicate ids make loadScene()/next references ambiguous.',
            });
        }

        // background path
        if (!scene.background) {
            findings.push({
                sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                message: 'Scene has no background image path.',
                fix: 'Add a background path — the scene cannot render without one.',
            });
        } else {
            ctx.backgroundChecks.push({ sceneId, path: scene.background });
        }

        // music path (optional)
        if (scene.music) {
            ctx.musicChecks.push({ sceneId, path: `./audio/${scene.music}` });
        }

        // next/target references
        const checkNext = (value, where) => {
            if (typeof value !== 'string' || value === 'NEXT_DIALOGUE') return;
            if (!ctx.sceneKeysSet.has(value)) {
                findings.push({
                    sceneId, category: 'flow', severity: this.SEVERITY.ERROR,
                    message: `${where} references unknown scene "${value}".`,
                    fix: `Point to an existing SCENES key or add the "${value}" scene.`,
                });
            }
        };
        (scene.dialogue || []).forEach((entry, idx) => {
            if (!entry) return;
            checkNext(entry.next, `dialogue[${idx}].next`);
            (entry.choices || []).forEach((choice, ci) => {
                checkNext(choice?.next, `dialogue[${idx}].choices[${ci}].next`);
            });
        });
        (scene.hotspots || []).forEach((h, idx) => {
            if (h?.target) checkNext(h.target, `hotspots[${idx}] (${h.id || idx}).target`);
        });

        // unique hotspot ids
        const hotspotIds = new Map();
        (scene.hotspots || []).forEach((h, idx) => {
            const id = h?.id || `(hotspot ${idx})`;
            if (!hotspotIds.has(id)) hotspotIds.set(id, []);
            hotspotIds.get(id).push(idx);
        });
        hotspotIds.forEach((idxs, id) => {
            if (idxs.length > 1) {
                findings.push({
                    sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                    message: `Duplicate hotspot id "${id}" (${idxs.length} occurrences).`,
                    fix: 'Give each hotspot a unique id — duplicates break click-trace/debug tooling and undo.',
                });
            }
        });

        // unique item ids
        const itemIds = new Map();
        (scene.items || []).forEach((it, idx) => {
            const id = it?.id || `(item ${idx})`;
            if (!itemIds.has(id)) itemIds.set(id, []);
            itemIds.get(id).push(idx);
        });
        itemIds.forEach((idxs, id) => {
            if (idxs.length > 1) {
                findings.push({
                    sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                    message: `Duplicate item id "${id}" (${idxs.length} occurrences).`,
                    fix: 'Give each item a unique id — duplicates confuse inventory.has()/collection state.',
                });
            }
        });

        // hotspot bounds and positive dimensions
        (scene.hotspots || []).forEach((h, idx) => {
            if (!h) return;
            const label = h.id || `hotspots[${idx}]`;
            const x = Number(h.x), y = Number(h.y), w = Number(h.width), ht = Number(h.height);
            const allFinite = [x, y, w, ht].every(n => Number.isFinite(n));
            if (!allFinite) {
                findings.push({
                    sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                    message: `Hotspot "${label}" has non-finite x/y/width/height.`,
                    fix: 'Ensure x, y, width, and height are all numbers.',
                });
                return;
            }
            if (!(w > 0) || !(ht > 0)) {
                findings.push({
                    sceneId, category: 'structure', severity: this.SEVERITY.ERROR,
                    message: `Hotspot "${label}" has non-positive dimensions (width=${h.width}, height=${h.height}).`,
                    fix: 'Set width/height to positive numbers so the hotspot is clickable.',
                });
            }
            const isNative = h.coordSystem === 'native';
            const maxX = isNative ? positioningSystem.REF_WIDTH : 100;
            const maxY = isNative ? positioningSystem.REF_HEIGHT : 100;
            if (x < 0 || y < 0 || x + w > maxX || y + ht > maxY) {
                findings.push({
                    sceneId, category: 'structure', severity: this.SEVERITY.WARNING,
                    message: `Hotspot "${label}" bounds extend outside the ${isNative ? '1920×1080 native' : '0-100%'} reference space.`,
                    fix: 'Adjust x/y/width/height to stay inside the reference frame.',
                });
            }
        });
    },

    checkSceneCharacters(findings, key, scene, ctx) {
        const sceneId = scene.id || key;
        const characters = scene.characters || [];

        // unique character ids
        const idMap = new Map();
        characters.forEach((c, idx) => {
            const id = c?.id || `(character ${idx})`;
            if (!idMap.has(id)) idMap.set(id, []);
            idMap.get(id).push(idx);
        });
        idMap.forEach((idxs, id) => {
            if (idxs.length > 1) {
                findings.push({
                    sceneId, category: 'characters', severity: this.SEVERITY.ERROR,
                    message: `Duplicate character id "${id}" (${idxs.length} occurrences).`,
                    fix: 'Give each character a unique id — duplicates break speaker/highlight resolution.',
                });
            }
        });

        // resolveCharacterLayout is pure — returns a new object, never
        // mutates the scene's characters array.
        const resolved = characters.map(c => sceneRenderer.resolveCharacterLayout(c || {}));

        // duplicate-slot detection, computed independently of
        // sceneRenderer._lastCharacterLayoutWarnings (see file header note).
        const bySlot = new Map();
        resolved.forEach(c => {
            if (!bySlot.has(c.slot)) bySlot.set(c.slot, []);
            bySlot.get(c.slot).push(c.id || c.name || '(unnamed)');
        });
        bySlot.forEach((names, slot) => {
            if (names.length > 1) {
                findings.push({
                    sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                    message: `Duplicate slot "${slot}" claimed by: ${names.join(', ')}.`,
                    fix: 'Assign distinct slot/position values — characters sharing a slot render on top of each other.',
                });
            }
        });

        characters.forEach((raw, idx) => {
            const c = resolved[idx];
            const label = raw?.id || raw?.name || `characters[${idx}]`;

            const rawSlot = raw?.slot || raw?.position;
            if (rawSlot && !sceneRenderer.validZones.has(rawSlot)) {
                findings.push({
                    sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                    message: `Character "${label}" has invalid slot/position "${rawSlot}" — falls back to "center".`,
                    fix: `Use one of: ${[...sceneRenderer.validZones].join(', ')}.`,
                });
            }

            if (raw?.scale !== undefined && (typeof raw.scale !== 'number' || !isFinite(raw.scale) || raw.scale <= 0)) {
                findings.push({
                    sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                    message: `Character "${label}" has invalid scale "${raw.scale}" — falls back to 1.`,
                    fix: 'scale must be a positive finite number.',
                });
            }

            ['offsetX', 'offsetY'].forEach(field => {
                const v = raw?.[field];
                if (v === undefined) return;
                if (typeof v !== 'number' || !isFinite(v)) {
                    findings.push({
                        sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                        message: `Character "${label}" has invalid ${field} "${v}" — falls back to 0.`,
                        fix: `${field} must be a finite number (pixels).`,
                    });
                } else if (Math.abs(v) > 800) {
                    findings.push({
                        sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                        message: `Character "${label}" has a large ${field} (${v}px) — may push the sprite off-screen.`,
                        fix: 'Verify this offset visually; consider reducing its magnitude.',
                    });
                }
            });

            ['headAnchorX', 'headAnchorY'].forEach(field => {
                const v = raw?.[field];
                if (v === undefined) return;
                if (typeof v !== 'number' || !isFinite(v) || v < 0 || v > 1) {
                    findings.push({
                        sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                        message: `Character "${label}" has invalid ${field} "${v}" — must be 0-1, metadata ignored.`,
                        fix: `${field} should be a fraction between 0 and 1.`,
                    });
                }
            });

            if (raw?.zIndex !== undefined && (typeof raw.zIndex !== 'number' || !isFinite(raw.zIndex))) {
                findings.push({
                    sceneId, category: 'characters', severity: this.SEVERITY.WARNING,
                    message: `Character "${label}" has invalid zIndex "${raw.zIndex}" — falls back to the slot default.`,
                    fix: 'zIndex must be a finite number.',
                });
            }

            if (raw?.sprite) {
                ctx.spriteChecks.push({ sceneId, label, sprite: raw.sprite, zone: c.slot });
            } else {
                findings.push({
                    sceneId, category: 'characters', severity: this.SEVERITY.ERROR,
                    message: `Character "${label}" has no sprite specified.`,
                    fix: 'Add a sprite filename.',
                });
            }
        });
    },

    checkSceneDialogue(findings, key, scene, ctx) {
        const sceneId = scene.id || key;
        const dialogue = scene.dialogue || [];
        const characters = scene.characters || [];

        const charById = new Map(characters.filter(c => c?.id).map(c => [String(c.id).toLowerCase(), c]));
        const normalizeToken = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
        const charNameTokens = characters.filter(c => c?.name).map(c => normalizeToken(c.name));

        const sceneSource = this._collectSceneFunctionSources(scene);
        const dynamicIds = this._harvestDynamicCharacterIds(sceneSource);
        const dynamicTokens = [...dynamicIds].map(id => normalizeToken(id));

        const resolvesToCharacter = (speaker, characterId) => {
            if (characterId) {
                return charById.has(String(characterId).toLowerCase()) || dynamicIds.has(characterId);
            }
            if (!speaker) return true;
            const token = normalizeToken(speaker);
            const byId = charById.has(String(speaker).toLowerCase());
            const byName = charNameTokens.some(ct => ct === token || ct.includes(token) || token.includes(ct));
            const byDynamic = dynamicTokens.some(dt => dt === token);
            return byId || byName || byDynamic;
        };

        dialogue.forEach((entry, idx) => {
            if (!entry || typeof entry !== 'object') {
                findings.push({
                    sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                    message: `dialogue[${idx}] is not a valid object.`,
                    fix: 'Remove or fix this entry.',
                });
                return;
            }
            const prefix = `dialogue[${idx}]`;
            const speaker = entry.speaker;
            const isSystemSpeaker = this.SYSTEM_SPEAKERS.has(speaker) || !speaker;
            const isChoiceEntry = speaker === 'CHOICE' || speaker === 'FINAL CHOICE';

            if (!isSystemSpeaker && !resolvesToCharacter(speaker, entry.characterId)) {
                findings.push({
                    sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                    message: `${prefix}: speaker "${speaker}" does not resolve to a character in scene.characters, an explicit addCharacter() spawn, or an allowed system speaker.`,
                    fix: 'Add this character to scene.characters, spawn it via addCharacter() before this line, or fix the speaker name/characterId.',
                });
            }

            if (entry.characterId) {
                const idLower = String(entry.characterId).toLowerCase();
                if (!charById.has(idLower) && !dynamicIds.has(entry.characterId)) {
                    findings.push({
                        sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                        message: `${prefix}: characterId "${entry.characterId}" not found in scene.characters or any addCharacter() spawn in this scene.`,
                        fix: 'Correct the characterId or add/spawn that character.',
                    });
                }
            }

            if (!isSystemSpeaker && (!entry.position || !sceneRenderer.validZones.has(entry.position))) {
                findings.push({
                    sceneId, category: 'dialogue', severity: this.SEVERITY.WARNING,
                    message: `${prefix} (${speaker}): missing or invalid position ("${entry.position}").`,
                    fix: `Set position to one of: ${[...sceneRenderer.validZones].join(', ')}.`,
                });
            }

            if (entry.bubbleLayout) {
                const bl = entry.bubbleLayout;
                const nums = ['left', 'top', 'width', 'height'].map(k => Number(bl[k]));
                const allFinite = nums.every(n => Number.isFinite(n));
                const [left, top, width, height] = nums;
                if (!allFinite || !(width > 0) || !(height > 0)) {
                    findings.push({
                        sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                        message: `${prefix}: bubbleLayout has non-finite or non-positive values (${JSON.stringify(bl)}).`,
                        fix: 'left/top/width/height must all be finite numbers, width and height > 0.',
                    });
                } else if (left < 0 || top < 0 || left + width > 1920 || top + height > 1080) {
                    findings.push({
                        sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                        message: `${prefix}: bubbleLayout rect extends outside the 1920×1080 reference space (${JSON.stringify(bl)}).`,
                        fix: 'Adjust left/top/width/height so the rect stays fully inside 0-1920 x 0-1080.',
                    });
                }
            }

            if (isChoiceEntry) {
                if (!Array.isArray(entry.choices) || entry.choices.length === 0) {
                    findings.push({
                        sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                        message: `${prefix} (${speaker}): no choices array or it is empty.`,
                        fix: 'Add at least one choice with text and an action/next.',
                    });
                } else {
                    entry.choices.forEach((choice, ci) => {
                        const cprefix = `${prefix}.choices[${ci}]`;
                        if (!choice || !choice.text) {
                            findings.push({
                                sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                                message: `${cprefix}: missing or empty text.`,
                                fix: 'Add player-facing choice text.',
                            });
                        }
                        if (choice && choice.action !== undefined && typeof choice.action !== 'function') {
                            findings.push({
                                sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                                message: `${cprefix}: action is present but not callable (${typeof choice.action}).`,
                                fix: 'action must be a function.',
                            });
                        }
                        if (choice && !choice.action && !choice.next) {
                            findings.push({
                                sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                                message: `${cprefix}: has neither action nor next — selecting it does nothing.`,
                                fix: 'Add an action function or a next scene id.',
                            });
                        }
                    });
                }
            }

            if (!entry.text && entry.text !== 0) {
                findings.push({
                    sceneId, category: 'dialogue', severity: this.SEVERITY.ERROR,
                    message: `${prefix}: missing or empty text.`,
                    fix: 'Add dialogue text.',
                });
            }

            const isLast = idx === dialogue.length - 1;
            const hasChoices = Array.isArray(entry.choices) && entry.choices.length > 0;
            if (!isLast && !hasChoices && !entry.next) {
                findings.push({
                    sceneId, category: 'flow', severity: this.SEVERITY.ERROR,
                    message: `${prefix}: no next/choices, but ${dialogue.length - idx - 1} more entries follow — they are unreachable.`,
                    fix: `Add next: 'NEXT_DIALOGUE' (or a target) so dialogue[${idx + 1}] onward remains reachable.`,
                });
            } else if (isLast && !hasChoices && !entry.next) {
                findings.push({
                    sceneId, category: 'flow', severity: this.SEVERITY.INFO,
                    message: `${prefix}: last dialogue entry has no next — assumed intentional (scene waits for hotspot/item interaction).`,
                    fix: 'No action needed if this is intentional.',
                });
            }
        });

        const { flagsRead, itemsChecked } = this._harvestFlagsAndItems(sceneSource);
        flagsRead.forEach(flag => {
            if (!ctx.globalFlagsWritten.has(flag)) {
                findings.push({
                    sceneId, category: 'dialogue', severity: this.SEVERITY.INFO,
                    message: `Flag "gameState.flags.${flag}" is referenced here but never appears to be assigned anywhere in SCENES.`,
                    fix: 'Verify this is intentional (defaults to falsy) or check for a typo elsewhere.',
                });
            }
        });
        itemsChecked.forEach(itemId => {
            if (!ctx.knownItemIds.has(itemId)) {
                findings.push({
                    sceneId, category: 'dialogue', severity: this.SEVERITY.INFO,
                    message: `Item id "${itemId}" is checked/removed here but never appears as a scene item or inventory.add() target anywhere.`,
                    fix: 'Verify the item id is spelled correctly and is actually granted somewhere.',
                });
            }
        });
    },

    buildMarkdownReport(report) {
        const lines = [];
        lines.push('# Demo Validation Report');
        lines.push('');
        lines.push(`Generated: ${report.generatedAt}`);
        lines.push(`Scenes scanned: ${report.sceneCount}`);
        lines.push(`Duration: ${report.durationMs}ms`);
        lines.push('');
        lines.push('## Totals');
        lines.push('');
        lines.push('| Severity | Count |');
        lines.push('|---|---|');
        lines.push(`| Error | ${report.totals.error} |`);
        lines.push(`| Warning | ${report.totals.warning} |`);
        lines.push(`| Info | ${report.totals.info} |`);
        lines.push('');
        lines.push(report.ok
            ? '**Result: PASS — zero errors.**'
            : `**Result: FAIL — ${report.totals.error} error(s) must be fixed before demo.**`);
        lines.push('');

        const bySceneId = new Map();
        report.findings.forEach(f => {
            if (!bySceneId.has(f.sceneId)) bySceneId.set(f.sceneId, []);
            bySceneId.get(f.sceneId).push(f);
        });

        const severityOrder = { error: 0, warning: 1, info: 2 };
        const sortedSceneIds = [...bySceneId.keys()].sort((a, b) => {
            if (a === this.GLOBAL_SCENE_LABEL) return -1;
            if (b === this.GLOBAL_SCENE_LABEL) return 1;
            return a.localeCompare(b);
        });

        lines.push('## Findings by scene');
        lines.push('');
        if (sortedSceneIds.length === 0) {
            lines.push('No findings.');
        }
        sortedSceneIds.forEach(sceneId => {
            const items = bySceneId.get(sceneId).slice().sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
            const counts = { error: 0, warning: 0, info: 0 };
            items.forEach(f => counts[f.severity]++);
            lines.push(`### ${sceneId} — ${counts.error} error, ${counts.warning} warning, ${counts.info} info`);
            lines.push('');
            items.forEach(f => {
                const badge = f.severity === 'error' ? '[ERROR]' : f.severity === 'warning' ? '[WARNING]' : '[INFO]';
                lines.push(`- ${badge} \`${f.category}\` ${f.message}`);
                lines.push(`  - Fix: ${f.fix}`);
            });
            lines.push('');
        });

        lines.push('## Methodology / known limitations');
        lines.push('');
        lines.push('- Dialogue shown dynamically from inside onClick/onEnter/next/action callbacks (not the top-level `scene.dialogue` array) is validated only insofar as `addCharacter()` calls, `gameState.flags.*`, and `inventory.*` references can be discovered via read-only `Function#toString()` source inspection. This is best-effort, not exhaustive — see acceptance criterion 1 (the validator does not enter scenes or execute callbacks).');
        lines.push('- Flag/item reference findings are info-level because the detection is heuristic (regex over function source) and can both under- and over-report.');
        lines.push('- Asset checks are live network probes (Image/Audio) against the paths scene data references; a slow or offline asset host will show assets as missing.');
        lines.push('- Missing directional sprite-fallback candidates are not counted as errors when the primary sprite resolves; they are only surfaced (as a warning) when the primary sprite is itself missing and a fallback candidate is what actually renders.');
        lines.push('- This validator never mutates SCENES, save data, or live game state.');
        lines.push('');

        return lines.join('\n');
    },

    // ===== orchestrator =====
    async validateAll() {
        const startedAt = Date.now();
        const findings = [];
        const sceneEntries = Object.entries(SCENES).filter(([, scene]) => scene && typeof scene === 'object');
        const sceneKeysSet = new Set(sceneEntries.map(([key]) => key));

        const idToKeys = new Map();
        sceneEntries.forEach(([key, scene]) => {
            const idValue = scene.id || key;
            if (!idToKeys.has(idValue)) idToKeys.set(idValue, []);
            idToKeys.get(idValue).push(key);
        });

        // Global pass: known item ids + flags actually assigned anywhere,
        // used by the per-scene flag/item sanity checks below.
        const globalFlagsWritten = new Set();
        const knownItemIds = new Set();
        sceneEntries.forEach(([, scene]) => {
            (scene.items || []).forEach(it => { if (it?.id) knownItemIds.add(it.id); });
            const src = this._collectSceneFunctionSources(scene);
            const { flagsWritten, itemsGranted } = this._harvestFlagsAndItems(src);
            flagsWritten.forEach(f => globalFlagsWritten.add(f));
            itemsGranted.forEach(i => knownItemIds.add(i));
        });

        const ctx = {
            sceneKeysSet, idToKeys, globalFlagsWritten, knownItemIds,
            backgroundChecks: [], musicChecks: [], spriteChecks: [],
        };

        sceneEntries.forEach(([key, scene]) => {
            this.checkSceneStructure(findings, key, scene, ctx);
            this.checkSceneCharacters(findings, key, scene, ctx);
            this.checkSceneDialogue(findings, key, scene, ctx);
        });

        // ---- background assets ----
        const bgResults = await this.probeMany(ctx.backgroundChecks.map(c => c.path), this.probeImage);
        ctx.backgroundChecks.forEach(({ sceneId, path }) => {
            if (!bgResults.get(path)) {
                findings.push({
                    sceneId, category: 'assets/background', severity: this.SEVERITY.ERROR,
                    message: `Background asset not found or failed to load: ${path}`,
                    fix: 'Add the missing background file or correct scene.background.',
                });
            }
        });

        // ---- music assets ----
        const musicResults = await this.probeMany(ctx.musicChecks.map(c => c.path), this.probeAudio);
        ctx.musicChecks.forEach(({ sceneId, path }) => {
            if (!musicResults.get(path)) {
                findings.push({
                    sceneId, category: 'assets/music', severity: this.SEVERITY.WARNING,
                    message: `Music asset not found or failed to load: ${path}`,
                    fix: 'Add the missing audio file or correct scene.music (the scene still runs muted, but demo quality suffers).',
                });
            }
        });

        // ---- character sprites: primary first, fallback chain only if primary is missing ----
        const primaryPaths = ctx.spriteChecks.map(c => `./assets/characters/${c.sprite}`);
        const primaryResults = await this.probeMany(primaryPaths, this.probeImage);
        const needsFallbackProbe = ctx.spriteChecks.filter(c => !primaryResults.get(`./assets/characters/${c.sprite}`));
        const candidateListBySprite = new Map();
        const fallbackCandidatePaths = [];
        needsFallbackProbe.forEach(c => {
            const candidates = sceneRenderer.buildSpriteCandidates(c.sprite, c.zone);
            candidateListBySprite.set(c, candidates);
            candidates.forEach(name => fallbackCandidatePaths.push(`./assets/characters/${name}`));
        });
        const fallbackResults = await this.probeMany(fallbackCandidatePaths, this.probeImage);
        needsFallbackProbe.forEach(c => {
            const candidates = candidateListBySprite.get(c) || [];
            const workingCandidate = candidates.find(name => fallbackResults.get(`./assets/characters/${name}`));
            if (workingCandidate) {
                findings.push({
                    sceneId: c.sceneId, category: 'assets/sprite', severity: this.SEVERITY.WARNING,
                    message: `Character "${c.label}": primary sprite "${c.sprite}" not found; renders via fallback candidate "${workingCandidate}".`,
                    fix: `Add a file named "${c.sprite}", or update scene data to reference "${workingCandidate}" directly and document the fallback.`,
                });
            } else {
                findings.push({
                    sceneId: c.sceneId, category: 'assets/sprite', severity: this.SEVERITY.ERROR,
                    message: `Character "${c.label}": no valid sprite found (tried "${c.sprite}" and ${candidates.length} fallback candidate(s)).`,
                    fix: 'Add a matching sprite file under assets/characters/.',
                });
            }
        });

        // ---- item icons ----
        const itemIconChecks = [];
        sceneEntries.forEach(([key, scene]) => {
            (scene.items || []).forEach(it => {
                if (it?.id) itemIconChecks.push({ sceneId: scene.id || key, id: it.id, path: `./assets/items/item_${it.id}.png` });
            });
        });
        const itemIconResults = await this.probeMany(itemIconChecks.map(c => c.path), this.probeImage);
        itemIconChecks.forEach(({ sceneId, id, path }) => {
            if (!itemIconResults.get(path)) {
                findings.push({
                    sceneId, category: 'assets/item', severity: this.SEVERITY.ERROR,
                    message: `Item "${id}" icon not found: ${path}`,
                    fix: `Add assets/items/item_${id}.png.`,
                });
            }
        });

        // ---- global (non-scene-specific) assets ----
        const bubbleAssets = [
            './assets/menu_dialogue/dialogue-bubble-large-left.png',
            './assets/menu_dialogue/dialogue-bubble-large-right.png',
        ];
        const bubbleResults = await this.probeMany(bubbleAssets, this.probeImage);
        bubbleAssets.forEach(path => {
            if (!bubbleResults.get(path)) {
                findings.push({
                    sceneId: this.GLOBAL_SCENE_LABEL, category: 'assets/bubble', severity: this.SEVERITY.ERROR,
                    message: `Dialogue bubble asset not found: ${path}`,
                    fix: 'Character-relative speech bubbles cannot render without this file.',
                });
            }
        });

        const uiAssets = assetLoader.getCriticalAssets().filter(a => a.startsWith('./assets/ui/'));
        const uiResults = await this.probeMany(uiAssets, this.probeImage);
        uiAssets.forEach(path => {
            if (!uiResults.get(path)) {
                findings.push({
                    sceneId: this.GLOBAL_SCENE_LABEL, category: 'assets/ui', severity: this.SEVERITY.ERROR,
                    message: `UI asset not found: ${path}`,
                    fix: 'Add the missing UI asset.',
                });
            }
        });

        findings.push({
            sceneId: this.GLOBAL_SCENE_LABEL, category: 'assets/sfx', severity: this.SEVERITY.INFO,
            message: 'SFX are synthesized in-browser via SFXGenerator (Web Audio API) — there are no SFX file assets to validate.',
            fix: 'No action needed.',
        });

        const totals = { error: 0, warning: 0, info: 0 };
        findings.forEach(f => { totals[f.severity] = (totals[f.severity] || 0) + 1; });

        const report = {
            ok: totals.error === 0,
            generatedAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            sceneCount: sceneEntries.length,
            totals,
            findings,
        };
        report.markdown = this.buildMarkdownReport(report);
        this.lastReport = report;
        return report;
    },
};

// ===== SETTINGS PERSISTENCE =====
function loadSettingsFromStorage() {
    try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return;
        if (typeof parsed.musicVolume === 'number') {
            gameState.settings.musicVolume = Math.min(100, Math.max(0, parsed.musicVolume));
        }
        if (typeof parsed.sfxVolume === 'number') {
            gameState.settings.sfxVolume = Math.min(100, Math.max(0, parsed.sfxVolume));
        }
        if (typeof parsed.showHotspots === 'boolean') {
            gameState.settings.showHotspots = parsed.showHotspots;
        }
    } catch (e) {
        // Corrupt storage — silently ignore, defaults remain
    }
}

function saveSettingsToStorage() {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(gameState.settings));
    } catch (e) {
        // Storage unavailable — silently ignore
    }
}

// ===== UI EVENT HANDLERS =====
function setupUIHandlers() {
    // Inventory button
    document.getElementById('btn-inventory').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        inventory.show();
    });
    
    // Notebook button - only opens if the notebook has been collected from the scene
    document.getElementById('btn-notebook').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        if (!inventory.has('conspiracy_notebook')) {
            // Notebook not yet found - show a hint
            sceneRenderer.showDialogue({
                speaker: 'NARRATION',
                text: "You haven't found anything to write in yet...",
                next: 'NEXT_DIALOGUE'
            });
            return;
        }
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
            uiModal.show({ title: 'Saved', bodyText: 'Game saved successfully!' });
        }
    });
    
    // Settings button
    document.getElementById('btn-settings').addEventListener('click', () => {
        SFXGenerator.playButtonClick();
        document.getElementById('pause-menu').classList.add('hidden');
        // Sync UI controls to current (possibly loaded) settings before showing
        const _musicVol = document.getElementById('music-volume');
        const _musicDisplay = document.getElementById('music-volume-display');
        const _sfxVol = document.getElementById('sfx-volume');
        const _sfxDisplay = document.getElementById('sfx-volume-display');
        const _showHotspots = document.getElementById('show-hotspots');
        if (_musicVol) { _musicVol.value = gameState.settings.musicVolume; }
        if (_musicDisplay) { _musicDisplay.textContent = gameState.settings.musicVolume + '%'; }
        if (_sfxVol) { _sfxVol.value = gameState.settings.sfxVolume; }
        if (_sfxDisplay) { _sfxDisplay.textContent = gameState.settings.sfxVolume + '%'; }
        if (_showHotspots) { _showHotspots.checked = gameState.settings.showHotspots; }
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close the topmost visible overlay
            const overlays = ['settings-overlay', 'inventory-overlay', 'notebook-overlay', 'pause-menu'];
            for (const id of overlays) {
                const el = document.getElementById(id);
                if (el && !el.classList.contains('hidden')) {
                    SFXGenerator.playButtonClick();
                    el.classList.add('hidden');
                    // If closing pause menu, resume music
                    if (id === 'pause-menu') {
                        const currentScene = SCENES[gameState.currentSceneId];
                        if (currentScene?.music) audioManager.playMusic(currentScene.music);
                    }
                    e.preventDefault();
                    return;
                }
            }
        }
    });
    
    // Music volume slider
    const musicVol = document.getElementById('music-volume');
    const musicDisplay = document.getElementById('music-volume-display');
    musicVol.addEventListener('input', (e) => {
        gameState.settings.musicVolume = parseInt(e.target.value);
        musicDisplay.textContent = e.target.value + '%';
        audioManager.updateVolumes();
        saveSettingsToStorage();
    });

    // SFX volume slider
    const sfxVol = document.getElementById('sfx-volume');
    const sfxDisplay = document.getElementById('sfx-volume-display');
    sfxVol.addEventListener('input', (e) => {
        gameState.settings.sfxVolume = parseInt(e.target.value);
        sfxDisplay.textContent = e.target.value + '%';
        audioManager.updateVolumes();
        saveSettingsToStorage();
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
        saveSettingsToStorage();
    });
}

function showTransitionLoader() {
    const loader = document.getElementById('fade-overlay');
    if (!loader) return;

    loader.classList.add('loading');
    loader.style.opacity = '0.85';
    loader.style.pointerEvents = 'all';
    loader.innerHTML = '<div class="loading-spinner"></div>';
}

function hideTransitionLoader() {
    const loader = document.getElementById('fade-overlay');
    if (!loader) return;

    loader.classList.remove('loading');
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    loader.innerHTML = '';
}

// Viewport height fix for iOS/browser UI chrome changes
function setAppHeight() {
    const vh = window.innerHeight * 0.01;
    const actualHeight = window.innerHeight;

    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--app-height', `${actualHeight}px`);

    const gameRoot = document.getElementById('game-root');
    if (gameRoot) {
        gameRoot.style.height = `${actualHeight}px`;
    }
}

let appHeightResizeTimeout;
let appHeightScrollTimeout;

function setupViewportHeightHandlers() {
    setAppHeight();

    window.addEventListener('resize', () => {
        clearTimeout(appHeightResizeTimeout);
        appHeightResizeTimeout = setTimeout(setAppHeight, 100);
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(setAppHeight, 100);
    });

    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        window.addEventListener('scroll', () => {
            clearTimeout(appHeightScrollTimeout);
            appHeightScrollTimeout = setTimeout(setAppHeight, 200);
        }, { passive: true });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', safeAsync(async () => {
    console.log('🎮 Initializing THE HARDIGAN BROTHERS vs THE MEXICAN DRUG CARTEL...');

    setupViewportHeightHandlers();

    // ?noAnimations=1 — apply before any scene/UI renders so nothing animates in.
    if (HB_FLAG_NO_ANIMATIONS) document.body.classList.add('hb-no-animations');

    // Restore persisted settings before audio/UI init so volumes apply immediately
    loadSettingsFromStorage();

    // Initialize scene transition state
    sceneRenderer.transition = {
        overlayEl: document.getElementById('scene-transition-overlay'),
        titleFxEl: document.getElementById('scene-title-fx'),
        isRunning: false,
    };

    // Initialize audio
    audioManager.init();
    // ?mute=1 — silence music/SFX from boot, before any track starts playing.
    if (HB_FLAG_MUTE) {
        SFXGenerator.muted = true;
        audioManager.setMuted(true);
    }
    mobileOptimizer.init();

    // Normalize scene data before the first scene loads.
    sceneIntegrity.validateAndNormalize();

    Dev.kernel.initOnce();

    if (Dev.toolsEnabled) {
        Dev.validateScenes();
    }

    // Clear stale dev patches now that coordinates are baked into source
    try { localStorage.removeItem('DEV_PATCHES'); } catch(e) {}
    try { localStorage.removeItem('DEV_LAYOUTS'); } catch(e) {}

    // Setup UI handlers
    setupUIHandlers();

    // Apply hotspot setting
    if (gameState.settings.showHotspots) {
        document.body.classList.add('show-hotspots');
    }

    await assetLoader.preloadAssets();

    const sceneContainer = document.getElementById('scene-container');
    sceneContainer.addEventListener('click', (e) => {
        // Legacy debug logging for hotspot calibration
        if (!gameState.settings.showHotspots) return;
        const rect = positioningSystem.getBackgroundRect();
        const nativePoint = positioningSystem.clientToNative(e.clientX, e.clientY);
        if (!rect || !nativePoint || !DEBUG) return;
        const imgX = Math.round(nativePoint.x);
        const imgY = Math.round(nativePoint.y);
        const pctX = ((nativePoint.x / positioningSystem.REF_WIDTH) * 100).toFixed(1);
        const pctY = ((nativePoint.y / positioningSystem.REF_HEIGHT) * 100).toFixed(1);
        console.log(`[Debug] Click → native: (${imgX}, ${imgY}) | percent: (${pctX}%, ${pctY}%) | screen: (${Math.round(nativePoint.localX)}, ${Math.round(nativePoint.localY)})`);
    });

    // Responsive positioning: recalculate on resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            try {
                setAppHeight();
                positioningSystem.recalculateAll();
                Dev.tools.applyForCurrentScene();
                sceneRenderer.repositionActiveDialogue();
            } catch (error) {
                errorLogger.log('resize-recalculate', error);
            }
        }, mobileOptimizer.resizeDebounceMs);
    });

    // Also recalculate on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            try {
                setAppHeight();
                positioningSystem.recalculateAll();
                Dev.tools.applyForCurrentScene();
                sceneRenderer.repositionActiveDialogue();
            } catch (error) {
                errorLogger.log('orientation-recalculate', error);
            }
        }, 300);
    });

    // Hide loading screen then play intro video before main menu
    setTimeout(() => {
        assetLoader.hideLoadingScreen();

        // ?skipIntro=1 — bypass the studio intro video entirely.
        if (HB_FLAG_SKIP_INTRO) {
            sceneRenderer.loadScene('S0_MAIN_MENU');
            return;
        }

        const introScreen = document.getElementById('intro-video-screen');
        const introVideo = document.getElementById('intro-video');
        const skipBtn = document.getElementById('intro-skip-btn');

        introScreen.classList.remove('hidden');

        // One-shot handler: fade out intro then load main menu
        const finishIntro = (() => {
            let done = false;
            return () => {
                if (done) return;
                done = true;
                introScreen.classList.add('fading-out');
                setTimeout(() => {
                    introScreen.classList.add('hidden');
                    introScreen.classList.remove('fading-out');
                    try { introVideo.pause(); } catch (_) {}
                    introVideo.src = '';
                    sceneRenderer.loadScene('S0_MAIN_MENU');
                }, 400);
            };
        })();

        introVideo.addEventListener('ended', finishIntro, { once: true });
        skipBtn.addEventListener('click', finishIntro, { once: true });

        // Keyboard skip (any key)
        document.addEventListener('keydown', finishIntro, { once: true });

        // Try to play with sound; fall back to muted for autoplay policy
        introVideo.muted = false;
        introVideo.play().catch(() => {
            introVideo.muted = true;
            introVideo.play().catch(() => {
                // If video cannot play at all, go straight to menu
                finishIntro();
            });
        });
    }, 250);

    console.log('✅ Game initialized successfully!');
}, 'bootstrap'));

// ============================================
// ===== DEBUG / TESTING API (window.__HB_DEBUG__) =====
// ============================================
// Only attached when the page is loaded with ?debug=true (see HB_DEBUG_ENABLED
// above). Provides deterministic hooks for automated layout/regression testing
// without touching game content, story flags, or any production code path.
// Documented in DEVELOPMENT.md.

// Deep-clones a value into a plain, JSON-safe structure: functions are
// dropped, Sets/Maps become arrays/objects, and circular refs are guarded.
function hbToJSONSafe(value, seen, depth) {
    seen = seen || new WeakSet();
    depth = depth || 0;
    if (value === null || value === undefined) return value;
    const type = typeof value;
    if (type === 'function') return undefined;
    if (type !== 'object') return value;
    if (depth > 6) return '[Truncated]';
    if (value instanceof Set) return Array.from(value).map(v => hbToJSONSafe(v, seen, depth + 1));
    if (value instanceof Map) return hbToJSONSafe(Object.fromEntries(value), seen, depth + 1);
    if (Array.isArray(value)) return value.map(v => hbToJSONSafe(v, seen, depth + 1));
    if (value instanceof Node) return undefined; // never serialize DOM nodes
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    const out = {};
    Object.keys(value).forEach(key => {
        const v = hbToJSONSafe(value[key], seen, depth + 1);
        if (v !== undefined) out[key] = v;
    });
    return out;
}

// Viewport-relative bounding rect plus a best-effort visibility check.
function hbGetRect(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const visible = style.display !== 'none' && style.visibility !== 'hidden' &&
        parseFloat(style.opacity || '1') > 0.01 && r.width > 0 && r.height > 0;
    return {
        left: r.left, top: r.top, right: r.right, bottom: r.bottom,
        width: r.width, height: r.height, visible
    };
}

// The "scene safe area" is the rendered background frame (letterboxed/pillarboxed
// as needed), in viewport coordinates — the same frame validateCurrentLayout()
// checks other rectangles against.
function hbGetSafeAreaRect() {
    const container = document.getElementById('scene-container');
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    const bgRect = positioningSystem.getBackgroundRect();
    if (!bgRect) {
        return {
            left: containerRect.left, top: containerRect.top,
            right: containerRect.right, bottom: containerRect.bottom,
            width: containerRect.width, height: containerRect.height
        };
    }
    return {
        left: containerRect.left + bgRect.offsetX,
        top: containerRect.top + bgRect.offsetY,
        right: containerRect.left + bgRect.offsetX + bgRect.renderedW,
        bottom: containerRect.top + bgRect.offsetY + bgRect.renderedH,
        width: bgRect.renderedW,
        height: bgRect.renderedH
    };
}

// True when `rect` extends outside `area` by more than `tolerance` px.
// Rects with no rendered size (hidden elements) are never flagged.
function hbRectOutsideArea(rect, area, tolerance) {
    tolerance = tolerance || 1;
    if (!rect || !area) return null;
    if (rect.width <= 0 && rect.height <= 0) return false;
    return (
        rect.left < area.left - tolerance ||
        rect.top < area.top - tolerance ||
        rect.right > area.right + tolerance ||
        rect.bottom > area.bottom + tolerance
    );
}

function hbGetOverflow(el) {
    if (!el) return null;
    return {
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        overflowX: Math.max(0, el.scrollWidth - el.clientWidth),
        overflowY: Math.max(0, el.scrollHeight - el.clientHeight)
    };
}

// Images currently showing the "missing asset" SVG placeholder, plus any
// srcs assetLoader already recorded as failed preloads.
function hbGetMissingAssetInfo() {
    const placeholders = Array.from(document.querySelectorAll('img'))
        .filter(img => typeof img.src === 'string' && img.src.startsWith('data:image/svg'))
        .map(img => ({ id: img.id || null, alt: img.alt || null }));
    return {
        preloadErrors: [...assetLoader.errors],
        placeholderImagesInDom: placeholders
    };
}

function hbBuildLayoutSnapshot() {
    try {
        const dialogueBox = document.getElementById('dialogue-box');
        const dialogueContent = document.getElementById('dialogue-content');
        const dialogueText = document.getElementById('dialogue-text');
        const dialogueSpeaker = document.getElementById('dialogue-speaker');
        const continueBtn = document.getElementById('dialogue-continue');
        const choicesDiv = document.getElementById('dialogue-choices');

        const safeArea = hbGetSafeAreaRect();
        const dialogueBoxRect = hbGetRect(dialogueBox);
        const continueRect = hbGetRect(continueBtn);

        const choices = choicesDiv
            ? Array.from(choicesDiv.querySelectorAll('.dialogue-choice')).map(btn => {
                const rect = hbGetRect(btn);
                return { text: btn.textContent, rect, outsideSafeArea: hbRectOutsideArea(rect, safeArea) };
            })
            : [];

        const characters = Array.from(document.querySelectorAll('.character-sprite')).map(el => {
            const rect = hbGetRect(el);
            return {
                id: el.dataset.characterId || null,
                zone: el.dataset.zone || null,
                slot: el.dataset.slot || null,
                name: el.dataset.characterName || null,
                rect,
                visible: el.classList.contains('visible'),
                outsideSafeArea: hbRectOutsideArea(rect, safeArea),
                layout: {
                    scale: parseFloat(el.style.getPropertyValue('--char-scale')) || 1,
                    offsetX: parseFloat(el.dataset.offsetX) || 0,
                    offsetY: parseFloat(el.dataset.offsetY) || 0,
                    zIndex: el.style.zIndex || null,
                    headAnchorX: el.dataset.headAnchorX != null ? parseFloat(el.dataset.headAnchorX) : null,
                    headAnchorY: el.dataset.headAnchorY != null ? parseFloat(el.dataset.headAnchorY) : null,
                }
            };
        });

        return {
            timestamp: Date.now(),
            sceneId: gameState.currentSceneId,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            backgroundRect: safeArea,
            activeDialogueEntry: hbToJSONSafe(sceneRenderer._activeDialogueEntry || null),
            dialogue: {
                box: { rect: dialogueBoxRect, outsideSafeArea: hbRectOutsideArea(dialogueBoxRect, safeArea) },
                content: { rect: hbGetRect(dialogueContent), overflow: hbGetOverflow(dialogueContent) },
                text: { rect: hbGetRect(dialogueText), overflow: hbGetOverflow(dialogueText) },
                speaker: { rect: hbGetRect(dialogueSpeaker) },
                continueButton: { rect: continueRect, outsideSafeArea: hbRectOutsideArea(continueRect, safeArea) },
                choices
            },
            characters,
            characterLayoutWarnings: (sceneRenderer._lastCharacterLayoutWarnings || []).filter(w => w.sceneId === gameState.currentSceneId),
            missingAssets: hbGetMissingAssetInfo()
        };
    } catch (error) {
        errorLogger.log('debug-getLayoutSnapshot', error);
        return { error: String((error && error.message) || error) };
    }
}

function hbValidateLayout() {
    try {
        const snapshot = hbBuildLayoutSnapshot();
        if (snapshot.error) {
            return { ok: false, violations: [{ type: 'snapshot-error', severity: 'error', message: snapshot.error }], snapshot };
        }

        const violations = [];
        const entry = snapshot.activeDialogueEntry;

        // Dialogue outside the rendered game frame
        const boxRect = snapshot.dialogue.box.rect;
        if (boxRect && boxRect.width > 0 && snapshot.dialogue.box.outsideSafeArea) {
            violations.push({ type: 'dialogue-outside-frame', severity: 'error', message: 'Dialogue box renders outside the visible background frame', rect: boxRect });
        }

        // Text / content overflow
        const textOverflow = snapshot.dialogue.text.overflow;
        if (textOverflow && (textOverflow.overflowX > 1 || textOverflow.overflowY > 1)) {
            violations.push({ type: 'text-overflow', severity: 'warning', message: 'Dialogue text overflows its container', overflow: textOverflow });
        }
        const contentOverflow = snapshot.dialogue.content.overflow;
        if (contentOverflow && (contentOverflow.overflowX > 1 || contentOverflow.overflowY > 1)) {
            violations.push({ type: 'content-overflow', severity: 'warning', message: 'Dialogue content overflows its container', overflow: contentOverflow });
        }

        // Hidden or offscreen continue button (only when dialogue actually expects one)
        const expectsContinue = !!(entry && entry.next && (!entry.choices || entry.choices.length === 0));
        if (expectsContinue) {
            const rect = snapshot.dialogue.continueButton.rect;
            const isHiddenOrOffscreen = !rect || !rect.visible ||
                rect.right <= 0 || rect.bottom <= 0 ||
                rect.left >= snapshot.viewport.width || rect.top >= snapshot.viewport.height;
            if (isHiddenOrOffscreen) {
                violations.push({ type: 'continue-button-hidden-or-offscreen', severity: 'error', message: 'Continue button is hidden or offscreen while dialogue expects continuation', rect });
            }
        }

        // Choices outside the safe area
        snapshot.dialogue.choices.forEach((choice, idx) => {
            if (choice.outsideSafeArea) {
                violations.push({ type: 'choice-outside-safe-area', severity: 'error', message: `Choice button "${choice.text}" renders outside the safe area`, index: idx, rect: choice.rect });
            }
        });

        // Missing visible speaker sprite (character-speech dialogue only).
        // Resolution mirrors sceneRenderer's own priority: characterId
        // first (exact), then exact name match.
        const isNarration = !entry || !entry.speaker || entry.speaker === 'NARRATION' || entry.speaker === 'SYSTEM';
        const isChoiceEntry = entry && (entry.speaker === 'CHOICE' || entry.speaker === 'FINAL CHOICE');
        if (entry && !isNarration && !isChoiceEntry) {
            const speakerName = String(entry.speaker || '').toUpperCase();
            const characterId = entry.characterId || null;
            const match = characterId
                ? snapshot.characters.find(c => c.id === characterId)
                : snapshot.characters.find(c => (c.name || '').toUpperCase() === speakerName);
            if (!match) {
                const label = characterId ? `characterId "${characterId}"` : `speaker "${entry.speaker}"`;
                violations.push({ type: 'missing-speaker-sprite', severity: 'error', message: `No character sprite found in scene for ${label}` });
            } else if (!match.visible || !match.rect || !match.rect.visible) {
                violations.push({ type: 'missing-speaker-sprite', severity: 'error', message: `Speaker "${entry.speaker}" sprite is present but not visibly rendered`, character: match });
            }
        }

        // Duplicate character IDs
        const idCounts = new Map();
        snapshot.characters.forEach(c => {
            if (!c.id) return;
            idCounts.set(c.id, (idCounts.get(c.id) || 0) + 1);
        });
        idCounts.forEach((count, id) => {
            if (count > 1) {
                violations.push({ type: 'duplicate-character-id', severity: 'error', message: `Character id "${id}" appears ${count} times in the scene`, id, count });
            }
        });

        // Duplicate slots — recorded by normalizeCharacterZones() when two
        // scene characters claim the same slot/position instead of one
        // silently being remapped.
        (snapshot.characterLayoutWarnings || []).forEach(w => {
            if (w.type !== 'duplicate-slot') return;
            violations.push({ type: 'duplicate-slot', severity: 'error', message: `Duplicate character slot "${w.slot}" claimed by: ${w.characters.join(', ')}`, slot: w.slot, characters: w.characters });
        });

        // Missing image assets already reported by the loader
        snapshot.missingAssets.preloadErrors.forEach(src => {
            violations.push({ type: 'missing-asset', severity: 'error', message: `Asset failed to preload: ${src}`, src });
        });
        snapshot.missingAssets.placeholderImagesInDom.forEach(img => {
            violations.push({ type: 'missing-asset', severity: 'error', message: `Placeholder image currently rendered in DOM (${img.id || img.alt || 'unknown'})`, image: img });
        });

        return { ok: violations.length === 0, violations, snapshot };
    } catch (error) {
        errorLogger.log('debug-validateCurrentLayout', error);
        return { ok: false, violations: [{ type: 'internal-error', severity: 'error', message: String((error && error.message) || error) }], snapshot: null };
    }
}

const HBDebugAPI = {
    listScenes() {
        return Object.keys(SCENES).map(id => ({
            id,
            title: SCENES[id]?.title || null,
            background: SCENES[id]?.background || null
        }));
    },

    /**
     * Runs the full demo-readiness validator across every SCENES entry —
     * structure, characters, dialogue, and live asset probes — without
     * entering any scene or mutating SCENES/save data/game state. Intended
     * for automated tests: check `result.ok` (true iff zero error-severity
     * findings) and `result.totals`/`result.findings` for details.
     */
    async validateAllScenes() {
        const report = await demoValidator.validateAll();
        return hbToJSONSafe(report);
    },

    jumpToScene(sceneId) {
        if (!SCENES[sceneId]) return { ok: false, error: `Unknown scene id: ${sceneId}` };
        sceneRenderer.loadScene(sceneId);
        return { ok: true, sceneId };
    },

    getActiveDialogue() {
        return hbToJSONSafe(sceneRenderer._activeDialogueEntry || null);
    },

    async showDialogue(entry) {
        if (!entry || typeof entry !== 'object') {
            return { ok: false, error: 'showDialogue requires a dialogue entry object' };
        }
        // Debug override: clear any lock left by a prior line the test never
        // clicked through, so this call is deterministic regardless of state.
        gameState.dialogueLock = false;
        // Awaited (not fire-and-forget) so callers — e.g. Playwright driving
        // this over page.evaluate() — can rely on layout having fully settled
        // by the time this call resolves.
        await sceneRenderer.showDialogue(entry);
        return { ok: true };
    },

    finishTyping() {
        const textEl = document.getElementById('dialogue-text');
        return { ok: sceneRenderer.finishTypeText(textEl) };
    },

    advanceDialogue() {
        const textEl = document.getElementById('dialogue-text');
        const continueBtn = document.getElementById('dialogue-continue');
        if (sceneRenderer.isTyping) {
            sceneRenderer.finishTypeText(textEl);
            return { ok: true, action: 'finished-typing' };
        }
        if (continueBtn && !continueBtn.classList.contains('hidden') && typeof continueBtn.onclick === 'function') {
            continueBtn.onclick();
            return { ok: true, action: 'advanced' };
        }
        return { ok: false, action: 'no-op', reason: 'no active continue button (choices pending or dialogue idle)' };
    },

    getLayoutSnapshot() {
        return hbBuildLayoutSnapshot();
    },

    validateCurrentLayout() {
        return hbValidateLayout();
    },

    setAnimationsEnabled(enabled) {
        document.body.classList.toggle('hb-no-animations', enabled === false);
        return { ok: true, animationsEnabled: enabled !== false };
    },

    setAudioEnabled(enabled) {
        const muted = enabled === false;
        SFXGenerator.muted = muted;
        audioManager.setMuted(muted);
        return { ok: true, audioEnabled: !muted };
    }
};

if (HB_DEBUG_ENABLED) {
    window.__HB_DEBUG__ = HBDebugAPI;
    console.log('[HB_DEBUG] window.__HB_DEBUG__ enabled (?debug=true) — see DEVELOPMENT.md');
}
