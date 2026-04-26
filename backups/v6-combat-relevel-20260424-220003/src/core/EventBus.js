// ============================================
// ERA Maou EX — 全局事件总线
// 解耦 Game 逻辑层与 UI 渲染层
// ============================================

export const EventBus = {
    _listeners: {},

    /** 订阅事件 */
    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    },

    /** 取消订阅 */
    off(event, callback) {
        if (!this._listeners[event]) return;
        const idx = this._listeners[event].indexOf(callback);
        if (idx !== -1) this._listeners[event].splice(idx, 1);
    },

    /** 触发事件 */
    emit(event, data) {
        if (!this._listeners[event]) return;
        for (const cb of this._listeners[event]) {
            try {
                cb(data);
            } catch (err) {
                console.error(`[EventBus] 事件 "${event}" 处理失败:`, err);
            }
        }
    },

    /** 一次性订阅 */
    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        this.on(event, wrapper);
    },
};

// 为方便全局访问，也挂载到 window（过渡方案）
window.EventBus = EventBus;
