/**
 * TalentEffects.js - All talent numerical modifiers
 * Covers: personality, body, fallen, route talents
 */

const TALENT_EFFECTS = {
    // ===== Personality talents (10-18, 160-179) =====
    10: { palamMods: { 4: 0.10, 17: 0.15 }, refuseMod: -0.10, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: "#98c379" },
    11: { palamMods: { 8: 0.15, 5: 0.05 }, refuseMod: 0.15, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#e5c07b" },
    12: { palamMods: { 11: 0.20, 10: 0.10 }, refuseMod: 0.25, staminaMod: 0, energyMod: 0, orgasmMod: -0.10, uiColor: "#e06c75" },
    13: { palamMods: { 8: 0.20 }, refuseMod: 0.20, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#61afef" },
    14: { palamMods: { 10: -0.10, 11: -0.10 }, refuseMod: 0.05, staminaMod: -0.05, energyMod: -0.10, orgasmMod: 0, uiColor: "#4c8ac9" },
    15: { palamMods: { 20: 0.20, 5: 0.10 }, refuseMod: 0.30, staminaMod: 0, energyMod: 0.10, orgasmMod: 0.10, uiColor: "#c678dd" },
    16: { palamMods: { 11: 0.10, 5: 0.15 }, refuseMod: 0.10, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: "#e06c75" },
    17: { palamMods: { 5: 0.20, 0: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: "#e06c75" },
    18: { palamMods: { 16: 0.15, 9: 0.10 }, refuseMod: 0.15, staminaMod: 0, energyMod: -0.05, orgasmMod: 0.05, uiColor: "#4c4c8a" },
    160: { palamMods: { 5: 0.15, 17: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: "#e5c07b" },
    161: { palamMods: { 8: 0.15, 4: 0.10 }, refuseMod: 0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: "#98c379" },
    162: { palamMods: { 0: 0.15, 5: 0.10 }, refuseMod: -0.10, staminaMod: -0.05, energyMod: 0, orgasmMod: 0.10, uiColor: "#ffb6c1" },
    163: { palamMods: { 7: 0.20, 19: 0.10 }, refuseMod: 0.10, staminaMod: 0, energyMod: -0.10, orgasmMod: 0, uiColor: "#61afef" },
    164: { palamMods: { 4: 0.15, 17: 0.10 }, refuseMod: -0.15, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#98c379" },
    165: { palamMods: { 8: 0.20, 11: 0.10 }, refuseMod: 0.20, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: "#e5c07b" },
    166: { palamMods: { 7: 0.15, 19: 0.15 }, refuseMod: 0.05, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#61afef" },
    167: { palamMods: { 5: 0.15, 0: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: "#c678dd" },
    168: { palamMods: { 4: 0.15, 16: 0.10 }, refuseMod: -0.10, staminaMod: -0.05, energyMod: 0, orgasmMod: 0, uiColor: "#4c8ac9" },
    169: { palamMods: { 10: -0.15, 11: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: -0.10, orgasmMod: 0, uiColor: "#8888a0" },
    170: { palamMods: { 5: 0.25, 0: 0.15 }, refuseMod: 0.05, staminaMod: 0.10, energyMod: -0.05, orgasmMod: 0.15, uiColor: "#e06c75" },
    171: { palamMods: { 10: 0.15, 11: 0.15 }, refuseMod: 0.20, staminaMod: 0, energyMod: 0.10, orgasmMod: -0.10, uiColor: "#4c4c8a" },
    172: { palamMods: {}, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: "#8888a0" },
    173: { palamMods: { 5: 0.10, 4: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: "#8888a0" },
    174: { palamMods: { 8: 0.10, 5: 0.10 }, refuseMod: 0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: "#e5c07b" },
    175: { palamMods: { 16: 0.10, 9: 0.10 }, refuseMod: 0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: "#c678dd" },
    176: { palamMods: { 4: 0.10, 17: 0.10 }, refuseMod: -0.05, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: "#98c379" },
    177: { palamMods: { 7: 0.10, 19: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#61afef" },
    178: { palamMods: { 0: 0.10, 1: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: "#e06c75" },
    179: { palamMods: { 10: -0.10, 11: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: -0.10, orgasmMod: 0, uiColor: "#4c8ac9" },

    // ===== Body constitution (30-37) =====
    30: { palamMods: { 1: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    31: { palamMods: { 0: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    32: { palamMods: { 3: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    33: { palamMods: { 2: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    34: { palamMods: { 15: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    35: { palamMods: { 14: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    36: { palamMods: { 0: 0.10, 1: 0.10, 2: 0.10, 3: 0.10, 14: 0.10, 15: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: null },
    37: { palamMods: { 0: -0.10, 1: -0.10, 2: -0.10, 3: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.10, uiColor: null },

    // ===== Fallen states (85, 86, 182) =====
    85: { palamMods: { 4: 0.30, 17: 0.25, 5: 0.10 }, refuseMod: -0.40, staminaMod: -0.10, energyMod: -0.05, orgasmMod: 0.15, uiColor: "#e06c75" },
    86: { palamMods: { 4: 0.40, 17: 0.35, 5: 0.20 }, refuseMod: -0.60, staminaMod: -0.15, energyMod: -0.10, orgasmMod: 0.25, uiColor: "#e06c75" },
    182: { palamMods: { 4: 0.35, 5: 0.30, 17: 0.20 }, refuseMod: -0.50, staminaMod: -0.10, energyMod: -0.05, orgasmMod: 0.20, uiColor: "#c678dd" },

    // ===== Physical traits (0-9, 40-80 range) =====
    0: { palamMods: { 1: -0.30 }, refuseMod: 0.20, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    1: { palamMods: { 15: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    2: { palamMods: { 0: 0.15 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    3: { palamMods: { 3: 0.15 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    4: { palamMods: { 2: 0.15 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    5: { palamMods: { 14: 0.15 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    6: { palamMods: { 0: -0.10, 1: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.05, uiColor: null },
    7: { palamMods: { 1: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: null },
    8: { palamMods: { 1: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.15, uiColor: null },
    9: { palamMods: { 10: 0.30, 11: 0.20 }, refuseMod: 0.30, staminaMod: 0, energyMod: 0.20, orgasmMod: -0.20, uiColor: "#8888a0" },
    40: { palamMods: { 3: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    41: { palamMods: { 3: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    42: { palamMods: { 3: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    43: { palamMods: { 1: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    44: { palamMods: { 1: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    45: { palamMods: { 1: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    46: { palamMods: { 0: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    47: { palamMods: { 0: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    48: { palamMods: { 0: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    49: { palamMods: { 2: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    50: { palamMods: { 2: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    51: { palamMods: { 2: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    52: { palamMods: { 14: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    53: { palamMods: { 14: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    54: { palamMods: { 14: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    55: { palamMods: { 15: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    56: { palamMods: { 15: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    57: { palamMods: { 15: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    58: { palamMods: { 0: 0.05, 1: 0.05, 2: 0.05, 3: 0.05, 14: 0.05, 15: 0.05 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    59: { palamMods: { 0: 0.10, 1: 0.10, 2: 0.10, 3: 0.10, 14: 0.10, 15: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: null },
    60: { palamMods: { 0: 0.15, 1: 0.15, 2: 0.15, 3: 0.15, 14: 0.15, 15: 0.15 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.15, uiColor: null },
    61: { palamMods: { 0: -0.10, 1: -0.10, 2: -0.10, 3: -0.10, 14: -0.10, 15: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.10, uiColor: null },
    62: { palamMods: { 0: -0.20, 1: -0.20, 2: -0.20, 3: -0.20, 14: -0.20, 15: -0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.20, uiColor: null },
    63: { palamMods: { 0: -0.30, 1: -0.30, 2: -0.30, 3: -0.30, 14: -0.30, 15: -0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.30, uiColor: null },
    64: { palamMods: { 5: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    65: { palamMods: { 5: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: null },
    66: { palamMods: { 5: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.15, uiColor: null },
    67: { palamMods: { 5: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.05, uiColor: null },
    68: { palamMods: { 5: -0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.10, uiColor: null },
    69: { palamMods: { 5: -0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.15, uiColor: null },
    70: { palamMods: { 4: 0.10 }, refuseMod: -0.10, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    71: { palamMods: { 4: 0.20 }, refuseMod: -0.20, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    72: { palamMods: { 4: 0.30 }, refuseMod: -0.30, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    73: { palamMods: { 4: -0.10 }, refuseMod: 0.10, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    74: { palamMods: { 4: -0.20 }, refuseMod: 0.20, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    75: { palamMods: { 4: -0.30 }, refuseMod: 0.30, staminaMod: 0, energyMod: 0, orgasmMod: 0, uiColor: null },
    76: { palamMods: { 16: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.05, uiColor: null },
    77: { palamMods: { 16: 0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.10, uiColor: null },
    78: { palamMods: { 16: 0.30 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0.15, uiColor: null },
    79: { palamMods: { 16: -0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.05, uiColor: null },
    80: { palamMods: { 16: -0.20 }, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: -0.10, uiColor: null },

    // ===== Route talents (300-345 from TalentTree) =====
    300: { palamMods: { 4: 0.10 }, refuseMod: -0.10, staminaMod: -0.05, energyMod: 0, orgasmMod: 0, uiColor: "#61afef" },
    301: { palamMods: { 4: 0.15, 17: 0.10 }, refuseMod: -0.15, staminaMod: -0.08, energyMod: 0, orgasmMod: 0, uiColor: "#61afef" },
    302: { palamMods: { 4: 0.20, 17: 0.15 }, refuseMod: -0.25, staminaMod: -0.10, energyMod: 0, orgasmMod: 0, uiColor: "#61afef" },
    303: { palamMods: { 4: 0.25, 17: 0.20 }, refuseMod: -0.35, staminaMod: -0.12, energyMod: 0, orgasmMod: 0, uiColor: "#61afef" },
    304: { palamMods: { 4: 0.30, 17: 0.25 }, refuseMod: -0.45, staminaMod: -0.15, energyMod: 0, orgasmMod: 0.10, uiColor: "#61afef" },
    305: { palamMods: { 4: 0.15, 17: 0.15 }, refuseMod: -0.20, staminaMod: -0.10, energyMod: 0.10, orgasmMod: 0, uiColor: "#61afef" },
    310: { palamMods: { 5: 0.10, 0: 0.05 }, refuseMod: 0, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#e06c75" },
    311: { palamMods: { 5: 0.20, 0: 0.10, 3: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: -0.08, orgasmMod: 0, uiColor: "#e06c75" },
    312: { palamMods: { 5: 0.25, 0: 0.15, 1: 0.15 }, refuseMod: 0, staminaMod: 0, energyMod: -0.10, orgasmMod: 0.15, uiColor: "#e06c75" },
    313: { palamMods: { 5: 0.30, 0: 0.20, 1: 0.20, 2: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: -0.12, orgasmMod: 0.20, uiColor: "#e06c75" },
    314: { palamMods: { 5: 0.35, 0: 0.25, 1: 0.25, 2: 0.15 }, refuseMod: 0, staminaMod: 0.10, energyMod: -0.15, orgasmMod: 0.25, uiColor: "#e06c75" },
    315: { palamMods: { 5: 0.15, 0: 0.10 }, refuseMod: 0, staminaMod: 0, energyMod: 0.10, orgasmMod: 0.10, uiColor: "#e06c75" },
    320: { palamMods: { 9: 0.10, 16: 0.10 }, refuseMod: 0, staminaMod: -0.05, energyMod: 0, orgasmMod: 0, uiColor: "#c678dd" },
    321: { palamMods: { 9: 0.20, 16: 0.15 }, refuseMod: -0.10, staminaMod: -0.08, energyMod: 0, orgasmMod: 0, uiColor: "#c678dd" },
    322: { palamMods: { 9: 0.25, 16: 0.20, 5: 0.10 }, refuseMod: -0.15, staminaMod: -0.10, energyMod: 0, orgasmMod: 0, uiColor: "#c678dd" },
    323: { palamMods: { 9: 0.30, 16: 0.25, 5: 0.15 }, refuseMod: -0.20, staminaMod: -0.12, energyMod: 0, orgasmMod: 0.15, uiColor: "#c678dd" },
    324: { palamMods: { 9: 0.35, 16: 0.30, 5: 0.20 }, refuseMod: -0.25, staminaMod: -0.15, energyMod: 0, orgasmMod: 0.25, uiColor: "#c678dd" },
    325: { palamMods: { 9: 0.15, 16: 0.15 }, refuseMod: -0.10, staminaMod: -0.10, energyMod: 0, orgasmMod: 0, uiColor: "#c678dd" },
    330: { palamMods: { 8: 0.15, 5: 0.05 }, refuseMod: 0, staminaMod: 0, energyMod: -0.05, orgasmMod: 0, uiColor: "#e5c07b" },
    331: { palamMods: { 8: 0.25, 5: 0.10 }, refuseMod: -0.10, staminaMod: 0, energyMod: -0.08, orgasmMod: 0, uiColor: "#e5c07b" },
    332: { palamMods: { 8: 0.30, 5: 0.15, 0: 0.10 }, refuseMod: -0.15, staminaMod: 0, energyMod: -0.10, orgasmMod: 0, uiColor: "#e5c07b" },
    333: { palamMods: { 8: 0.35, 5: 0.20, 0: 0.15 }, refuseMod: -0.20, staminaMod: 0, energyMod: -0.12, orgasmMod: 0.15, uiColor: "#e5c07b" },
    334: { palamMods: { 8: 0.40, 5: 0.25, 0: 0.20 }, refuseMod: -0.25, staminaMod: 0, energyMod: -0.15, orgasmMod: 0.25, uiColor: "#e5c07b" },
    335: { palamMods: { 8: 0.15, 5: 0.10 }, refuseMod: -0.10, staminaMod: 0, energyMod: 0.10, orgasmMod: 0, uiColor: "#e5c07b" },
    340: { palamMods: { 20: 0.10, 5: 0.05 }, refuseMod: 0, staminaMod: -0.05, energyMod: 0, orgasmMod: 0, uiColor: "#98c379" },
    341: { palamMods: { 20: 0.20, 5: 0.10 }, refuseMod: -0.10, staminaMod: -0.08, energyMod: 0, orgasmMod: 0, uiColor: "#98c379" },
    342: { palamMods: { 20: 0.25, 5: 0.15, 16: 0.10 }, refuseMod: -0.15, staminaMod: -0.10, energyMod: 0, orgasmMod: 0, uiColor: "#98c379" },
    343: { palamMods: { 20: 0.30, 5: 0.20, 16: 0.15 }, refuseMod: -0.20, staminaMod: -0.12, energyMod: 0, orgasmMod: 0.10, uiColor: "#98c379" },
    344: { palamMods: { 20: 0.35, 5: 0.25, 16: 0.20 }, refuseMod: -0.25, staminaMod: -0.15, energyMod: 0, orgasmMod: 0.20, uiColor: "#98c379" },
    345: { palamMods: { 20: 0.15, 5: 0.10 }, refuseMod: -0.10, staminaMod: -0.10, energyMod: 0.10, orgasmMod: 0, uiColor: "#98c379" }
};

function applyTalentEffects(chara, context) {
    if (!chara) return { palamMods: {}, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, activeModes: [], uiColors: [] };

    const result = {
        palamMods: {},
        refuseMod: 0,
        staminaMod: 0,
        energyMod: 0,
        orgasmMod: 0,
        activeModes: [],
        uiColors: []
    };

    function mergePalamMods(src) {
        for (const k in src) {
            const key = parseInt(k);
            result.palamMods[key] = (result.palamMods[key] || 0) + src[k];
        }
    }

    // Iterate all possible talent slots
    for (let tid = 0; tid < chara.talent.length; tid++) {
        if (chara.talent[tid] <= 0) continue;
        const eff = TALENT_EFFECTS[tid];
        if (!eff) continue;

        mergePalamMods(eff.palamMods || {});
        result.refuseMod += eff.refuseMod || 0;
        result.staminaMod += eff.staminaMod || 0;
        result.energyMod += eff.energyMod || 0;
        result.orgasmMod += eff.orgasmMod || 0;

        if (eff.uiColor) result.uiColors.push(eff.uiColor);
    }

    // De-duplicate uiColors
    result.uiColors = [...new Set(result.uiColors)];

    return result;
}

window.TALENT_EFFECTS = TALENT_EFFECTS;
window.applyTalentEffects = applyTalentEffects;
