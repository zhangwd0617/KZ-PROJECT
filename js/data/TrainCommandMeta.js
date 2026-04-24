/**
 * TrainCommandMeta.js - Extended metadata for training commands
 * Maps command IDs to stimulated parts, costs, route tags, etc.
 */

const TRAIN_COMMAND_META = {
    // === Caress (0-9, 122, 135) ===
    0:  { stimulatedParts: ["C","B"],        staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    1:  { stimulatedParts: ["C"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    2:  { stimulatedParts: ["A"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    3:  { stimulatedParts: ["C"],             staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 2, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    4:  { stimulatedParts: ["O"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    5:  { stimulatedParts: ["B","N"],         staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    6:  { stimulatedParts: ["O"],             staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 2, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    7:  { stimulatedParts: ["C","V"],         staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 0, shame: 3, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    8:  { stimulatedParts: ["V","W"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    9:  { stimulatedParts: ["A"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    122:{ stimulatedParts: ["C","V"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V"], affectsBystander: false },
    135:{ stimulatedParts: ["C","O"],         staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 3, dominance: 0 }, ejaculationParts: [], affectsBystander: false },

    // === Tools (10-19) ===
    10: { stimulatedParts: ["C"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    11: { stimulatedParts: ["V","W"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    12: { stimulatedParts: ["A"],             staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    13: { stimulatedParts: ["C"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    14: { stimulatedParts: ["N"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    15: { stimulatedParts: ["B","N"],         staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    16: { stimulatedParts: ["P"],             staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["P"], affectsBystander: false },
    17: { stimulatedParts: ["C","B","V"],     staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    18: { stimulatedParts: ["A"],             staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    19: { stimulatedParts: ["A"],             staminaCost: { target: 25, bystander: 0 }, energyCost: { target: 5, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 3, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },

    // === Vaginal (20-24, 120-134) ===
    20: { stimulatedParts: ["V","W","C"],     staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 3, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    21: { stimulatedParts: ["V","W"],         staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 1, shame: 0, dominance: 1 }, ejaculationParts: ["V","W"], affectsBystander: false },
    22: { stimulatedParts: ["V","W","C","B"], staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 2, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    23: { stimulatedParts: ["V","W"],         staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    24: { stimulatedParts: ["V","W","C"],     staminaCost: { target: 25, bystander: 0 }, energyCost: { target: 5, bystander: 0 }, routeTags: { obedience: 2, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    120:{ stimulatedParts: ["V","W","C"],     staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    121:{ stimulatedParts: ["V","W"],         staminaCost: { target: 35, bystander: 0 }, energyCost: { target: 7, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    128:{ stimulatedParts: ["V","W","O"],     staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 3, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    129:{ stimulatedParts: ["V","W","B","N"], staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    130:{ stimulatedParts: ["V","W","C"],     staminaCost: { target: 35, bystander: 0 }, energyCost: { target: 7, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    131:{ stimulatedParts: ["V","W","B","N"], staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 1, shame: 0, dominance: 1 }, ejaculationParts: ["V","W"], affectsBystander: false },
    132:{ stimulatedParts: ["V","W","C"],     staminaCost: { target: 35, bystander: 0 }, energyCost: { target: 7, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 2, shame: 0, dominance: 1 }, ejaculationParts: ["V","W"], affectsBystander: false },
    133:{ stimulatedParts: ["V","W"],         staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 2, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    134:{ stimulatedParts: ["V","W","A"],     staminaCost: { target: 40, bystander: 0 }, energyCost: { target: 8, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },

    // === Anal (25-29) ===
    25: { stimulatedParts: ["A","P"],         staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: ["A"], affectsBystander: false },
    26: { stimulatedParts: ["A"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: ["A"], affectsBystander: false },
    27: { stimulatedParts: ["A"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 2, shame: 0, dominance: 1 }, ejaculationParts: ["A"], affectsBystander: false },
    28: { stimulatedParts: ["A","C"],         staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: ["A"], affectsBystander: false },
    29: { stimulatedParts: ["A"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: ["A"], affectsBystander: false },

    // === Service (30-38, 123-126) ===
    30: { stimulatedParts: ["P"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["P"], affectsBystander: false },
    31: { stimulatedParts: ["O"],             staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["O"], affectsBystander: false },
    32: { stimulatedParts: ["B","N"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["B","N"], affectsBystander: false },
    33: { stimulatedParts: ["C","V"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["C","V"], affectsBystander: false },
    34: { stimulatedParts: ["V","W","C"],     staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 2, desire: 3, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    35: { stimulatedParts: ["C","B","V"],     staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 2, desire: 2, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    36: { stimulatedParts: ["A","P"],         staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 2, shame: 0, dominance: 0 }, ejaculationParts: ["A"], affectsBystander: false },
    37: { stimulatedParts: ["A","O"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    38: { stimulatedParts: ["P"],             staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 1, desire: 1, pain: 1, shame: 0, dominance: 1 }, ejaculationParts: ["P"], affectsBystander: false },
    123:{ stimulatedParts: ["B","N","O"],     staminaCost: { target: 25, bystander: 0 }, energyCost: { target: 5, bystander: 0 }, routeTags: { obedience: 2, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["B","N","O"], affectsBystander: false },
    125:{ stimulatedParts: ["O","C"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 1, desire: 3, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: ["O","C"], affectsBystander: false },
    126:{ stimulatedParts: ["O","P"],         staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 2, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["O","P"], affectsBystander: false },

    // === SM (40-49) ===
    40: { stimulatedParts: ["C","A"],         staminaCost: { target: 25, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 1, desire: 0, pain: 3, shame: 1, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    41: { stimulatedParts: ["C","B","A"],     staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 3, shame: 1, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    42: { stimulatedParts: ["B","N"],         staminaCost: { target: 35, bystander: 0 }, energyCost: { target: 5, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 3, shame: 0, dominance: 3 }, ejaculationParts: [], affectsBystander: false },
    43: { stimulatedParts: [],               staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 1, desire: 0, pain: 1, shame: 2, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    44: { stimulatedParts: ["B","C","A"],     staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 1, desire: 0, pain: 2, shame: 2, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    45: { stimulatedParts: ["O"],             staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 1, desire: 0, pain: 1, shame: 2, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    46: { stimulatedParts: ["A"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 2, shame: 3, dominance: 1 }, ejaculationParts: [], affectsBystander: false },
    47: { stimulatedParts: ["C","B","A","O"], staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 1, desire: 0, pain: 2, shame: 2, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    48: { stimulatedParts: ["C","B"],         staminaCost: { target: 25, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 2, shame: 1, dominance: 3 }, ejaculationParts: [], affectsBystander: false },
    49: { stimulatedParts: ["A"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 3, shame: 0, dominance: 2 }, ejaculationParts: [], affectsBystander: false },

    // === Items/Special (50-59) ===
    50: { stimulatedParts: ["C","V","A"],     staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    51: { stimulatedParts: ["C","V","B"],     staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    52: { stimulatedParts: [],               staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 2, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    53: { stimulatedParts: [],               staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 2, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    54: { stimulatedParts: ["C","V","B"],     staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 0, shame: 3, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    55: { stimulatedParts: [],               staminaCost: { target: 0, bystander: 0 }, energyCost: { target: 0, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 1, dominance: 1 }, ejaculationParts: [], affectsBystander: false },
    56: { stimulatedParts: [],               staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 2, desire: 0, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    57: { stimulatedParts: ["C","V","B","A"], staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 0, shame: 3, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    58: { stimulatedParts: ["C","B"],         staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 1, desire: 1, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    59: { stimulatedParts: ["C","V","O"],     staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 3, desire: 2, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },

    // === Assistant (60-71) ===
    60: { stimulatedParts: ["O"],             staminaCost: { target: 15, bystander: 10 }, energyCost: { target: 3, bystander: 2 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true },
    61: { stimulatedParts: ["O","C"],         staminaCost: { target: 20, bystander: 10 }, energyCost: { target: 4, bystander: 2 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 1, dominance: 1 }, ejaculationParts: [], affectsBystander: true },
    62: { stimulatedParts: ["V","W"],         staminaCost: { target: 30, bystander: 15 }, energyCost: { target: 6, bystander: 3 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: true },
    63: { stimulatedParts: ["C","V"],         staminaCost: { target: 25, bystander: 15 }, energyCost: { target: 5, bystander: 3 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true },
    64: { stimulatedParts: ["V","W","A","C"], staminaCost: { target: 40, bystander: 20 }, energyCost: { target: 8, bystander: 4 }, routeTags: { obedience: 1, desire: 3, pain: 0, shame: 0, dominance: 1 }, ejaculationParts: ["V","W"], affectsBystander: true },
    65: { stimulatedParts: ["V","W","A"],     staminaCost: { target: 35, bystander: 20 }, energyCost: { target: 7, bystander: 4 }, routeTags: { obedience: 1, desire: 2, pain: 1, shame: 0, dominance: 1 }, ejaculationParts: ["V","W"], affectsBystander: true },
    66: { stimulatedParts: ["O","P"],         staminaCost: { target: 25, bystander: 15 }, energyCost: { target: 5, bystander: 3 }, routeTags: { obedience: 2, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["O","P"], affectsBystander: true },
    67: { stimulatedParts: ["P"],             staminaCost: { target: 15, bystander: 10 }, energyCost: { target: 3, bystander: 2 }, routeTags: { obedience: 1, desire: 1, pain: 0, shame: 0, dominance: 1 }, ejaculationParts: ["P"], affectsBystander: true },
    68: { stimulatedParts: ["O"],             staminaCost: { target: 20, bystander: 15 }, energyCost: { target: 4, bystander: 3 }, routeTags: { obedience: 2, desire: 1, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: ["O"], affectsBystander: true },
    69: { stimulatedParts: ["C","O"],         staminaCost: { target: 25, bystander: 15 }, energyCost: { target: 5, bystander: 3 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true },
    70: { stimulatedParts: ["C","V"],         staminaCost: { target: 25, bystander: 15 }, energyCost: { target: 5, bystander: 3 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true },
    71: { stimulatedParts: ["B","N"],         staminaCost: { target: 25, bystander: 15 }, energyCost: { target: 5, bystander: 3 }, routeTags: { obedience: 1, desire: 2, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true },

    // === Special / Others ===
    72: { stimulatedParts: ["C"],             staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 2, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    73: { stimulatedParts: [],               staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    80: { stimulatedParts: ["O"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 5, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 2, shame: 0, dominance: 2 }, ejaculationParts: ["O"], affectsBystander: false },
    81: { stimulatedParts: ["V","W"],         staminaCost: { target: 50, bystander: 0 }, energyCost: { target: 10, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 3, shame: 0, dominance: 2 }, ejaculationParts: ["V","W"], affectsBystander: false },
    82: { stimulatedParts: ["A"],             staminaCost: { target: 50, bystander: 0 }, energyCost: { target: 10, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 3, shame: 0, dominance: 2 }, ejaculationParts: ["A"], affectsBystander: false },
    83: { stimulatedParts: ["V","A"],         staminaCost: { target: 60, bystander: 0 }, energyCost: { target: 12, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 3, shame: 0, dominance: 3 }, ejaculationParts: ["V","A"], affectsBystander: false },
    84: { stimulatedParts: ["V","W","C"],     staminaCost: { target: 35, bystander: 0 }, energyCost: { target: 7, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 1, shame: 0, dominance: 0 }, ejaculationParts: ["V","W"], affectsBystander: false },
    85: { stimulatedParts: [],               staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 2, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 3, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    87: { stimulatedParts: ["N"],             staminaCost: { target: 20, bystander: 0 }, energyCost: { target: 4, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 2, shame: 1, dominance: 1 }, ejaculationParts: [], affectsBystander: false },
    90: { stimulatedParts: ["B","N"],         staminaCost: { target: 40, bystander: 0 }, energyCost: { target: 8, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 2, shame: 0, dominance: 2 }, ejaculationParts: ["B","N"], affectsBystander: false },
    100:{ stimulatedParts: ["C","V","A","B","N","O"], staminaCost: { target: 40, bystander: 0 }, energyCost: { target: 8, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 2, shame: 2, dominance: 2 }, ejaculationParts: [], affectsBystander: false },
    110:{ stimulatedParts: [],               staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 1, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 1, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    111:{ stimulatedParts: ["C","B"],         staminaCost: { target: 15, bystander: 0 }, energyCost: { target: 3, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 1, shame: 2, dominance: 1 }, ejaculationParts: [], affectsBystander: false },
    124:{ stimulatedParts: ["O"],             staminaCost: { target: 35, bystander: 0 }, energyCost: { target: 7, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 2, shame: 0, dominance: 2 }, ejaculationParts: ["O"], affectsBystander: false },
    127:{ stimulatedParts: ["O"],             staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 0, desire: 1, pain: 2, shame: 0, dominance: 2 }, ejaculationParts: ["O"], affectsBystander: false },
    150:{ stimulatedParts: ["C","V","A","B","N","O"], staminaCost: { target: 30, bystander: 0 }, energyCost: { target: 6, bystander: 0 }, routeTags: { obedience: 1, desire: 2, pain: 1, shame: 1, dominance: 1 }, ejaculationParts: [], affectsBystander: false },
    200:{ stimulatedParts: ["C","V","A","B","N","O"], staminaCost: { target: 50, bystander: 0 }, energyCost: { target: 10, bystander: 0 }, routeTags: { obedience: 0, desire: 2, pain: 3, shame: 2, dominance: 3 }, ejaculationParts: [], affectsBystander: false },
    208:{ stimulatedParts: ["C","V","A","B","N","O"], staminaCost: { target: 40, bystander: 0 }, energyCost: { target: 8, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 2, shame: 2, dominance: 2 }, ejaculationParts: [], affectsBystander: false },

    // === NEW: Master Skills (989-992) ===
    989:{ stimulatedParts: ["C","V","A","B","N","O","W","P"], staminaCost: { target: 10, bystander: 0 }, energyCost: { target: 20, bystander: 0 }, routeTags: { obedience: 0, desire: 5, pain: 0, shame: 0, dominance: 5 }, ejaculationParts: [], affectsBystander: false, isMasterSkill: true },
    990:{ stimulatedParts: [],               staminaCost: { target: 0, bystander: 0 }, energyCost: { target: 5, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false, isMasterSkill: true },
    991:{ stimulatedParts: ["C"],             staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 10, bystander: 0 }, routeTags: { obedience: 0, desire: 3, pain: 0, shame: 0, dominance: 3 }, ejaculationParts: [], affectsBystander: false, isMasterSkill: true },
    992:{ stimulatedParts: ["C"],             staminaCost: { target: 5, bystander: 0 }, energyCost: { target: 15, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 0, dominance: 5 }, ejaculationParts: [], affectsBystander: false, isMasterSkill: true },

    // === NEW: Insight Eye (996) ===
    996:{ stimulatedParts: [],               staminaCost: { target: 0, bystander: 0 }, energyCost: { target: 10, bystander: 0 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false, isMasterSkill: true, desc: "洞察之眼：消耗1回合，主奴气力-10，揭示隐藏特质" },

    // === NEW: Recovery (998-999) ===
    998:{ stimulatedParts: [],               staminaCost: { target: -20, bystander: 0 }, energyCost: { target: -10, bystander: 0 }, routeTags: { obedience: 2, desire: 0, pain: -2, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },
    999:{ stimulatedParts: [],               staminaCost: { target: -30, bystander: 0 }, energyCost: { target: -15, bystander: 0 }, routeTags: { obedience: 1, desire: 0, pain: -1, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: false },

    // === NEW: Assistant commands (900-901) ===
    900:{ stimulatedParts: [],               staminaCost: { target: 0, bystander: 20 }, energyCost: { target: 0, bystander: 5 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true, isAssistantCmd: true },
    901:{ stimulatedParts: [],               staminaCost: { target: 10, bystander: 10 }, energyCost: { target: 2, bystander: 2 }, routeTags: { obedience: 0, desire: 0, pain: 0, shame: 0, dominance: 0 }, ejaculationParts: [], affectsBystander: true, isAssistantCmd: true }
};

// Default meta for unknown commands
function getTrainMeta(comId) {
    return TRAIN_COMMAND_META[comId] || {
        stimulatedParts: ["C"],
        staminaCost: { target: 15, bystander: 0 },
        energyCost: { target: 3, bystander: 0 },
        routeTags: { obedience: 0, desire: 1, pain: 0, shame: 0, dominance: 0 },
        ejaculationParts: [],
        affectsBystander: false
    };
}

window.TRAIN_COMMAND_META = TRAIN_COMMAND_META;
window.getTrainMeta = getTrainMeta;
