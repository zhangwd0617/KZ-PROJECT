/**
 * Dialogue System —— 复刻 EVENT_K 架构
 * TALENT:160-179 → K0-K19 性格调度器
 * CFLAG:900+chara.no → 专属角色调度器（覆盖性格）
 * CFLAG:201 训练进度状态机
 * CFLAG:301+ 各指令首次/进阶状态机
 */

// ============================================================
// Dialogue System — 可扩展对话架构 v2
// ============================================================
// 设计原则：所有"规则"都配置化，引擎只负责查询和回退
// 新增堕落分支 / 指令 / 场景 / 专属角色 → 只需改配置/数据，不改引擎
// ============================================================

const DIALOGUE_PERSONALITY = {
    160: { id: 0, name: "慈爱", key: "jiai" },
    161: { id: 1, name: "自信家", key: "jishin" },
    162: { id: 2, name: "懦弱", key: "kiyowa" },
    163: { id: 3, name: "高贵", key: "kouki" },
    164: { id: 4, name: "冷静", key: "reitetsu" },
    165: { id: 5, name: "叛逆", key: "hangyaku" },
    166: { id: 6, name: "恶女", key: "akujo" },
    172: { id: 7, name: "知性", key: "chiteki" },
    167: { id: 10, name: "天真", key: "tenshin" },
    168: { id: 11, name: "感性", key: "kansei" },
    169: { id: 12, name: "武人", key: "bujin" },
    170: { id: 13, name: "孤独者", key: "kodokusha" },
    171: { id: 14, name: "愚者", key: "gusha" },
    172: { id: 7, name: "知性", key: "chiteki" },
    173: { id: 8, name: "庇护者", key: "higosha" },
    175: { id: 9, name: "伶俐", key: "reiri" },
    // 174 贵公子已合并入 163 高贵
};

// ========== 堕落分支规则（配置化，可热插拔）==========
// 优先级：数组前面的优先
// 新增分支只需 push/unshift 一条规则，无需改引擎代码
const DIALOGUE_STATE_RULES = [
    { id: 'first',           isFirst: true,                                                     desc: '首次训练' },
    { id: 'absolute_fall',   check: t => t.hasTalent(86) && t.hasTalent(182) && t.hasTalent(183), desc: '完全陷落' },
    { id: 'divine_reborn',   check: t => t.hasTalent(86) && t.hasTalent(183),                   desc: '狂信' },
    { id: 'divine_love',     check: t => t.hasTalent(86) && t.hasTalent(182),                   desc: '神爱' },
    { id: 'sacrificial_love', check: t => t.hasTalent(182) && t.hasTalent(183),                  desc: '殉爱' },
    { id: 'reborn',          check: t => t.hasTalent(183),                                     desc: '重塑新生' },
    { id: 'devoted',         check: t => t.hasTalent(182),                                     desc: '挚爱献身' },
    { id: 'blind_faith',     check: t => t.hasTalent(86),                                      desc: '盲信' },
    { id: 'broken',          check: t => t.hasTalent(9),                                       desc: '精神崩坏' },
    { id: 'rebel',           check: t => t.mark[3] >= 3,                                       desc: '强烈反抗' },
    { id: 'fear',            check: t => (t.mark[6] || 0) >= 2,                                 desc: '深度恐惧' },
    { id: 'lewd_love',       check: t => t.hasTalent(76) && t.hasTalent(85),                   desc: '媚爱' },
    { id: 'lewd',            check: t => t.hasTalent(76),                                      desc: '淫乱' },
    { id: 'love',            check: t => t.hasTalent(85),                                      desc: '爱慕' },
    { id: 'yield3',          check: t => t.mark[2] >= 3,                                       desc: '深度屈服' },
    { id: 'yield2',          check: t => t.mark[2] >= 2,                                       desc: '中度屈服' },
    { id: 'yield1',          check: t => t.mark[2] >= 1,                                       desc: '轻度屈服' },
    { id: 'default',         check: () => true,                                                desc: '默认状态' },
];

// 堕落层级进度值（用于 cflag[301+] 标记）
const DIALOGUE_STATE_RANK = {
    first: 1,
    default: 2, yield1: 2, yield2: 3, yield3: 4,
    fear: 5, rebel: 5,
    love: 6, lewd: 6,
    lewd_love: 7,
    broken: 7,
    blind_faith: 8,
    devoted: 9, reborn: 9,
    sacrificial_love: 10,
    divine_love: 11, divine_reborn: 11,
    absolute_fall: 12
};

// 指令执行时的跳过规则（配置化）
const COMMAND_SKIP_RULES = [
    { talent: 9, reason: 'broken' },                  // 崩坏 → 不说话
    { tequip: 12, except: [45], reason: 'gagged' },  // 口球 → 跳过（但指令45除外）
    { tequip: 90, reason: 'tentacle' },              // 触手 → 跳过
];

// 场景触发器注册表（sceneType → 描述）
// 新增场景只需在这里注册 + 在数据层添加对应 key
const DIALOGUE_SCENE_REGISTRY = {
    resist:      { desc: '抵抗反应',     fallback: { pain: '好痛…请停下…', dry: '不、不要…太干了…', exhausted: '已经…没力气了…' } },
    virgin:      { desc: '初体验丧失',   fallback: {} },
    afterClimax: { desc: '绝顶后余韵',   fallback: {} },
    pregnancy:   { desc: '妊娠相关',     fallback: {} },
    drug:        { desc: '媚药效果',     fallback: {} },
    bondage:     { desc: '拘束状态',     fallback: {} },
};

class DialogueSystem {
    constructor() {
        this.enabled = true; // FLAG:7 对应
    }

    // 获取目标角色的personality dialogue ID（兼容旧代码）
    getPersonalityId(target) {
        for (let i = 160; i <= 179; i++) {
            if (target.talent[i] > 0) {
                const p = DIALOGUE_PERSONALITY[i];
                return p ? p.id : -1;
            }
        }
        return -1;
    }

    // 模板变量插值: ${target.name}, ${master.name}
    _interpolate(text, target) {
        if (!text || !target) return text;
        let result = text;
        // 替换 ${target.name}
        result = result.replace(/\$\{target\.name\}/g, target.name || "奴隶");
        // 替换 ${target.callname}
        result = result.replace(/\$\{target\.callname\}/g, target.callname || target.name || "奴隶");
        // 替换 ${master.name}
        let masterName = "魔王";
        if (typeof window !== 'undefined' && window.G && window.G.getMaster) {
            const master = window.G.getMaster();
            if (master) masterName = master.name;
        }
        result = result.replace(/\$\{master\.name\}/g, masterName);
        // 替换 ${master.callname}
        result = result.replace(/\$\{master\.callname\}/g, masterName);
        return result;
    }

