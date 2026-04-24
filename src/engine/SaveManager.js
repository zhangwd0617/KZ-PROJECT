class SaveManager {
    constructor(prefix = 'era_maou_save_') {
        this.prefix = prefix;
    }
    save(slot, data) {
        localStorage.setItem(this.prefix + slot, JSON.stringify({ v:1, t:Date.now(), d:data }));
    }
    load(slot) {
        const raw = localStorage.getItem(this.prefix + slot);
        if (!raw) return null;
        try { return JSON.parse(raw).d; } catch(e){ return null; }
    }
}
window.SaveManager = SaveManager;
