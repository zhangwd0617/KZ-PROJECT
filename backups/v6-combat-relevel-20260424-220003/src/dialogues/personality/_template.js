/**
 * Personality Dialogue Template — 性格对话模板
 * 
 * 复制此文件，修改 id/name/台词内容即可创建新性格。
 * 只需填充有"角色特色"的部分，其余会三层回退到全局默认。
 * 
 * 数据格式说明：
 *   - trainStart/trainEnd: { _main: { state: [[line1,line2], [...]] } }
 *   - commands: { _default: { state: [...] }, "指令ID": { state: [...] } }
 *   - palamCng/markCng: { type: { state: [...] } }
 *   - scenes: { scene_key: { state: [...] } } 或不分state: { scene_key: [...] }
 */

window.DIALOGUE_KX = {
    id: 99,           // ← 修改为唯一ID（0-15）
    type: 'personality',
    name: '模板',      // ← 修改性格名

    // ========== 训练开始 ==========
    // 建议：每个状态至少2组台词，default必须填充
    trainStart: {
        _main: {
            first: [
                ["…", "${target.name}第一次被带入训练房间时的反应。"]
            ],
            default: [
                ["…", "${target.name}日常的招呼/态度。"]
            ],
            yield1: [],
            yield2: [],
            yield3: [],
            fear: [],
            rebel: [],
            lewd: [],
            love: [],
            broken: []
        }
    },

    // ========== 训练结束 ==========
    trainEnd: {
        _main: {
            first: [
                ["…", "第一次训练结束后的反应。"]
            ],
            default: [
                ["…", "训练结束时的常态反应。"]
            ],
            yield1: [],
            yield2: [],
            yield3: [],
            fear: [],
            rebel: [],
            lewd: [],
            love: [],
            broken: []
        }
    },

    // ========== 指令通用默认（性格特征层）==========
    // 这是最重要的层！所有指令都会先查特化，没有则回退到这里。
    // 建议：default/yield1-3/lewd/love 至少填充，其余可选
    commands: {
        _default: {
            first: [
                ["…", "第一次执行任何指令时的反应。"]
            ],
            default: [
                ["…", "执行指令时的常态反应。"]
            ],
            yield1: [],
            yield2: [],
            yield3: [],
            fear: [],
            rebel: [],
            lewd: [],
            love: [],
            broken: []
        },

        // ========== 特化指令（可选）==========
        // 只写"有特色的"指令，其余自动回退到 _default
        // "0": { first: [...], default: [...], lewd: [...] },   // 爱抚
        // "1": { first: [...], default: [...] },               // 口交
        // "20": { first: [...], lewd: [...], love: [...] },    // 正常位
        // "40": { default: [...], fear: [...], lewd: [...] },  // 鞭打
    },

    // ========== 绝顶（可选）==========
    // 不分state时直接写数组；分state时写 { state: [...] }
    palamCng: {
        // climax_c: { lewd: [...], default: [...] },
        // climax_v: { lewd: [...], love: [...] },
    },

    // ========== 刻印变化（可选）==========
    markCng: {
        // yield_lv1: { default: [["…"]] },
        // yield_lv2: { default: [["…"]] },
    },

    // ========== 特殊场景（可选）==========
    scenes: {
        // 不分state的写法：
        // virgin_v: [["…"]],
        
        // 分state的写法：
        // resist_pain: { default: [["…"]], fear: [["…"]] },
    }
};