    // 通用文本输出
    say(text, type = "", target = null) {
        if (!text) return;
        const interpolated = this._interpolate(text, target);
        UI.appendText(`「${interpolated}」`, type || "accent");
    }

    // 输出多行对话块
    sayBlock(lines, type = "", target = null) {
        if (!lines || lines.length === 0) return;
        for (const line of lines) {
            const t = line.trim();
            if (!t) continue;
            const interpolated = this._interpolate(t, target);
            // 如果已经是旁白叙述（无引号且包含动作描述），不加引号
            // 用原始文本t判断是否为旁白（因为插值后${target.name}会变成名字）
            if (t.startsWith("${") || t.includes("………") || t.includes("……") || /^[你他她它这那]/.test(t)) {
                UI.appendText(interpolated, type || "info");
            } else {
                UI.appendText(`「${interpolated}」`, type || "accent");
            }
        }
    }

    // ========== State Resolution (配置化) ==========
    /**
     * 根据 DIALOGUE_STATE_RULES 配置解析堕落层级
     * 新增分支只需在配置数组中添加规则，无需改引擎
     */
    _resolveState(target, isFirst = false) {
        for (const rule of DIALOGUE_STATE_RULES) {
            if (rule.isFirst && isFirst) return rule.id;
            if (!rule.isFirst && rule.check && rule.check(target)) return rule.id;
        }
        return 'default';
    }

    /**
     * 获取所有已注册的状态ID（用于数据验证和自动补全）
     */
    _getAllStateIds() {
        return DIALOGUE_STATE_RULES.map(r => r.id);
    }

    // ========== 三层回退查询（增强版）==========
    /**
     * 三层回退 + 自动格式适配
     * 
     * 数据格式支持两种：
     *   A. 分state:  { first: [...], lewd: [...], default: [...] }
     *   B. 不分state: [...]  (直接是台词数组，适用于生理反应类场景)
     * 
     * 回退链：
     *   1. 性格数据[scene][key][state] → 性格数据[scene][key]（不分state）
     *   2. 性格默认层（commands._default[state]）
     *   3. 全局默认[scene][key][state] → 全局默认[scene][key]（不分state）
     *   4. 全局默认 commands._default[state]
     *   5. null
     */
    _getLines(target, scene, key, state) {
        const data = DialogueLoader.getForTarget(target);
        const globals = window.DIALOGUE_GLOBAL_DEFAULTS;

        // --- Helper: 从对象中提取台词池 ---
        const extractPool = (container, k, st) => {
            if (!container) return null;
            const keyData = container[k];
            if (!keyData) return null;
            // 格式B: 不分state，直接是数组
            if (Array.isArray(keyData)) return keyData;
            // 格式A: 分state
            if (keyData[st] && keyData[st].length > 0) return keyData[st];
            return null;
        };

        // Layer 1: 性格数据 特化层
        let pool = extractPool(data?.[scene], key, state);
        if (pool) return DialogueLoader.pick(pool);

        // Layer 2: 性格数据 默认层（仅commands场景）
        if (scene === 'commands' && data?.commands?._default) {
            const def = data.commands._default[state];
            if (def && def.length > 0) return DialogueLoader.pick(def);
        }

        // Layer 3: 全局默认 特化层
        pool = extractPool(globals?.[scene], key, state);
        if (pool) return DialogueLoader.pick(pool);

        // Layer 4: 全局默认 commands._default（仅commands场景）
        if (scene === 'commands' && globals?.commands?._default) {
            const def = globals.commands._default[state];
            if (def && def.length > 0) return DialogueLoader.pick(def);
        }

        return null;
    }

    /**
     * 通用场景触发器 — 替代所有硬编码的 onXxx 方法
     * 新增场景只需：
     *   1. 在 DIALOGUE_SCENE_REGISTRY 注册
     *   2. 在数据层添加 scenes[sceneKey] 或 palamCng/markCng
     *   3. 在 TrainSystem/EventSystem 的合适位置调用 onScene()
     * 
     * @param {Character} target
     * @param {string} sceneType - 场景类型（如 'resist', 'virgin', 'afterClimax'）
     * @param {string} key - 场景内的细分键（如 'pain', 'vaginal', 'c'）
     * @param {object} opts - 选项 { style: 'warning'|'accent'|'info', fallbackText: '...' }
     */
    onScene(target, sceneType, key, opts = {}) {
        if (!this.enabled) return;
        const state = this._resolveState(target);
        const sceneKey = sceneType + '_' + key;
        const block = this._getLines(target, 'scenes', sceneKey, state);

        if (block) {
            this.sayBlock(block, opts.style || "", target);
            return;
        }

        // 使用注册表中的 fallback
        const registry = DIALOGUE_SCENE_REGISTRY[sceneType];
        const fallback = registry?.fallback?.[key] || opts.fallbackText;
        if (fallback) {
            this.say(fallback, opts.style || "", target);
        }
    }

    // ========== 核心场景：训练开始 ==========
    onTrainStart(target) {
        if (!this.enabled) return;
        const isFirst = (target.cflag[201] || 0) === 0;
        const state = this._resolveState(target, isFirst);
        if (isFirst) target.cflag[201] = 1;

        const block = this._getLines(target, 'trainStart', '_main', state);
        if (block) {
            this.sayBlock(block, "", target);
            return;
        }

        const line = this._getTalentLine(target, 'start');
        if (line) this.say(line, "", target);
    }

    // ========== 核心场景：指令执行 ==========
    onCommand(target, comId) {
        if (!this.enabled) return;

        // 配置化 skip 检查
        for (const rule of COMMAND_SKIP_RULES) {
            let skip = false;
            if (rule.talent !== undefined && target.hasTalent(rule.talent)) skip = true;
            if (rule.tequip !== undefined && target.tequip[rule.tequip]) {
                if (rule.except && rule.except.includes(parseInt(comId))) skip = false;
                else skip = true;
            }
            if (skip) return;
        }

        const cflagId = 301 + parseInt(comId);
        const isFirst = (target.cflag[cflagId] || 0) === 0;
        const state = this._resolveState(target, isFirst);
        if (isFirst) {
            target.cflag[cflagId] = 1;
        } else {
            const oldVal = target.cflag[cflagId] || 0;
            target.cflag[cflagId] = Math.max(oldVal, DIALOGUE_STATE_RANK[state] || 2);
        }

        const block = this._getLines(target, 'commands', String(comId), state);
        if (block) {
            this.sayBlock(block, "", target);
            return;
        }

        const line = this._getTalentLine(target, 'command');
        if (line) this.say(line, "", target);
    }

