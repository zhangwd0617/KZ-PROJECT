/**
 * Game Main Controller — Emuera core state machine
 * States: TITLE → FIRST → SHOP →(TRAIN → AFTERTRAIN → ABLUP → TURNEND → SHOP)
 */
class Game {
    constructor() {
        this.state = "TITLE";
        this.prevState = "";

        // Global vars (FLAG, ITEM, MONEY, etc.)
        this.flag = new Array(2000).fill(0);
        this.item = new Array(200).fill(0);      // 持有数量
        this.money = 0;
        this.day = 1;
        this.time = 0;
        this.phase = 'train'; // 保留兼容，不再使用
        this.phase = 'train'; // V12.0: 'train'=调教阶段, 'adventure'=冒险阶段

        // Character list (CHARANUM, TARGET, ASSI, MASTER)
        this.characters = [];
        this.target = -1;   // 当前调教目标索引
        this.assi = -1;     // 助手索引
        this.master = 0;    // 魔王(玩家)索引
        this.bystander = -1;  // 副奴隶索引(P2+)

        // Training related
        this.selectcom = -1;    // 当前选择的指令ID
        this.trainCount = 0;    // 本回合已执行指令数
        this.tflag = new Array(50).fill(0); // 临时标记
        this.masterExp = 0;     // 魔王调教经验 (累计执行指令数

        // Command filter (FLAG:25)
        this.commandFilter = 0; // bitflag

        // Save管理
        this.saveManager = new SaveManager();

        // SLG: 地下城设施系统
        this.facility = new Array(20).fill(0);     // 设施等级 [facilityId] = level
        this.strategies = [];                       // 已购买的御敌策略ID列表
        this.prisoners = [];                        // 俘虏的勇者列表
        this.invaders = [];                         // 当前入侵的勇者
        this.dungeonDepth = 1;                      // 地下城层数
        this.nextInvasionDay = 0;                   // 下次勇者入侵日
        this._slaveMarketCandidates = null;         // 奴隶市场缓存

        // V11.0: 势力声望系统
        this.factionStates = {};                    // 势力状态
        this.kingTerritoryStates = {};              // 四大天王自治领状态
        this.churchState = { defense: 5000, defeated: false }; // 教廷状态
        this.devilMorale = 100;                     // 魔王军士气 [50, 200]
        this.devilBaseMorale = 0;                   // 魔王军基础士气（受天王击败影响）
        this.conqueredFactions = [];                // 已彻底征服的势力ID列表
        this.customSlaveUnlocked = [];              // 已解锁定制奴隶的种族列表
        this._raidCooldownDay = 0;                  // 攻击城镇冷却到期日

        // 收藏馆系统
        this.museum = {
            specimens: [],  // 标本: { name, level, job, personality, talentSnapshot, markSnapshot, method, description, day, id }
            items: []       // 展品物品: { gear, source, day, id }
        };

        // 楼层进度宝箱全局状态（25%/50%/75%共享，10天刷新）
        // { floorId: { refreshDay: number, takenMask: number } }
        // takenMask: 1=25%被拿, 2=50%被拿, 4=75%被拿
        this._floorChestState = {};

        // 系统模块
        this.dialogueSystem = new DialogueSystem();
        this.trainSystem = new TrainSystem(this);
        this.shopSystem = new ShopSystem(this);
        this.dayEndSystem = new DayEndSystem(this);
        this.eventSystem = new EventSystem(this);

        // 相性系统：勇者之间的关系记录
        // key: "nameA|nameB"(按字母序), value: { level: 0-4, history: [{day, event, delta}] }
        this._heroRelations = {};
    }

    // ========== Character management ==========
    addChara(templateId) {
        const c = CharaTemplates.create(templateId) || new Character(templateId);
        if (c.affinity === 50 && typeof RACE_AFFINITY !== 'undefined') {
            c.affinity = this.generateAffinity(c);
        }
        if (!c.cflag[CFLAGS.HERO_RARITY]) c.cflag[CFLAGS.HERO_RARITY] = 'N';
        this.characters.push(c);
        return this.characters.length - 1;
    }

    addCharaFromTemplate(charaObj) {
        if (charaObj.affinity === 50 && typeof RACE_AFFINITY !== 'undefined') {
            charaObj.affinity = this.generateAffinity(charaObj);
        }
        this.characters.push(charaObj);
        return this.characters.length - 1;
    }

    delChara(index) {
        if (index < 0 || index >= this.characters.length) return;
        this.characters.splice(index, 1);
        // 修正索引引用
        if (this.target === index) this.target = -1;
        else if (this.target > index) this.target--;
        if (this.assi === index) this.assi = -1;
        else if (this.assi > index) this.assi--;
        if (this.master === index) this.master = -1;
        else if (this.master > index) this.master--;
    }

    getChara(index) {
        return this.characters[index] || null;
    }

    getTarget() {
        return this.target >= 0 ? this.characters[this.target] : null;
    }

    getAssi() {
        return this.assi >= 0 ? this.characters[this.assi] : null;
    }

    getMaster() {
        return this.master >= 0 ? this.characters[this.master] : null;
    }

    marrySlave(index) {
        // 清除所有角色的结婚标记（一夫一妻制）
        for (const ch of this.characters) {
            if (ch) ch.cflag[CFLAGS.LOVE_POINTS] = 0;
        }
        if (index < 0 || index === this.master) return true; // 仅解除婚约
        const c = this.getChara(index);
        if (!c) return false;
        c.cflag[CFLAGS.LOVE_POINTS] = 1;
        return true;
    }

    // ========== State switching ==========
    setState(newState, data = null) {
        this.prevState = this.state;
        this.state = newState;

        // 离开 TRAIN 状态时清理调教布局
        if (this.prevState === 'TRAIN' && newState !== 'TRAIN') {
            const gc = document.getElementById('game-container');
            if (gc) gc.classList.remove('train-layout');
            UI._trainTextInited = false;
        }

        switch (newState) {
            case "TITLE":
                UI.renderTitle();
                break;
            case "FIRST":
                this.eventFirst();
                break;
            case "SHOP":
                this.eventShop();
                break;
            case "TRAIN":
                this.eventTrain(data);
                break;
            case "AFTERTRAIN":
                this.eventAfterTrain();
                break;
            case "ABLUP":
                UI.renderAblUp(this);
                break;
            case "TURNEND":
                this.eventTurnEnd();
                break;
            case "CONFIG":
                UI.renderConfig(this);
                break;
            case "SAVE":
                UI.renderSaveLoad(this, "save");
                break;
            case "LOAD":
                UI.renderSaveLoad(this, "load");
                break;
            case "MUSEUM":
                UI.renderMuseum(this);
                break;
            case "MAP":
                UI.renderWorldMap(this);
                break;
        }
    }

    // ========== TITLE ==========
    eventFirst() {
        this.resetData();

        // Create Master (Player)
        const master = CharaTemplates.create(0);
        master.name = "魔王";
        master.callname = "魔王";
        master.talent[122] = 1; // 男性
        master.talent[94] = 1; // 灭世魔王（主角专属：调教效果+50%）
        master.talent[314] = 5; // 魔族
        master.cflag[CFLAGS.CLASS_ID] = 999; // 魔王专属职业
        master.cflag[CFLAGS.HERO_CLASS] = 999;
        master.cstr[355] = JSON.stringify(window.CLASS_DEFS && window.CLASS_DEFS[999] ? window.CLASS_DEFS[999].skills : []);
        // V6.0 魔王使用统一属性公式
        master.level = 10;
        master.cflag[CFLAGS.BASE_HP] = 10;
        master.cflag[CFLAGS.HERO_RARITY] = 'UR'; // 魔王稀有度为UR
        this._recalcBaseStats(master);
        master.hp = master.maxHp;
        master.mp = master.maxMp;
        master.affinity = this.generateAffinity(master);
        this.master = this.addCharaFromTemplate(master);

        // Initial slave: fully random generated
        const slave = CharaTemplates.createRandomSlave(1, 5);
        if (slave) {
            slave.talent[200] = 1; // 标记为奴隶
            slave.cflag[CFLAGS.CAPTURE_STATUS] = 0; // 初始奴隶直接可用，不归入俘虏
            slave.cflag[CFLAGS.OBEDIENCE_POINTS] = this.day;
            slave.affinity = this.generateAffinity(slave);
            this.addCharaFromTemplate(slave);
        }

        this.money = 3000;
        this.day = 1;
        this.nextInvasionDay = 1; // 新机制：每天自动刷新勇者
        this.flag[500] = HERO_INVASION_CONFIG.defaultGenderRatio; // 勇者女性比例(默认90%)
        this.flag[501] = 2; // 日常事件数量 (默认2个
        this.flag[503] = 0; // 魔王声望 (初始0)

        // Opening story
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n");
        UI.appendText("　　【序章：魔王的觉醒】\n");
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        UI.appendText("在黑暗的王座之间，沉睡了千年的魔王缓缓睁开了双眼。\n");
        UI.appendText("腐朽的城堡重新升腾起魔力的雾气，魔族的眷属们从石棺中苏醒。\n\n");
        UI.appendText("\u300c\u543e\u4e3b\uff0c\u6b22\u8fce\u5f52\u6765\u3002\u300d\n");
        UI.appendText("忠诚的臣仆跪伏在地，向新生的魔王献上敬意。\n\n");
        UI.appendText("然而，久远的沉睡让魔王的魔力几近枯竭。\n");
        UI.appendText("想要恢复昔日的力量，就需要“养分”——人类的欲望与快感的结晶。\n\n");
        UI.appendText("\u300c\u53bb\uff0c\u4e3a\u543e\u4e3b\u6293\u6765\u5408\u9002\u7684\u730e\u7269\u3002\u300d\n\n");
        UI.appendText("魔族的爪牙潜入夜色之中。\n");
        UI.appendText("它们的目标是边境村庄里，那个传闻中纯洁而倔强的乡下少女...\n\n");
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        const slaveName = slave ? slave.name : '\u5c11\u5973';
        UI.appendText(`【${slaveName}】成为了你的奴隶。\n`);
        UI.appendText(`这位被捕获的${slaveName}，眼中还燃烧着不屈的火焰。\n`);
        UI.appendText("她的身体与心灵，都将成为你恢复魔力的源泉。\n\n");
        UI.appendText("调教，现在开始。\n");
        // V11.0: 初始化势力系统
        this._initFactionStates();
        this._initKingTerritoryStates();
        UI.waitClick(() => this.setState("SHOP"));
    }

    resetData() {
        this.characters = [];
        this.target = -1;
        this.assi = -1;
        this.master = -1;
        this.flag.fill(0);
        this.item.fill(0);
        this.money = 0;
        this.day = 1;
        this.time = 0;
        this.selectcom = -1;
        this.trainCount = 0;
        this.tflag.fill(0);
        this.masterExp = 0;
        this.commandFilter = 0;
        // SLG reset
        this.facility.fill(0);
        this.strategies = [];
        this.prisoners = [];
        this.invaders = [];
        this.dungeonDepth = 1;
        this.nextInvasionDay = 0;
        this._slaveMarketCandidates = null;
        this.museum = { specimens: [], items: [] };
        // V11.0: 势力声望系统重置
        this.factionStates = {};
        this.kingTerritoryStates = {};
        this.churchState = { defense: 5000, defeated: false };
        this.devilMorale = 100;
        this.devilBaseMorale = 0;
        this.conqueredFactions = [];
        this.customSlaveUnlocked = [];
        this._raidCooldownDay = 0;
    }

    // ========== SHOP ==========
    eventShop() {
        this.target = -1;
        this.assi = -1;
        UI.renderShop(this);
    }

    shopAction(action, data = null) {
        switch (action) {
            case "select_target":
                this.target = data;
                if (this.assi === this.target) this.assi = -1;
                this.setState("TRAIN", { target: this.target });
                break;
            case "select_assi":
                if (data >= 0 && data !== this.assi) {
                    const candidate = this.getChara(data);
                    if (candidate && data !== this.master && !(typeof canAssist === 'function' ? canAssist(candidate) : (candidate.mark[0] || 0) >= 3)) {
                        UI.showToast('该角色尚未完全陷落，拒绝担任助手', 'warning');
                        break;
                    }
                }
                this.assi = data;
                if (this.assi === this.target) this.assi = -1;
                UI.renderShop(this);
                break;
            case "chara_info":
                UI.renderCharaList(this);
                break;
            case "merged_shop":
                UI.renderMergedShop(this);
                break;
            case "slave_market":
                UI.renderSlaveMarket(this);
                break;
            case "mystery_upgrade":
                UI.renderMergedShop(this);
                break;
            case "dispose":
                UI.renderDisposeList(this);
                break;
            case "rest":
                this.setState("TURNEND");
                break;
            case "config":
                this.setState("CONFIG");
                break;
            case "save":
                this.setState("SAVE");
                break;
            case "load":
                this.setState("LOAD");
                break;
            case "museum":
                this.setState("MUSEUM");
                break;
        }
    }

    // ========== TRAIN ==========
    eventTrain(data) {
        const target = this.getTarget();
        if (!target) {
            this.setState("SHOP");
            return;
        }

        // Init training state
        // 体力恢复：普通奴隶100%，监狱俘虏50%
        if (target.maxbase[2] > 0) {
            const isPrisoner = this.prisoners.some(p => p === target);
            const recoverRate = isPrisoner ? 0.5 : 1.0;
            target.stamina = Math.floor(target.maxbase[2] * recoverRate);
            target.base[2] = target.stamina;
        }
        target.resetForTrain();
        this.trainCount = 0;
        this.selectcom = -1;
        this.tflag.fill(0);
        this.bystander = (data && data.bystander !== undefined) ? data.bystander : -1;
        this._assistantParticipatedThisTrain = false;
        UI._trainHistory = [];
        UI._trainTextInited = false;

        // Reset part gauges for new train session
        if (target.partGauge) target.partGauge.fill(0);
        if (target.orgasmCooldown) target.orgasmCooldown.fill(0);
        target.totalOrgasmGauge = 0;
        target.isCharging = false;
        target.chargeLevel = 0;
        target.chargeTurns = 0;
        target._hasMultipleOrgasm = false; // 本session多重绝顶buff重置
        target.sessionOrgasmCount = 0;
        target.partOrgasmCount = new Array(8).fill(0);

        // === P1: Reset ejaculation count per train session ===
        if (target.genitalConfig && target.genitalConfig.penises) {
            for (const penis of target.genitalConfig.penises) {
                penis.ejaculationCount = 0;
            }
        }

        // Reset assistant stamina & rest flags
        const assi = this.getAssi();
        if (assi) {
            assi._assistantStamina = assi._assistantMaxStamina || 80;
            assi._assistantRestNextTurn = false;
            // === NEW (P2-2): Stage5 assistant buffs - wetStart ===
            if (assi._assistantBuff && assi._assistantBuff.wetStart) {
                target.addPalam(3, assi._assistantBuff.wetStart); // 润滑PALAM
                UI.appendText(`【${assi.name}的秘术让${target.name}提前湿润了...（润滑+${assi._assistantBuff.wetStart}）】\n`, 'info');
            }
            // === NEW (P2-2): postOrgasmBoost - apply if set from previous train ===
            if (target._postOrgasmBoostNextTrain) {
                const boostAmount = target._postOrgasmBoostNextTrain;
                for (let i = 0; i < target.palam.length; i++) {
                    if (target.palam[i] > 0) target.addPalam(i, boostAmount);
                }
                UI.appendText(`【${target.name}还沉浸在先前的绝顶余韵中...（全PALAM+${boostAmount}）】\n`, 'accent');
                target._postOrgasmBoostNextTrain = 0;
            }
        }

        // Train start dialogue
        this.dialogueSystem.onTrainStart(target);

        UI.renderTrain(this);
    }

