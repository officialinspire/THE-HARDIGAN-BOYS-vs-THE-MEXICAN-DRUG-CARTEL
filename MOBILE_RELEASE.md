# Mobile release — November 15, 2026

Status: **READY for the landscape browser demo release.**

Verified game/test commit: `77129a727d9bb976b32acb678253a86b1a1f98a8`.

[GitHub Actions release gate](https://github.com/officialinspire/THE-HARDIGAN-BOYS-vs-THE-MEXICAN-DRUG-CARTEL/actions/runs/43746134101): **233 passed, 180 not-applicable cases skipped, zero failures and zero flaky retries**. This covers seven viewport sizes, plus separate focused startup/audio checks. The skips cover dialogue types absent from a scene and checks intentionally scoped to a representative viewport.

## UI quality-control pass

- The initialization screen uses an explicit kicker/title/subtitle/button/caption hierarchy with balanced wrapping, safe-area padding, and measured spacing.
- Main-menu Options and pause Settings share the same control synchronization and click sound.
- The main menu uses one centered stack of wide horizontal buttons, with compact spacing on short landscape screens. All four controls fit below the title artwork and reveal together after the final scene transition unlocks them.
- The scene status bar uses a shared top/height/inset contract for its background, title, and controls. Every control has a 44px touch target and a centered vector icon with an accessible label. The title uses separate space beside the controls, and dialogue clearance follows the measured bar height.
- Settings, inventory, and item panels have consistent viewport bounds, spacing, close controls, and action rows. Pause controls follow the source phone image's 2:3 aspect ratio and remain at least 44px tall.
- Notebook columns now share the available width without a gap pushing the right page beyond the book; narrow layouts show one page.
- The sprite matte cleanup now follows the outside transparent/pale background even on alpha-bearing art, removes exterior white fringes, and preserves whites enclosed by dark outlines. A linear typed queue and cached results bound repeated processing cost.
- Speech panels use native scalable borders whose visible bounds match the measured content, with safe insets and consistent line spacing. Character shadows are restrained; background zoom and dialogue blur effects are removed.
- Initial character images decode and position before attachment, load concurrently, and enter after the background reveal. Entrances use short eased movement and fade; scene teardown cancels pending reveals and rejects stale in-flight additions. Reduced-motion preferences shorten these transitions.
- Dedicated landscape checks verify menu stacking and title-art clearance, status-bar containment, icon centering, and every authored scene title across all seven screen sizes.
- Dedicated tests check startup overlap, every menu control, settings/inventory/notebook/item/pause bounds, phone-screen alignment, stable character placement with motion enabled, and cancellation of stale entrances. Screenshots are retained with the release artifacts.

## Cinematic startup and asset loading

- TOUCH TO START gates playback behind a player gesture. The studio credit supports Skip/Escape and ends in a black-to-menu reveal.
- Skip, natural end, media failure, and the active-time watchdog share one completion path. The video is stopped and unloaded before menu music can begin.
- Menu controls stay disabled until the scene runner releases its final fade lock, including after portrait-to-landscape rotation.
- Music fades have a single cancellable owner. Mute and backgrounding cancel fades and pause media; returning resumes only the current track. Game SFX are blocked through the credit.
- Critical graphics load behind the credit. Concurrent requests share one preload, and images decode before being marked ready. Predictive scene loading remains enabled.
- A game-scoped image cache saves successful visual requests for repeat visits, keeps at most 80 images, and falls back to the network if cache access fails. It does not cache game scripts, analytics, or video ranges, and does not provide a complete offline installation.
- First-scene coordinate labels are removed and hotspot debugging defaults off. Puzzle interactions remain active.

The layout suite now waits for boot's real menu before jumping, and verifies the requested scene ID before inspecting it. This prevents a boot-time menu transition from replacing the scene being tested. Touch tests wait through delayed speech entrances and respect the existing touch debounce.

The historical August readiness report remains an earlier audit; use this report and the linked run for current evidence.

## Player-facing fixes

- Resuming after collecting the notebook no longer makes the opening exploration puzzle impossible to complete.
- Route-dependent dialogue is restored from authored entries before every scene load, so a second run cannot inherit the previous run's dialogue or wrap its intro repeatedly.
- Storage denial and quota failures fall back to memory. Players can keep playing and receive a notice that closing/reloading the tab may lose progress. Manual Save also explains this limit.
- Invalid/corrupt save slots disable Continue; New Game remains available. Valid existing saves still load.
- Critical image preloads, scene backgrounds, and the studio intro have bounded waits, so a stalled request cannot permanently hold the loading/transition screen.
- Scene transitions keep their lock through the final fade, drain queued scene requests, and start dialogue only after the transition finishes. This prevents an older transition from clearing a newer transition's lock.
- Repeated New Game/Continue taps during transitions are ignored. A rejected dialogue request no longer erases the active pagination/Continue state; item use waits until the current dialogue finishes.

## Mobile support and validation scope

The game intentionally requests landscape orientation and displays a rotate prompt in portrait. The automated matrix covers 667×375, 740×360, 844×390, 915×412, 1024×768, 1366×768, and 1920×1080; release tests also rotate 390×844 into landscape.

The existing layout suite checks representative narration, short/long speech, choices, required assets, and accessible continue/choice controls. Additional release tests cover all-scene asset validation, save/reload/continue, blocked storage, corrupt saves, replay state, loading/intro stalls, four final ending choices, analytics attribution/SDK failure, exclusion of test traffic, and a touch-enabled phone walkthrough of the opening room and first story branch.

Ending tests explicitly seed the final-scene inventory and flags, then exercise item-use and choice handlers. They are not full route walkthroughs. Chromium viewport emulation is not physical iOS Safari or Android testing. A real-device touch/audio spot-check remains advisable before a large promotion. No offline-install/PWA support is claimed.

## INSPIRE Analytics

Project: INSPIRE Analytics (651810). Runtime tracking uses the official `posthog-js` SDK, vendored with its license and pinned through package-lock.json. Analytics loads asynchronously and never blocks gameplay.

| Event | Meaning |
|---|---|
| `game_opened` | Main menu ready, once per page load |
| `game_started` | New story run, once per accepted New Game |
| `game_resumed` | Saved run or pause menu resumed (`resume_type`) |
| `game_paused` | Pause menu opened |
| `game_progress` | Scene entered, choice selected, item acquired/used (`progress_type`) |
| `game_completed` | Any of the four endings reached, once per saved run (`ending_id`) |
| `error_encountered` | Sanitized error category, without raw message, stack, or save contents |

Events include `game=hardigan_boys`, `game_version=2026.11.14`, `brand=INSPIRE`, `mode=story`, a run ID, event sequence, and validated promotional tags. Completing an ending is completion of the story, including its sad/chaotic endings; it does not imply a happy outcome. Continuing an ending save does not count another completion.

No login/identify calls, person profiles, session replay, autocapture, or automatic exception payloads are enabled. Debug, localhost, and webdriver sessions are excluded unless `analytics_test=1` is explicitly supplied. Explicit tests have `is_test=true` and should be filtered from reports. `analytics=off`, Do Not Track, and Global Privacy Control disable tracking. Blocked scripts/requests can cause analytics undercounting while the game continues to work.

### Promotion links

Example website hero link:

https://officialinspire.github.io/THE-HARDIGAN-BOYS-vs-THE-MEXICAN-DRUG-CARTEL/?utm_source=shopify&utm_medium=website&utm_campaign=hardigan_release&utm_content=hero&placement=hero

Change source/medium/content for email or social placements. Source, campaign, content, and placement attach to starts/progress/endings from that visit. This enables campaign-level comparisons, not a claim that anonymous identities are automatically joined between Shopify and GitHub Pages.

### Configuration and SDK updates

Static GitHub Pages has no server-side environment. `analytics-config.json` is the generated **public deployment configuration**. It contains the public ingestion token and host only, never an admin/personal API key. Runtime code reads that optional file; absent configuration means no analytics and a playable game.

To regenerate configuration or refresh the vendored SDK:

```sh
cp .env.example .env
# Set POSTHOG_PROJECT_TOKEN and POSTHOG_HOST in .env.
npm ci
npm run prepare:analytics
```

The `.env` file is ignored. Commit the generated public config/vendor changes when deploying. Update the cache versions in index.html and analytics.js when changing the SDK/config. No environment changes are required on Pages for the checked-in deployment artifacts.

SDK setup reference: https://posthog.com/docs/libraries/js

## Reproducible release gate

```sh
npm ci
npx playwright install chromium
npm run test:layout -- --workers=3
```

GitHub Actions runs this gate for PRs and the release/main branches, and retains screenshots, JSON validation, and failure context for 14 days. Local syntax and whitespace checks passed; this managed workspace cannot launch Chromium because its socket access is restricted, so GitHub Actions supplies the browser evidence.