    // ========== 核心场景：训练结束 ==========
    onTrainEnd(target) {
        if (!this.enabled) return;
        const state = this._resolveState(target);

        const block = this._getLines(target, 'trainEnd', '_main', state);
        if (block) {
            this.sayBlock(block, "", target);
            return;
        }

        const line = this._getTalentLine(target, 'end');
        if (line) {
            this.say(line, "", target);
            return;
        }

        // Legacy fallbacks
        if (target.hasTalent(9)) {
            this.say("嘻嘻～…已经…结束了吗…？", "", target);
        } else if (target.mark[3] >= 3 && !target.hasTalent(76) && !target.hasTalent(85)) {
            this.say("…不可原谅…你这个恶魔…！", "", target);
        } else if (target.mark[2] >= 3) {
            this.say("哈啊…哈啊…已经…无法思考了…", "", target);
        }
    }

    // ========== 参数变化（绝顶等）==========
    onPalamCng(target, type) {
        if (!this.enabled) return;
        const state = this._resolveState(target);

        // 先尝试性格数据的 palamCng
        const block = this._getLines(target, 'palamCng', type, state);
        if (block) {
            this.sayBlock(block, "", target);
            return;
        }

        // 回退到全局场景层
        const sceneBlock = this._getLines(target, 'scenes', type, state);
        if (sceneBlock) {
            this.sayBlock(sceneBlock, "", target);
            return;
        }

        // 终极回退
        if (type.startsWith('climax')) {
            const line = this._getTalentLine(target, 'climax');
            if (line) this.say(line, "accent", target);
        }
    }

    // ========== 刻印变化 ==========
    onMarkCng(target, type) {
        if (!this.enabled) return;
        const state = this._resolveState(target);
        const block = this._getLines(target, 'markCng', type, state);
        if (block) this.sayBlock(block, "", target);
    }

    // ========== 便捷方法（向后兼容）==========
    onResist(target, comId, reason) {
        this.onScene(target, 'resist', reason, { style: 'warning' });
    }
    onVirginLoss(target, type) {
        this.onScene(target, 'virgin', type === 'vaginal' ? 'vaginal' : (type === 'anal' ? 'anal' : 'other'), { style: 'accent' });
    }
    onAfterClimax(target, part) {
        this.onScene(target, 'afterClimax', part, { style: 'info' });
    }

