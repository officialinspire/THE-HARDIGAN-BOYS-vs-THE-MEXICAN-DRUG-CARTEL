# THE HARDIGAN BOYS vs THE MEXICAN DRUG CARTEL
## Complete Codebase Walkthrough & Developer Notes

**Engine:** Vanilla HTML5 / CSS / JavaScript (zero frameworks, zero build tools)  
**Architecture:** Single-page app, all game logic in one JS file, all styles in one CSS file  
**Hosting:** GitHub Pages at `officialinspire.github.io`

---

## FILE STRUCTURE OVERVIEW

```
THE-HARDIGAN-BOYS-vs-THE-MEXICAN-DRUG-CARTEL/
├── index.html              ← Page shell: DOM structure, layers, overlays, dev hub
├── index.js                ← ENTIRE game engine + scene data (5,447 lines)
├── styles.css              ← ALL styling + responsive breakpoints (2,806 lines)
├── assets/
│   ├── backgrounds/        ← Scene background PNGs (17 files, ~41MB total)
│   ├── characters/         ← Character sprite PNGs (68 files, ~143MB total)
│   ├── items/              ← Collectible item images
│   ├── menu_dialogue/      ← Speech bubble images (left/right variants + spritesheet)
│   └── ui/                 ← Main menu bg, notebook images, phone menu image
├── audio/                  ← MP3 music tracks (14 tracks, ~32MB total)
├── scripts/
│   ├── transparent_bg_audit.py   ← Python: audit/fix sprite transparency (stdlib only)
│   └── remove_white_backgrounds.py ← Python: batch white-bg removal from sprites
├── developer.txt           ← Original game design doc / lore / scene map
├── developer_v2.txt        ← Updated design doc synced with current assets
├── gamescript.txt           ← Full dialogue script (v1)
├── gamescript_v2.txt        ← Updated dialogue script
├── promo/                  ← Title card / promo images
├── logo.png                ← Game logo
└── inspiresoftwareintro.mp4 ← Studio intro video
```

---

## index.html — THE PAGE SHELL

**Purpose:** Defines the DOM skeleton. The game is a stack of absolutely-positioned layers inside a single `#game-root` container. JavaScript populates everything dynamically.

### Layer Architecture (bottom to top by z-index)

```
#game-root
└── #scene-container          ← The main viewport, holds everything
    ├── #scene-background     ← <img> tag, the background art (z-index: 0)
    ├── #character-layer      ← Empty div, JS injects <img> sprites here (z-index: 1)
    ├── #item-layer           ← Empty div, JS injects collectible items here (z-index: 2)
    ├── #hotspot-layer        ← Empty div, JS injects invisible clickable regions here (z-index: 3)
    └── #hud                  ← Heads-up display overlay (z-index: 4)
        ├── #hud-buttons      ← Inventory 📦, Notebook 📓, Menu 📱 buttons (top-right)
        ├── #scene-title      ← Gold text showing current scene name (top-center)
        └── #dialogue-box     ← Speech bubble + text + choices + continue button
            └── #dialogue-container
                ├── #dialogue-bubble   ← <img> of the speech bubble PNG
                └── #dialogue-content  ← Text overlay positioned on top of bubble image
                    ├── #dialogue-speaker   ← Character name (e.g., "HANK")
                    ├── #dialogue-text      ← Dialogue content
                    └── #action-container
                        ├── #dialogue-choices   ← Choice buttons when branching
                        └── #dialogue-continue  ← "▶ Continue" button
```

### Overlay Stack (siblings of #scene-container, shown/hidden via .hidden class)

```
├── #inventory-overlay      ← Grid of collected items
├── #notebook-overlay       ← Notebook UI with custom background image
├── #pause-menu             ← Phone-shaped pause menu (Resume/Save/Settings/Main Menu)
├── #settings-overlay       ← Volume sliders + debug hotspot toggle
├── #fade-overlay           ← Black overlay used for scene transitions (opacity animated)
└── #devHubModal            ← Developer tools modal (hotspot editor, layout editor, etc.)
```

