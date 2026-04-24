/**
 * Dialogue Loader — resolves which dialogue set applies to a character.
 * Priority: Exclusive (mod/character-specific) > Personality (talent-based) > null
 */

const DialogueLoader = {
    /**
     * Get dialogue data for a target character.
     * @param {Character} target
     * @returns {object|null}
     */
    getForTarget(target) {
        if (!target) return null;

        // 1. Exclusive character dialogue (original EX_KOJO_NUM system)
        // Stored in cflag[900 + chara.no] or derived from template
        const exclusiveId = target.cflag[900 + target.no];
        if (exclusiveId && DIALOGUE_REGISTRY.exclusives[exclusiveId]) {
            return DIALOGUE_REGISTRY.exclusives[exclusiveId];
        }

        // 2. Personality dialogue (TALENT 160-179 → K0-K19)
        for (let i = 160; i <= 179; i++) {
            if (target.talent[i] > 0) {
                const kid = i - 160;
                if (DIALOGUE_REGISTRY.personalities[kid]) {
                    return DIALOGUE_REGISTRY.personalities[kid];
                }
            }
        }

        // 3. Mod-exclusive by character number (future mod hook)
        if (DIALOGUE_REGISTRY.mods[target.no]) {
            return DIALOGUE_REGISTRY.mods[target.no];
        }

        return null;
    },

    /**
     * Load a mod dialogue module dynamically.
     * @param {string} url — path to JS module (e.g. "js/dialogues/mods/mychar.js")
     * @returns {Promise<object>}
     */
    loadMod(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                // Re-scan window modules
                const loaded = [];
                for (const key in window) {
                    if (key.startsWith('DIALOGUE_K')) {
                        const id = parseInt(key.replace('DIALOGUE_K', ''));
                        const data = window[key];
                        if (data && data.id) {
                            DIALOGUE_REGISTRY.mods[data.id] = data;
                            loaded.push(data);
                        }
                    }
                }
                resolve(loaded);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    /**
     * Register dialogue data programmatically.
     * @param {object} data — { id, type, name, trainStart, commands, palamCng, markCng }
     */
    register(data) {
        if (!data || !data.id) return;
        DIALOGUE_REGISTRY.mods[data.id] = data;
    },

    /** Get a random line block from a bucket */
    pick(bucket) {
        if (!bucket || bucket.length === 0) return null;
        return bucket[Math.floor(Math.random() * bucket.length)];
    }
};