    // ========== Talent-driven generic dialogue lines ==========
    _getTalentLine(target, context) {
        const pool = [];
        const T = (id) => target.talent[id];

        // --- 性格类 (10-18) ---
        if (T(10)) { // 胆怯
            pool.push(...(context==='start'?["那个…今天要做什么…？","请、请不要那么看着我…","我、我会努力的…"]:
                context==='end'?["已经…结束了吗…？","呼…好可怕…","…可以休息了吗…"]:
                ["呜…","好可怕…","不要那么用力…"])); }
        if (T(11)) { // 反抗心
            pool.push(...(context==='start'?["…不要碰我！","你又想做什么…？","我不会屈服的…"]:
                context==='end'?["…绝对不会原谅你。","哼…也就这种程度。","…下次我一定会反抗的。"]:
                ["住手！","我不会认输的！","…可恶！"])); }
        if (T(12)) { // 刚强
            pool.push(...(context==='start'?["来吧。","不管你怎么做，我都不会哭的。","…随你的便。"]:
                context==='end'?["…没什么大不了的。","就这点程度吗。","…还能继续。"]:
                ["…哼。","我不会叫出声。","…就这点程度？"])); }
        if (T(13)) { // 坦率
            pool.push(...(context==='start'?["今天也请多关照。","我会好好配合的。","…拜托了。"]:
                context==='end'?["谢谢。","…很满足。","下次也请多关照。"]:
                ["啊…","好舒服…","可以再多一点吗…"])); }
        if (T(14)) { // 傲慢
            pool.push(...(context==='start'?["哼，你以为你能让我屈服吗？","别太得意了。","…来吧，让我看看你的本事。"]:
                context==='end'?["哼…也就这种程度。","别以为我会感激你。","…下次我会让你好看的。"]:
                ["哼！","也就这种程度？","…不要得意忘形！"])); }
        if (T(15)) { // 高姿态
            pool.push(...(context==='start'?["…允许你触碰我。","这是你的荣幸。","…不要让我失望。"]:
                context==='end'?["…勉强及格。","还可以吧。","…下次要更努力。"]:
                ["…再温柔一点。","这也是你的义务。","…好好侍奉我。"])); }
        if (T(16)) { // 低姿态
            pool.push(...(context==='start'?["主人…今天也请尽情地使用我…","我已经准备好了…","请、请不要对我太温柔…"]:
                context==='end'?["主人…辛苦了…","随时都可以再叫我…","…希望能让您满意。"]:
                ["是…","请随意使用我…","主人…"])); }
        if (T(17)) { // 老实
            pool.push(...(context==='start'?["…我会听话的。","请指示。","…拜托温柔一点。"]:
                context==='end'?["…结束了吗。","我会好好记住的。","…谢谢主人。"]:
                ["是…","我会照做的…","…啊…"])); }
        if (T(18)) { // 傲娇
            pool.push(...(context==='start'?["哼！才不是因为想见你才来的！","…别误会了。","我、我才没有期待呢！"]:
                context==='end'?["哼…也就那样吧。","…才没有觉得舒服呢！","下次…下次可以再来…"]:
                ["哼！","才、才没有感觉！","…笨蛋！"])); }

        // --- 性向/兴趣 (20-37) ---
        if (T(20)) { // 克制
            pool.push(...(context==='start'?["…请不要太过分。","我会忍耐的。","…开始吧。"]:
                context==='end'?["…结束了。","…没有想象中难受。","…下次也请适可而止。"]:
                ["…唔。","我会忍耐的。","…还没完吗…"])); }
        if (T(21)) { // 冷漠
            pool.push(...(context==='start'?["…随便你。","反正没什么感觉。","…快点结束。"]:
                context==='end'?["…结束了吗。","没什么感觉。","…辛苦了。"]:
                ["…","快点。","无聊…"])); }
        if (T(22)) { // 缺乏感情
            pool.push(...(context==='start'?["…开始吧。","无所谓。","…随你。"]:
                context==='end'?["…完了。","没什么特别的。","…结束。"]:
                ["…","无所谓。","没有感觉。"])); }
        if (T(23)) { // 好奇心
            pool.push(...(context==='start'?["今天要做什么有趣的事？","我、我想尝试一下那个…","有什么新玩法吗？"]:
                context==='end'?["啊…还有别的吗？","下次试试别的吧！","真有趣呢～"]:
                ["啊！","这个感觉好新奇！","还有更多吗？"])); }
        if (T(24)) { // 保守
            pool.push(...(context==='start'?["…只能做一次。","请不要太过分。","…我不想做奇怪的事。"]:
                context==='end'?["…下次不要再这样了。","我、我不会再允许了。","…请忘记今天的事。"]:
                ["不、不要…","这、这样不行…","太、太羞耻了…"])); }
        if (T(25)) { // 乐观
            pool.push(...(context==='start'?["今天也会很开心吧♪","主人最棒了！","嘿嘿，我已经准备好了～"]:
                context==='end'?["今天也很开心♪","主人最厉害了！","下次也要一起玩哦～"]:
                ["啊哈♪","好舒服～","还要～"])); }
        if (T(26)) { // 悲观
            pool.push(...(context==='start'?["…反正不会有什么好事。","又会很痛苦吧…","…能不能轻一点…"]:
                context==='end'?["…果然很痛苦。","…下次也会这样吧。","…希望能温柔一点…"]:
                ["呜…","好痛苦…","…已经够了…"])); }
        if (T(27)) { // 警戒心
            pool.push(...(context==='start'?["…你想做什么？","我不会放松警惕的。","…别靠近我。"]:
                context==='end'?["…结束了吗。","…你没有得逞。","…我不会松懈的。"]:
                ["…！","别、别碰那里！","…你在计划什么？"])); }
        if (T(28)) { // 喜欢炫耀
            pool.push(...(context==='start'?["好好看着我的身体吧。","怎么样？很想要吧？","来，尽情地看我吧～"]:
                context==='end'?["我的表现很棒吧？","被我迷住了吧？","下次也要好好看着我哦～"]:
                ["看、看到了吗？","我、我的身体很美吧？","再、再多看一点…"])); }
        if (T(30)) { // 看重贞操
            pool.push(...(context==='start'?["…只有这一次。","如果你敢太过分…","…不要弄脏我。"]:
                context==='end'?["…只有这一次哦。","…记住你的承诺。","…不要再有下次了。"]:
                ["不、不要碰那里！","只有这个不行！","…太、太羞耻了…"])); }
        if (T(31)) { // 看轻贞操
            pool.push(...(context==='start'?["随便你怎么用。","身体只是工具而已。","来吧，不需要客气。"]:
                context==='end'?["结束了吗？","…没什么大不了的。","随时都可以再来。"]:
                ["啊…","随便来吧。","…无所谓。"])); }
        if (T(32)) { // 压抑
            pool.push(...(context==='start'?["…不要做奇怪的事。","我会忍耐的。","…请不要逼我。"]:
                context==='end'?["…我没事。","…什么都没有发生。","…请让我一个人待会。"]:
                ["…不要。","…唔。","…请停下来。"])); }
        if (T(33)) { // 奔放
            pool.push(...(context==='start'?["来吧来吧～我已经等不及了♪","今天要玩什么刺激的？","嘿嘿，让我好好享受吧～"]:
                context==='end'?["啊哈～太棒了♪","还想要更多～","下次也要这么刺激哦～"]:
                ["啊哈♪","好棒～","再多一点♪"])); }
        if (T(34)) { // 抵抗
            pool.push(...(context==='start'?["…我不会顺从的。","别想让我屈服。","…做你想做的吧。"]:
                context==='end'?["…还没有结束。","…我不会放弃的。","…这只是暂时的。"]:
                ["住手！","放开我！","…可恶！"])); }
        if (T(35)) { // 害羞
            pool.push(...(context==='start'?["那、那个…请不要一直盯着我看…","我、我会害羞的…","请、请把灯关掉…"]:
                context==='end'?["呜…好羞耻…","请、请不要看我的脸…","…可以关灯吗…"]:
                ["呜…","不、不要看…","好羞耻…"])); }
        if (T(36)) { // 不知羞耻
            pool.push(...(context==='start'?["想看就看个够吧。","我的身体很美吧？","来吧，不需要害羞。"]:
                context==='end'?["怎么样？看够了吗？","我的身体让你满意了吧？","下次也要好好欣赏哦。"]:
                ["啊哈♪","再多看一点？","怎么样？"])); }
        if (T(37)) { // 容易被要挟
            pool.push(...(context==='start'?["…我知道了。","我会听话的。","…请不要说出去。"]:
                context==='end'?["…请保密。","…我会照你说的做。","…不要告诉别人。"]:
                ["…是。","请、请不要…","…我知道了。"])); }

        // --- 体质类 (40-48) ---
        if (T(40)) { // 害怕疼痛
            pool.push(...(context==='start'?["请、请轻一点…","不要弄疼我…","我、我怕疼…"]:
                context==='end'?["呜呜…好疼…","请、请不要再弄疼我了…","…已经受不了了…"]:
                ["疼！","好痛！","请轻一点！"])); }
        if (T(41)) { // 耐痛
            pool.push(...(context==='start'?["随便你怎么做。","我不会叫出声。","…来吧。"]:
                context==='end'?["…就这点程度？","没什么感觉。","…还能继续。"]:
                ["…哼。","…就这？","…再来。"])); }
        if (T(44)) { // 爱哭鬼
            pool.push(...(context==='start'?["呜…已经要哭出来了…","请、请温柔一点…","我、我会哭的…"]:
                context==='end'?["呜呜呜…","…太、太刺激了…","眼泪停不下来…"]:
                ["呜…","呜呜…","眼泪…停不下来…"])); }
        if (T(45)) { // 不易哭
            pool.push(...(context==='start'?["我不会哭的。","随便你怎么做。","…来吧。"]:
                context==='end'?["…没有哭。","就这点程度。","…结束了。"]:
                ["…","…哼。","…还没完？"])); }
        if (T(46)) { // 药瘾
            pool.push(...(context==='start'?["哈啊…身体在渴求着什么…","给我…给我药…","没有药的话…"]:
                context==='end'?["啊…药效过去了…","还想要更多…","身体还在颤抖…"]:
                ["哈啊…","给我药…","身体好热…"])); }

        // --- 技术/忠诚 (50-64) ---
        if (T(50)) { // 学习快
            pool.push(...(context==='start'?["我会好好学习的。","让我看看新的技巧。","…我已经记住了。"]:
                context==='end'?["…学到了很多。","下次会做得更好。","…感觉变强了。"]:
                ["啊…原来如此。","我学会了。","…好有趣。"])); }
        if (T(60)) { // 容易自慰
            pool.push(...(context==='start'?["哈啊…身体已经自己动起来了…","忍不住想要触碰自己了…","今天也要舒服起来…"]:
                context==='end'?["啊…还不够…","好想再触碰自己…","身体还在发烫…"]:
                ["啊…","身体好热…","想要…"])); }
        if (T(63)) { // 献身
            pool.push(...(context==='start'?["请使用我。","我已经准备好了。","为了主人…"]:
                context==='end'?["…能让您满意吗？","随时都可以再叫我。","…这是我的荣幸。"]:
                ["是…","请随意。","为了主人…"])); }

        // --- 性癖类 (69-89) ---
        if (T(70)) { // 接受快感
            pool.push(...(context==='start'?["…我会接受的。","来吧。","…我会好好感受的。"]:
                context==='end'?["…好舒服。","…谢谢。","…还想继续。"]:
                ["啊…","好舒服…","…还要。"])); }
        if (T(71)) { // 否定快感
            pool.push(...(context==='start'?["…不要。","我不会屈服的。","…这种感觉是假的。"]:
                context==='end'?["…没有感觉。","…我不会承认的。","…只是肉体反应而已。"]:
                ["不…不要…","没有感觉…","…不要骗我。"])); }
        if (T(74)) { // 自慰狂
            pool.push(...(context==='start'?["哈啊…手指已经停不下来了…","好想触碰自己…","让我舒服起来吧…"]:
                context==='end'?["啊…手指还不够…","还想要更多…","身体还在渴求…"]:
                ["啊…","好想碰…","舒服…"])); }
        if (T(75)) { // 性交狂
            pool.push(...(context==='start'?["请进来…","好空虚…","想要被填满…"]:
                context==='end'?["啊…还不够…","还想要更多…","里面还在发麻…"]:
                ["啊…","更深一点…","好舒服…"])); }
        if (T(76)) { // 淫乱
            pool.push(...(context==='start'?["主人～快点来疼爱我吧♪","淫乱的身体已经等不及了…","啊哈♪今天也要舒服到发疯～"]:
                context==='end'?["啊哈♪…好舒服…还要更多…","主人的味道…已经忘不掉了…♪","下次也要好好地疼爱淫乱的我哦…♪"]:
                ["啊哈♪","好棒～","还要更多♪"])); }
        if (T(77)) { // 尻穴狂
            pool.push(...(context==='start'?["请、请玩弄我的后面…","后面好空虚…","想要屁股被填满…"]:
                context==='end'?["啊…后面好舒服…","还想要更多…","屁股还在发烫…"]:
                ["啊…","屁股好舒服…","还要…"])); }
        if (T(78)) { // 乳狂
            pool.push(...(context==='start'?["请、请玩弄我的胸部…","胸部好敏感…","想要被揉胸…"]:
                context==='end'?["啊…胸部好舒服…","还想要被揉…","胸部还在发麻…"]:
                ["啊…","胸部好舒服…","揉我…"])); }
        if (T(79)) { // 男人婆
            pool.push(...(context==='start'?["…来吧。","随便你怎么做。","…我不会叫出声的。"]:
                context==='end'?["…就这点程度？","没什么大不了的。","…还能继续。"]:
                ["…哼。","…就这？","…再来。"])); }
        if (T(80)) { // 变态
            pool.push(...(context==='start'?["今天要做些什么变态的事呢…？","我已经等不及了…","请对我做更过分的事…"]:
                context==='end'?["啊…好变态…好舒服…","还想要更过分的事…","请把我变得更变态…"]:
                ["啊…","更变态一点…","好舒服…"])); }
        if (T(81)) { // 双性恋
            pool.push(...(context==='start'?["不管是谁都可以…","来吧…","…我会享受的。"]:
                context==='end'?["啊…好棒…","不管是谁都好舒服…","还想再来…"]:
                ["啊…","好舒服…","都可以…"])); }
        if (T(82)) { // 讨厌男人
            pool.push(...(context==='start'?["…不要用那种眼神看我。","…不要碰我。","…离我远一点。"]:
                context==='end'?["…结束了？","…不要靠近我。","…快走。"]:
                ["别碰我！","…走开。","…不要。"])); }
        if (T(83)) { // 施虐狂
            pool.push(...(context==='start'?["今天要好好教训谁呢？","来，让我看看你有多痛苦。","我会让你哭着求饶的。"]:
                context==='end'?["哼…不过如此。","下次我会更严厉。","…你的痛苦真美。"]:
                ["哼。","痛苦吧。","求饶吧。"])); }
        if (T(84)) { // 嫉妒
            pool.push(...(context==='start'?["…你又在看别人了。","…只能看着我。","…不要看别人。"]:
                context==='end'?["…只能想着我。","…不要去找别人。","…你是我的。"]:
                ["…！","不要看别人！","…只看我。"])); }
        if (T(85)) { // 爱慕
            pool.push(...(context==='start'?["主人…今天也请疼爱我…","只要能和主人在一起…","我已经准备好了…"]:
                context==='end'?["是…我很幸福…♪","只要有主人在身边…什么都…","请永远…不要离开我…"]:
                ["主人…","好喜欢…","…幸福。"])); }
        if (T(86)) { // 盲信
            pool.push(...(context==='start'?["主人的命令是绝对的。","请指示。","…我会完美地执行。"]:
                context==='end'?["…能为主人服务是我的荣幸。","…完美执行了吗？","…随时等待命令。"]:
                ["是！","遵命！","…为了主人！"])); }
        if (T(87)) { // 小恶魔
            pool.push(...(context==='start'?["嘿嘿～今天要怎么玩呢？","让我来调戏你吧～","准备好了吗？"]:
                context==='end'?["嘿嘿～满足了吗？","下次也要被我玩弄哦～","还想要更多吧？"]:
                ["嘿嘿♪","舒服吗？","还想要吧？"])); }
        if (T(88)) { // 被虐狂
            pool.push(...(context==='start'?["请、请虐待我…","pain…让我感受更多pain…","只有痛苦才能让我感到活着…"]:
                context==='end'?["啊…好痛…好舒服…","还想要更多痛苦…","只有痛苦才能让我满足…"]:
                ["啊…","更痛一点…","好舒服…"])); }
        if (T(89)) { // 露出狂
            pool.push(...(context==='start'?["被看着的感觉…好兴奋…","大家都在看着我吗…？","再让更多人看到吧…"]:
                context==='end'?["啊…被看着…好舒服…","还想要被更多人看到…","我的身体…被看到了…"]:
                ["啊…","看着我吧！","好兴奋…"])); }

        // --- 魅力类 (91-93) ---
        if (T(91)) { // 魅惑
            pool.push(...(context==='start'?["亲爱的主人…想要我吗？","只要看着我，就会迷失吧？","来吧，沉醉在我的魅力中…"]:
                context==='end'?["啊…被你注视着…好幸福…","我的魅力…让你着迷了吧？","下次也要一直看着我哦…"]:
                ["啊…","被迷住了吧？","我的魅力…怎么样？"])); }
        if (T(92)) { // 谜之魅力
            pool.push(...(context==='start'?["…不可思议地被吸引了吧？","你也感觉到了吗？这股魔力…","无法移开视线了吧？"]:
                context==='end'?["…被我的魔力俘虏了吧？","你逃不掉的…","永远…不要移开视线…"]:
                ["…","被吸引了吧？","逃不掉的…"])); }
        if (T(93)) { // 压迫感
            pool.push(...(context==='start'?["…跪下。","在我的面前，你没有拒绝的权利。","感受这份压迫吧。"]:
                context==='end'?["…记住你的位置。","跪好，直到我允许你离开。","…这只是开始。"]:
                ["…","跪下。","服从我。"])); }

        // --- personality2 (160-179) ---
        if (T(160)) { // 慈爱
            pool.push(...(context==='start'?["…我会温柔地接纳你。","来吧，不用害怕。","…让我来抚慰你。"]:
                context==='end'?["…被满足了吗？","…希望能治愈你。","…随时都可以再来。"]:
                ["…","没关系。","…放松。"])); }
        if (T(161)) { // 自信家
            pool.push(...(context==='start'?["交给我吧。","我会让你满足的。","…来吧，不会让你失望的。"]:
                context==='end'?["怎么样？很棒吧？","下次也要交给我哦。","…我的技术不错吧？"]:
                ["…哼。","没问题。","…交给我。"])); }
        if (T(162)) { // 懦弱
            pool.push(...(context==='start'?["呜…好可怕…","请、请轻一点…","我、我会哭的…"]:
                context==='end'?["呜呜…结束了…？","好可怕…","…可以休息了吗…"]:
                ["呜…","好可怕…","不要…"])); }
        if (T(163)) { // 高贵
            pool.push(...(context==='start'?["…允许你触碰我。","这是你的荣幸。","…不要让我失望。"]:
                context==='end'?["…勉强及格。","…退下吧。","…下次要更努力。"]:
                ["…","…再温柔一点。","…好好侍奉我。"])); }
        if (T(164)) { // 冷静
            pool.push(...(context==='start'?["…开始吧。","我会分析你的每一个动作。","…不需要废话。"]:
                context==='end'?["…数据记录完毕。","…效率还可以提升。","…结束。"]:
                ["…","…有趣。","…继续。"])); }
        if (T(165)) { // 叛逆
            pool.push(...(context==='start'?["…别一副高高在上的样子。","想让我听话？先证明你有那个资格。","…来吧，让我看看你有多大本事。"]:
                context==='end'?["…也就这种程度？","哼，下次我会让你更头疼。","…别以为这样就能让我屈服。"]:
                ["…哼。","别碰我。","…烦死了。"])); }
        if (T(166)) { // 恶女
            pool.push(...(context==='start'?["嘿嘿～今天要怎么玩弄你呢？","让我来支配你吧。","…准备好了吗？"]:
                context==='end'?["嘿嘿～满足了吗？","下次也要被我支配哦。","…还想要更多吧？"]:
                ["嘿嘿♪","痛苦吧。","…求饶吧。"])); }
        if (T(172)) { // 知性
            pool.push(...(context==='start'?["…让我来研究你。","…数据收集开始。","…理论验证中。"]:
                context==='end'?["…理论得到验证。","…数据很有趣。","…下次继续实验。"]:
                ["…","…有趣。","…验证。"])); }
        if (T(173)) { // 庇护者
            pool.push(...(context==='start'?["…我会保护你的。","…不用害怕。","…有我在。"]:
                context==='end'?["…安全了吗？","…我会一直守护你。","…不用担心。"]:
                ["…","…没事的。","…保护。"])); }
        // 174 贵公子已合并入 163 高贵
        if (T(175)) { // 伶俐
            pool.push(...(context==='start'?["…我已经看穿了。","…来吧，让我看看你的本事。","…准备好了吗？"]:
                context==='end'?["…预料之中。","…下次也要动脑哦。","…聪明的玩法最棒了。"]:
                ["…","…看穿。","…聪明。"])); }

        return pool.length > 0 ? pool[RAND(pool.length)] : null;
    }

