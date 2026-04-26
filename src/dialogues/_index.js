/**
 * Dialogue Index — registers all extracted personality & exclusive dialogue modules.
 * Each module sets window.DIALOGUE_K{id} after loading.
 */

const DIALOGUE_REGISTRY = {
    personalities: {},
    exclusives: {},
    mods: {}
};

function _scanWindowModules() {
    for (const key in window) {
        if (key.startsWith('DIALOGUE_K')) {
            const id = parseInt(key.replace('DIALOGUE_K', ''));
            const data = window[key];
            if (!data || !data.id) continue;
            if (data.type === 'exclusive' || id >= 900) {
                DIALOGUE_REGISTRY.exclusives[id] = data;
            } else {
                DIALOGUE_REGISTRY.personalities[id] = data;
            }
        }
    }
}

// Scan immediately (modules loaded via <script> before this file)
_scanWindowModules();

// Also scan after a short delay to catch any late-loaded scripts
setTimeout(_scanWindowModules, 0);

window.DIALOGUE_REGISTRY = DIALOGUE_REGISTRY;
