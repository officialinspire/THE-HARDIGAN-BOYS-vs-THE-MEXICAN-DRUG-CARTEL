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
        if (!this.audioContext) return false;
        
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
            const patches = this.loadAllPatches();
            return patches[sceneId] || { ops: [] };
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
                || (action === 'ui-layout-editor' && this.activeTool === 'layout');
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
    }
};

const spriteTransparencyProcessor = {
    whiteThreshold: 235,
    _cache: new Map(),

    makeWhitePixelsTransparent(imageEl) {
        if (!imageEl || imageEl.dataset.whiteRemoved === 'true') return;

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

            const internalVisited = new Uint8Array(width * height);
            const isTransparent = (x, y) => {
                const i = indexOf(x, y);
                return pixels[i + 3] === 0;
            };

            const minIslandSize = 26;
            for (let y = 1; y < height - 1; y += 1) {
                for (let x = 1; x < width - 1; x += 1) {
                    const idx = y * width + x;
                    if (internalVisited[idx] || !isNearWhite(x, y)) continue;

                    const component = [];
                    const stack = [[x, y]];
                    let touchesEdge = false;

                    while (stack.length > 0) {
                        const [cx, cy] = stack.pop();
                        const cIdx = cy * width + cx;
                        if (internalVisited[cIdx]) continue;
                        internalVisited[cIdx] = 1;
                        if (!isNearWhite(cx, cy)) continue;

                        component.push([cx, cy]);
                        if (cx === 0 || cy === 0 || cx === width - 1 || cy === height - 1) {
                            touchesEdge = true;
                        }

                        stack.push([cx + 1, cy]);
                        stack.push([cx - 1, cy]);
                        stack.push([cx, cy + 1]);
                        stack.push([cx, cy - 1]);
                    }

                    if (touchesEdge || component.length < minIslandSize) continue;

                    let transparentNeighbors = 0;
                    component.forEach(([cx, cy]) => {
                        if (isTransparent(cx + 1, cy) || isTransparent(cx - 1, cy) || isTransparent(cx, cy + 1) || isTransparent(cx, cy - 1)) {
                            transparentNeighbors += 1;
                        }
                    });

                    if (transparentNeighbors / component.length > 0.45) {
                        component.forEach(([cx, cy]) => {
                            const i = indexOf(cx, cy);
                            pixels[i + 3] = 0;
                            changed += 1;
                        });
                    }
                }
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
                this.errors.push(src);
                if (logErrors) {
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
        if (DEBUG) console.log('Game saved');
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
                if (DEBUG) console.log('Game loaded');
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

function showItemInfo(itemId) {
    // Clicking the conspiracy notebook in inventory opens the notebook overlay
    if (itemId === 'conspiracy_notebook') {
        document.getElementById('inventory-overlay').classList.add('hidden');
        notebook.show();
        return;
    }
    const itemName = itemId.replace(/_/g, ' ').toUpperCase();
    const infoText = getItemDescription(itemId);
    alert(`${itemName}\n\n${infoText}`);
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

    getDialogueSafeRect(padPx = 12) {
        const rect = this.getBackgroundRect();
        const container = document.getElementById('scene-container');
        if (!container) return null;

        // Fallback if background rect isn't available yet
        if (!rect) {
            return {
                left: padPx,
                top: padPx,
                right: container.clientWidth - padPx,
                bottom: container.clientHeight - padPx
            };
        }

        const hudPx = this.HUD_TOP * rect.nativeScaleY;
        const dialoguePx = this.DIALOGUE_BOTTOM * rect.nativeScaleY;

        return {
            left: rect.offsetX + padPx,
            right: rect.offsetX + rect.renderedW - padPx,
            top: rect.offsetY + hudPx + padPx,
            bottom: rect.offsetY + rect.renderedH - dialoguePx - padPx
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
    isTyping: false,

    // Bubble pagination state
    _bubblePages: null,
    _bubblePageIndex: 0,
    _bubblePagingActive: false,
    _bubbleFullText: '',
    _bubbleTypingDone: true,

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

            // If paging active, tapping should advance pages (or finish typing)
            if (this._bubblePagingActive && this._isSpeechBubble(dialogueBox)) {
                e.preventDefault();
                e.stopPropagation();

                if (!this._bubbleTypingDone || this.isTyping) {
                    this._finishTypewriterInstant();
                    return;
                }

                // Next page
                if (this._bubblePageIndex < this._bubblePages.length - 1) {
                    this._bubblePageIndex++;
                    this._updateBubblePageIndicator();
                    const activeEntry = gameState.currentDialogueEntry || null;
                    const pos = this.normalizeZoneName((activeEntry?.position) || 'left');
                    this._showBubblePage(dialogueBox, pos, activeEntry || {});
                    return;
                }

                // Last page finished: turn paging off and trigger normal continue behavior
                this._bubblePagingActive = false;
                this._setBubblePagingUI(dialogueBox, false);

                // If a continue button exists, click it. Otherwise do your fallback.
                if (continueBtn && !continueBtn.classList.contains('hidden') && typeof continueBtn.onclick === 'function') {
                    continueBtn.click();
                } else {
                    this._closeDialogueThen(() => this.nextDialogue());
                }
                return;
            }

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

    _finishTypewriterInstant() {
        const textEl = document.getElementById('dialogue-text');
        if (!textEl) return;
        this.finishTypeText(textEl);
        this._bubbleTypingDone = true;
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

        add(spriteName);

        if (spriteName.endsWith('.png')) {
            add(`${spriteName}.png`);
        }

        if (side && !hasDirectionalSuffix) {
            add(baseName.replace(/\.png$/i, `${sideSuffix}.png`));
            add(baseName.replace(/\.png$/i, `${sideUnderscore}.png`));
            add(baseName.replace(/\.png$/i, `${sideSuffix}.png.png`));
            add(baseName.replace(/\.png$/i, `${sideUnderscore}.png.png`));
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

    async addCharacter(char, slideDelay = 100) {
        const charLayer = document.getElementById('character-layer');

        const bg = document.getElementById('scene-background');
        if (bg && !bg.complete) {
            await new Promise(resolve => {
                bg.addEventListener('load', resolve, { once: true });
                bg.addEventListener('error', resolve, { once: true });
                setTimeout(resolve, 1000);
            });
        }

        const existingZones = new Set(
            Array.from(charLayer.querySelectorAll('.character-sprite')).map(el => el.dataset.zone)
        );
        let resolvedZone = char.position || 'center';
        if (resolvedZone === 'left' && existingZones.has('left')) resolvedZone = 'left-2';
        if (resolvedZone === 'right' && existingZones.has('right')) resolvedZone = 'right-2';

        const img = document.createElement('img');
        const zoneName = this.normalizeZoneName(resolvedZone);
        img.className = `character-sprite char-${zoneName}`;
        img.dataset.zone = zoneName;
        img.dataset.characterId = char.id || '';
        img.dataset.characterName = (char.name || '').toUpperCase();
        if (char.id) img.id = `char-${char.id}`;
        img.style.zIndex = charLayer.querySelectorAll('.character-sprite').length + 1;
        img.alt = char.name;

        // Position before adding to DOM
        const pos = positioningSystem.calculateCharacterPosition(zoneName);
        positioningSystem.applyPosition(img, pos);

        // Add slide direction class (starts offscreen + transparent via CSS)
        const side = this.getZoneSide(zoneName);
        if (side === 'left') img.classList.add('slide-in-left');
        else if (side === 'right') img.classList.add('slide-in-right');

        charLayer.appendChild(img);

        // Start loading sprite via fallback chain
        const spriteCandidates = this.buildSpriteCandidates(char.sprite, zoneName);

        // Wait for sprite to load + transparency to process
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

        // NOW trigger slide-in — sprite is fully loaded and processed
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
            // Call existing transition start callback
            if (this.onTransitionStart) {
                this.onTransitionStart(sceneId);
            }

            // Perform the actual transition
            await this._executeSceneLoad(sceneId);

            // Call existing transition complete callback
            if (this.onTransitionComplete) {
                this.onTransitionComplete(sceneId);
            }

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
    
    showDialogue(dialogueEntry) {
        try {
            this._bindDialogueTapHandlers();
            gameState.currentDialogueEntry = dialogueEntry;

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
            // return all-zeros, breaking _fitSpeechBubbleText and positioning logic.
            dialogueBox.classList.remove('hidden');

            // Clear previous position classes and inline overrides from bounds clamping
            dialogueBox.classList.remove('dialogue-left', 'dialogue-right', 'dialogue-center', 'dialogue-offscreen', 'dialogue-anchored');
            dialogueBox.style.left = '';
            dialogueBox.style.right = '';
            dialogueBox.style.top = '';
            dialogueBox.style.bottom = '';
            dialogueBox.style.transform = '';

            const isNarration = !dialogueEntry.speaker || dialogueEntry.speaker === 'NARRATION' || dialogueEntry.speaker === 'SYSTEM';
            const isChoice = dialogueEntry.speaker === 'CHOICE' || dialogueEntry.speaker === 'FINAL CHOICE';
            let speechPos = 'left';

            if (isNarration) {
                dialogueBox.dataset.layoutPanel = 'narrative-box';
                dialogueContainer.classList.add('narrative-mode');
                dialogueBox.classList.add('dialogue-center');
                this._positionNarrativeDialogue(dialogueBox);
                speaker.className = 'narration';
                text.className = 'narration';
                speaker.textContent = '';
            } else if (isChoice) {
                dialogueBox.dataset.layoutPanel = 'narrative-box';
                dialogueContainer.classList.add('narrative-mode');
                dialogueBox.classList.add('dialogue-center');
                this._positionNarrativeDialogue(dialogueBox);
                speaker.className = 'choice-speaker';
                text.className = 'choice-text';
                speaker.textContent = dialogueEntry.speaker;
            } else {
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

                this._positionDialogueNearCharacter(dialogueBox, pos, dialogueEntry);
                dialogueBox.dataset.tail = isLeft ? 'left' : 'right';
                dialogueBox.dataset.zone = pos;
                this._applyDialogueBubbleTail(dialogueBox, pos);
                dialogueBox.classList.add('dialogue-anchored');
            }

            const useBubbleLayout = Boolean(dialogueEntry.bubbleLayout) && (isNarration || isChoice);

            if (useBubbleLayout) {
                const bl = dialogueEntry.bubbleLayout;
                const rect = positioningSystem.getBackgroundRect();
                if (rect) {
                    // bubbleLayout values are in 1920x1080 native space — scale to current container
                    const scaled = positioningSystem.calculateHotspotPosition(
                        bl.left || 0, bl.top || 0, bl.width || 400, bl.height || 300
                    );
                    dialogueBox.style.left = scaled.left;
                    dialogueBox.style.top = scaled.top;
                    dialogueBox.style.width = scaled.width;
                    dialogueBox.style.height = scaled.height;
                } else {
                    // Fallback: apply as percentages of reference dimensions
                    if (Number.isFinite(bl.left)) dialogueBox.style.left = `${(bl.left / 1920) * 100}%`;
                    if (Number.isFinite(bl.top)) dialogueBox.style.top = `${(bl.top / 1080) * 100}%`;
                    if (Number.isFinite(bl.width)) dialogueBox.style.width = `${(bl.width / 1920) * 100}%`;
                    if (Number.isFinite(bl.height)) dialogueBox.style.height = `${(bl.height / 1080) * 100}%`;
                }
                dialogueBox.style.right = 'auto';
                dialogueBox.style.bottom = 'auto';
                dialogueBox.style.transform = 'none';
            }

            const dialogueText = dialogueEntry.text || '';

            this._activeDialogueEntry = dialogueEntry;

            this._bubblePagingActive = false;
            this._bubblePages = null;
            this._bubblePageIndex = 0;
            this._bubbleFullText = '';
            this._bubbleTypingDone = true;
            this._setBubblePagingUI?.(dialogueBox, false);

            // Fit text into stable bubble container (speech-bubble mode only, all screen sizes)
            this._fitSpeechBubbleText(dialogueBox, dialogueText);

            // Re-anchor position now that box size is final
            if (!isNarration && !isChoice) {
                const pos = this.normalizeZoneName(dialogueEntry.position || 'left');
                this._positionDialogueNearCharacter(dialogueBox, pos, dialogueEntry);

                clearTimeout(this._dialogueReanchorTimer);
                this._dialogueReanchorTimer = setTimeout(() => {
                    if (this._activeDialogueEntry !== dialogueEntry || dialogueBox.classList.contains('hidden')) return;
                    this._positionDialogueNearCharacter(dialogueBox, pos, dialogueEntry);
                    this._clampDialogueToViewport(dialogueBox);
                }, 180);
            }
            this._clampDialogueToViewport(dialogueBox, { preserveCentered: isNarration || isChoice });

            const isSpeech = dialogueBox.dataset.layoutPanel === 'speech-bubble';
            const hasChoices = dialogueEntry.choices && dialogueEntry.choices.length > 0;
            if (isSpeech && !hasChoices) {
                const pages = this._splitIntoBubblePages(dialogueBox, dialogueText, 3);
                if (pages.length > 1) {
                    this._bubblePages = pages;
                    this._bubblePageIndex = 0;
                    this._bubbleFullText = dialogueText;
                    this._bubblePagingActive = true;

                    this._setBubblePagingUI(dialogueBox, true);
                    this._updateBubblePageIndicator();
                    this._showBubblePage(dialogueBox, speechPos, dialogueEntry);
                    continueBtn.classList.add('hidden');
                    return;
                }
            }

            this.typeText(text, dialogueText, {
                onFinish: () => this._updateDialogueOverflowIndicator(text)
            });
            // Check for text overflow and add indicator
            requestAnimationFrame(() => {
                this._updateDialogueOverflowIndicator(text);
            });
            this._clampDialogueToViewport(dialogueBox, { preserveCentered: isNarration || isChoice });
            Dev.layout.applySavedLayouts();
            this._fitMobileDialogueText(dialogueBox);
            requestAnimationFrame(() => {
                this._updateDialogueOverflowIndicator(text);
            });

            // Reveal after positioning settles (double-rAF ensures layout is applied)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    dialogueBox.classList.remove('dialogue-positioning');
                    this._animateDialogueEntry();
                });
            });

            if (dialogueEntry.choices && dialogueEntry.choices.length > 0) {
                dialogueEntry.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'dialogue-choice';
                    btn.textContent = choice.text;
                    let touchStartTime = 0;
                    let touchStartPos = null;

                    const handleChoiceClick = () => {
                        if (gameState.actionLock || this.isTransitioning) return;
                        gameState.actionLock = true;
                        gameState.dialogueLock = false;
                        SFXGenerator.playButtonClick();
                        if (choice.action) {
                            choice.action();
                        }
                        gameState.actionLock = false;
                    };

                    const handleInteraction = (e) => {
                        e.preventDefault();
                        e.stopPropagation();

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
                        }

                        handleChoiceClick();
                    };

                    btn.addEventListener('touchstart', (e) => {
                        touchStartTime = Date.now();
                        const touch = e.touches[0];
                        touchStartPos = { x: touch.clientX, y: touch.clientY };
                    }, { passive: true });

                    btn.addEventListener('touchend', handleInteraction, { passive: false });
                    btn.addEventListener('click', handleInteraction);
                    choicesDiv.appendChild(btn);
                });

                // Preload assets for scenes that choices might lead to
                // (Gives the player's reading time as preload window)
                if (dialogueEntry.choices) {
                    dialogueEntry.choices.forEach(choice => {
                        // Check if the action function source mentions a scene ID
                        if (choice.action) {
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
                        }
                    });
                }
            } else if (dialogueEntry.next) {
                this._setupDialogueContinueButton(continueBtn, text, dialogueEntry);
            } else {
                setTimeout(() => {
                    gameState.dialogueLock = false;
                    this._closeDialogueThen(() => this.nextDialogue());
                }, 3000);
            }
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

    _setupDialogueContinueButton(continueBtn, textEl, dialogueEntry) {
        continueBtn.classList.remove('hidden');
        continueBtn.textContent = 'continue';
        continueBtn.setAttribute('aria-label', 'Continue dialogue');
        continueBtn.onclick = () => {
            if (this.isTyping) {
                this.finishTypeText(textEl);
                return;
            }
            if (gameState.actionLock || this.isTransitioning) return;
            gameState.actionLock = true;
            gameState.dialogueLock = false;
            SFXGenerator.playContinueButton();
            this._closeDialogueThen(() => {
                if (dialogueEntry.next === 'NEXT_DIALOGUE') {
                    this.nextDialogue();
                } else if (typeof dialogueEntry.next === 'function') {
                    dialogueEntry.next();
                } else {
                    this.loadScene(dialogueEntry.next);
                }
                gameState.actionLock = false;
            });
        };
    },

    _showBubblePage(dialogueBox, pos, dialogueEntry) {
        const textEl = document.getElementById('dialogue-text');
        const continueBtn = document.getElementById('dialogue-continue');
        if (!dialogueBox || !textEl || !continueBtn || !this._bubblePages?.length) return;

        const pageText = this._bubblePages[this._bubblePageIndex] || '';
        this._bubbleTypingDone = false;
        continueBtn.classList.add('hidden');

        this._fitSpeechBubbleText(dialogueBox, pageText);
        this._positionDialogueNearCharacter(dialogueBox, pos, dialogueEntry);
        this._applyDialogueBubbleTail(dialogueBox, pos);
        this._clampDialogueToViewport(dialogueBox);

        this.typeText(textEl, pageText, {
            onFinish: () => {
                this._bubbleTypingDone = true;
                this._updateDialogueOverflowIndicator(textEl);
                if (this._bubblePageIndex === this._bubblePages.length - 1) {
                    this._bubblePagingActive = false;
                    this._setBubblePagingUI(dialogueBox, false);
                    if (dialogueEntry?.next) {
                        this._setupDialogueContinueButton(continueBtn, textEl, dialogueEntry);
                    } else {
                        setTimeout(() => {
                            gameState.dialogueLock = false;
                            this._closeDialogueThen(() => this.nextDialogue());
                        }, 3000);
                    }
                }
            }
        });
    },

    _clampDialogueToViewport(dialogueBox, options = {}) {
        const preserveCentered = Boolean(options.preserveCentered);

        const container = document.getElementById('scene-container');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const boxRect = dialogueBox.getBoundingClientRect();
        const isMobile = window.matchMedia('(max-width: 1024px)').matches;

        const safe = positioningSystem.getDialogueSafeRect(isMobile ? 10 : 12);
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

    _resolveDialogueCharacter(zoneName, dialogueEntry) {
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

        // Safe placement area (inside rendered background & below HUD)
        const safe = positioningSystem.getDialogueSafeRect(isMobile ? 10 : 12);
        if (!safe) return;

        const isLeftZone = zoneName.startsWith('left');
        const isRightZone = zoneName.startsWith('right');
        const isSecondaryZone = zoneName.endsWith('-2');

        // Anchor point: above character head (scene-container local coords)
        // Secondary speakers get a slight inward bias so the bubble reads like the examples.
        const innerAnchorRatio = isLeftZone ? 0.58 : 0.42;
        const defaultAnchorRatio = 0.5;
        const anchorRatio = isSecondaryZone ? innerAnchorRatio : defaultAnchorRatio;
        const anchorX = charRect.left - containerRect.left + (charRect.width * anchorRatio);
        const headY = (charRect.top - containerRect.top);
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

    _updateDialogueOverflowIndicator(textEl = document.getElementById('dialogue-text')) {
        if (!textEl) return;

        if (textEl.scrollHeight > textEl.clientHeight) {
            textEl.classList.add('has-overflow');
        } else {
            textEl.classList.remove('has-overflow');
        }
    },

    _isSpeechBubble(dialogueBox) {
        return !!dialogueBox && dialogueBox.dataset?.layoutPanel === 'speech-bubble';
    },

    _setBubblePagingUI(dialogueBox, enabled) {
        const hint = document.getElementById('bubble-continue-hint');
        const ind = document.getElementById('bubble-page-indicator');
        if (!dialogueBox) return;
        if (enabled) {
            dialogueBox.classList.add('is-paginated');
            if (hint) hint.style.display = 'block';
        } else {
            dialogueBox.classList.remove('is-paginated');
            if (hint) hint.style.display = 'none';
            if (ind) ind.textContent = '';
        }
    },

    _updateBubblePageIndicator() {
        const ind = document.getElementById('bubble-page-indicator');
        if (!ind) return;
        if (!this._bubblePagingActive || !this._bubblePages?.length) {
            ind.textContent = '';
            return;
        }
        ind.textContent = `${this._bubblePageIndex + 1}/${this._bubblePages.length}`;
    },

    _fitMobileDialogueText(dialogueBox) {
        // Run on any screen under 1024px, not just 768px
        if (!window.matchMedia('(max-width: 1024px)').matches || !dialogueBox) return;
        // Speech-bubble mode is handled by _fitSpeechBubbleText
        if (dialogueBox.dataset.layoutPanel === 'speech-bubble') return;

        const textEl = document.getElementById('dialogue-text');
        const speakerEl = document.getElementById('dialogue-speaker');
        const contentEl = document.getElementById('dialogue-content');
        if (!textEl || !contentEl) return;

        const isSmallPhone = window.matchMedia('(max-width: 640px)').matches;
        const isVerySmall = window.matchMedia('(max-width: 480px)').matches;
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;

        let defaultTextSize, defaultSpeakerSize;

        if (isVerySmall) {
            defaultTextSize = textEl.classList.contains('choice-text') ? 8 : 7;
            defaultSpeakerSize = speakerEl?.classList.contains('choice-speaker') ? 9 : 8;
        } else if (isSmallPhone) {
            defaultTextSize = textEl.classList.contains('choice-text') ? 9 : 8;
            defaultSpeakerSize = speakerEl?.classList.contains('choice-speaker') ? 10 : 9;
        } else if (isLandscape) {
            defaultTextSize = textEl.classList.contains('choice-text') ? 9 : 8;
            defaultSpeakerSize = speakerEl?.classList.contains('choice-speaker') ? 10 : 9;
        } else {
            defaultTextSize = textEl.classList.contains('choice-text') ? 10 : 9;
            defaultSpeakerSize = speakerEl?.classList.contains('choice-speaker') ? 12 : 10;
        }

        const minTextSize = isVerySmall ? 6 : 7;
        const minSpeakerSize = isVerySmall ? 7 : 8;

        textEl.style.fontSize = `${defaultTextSize}px`;
        textEl.style.lineHeight = isSmallPhone ? '1.15' : '1.2';
        if (speakerEl) {
            speakerEl.style.fontSize = `${defaultSpeakerSize}px`;
            speakerEl.style.lineHeight = '1.1';
        }

        let textSize = defaultTextSize;
        let speakerSize = defaultSpeakerSize;
        let guard = 0;

        while (guard < 12 && (contentEl.scrollHeight > contentEl.clientHeight || textEl.scrollHeight > textEl.clientHeight)) {
            guard += 1;

            if (textSize > minTextSize) {
                textSize -= 0.5;
                textEl.style.fontSize = `${textSize}px`;
            }

            if (speakerEl && speakerSize > minSpeakerSize && contentEl.scrollHeight > contentEl.clientHeight) {
                speakerSize -= 0.5;
                speakerEl.style.fontSize = `${speakerSize}px`;
            }

            if (textSize <= minTextSize && (!speakerEl || speakerSize <= minSpeakerSize)) {
                break;
            }
        }
    },

    _fitSpeechBubbleText(dialogueBox, fullText) {
        if (!dialogueBox) return;
        if (dialogueBox.dataset.layoutPanel !== 'speech-bubble') return;

        const textEl = document.getElementById('dialogue-text');
        const speakerEl = document.getElementById('dialogue-speaker');
        const contentEl = document.getElementById('dialogue-content');
        if (!textEl || !contentEl) return;

        // Set full text temporarily for measurement (typewriter will reuse computed sizes)
        const prev = textEl.textContent;
        textEl.textContent = fullText || '';

        // Reset to CSS defaults so repeated calls don't keep shrinking
        textEl.style.fontSize = '';
        if (speakerEl) speakerEl.style.fontSize = '';

        const minText = 10;     // floor: readable on desktop + Android
        const minSpeaker = 11;

        let guard = 0;
        while (guard < 18 && (textEl.scrollHeight > textEl.clientHeight || contentEl.scrollHeight > contentEl.clientHeight)) {
            guard++;
            const csT = parseFloat(getComputedStyle(textEl).fontSize) || 16;
            const csS = speakerEl ? (parseFloat(getComputedStyle(speakerEl).fontSize) || 16) : 0;

            if (csT > minText) textEl.style.fontSize = (csT - 0.5) + 'px';
            if (speakerEl && csS > minSpeaker && contentEl.scrollHeight > contentEl.clientHeight) {
                speakerEl.style.fontSize = (csS - 0.5) + 'px';
            }

            if ((parseFloat(getComputedStyle(textEl).fontSize) <= minText) &&
                (!speakerEl || parseFloat(getComputedStyle(speakerEl).fontSize) <= minSpeaker)) {
                break;
            }
        }

        // Restore for typewriter (computed sizes stay in place via inline style)
        textEl.textContent = prev;
    },

    _measureSpeechBubbleFit(dialogueBox, candidateText) {
        const textEl = document.getElementById('dialogue-text');
        const contentEl = document.getElementById('dialogue-content');
        if (!textEl || !contentEl) return { fits: true };

        const prev = textEl.textContent;
        textEl.textContent = candidateText || '';

        const fitsNow = !(textEl.scrollHeight > textEl.clientHeight || contentEl.scrollHeight > contentEl.clientHeight);

        textEl.textContent = prev;
        return { fits: fitsNow };
    },

    _splitIntoBubblePages(dialogueBox, fullText, maxPages = 3) {
        const txt = String(fullText || '').replace(/\s+/g, ' ').trim();
        if (!txt) return [''];

        // Prefer sentence-ish splits
        let chunks = txt.split(/(?<=[.!?])\s+/);

        // fallback: word chunking
        if (chunks.length === 1) {
            const words = txt.split(' ');
            chunks = [];
            for (let i = 0; i < words.length; i += 12) {
                chunks.push(words.slice(i, i + 12).join(' '));
            }
        }

        const pages = [];
        let cur = '';

        const ok = (s) => this._measureSpeechBubbleFit(dialogueBox, s).fits;

        for (let i = 0; i < chunks.length; i++) {
            const next = cur ? (cur + ' ' + chunks[i]) : chunks[i];

            if (ok(next)) {
                cur = next;
                continue;
            }

            if (cur) pages.push(cur);
            cur = chunks[i];

            if (pages.length >= maxPages - 1) {
                const rest = [cur].concat(chunks.slice(i + 1)).join(' ').trim();
                pages.push(rest);
                return pages.filter(Boolean);
            }
        }

        if (cur) pages.push(cur);
        return pages.filter(Boolean);
    },

    repositionActiveDialogue() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (!dialogueBox || dialogueBox.classList.contains('hidden')) return;

        const scene = this.currentScene;
        const dialogueEntry = scene?.dialogue?.[gameState.currentDialogueIndex];
        if (!dialogueEntry) return;

        const isNarration = !dialogueEntry.speaker || dialogueEntry.speaker === 'NARRATION' || dialogueEntry.speaker === 'SYSTEM';
        const isChoice = dialogueEntry.speaker === 'CHOICE' || dialogueEntry.speaker === 'FINAL CHOICE';

        if (isNarration || isChoice) {
            dialogueBox.classList.remove('dialogue-anchored');
            this._positionNarrativeDialogue(dialogueBox);
            this._clampDialogueToViewport(dialogueBox, { preserveCentered: true });
            return;
        }

        const useBubbleLayout = Boolean(dialogueEntry.bubbleLayout) && (isNarration || isChoice);

        if (useBubbleLayout) {
            const bl = dialogueEntry.bubbleLayout;
            const rect = positioningSystem.getBackgroundRect();
            if (rect) {
                const scaled = positioningSystem.calculateHotspotPosition(
                    bl.left || 0, bl.top || 0, bl.width || 400, bl.height || 300
                );
                dialogueBox.style.left = scaled.left;
                dialogueBox.style.top = scaled.top;
                dialogueBox.style.width = scaled.width;
                dialogueBox.style.height = scaled.height;
                dialogueBox.style.right = 'auto';
                dialogueBox.style.bottom = 'auto';
                dialogueBox.style.transform = 'none';
            }
            this._clampDialogueToViewport(dialogueBox);
            return;
        }

        const zoneName = this.normalizeZoneName(dialogueEntry.position || 'left');
        // Re-fit text first so box height is stable before positioning
        this._fitSpeechBubbleText(dialogueBox, dialogueEntry.text || '');
        this._positionDialogueNearCharacter(dialogueBox, zoneName, dialogueEntry);
        this._applyDialogueBubbleTail(dialogueBox, zoneName);
        dialogueBox.classList.add('dialogue-anchored');
        this._clampDialogueToViewport(dialogueBox);
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
            const attemptTransition = () => {
                if (gameState.objectsClicked.has('window') && gameState.objectsClicked.size >= 3) {
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
                        bubbleLayout: gameState.lighting.tvOn
                            ? { left: 1085, top: 380, width: 704, height: 438 }
                            : undefined,
                        next: 'NEXT_DIALOGUE'
                    });

                    SCENES.S1_LIVING_ROOM_INTRO.checkProgression(2000);
                }
            },
            {
                id: 'television',
                label: 'Television',
                coordSystem: 'native',
                x: 24, y: 376, width: 272, height: 216,
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

                    SCENES.S1_LIVING_ROOM_INTRO.checkProgression();
                    if (gameState.objectsClicked.has('window') && gameState.objectsClicked.size >= 3) {
                        return;
                    }

                    if (!gameState.objectsClicked.has('window_dialogue_shown')) {
                        gameState.objectsClicked.add('window_dialogue_shown');
                        sceneRenderer.showDialogue({
                            speaker: 'JONAH',
                            text: "Uh. Hank? There's like... a lot of lights outside.",
                            position: 'right',
                            bubbleLayout: { left: 1016, top: 348, width: 836, height: 429 },
                            next: () => {
                                sceneRenderer.showDialogue({
                                    speaker: 'HANK',
                                    text: "Relax, it's probably just your DoorDash finally escaping ICE detention.",
                                    position: 'left',
                                    bubbleLayout: { left: 820, top: 412, width: 704, height: 438 },
                                    next: () => {
                                        if (gameState.objectsClicked.has('window') && gameState.objectsClicked.size >= 3) {
                                            SCENES.S1_LIVING_ROOM_INTRO.checkProgression();
                                        } else {
                                            sceneRenderer._cleanupTypewriter(document.getElementById('dialogue-text'));
                                            document.getElementById('dialogue-box').classList.add('hidden');
                                            gameState.dialogueLock = false;
                                        }
                                    }
                                });
                            }
                        });
                    }
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
                        bubbleLayout: gameState.lighting.lampOn
                            ? { left: 806, top: 378, width: 704, height: 438 }
                            : undefined,
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
                bubbleLayout: { left: 857, top: 329, width: 704, height: 438 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "You say this every time we run out of chips, dude.",
                position: 'right',
                bubbleLayout: { left: 1099, top: 311, width: 704, height: 438 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'MOM',
                text: "If either of you used this much energy on school, we'd be rich by now!",
                position: 'right',
                bubbleLayout: { left: 700, top: 286, width: 704, height: 438 },
                next: () => {
                    // Slide out Mom after her dialogue for a smoother handoff back to scene interactions
                    sceneRenderer.removeCharacter('mom', true);
                },
                onShow: () => {
                    // Add Mom immediately so the speech bubble anchors to her on the first frame.
                    sceneRenderer.addCharacter({
                        id: 'mom',
                        name: 'MOM',
                        sprite: 'char_mom_worried-right.png',
                        position: 'right-2'
                    }, 0);
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
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused-left.png', position: 'left-2' }
        ],

        hotspots: [],

        dialogue: [
            {
                speaker: 'JONAH',
                text: "Okay. That's… definitely ICE.",
                position: 'left-2',
                bubbleLayout: { left: 1050, top: 394, width: 836, height: 429 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "No way. They'd never raid a quiet cul-de-sac with a Whole Foods loyalty card.",
                position: 'left',
                bubbleLayout: { left: 692, top: 301, width: 836, height: 429 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "Bro, that's the Riveras' house.",
                position: 'left-2',
                bubbleLayout: { left: 1129, top: 402, width: 836, height: 429 },
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Mom, they're taking Carlos. He literally coached the neighborhood soccer team.",
                position: 'left',
                bubbleLayout: { left: 654, top: 282, width: 836, height: 429 },
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
                speaker: 'MOM',
                text: "Away from the window. Now. Both of you.",
                position: 'left',
                bubbleLayout: { left: 821, top: 221, width: 898, height: 518 },
                next: 'NEXT_DIALOGUE',
                onShow: () => {
                    sceneRenderer.removeCharacter('hank', false);
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'mom',
                            name: 'MOM',
                            sprite: 'char_mom_worried-left.png',
                            position: 'left'
                        }, 60);
                    }, 180);
                }
            },
            {
                speaker: 'MOM',
                text: "We are not getting involved. Do you hear me?",
                position: 'left',
                bubbleLayout: { left: 821, top: 221, width: 898, height: 518 },
                next: () => {
                    sceneRenderer.removeCharacter('mom', false);
                    setTimeout(() => {
                        sceneRenderer.addCharacter({
                            id: 'hank',
                            name: 'HANK',
                            sprite: 'char_hank_thinking.png',
                            position: 'left'
                        }, 60);
                    }, 180);

                    setTimeout(() => {
                        sceneRenderer.showDialogue({
                        speaker: 'CHOICE',
                        text: 'What do you do?',
                        bubbleLayout: { left: 821, top: 221, width: 898, height: 518 },
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
                    }, 720);
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
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_excited.png', position: 'left-2' },
            { id: 'mom', name: 'MOM', sprite: 'char_mom_worried.png', position: 'right' }
        ],
        
        hotspots: [],
        
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'agent_smith', name: 'AGENT SMITH', sprite: 'char_ice_smith_smirk-right.png', position: 'right' }
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
        
        characters: [
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'right' }
        ],
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'sofia', name: 'SOFIA', sprite: 'char_sofia_neutral.png', position: 'right' }
        ],

        hotspots: [],

        dialogue: [
            {
                speaker: 'SOFIA',
                text: "I didn't come to you just because of the drive. I came because I know who put the Riveras on the radar.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "Who?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "Someone inside. A tip that went up the chain fast — too fast to be coincidence.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "So somebody set them up? Like, on purpose?",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "I've been sitting on this for weeks. Didn't know who to trust.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "And now you trust us? Two guys who found a USB in a trash can?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "You're still here, aren't you? Most people ran.",
                position: 'right',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'JONAH',
                text: "For the record, I did try to run. Hank wouldn't let me.",
                position: 'left-2',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'HANK',
                text: "What do you need from us, Sofia?",
                position: 'left',
                next: 'NEXT_DIALOGUE'
            },
            {
                speaker: 'SOFIA',
                text: "There's someone who can verify everything on that drive. Someone with clearance. I know where she works.",
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_neutral.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_confused.png', position: 'left-2' },
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_amused-right.png', position: 'right' }
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
            { id: 'hank', name: 'HANK', sprite: 'char_hank_panicked.png', position: 'left' },
            { id: 'jonah', name: 'JONAH', sprite: 'char_jonah_scared.png', position: 'left-2' },
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_calm.png', position: 'right-2' },
            { id: 'cartel_boss', name: 'EL LICENCIADO', sprite: 'char_cartel_boss_menacing-right.png', position: 'right' }
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
                position: 'left-2',
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
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk-left.png', position: 'center' }
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
            { id: 'msgray', name: 'MS. GRAY', sprite: 'char_msgray_threatening-right.png', position: 'right' }
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
            { id: 'lupita', name: 'LUPITA', sprite: 'char_lupita_smirk-left.png', position: 'right' }
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

    // Initialize audio
    audioManager.init();
    mobileOptimizer.init();

    // Normalize scene data before the first scene loads.
    sceneIntegrity.validateAndNormalize();

    Dev.kernel.initOnce();

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

    // Load main menu
    sceneRenderer.loadScene('S0_MAIN_MENU');
    setTimeout(() => assetLoader.hideLoadingScreen(), 250);

    console.log('✅ Game initialized successfully!');
}, 'bootstrap'));