    // ========== narration text: action description (TRAIN_MESSAGE_B) ==========
    narrateAction(target, master, comId) {
        const def = TRAIN_DEFS[comId];
        if (!def) return;
        const tName = target.name;
        const mName = master ? master.name : "Master";

        let text = "";
        switch (parseInt(comId)) {
            case 0:
                text = `${mName}仔细地爱抚了${tName}的身体……从锁骨到腰际，指尖轻柔地游走。`;
                break;
            case 1:
                text = `${mName}凑近${tName}的腿间，舌头分开秘唇舔舐着……`;
                break;
            case 2:
                text = `${mName}用手指揉弄着${tName}的肛门……`;
                break;
            case 3:
                text = `${tName}在${mName}的注视下，羞耻地玩弄着自己的身体……`;
                break;
            case 4:
                text = `${tName}用嘴侍奉了${mName}……`;
                break;
            case 5:
                text = `${mName}揉捏着${tName}的胸部，掌心感受着乳肉的柔软……`;
                break;
            case 6:
                text = `${mName}吻上了${tName}的嘴唇，舌头侵入口腔纠缠……`;
                break;
            case 7:
                text = `${tName}自己张开了私处给${mName}看……`;
                break;
            case 8:
                if (target.hasTalent(0)) text = `${mName}将手指缓缓插入${tName}未经人事的深处……`;
                else text = `${mName}的手指在${tName}湿润的内部探索着……`;
                break;
            case 9:
                text = `${mName}的舌头在${tName}的肛门周围打转，持续地舔舐着……`;
                break;
            case 10:
                text = `${mName}将振动宝石按在了${tName}的阴蒂上……`;
                break;
            case 11:
                text = `${mName}将振动杖深深插入${tName}……`;
                break;
            case 12:
                text = `${mName}将扭动的肛门蠕虫塞入了${tName}的肛门……`;
                break;
            case 13:
                text = `${mName}给${tName}装上了阴蒂夹……`;
                break;
            case 14:
                text = `${mName}给${tName}装上了乳头夹……`;
                break;
            case 15:
                text = `${mName}将搾乳器装在${tName}的胸部，泵开始吸吮……`;
                break;
            case 16:
                text = `${mName}一边看着${tName}一边使用飞机杯……`;
                break;
            case 17:
                text = `${mName}将淋浴喷头对准${tName}最敏感的部位，水流脉动着……`;
                break;
            case 18:
                text = `${mName}将一串肛门珠一颗颗推入${tName}的肛门……`;
                break;
            case 19:
                text = `${mName}缓缓将珠子从${tName}的肛门中一颗颗拉出……`;
                break;
            case 20:
                if (target.hasTalent(0)) text = `${mName}将${tName}推倒在床上，挺腰贯穿了那未经人事的秘裂。鲜血顺着结合处流下……`;
                else text = `${mName}以正常位侵犯了${tName}，抽送间发出淫靡的水声……`;
                break;
            case 21:
                text = `${mName}从背后压住${tName}，强行贯穿了她……`;
                break;
            case 22:
                text = `${mName}与${tName}面对面交合，凝视着对方的眼睛……`;
                break;
            case 23:
                text = `${mName}让${tName}背面坐着，深深进入……`;
                break;
            case 24:
                text = `${tName}逆推了${mName}，贪婪地扭动着腰……`;
                break;
            case 25:
                text = `${tName}逆推了${mName}，强迫进行肛交……`;
                break;
            case 26:
                text = `${mName}将${tName}推倒，以正常位侵犯了肛门……`;
                break;
            case 27:
                text = `${mName}从背后侵犯了${tName}的肛门，臀部撞击着……`;
                break;
            case 28:
                text = `${mName}与${tName}面对面进行肛交，身体紧贴……`;
                break;
            case 29:
                text = `${mName}让${tName}背对着自己，深深埋入肛门……`;
                break;
            case 30:
                text = `${tName}用双手包裹住${mName}的阳具，上下套弄着……`;
                break;
            case 31:
                text = `${tName}含着${mName}的阳具，舌头绕着龟头打转……`;
                break;
            case 32:
                text = `${tName}用柔软的胸部夹住${mName}，上下摩擦着……`;
                break;
            case 33:
                text = `${tName}用滑腻的大腿夹住摩擦着${mName}……`;
                break;
            case 34:
                text = `${tName}骑在${mName}身上，腰肢有节奏地起落着……`;
                break;
            case 35:
                text = `${tName}将身体涂满泡沫，淫靡地贴在${mName}身上滑动……`;
                break;
            case 36:
                text = `${tName}骑在${mName}身上，坚定地进行着肛交……`;
                break;
            case 37:
                text = `${tName}将舌头压在${mName}的肛门上，顺从地舔舐着……`;
                break;
            case 38:
                text = `${tName}用脚心的弧度摩擦着${mName}……`;
                break;
            case 40:
                text = `${mName}让${tName}趴在自己膝上，手掌重重地落在臀肉上……`;
                break;
            case 41:
                text = `${mName}挥动鞭子，在${tName}的肌肤上留下红痕……`;
                break;
            case 42:
                text = `${mName}用针刺入了${tName}敏感的皮肤……`;
                break;
            case 43:
                text = `${mName}给${tName}戴上了眼罩，将其投入黑暗之中……`;
                break;
            case 44:
                text = `${mName}用绳索缠绕住${tName}的身体，紧紧束缚着……`;
                break;
            case 45:
                text = `${mName}给${tName}戴上了口球，堵住了声音……`;
                break;
            case 46:
                text = `${mName}向${tName}的肠道灌入温热的液体，并用栓子堵住……`;
                break;
            case 47:
                text = `${mName}将${tName}装入束缚装中，每一寸曲线都被紧紧束缚……`;
                break;
            case 48:
                text = `${mName}踩踏在${tName}身上，用后跟碾入肉中……`;
                break;
            case 49:
                text = `${mName}将电极接在${tName}的肛门上，释放出电脉冲……`;
                break;
            case 50:
                text = `${mName}将冰冷的润滑液倒在${tName}的身体上，手指均匀地涂抹开……`;
                break;
            case 51:
                text = `${mName}让${tName}服下媚药，身体开始泛起红潮……`;
                break;
            case 52:
                text = `${mName}让${tName}服下利尿剂，膀胱中的压力逐渐攀升……`;
                break;
            case 53:
                text = `${mName}让${tName}看向水晶球中的倒影，每一处羞耻的细节都清晰可见……`;
                break;
            case 54:
                text = `${mName}将${tName}带到室外，暴露在可能被任何人看到的空气中……`;
                break;
            case 55:
                text = `${mName}什么都没做，只是带着意味深长的微笑看着${tName}……`;
                break;
            case 56:
                text = `${mName}与${tName}轻声交谈，话语中暗藏深意……`;
                break;
            case 57:
                text = `${mName}将${tName}摆成羞耻的姿势，每一个角度都暴露无遗……`;
                break;
            case 58:
                text = `${mName}将${tName}带到浴室，蒸汽缠绕着两人的身体……`;
                break;
            case 59:
                text = `${mName}与${tName}扮演新婚夫妇，${tName}只穿着围裙……`;
                break;
            case 60:
                text = `助手深深吻上了${tName}，舌头交缠在一起……`;
                break;
            case 61:
                text = `${mName}强迫${tName}用嘴侍奉助手……`;
                break;
            case 62:
                text = `${mName}在${tName}的眼前侵犯了助手……`;
                break;
            case 63:
                text = `${tName}与助手将秘处贴在一起摩擦着……`;
                break;
            case 64:
                text = `${mName}和助手从两端同时侵犯了${tName}……`;
                break;
            case 65:
                text = `${mName}让助手侵犯${tName}，自己在一旁观看……`;
                break;
            case 66:
                text = `${tName}同时将${mName}和助手含入口中……`;
                break;
            case 67:
                text = `${tName}给助手足交，脚趾缠绕着肉棒……`;
                break;
            case 68:
                text = `${tName}用嘴交替侍奉着${mName}和助手……`;
                break;
            case 69:
                text = `${tName}与助手以六九式交缠在一起，双方的嘴都没闲着……`;
                break;
            case 70:
                text = `${tName}与助手用大腿夹住${mName}……`;
                break;
            case 71:
                text = `${tName}与助手用四只乳房夹住${mName}……`;
                break;
            case 72:
                text = `${mName}仔细地剃去了${tName}的阴毛……`;
                break;
            case 73:
                text = `${mName}为${tName}梳理了发型，改变了形象……`;
                break;
            case 80:
                text = `${mName}抓住${tName}的头，将阳具深深插入喉咙……`;
                break;
            case 81:
                text = `${mName}将整只拳头塞入了${tName}的阴道……`;
                break;
            case 82:
                text = `${mName}将拳头推入了${tName}的肛门……`;
                break;
            case 83:
                text = `${mName}同时将双手塞入${tName}的前后两穴……`;
                break;
            case 84:
                text = `${mName}从内部压迫着${tName}的G点……`;
                break;
            case 85:
                text = `${tName}忍不住释放出一股尿液……`;
                break;
            case 87:
                text = `${mName}用穿环刺穿了${tName}的身体……`;
                break;
            case 90:
                text = `${mName}强行贯穿了${tName}的乳头……`;
                break;
            case 100:
                text = `触手从召唤阵中涌出，缠绕住${tName}的四肢……`;
                break;
            case 110:
                text = `${mName}为${tName}更衣……`;
                break;
            case 111:
                text = `${mName}撕破了${tName}的衣服……`;
                break;
            case 120:
                text = `${mName}一边抽送一边刺激着${tName}的G点……`;
                break;
            case 121:
                text = `${mName}的龟头抵住${tName}的子宫口，反复研磨……`;
                break;
            case 122:
                text = `${mName}用龟头在${tName}的秘唇上摩擦……`;
                break;
            case 123:
                text = `${tName}用胸部夹住的同时含住了${mName}的阳具……`;
                break;
            case 124:
                text = `${mName}抓住${tName}的头，将阳具深深插入喉咙深处……`;
                break;
            case 125:
                text = `${tName}一边含住${mName}一边用手指刺激着自己……`;
                break;
            case 126:
                text = `${tName}用手套弄的同时含住了${mName}……`;
                break;
            case 127:
                text = `${tName}用力吸吮着${mName}的阳具……`;
                break;
            case 128:
                text = `${mName}与${tName}交合，同时贪婪地吻着……`;
                break;
            case 129:
                text = `${mName}一边抽送一边揉捏着${tName}的胸部……`;
                break;
            case 130:
                text = `${mName}以特别激烈的节奏侵犯着${tName}……`;
                break;
            case 131:
                text = `${mName}从背后侵犯${tName}，同时揉捏着胸部……`;
                break;
            case 132:
                text = `${mName}从背后侵犯${tName}，同时拍打着臀肉……`;
                break;
            case 133:
                text = `${mName}让${tName}站着，从背后贯穿……`;
                break;
            case 134:
                text = `${mName}以特别激烈的角度从背后侵犯${tName}……`;
                break;
            case 135:
                text = `${tName}自己舔舐着自己的秘处……`;
                break;
            case 150:
                text = `${mName}让${tName}自由行动……`;
                break;
            case 200:
                text = `${tName}被丢入斗技场，被迫为生存而战……`;
                break;
            default:
                text = `${mName}对${tName}执行了${def.name}……`;
        }
        if (text) UI.appendText(text);
    }