### Key HTML Attributes
- `data-layout-panel="..."` — Marks elements the Dev Layout Editor can drag/resize
- `data-dev-action="..."` — Wires Dev Hub buttons to their actions
- `data-dev-close="true"` — Backdrop click handler for closing dev hub

### Audio Elements
Two `<audio>` tags at the bottom of `<body>`:
- `#music-player` (loop) — Background music, one track at a time
- `#sfx-player` — Sound effects, reused for each SFX call

---

## index.js — THE GAME ENGINE

All game logic lives in one file. Here's every system, in the order it appears:

### 1. SFXGenerator (Lines 7–210)
**Purpose:** Synthesized 8-bit sound effects using the Web Audio API. No audio files needed — it generates tones programmatically.

**What it does:**
- Creates oscillator + gain nodes on the fly
- Each method produces a distinct retro sound (button clicks, dialogue pops, lamp clicks, TV static, etc.)
- Handles AudioContext suspension (browsers block audio until user interacts)
- Auto-resumes on first touch/click/keydown

**Key methods:**
- `playButtonClick()` — 800Hz→400Hz descending chirp (0.1s)
- `playDialogueAdvance()` — Higher pitched chirp for dialogue progression
- `playContinueButton()` — Two-tone ascending beep
- `playDialoguePop()` — Quick pop for bubble appearance
- `playDialogueWhooshClose()` — Noise burst for bubble dismissal
- `playMenuOpen()` — Ascending arpeggio
- `playLampClick()` / `playTVClick()` — Environmental interaction sounds

### 2. gameState (Lines 212–249)
**Purpose:** The single source of truth for the entire game. Everything reads from and writes to this object.

**Structure:**
```
gameState = {
    currentSceneId      ← Which scene is active (e.g., 'S1_LIVING_ROOM_INTRO')
    inventory[]         ← Array of item IDs the player has collected
    notebook[]          ← Array of {title, content, timestamp} entries
    flags: {            ← Boolean branching flags that determine story path
        HELPED_ICE, HELPED_NEIGHBORS, TOOK_CARTEL_DEAL, WORKING_WITH_CIA,
        INDEPENDENT_OPERATORS, CARTEL_TARGET, SECRETLY_AGAINST_CARTEL,
        ALLIED_WITH_ORTEGA, ALLIED_WITH_LUPITA, DOUBLE_CROSSED_SOMEONE,
        SAVED_NEIGHBORS, CARTEL_DEFEATED, DISILLUSIONED, LOYAL_TO_RIVERAS,
        OPPORTUNIST, SUSPICIOUS_TO_FEDS
    }
    settings: {         ← Player preferences
        musicVolume, sfxVolume, showHotspots
    }
    currentDialogueIndex ← Which line of dialogue we're on within current scene
    objectsClicked       ← Set() tracking which hotspots clicked this scene (for gating)
    dialogueLock         ← Prevents double-clicking through dialogue
    actionLock           ← Prevents double-triggering hotspot actions
    sceneTransitioning   ← True during fade-to-black transitions
    lighting: {          ← S1-specific: lamp and TV on/off state
        lampOn, tvOn
    }
}
```

**How flags drive the story:** When the player makes a choice (e.g., "Sneak out to help the Riveras"), the choice handler sets `gameState.flags.HELPED_NEIGHBORS = true` and loads the corresponding scene. Later scenes check these flags to determine which dialogue/options to show and which endings are reachable.

### 3. errorLogger (Lines 253–257)
**Purpose:** Minimal error logging wrapper. Just calls `console.error` with context and metadata. Keeps error handling consistent across the codebase without adding dependencies.

### 4. Dev — Developer Tools System (Lines 260–1782)
**Purpose:** A complete in-game development toolkit for calibrating hotspots, dialogue positioning, and UI layout WITHOUT editing code. Stores overrides in localStorage.

**Sub-systems:**

#### Dev.storageKeys
localStorage key constants: `DEV_MODE_ENABLED`, `DEV_TOOLS_ENABLED`, `DEV_ACTIVE_TOOL`, `DEV_PATCHES`, `DEV_LAYOUTS`

