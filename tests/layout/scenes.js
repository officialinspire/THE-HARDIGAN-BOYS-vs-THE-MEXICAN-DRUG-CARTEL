// Representative high-risk scenes for the layout smoke suite. IDs are the
// exact SCENES keys in index.js — verified against the current codebase
// (grep for `^    S1_LIVING_ROOM_INTRO: {` etc.) rather than assumed.
//
//   S1  - opening scene: baseline two-character zone-slot dialogue.
//   S2  - the ICE raid: many dynamically-added/removed characters mid-scene
//         (addCharacter()/removeCharacter() from dialogue onShow callbacks).
//   S5  - Sofia's Intel: long multi-sentence SOFIA lines that pushed the
//         dialogue pagination system hardest in prior manual verification.
//   S7B - surveillance: dynamic character spawn (cartel_surveillance) via
//         onEnter(), plus a downstream CHOICE entry.
//   S7C2 - Ortega's operation reveal: new scene, only reachable via S7C's
//          "Agree to work with Ortega" branch. Reuses bg_venez_backroom.png
//          a second time and adds two purely-optional hotspots.
//   S8B - Hank disguise briefing: authored bubbleLayout entries.
//   S9  - final showdown: three authored characters across left/right/
//         right-2 slots simultaneously — the densest composition in the game.
//   E_CHAOTIC - representative ending, two characters plus a CHOICE entry.
module.exports = [
  'S1_LIVING_ROOM_INTRO',
  'S2_ICE_RAID_WINDOW',
  'S5_SOFIA_INTEL',
  'S7B_CARTEL_TARGETING',
  'S7C2_VENEZ_OPERATION_REVEAL',
  'S8B_HANK_DISGUISE_BRIEFING',
  'S9_FINAL_WAREHOUSE_SHOWDOWN',
  'E_CHAOTIC',
];