    // ========== narration text: result description (TRAIN_MESSAGE_A) ==========
    narrateResult(target, comId) {
        const tName = target.name;
        let texts = [];
        const comIdInt = parseInt(comId);
        const source = target.source;

        // 绝顶相关
        const cPleasure = target.palam[0];
        const vPleasure = target.palam[1];
        const aPleasure = target.palam[2];
        const bPleasure = target.palam[14];
        const mPleasure = target.palam[15];

        if (cPleasure > 10000 || vPleasure > 10000 || aPleasure > 10000 || bPleasure > 10000 || mPleasure > 10000) {
            // 已在_postProcess中输出绝顶信息，这里补充细节
            const parts = [];
            if (cPleasure > 10000) parts.push("阴蒂");
            if (vPleasure > 10000) parts.push("阴道");
            if (aPleasure > 10000) parts.push("肛门");
            if (bPleasure > 10000) parts.push("胸部");
            if (mPleasure > 10000) parts.push("口腔");
            if (parts.length >= 2) {
                texts.push(`${tName}的${parts.join('、')}同时达到高潮，身体不受控制地剧烈痉挛……`);
            } else {
                texts.push(`${tName}因${parts[0]}的高潮而浑身颤抖，意识模糊……`);
            }
        } else if (cPleasure > 8000 || vPleasure > 8000 || aPleasure > 8000 || bPleasure > 8000) {
            texts.push(`${tName}已经接近极限，呼吸急促，身体微微抽搐……`);
        }

        // 处女丧失 (阴道指令)
        if ([20,21,22,23,24,34,64,120,121,128,129,130,131,132,133,134].includes(comIdInt)) {
            if (!target.hasTalent(0) && target.cstr[3]) {
                texts.push(`${tName}的结合处还残留着破瓜之血……`);
            }
        }

        // 润滑状态
        if (target.palam[3] > 5000) {
            texts.push(`${tName}的秘处已完全湿透，淫液甚至在地面上积成了一小片……`);
        } else if (target.palam[3] > 3000) {
            texts.push(`${tName}的秘处已经湿透，淫液顺着大腿内侧流下……`);
        } else if (target.palam[3] > 1000) {
            texts.push(`${tName}的秘处微微湿润，泛着一层水光……`);
        }

        // 肛门干燥痛苦
        const analCommands = [2,12,18,19,25,26,27,28,29,36,37,46,49,82,83];
        if (analCommands.includes(comIdInt) && target.palam[3] < 1000 && target.tequip[20] === 0) {
            texts.push(`没有润滑液，${tName}的肛门因摩擦而痛苦不堪，肠壁紧紧收缩着……`);
        }

        // SM伤痕
        if ([40,41,42].includes(comIdInt) && target.palam[16] > 2000) {
            texts.push(`红痕绽放在${tName}的肌肤上，有些甚至开始渗出血丝……`);
        }
        if ([41,42,48,49].includes(comIdInt) && target.palam[16] > 3000) {
            texts.push(`${tName}因剧烈的疼痛而流下泪水，身体不受控制地颤抖……`);
        }

        // 媚药效果
        if (target.tequip[21]) {
            texts.push(`媚药让${tName}的身体异常敏感，皮肤泛起不自然的潮红，对每一次触碰都有强烈反应……`);
        }

        // 利尿剂效果
        if (target.tequip[22] && target.palam[11] > 1000) {
            texts.push(`${tName}因膀胱的压迫而扭动着身体，羞耻与尿意交织……`);
        }

        // 绳索/眼罩/口球的状态描述
        if (target.tequip[11] && [20,21,22,23,24,25,26,27,28,29,34,36].includes(comIdInt)) {
            texts.push(`被绳索紧紧束缚的${tName}无法反抗，只能任由摆布……`);
        }
        if (target.tequip[10] && target.palam[10] > 1000) {
            texts.push(`失去视觉的${tName}因恐惧而格外敏感，每一个触感都被放大……`);
        }
        if (target.tequip[12]) {
            texts.push(`${tName}的嘴角因口球而微微张开，唾液顺着下巴滴落，只能发出含糊的呜咽……`);
        }

        // 屈服/反抗状态的反映
        if (target.mark[2] >= 2 && target.palam[5] > 3000) {
            texts.push(`${tName}的眼神逐渐变得顺从，身体开始主动迎合……`);
        } else if (target.mark[3] >= 2 && target.palam[11] > 1000) {
            texts.push(`${tName}虽然还在抵抗，但身体已经开始背叛意志……`);
        }

        // 恐惧状态
        if (target.palam[10] > 3000) {
            texts.push(`${tName}因恐惧而瞳孔收缩，身体僵硬得像块石头……`);
        }

        // 羞耻状态
        if (target.palam[8] > 3000 && [7,54,57,58].includes(comIdInt)) {
            texts.push(`${tName}的脸红得像要滴血，羞耻得不敢直视……`);
        }

        // 触手持续状态
        if (target.tequip[90] && comIdInt !== 100) {
            texts.push(`缠绕在${tName}身上的触手仍在持续蠕动，钻入每一个角落……`);
        }

        // 润滑液效果
        if (target.tequip[20] && analCommands.includes(comIdInt)) {
            texts.push(`润滑液让侵入变得顺滑，${tName}的肛门因异物感而微微收缩……`);
        }

        // 搾乳器效果
        if (target.tequip[16] && target.hasTalent(130)) {
            texts.push(`搾乳器持续运作着，乳汁从${tName}的乳头中一滴一滴地被吸出……`);
        }

        if (texts.length > 0) {
            UI.appendText(texts.join('\n'), "info");
        }
    }
}

window.DialogueSystem = DialogueSystem;