    selectCommand(comId) {
        const target = this.getTarget();

        // === P0: Faint check (崩解失神跳过下回合) ===
        if (target && target._faintNextTurn) {
            UI.appendText(`【${target.name}还处于失神状态，无法行动...】\n`, "dim");
            target._faintNextTurn = false;
            this.trainCount++;
            // 体力归零检查
            if (target.hp <= 0 || target.stamina <= 0) {
                const reason = target.hp <= 0 ? '昏了过去' : '体力耗尽';
                UI.appendText(`\n【${target.name}${reason}……】\n`);
                this.setState("AFTERTRAIN");
                return;
            }
            UI.renderTrain(this);
            return;
        }

        // === P1: Assistant rest check ===
        const assi = this.getAssi();
        if (assi && assi._assistantRestNextTurn) {
            UI.appendText(`【${assi.name}正在休息，无法行动...】\n`, "dim");
            assi._assistantRestNextTurn = false;
        }

        // === P0: Self-destruct (坏掉时每回合-3%体力) ===
        if (target && target.energy !== undefined && target.maxbase[2] > 0) {
            const energyState = target.getEnergyState ? target.getEnergyState() : null;
            if (energyState && energyState.special && energyState.special.effect === "self_destruct") {
                const staminaLoss = Math.max(1, Math.floor(target.maxbase[2] * 0.03));
                target.stamina = Math.max(0, target.stamina - staminaLoss);
                target.base[2] = target.stamina;
                UI.appendText(`【${target.name}在坏掉的状态下，肉体开始自毁...体力-${staminaLoss}】\n`, "danger");
            }
        }

        // 保存上次指令记录到历史，并清空当前显示
        if (this.trainCount > 0 && this.selectcom >= 0) {
            const prevDef = TRAIN_DEFS[this.selectcom];
            UI._saveTrainHistory(this.trainCount, prevDef?.name || '未知');
        }
        UI._clearTrainCurrent();

        this.selectcom = comId;

        // === NEW (P2/P4): Master skills, assistant, recovery commands ===
        if (comId === 990) {
            UI.showReleasePreview();
            return;
        } else if (comId === 996) {
            this._executeInsightEye();
        } else if (comId >= 989 && comId <= 992) {
            this._executeMasterSkill(comId);
        } else if (comId === 900 || comId === 901) {
            this._executeAssistantCommand(comId);
        } else if (comId === 998 || comId === 999) {
            this._executeRecovery(comId);
        } else {
            this.trainSystem.execute(comId);
        }
        this.trainCount++;

        // Check if target HP or Stamina depleted
        if (target && (target.hp <= 0 || target.stamina <= 0)) {
            const reason = target.hp <= 0 ? '昏了过去' : '体力耗尽';
            UI.appendText(`\n【${target.name}${reason}……】\n`);
            this.setState("AFTERTRAIN");
            return;
        }

        // 继续显示训练界面
        UI.renderTrain(this);
    }