#### Dev.ui
`updateFloatingButton()` — Shows/hides the floating "DEV" button based on dev mode state.

#### Dev.kernel
`initOnce()` — One-time initialization of the dev system. Restores previous dev mode state from localStorage.

#### Dev.tools
The tool lifecycle manager. Handles attaching/detaching the active tool's event listeners to the scene container.
- `applyForCurrentScene()` — Called after every scene load. Detaches old tool, attaches current tool, re-renders overlays.
- `attachTrace()` — Hooks click/mousemove/touchmove listeners for the click trace tool.

#### Dev.trace (Lines 363–530)
**Click Trace tool.** When active:
- Every click on the scene is logged with its native image coordinates (1920×1080 space)
- A yellow highlight rectangle follows the cursor showing which hotspot you're hovering over
- Last 10 clicks shown in a scrollable list in the Dev Hub panel
- Clicking on hotspot labels in the trace list highlights them in the scene

**Key methods:**
- `recordClick(event)` — Converts client coords → native image coords → logs
- `updatePointer(clientX, clientY)` — Updates hover highlight position
- `mapClientToScene(clientX, clientY)` — Uses positioningSystem to convert coordinates

#### Dev.hotspots (Lines 530–1103)
**Hotspot Editor.** The big one. When active:
- All hotspots get dashed yellow borders with drag handles
- You can drag hotspots to reposition them
- You can drag corner handles to resize them
- You can Shift+drag on empty space to create new hotspots
- All changes saved to localStorage as "patches" keyed by scene ID
- Changes are applied at runtime on top of the hardcoded scene data

**Key methods:**
- `getRuntimeHotspots(sceneId, baseHotspots)` — Merges hardcoded hotspots with localStorage patches
- `shouldBlockGameplay()` — Returns true when editor is active (prevents accidental gameplay while editing)
- `render()` — Creates the visual editor overlay with drag handles
- `exportPatchJSON()` — Copies the current scene's hotspot overrides to clipboard as JSON
- `generateFixReport()` — Produces a text report of changes, validation warnings, and actionable next steps
- `validateScene()` — Checks for invalid targets, overlaps, out-of-bounds, zero-size hotspots