    _executeInsightEye() {
        const target = this.getTarget();
        const master = this.getMaster();
        if (!target) return;
        UI.appendText(`\n\u2500\u2500\u2500\u2500 \u6d1e\u5bdf\u4e4b\u773c [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
        UI.appendText(`${master.name}\u6ce8\u89c6\u7740${target.name}\u7684\u5185\u5fc3\uff0c\u4f3c\u4e4e\u770b\u7a7f\u4e86\u4ec0\u4e48...\n`, "info");
        // 主奴气力-10
        if (target.energy !== undefined) {
            target.energy = Math.max(0, target.energy - 10);
        }
        // 揭示隐藏特质
        if (target.personality && target.personality.hidden) {
            const h = target.personality.hidden;
            if (!h.revealed) {
                // === NEW (P3-3): Insight eye adds hidden trait progress ===
                if (typeof addHiddenTraitProgress === 'function') {
                    addHiddenTraitProgress(target, 15);
                    UI.appendText(`【${target.name}\u7684\u9690\u85cf\u7279\u8d28\u8fdb\u5ea6\u589e\u52a0\u4e86\uff01\uff08+15\uff09\u3011\n`, "info");
                }
                if (typeof revealHiddenTrait === 'function') {
                    const result = revealHiddenTrait(target);
                    if (result && result.msg) UI.appendText(result.msg + "\n", "accent");
                    if (result && result.unlockLine) UI.appendText(result.unlockLine + "\n", "dim");
                } else {
                    h.revealed = true;
                    UI.appendText(`【${target.name}\u7684\u9690\u85cf\u7279\u8d28\u88ab\u5f3a\u884c\u63ed\u793a\u4e86\uff01\u3011\n`, "accent");
                }
            } else if (!h.full) {
                // Already partially revealed, add progress toward full
                if (typeof addHiddenTraitProgress === 'function') {
                    addHiddenTraitProgress(target, 15);
                    UI.appendText(`【${target.name}\u7684\u9690\u85cf\u7279\u8d28\u8fdb\u4e00\u6b65\u89e3\u9501\u4e2d...\uff08+15\uff09\u3011\n`, "info");
                    const result = revealHiddenTrait(target);
                    if (result && result.full) {
                        UI.appendText(result.msg + "\n", "accent");
                    }
                }
            }
        } else {
            UI.appendText(`【${target.name}\u6ca1\u6709\u9690\u85cf\u7684\u7279\u8d28\u6216\u5df2\u7ecf\u63ed\u793a\u3011\n`, "dim");
        }
    }

    _executeMasterSkill(comId) {
        const target = this.getTarget();
        if (!target) return;
        const master = this.getMaster();
        switch (comId) {
            case 989:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u5f3a\u5236\u7edd\u9876 [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u4f7f\u7528\u9b54\u529b\u5f3a\u5236${target.name}\u8fbe\u5230\u7edd\u9876\uff01\n`, "danger");
                for (let i = 0; i < 8; i++) target.addPartGain(i, 500);
                if (typeof calculateTotalGauge === 'function') calculateTotalGauge(target);
                if (typeof checkOrgasm === 'function') {
                    const result = checkOrgasm(target);
                    if (result && result.canClimax && typeof applyOrgasm === 'function') {
                        // P2-3: 强制绝顶效果打折 ×0.8
                        result.multiplier = (result.multiplier || 1.0) * 0.8;
                        const o = applyOrgasm(target, result);
                        if (o && o.msg) UI.appendText(o.msg + "\n", "accent");
                        if (o && o.line) UI.appendText(o.line + "\n", "info");
                    }
                }
                master.mp -= 50;
                break;
            case 990:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u91ca\u653e\u8bb8\u53ef [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u5141\u8bb8${target.name}\u91ca\u653e\u79ef\u84c4\u7684\u5feb\u611f\u2026\u2026\n`, "info");
                if (target.isCharging && target.chargeLevel > 0) {
                    target.isCharging = false;
                    let releaseMult = 1.0 + target.chargeLevel * 0.5;
                    // P2-2: Apply personality release multiplier
                    const personalityMult = (typeof getChargeReleaseMultiplier === 'function') ? getChargeReleaseMultiplier(target) : 1.0;
                    releaseMult *= personalityMult;
                    if (personalityMult !== 1.0) {
                        UI.appendText(`【${target.name}的${target.getPersonalityName ? target.getPersonalityName() : '性格'}影响了释放效果（×${personalityMult.toFixed(2)}）】\n`, "info");
                    }
                    for (let i = 0; i < 8; i++) {
                        target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * releaseMult * 0.3));
                    }
                    if (typeof calculateTotalGauge === 'function') calculateTotalGauge(target);
                    if (typeof checkOrgasm === 'function') {
                        const result = checkOrgasm(target);
                        if (result && result.canClimax && typeof applyOrgasm === 'function') {
                            const o = applyOrgasm(target, result);
                            if (o && o.msg) UI.appendText(o.msg + "\n", "accent");
                            if (o && o.line) UI.appendText(o.line + "\n", "info");
                        }
                    }
                    target.chargeLevel = 0;
                    target.chargeTurns = 0;
                } else {
                    UI.appendText(`\u4f46${target.name}\u5e76\u6ca1\u6709\u5728\u84c4\u529b\u2026\u2026\n`, "dim");
                }
                break;
            case 991:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u8fb9\u7f18\u63a7\u5236 [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u5728${target.name}\u5373\u5c06\u7edd\u9876\u7684\u77ac\u95f4\u963b\u6b62\u4e86\u5feb\u611f\u2026\u2026\n`, "warning");
                // P2-3: 将快感槽压在90%（900），下回合起始+50%
                if (target.totalOrgasmGauge > 900) {
                    const ratio = 900 / target.totalOrgasmGauge;
                    for (let i = 0; i < 8; i++) {
                        if (target.partGauge[i] > 0) target.partGauge[i] = Math.floor(target.partGauge[i] * ratio);
                    }
                    target.totalOrgasmGauge = 900;
                }
                target.isCharging = true;
                target.chargeLevel = Math.min(3, (target.chargeLevel || 0) + 1);
                target.chargeTurns = 0;
                target._edgeControlBoost = 0.5; // 下回合快感+50%
                UI.appendText(`\u3010${target.name}\u7684\u5feb\u611f\u88ab\u538b\u5236\u572890%\uff0c\u4e0b\u56de\u5408\u8d77\u59cb+50%\u3011\n`, "warning");
                UI.appendText(`\u3010${target.name}\u8fdb\u5165\u84c4\u529b\u72b6\u6001 C${target.chargeLevel}\u3011\n`, "accent");
                break;
            case 992:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u5f3a\u5236\u84c4\u529b [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u5f3a\u8feb${target.name}\u5fcd\u8010\u5feb\u611f\uff0c\u5f00\u59cb\u84c4\u529b\u2026\u2026\n`, "danger");
                target.isCharging = true;
                target.chargeLevel = Math.min(4, (target.chargeLevel || 0) + 1);
                target.chargeTurns = 0;
                if (target.chargeLevel >= 4) {
                    UI.appendText(`\u3010${target.name}\u8fbe\u5230Overcharge\u72b6\u6001\uff01\u98ce\u9669\u6781\u9ad8\uff01\u3011\n`, "danger");
                } else {
                    UI.appendText(`\u3010${target.name}\u8fdb\u5165\u84c4\u529b\u72b6\u6001 C${target.chargeLevel}\u3011\n`, "accent");
                }
                target.energy -= Math.floor(10 * this._calcEnergyDrainMultiplier(target, 992));
                break;
        }
    }

    _executeAssistantCommand(comId) {
        this._assistantParticipatedThisTrain = true;
        const assi = this.getAssi();
        const target = this.getTarget();
        if (comId === 900) {
            if (!assi) { UI.appendText(`没有助手，无法代行。\n`, "warning"); return; }
            // 检查助手临时体力（<20%无法代行）
            const assiStaminaPct = (assi._assistantMaxStamina || 80) > 0 ? (assi._assistantStamina / (assi._assistantMaxStamina || 80)) : 1;
            if (assiStaminaPct < 0.20) {
                UI.appendText(`【${assi.name}体力不足，无法代行...（${assi._assistantStamina}/${assi._assistantMaxStamina}）】\n`, "warning");
                return;
            }
            UI.appendText(`\n${assi.name}代替魔王执行调教，${target.name}的体验略有不同……\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            // 主奴获得90%PALAM（代行不如魔王熟练）
            for (let i = 0; i < target.palam.length; i++) {
                if (target.palam[i] > 0) target.palam[i] = Math.floor(target.palam[i] * 0.9);
            }
            // 消耗助手体力
            assi._assistantStamina -= 15;
            if (assi.energy !== undefined) assi.energy -= 5;
            // 代行后下回合自动休息
            assi._assistantRestNextTurn = true;
            UI.appendText(`【${assi.name}代行后需要休息一回合】\n`, "dim");
        } else if (comId === 901) {
            if (!assi) { UI.appendText(`没有助手，无法参与。\n`, "warning"); return; }
            // 检查助手体力
            if (assi._assistantStamina <= 0) {
                UI.appendText(`【${assi.name}已经脱力，无法参与...】\n`, "warning");
                return;
            }
            UI.appendText(`\n${assi.name}加入了调教，${target.name}的快感倍增！\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);

            // 同性/同路线检测
            const sameSex = (assi.talent[121] && target.talent[121]) || (assi.talent[122] && target.talent[122]);
            const sameRoute = (assi.mainRoute >= 0 && assi.mainRoute === target.mainRoute);
            let bonuses = [];
            if (sameSex) bonuses.push("同性共鸣：羞耻+20%");
            if (sameRoute) bonuses.push("同路线共鸣：+25%");
            if (bonuses.length > 0) UI.appendText(`【${bonuses.join("、")}】\n`, "info");

            // 主奴部位快感加成
            if (target.addPartGain) {
                for (let i = 0; i < 8; i++) {
                    let boost = 0.2;
                    if (sameRoute) boost += 0.25;
                    target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * boost));
                }
            }
            // 助手获得70%PALAM（简化）
            if (assi.addPartGain) {
                for (let i = 0; i < 8; i++) {
                    let ratio = 0.7;
                    if (sameSex) ratio += 0.20;
                    if (sameRoute) ratio += 0.25;
                    assi.addPartGain(i, Math.floor((target.partGauge[i] || 0) * ratio));
                }
            }

            // 消耗助手体力
            assi._assistantStamina -= 10;
            if (assi.energy !== undefined) assi.energy -= 3;

            // 检查助手脱力
            if (assi._assistantStamina <= 0) {
                UI.appendText(`【${assi.name}在参与中脱力了...】\n`, "danger");
            }
        }
    }

    _executeRecovery(comId) {
        const target = this.getTarget();
        const master = this.getMaster();
        if (!target) return;
        const meta = (typeof TRAIN_COMMAND_META !== 'undefined') ? TRAIN_COMMAND_META[comId] : null;
        const stmHeal = meta ? (Math.abs(meta.staminaCost?.target || 0)) : (comId === 999 ? 25 : 15);
        const nrgHeal = meta ? (Math.abs(meta.energyCost?.target || 0)) : (comId === 999 ? 15 : 10);

        if (comId === 998) {
            UI.appendText(`\n\u2500\u2500\u2500\u2500 \u5b89\u629a [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
            UI.appendText(`${master.name}\u6e29\u67d4\u5730\u5b89\u629a\u4e86${target.name}\u2026\u2026\n`, "info");
        } else {
            UI.appendText(`\n\u2500\u2500\u2500\u2500 \u4f11\u606f [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
            UI.appendText(`${master.name}\u8ba9${target.name}\u7565\u4f5c\u4f11\u606f\u2026\u2026\n`, "info");
        }

        if (target.stamina !== undefined) target.stamina = Math.min(target.maxbase[2] || 1000, target.stamina + stmHeal);
        if (target.energy !== undefined) target.energy = Math.min(target.maxEnergy || 500, (target.energy || 0) + nrgHeal);
        target.base[2] = target.stamina || target.base[2];
        target.hp = Math.min(target.maxhp || target.hp, target.hp + stmHeal);

        UI.appendText(`\u4f53\u529b+${stmHeal} \u6c14\u529b+${nrgHeal}\n`, "success");
    }

    endTrain() {
        this.setState("AFTERTRAIN");
    }

    // V10.1: 炼金工房 — 加工药水
    _craftPotion(type, source) {
        this.fluidStorage = this.fluidStorage || { milk: 0, semen: 0, loveJuice: 0, saliva: 0 };
        this.potionStorage = this.potionStorage || { hp: 0, mp: 0, cure: 0 };
        const fs = this.fluidStorage;

        if (type === 'hp') {
            if (source === 'milk' && fs.milk >= 200) {
                fs.milk -= 200;
                this.potionStorage.hp++;
                UI.showToast('制作了 HP回复药水×1', 'success');
            } else if (source === 'loveJuice' && fs.loveJuice >= 100) {
                fs.loveJuice -= 100;
                this.potionStorage.hp++;
                UI.showToast('制作了 HP回复药水×1', 'success');
            }
        } else if (type === 'mp') {
            if (source === 'semen' && fs.semen >= 1) {
                fs.semen -= 1;
                this.potionStorage.mp++;
                UI.showToast('制作了 MP回复药水×1', 'success');
            } else if (source === 'saliva' && fs.saliva >= 150) {
                fs.saliva -= 150;
                this.potionStorage.mp++;
                UI.showToast('制作了 MP回复药水×1', 'success');
            }
        } else if (type === 'cure') {
            const hasMixed = (fs.milk >= 100 && fs.loveJuice >= 100) || (fs.saliva >= 100 && fs.semen >= 1) || (fs.milk >= 100 && fs.saliva >= 100) || (fs.loveJuice >= 100 && fs.saliva >= 100) || (fs.milk >= 100 && fs.semen >= 1) || (fs.loveJuice >= 100 && fs.semen >= 1);
            if (hasMixed) {
                if (fs.milk >= 100 && fs.loveJuice >= 100) { fs.milk -= 100; fs.loveJuice -= 100; }
                else if (fs.saliva >= 100 && fs.semen >= 1) { fs.saliva -= 100; fs.semen -= 1; }
                else if (fs.milk >= 100 && fs.saliva >= 100) { fs.milk -= 100; fs.saliva -= 100; }
                else if (fs.loveJuice >= 100 && fs.saliva >= 100) { fs.loveJuice -= 100; fs.saliva -= 100; }
                else if (fs.milk >= 100 && fs.semen >= 1) { fs.milk -= 100; fs.semen -= 1; }
                else if (fs.loveJuice >= 100 && fs.semen >= 1) { fs.loveJuice -= 100; fs.semen -= 1; }
                this.potionStorage.cure++;
                UI.showToast('制作了 异常回复药水×1', 'success');
            }
        }
    }

    // V10.1: 炼金工房 — 物品升级
    _upgradeItem() {
        this.fluidStorage = this.fluidStorage || { milk: 0, semen: 0, loveJuice: 0, saliva: 0 };
        const fs = this.fluidStorage;
        const totalFluid = fs.milk + fs.loveJuice + fs.saliva + fs.semen * 100;
        if (totalFluid < 500) {
            UI.showToast('体液不足500ml', 'warning');
            return;
        }
        // 扣除体液（按比例）
        let need = 500;
        if (fs.milk > 0) { const take = Math.min(fs.milk, need); fs.milk -= take; need -= take; }
        if (need > 0 && fs.loveJuice > 0) { const take = Math.min(fs.loveJuice, need); fs.loveJuice -= take; need -= take; }
        if (need > 0 && fs.saliva > 0) { const take = Math.min(fs.saliva, need); fs.saliva -= take; need -= take; }
        if (need > 0 && fs.semen > 0) { const take = Math.min(fs.semen * 100, need); fs.semen -= Math.ceil(take / 100); need -= take; }

        if (RAND(100) < 10) {
            UI.showToast('🔮 魔力涌动！物品升级成功！', 'success');
            // TODO: 实际物品升级逻辑（需要选中一件物品）
        } else {
            UI.showToast('魔力不足，升级失败...', 'warning');
        }
    }

    switchTrainTarget() {
        const assi = this.getAssi();
        const target = this.getTarget();
        if (!assi || !target) return;
        // 交换 target 和 assi
        const tmp = this.target;
        this.target = this.assi;
        this.assi = tmp;
        // 重置调教状态
        const newTarget = this.getTarget();
        if (newTarget) {
            newTarget.resetForTrain();
        }
        this.trainCount = 0;
        this.selectcom = -1;
        this.tflag.fill(0);
        UI._trainTextInited = false;
        UI.renderTrain(this);
    }

    // ========== AFTERTRAIN ==========

    /**
     * 基础素质自动获取：技能Lv + EXP达标时自动获得
     * 在调教过程中实时检查，也在调教结束后最终确认
     */
    checkAutoTalents(chara) {
        if (!chara) return [];
        const newTalents = [];
        const conditions = [
            // === 身体感觉类 ===
            { id: 42, name: '容易湿', check: c => c.abl[2] >= 2 && !c.talent[42] },
            { id: 230, name: '淫核感觉上升', check: c => c.abl[0] >= 3 && c.exp[11] >= 25 && c.exp[2] >= 25 && !c.talent[230] },
            { id: 231, name: '淫乳感觉上升', check: c => c.abl[1] >= 3 && c.exp[54] >= 15 && c.exp[2] >= 25 && !c.talent[231] },
            { id: 232, name: '淫壶感觉上升', check: c => c.abl[2] >= 3 && c.exp[0] >= 25 && c.exp[2] >= 25 && !c.talent[232] },
            { id: 233, name: '淫肛感觉上升', check: c => c.abl[3] >= 3 && c.exp[32] >= 25 && c.exp[2] >= 25 && !c.talent[233] },
            { id: 136, name: '淫核', check: c => c.abl[11] >= 3 && c.exp[56] >= 25 && !c.talent[136] },

            // === 淫荡行为类 ===
            { id: 60, name: '容易自慰', check: c => c.exp[10] >= 15 && !c.talent[60] },
            { id: 74, name: '自慰狂', check: c => (c.exp[10] >= 60 || c.exp[11] >= 30) && c.abl[31] >= 2 && !c.talent[74] },
            { id: 75, name: '性交狂', check: c => c.exp[4] >= 60 && c.abl[30] >= 2 && !c.talent[75] },
            { id: 76, name: '淫乱', check: c => c.mark[1] >= 2 && c.abl[11] >= 3 && !c.talent[76] },
            { id: 77, name: '尻穴狂', check: c => c.exp[1] >= 60 && c.abl[3] >= 3 && !c.talent[77] },
            { id: 78, name: '乳狂', check: c => c.exp[35] >= 60 && c.abl[1] >= 3 && !c.talent[78] },
            { id: 47, name: '精液爱好', check: c => c.exp[20] >= 30 && c.abl[32] >= 2 && !c.talent[47] },
            { id: 52, name: '擅用舌头', check: c => c.exp[22] >= 30 && c.abl[4] >= 3 && !c.talent[52] },

            // === SM/异常类 ===
            { id: 88, name: '被虐狂', check: c => (c.exp[30] >= 30 || c.exp[51] >= 15) && c.abl[21] >= 2 && !c.talent[88] },
            { id: 83, name: '施虐狂', check: c => c.exp[33] >= 30 && c.abl[20] >= 2 && !c.talent[83] },
            { id: 89, name: '露出狂', check: c => c.abl[17] >= 2 && c.abl[36] >= 1 && !c.talent[89] },
            { id: 80, name: '变态', check: c => c.exp[50] >= 25 && !c.talent[80] },
            { id: 72, name: '容易上瘾', check: c => c.exp[57] >= 15 && !c.talent[72] },
            { id: 70, name: '接受快感', check: c => c.mark[1] >= 1 && c.abl[11] >= 2 && !c.talent[70] },
            { id: 73, name: '容易陷落', check: c => c.mark[2] >= 1 && c.exp[23] >= 25 && !c.talent[73] },

            // === 情感/精神类 ===
            { id: 85, name: '爱慕', check: c => c.mark[2] >= 2 && c.abl[10] >= 2 && c.exp[23] >= 15 && !c.talent[85] },

            // === 特殊职业/倾向 ===
            { id: 158, name: '同性恋', check: c => (c.exp[40] >= 10 || c.exp[41] >= 10) && !c.talent[158] },
            // V4.0: 移除 mark[4] 限制（猎奇刻印与娼妇无直接冲突）
            { id: 180, name: '娼妇', check: c => c.exp[74] >= 25 && c.abl[11] >= 2 && !c.talent[180] },
            { id: 188, name: '母性', check: c => c.exp[60] >= 15 && !c.talent[188] },
            // 57抄袭者已移除（无实际效果）

            // === 崩坏 ===
            // V4.0: 崩坏条件增加能量耗尽前提（mark[0]屈服刻印>=3 + mark[6]征服刻印>=2 + 气力耗尽）
            { id: 9, name: '崩坏', check: c => c.mark[0] >= 3 && c.mark[6] >= 2 && (c.base[1] || 0) <= 0 && !c.talent[9] },

            // === 魅力 ===
            { id: 91, name: '魅惑', check: c => c.abl[10] >= 3 && c.abl[11] >= 2 && c.mark[1] >= 2 && !c.talent[91] && !c.talent[92] },
            { id: 93, name: '压迫感', check: c => c.mark[0] >= 2 && c.abl[20] >= 2 && c.abl[21] >= 2 && !c.talent[93] },
        ];
        for (const cond of conditions) {
            if (cond.check(chara)) {
                chara.talent[cond.id] = 1;
                newTalents.push(cond);
            }
        }
        return newTalents;
    }

    /**
     * 上位Talent升级判定：仅在调教结束后根据最终数值判定
     * 上位Talent需要前置素质作为基础，是素质进化的最终形态
     */
    _checkAdvancedTalentUpgrade(chara) {
        if (!chara) return [];
        const newTalents = [];
        const conditions = [
            // === 四淫感觉上升 → 淫魔 ===
            { id: 272, name: '淫魔', check: c => c.talent[230] && c.talent[231] && c.talent[232] && c.talent[233] && !c.talent[272] },
            // === 爱慕/淫乱 → 挚爱 ===
            { id: 182, name: '挚爱', check: c => ((c.talent[85] && c.exp[23] >= 80 && c.abl[10] >= 4) || (c.talent[76] && c.exp[23] >= 60 && c.abl[10] >= 3)) && !c.talent[182] },
            // === 崩坏+洗脑 → 重塑 ===
            // V4.0: 重塑条件同样增加能量耗尽前提
            { id: 183, name: '重塑', check: c => c.talent[9] && c.mark[0] >= 3 && (c.mark[6] || 0) >= 2 && (c.base[1] || 0) <= 0 && c.exp[81] >= 5 && !c.talent[183] },
            // === 爱慕/淫乱/重塑 → 盲信 ===
            { id: 86, name: '盲信', check: c => ((c.talent[85] && c.exp[81] >= 3 && c.abl[10] >= 3) || (c.talent[76] && c.exp[81] >= 5 && c.abl[10] >= 4) || (c.talent[183] && c.exp[81] >= 3 && c.abl[10] >= 3)) && !c.talent[86] },
            // === 魅惑 → 谜之魅力 ===
            { id: 92, name: '谜之魅力', check: c => c.talent[91] && c.abl[10] >= 4 && c.abl[11] >= 3 && c.mark[1] >= 3 && !c.talent[92] },
            // === 娼妇 → 卖春 ===
            // V4.0: 移除 mark[4] 限制
            { id: 181, name: '卖春', check: c => c.exp[74] >= 50 && c.talent[180] && !c.talent[181] },
        ];
        for (const cond of conditions) {
            if (cond.check(chara)) {
                chara.talent[cond.id] = 1;
                newTalents.push(cond);
            }
        }
        return newTalents;
    }

    eventAfterTrain() {
        const target = this.getTarget();
        const assi = this.getAssi();
        const bystander = this.bystander >= 0 ? this.characters[this.bystander] : null;

        // V10.1: 水晶球记录保存
        if (this._crystalBallRecording && this._crystalBallCommands && this._crystalBallCommands.length > 0) {
            this.crystalBallRecords = this.crystalBallRecords || [];
            this.crystalBallRecords.push({
                id: this.crystalBallRecords.length + 1,
                participants: this._crystalBallParticipants || [],
                commands: [...this._crystalBallCommands],
                date: this.day,
                targetId: target ? target.id : null,
                targetName: target ? target.name : ''
            });
            UI.appendText(`【水晶球记录已保存！本次共记录 ${this._crystalBallCommands.length} 个指令。】\n`, "accent");
            // 清除记录状态
            this._crystalBallRecording = false;
            this._crystalBallCommands = [];
            this._crystalBallParticipants = [];
        }

        if (target) {
            // train end dialogue
            this.dialogueSystem.onTrainEnd(target);

            // === FIX: Route EXP settlement must happen BEFORE endTrain() clears source/palam ===
            if (target.source) {
                const routeMap = [
                    { palam: 4,  route: 0 },   // 顺从
                    { palam: 5,  route: 1 },   // 欲情 -> 欲望
                    { palam: 16, route: 2 },   // 痛苦
                    { palam: 8,  route: 3 },   // 羞耻 -> 露出
                    { palam: 20, route: 4 }    // 支配(反感/支配感)
                ];
                let sameRouteMult = 1.0;
                if (assi && assi._assistantBuff && assi._assistantBuff.sameRouteExpMult) {
                    if (target.mainRoute >= 0 && assi.mainRoute === target.mainRoute) {
                        sameRouteMult = assi._assistantBuff.sameRouteExpMult;
                    }
                }
                for (const m of routeMap) {
                    const val = target.source[m.palam] || target.palam[m.palam] || 0;
                    if (val > 0 && target.addRouteExp) {
                        let expGain = Math.floor(val / 100);
                        if (sameRouteMult > 1.0 && m.route === target.mainRoute) {
                            expGain = Math.floor(expGain * sameRouteMult);
                        }
                        target.addRouteExp(m.route, expGain);
                    }
                }
            }

            target.endTrain();

            // === P0: Collapse settlement (energy 0%) ===
            if (target.energy !== undefined && target._maxEnergy > 0 && target.energy <= 0) {
                UI.appendText(`【${target.name}精神崩溃了...】\n`, "danger");
                // One-time talent gain based on main route
                const mainRoute = target.mainRoute;
                const routeTalentMap = {
                    0: 70,   // 顺从路线 -> 顺从之心
                    1: 71,   // 欲望路线 -> 欲望之火
                    2: 76,   // 痛苦路线 -> 痛苦承受
                    3: 72,   // 露出路线 -> 露出癖
                    4: 73    // 支配路线 -> 支配欲
                };
                const routeNames = ['顺从', '欲望', '痛苦', '露出', '支配'];
                if (mainRoute >= 0 && routeTalentMap[mainRoute] !== undefined) {
                    const tid = routeTalentMap[mainRoute];
                    if (!target.talent[tid]) {
                        target.talent[tid] = 1;
                        const tName = (typeof TALENT_DEFS !== 'undefined' && TALENT_DEFS[tid]) ? TALENT_DEFS[tid].name : '路线感悟';
                        UI.appendText(`【崩溃中顿悟】${target.name}获得了「${tName}」！\n`, "accent");
                    }
                } else {
                    UI.appendText(`【${target.name}在${routeNames[mainRoute] || '未知'}路线中获得了新的感悟...】\n`, "accent");
                }
                // Recover 15% energy for next train
                const recoverEnergy = Math.floor(target._maxEnergy * 0.15);
                target.energy = recoverEnergy;
                UI.appendText(`【${target.name}的气力恢复至${recoverEnergy}】\n`, "info");
                // === NEW (P3-3): Collapse adds hidden trait progress ===
                if (typeof addHiddenTraitProgress === 'function') {
                    addHiddenTraitProgress(target, 20);
                    UI.appendText(`【${target.name}在崩溃中触及了深层潜意识...（隐藏进度+20）】\n`, "accent");
                }
            }

            // === NEW (P2): Train level EXP ===
            if (target.addTrainExp) {
                target.addTrainExp(Math.floor(this.trainCount * 2));
            }

            // === NEW (P2): Energy natural decay ===
            if (target.energy !== undefined) {
                target.energy -= Math.max(1, Math.floor(2 * this._calcEnergyDrainMultiplier(target, null)));
            }

            // === NEW (P2): Charge reaction settlement ===
            if (target.isCharging && target.chargeLevel > 0) {
                const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : null;
                if (pEff && pEff.activeModes && pEff.activeModes.length > 0) {
                    UI.appendText(`【${target.name}\u5728${pEff.activeModes.join('/')}\u6a21\u5f0f\u4e0b\u7ee7\u7eed\u84c4\u529b...】\n`, "info");
                }
                target.chargeTurns++;

                // === P1: Charge level per-turn costs ===
                const chargeCosts = {
                    1: { stm: 3, nrg: 5 },
                    2: { stm: 6, nrg: 10 },
                    3: { stm: 10, nrg: 15 },
                    4: { stm: 15, nrg: 20 }
                };
                let cost = chargeCosts[target.chargeLevel] || { stm: 0, nrg: 0 };

                // P2-2: Apply personality charge reaction per-turn effects
                let chargeReaction = null;
                if (typeof getChargeReaction === 'function') {
                    chargeReaction = getChargeReaction(target);
                }

                // Apply charge cost modifier (腹黑/天然/狡猾等)
                if (chargeReaction && chargeReaction.perTurn.chargeCostMod) {
                    const mod = 1 + chargeReaction.perTurn.chargeCostMod;
                    cost = { stm: Math.max(0, Math.floor(cost.stm * mod)), nrg: Math.max(0, Math.floor(cost.nrg * mod)) };
                }
                // Apply energy decay modifier (冷静/冷漠/黑桃等)
                if (chargeReaction && chargeReaction.perTurn.energyDecayMod) {
                    cost.nrg = Math.max(0, Math.floor(cost.nrg * (1 + chargeReaction.perTurn.energyDecayMod)));
                }
                // Apply no-bystander cost modifier (孤僻/幽灵)
                if (chargeReaction && chargeReaction.perTurn.noBystanderCostMod && this.bystander < 0) {
                    const mod = 1 + chargeReaction.perTurn.noBystanderCostMod;
                    cost = { stm: Math.max(0, Math.floor(cost.stm * mod)), nrg: Math.max(0, Math.floor(cost.nrg * mod)) };
                }
                // Apply high-stamina PALAM multiplier (烈焰/热血)
                if (chargeReaction && chargeReaction.perTurn.highStaminaPalamMult && chargeReaction.perTurn.staminaThreshold) {
                    const stmPct = target.maxbase[2] > 0 ? (target.stamina || 0) / target.maxbase[2] : 0;
                    if (stmPct >= chargeReaction.perTurn.staminaThreshold) {
                        for (let i = 0; i < 8; i++) {
                            target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * (chargeReaction.perTurn.highStaminaPalamMult - 1)));
                        }
                        UI.appendText(`【${target.name}在热血状态下，快感进一步燃烧！】\n`, "accent");
                    }
                }
                // Apply start PALAM bonus (方块/活泼)
                if (chargeReaction && chargeReaction.perTurn.startPalam) {
                    for (let i = 0; i < target.palam.length; i++) {
                        if (target.palam[i] > 0) target.addPalam(i, chargeReaction.perTurn.startPalam);
                    }
                }

                if (cost.stm > 0) {
                    target.stamina = (target.stamina || target.base[2] || 0) - cost.stm;
                }
                if (cost.nrg > 0) {
                    const nrgMod = this._calcEnergyDrainMultiplier(target, null);
                    target.energy = (target.energy || 0) - Math.floor(cost.nrg * nrgMod);
                }

                // === P1: Charge level special effects ===
                if (target.chargeLevel === 2 && Math.random() < 0.20) {
                    UI.appendText(`【${target.name}在蓄力中颤抖不止...】\n`, "warning");
                }
                if (target.chargeLevel === 3 && Math.random() < 0.30) {
                    UI.appendText(`【${target.name}因过度蓄力而失神了！】\n`, "danger");
                    target.energy -= Math.floor(10 * this._calcEnergyDrainMultiplier(target, null));
                }
                if (target.chargeLevel >= 4) {
                    const hpCost = Math.floor((target.base[0] || target.hp || 100) * 0.05);
                    target.hp -= hpCost;
                    UI.appendText(`【Overcharge！${target.name}的体力在崩溃边缘...（HP-${hpCost}）】\n`, "danger");
                }

                // === NEW (P5): Personality charge event ===
                if (typeof getChargeEvent === 'function') {
                    const ev = getChargeEvent(target);
                    if (ev) UI.appendText(ev + "\n", "dim");
                }
                // Risk of overcharge collapse
                const chargeInfo = (typeof CHARGE_LEVELS !== 'undefined') ? CHARGE_LEVELS[target.chargeLevel] : null;
                if (chargeInfo && chargeInfo.risk > 0 && Math.random() < chargeInfo.risk) {
                    UI.appendText(`【${target.name}\u5728\u84c4\u529b\u4e2d\u5931\u63a7\u4e86\uff01】\n`, "danger");
                    target.isCharging = false;
                    target.chargeLevel = 0;
                    target.chargeTurns = 0;
                }
            }

            // === NEW (P2): Check talent tree first ===
            if (target.checkTalentTree) {
                const treeResults = target.checkTalentTree();
                for (const r of treeResults) {
                    if (r && r.msg) UI.appendText(r.msg + "\n", "accent");
                }
            }

            // === NEW (P2): Hidden trait unlock check ===
            if (target.checkHiddenTraitUnlock) {
                const hiddenResult = target.checkHiddenTraitUnlock();
                if (hiddenResult) {
                    UI.appendText(hiddenResult.msg + "\n", "accent");
                    if (hiddenResult.unlockLine) UI.appendText(hiddenResult.unlockLine + "\n", "dim");
                }
            }

            // 最终确认基础素质
            const targetNew = this.checkAutoTalents(target);
            for (const t of targetNew) {
                UI.appendText(`【${target.name}获得了"${t.name}"的素质！】\n`, "accent");
            }
            // 上位Talent升级判定（仅在调教结束后）
            const targetAdvanced = this._checkAdvancedTalentUpgrade(target);
            for (const t of targetAdvanced) {
                UI.appendText(`【${target.name}的素质进化为"${t.name}"！】\n`, "accent");
            }
        }

        if (assi) {
            // === NEW (P2): Assistant energy decay ===
            if (assi.energy !== undefined) assi.energy -= 1;

            const assiNew = this.checkAutoTalents(assi);
            for (const t of assiNew) {
                UI.appendText(`【${assi.name}获得了"${t.name}"的素质！】\n`, "accent");
            }
            const assiAdvanced = this._checkAdvancedTalentUpgrade(assi);
            for (const t of assiAdvanced) {
                UI.appendText(`【${assi.name}的素质进化为"${t.name}"！】\n`, "accent");
            }
        }

        // === NEW (P2): Bystander processing ===
        if (bystander) {
            this.processBystander(bystander, target);
        }

        // Reset bystander for next train
        this.bystander = -1;

        UI.renderAfterTrain(this);
    }

    processBystander(bystander, target) {
        if (!bystander || !target) return;

        const turns = this.trainCount || 1;
        bystander._bystanderCount++;

        // Pleasure transfer ratio: 20% base, 40% when assistant participates
        const assistantJoined = this._assistantParticipatedThisTrain;
        let pleasureRatio = assistantJoined ? 0.4 : 0.2;

        // 副奴获得主奴部位快感传导
        if (bystander.partGauge && target.partGauge) {
            for (let i = 0; i < 8; i++) {
                const val = target.partGauge[i] || 0;
                if (val > 0 && bystander.addPartGain) {
                    bystander.addPartGain(i, Math.floor(val * pleasureRatio));
                }
            }
        }

        // 每回合消耗：体力-3，气力-1
        const staminaLoss = 3 * turns;
        const baseEnergyLoss = 1 * turns;
        // 每3回合累计一次+1气力惩罚
        const extraPenalty = Math.floor(turns / 3);
        const totalEnergyLoss = baseEnergyLoss + extraPenalty;

        if (bystander.stamina !== undefined) bystander.stamina = Math.max(0, bystander.stamina - staminaLoss);
        if (bystander.energy !== undefined) bystander.energy = Math.max(0, bystander.energy - totalEnergyLoss);

        // 副奴学习技能经验+1
        if (bystander.addTrainExp) {
            bystander.addTrainExp(1);
        }

        // 助手参与时触发「混乱」状态：拒绝率-20%
        if (assistantJoined) {
            bystander._bystanderConfused = true;
            if (bystander.refuseMod !== undefined) {
                bystander.refuseMod = (bystander.refuseMod || 0) - 0.20;
            }
        }

        // 检查副奴状态
        const states = [];
        if (bystander.energy < bystander.maxEnergy * 0.5) states.push('脸红');
        if (bystander.energy < bystander.maxEnergy * 0.3) states.push('移开视线');
        if (bystander.energy < bystander.maxEnergy * 0.2) states.push('请求参与');
        if (assistantJoined) states.push('混乱');
        if (states.length > 0) {
            const penaltyInfo = extraPenalty > 0 ? ' (累计惩罚-' + extraPenalty + ')' : '';
            UI.appendText('【' + bystander.name + '旁观中：' + states.join(',') + penaltyInfo + '】\n', 'dim');
        }
    }

    // ========== ABLUP ==========
    doAblUp(ablId) {
        const target = this.getTarget();
        if (!target) return false;
        if (target.doAblUp(ablId)) {
            UI.showToast(`${ABL_DEFS[ablId]?.name || ablId} 升级了！`, "success");
            return true;
        }
        return false;
    }

    doRouteTalentUp(talentId) {
        const target = this.getTarget();
        if (!target) return false;
        const node = (typeof TALENT_TREE !== 'undefined') ? TALENT_TREE[talentId] : null;
        if (!node) return false;
        const result = tryUnlockTalent(target, node);
        if (result && result.success) {
            UI.showToast(result.msg, "success");
            if (typeof applyRouteAccelerators === 'function') applyRouteAccelerators(target);
            return true;
        } else {
            UI.showToast(result.msg || '\u89e3\u9501\u5931\u8d25', "warning");
            return false;
        }
    }

    clickRouteAllocation(routeId) {
        const target = this.getTarget();
        if (!target) return;
        const isMain = target.mainRoute === routeId;
        const isSub = target.subRoutes.includes(routeId);

        // Cycle: none -> sub -> main -> none
        if (isMain) {
            target.setMainRoute(-1);
        } else if (isSub) {
            target.toggleSubRoute(routeId);
            target.setMainRoute(routeId);
        } else {
            // Currently none: try sub first, if sub full try main
            if (target.subRoutes.length < 2) {
                target.toggleSubRoute(routeId);
            } else if (target.mainRoute < 0) {
                target.setMainRoute(routeId);
            } else {
                // Sub full and main taken: replace main
                target.setMainRoute(routeId);
            }
        }
        UI.renderAblUp(this);
    }

    clickRouteUpgrade(routeId) {
        const target = this.getTarget();
        if (!target) return;
        const result = target.upgradeRouteStage(routeId);
        if (result && result.success) {
            const routeNames = ['顺从', '欲望', '痛苦', '露出', '支配'];
            const routeColors = ['#61afef', '#e06c75', '#c678dd', '#e5c07b', '#98c379'];
            const rn = routeNames[routeId];
            const rc = routeColors[routeId];
            UI.appendText(`【${rn}路线】${target.name} 升级到 Stage ${result.newLv}！\n`, "accent");

            // Trigger stage event for 3/4/5
            if (result.newLv >= 3 && typeof triggerRouteStageEvent === 'function') {
                const evt = triggerRouteStageEvent(target, routeId, result.newLv);
                if (evt) {
                    UI.appendText(`<div style="border:1px solid ${evt.routeColor};background:${evt.routeColor}11;padding:10px;border-radius:8px;margin:6px 0;"><div style="font-weight:bold;color:${evt.routeColor};margin-bottom:4px;">【${evt.name}】</div><div style="font-size:0.8rem;line-height:1.5;">${evt.text}</div></div>`, '', true);
                }
            }
        } else {
            UI.showToast((result && result.reasons) ? result.reasons.join('，') : '升级失败', "warning");
        }
        UI.renderAblUp(this);
    }

    convertJuelToPoints(juelType, amount) {
        const target = this.getTarget();
        if (!target) return;
        const result = target.convertJuelToRoutePoints(juelType, amount);
        if (result.success) {
            const juelName = (typeof PALAM_DEFS !== 'undefined' && PALAM_DEFS[juelType]) ? PALAM_DEFS[juelType].name : '珠';
            UI.showToast(`兑换成功：消耗${result.cost}颗${juelName}，获得${result.points}点升级点数`, "success");
        } else {
            UI.showToast(result.msg || '兑换失败', "warning");
        }
        UI.renderAblUp(this);
    }

    finishAblUp() {
        this.setState("TURNEND");
    }

    // ========== TURNEND ==========
    eventTurnEnd() {
        // Phase1: 日常结算（恢复,怀孕,事件,天数推进）
        this.dayEndSystem.processPhase1();
        // V12.0: 不再分朝/昼/夕/夜，改为调教/冒险双阶段
        this.phase = 'adventure';

        // 进入冒险阶段，等待玩家点击"观察勇者活动"
        this.setState("SHOP");
    }

    eventPhase2() {
        // Phase2: 勇者移动,战斗,奴隶探索
        try {
            this.dayEndSystem.processPhase2();
        } catch (e) {
            console.error('[eventPhase2] ERROR:', e);
            UI.showToast('勇者行动处理出错：' + e.message, 'danger');
        }
        // V12.0: 冒险阶段结束，回到调教阶段
        this.phase = 'train';
        this.setState("SHOP");
    }

    // ========== 存档 ==========
    saveGame(slot) {
        const data = {
            flag: [...this.flag],
            item: [...this.item],
            money: this.money,
            day: this.day,
            time: this.time,
            phase: this.phase,
            characters: this.characters.map(c => c.serialize()),
            target: this.target,
            assi: this.assi,
            master: this.master,
            commandFilter: this.commandFilter,
            masterExp: this.masterExp,
            // SLG data
            facility: [...this.facility],
            strategies: [...this.strategies],
            prisoners: this.prisoners.map(c => c.serialize()),
            invaders: this.invaders.map(c => c.serialize()),
            dungeonDepth: this.dungeonDepth,
            nextInvasionDay: this.nextInvasionDay,
            museum: JSON.parse(JSON.stringify(this.museum)),
            _floorChestState: JSON.parse(JSON.stringify(this._floorChestState || {})),
            _heroRelations: JSON.parse(JSON.stringify(this._heroRelations || {})),
            // V11.0: 势力声望系统
            factionStates: JSON.parse(JSON.stringify(this.factionStates)),
            kingTerritoryStates: JSON.parse(JSON.stringify(this.kingTerritoryStates)),
            churchState: JSON.parse(JSON.stringify(this.churchState)),
            devilMorale: this.devilMorale,
            devilBaseMorale: this.devilBaseMorale,
            conqueredFactions: [...this.conqueredFactions],
            customSlaveUnlocked: [...this.customSlaveUnlocked],
            _raidCooldownDay: this._raidCooldownDay
        };
        this.saveManager.save(slot, data);
        UI.showToast(`已保存到档位 ${slot}`);
    }

    loadGame(slot) {
        const data = this.saveManager.load(slot);
        if (!data) {
            UI.showToast("存档为空！", "danger");
            return false;
        }
        this.flag = [...data.flag];
        this.item = [...data.item];
        this.money = data.money;
        this.day = data.day;
        this.time = data.time;
        this.phase = data.phase || 'train';
        this.characters = data.characters.map(c => Character.deserialize(c));
        this.target = data.target;
        this.assi = data.assi;
        this.master = data.master;
        this.commandFilter = data.commandFilter || 0;
        this.masterExp = data.masterExp || 0;
        // SLG data
        this.facility = [...(data.facility || new Array(20).fill(0))];
        this.strategies = [...(data.strategies || [])];
        this.prisoners = (data.prisoners || []).map(c => Character.deserialize(c));
        this.invaders = (data.invaders || []).map(c => Character.deserialize(c));
        this.dungeonDepth = data.dungeonDepth || 1;
        this.nextInvasionDay = data.nextInvasionDay || 0;
        this.museum = data.museum || { specimens: [], items: [] };
        this._floorChestState = data._floorChestState || {};
        this._heroRelations = data._heroRelations || {};
        // V11.0: 势力声望系统
        this.factionStates = data.factionStates || {};
        this.kingTerritoryStates = data.kingTerritoryStates || {};
        this.churchState = data.churchState || { defense: 5000, defeated: false };
        this.devilMorale = data.devilMorale || 100;
        this.devilBaseMorale = data.devilBaseMorale || 0;
        this.conqueredFactions = data.conqueredFactions || [];
        this.customSlaveUnlocked = data.customSlaveUnlocked || [];
        this._raidCooldownDay = data._raidCooldownDay || 0;
        UI.showToast("读档成功！");
        this.setState("SHOP");
        return true;
    }

    // ========== 奴隶市场 ==========
    getFacilityLevel(id) {
        return this.facility[id] || 0;
    }

    canBuildFacility(id) {
        const def = FACILITY_DEFS[id];
        if (!def) return { ok: false, reason: "设施不存在" };
        const curLv = this.getFacilityLevel(id);
        if (curLv >= def.maxLv) return { ok: false, reason: "已达最高等级" };
        const cost = def.cost[curLv];
        if (this.money < cost) return { ok: false, reason: `需要${cost}G` };
        return { ok: true, cost: cost, nextLv: curLv + 1 };
    }

    buildFacility(id) {
        const check = this.canBuildFacility(id);
        if (!check.ok) {
            UI.showToast(check.reason, "danger");
            return false;
        }
        this.money -= check.cost;
        this.facility[id] = check.nextLv;
        const def = FACILITY_DEFS[id];
        UI.showToast(`【${def.name}】升级到 Lv.${check.nextLv}！${def.effects[check.nextLv - 1]}`);
        return true;
    }

    getFacilityIncome() {
        return this.getDailyIncome();
    }

    // 魔王每日领地收入：根据地下城各层等级计算
    getDailyIncome() {
        let income = 0;
        const floorBonus = [1000, 2000, 3000, 5000]; // Lv0,1,2,3
        for (let fid = 1; fid <= 10; fid++) {
            const lv = this.getFloorLevel(fid);
            income += floorBonus[lv] || 0;
        }
        // 俘虏勇者每日上交金币（基于新物价体系）
        for (const p of this.prisoners) {
            income += Math.floor(p.level * p.level + p.gold * 0.05);
            p.gold = Math.floor(p.gold * 0.95); // 上交5%持有金
}
        return income;
    }

    // ========== 收藏馆系统==========

    // 将角色制作成标本加入收藏馆
    getMaxPrisoners() {
        return 9999; // 俘虏无上限
    }

    canBuyStrategy(id) {
        const def = STRATEGY_DEFS[id];
        if (!def) return { ok: false, reason: "策略不存在" };
        if (this.strategies.includes(id)) return { ok: false, reason: "已拥有该策略" };
        // 检查设施解锁
        if (def.unlockFacilityLv) {
            for (const [fid, minLv] of Object.entries(def.unlockFacilityLv)) {
                if (this.getFacilityLevel(parseInt(fid)) < minLv) {
                    const fdef = FACILITY_DEFS[fid];
                    return { ok: false, reason: `需要先建造【${fdef?.name || '设施'}】Lv.${minLv}` };
                }
            }
        }
        if (this.money < def.price) return { ok: false, reason: `需要${def.price}G` };
        return { ok: true, price: def.price };
    }

    buyStrategy(id) {
        const check = this.canBuyStrategy(id);
        if (!check.ok) {
            UI.showToast(check.reason, "danger");
            return false;
        }
        const def = STRATEGY_DEFS[id];
        this.money -= def.price;
        this.strategies.push(id);
        UI.showToast(`习得御敌策略【${def.name}】！`);
        return true;
    }

    // ========== 地下城层管理 ==========
    _hasTriggeredDailyEvent(hero) {
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (squadId) {
            return this.invaders.some(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h.cflag[CFLAGS.SPY_SENT]);
        }
        return !!hero.cflag[CFLAGS.SPY_SENT];
    }

    // 标记勇者或小队今天已触发事件
    _markDailyEventTriggered(hero) {
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (squadId) {
            for (const h of this.invaders) {
                if (h.cflag[CFLAGS.SQUAD_ID] === squadId) h.cflag[CFLAGS.SPY_SENT] = 1;
            }
        } else {
            hero.cflag[CFLAGS.SPY_SENT] = 1;
        }
    }

    // ========== 勇【前勇者小队系统==========

    // 清除所有小队标】
    getHeroTargetCount() {
        const fame = this.flag[503] || 0;
        const day = this.day;
        // 基础3人，随天数和声望增长，动态上限
        let count = 3 + Math.floor(day / 5) + Math.floor(fame / 20);
        if (count < 3) count = 3;
        // 入侵勇者数量限制：前期30，中期50，后期80
        let maxCount;
        if (day <= 50) {
            maxCount = 30;
        } else if (day <= 100) {
            maxCount = 50;
        } else {
            maxCount = 80;
        }
        if (count > maxCount) count = maxCount;
        return count;
    }

    getHeroFame() {
        return this.flag[503] || 0;
    }

    addFame(amount) {
        this.flag[503] = (this.flag[503] || 0) + amount;
    }

    // 处理勇者入侵（旧版兼容：返回单个勇者或null）
    processHeroInvasion() {
        const target = this.getHeroTargetCount();
        const current = this.invaders.length;
        if (current >= target) return null;
        // 补充到目标数量
        const hero = this.generateHero();
        this.invaders.push(hero);
        return hero;
    }

    // 每日批量刷新勇者（新版：返回所有新入侵者）
    refreshHeroInvaders() {
        const target = this.getHeroTargetCount();
        const current = this.invaders.length;
        const newcomers = [];
        if (current < target) {
            const need = target - current;
            for (let i = 0; i < need; i++) {
                const hero = this.generateHero();
                this.invaders.push(hero);
                newcomers.push(hero);
                // V7.0: 首次冒险履历
                this._addAdventureLog(hero, 'first_adventure', '首次踏入地下城');
                this._setTitleStat(hero, 'firstAdventureDay', this.day);
                this._checkTitle(hero);
            }
        }
        // 为所有无任务的现有勇者刷新任务
        for (const hero of this.invaders) {
            if ((hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) === 0) {
                this.generateHeroTask(hero);
            }
        }
        return newcomers;
    }

    // 处理地下城探索（勇者遭遇事件）
    processDungeonEvent(hero) {
        // 收集可用事件
        const available = [];
        for (const [id, def] of Object.entries(DUNGEON_EVENT_DEFS)) {
            let ok = true;
            if (def.requireFacility) {
                for (const [fid, minLv] of Object.entries(def.requireFacility)) {
                    if (this.getFacilityLevel(parseInt(fid)) < minLv) { ok = false; break; }
                }
            }
            if (ok) available.push({ id: parseInt(id), ...def });
        }
        if (available.length === 0) return null;
        // 按权重随】
        const totalWeight = available.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(totalWeight);
        for (const e of available) {
            roll -= e.weight;
            if (roll < 0) return e;
        }
        return available[available.length - 1];
    }

    // 魔王花费金币或勋章升级
    masterLevelUp() {
        const master = this.getMaster();
        if (!master) return { success: false, msg: '魔王不存在' };
        const goldCost = 100000;
        const medalCost = 1;
        const hasGold = this.money >= goldCost;
        const hasMedal = this.getMedalCount(master) >= medalCost;
        if (!hasGold && !hasMedal) {
            return { success: false, msg: `金币或勋章不足，需要${goldCost}G或${medalCost}枚魔王勋章` };
        }
        if (hasGold) {
            this.money -= goldCost;
        } else {
            this.addMedal(master, -medalCost);
        }
        this._levelUpEntity(master, 1);
        return { success: true, msg: `魔王等级提升至 Lv.${master.level}！\n攻击:${master.cflag[CFLAGS.ATK]} 防御:${master.cflag[CFLAGS.DEF]} 速度:${master.cflag[CFLAGS.SPD]}` };
    }

    // ========== 魔王等级 ==========
    getMasterRank() {
        const exp = this.masterExp || 0;
        for (let i = MASTER_RANK_EXP.length - 1; i >= 0; i--) {
            if (exp >= MASTER_RANK_EXP[i]) return i;
        }
        return 0;
    }

    getMasterRankName() {
        return MASTER_RANK_NAMES[this.getMasterRank()] || "新手调教者";
    }

    // 地下城声望加成等级（每100声望=1级）
    getMasterFameLevel() {
        const fame = this.flag[503] || 0;
        return Math.floor(fame / 100);
    }

    // 魔王有效等级（基础等级+声望加成）
    getMasterEffectiveLevel() {
        const master = this.getMaster();
        if (!master) return 1;
        return (master.level || 1) + this.getMasterFameLevel();
    }

    // ============================================
    // V8.0: 勇者稀有度每日自动升级检查
    // ============================================
    _checkHeroRarityUpgrade(hero) {
        if (!hero || !hero.cflag) return null;
        const fame = hero.fame || 0;
        const lv = hero.level || 1;
        const currentRarity = hero.cflag[CFLAGS.HERO_RARITY] || 'N';

        // 稀有度晋升阈值（基于个人声望）
        const thresholds = {
            N:  { next: 'R',   fame: 50,   lv: 5 },
            R:  { next: 'SR',  fame: 150,  lv: 15 },
            SR: { next: 'SSR', fame: 400,  lv: 30 },
            SSR:{ next: 'UR',  fame: 1000, lv: 50 }
        };
        const cfg = thresholds[currentRarity];
        if (!cfg) return null; // UR已经是最高

        if (fame >= cfg.fame && lv >= cfg.lv) {
            // 晋升！
            hero.cflag[CFLAGS.HERO_RARITY] = cfg.next;
            // 重新计算属性（稀有度加成已内置在 _recalcBaseStats 中）
            this._recalcBaseStats(hero);
            hero.hp = hero.maxHp;
            hero.mp = hero.maxMp;
            return cfg.next;
        }
        return null;
    }

    // ========== 过滤【==========
    toggleFilter(groupBit) {
        this.commandFilter ^= (1 << groupBit);
        if (this.state === "TRAIN") UI.renderTrain(this);
    }

    isGroupFiltered(groupName) {
        const map = { "caress":0, "tool":1, "vaginal":2, "anal":3, "service":4, "sm":5, "rough":6, "monster":7, "assistant":8, "arena":9 };
        const bit = map[groupName];
        if (bit === undefined) return false;
        return (this.commandFilter & (1 << bit)) !== 0;
    }

    // ========== V5.0 转职系统 ==========
    canPromote(entity, useMedal = false) {
        if (!entity) return { can: false, reason: '角色不存在' };
        const classId = entity.cflag[CFLAGS.CLASS_ID] || entity.cflag[CFLAGS.HERO_CLASS] || 0;
        const clsDef = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        if (!clsDef) return { can: false, reason: '职业数据缺失' };
        if (clsDef.tier !== 'basic') return { can: false, reason: '已是进阶职业' };
        if (!useMedal && entity.level < 20) return { can: false, reason: '需要等级20' };
        // V6.0: 需要转职徽章；V10.0: 或用勋章强制晋升
        if (!useMedal && !this._hasItem(entity, CFLAGS.CLASS_CHANGE_BADGE)) {
            return { can: false, reason: '需要转职徽章（守关Boss低概率掉落）' };
        }
        if (useMedal) {
            const medalCost = 1;
            const currentMedals = this.getMedalCount(entity);
            if (currentMedals < medalCost) return { can: false, reason: `需要${medalCost}枚魔王勋章（当前${currentMedals}枚）` };
        }
        const advDef = window.CLASS_DEFS ? window.CLASS_DEFS[clsDef.advClassId] : null;
        if (!advDef) return { can: false, reason: '进阶职业数据缺失' };
        return { can: true, advClassId: clsDef.advClassId, advName: advDef.name, useMedal };
    }

    promoteClass(entity, useMedal = false) {
        const check = this.canPromote(entity, useMedal);
        if (!check.can) return check;
        const advDef = window.CLASS_DEFS ? window.CLASS_DEFS[check.advClassId] : null;
        if (!advDef) return { can: false, reason: '进阶职业数据缺失' };
        if (useMedal) {
            this.addMedal(entity, -1); // V10.0: 消耗1勋章强制晋升
        } else {
            this._removeItem(entity, CFLAGS.CLASS_CHANGE_BADGE); // V6.0: 消耗转职徽章
        }
        // 更新职业ID
        entity.cflag[CFLAGS.CLASS_ID] = check.advClassId;
        entity.cflag[CFLAGS.HERO_CLASS] = check.advClassId;
        // 更新技能列表
        entity.cstr[355] = JSON.stringify(advDef.skills);
        // 重新计算基础属性
        this._recalcBaseStats(entity);
        // 添加转职标记
        entity.cflag[CFLAGS.PROMOTED] = 1;
        const oldName = window.CLASS_DEFS && window.CLASS_DEFS[check.advClassId] && window.CLASS_DEFS[check.advClassId].baseClassId ?
            (window.CLASS_DEFS[window.CLASS_DEFS[check.advClassId].baseClassId] || {}).name : '基础职业';
        this._addAdventureLog(entity, 'class_promote', `从${oldName || '基础职业'}转职为${advDef.name}`);
        return { can: true, msg: `${entity.name} 转职为 ${advDef.name}！` };
    }

    // V10.0: 堕落种族转换
    canFallHero(entity) {
        if (!entity) return { can: false, reason: '角色不存在' };
        if (entity.cflag[CFLAGS.FALLEN_RACE_ID]) return { can: false, reason: '已是堕落种族' };
        const medalCost = 5;
        const currentMedals = this.getMedalCount(entity);
        if (currentMedals < medalCost) return { can: false, reason: `需要${medalCost}枚魔王勋章（当前${currentMedals}枚）` };
        const raceId = entity.talent[314] || 1;
        const fallenRaceMap = { 1: 11, 2: 13, 3: 14, 4: 12, 5: 11, 6: 15, 7: 14, 8: 13, 9: 15, 10: 11 };
        const fallenRaceId = fallenRaceMap[raceId] || 11;
        const raceName = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[fallenRaceId]) || '背教者';
        return { can: true, fallenRaceId, raceName };
    }

    fallHero(entity) {
        const check = this.canFallHero(entity);
        if (!check.can) return check;
        const fallenRaceMap = { 1: 11, 2: 13, 3: 14, 4: 12, 5: 11, 6: 15, 7: 14, 8: 13, 9: 15, 10: 11 };
        const raceId = entity.talent[314] || 1;
        const fallenRaceId = fallenRaceMap[raceId] || 11;
        entity.cflag[CFLAGS.FALLEN_RACE_ID] = fallenRaceId;
        this.addMedal(entity, -5); // 消耗5勋章
        this._recalcBaseStats(entity);
        const raceName = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[fallenRaceId]) || '背教者';
        return { can: true, msg: `${entity.name} 堕落为 ${raceName}！` };
    }

    // V10.0: 魔军职阶晋升（基本→魔军基本 2勋章 / 进阶→魔军进阶 3勋章 / 魔军基本→魔军进阶 1勋章）
    canDemonPromote(entity) {
        if (!entity) return { can: false, reason: '角色不存在' };
        const classId = entity.cflag[CFLAGS.CLASS_ID] || entity.cflag[CFLAGS.HERO_CLASS] || 0;
        const clsDef = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        if (!clsDef) return { can: false, reason: '职业数据缺失' };
        const isBasic = clsDef.tier === 'basic';
        const isAdvanced = clsDef.tier === 'advanced';
        const isDemonBasic = isBasic && classId >= 400 && classId <= 414;
        const isDemonAdvanced = isAdvanced && classId >= 500 && classId <= 514;
        const isNormalBasic = isBasic && classId >= 200 && classId <= 214;
        const isNormalAdvanced = isAdvanced && classId >= 300 && classId <= 314;
        let targetId = 0, cost = 0, targetName = '';
        if (isNormalBasic) {
            targetId = classId + 200; // 200→400, 201→401, etc.
            cost = 2;
            const tDef = window.CLASS_DEFS ? window.CLASS_DEFS[targetId] : null;
            targetName = tDef ? tDef.name : '魔军基础职业';
        } else if (isNormalAdvanced) {
            targetId = classId + 200; // 300→500, 301→501, etc.
            cost = 3;
            const tDef = window.CLASS_DEFS ? window.CLASS_DEFS[targetId] : null;
            targetName = tDef ? tDef.name : '魔军进阶职业';
        } else if (isDemonBasic) {
            targetId = classId + 100; // 400→500, 401→501, etc.
            cost = 1;
            const tDef = window.CLASS_DEFS ? window.CLASS_DEFS[targetId] : null;
            targetName = tDef ? tDef.name : '魔军进阶职业';
        } else {
            return { can: false, reason: '当前职业无法晋升魔军职阶' };
        }
        const currentMedals = this.getMedalCount(entity);
        if (currentMedals < cost) return { can: false, reason: `需要${cost}枚魔王勋章（当前${currentMedals}枚）` };
        return { can: true, targetId, cost, targetName };
    }

    demonPromote(entity) {
        const check = this.canDemonPromote(entity);
        if (!check.can) return check;
        entity.cflag[CFLAGS.CLASS_ID] = check.targetId;
        entity.cflag[CFLAGS.HERO_CLASS] = check.targetId;
        const tDef = window.CLASS_DEFS ? window.CLASS_DEFS[check.targetId] : null;
        if (tDef && tDef.skills) {
            entity.cstr[355] = JSON.stringify(tDef.skills);
        }
        this.addMedal(entity, -check.cost);
        this._recalcBaseStats(entity);
        entity.cflag[CFLAGS.IS_DEMON_ARMY] = 1; // 标记为魔军

        // V12.0: 未鉴定物品回到魔王城自动完成鉴定
        if (typeof GearSystem !== 'undefined' && GearSystem.identifyAllGear) {
            GearSystem.identifyAllGear(entity);
        }

        return { can: true, msg: `${entity.name} 晋升为 ${check.targetName}！` };
    }
}

// V7.3: 检测训练指令是否命中角色性弱点
Game.prototype._isWeaknessMatch = function(target, comId) {
    if (!target || !comId) return false;
    const weaknessType = target.cflag ? (target.cflag[CFLAGS.SEXUAL_WEAKNESS] || 0) : 0;
    if (!weaknessType) return false;
    const meta = (typeof getTrainMeta === 'function') ? getTrainMeta(comId) : null;
    const def = (typeof TRAIN_DEFS !== 'undefined') ? TRAIN_DEFS[comId] : null;
    const parts = meta ? meta.stimulatedParts : [];
    const rt = meta ? meta.routeTags : {};
    switch (weaknessType) {
        case 1: return (rt.shame >= 2) || [7, 43, 52, 53, 54, 57, 58, 59, 85].includes(comId) || (def && def.category === 'cosmetic');
        case 2: return (rt.pain >= 2) || (def && (def.category === 'sm' || def.category === 'rough'));
        case 3: return (parts && parts.includes('O')) || (def && def.category === 'service');
        case 4: return parts && parts.includes('A');
        case 5: return parts && (parts.includes('B') || parts.includes('N'));
        case 6: return parts && (parts.includes('C') || parts.includes('V') || parts.includes('W'));
        case 7: return def && def.category === 'tool';
        case 8: return [7, 16, 43, 52, 53, 57, 85].includes(comId) || (rt.shame >= 3 && (!parts || parts.length <= 1)) || (def && def.category === 'rough');
    }
    return false;
};

// V7.3: 气力消耗阶梯修正系数
// 陷落奴隶维持现状；未陷落奴隶意志力越强下降越慢，软弱性格/性弱点加速
Game.prototype._calcEnergyDrainMultiplier = function(target, comId) {
    if (!target) return 1.0;
    const mark = target.mark ? (target.mark[0] || 0) : 0;
    const isFallen = mark >= 3 || target.talent[200];
    // 陷落奴隶维持现状
    if (isFallen) return 1.0;
    // 未陷落：mark越低（意志力越强），消耗越慢
    let mod = 1.0;
    if (mark === 0) mod = 0.5;
    else if (mark === 1) mod = 0.7;
    else if (mark === 2) mod = 0.85;
    // 软弱性格加速
    if (target.talent[10]) mod *= 1.2;   // 胆小
    if (target.talent[162]) mod *= 1.3;  // 懦弱
    if (target.talent[16]) mod *= 1.15;  // 低姿态
    if (target.talent[17]) mod *= 1.1;   // 老实
    // 性弱点匹配加速（仅指令消耗）
    if (comId !== undefined && comId !== null && this._isWeaknessMatch(target, comId)) {
        mod *= 1.25;
    }
    return mod;
};

// V6.0: 统一属性成长公式 — 所有角色共用
Game.prototype._recalcBaseStats = function(entity) {
    if (!entity) return;
    const lv = entity.level || 1;

    // 获取种族修正（优先使用真实堕落种族ID）
    const raceId = (entity.cflag && entity.cflag[CFLAGS.FALLEN_RACE_ID]) || (entity.talent ? entity.talent[314] : 0);
    const raceMod = (window.RACE_TRAITS && window.RACE_TRAITS[raceId]) ? window.RACE_TRAITS[raceId].stats : { hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 };

    // 获取职业修正
    const classId = entity.cflag ? (entity.cflag[CFLAGS.CLASS_ID] || entity.cflag[CFLAGS.HERO_CLASS]) : 0;
    const clsMod = (window.CLASS_DEFS && window.CLASS_DEFS[classId]) ? window.CLASS_DEFS[classId].stats : { hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 };

    // 基础属性（统一公式）
    let baseHp  = 800 + lv * 20;
    let baseMp  = 400 + lv * 10;
    let baseAtk = 20  + lv * 3;
    let baseDef = 15  + lv * 2;
    let baseSpd = 8   + lv * 1;

    // 应用种族修正
    baseHp  = Math.floor(baseHp  * (raceMod.hp  || 1.0));
    baseMp  = Math.floor(baseMp  * (raceMod.mp  || 1.0));
    baseAtk = Math.floor(baseAtk * (raceMod.atk || 1.0));
    baseDef = Math.floor(baseDef * (raceMod.def || 1.0));
    baseSpd = Math.floor(baseSpd * (raceMod.spd || 1.0));

    // 应用职业修正
    baseHp  = Math.floor(baseHp  * (clsMod.hp  || 1.0));
    baseMp  = Math.floor(baseMp  * (clsMod.mp  || 1.0));
    baseAtk = Math.floor(baseAtk * (clsMod.atk || 1.0));
    baseDef = Math.floor(baseDef * (clsMod.def || 1.0));
    baseSpd = Math.floor(baseSpd * (clsMod.spd || 1.0));

    // 应用装备百分比加成（V6.0/V12.0）
    if (typeof GearSystem !== 'undefined' && GearSystem.getTotalGearBonusPct) {
        const gearPct = GearSystem.getTotalGearBonusPct(entity);
        baseHp  = Math.floor(baseHp  * (1 + (gearPct.hpPct || 0)));
        baseMp  = Math.floor(baseMp  * (1 + (gearPct.mpPct || 0)));
        baseAtk = Math.floor(baseAtk * (1 + (gearPct.atkPct || 0)));
        baseDef = Math.floor(baseDef * (1 + (gearPct.defPct || 0)));
    }

    // V12.0: 多件诅咒叠加——2件诅咒装备/武器则SPD-50%
    if (typeof GearSystem !== 'undefined' && GearSystem.countCursedGear) {
        const curseCount = GearSystem.countCursedGear(entity);
        if (curseCount >= 2) {
            baseSpd = Math.floor(baseSpd * 0.5);
        }
    }

    // V8.0: 应用稀有度加成（基于魔王天数的动态稀有度）
    const rarity = entity.cflag ? (entity.cflag[CFLAGS.HERO_RARITY] || 'N') : 'N';
    const rarityBonus = { N: 1.0, R: 1.1, SR: 1.2, SSR: 1.35, UR: 1.5 };
    const rb = rarityBonus[rarity] || 1.0;
    if (rb > 1.0) {
        baseHp  = Math.floor(baseHp  * rb);
        baseMp  = Math.floor(baseMp  * rb);
        baseAtk = Math.floor(baseAtk * rb);
        baseDef = Math.floor(baseDef * rb);
        baseSpd = Math.floor(baseSpd * rb);
    }

    // 写入属性
    entity.maxbase[0] = baseHp;
    entity.maxbase[1] = baseMp;
    // V10.0: 同步 maxHp / maxMp（很多系统直接读取这两个字段）
    entity.maxHp = baseHp;
    entity.maxMp = baseMp;
    if (entity.hp > entity.maxHp) entity.hp = entity.maxHp;
    if (entity.mp > entity.maxMp) entity.mp = entity.maxMp;
    if (entity.base[0] > entity.maxbase[0]) entity.base[0] = entity.maxbase[0];
    if (entity.base[1] > entity.maxbase[1]) entity.base[1] = entity.maxbase[1];

    // 体力上限（stamina = base[2]）
    let baseStamina = 100 + lv * 5;
    baseStamina = Math.floor(baseStamina * (raceMod.stamina || 1.0));
    baseStamina = Math.floor(baseStamina * (clsMod.stamina || 1.0));
    // V8.0: 稀有度加成也影响体力
    if (rb > 1.0) baseStamina = Math.floor(baseStamina * rb);
    entity.maxbase[2] = baseStamina;
    // 同步体力当前值（如果为0或未设置则初始化为上限）
    if (!entity.base[2] || entity.base[2] <= 0) entity.base[2] = baseStamina;

    entity.cflag[CFLAGS.ATK] = baseAtk;
    entity.cflag[CFLAGS.DEF] = baseDef;
    entity.cflag[CFLAGS.SPD] = baseSpd;
}

// V6.0: 检查并执行自动升级
Game.prototype.checkLevelUp = function(entity) {
    if (!entity) return false;
    const lv = entity.level || 1;
    if (lv >= 200) return false; // 满级

    // 计算当前等级所需EXP
    const needExp = this._calcLevelUpExp(lv);
    const curExp = entity.exp[102] || 0;
    if (curExp < needExp) return false;

    // 检查等级锁
    const nextLockLevel = Math.ceil((lv + 1) / 20) * 20;
    if (lv + 1 >= nextLockLevel && nextLockLevel <= 200) {
        const lockCfg = window.LEVEL_LOCK_CONFIG ? window.LEVEL_LOCK_CONFIG[nextLockLevel] : null;
        if (lockCfg) {
            const badgeId = lockCfg.badgeId;
            if (!this._hasItem(entity, badgeId)) {
                // 卡级：经验保留但不升级
                return false;
            }
        }
    }

    // 执行升级
    entity.exp[102] = curExp - needExp;
    this._levelUpEntity(entity, 1);
    return true;
}

// V6.0: 计算升级所需EXP
Game.prototype._calcLevelUpExp = function(level) {
    // EXP = 50 * level^1.5 * (1 + floor((level-1)/10) * 0.5)
    const spike = 1 + Math.floor((level - 1) / 10) * 0.5;
    return Math.floor(50 * Math.pow(level, 1.5) * spike);
}

// V6.0: 统一升级属性增长
Game.prototype._levelUpEntity = function(entity, levels = 1) {
    if (!entity || levels <= 0) return;
    const oldLevel = entity.level || 1;
    const newLevel = Math.min(200, oldLevel + levels);
    entity.level = newLevel;
    entity.cflag[CFLAGS.BASE_HP] = newLevel;

    // 重新计算全部属性
    this._recalcBaseStats(entity);

    // 恢复满HP/MP（升级奖励）
    entity.hp = entity.maxHp;
    entity.mp = entity.maxMp;

    // V7.0: 等级突破里程碑 + 称号检查
    const milestones = [50, 70, 90, 120, 150, 200];
    for (const m of milestones) {
        if (oldLevel < m && newLevel >= m) {
            this._addAdventureLog(entity, 'level_milestone', `等级突破至${m}级`);
        }
    }
    this._checkTitle(entity);
}

// V6.0: 物品管理辅助方法
Game.prototype._hasItem = function(entity, itemId) {
    if (!entity || !entity.gear || !entity.gear.items) return false;
    return entity.gear.items.some(item => item && item.id === itemId);
}

Game.prototype._giveItem = function(entity, item) {
    if (!entity || !item) return false;
    if (!entity.gear) entity.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
    if (!entity.gear.items) entity.gear.items = [];
    entity.gear.items.push(item);
    return true;
}

Game.prototype._removeItem = function(entity, itemId) {
    if (!entity || !entity.gear || !entity.gear.items) return false;
    const idx = entity.gear.items.findIndex(item => item && item.id === itemId);
    if (idx >= 0) {
        entity.gear.items.splice(idx, 1);
        return true;
    }
    return false;
}

    // V6.0: 旧装备转换为百分比格式
    Game.prototype._migrateOldGear = function(entity) {
        if (!entity || !entity.gear) return;
        const allGear = [
            entity.gear.head, entity.gear.body, entity.gear.legs,
            entity.gear.hands, entity.gear.neck, entity.gear.ring,
            ...(entity.gear.weapons || [])
        ].filter(g => g && g.stats);
        for (const gear of allGear) {
            const stats = gear.stats || {};
            const hasFlat = stats.atk != null || stats.def != null || stats.hp != null || stats.mp != null;
            const hasPct = stats.atkPct != null || stats.defPct != null || stats.hpPct != null || stats.mpPct != null;
            if (!hasFlat || hasPct) continue; // 没有旧格式或已经是新格式

            // 根据稀有度分配百分比
            const rarity = gear.rarity || 1;
            const q = (GearSystem && GearSystem.GEAR_QUALITY_PCT) ? GearSystem.GEAR_QUALITY_PCT[rarity] : null;
            if (!q) continue;

            // 转换：将平面加成映射为百分比
            const newStats = {};
            // 保持原有的槽位特性
            const slot = gear.slot || 'body';
            if (slot === 'weapon') {
                if (stats.atk != null) newStats.atkPct = q.atkPct;
                if (stats.hp != null) newStats.hpPct = Math.round(q.hpPct * 0.3 * 100) / 100;
                if (stats.mp != null) newStats.mpPct = Math.round(q.mpPct * 0.2 * 100) / 100;
            } else if (slot === 'head') {
                if (stats.hp != null) newStats.hpPct = Math.round(q.hpPct * 0.6 * 100) / 100;
                if (stats.mp != null) newStats.mpPct = Math.round(q.mpPct * 0.4 * 100) / 100;
                if (stats.def != null) newStats.defPct = Math.round(q.defPct * 0.3 * 100) / 100;
            } else if (slot === 'body') {
                if (stats.hp != null) newStats.hpPct = q.hpPct;
                if (stats.def != null) newStats.defPct = Math.round(q.defPct * 0.75 * 100) / 100;
            } else if (slot === 'legs') {
                if (stats.hp != null) newStats.hpPct = Math.round(q.hpPct * 0.75 * 100) / 100;
                if (stats.def != null) newStats.defPct = Math.round(q.defPct * 0.5 * 100) / 100;
                if (stats.mp != null) newStats.mpPct = Math.round(q.mpPct * 0.25 * 100) / 100;
            } else if (slot === 'hands') {
                if (stats.atk != null) newStats.atkPct = Math.round(q.atkPct * 0.6 * 100) / 100;
                if (stats.def != null) newStats.defPct = Math.round(q.defPct * 0.4 * 100) / 100;
            } else if (slot === 'neck') {
                if (stats.mp != null) newStats.mpPct = q.mpPct;
                if (stats.hp != null) newStats.hpPct = Math.round(q.hpPct * 0.4 * 100) / 100;
            } else if (slot === 'ring') {
                // 戒指：根据原有加成类型映射
                if (stats.atk != null) newStats.atkPct = q.atkPct;
                else if (stats.def != null) newStats.defPct = q.defPct;
                else if (stats.hp != null) newStats.hpPct = q.hpPct;
                else if (stats.mp != null) newStats.mpPct = q.mpPct;
            }
            gear.stats = newStats;
        }
    }

    // V6.0: 存档兼容性迁移 — 旧存档自动补发徽章、初始化EXP、重算属性
    Game.prototype._migrateV6SaveData = function() {
        const allEntities = [
            ...this.characters,
            ...this.prisoners,
            ...this.invaders
        ];
        for (const entity of allEntities) {
            if (!entity) continue;

            // 1. 初始化 gear.items 数组
            if (!entity.gear) entity.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
            if (!entity.gear.items) entity.gear.items = [];

            // 2. 初始化 exp[102]（总战斗经验）— 旧存档根据等级反推一半经验
            if (!entity.exp[102]) {
                let totalExp = 0;
                for (let lv = 1; lv < (entity.level || 1); lv++) {
                    totalExp += this._calcLevelUpExp(lv);
                }
                // 反推一半经验（假设旧存档角色大约处于当前等级的一半进度）
                entity.exp[102] = Math.floor(totalExp / 2);
            }

            // 3. 为等级已突破锁的角色补发对应徽章
            const lv = entity.level || 1;
            for (const lockLevelStr in window.LEVEL_LOCK_CONFIG) {
                const lockLevel = parseInt(lockLevelStr);
                if (lv >= lockLevel && lockLevel > 0) {
                    const cfg = window.LEVEL_LOCK_CONFIG[lockLevel];
                    if (cfg && !this._hasItem(entity, cfg.badgeId)) {
                        const badgeDef = window.BADGE_DEFS[lockLevel];
                        if (badgeDef) {
                            this._giveItem(entity, {
                                id: badgeDef.id,
                                name: badgeDef.name,
                                icon: badgeDef.icon,
                                type: "badge",
                                badgeType: "promotion",
                                lockLevel: lockLevel,
                                desc: badgeDef.desc,
                                sellPrice: badgeDef.sellPrice
                            });
                        }
                    }
                }
            }

            // 4. 已转职角色补发转职徽章
            if (entity.cflag[CFLAGS.PROMOTED] && !this._hasItem(entity, CFLAGS.CLASS_CHANGE_BADGE)) {
                const cc = window.CLASS_CHANGE_BADGE_DEF;
                if (cc) {
                    this._giveItem(entity, {
                        id: cc.id, name: cc.name, icon: cc.icon,
                        type: "badge", badgeType: "class_change",
                        desc: cc.desc, sellPrice: cc.sellPrice
                    });
                }
            }

            // 5. 旧装备转换为V6.0百分比格式
            this._migrateOldGear(entity);

            // 6. 重新计算属性（应用V6.0统一公式 + 装备百分比）
            this._recalcBaseStats(entity);
            // 确保 HP/MP 不超过最大值
            if (entity.hp > entity.maxHp) entity.hp = entity.maxHp;
            if (entity.mp > entity.maxMp) entity.mp = entity.maxMp;
            if (entity.base[0] > entity.maxbase[0]) entity.base[0] = entity.maxbase[0];
            if (entity.base[1] > entity.maxbase[1]) entity.base[1] = entity.maxbase[1];
        }
    }

    // ========== V7.0: 冒险履历与称号系统 ==========

    Game.prototype._addAdventureLog = function(entity, type, text) {
        if (!entity || !entity.cstr) return;
        const key = CSTRS.ADVENTURE_LOG;
        let data;
        try {
            data = JSON.parse(entity.cstr[key] || '{"logs":[]}');
        } catch { data = { logs: [] }; }
        if (!data.logs) data.logs = [];
        data.logs.push({ day: this.day || 1, type, text });
        if (data.logs.length > 50) data.logs = data.logs.slice(-50);
        entity.cstr[key] = JSON.stringify(data);
    };

    Game.prototype._getAdventureData = function(entity) {
        if (!entity || !entity.cstr) return { logs: [] };
        try {
            return JSON.parse(entity.cstr[CSTRS.ADVENTURE_LOG] || '{"logs":[]}');
        } catch { return { logs: [] }; }
    };

    // ============================================
    // V9.0: 取消洗脑 — 恢复俘虏身份
    // ============================================
    Game.prototype.cancelBrainwash = function(entity) {
        if (!entity) return { success: false, msg: '角色不存在' };
        if (!entity.talent[296]) return { success: false, msg: '该角色未被洗脑' };

        // 1. 移除洗脑状态
        entity.talent[296] = 0;
        entity.cflag[CFLAGS.BRAINWASH_STATUS] = 0;

        // 2. 恢复俘虏状态
        entity.cflag[CFLAGS.CAPTURE_STATUS] = 1;

        // 3. 从 characters 移除，加入 prisoners
        const charaIdx = this.characters.indexOf(entity);
        if (charaIdx >= 0) {
            this.characters.splice(charaIdx, 1);
        }
        if (!this.prisoners.includes(entity)) {
            this.prisoners.push(entity);
        }

        // V12.0: 未鉴定物品回到魔王城自动完成鉴定
        if (typeof GearSystem !== 'undefined' && GearSystem.identifyAllGear) {
            GearSystem.identifyAllGear(entity);
        }

        // 4. 保留 talent[200]（前勇者标记）和调教获得的所有特质/经验
        // 但清除任务状态
        entity.cflag[CFLAGS.SLAVE_TASK_TYPE] = 0;
        entity.cflag[CFLAGS.SLAVE_TASK_FLOOR] = 0;
        entity.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 0;

        // 5. 记录履历
        this._addAdventureLog(entity, 'brainwash_cancel',
            `第${this.day}天 洗脑被取消，恢复俘虏身份`);

        return { success: true, msg: `${entity.name} 的洗脑已取消，已关回监狱` };
    };

    // V9.0: 检查俘虏是否达到 Stage 3 自动转化
    Game.prototype._checkPrisonerAutoConvert = function() {
        const converted = [];
        for (let i = this.prisoners.length - 1; i >= 0; i--) {
            const p = this.prisoners[i];
            if (!p || p.cflag[CFLAGS.CAPTURE_STATUS] !== 1) continue;
            // 检查是否有任何路线达到 Stage 3
            const maxRouteLv = Math.max(...(p.routeLevel || [0]));
            if (maxRouteLv >= 3) {
                const result = this._convertHeroToSlave(p);
                if (result && result.success) {
                    converted.push(p.name);
                    this._addAdventureLog(p, 'auto_convert',
                        `第${this.day}天 调教路线达到 Stage III，自动转化为魔王军`);
                }
            }
        }
        return converted;
    };

    Game.prototype._getTitleStats = function(entity) {
        if (!entity || !entity.cstr) return {};
        try {
            return JSON.parse(entity.cstr[CSTRS.TITLE_STATS] || '{}');
        } catch { return {}; }
    };

    Game.prototype._setTitleStat = function(entity, key, value) {
        if (!entity || !entity.cstr) return;
        const stats = this._getTitleStats(entity);
        stats[key] = value;
        entity.cstr[CSTRS.TITLE_STATS] = JSON.stringify(stats);
    };

    Game.prototype._incrementTitleStat = function(entity, key, delta = 1) {
        if (!entity || !entity.cstr) return;
        const stats = this._getTitleStats(entity);
        stats[key] = (stats[key] || 0) + delta;
        entity.cstr[CSTRS.TITLE_STATS] = JSON.stringify(stats);
    };

    Game.prototype._getSexualRecords = function(entity) {
        if (!entity || !entity.cstr) return {};
        try {
            return JSON.parse(entity.cstr[CSTRS.SEXUAL_RECORDS] || '{}');
        } catch { return {}; }
    };

    Game.prototype._recordSexualFirst = function(entity, recordType, partner, context) {
        if (!entity || !entity.cstr) return false;
        const records = this._getSexualRecords(entity);
        if (records[recordType]) return false;
        records[recordType] = {
            day: this.day || 1,
            partner: (partner && partner.name) ? partner.name : (partner || '未知'),
            type: context || ''
        };
        entity.cstr[CSTRS.SEXUAL_RECORDS] = JSON.stringify(records);
        return true;
    };

    // === NEW: Initialize sexual records on character creation ===
    Game.initSexualRecords = function(entity) {
        if (!entity || !entity.cstr) return;
        // Calculate age
        const level = entity.level || 1;
        const age = Math.max(14, level + 14 + RAND_RANGE(-2, 3));
        entity.cstr[CSTRS.AGE] = String(age);

        const records = Game.prototype._getSexualRecords(entity);
        // Already initialized?
        if (records._initialized) return;

        const isVirgin = entity.talent[0] > 0;
        const isMarried = entity.talent[157] > 0;
        const isMale = entity.talent[122] > 0;

        // Base probabilities (V7.1: most women in this world tend to stay pure)
        let kissChance = 0.20;   // 20% lost初吻
        let penetrationChance = 0.06; // 6% lost初夜
        let analChance = 0.02;   // 2% lost初肛

        if (isVirgin) {
            // Virgin talent: everything intact
            kissChance = 0;
            penetrationChance = 0;
            analChance = 0;
        } else if (isMarried) {
            // Married: more likely but still not guaranteed
            kissChance = 0.65;
            penetrationChance = 0.50;
            analChance = 0.10;
        } else {
            // Unmarried non-virgin: mostly innocent in this setting
            kissChance = 0.20;
            penetrationChance = 0.06;
            analChance = 0.02;
        }

        // Age restrictions (younger = less experience)
        if (age <= 15) {
            penetrationChance = Math.min(penetrationChance, 0.05);
            analChance = 0;
        } else if (age <= 17) {
            penetrationChance = Math.min(penetrationChance, 0.15);
            analChance = Math.min(analChance, 0.02);
        }

        // Generate contextual partner names based on backstory
        const partnerName = Game._generatePastPartnerName(entity, isMarried, isMale, age);

        // If random roll says they lost it, we record pre-game history
        if (RAND(100) < Math.floor(kissChance * 100)) {
            records.firstKiss = { day: 0, partner: partnerName.kiss, type: 'before_capture' };
        }
        if (RAND(100) < Math.floor(penetrationChance * 100)) {
            records.firstPenetration = { day: 0, partner: partnerName.penetration, type: 'before_capture' };
        }
        if (RAND(100) < Math.floor(analChance * 100)) {
            records.firstAnal = { day: 0, partner: partnerName.anal, type: 'before_capture' };
        }

        // Pre-game sexual activity count (very low for most)
        if (records.firstPenetration) {
            records.totalSexCount = RAND(3) + 1; // 1-3 times
            records.sexPartners = [partnerName.penetration];
            records.vaginalCount = records.totalSexCount;
        } else {
            records.totalSexCount = 0;
            records.sexPartners = [];
        }

        records._initialized = true;
        entity.cstr[CSTRS.SEXUAL_RECORDS] = JSON.stringify(records);
    };

    // === Helper: generate contextual past partner names ===
    Game._generatePastPartnerName = function(entity, isMarried, isMale, age) {
        // Name pools for generating partner names
        const maleNames = ['艾伦','雷恩','维克多','亨利','卡尔','卢卡斯','奥利弗','亚瑟','爱德华','弗雷德',
                           '乔治','雨果','伊恩','杰克','凯文','利奥','马克','尼尔','奥斯卡','保罗',
                           '奎因','罗伯特','西蒙','托马斯','尤里','文森特','威廉','泽维尔','亚当','本杰明'];
        const femaleNames = ['艾莉娅','蕾娜','莎拉','米娅','露娜','安娜','伊莉丝','诺艾尔','塞西莉亚','芙兰',
                             '薇奥拉','玛格丽特','夏洛特','爱丽丝','罗莎','缇娜','尤菲','海伦','珍妮','凯特',
                             '莉莉','玛丽','妮娜','奥莉薇亚','佩内洛普','奎拉','瑞秋','索菲','特蕾莎','维奥拉'];

        // Relationship type pools
        const malePartnerTypes = ['丈夫','未婚夫','男友','初恋','青梅竹马','前男友','发小','师兄','教官','师父'];
        const femalePartnerTypes = ['妻子','未婚妻','女友','初恋','青梅竹马','前女友','发小','师姐','教官','师父'];

        const relTypes = isMale ? femalePartnerTypes : malePartnerTypes;
        const namePool = isMale ? femaleNames : maleNames;

        // Default: generic past person
        let kiss = '过去之人';
        let penetration = '过去之人';
        let anal = '过去之人';

        if (isMarried) {
            const spouseName = namePool[RAND(namePool.length)];
            kiss = `丈夫${spouseName}`;
            penetration = `丈夫${spouseName}`;
            anal = `丈夫${spouseName}`;
        } else {
            // Unmarried: choose relationship type based on age and context
            const familyStr = entity.cstr[CSTRS.FAMILY] || '';
            const backstoryStr = entity.cstr[CSTRS.PREVIOUS_LIFE] || '';
            const hasFamily = familyStr.includes('父') || familyStr.includes('母') || familyStr.includes('兄') || familyStr.includes('弟');

            if (age >= 20 && RAND(100) < 30) {
                // Older and experienced: might have had a serious relationship
                const rel = relTypes[RAND(relTypes.length)];
                const name = namePool[RAND(namePool.length)];
                kiss = `${rel}${name}`;
                penetration = `${rel}${name}`;
                anal = `${rel}${name}`;
            } else if (age >= 17 && RAND(100) < 50) {
                // Teen/young adult: likely a childhood friend or first love
                const teenRel = ['初恋','青梅竹马','发小','同学'][RAND(4)];
                const name = namePool[RAND(namePool.length)];
                kiss = `${teenRel}${name}`;
                penetration = `${teenRel}${name}`;
                anal = `${teenRel}${name}`;
            } else if (hasFamily && RAND(100) < 20) {
                // Rare: someone close to family
                const closeRel = ['邻家哥哥','邻家姐姐','家教老师','远房表哥','远房表姐'][RAND(5)];
                const name = namePool[RAND(namePool.length)];
                kiss = `${closeRel}${name}`;
                penetration = `${closeRel}${name}`;
                anal = `${closeRel}${name}`;
            }
        }

        return { kiss, penetration, anal };
    };

    // V7.0: Update squad romance timers (called after _formHeroSquads each day)
    Game.prototype._updateSquadRomanceTimers = function() {
        if (!this.invaders || this.invaders.length < 2) return;
        for (let i = 0; i < this.invaders.length; i++) {
            const hero = this.invaders[i];
            if (hero.hp <= 0) continue;
            const squadId = hero.cflag[CFLAGS.SQUAD_ID];
            if (!squadId) continue;
            for (let j = i + 1; j < this.invaders.length; j++) {
                const other = this.invaders[j];
                if (other.hp <= 0) continue;
                if (other.cflag[CFLAGS.SQUAD_ID] === squadId) {
                    const rel = this._getHeroRelation(hero, other);
                    rel.squadDays = (rel.squadDays || 0) + 1;
                }
            }
        }
    };

    // V7.0: Comprehensive hero relationship system
    // Includes: romance, sworn brotherhood/sisterhood, rivalry, conflict, betrayal
    Game.prototype._processHeroRelationships = function(phase2Queue) {
        if (!this.invaders || this.invaders.length < 2) return;
        const processedPairs = new Set();
        const day = this.day || 1;

        // Build map: for each hero, who are they romantically involved with
        const romanceMap = this._buildSquadRomanceMap();

        for (const hero of this.invaders) {
            if (hero.hp <= 0) continue;
            const squadId = hero.cflag[CFLAGS.SQUAD_ID];
            if (!squadId) continue;
            const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h !== hero && h.hp > 0);

            for (const other of squad) {
                const pairKey = [hero.name, other.name].sort().join('|');
                if (processedPairs.has(pairKey)) continue;
                processedPairs.add(pairKey);

                const rel = this._getHeroRelation(hero, other);

                // 每日事件限制
                if (this._hasTriggeredDailyEvent(hero) || this._hasTriggeredDailyEvent(other)) continue;

                // === 1. Sworn Brotherhood / Sisterhood ===
                if (this._trySwornBrotherhood(hero, other, rel, phase2Queue)) continue;

                // === 2. Romance System ===
                if (this._tryRomance(hero, other, rel, phase2Queue)) continue;

                // === 3. Rivalry (love triangle) ===
                if (this._tryRivalry(hero, other, rel, romanceMap, phase2Queue)) continue;

                // === 4. Conflict (framing, monster lure) ===
                if (this._tryHeroConflict(hero, other, rel, phase2Queue)) continue;

                // === 5. Betrayal (kidnap, assault) ===
                if (this._tryHeroBetrayal(hero, other, rel, phase2Queue)) continue;
            }
        }
    };

    // Build map: heroName -> array of romance partners in same squad
    Game.prototype._buildSquadRomanceMap = function() {
        const map = {};
        for (const hero of this.invaders) {
            if (hero.hp <= 0) continue;
            map[hero.name] = [];
            for (const other of this.invaders) {
                if (other === hero || other.hp <= 0) continue;
                if (hero.cflag[CFLAGS.SQUAD_ID] !== other.cflag[CFLAGS.SQUAD_ID]) continue;
                const rel = this._getHeroRelation(hero, other);
                if (rel.romanceDay !== null) {
                    map[hero.name].push(other.name);
                }
            }
        }
        return map;
    };

    // 1. Sworn Brotherhood / Sisterhood
    Game.prototype._trySwornBrotherhood = function(hero, other, rel, phase2Queue) {
        if (rel.swornDay !== null) return false; // Already sworn
        if (rel.romanceDay !== null) return false; // Already in romance
        if (rel.level < 4) return false; // Need close relation
        const squadDays = rel.squadDays || 0;
        if (squadDays < 15) return false; // Need 15+ squad days
        if (RAND(100) >= 15) return false;

        rel.swornDay = this.day || 1;
        const isMaleH = hero.talent[122] > 0;
        const isMaleO = other.talent[122] > 0;
        rel.swornType = (isMaleH && isMaleO) ? 'brother' : ((!isMaleH && !isMaleO) ? 'sister' : 'sibling');

        this._markDailyEventTriggered(hero);
        this._markDailyEventTriggered(other);

        const typeLabel = rel.swornType === 'brother' ? '义兄弟' : (rel.swornType === 'sister' ? '义姐妹' : '结拜兄妹');
        this._addAdventureLog(hero, 'sworn', `与${other.name}结为${typeLabel}`);
        this._addAdventureLog(other, 'sworn', `与${hero.name}结为${typeLabel}`);
        phase2Queue.push({
            type: 'event', tag: '结拜', tagIcon: '🤝', tagColor: '#4caf50',
            title: `🤝 ${typeLabel}结拜`,
            text: `${hero.name} 与 ${other.name} 在篝火前歃血为盟，结为${typeLabel}……\n（组队${squadDays}天）`
        });
        return true;
    };

    // 2. Romance system (multi-stage)
    Game.prototype._tryRomance = function(hero, other, rel, phase2Queue) {
        if (!this._areHeroesRomanticallyCompatible(hero, other)) return false;
        if (rel.level < 2) return false;

        const squadDays = rel.squadDays || 0;
        const day = this.day || 1;
        const isRomance = rel.romanceDay !== null;
        const isEngaged = rel.engagedDay !== null;
        const isMarried = rel.marriedDay !== null;

        // Stage 1: Confession
        if (!isRomance && rel.level >= 3 && squadDays >= 10 && RAND(100) < 20) {
            rel.romanceDay = day;
            this._setHeroRelation(hero, other, 1, 'romance_confess');
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            this._addAdventureLog(hero, 'romance', `与${other.name}确认了恋爱关系`);
            this._addAdventureLog(other, 'romance', `与${hero.name}确认了恋爱关系`);
            phase2Queue.push({
                type: 'event', tag: '恋爱', tagIcon: '💕', tagColor: '#e91e63',
                title: '💕 勇者之间的告白',
                text: `${hero.name} 与 ${other.name} 在冒险途中互诉衷肠……\n两人确认了恋爱关系。（组队${squadDays}天）`
            });
            return true;
        }

        if (!isRomance) return false;
        const daysSinceRomance = day - rel.romanceDay;

        // Stage 2: First Kiss
        if (rel.kissCount === 0 && daysSinceRomance >= 3 && RAND(100) < 15) {
            rel.kissCount = 1;
            rel.lastIntimacyDay = day;
            this._recordSexualFirst(hero, 'firstKiss', other, 'hero_romance');
            this._recordSexualFirst(other, 'firstKiss', hero, 'hero_romance');
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            this._addAdventureLog(hero, 'romance', `与${other.name}交换了初吻`);
            this._addAdventureLog(other, 'romance', `与${hero.name}交换了初吻`);
            phase2Queue.push({
                type: 'event', tag: '恋爱', tagIcon: '💋', tagColor: '#e91e63',
                title: '💋 初吻',
                text: `${hero.name} 和 ${other.name} 在星空下交换了初吻……\n（恋爱第${daysSinceRomance}天）`
            });
            return true;
        }

        // Stage 3: Caress
        const daysSinceIntimacy = day - rel.lastIntimacyDay;
        if (rel.kissCount > 0 && rel.sexCount === 0 && daysSinceIntimacy >= 3 && RAND(100) < 15) {
            rel.lastIntimacyDay = day;
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            phase2Queue.push({
                type: 'event', tag: '恋爱', tagIcon: '💕', tagColor: '#e91e63',
                title: '💕 亲密的夜晚',
                text: `${hero.name} 和 ${other.name} 在营帐中相拥而眠，彼此的爱抚让心跳加速……\n（恋爱第${daysSinceRomance}天）`
            });
            return true;
        }

        // Stage 4: Sex
        if (rel.sexCount >= 0 && rel.kissCount > 0 && daysSinceIntimacy >= 5 && RAND(100) < 10) {
            rel.sexCount++;
            rel.lastIntimacyDay = day;
            const hasVaginaH = !hero.talent[122] || hero.talent[121];
            const hasPenisH = hero.talent[122] || hero.talent[121];
            const hasVaginaO = !other.talent[122] || other.talent[121];
            const hasPenisO = other.talent[122] || other.talent[121];
            const canVaginal = (hasVaginaH && hasPenisO) || (hasVaginaO && hasPenisH);
            const sexType = canVaginal ? 'vaginal' : 'anal';
            this._recordSexualActivity(hero, other, sexType);
            this._recordSexualActivity(other, hero, sexType);
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            this._addAdventureLog(hero, 'romance', `与${other.name}度过了亲密的夜晚`);
            this._addAdventureLog(other, 'romance', `与${hero.name}度过了亲密的夜晚`);
            phase2Queue.push({
                type: 'event', tag: '亲密', tagIcon: '💋', tagColor: '#e91e63',
                title: '💋 勇者之间的亲密',
                text: `${hero.name} 和 ${other.name} 在营地中度过了激情的夜晚……\n（恋爱第${daysSinceRomance}天，第${rel.sexCount}次）`
            });
            return true;
        }

        // Stage 5: Proposal
        if (!isEngaged && rel.level >= 4 && daysSinceRomance >= 20 && RAND(100) < 15) {
            rel.engagedDay = day;
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            this._addAdventureLog(hero, 'romance', `向${other.name}求婚成功`);
            this._addAdventureLog(other, 'romance', `接受了${hero.name}的求婚`);
            phase2Queue.push({
                type: 'event', tag: '恋爱', tagIcon: '💍', tagColor: '#e91e63',
                title: '💍 求婚',
                text: `${hero.name} 向 ${other.name} 单膝跪地，献上了誓言之戒……\n两人订婚了！（恋爱第${daysSinceRomance}天）`
            });
            return true;
        }

        // Stage 6: Marriage
        if (isEngaged && !isMarried) {
            const daysSinceEngaged = day - rel.engagedDay;
            if (daysSinceEngaged >= 15 && RAND(100) < 20) {
                rel.marriedDay = day;
                hero.talent[157] = 1;
                other.talent[157] = 1;
                this._markDailyEventTriggered(hero);
                this._markDailyEventTriggered(other);
                this._addAdventureLog(hero, 'romance', `与${other.name}结为夫妻`);
                this._addAdventureLog(other, 'romance', `与${hero.name}结为夫妻`);
                phase2Queue.push({
                    type: 'event', tag: '恋爱', tagIcon: '💒', tagColor: '#e91e63',
                    title: '💒 结婚',
                    text: `${hero.name} 和 ${other.name} 在冒险的旅途中举行了简朴的婚礼……\n（订婚第${daysSinceEngaged}天）`
                });
                return true;
            }
        }

        return false;
    };

    // 3. Rivalry / Love Triangle
    Game.prototype._tryRivalry = function(hero, other, rel, romanceMap, phase2Queue) {
        // Check if both are pursuing the same person
        const heroTargets = romanceMap[hero.name] || [];
        const otherTargets = romanceMap[other.name] || [];
        const commonTarget = heroTargets.find(t => otherTargets.includes(t));
        if (!commonTarget) return false;

        // Already rivals? Escalate conflict
        if (rel.rivalTarget === commonTarget) {
            if (RAND(100) < 20) {
                rel.conflictCount++;
                rel.lastConflictDay = this.day || 1;
                this._setHeroRelation(hero, other, -1, 'rival_clash');
                this._markDailyEventTriggered(hero);
                this._markDailyEventTriggered(other);
                phase2Queue.push({
                    type: 'event', tag: '冲突', tagIcon: '⚡', tagColor: 'var(--danger)',
                    title: '⚡ 情敌冲突',
                    text: `${hero.name} 和 ${other.name} 因为争夺${commonTarget}的芳心发生了激烈争吵……\n两人关系恶化了。`
                });
                return true;
            }
            // Eloping event: one steals the partner and runs away
            if (rel.conflictCount >= 3 && rel.level <= 1 && RAND(100) < 10) {
                const targetHero = this.invaders.find(h => h.name === commonTarget);
                if (targetHero && targetHero.hp > 0) {
                    // Find who is currently romancing the target
                    let thief = null;
                    for (const h of this.invaders) {
                        if (h === targetHero || h.hp <= 0) continue;
                        const r = this._getHeroRelation(h, targetHero);
                        if (r.romanceDay !== null) { thief = h; break; }
                    }
                    if (thief) {
                        this._markDailyEventTriggered(hero);
                        this._markDailyEventTriggered(other);
                        this._addAdventureLog(thief, 'romance', `与${targetHero.name}私奔了`);
                        this._addAdventureLog(targetHero, 'romance', `与${thief.name}私奔了`);
                        // Remove both from invaders
                        const idx1 = this.invaders.indexOf(thief);
                        if (idx1 >= 0) this.invaders.splice(idx1, 1);
                        const idx2 = this.invaders.indexOf(targetHero);
                        if (idx2 >= 0) this.invaders.splice(idx2, 1);
                        phase2Queue.push({
                            type: 'event', tag: '私奔', tagIcon: '💔', tagColor: 'var(--danger)',
                            title: '💔 私奔',
                            text: `${thief.name} 和 ${targetHero.name} 趁夜私奔，离开了勇者队伍……\n情敌们的争斗以这种方式收场。`
                        });
                        return true;
                    }
                }
            }
            return false;
        }

        // New rivalry discovered
        if (RAND(100) < 25) {
            rel.rivalTarget = commonTarget;
            rel.conflictCount = 1;
            rel.lastConflictDay = this.day || 1;
            this._setHeroRelation(hero, other, -1, 'rival_discover');
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            phase2Queue.push({
                type: 'event', tag: '冲突', tagIcon: '🔥', tagColor: 'var(--danger)',
                title: '🔥 情敌',
                text: `${hero.name} 发现 ${other.name} 也在追求 ${commonTarget}……\n两人之间产生了微妙的敌意。`
            });
            return true;
        }
        return false;
    };

    // 4. Conflict (framing, monster lure)
    Game.prototype._tryHeroConflict = function(hero, other, rel, phase2Queue) {
        if (rel.level > 1) return false; // Only trigger for hostile relations
        if (rel.conflictCount > 5) return false; // Cap conflicts
        if (RAND(100) >= 15) return false;

        const roll = RAND(100);
        rel.conflictCount++;
        rel.lastConflictDay = this.day || 1;

        if (roll < 30) {
            // Frame: steal items / spread rumors
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            const stolenGold = Math.min(other.gold, 50 + RAND(100));
            other.gold -= stolenGold;
            hero.gold += stolenGold;
            this._setHeroRelation(hero, other, -1, 'frame');
            phase2Queue.push({
                type: 'event', tag: '阴谋', tagIcon: '🕸️', tagColor: 'var(--danger)',
                title: '🕸️ 陷害',
                text: `${hero.name} 散布谣言并窃取了 ${other.name} 的财物（${stolenGold}G）……\n${other.name} 的声誉受损。`
            });
            return true;
        } else if (roll < 60) {
            // Lure monster
            this._markDailyEventTriggered(hero);
            this._markDailyEventTriggered(other);
            const dmg = Math.floor(other.maxHp * 0.2);
            other.hp = Math.max(1, other.hp - dmg);
            this._setHeroRelation(hero, other, -1, 'monster_lure');
            phase2Queue.push({
                type: 'event', tag: '陷阱', tagIcon: '👹', tagColor: 'var(--danger)',
                title: '👹 诱敌',
                text: `${hero.name} 故意将强大魔物引向 ${other.name} 的营地……\n${other.name} 受到${dmg}点伤害！`
            });
            return true;
        }
        return false;
    };

    // 5. Betrayal (kidnap, assault on rival's partner)
    Game.prototype._tryHeroBetrayal = function(hero, other, rel, phase2Queue) {
        if (rel.level > 0) return false; // Only for enemies (level <= 0)
        if (rel.conflictCount < 3) return false; // Need enough conflict history
        if (RAND(100) >= 8) return false; // Very rare

        // Find other's partner (romance partner)
        let partner = null;
        for (const h of this.invaders) {
            if (h === other || h.hp <= 0) continue;
            const r = this._getHeroRelation(other, h);
            if (r.romanceDay !== null) { partner = h; break; }
        }

        if (!partner) return false;

        const roll = RAND(100);
        rel.conflictCount++;

        if (roll < 50) {
            // Kidnap
            this._markDailyEventTriggered(hero);
            this._addAdventureLog(hero, 'betrayal', `绑架了${partner.name}`);
            this._addAdventureLog(partner, 'betrayal', `被${hero.name}绑架`);
            const idx = this.invaders.indexOf(partner);
            if (idx >= 0) this.invaders.splice(idx, 1);
            phase2Queue.push({
                type: 'event', tag: '背叛', tagIcon: '⛓️', tagColor: 'var(--danger)',
                title: '⛓️ 绑架',
                text: `${hero.name} 趁夜色绑架了 ${partner.name}……\n${other.name} 的伴侣消失了！`
            });
            return true;
        } else {
            // Assault
            this._markDailyEventTriggered(hero);
            this._recordSexualFirst(partner, 'firstPenetration', hero, 'assault');
            this._recordSexualActivity(partner, hero, 'vaginal');
            partner.talent[0] = 0; // Remove virginity
            this._addAdventureLog(hero, 'betrayal', `侵犯了${partner.name}`);
            this._addAdventureLog(partner, 'betrayal', `被${hero.name}侵犯`);
            phase2Queue.push({
                type: 'event', tag: '背叛', tagIcon: '💀', tagColor: 'var(--danger)',
                title: '💀 侵犯',
                text: `${hero.name} 对 ${partner.name} 犯下了不可饶恕的罪行……\n这是对 ${other.name} 最残酷的报复。`
            });
            return true;
        }
    };

    // Check if two heroes are romantically compatible
    Game.prototype._areHeroesRomanticallyCompatible = function(a, b) {
        const isMaleA = a.talent[122] > 0;
        const isMaleB = b.talent[122] > 0;
        const isGayA = a.talent[158] > 0 || a.talent[81] > 0; // 同性恋或双性恋
        const isGayB = b.talent[158] > 0 || b.talent[81] > 0;
        // Same sex: need at least one to be gay/bi
        if (isMaleA === isMaleB) {
            return isGayA || isGayB;
        }
        // Opposite sex: compatible by default
        return true;
    };

    Game.prototype._checkTitle = function(entity) {
        if (!entity || !entity.cstr) return;
        const stats = this._getTitleStats(entity);
        const isHeroSide = !entity.talent || !entity.talent[200];
        const newTitle = this._evaluateTitle(entity, stats, isHeroSide);
        let oldTitle = entity.cstr[CFLAGS.CURRENT_TITLE];
        // Defensive: clean corrupted JSON data that may have leaked into CURRENT_TITLE slot
        if (oldTitle && typeof oldTitle === 'string' && (oldTitle.startsWith('{') || oldTitle.startsWith('['))) {
            console.warn('[Game._checkTitle] Detected corrupted oldTitle for', entity.name, ':', oldTitle.substring(0, 80));
            // Try to recover: if it looks like sexual records, move to correct slot
            try {
                const parsed = JSON.parse(oldTitle);
                if (parsed && (parsed.firstKiss || parsed.firstPenetration || parsed.firstAnal)) {
                    const existing = this._getSexualRecords(entity);
                    if (!existing._initialized) {
                        entity.cstr[CSTRS.SEXUAL_RECORDS] = oldTitle;
                        console.warn('[Game._checkTitle] Recovered sexual records moved to correct slot for', entity.name);
                    }
                }
            } catch {}
            oldTitle = '';
            entity.cstr[CFLAGS.CURRENT_TITLE] = '';
        }
        if (newTitle && newTitle !== oldTitle) {
            entity.cstr[CFLAGS.CURRENT_TITLE] = newTitle;
            // V10.0: 称号声望重平衡 — 基础10-20，进阶100-200
            const fameGain = !oldTitle
                ? 10 + RAND(11)  // 首次获得：10-20
                : 100 + RAND(101); // 升级：100-200
            entity.fame = (entity.fame || 0) + fameGain;
            this._addAdventureLog(entity, 'title_gained',
                `获得称号「${newTitle}」${oldTitle ? '(升级自「' + oldTitle + '」)' : ''}，声望+${fameGain}`);
        }
    };

    Game.prototype._evaluateTitle = function(entity, stats, isHeroSide) {
        const level = entity.level || 1;
        const prefixPool = isHeroSide
            ? window.HERO_TITLE_PREFIXES.filter(p => level >= p.minLv && level <= p.maxLv)
            : window.SLAVE_TITLE_PREFIXES.filter(p => level >= p.minLv && level <= p.maxLv);
        const prefixEntry = prefixPool.length > 0 ? prefixPool[prefixPool.length - 1] : null;
        const prefix = prefixEntry ? prefixEntry.names[RAND(prefixEntry.names.length)] : '';

        const dimensions = [
            { score: level, pool: isHeroSide ? window.HERO_LEVEL_SUFFIXES : window.SLAVE_LEVEL_SUFFIXES },
            { score: stats.eliteKills || 0, pool: isHeroSide ? window.HERO_ELITE_SUFFIXES : window.SLAVE_ELITE_SUFFIXES },
            { score: stats.bossKills || 0, pool: isHeroSide ? window.HERO_BOSS_SUFFIXES : window.SLAVE_BOSS_SUFFIXES },
            { score: stats.heroKills || 0, pool: isHeroSide ? window.HERO_HERO_SUFFIXES : window.SLAVE_HERO_SUFFIXES },
            { score: stats.squadCount || 0, pool: isHeroSide ? window.HERO_SQUAD_SUFFIXES : null },
            { score: stats.betrayalCount || 0, pool: isHeroSide ? null : window.SLAVE_BETRAYAL_SUFFIXES },
            { score: stats.trainCount || 0, pool: isHeroSide ? null : window.SLAVE_TRAIN_SUFFIXES },
            { score: stats.exheroEncounters || 0, pool: isHeroSide ? null : window.SLAVE_EXHERO_SUFFIXES },
        ];

        let bestDim = null;
        let bestThreshold = -1;
        for (const dim of dimensions) {
            if (!dim.pool) continue;
            const unlocked = dim.pool.filter(s => dim.score >= s.threshold);
            const top = unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
            if (top && top.threshold > bestThreshold) {
                bestThreshold = top.threshold;
                bestDim = top;
            }
        }

        const suffix = bestDim ? bestDim.name : (isHeroSide ? '勇者' : '仆从');
        return prefix + suffix;
    };

window.Game = Game;