#### Dev.layout (Lines 1105–1460)
**UI Layout Editor.** Lets you drag and resize the dialogue/speech bubble panels.
- Works with 4 configurable panels: speech-bubble, narrative-box, action-prompts, menu-prompts
- Saves per-breakpoint (desktop vs mobile at 768px)
- `applySavedLayouts()` — Called after every dialogue show to apply any saved overrides
- Currently lacks export-to-JSON (this is Bug #6 from our analysis)

#### Dev.init() / openHub() / closeHub() (Lines 1501–1782)
Initialization, modal open/close, and the hub UI that contains:
- Enable/disable toggle
- Tool buttons (Hotspot Editor, UI Layout Editor, Click Trace, Validate, Export)
- Scene Jump input (type a scene ID to teleport)
- Validation output panel
- Clear Dev Storage button

### 5. spriteTransparencyProcessor (Lines 1783–1970)
**Purpose:** Runtime hack to remove white/cream backgrounds from character sprites that ship without alpha channels. Processes each sprite image on load using canvas pixel manipulation.

**How it works:**
1. Draws the sprite onto an offscreen `<canvas>`
2. Samples edge pixels to detect the dominant background color
3. Flood-fills from edges: any pixel within color distance ≤40 of background → alpha = 0
4. Then sweeps ALL remaining pixels: anything near-white (R,G,B all ≥238) → alpha = 0
5. Anti-aliases fringe pixels at semi-transparency
6. Converts canvas back to data URL and replaces the `<img>` src

**Performance concern:** This runs for every character sprite on every scene load. Each sprite is 1024×1536 pixels = 1.57M pixels × 4 channels = 6.3MB of pixel data to iterate. On mobile, this adds noticeable lag to scene transitions.

### 6. Utility Functions (Lines 1971–2110)
- `getMissingAssetPlaceholder(src, w, h)` — Returns an SVG data URL placeholder when an asset fails to load
- `safeAsync(handler, context)` — Wraps async functions with try/catch error logging
- **mobileOptimizer** — Mobile-specific setup:
  - `setupTouchGuards()` — Prevents double-tap zoom and long-press context menu
  - `setupIOSBouncePrevention()` — Prevents rubber-band scrolling on iOS
  - `syncViewportHeight()` — Sets CSS `--vh` variable for iOS viewport height bugs
  - `setupImmersiveMode()` — Hides browser chrome on mobile
  - `setupOrientationLock()` — Attempts to lock to landscape

### 7. assetLoader (Lines 2110–2217)
**Purpose:** Preloads critical assets during the loading screen before the game starts.

**Flow:**
1. `getCriticalAssets()` — Returns list of essential images: main menu bg, S1 bg, S2 bg, both speech bubble PNGs, phone menu image
2. `preloadAssets()` — Fetches each asset as an Image, updates the loading progress bar
3. `hideLoadingScreen()` — Fades out the loading screen overlay
4. `lazyLoadSceneAssets(scene)` — After a scene loads, pre-fetches that scene's character sprites in the background so they're cached for instant display
5. `registerImageFallback(img, src)` — Attaches onerror handler that shows placeholder SVG

### 8. audioManager (Lines 2219–2325)
**Purpose:** Manages background music and sound effects via the two `<audio>` HTML elements.

**Key behaviors:**
- Music crossfades between scenes (fade out old track → fade in new track)
- Won't restart a track that's already playing (checks `currentTrack`)
- SFX has a concurrency limiter (`maxConcurrentSfx: 2`) to prevent audio pile-ups
- Volume controlled by `gameState.settings.musicVolume` / `sfxVolume` (0–100)

### 9. saveSystem (Lines 2328–2370)
**Purpose:** Serializes/deserializes game state to/from localStorage.

**What's saved:** `currentSceneId`, `inventory`, `notebook`, `flags`, `timestamp`  
**What's NOT saved:** `objectsClicked`, `lighting`, `dialogueLock`, `settings`, `currentDialogueIndex`  
**Key:** `'hardigan_brothers_save'`

This means when you load a save, you restart at the beginning of whichever scene you were on (dialogue resets to index 0). In-scene progress like which hotspots you've clicked is lost — this is by design since scenes are meant to be short.

### 10. lightingEffects (Lines 2372–2459)
**Purpose:** S1-specific dynamic lighting system. Creates/removes a CSS gradient overlay based on lamp and TV toggle state.

**4 states:**
- Both off → dark overlay (rgba 0,0,0,0.5)
- Lamp only → warm radial gradient from upper-right
- TV only → cool blue radial gradient from center-left
- Both on → combined warm + cool gradients

The overlays are `pointer-events: none` div layers at z-index 2, sitting between the background and characters.

### 11. inventory (Lines 2462–2568)
**Purpose:** Item collection and display system.

**Methods:** `add(itemId)`, `remove(itemId)`, `has(itemId)`, `show()`  
**Item images:** `./assets/items/item_{itemId}.png`  
**Item descriptions:** Hardcoded lookup table in `getItemDescription()` — maps IDs like `house_key`, `conspiracy_notebook`, `burner_phone` to flavor text.

The inventory grid is rendered dynamically. Each item has touch-aware click handling (touchstart timestamp to prevent ghost clicks). Clicking an item shows an `alert()` with its description (yes, a browser alert — that's a polish opportunity).

### 12. notebook (Lines 2570–2600)
**Purpose:** In-game journal that tracks clues and story developments.

Entries are `{title, content, timestamp}` objects pushed to `gameState.notebook[]`. The UI renders them into the notebook overlay which has a custom background image (`notebook-menu-open.png`) styled to look like a physical notebook.

### 13. positioningSystem (Lines 2604–2912)
**Purpose:** THE critical system for making the game responsive. Translates between three coordinate spaces:

```
NATIVE IMAGE SPACE (1920×1080)     ← How hotspots are defined in scene data
     ↕ scaled by background render size
CONTAINER SPACE (viewport pixels)  ← Where elements actually appear on screen
     ↕ offset by object-fit letterboxing
CLIENT SPACE (browser page coords) ← Where click events report
```

**Reference dimensions:** 1920×1080 (the native resolution of background art)

**Character zone system:**
Characters are placed in named zones rather than pixel coordinates:
```
left    → 5% from left edge
left-2  → 22% from left edge (for 2nd character on same side)
center  → 50% centered
right   → 5% from right edge
right-2 → 22% from right edge
```

**Key methods:**
- `getBackgroundRect()` — Calculates how the bg image actually renders within the container, accounting for `object-fit: contain` (desktop) vs `object-fit: cover` (mobile portrait). Returns rendered width/height, offset, and scale factors.
- `calculateCharacterPosition(zoneName)` — Returns CSS properties (left/right/bottom/maxWidth/maxHeight) for a character in a zone
- `calculateHotspotPosition(imgX, imgY, imgW, imgH)` — Converts native 1920×1080 coordinates to container pixel positions
- `clientToNative(clientX, clientY)` — Reverse: converts a click position back to native image coordinates (used by dev tools)
- `recalculateAll()` — On window resize, repositions every character, item, and hotspot currently in the scene

### 14. sceneRenderer (Lines 2916–4048)
**Purpose:** The core rendering engine. Loads scenes, manages characters, runs dialogue, handles transitions.

#### Scene Transition Flow (`_executeSceneLoad`)
```
1. Toggle 'main-menu' body class
2. Show transition loader (loading spinner on black overlay)
3. Fade to black (animate #fade-overlay opacity to 0.95)
4. Clear previous scene (slide-out characters, remove all DOM children)
5. Set new background image, wait for it to load
6. Set scene title text
7. Load characters (slide-in with staggered delays)
8. Load items (if any)
9. Load hotspots (merge with dev patches)
10. Lazy-preload the scene's other assets
11. Start music (with crossfade)
12. Fade from black (animate overlay opacity to 0)
13. After 500ms delay, show first dialogue line
14. Run scene's onEnter() callback (for custom setup like lighting)
15. Auto-save
```

#### Character Rendering (`addCharacter`)
1. Wait for background image to fully load (prevents positioning before dimensions are known)
2. Check if target zone is occupied → auto-bump to zone-2
3. Create `<img>` element with zone CSS class
4. Build sprite candidate list via `buildSpriteCandidates()` (fallback chain)
5. Attach load/error handlers — on load, run transparency processor; on error, try next candidate
6. Calculate pixel position via `positioningSystem.calculateCharacterPosition()`
7. Apply slide-in animation class (slide-in-left or slide-in-right)
8. After delay, add `.visible` class to trigger CSS transition

#### Sprite Fallback Chain (`buildSpriteCandidates`)
Given a sprite name like `char_hank_thinking.png` for zone `left`, generates:
```
1. char_hank_thinking.png           ← exact match
2. char_hank_thinking.png.png       ← double-extension workaround
3. char_hank_thinking-left.png      ← directional with hyphen
4. char_hank_thinking_left.png      ← directional with underscore
5. char_hank_thinking-left.png.png  ← double-extension + directional
6. char_hank_thinking_left.png.png
7. (base without direction suffix)
8. char_hank_thinking-right.png     ← opposite side as last resort
```

This chain exists because the asset naming is inconsistent across sprites. The correct long-term fix is standardizing all filenames.

#### Dialogue System (`showDialogue`)
The most complex method in the engine. Handles 3 types of dialogue:
- **Character speech** — Bubble image + speaker name + text, positioned near the speaking character
- **Narration** — Gold text in a dark box, centered on screen
- **Choices** — Prompt text with clickable option buttons

**Flow:**
1. Check locks (transition, dialogue)
2. Fire `onShow` callback (used for character slide-ins mid-dialogue)
3. Clear previous positions/classes
4. Determine type → set CSS classes + mode attributes
5. If character speech: load appropriate bubble PNG (left or right facing), position near character
6. If narration/choice: use narrative-mode styling (dark box, no bubble image)
7. Show the box, set text, clamp to viewport
8. Animate entry
9. If choices → render choice buttons with touch-safe event handlers
10. If continue → show continue button with next-dialogue logic
11. If auto-advance → 3-second timeout then next

**The `next` property on dialogue entries can be:**
- `'NEXT_DIALOGUE'` → advance `currentDialogueIndex` by 1
- A function `() => { ... }` → execute arbitrary code (scene loads, character changes, etc.)
- A string scene ID → load that scene directly

### 15. SCENES — Scene Definitions (Lines 4050–5137)
**Purpose:** The entire game content. Each scene is a data object with:

```javascript
{
    id: 'S1_LIVING_ROOM_INTRO',     // Unique identifier
    title: 'Another Normal Night',    // Shown in HUD bar
    background: './assets/backgrounds/bg_hardigan_livingroom_night_02.png',
    music: 'Hardigan Noir Tension.mp3',
    
    characters: [                     // Sprites shown when scene loads
        { id: 'hank', name: 'HANK', sprite: 'char_hank_thinking.png', position: 'left' }
    ],
    
    items: [],                        // Collectible items with pixel positions
    
    hotspots: [                       // Clickable regions
        {
            id: 'television',
            label: 'Television',
            coordSystem: 'native',    // Coordinates in 1920×1080 space
            x: 388, y: 478, width: 467, height: 365,
            onClick() { ... }         // What happens when clicked
        }
    ],
    
    dialogue: [                       // Sequential dialogue lines
        {
            speaker: 'HANK',
            text: "The dialogue text...",
            position: 'left',         // Which side the bubble appears
            next: 'NEXT_DIALOGUE',    // What happens after continue
            onShow: () => { ... }     // Optional: runs when this line appears
        }
    ],
    
    onEnter() { ... }                 // Optional: runs after scene fully loads
}
```

#### Scene Map (Story Flow)
```
S0_MAIN_MENU
    └→ S1_LIVING_ROOM_INTRO ("Another Normal Night")
        └→ S2_ICE_RAID_WINDOW ("The Raid")
            ├→ S3A_FRONT_YARD_FROM_DISTANCE (watched from distance — HELPED_ICE)
            │   └→ S4A1_ICE_FOLLOWUP or S4A2_GUILT_AND_GOSSIP
            └→ S3B_RIVERA_BACKYARD (helped neighbors — HELPED_NEIGHBORS)
                └→ S4B_SCHOOL_AFTERSHOCK
                    └→ S5A_SOFIA_INTEL
                        └→ S6_INTEL_ENTANGLEMENT
                            └→ S7A_CARTEL_CONTACT or S7B_CARTEL_TARGETING
                                └→ S8_PRE_FINAL
                                    └→ S9_FINAL_WAREHOUSE_SHOWDOWN
                                        └→ ENDINGS:
                                            E_HAPPY — "We Saved Who We Could"
                                            E_SAD — "People Become Statistics"
                                            E_CHAOTIC — "Multilateral Dumbassery"
                                            E_IRONIC_MEDIA — "Everyone Has a Narrative"
```

### 16. sceneIntegrity (Lines 5139–5200)
**Purpose:** Validation pass that runs once at boot. Normalizes scene data:
- Ensures all character positions are valid zone names
- Warns about dialogue entries that reference non-existent scenes
- Validates hotspot targets point to real scene IDs

### 17. setupUIHandlers (Lines 5204–5313)
**Purpose:** Wires up all the persistent UI buttons:
- Inventory/Notebook/Pause HUD buttons
- Pause menu buttons (Resume, Save, Settings, Main Menu)
- Overlay close buttons (generic `.overlay-close` class)
- Volume sliders (input event → update gameState + audioManager)
- Hotspot debug toggle checkbox

### 18. Viewport & Transition Helpers (Lines 5315–5370)
- `showTransitionLoader()` / `hideTransitionLoader()` — Show/hide a loading spinner during scene transitions
- `setAppHeight()` — iOS viewport height fix: sets `--vh` and `--app-height` CSS custom properties and forces `#game-root` height to `window.innerHeight`
- `setupViewportHeightHandlers()` — Attaches resize/orientationchange/scroll listeners that call `setAppHeight()`

### 19. Initialization (Lines 5372–5447)
**Boot sequence on DOMContentLoaded:**
1. Set up viewport height handlers
2. Initialize audio manager + SFX generator
3. Initialize mobile optimizer (touch guards, orientation lock, etc.)
4. Run scene integrity validation
5. Initialize dev tools
6. Set up UI event handlers
7. Apply hotspot debug setting to body class
8. Preload critical assets (with progress bar)
9. Attach click debug logger to scene container
10. Attach resize/orientation handlers for responsive repositioning
11. Load `S0_MAIN_MENU`
12. Hide loading screen

---

## styles.css — THE STYLING ENGINE

### Section Map

| Lines | Section | What it controls |
|-------|---------|-----------------|
| 1–38 | Reset & Base | Box-sizing, body fill, font smoothing, hide scrollbars |
| 39–174 | Touch Targets | WCAG-compliant 44px minimum touch sizes for all interactive elements |
| 175–242 | Game Root & Scene Container | Fullscreen layout, object-fit rules, aspect ratio |
| 244–353 | Character & Item Layers | Sprite sizing, slide-in/out animations, hover effects |
| 354–407 | Hotspot Layer | Invisible by default, debug outlines when `.show-hotspots` active |
| 408–509 | HUD | Gold-bordered top bar, scene title, HUD button styling |
| 510–943 | Dialogue System | Speech bubble positioning (left/right/center), narration mode, choice buttons, continue button, all animations |
| 945–1199 | Overlays | Inventory grid, notebook UI, generic overlay backdrop |
| 1200–1337 | Pause Menu & Settings | Phone-shaped menu, volume sliders |
| 1338–1376 | Fade Overlay | Black transition screen, loading spinner |
| 1377–1744 | Dev Hub | Developer modal, hotspot editor styles, trace panel |
| 1745–1828 | Transition Blocking | Disables pointer-events during scene transitions |
| 1829–2065 | Responsive Breakpoints | Media queries at 1200px, 768px, 480px, landscape, 4K |
| 2066–2109 | Animations | Loading bar, orientation overlay |
| 2110–2335 | UX Tuning | Dialogue fine-tuning, narrative box spacing |
| 2336–2521 | Phone Precision Hotfix | Small screen overrides for speech bubbles and menus |
| 2523–2806 | Mobile Comic Layout & Dialogue Viewport Fix | Feb 2026 tuning pass for mobile parity |

### Key CSS Patterns

**The `body.main-menu` class:** Added when on S0_MAIN_MENU, used to hide the HUD bar and scene title.

**The `body.show-hotspots` class:** When the debug checkbox is on, makes hotspot regions visible with yellow outlines.

**The `.hidden` class:** `display: none` toggle used throughout for showing/hiding overlays, buttons, etc.

**Character slide animations:** Characters start offscreen (translateX ±120%) with opacity 0, then animate to position when `.visible` is added.

**The dialogue positioning dance:** CSS sets default positions via `.dialogue-left` / `.dialogue-right` classes, then JS overrides with inline styles calculated from character positions. Media queries then override those overrides at different breakpoints. This layered approach is the source of many positioning bugs.

---

## scripts/ — PYTHON UTILITIES

### transparent_bg_audit.py (274 lines)
**Purpose:** Stdlib-only Python script that audits and optionally fixes sprite PNG transparency. Uses zero external libraries — implements its own PNG reader/writer with raw zlib decompression.

**Modes:**
- **Audit (default):** Lists all PNGs that have no transparent pixels
- **Fix (`--fix`):** Flood-fills from edges to make background pixels transparent

**Why stdlib-only:** Designed to run in environments without Pillow installed (like Codex sandbox). Implements PNG chunk parsing, IDAT decompression, filter reconstruction, and re-encoding from scratch.

### remove_white_backgrounds.py (similar)
**Purpose:** Batch removal of white backgrounds from character sprites. Simpler approach than the audit script — just targets near-white pixels.

---

## assets/ — GAME CONTENT

### backgrounds/ (17 PNGs, ~41MB)
Scene backgrounds at roughly 1920×1080–1920×1200 resolution. Named with `bg_` prefix and descriptive location:
- `bg_hardigan_livingroom_night_02.png` — S1 scene
- `bg_street_suburb_raid_night.png` — S2 ICE raid scene
- `bg_rivera_backyard_night.png` — S3B scene
- `bg_warehouse_night.png` — Final showdown
- `bg_cia_office.png`, `bg_ice_processing_room.png` — Government locations

### characters/ (68 PNGs, ~143MB)
Character sprites at 1024×1536 resolution. Naming convention:
```
char_{character}_{expression}-{direction}.png
```
Examples:
- `char_hank_thinking-left.png` — Hank facing left, thinking expression
- `char_mom_angry-right.png` — Mom facing right, angry
- `char_sofia_hacker_hoodie-right.png` — Sofia in hacker outfit

**Known issues:**
- 13 files are RGB (no alpha) with cream backgrounds
- 2 files have double `.png.png` extension
- Some exist without directional suffix (base versions) — these are the problematic RGB ones

### items/ 
Collectible item images: `item_house_key.png`, `item_conspiracy_notebook.png`, etc.

### menu_dialogue/
- `dialogue-bubble-large-left.png` — Speech bubble pointing left (for left-side speakers)
- `dialogue-bubble-large-right.png` — Speech bubble pointing right (for right-side speakers)
- `speech-bubbles-sprite-sheet.png` — Unused spritesheet of multiple bubble styles

### ui/
- `ui_main_menu_bg.png` — Main menu background art
- `smart-phone-game-main-menu.png` — Phone graphic for pause menu
- `notebook-menu.png` / `notebook-menu-open.png` / `notebook-menu-pageflip.png` — Notebook UI states

---

## audio/ (14 MP3s, ~32MB)
Each scene has a dedicated music track. Named descriptively:
- `main-menu-theme.mp3` — Title screen
- `game-menu-theme.mp3` — Pause menu
- `Hardigan Noir Tension.mp3` — S1 (living room)
- `Dark Police Intensity.mp3` — S2 (raid), S9 (final)
- `The Raid Escape.mp3` — Action scenes
- `Safehouse Ambience.mp3` — Quieter investigative scenes
- `Warehouse Night Suspense.mp3` — Late-game tension
- `Empty Hallways (Ambient Mix).mp3` — Happy ending
- `Muted Aftermath.mp3` — Sad ending

---

## DATA FLOW CHEAT SHEET

### How a scene loads:
```
Player clicks hotspot with target → hotspot.onClick() calls sceneRenderer.loadScene('S2_...')
→ loadScene() queues the transition → _executeSceneLoad() runs
→ fade to black → clear DOM → set background → load characters → load hotspots
→ fade from black → show first dialogue line → run onEnter()
```

### How dialogue advances:
```
Player clicks Continue → showDialogue.onclick fires
→ checks locks → fires _closeDialogueThen() → hides current bubble
→ if next === 'NEXT_DIALOGUE': increment index, show next line
→ if next === function: execute it (might load scene, add character, etc.)
→ if next === string: load that scene
```

### How choices branch the story:
```
showDialogue renders choice buttons → player taps one
→ choice.action() fires → sets gameState.flags → calls sceneRenderer.loadScene()
```

### How save/load works:
```
Save: gameState → JSON → localStorage['hardigan_brothers_save']
Load: localStorage → JSON → merge into gameState → loadScene(savedSceneId)
```

### How dev tools override hotspots:
```
getRuntimeHotspots(sceneId, baseHotspots) →
  read localStorage patches for this sceneId →
  merge: patched coords replace base coords, new hotspots added, deleted ones removed →
  return merged array → used by loadHotspots()
```
