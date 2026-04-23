/**
 * Training System — Command execution + Source calculation
 * Design: each command has its own execute method
 */
class TrainSystem {
    constructor(game) {
        this.game = game;
    }

    execute(comId) {
        const target = this.game.getTarget();
        const master = this.game.getMaster();
        if (!target) return;

        const def = TRAIN_DEFS[comId];
        if (!def) return;

        // 0. 记录执行前状态快照
        const before = this._snapState(target);
        const beforeMarks = [...target.mark];

        UI.appendText(`\n──── ${def.name} [#${this.game.trainCount + 1}] ────\n`);

        // 1. Narration: action description (TRAIN_MESSAGE_B)
        this.game.dialogueSystem.narrateAction(target, master, comId);

        // 2. Dialogue: character lines (KOJO_MESSAGE_COM)
        this.game.dialogueSystem.onCommand(target, comId);

        // 3. Source calculation
        switch (def.category) {
            case "caress": this._execCaress(comId, target, master); break;
            case "tool": this._execTool(comId, target, master); break;
            case "vagina": this._execVagina(comId, target, master); break;
            case "anal": this._execAnal(comId, target, master); break;
            case "service": this._execService(comId, target, master); break;
            case "sm": this._execSM(comId, target, master); break;
            case "item": this._execItem(comId, target, master); break;
            case "assistant": this._execAssistant(comId, target, master); break;
            case "cosmetic": this._execCosmetic(comId, target, master); break;
            case "rough": this._execRough(comId, target, master); break;
            case "special": this._execSpecial(comId, target, master); break;
            case "monster": this._execMonster(comId, target, master); break;
            case "free": this._execFree(comId, target, master); break;
            case "arena": this._execArena(comId, target, master); break;
            default:
                this._execDefault(comId, target, master);
        }

        // === 素质效果修正 ===
        this._applyTalentEffects(target);

        // === 相性修正：魔王与目标之间的相性差影响调教效果 (+/-15%) ===
        this._applyAffinityEffect(target, master);

        // === NEW (P2/P3): Part-based orgasm system ===
        this._applyPartBasedSystem(comId, target, master);

        // 4. Post-process (SOURCE -> PALAM, climax/mark checks)
        this._postProcess(target, master);

        // 5. Narration: result description (TRAIN_MESSAGE_A)
        this.game.dialogueSystem.narrateResult(target, comId);

        // 6. 显示训练结果变化面板
        this._showResultPanel(target, before, beforeMarks, def);

        // 7. 实时检查自动素质获取（技能Lv+EXP达标时立即获得）
        const newTalents = this.game.checkAutoTalents(target);
        for (const t of newTalents) {
            UI.appendText(`【素质觉醒】${target.name}获得了「${t.name}」！\n`, "accent");
        }

        // 8. 魔王调教经验+1
        this.game.masterExp++;
    }

    // 记录角色状态快照
    _snapState(target) {
        return {
            hp: target.hp,
            mp: target.mp,
            stamina: target.stamina,
            energy: target.energy,
            palam: [...target.palam],
            exp: [...target.exp],
            mark: [...target.mark],
            tequip: [...target.tequip],
            partGauge: target.partGauge ? [...target.partGauge] : [],
            totalOrgasmGauge: target.totalOrgasmGauge || 0,
            chargeLevel: target.chargeLevel || 0
        };
    }

    // 显示训练结果变化面板
    _showResultPanel(target, before, beforeMarks, def) {
        const lines = [];

        // --- 体力/气力变化 ---
        const hpDelta = target.hp - before.hp;
        const mpDelta = target.mp - before.mp;
        const stmDelta = (target.stamina || target.base[2]) - (before.stamina || before.hp);
        const nrgDelta = (target.energy || 0) - (before.energy || 0);
        if (hpDelta !== 0 || mpDelta !== 0 || stmDelta !== 0 || nrgDelta !== 0) {
            const parts = [];
            if (hpDelta !== 0) parts.push(`体力${hpDelta > 0 ? '+' : ''}${hpDelta}`);
            if (stmDelta !== 0 && stmDelta !== hpDelta) parts.push(`STM${stmDelta > 0 ? '+' : ''}${stmDelta}`);
            if (mpDelta !== 0) parts.push(`MP${mpDelta > 0 ? '+' : ''}${mpDelta}`);
            if (nrgDelta !== 0) parts.push(`气力${nrgDelta > 0 ? '+' : ''}${nrgDelta}`);
            lines.push(`[体力] ${parts.join('  ')}`);
        }

        // --- 部位快感变化 ---
        const partCodes = ['C','V','A','B','N','O','W','P'];
        const partNames = ['阴核','阴道','肛门','乳房','乳头','口腔','子宫','阴茎'];
        const partChanges = [];
        if (target.partGauge && before.partGauge) {
            for (let i = 0; i < 8; i++) {
                const delta = (target.partGauge[i] || 0) - (before.partGauge[i] || 0);
                if (delta !== 0) partChanges.push(`${partCodes[i]}${delta > 0 ? '+' : ''}${delta}`);
            }
        }
        if (partChanges.length > 0) {
            lines.push(`[快感] ${partChanges.join(' ')}`);
        }

        // --- 绝顶槽/蓄力变化 ---
        const gaugeDelta = (target.totalOrgasmGauge || 0) - (before.totalOrgasmGauge || 0);
        const chargeDelta = (target.chargeLevel || 0) - (before.chargeLevel || 0);
        if (gaugeDelta !== 0 || chargeDelta !== 0) {
            const parts = [];
            if (gaugeDelta !== 0) parts.push(`绝顶槽${gaugeDelta > 0 ? '+' : ''}${gaugeDelta}%`);
            if (chargeDelta !== 0) parts.push(`蓄力C${target.chargeLevel || 0}`);
            lines.push(`[高潮] ${parts.join(' ')}`);
        }

        // --- PALAM变化 (只显示有定义且变化>0的) ---
        const palamChanges = [];
        for (let i = 0; i < target.palam.length; i++) {
            const delta = target.palam[i] - before.palam[i];
            if (delta > 0 && PALAM_DEFS[i]) {
                palamChanges.push(`${PALAM_DEFS[i].name}+${delta}`);
            }
        }
        if (palamChanges.length > 0) {
            lines.push(`[参数] ${palamChanges.join('  ')}`);
        }

        // --- EXP变化 ---
        const expChanges = [];
        for (let i = 0; i < target.exp.length; i++) {
            const delta = target.exp[i] - before.exp[i];
            if (delta > 0 && EXP_DEFS[i]) {
                expChanges.push(`${EXP_DEFS[i].name}+${delta}`);
            }
        }
        if (expChanges.length > 0) {
            lines.push(`[经验] ${expChanges.join('  ')}`);
        }

        // --- 刻印变化 ---
        const markChanges = [];
        for (let i = 0; i < target.mark.length; i++) {
            const delta = target.mark[i] - beforeMarks[i];
            if (delta > 0 && MARK_DEFS[i]) {
                markChanges.push(`${MARK_DEFS[i].name} Lv.${target.mark[i]}`);
            }
        }
        if (markChanges.length > 0) {
            lines.push(`[刻印] ${markChanges.join('  ')}`);
        }

        // --- TEQUIP变化 ---
        const tequipChanges = [];
        for (let i = 0; i < target.tequip.length; i++) {
            const beforeVal = before.tequip[i] || 0;
            const afterVal = target.tequip[i] || 0;
            if (beforeVal !== afterVal) {
                const name = this._getTequipName(i);
                if (name) {
                    tequipChanges.push(afterVal > 0 ? `${name} 装备` : `${name} 解除`);
                }
            }
        }
        if (tequipChanges.length > 0) {
            lines.push(`[状态] ${tequipChanges.join('  ')}`);
        }

        // 更新右侧结果区
        const resultContent = document.getElementById('train-result-content');
        if (resultContent) {
            if (lines.length > 0) {
                const htmlLines = lines.map(l => `<div style="margin-bottom:3px;line-height:1.5;">${l.replace(/\[(.+?)\]/g, '<span style="color:var(--accent);font-size:0.75rem;">[$1]</span>')}</div>`).join('');
                resultContent.innerHTML = `<div style="font-size:0.78rem;color:var(--text);">第${this.game.trainCount + 1}回 ${def.name}</div>` + htmlLines;
            } else {
                resultContent.innerHTML = '<span style="color:var(--text-dim);">本次没有明显变化</span>';
            }
        }
    }

    // TEQUIP索引→名称映射
    _getTequipName(idx) {
        const map = {
            10: "眼罩", 11: "绳索", 12: "口球", 13: "肛门蠕虫",
            14: "阴蒂夹", 15: "乳头夹", 16: "搾乳器", 17: "淋浴",
            19: "肛门珠", 20: "润滑液", 21: "媚药", 22: "利尿剂",
            46: "灌肠+栓", 47: "束缚装", 49: "肛门电极",
            54: "野外play", 57: "羞耻play", 58: "浴室play", 59: "新婚play",
            85: "放尿状态", 87: "穿环", 90: "触手召唤", 110: "穿衣状态"
        };
        return map[idx] || null;
    }

    // ========== Caress (0-9) ==========
    _execCaress(comId, target, master) {
        const reactions = {
            0: `${target.name}的肌肤因接触而泛起红潮，呼吸逐渐变得急促……`,
            1: `${target.name}的秘处微微颤抖，爱液顺着大腿内侧缓缓流出……`,
            2: `${target.name}的肛门因陌生的触感而紧张收缩，发出细微的呻吟……`,
            3: `${target.name}羞耻得满脸通红，手指却不由自主地加快了速度……`,
            4: `${target.name}的口腔被填满，唾液顺着嘴角滑落，眼神逐渐迷离……`,
            5: `${target.name}的乳头因刺激而挺立，胸口剧烈起伏着……`,
            6: `${target.name}的舌头被动地回应着，身体逐渐软化在吻中……`,
            7: `${target.name}羞耻地别过脸去，私处却因暴露而微微湿润……`,
            8: `${target.name}的阴道内壁紧紧地缠绕着侵入的手指，体温不断攀升……`,
            9: `${target.name}因肛门被舔舐而浑身颤抖，羞耻与快感交织在一起……`,
            122: `${target.name}的秘唇被龟头摩擦得充血肿胀，发出难耐的喘息……`,
            135: `${target.name}自己舔舐着自己的秘处，淫靡的水声在房间中回响……`
        };
        UI.appendText((reactions[comId] || `${target.name}的身体做出了反应……`) + "\n");

        const cSens = target.abl[0];
        const vSens = target.abl[2];
        const bSens = target.abl[1];
        const aSens = target.abl[3];
        const tech = master.abl[12] || 1;

        let cGain = 0, vGain = 0, bGain = 0, aGain = 0, love = 0, pain = 0, fear = 0, shame = 0;

        switch (comId) {
            case 0: // Caress
                cGain = RAND_RANGE(10, 30) + cSens * 5 + tech * 3;
                bGain = RAND_RANGE(5, 15) + bSens * 3;
                love = RAND_RANGE(5, 10);
                break;
            case 1: // Cunnilingus
                cGain = RAND_RANGE(30, 60) + cSens * 8 + tech * 5;
                love = RAND_RANGE(5, 15);
                if (!target.hasTalent(61)) target.addPalam(11, RAND_RANGE(5, 15)); // Disgust
                break;
            case 2: // Anal caress
                aGain = RAND_RANGE(10, 30) + aSens * 5;
                pain = RAND_RANGE(5, 15);
                target.addPalam(11, RAND_RANGE(10, 20));
                break;
            case 3: // Masturbation
                cGain = RAND_RANGE(20, 50) + cSens * 10;
                shame = RAND_RANGE(15, 30);
                target.addExp(10, 1);
                break;
            case 4: // Fellatio (master receiving)
                target.addPalam(5, RAND_RANGE(10, 20));
                target.addExp(22, 1);
                break;
            case 5: // Breast caress
                bGain = RAND_RANGE(20, 40) + bSens * 8;
                break;
            case 6: // Kiss
                target.addPalam(5, RAND_RANGE(10, 20));
                love = RAND_RANGE(10, 20);
                break;
            case 7: // Spread pussy
                cGain = RAND_RANGE(5, 15) + cSens * 2;
                shame = RAND_RANGE(20, 40);
                target.addPalam(11, RAND_RANGE(5, 10));
                if (!target.hasTalent(36)) target.addPalam(8, shame); // Shame
                break;
            case 8: // Finger insertion
                if (target.hasTalent(0)) {
                    UI.appendText(`【${target.name}是处女！】\n`);
                    pain += 50;
                    fear += 30;
                    target.addPalam(11, 50);
                }
                vGain = RAND_RANGE(20, 40) + vSens * 5;
                break;
            case 9: // Anal licking
                aGain = RAND_RANGE(15, 35) + aSens * 4;
                target.addPalam(11, RAND_RANGE(10, 20));
                if (!target.hasTalent(61)) target.addPalam(11, RAND_RANGE(5, 10));
                break;
            case 122: // 龟头顶住
                cGain = RAND_RANGE(20, 40) + cSens * 6;
                target.addPalam(5, RAND_RANGE(10, 20));
                break;
            case 135: // 自我舔阴
                cGain = RAND_RANGE(30, 60) + cSens * 10;
                shame = RAND_RANGE(30, 60);
                target.addExp(10, 1);
                target.addPalam(11, RAND_RANGE(10, 20));
                break;
        }

        target.addSource(0, cGain);
        target.addSource(1, vGain);
        target.addSource(2, aGain);
        target.addSource(3, bGain);
        target.addSource(17, love);  // Yield
        target.addSource(16, pain);  // Pain
        target.addSource(15, fear);  // Fear
        target.addSource(8, shame);  // Shame

        target.hp -= RAND_RANGE(10, 20);
        master.hp -= RAND_RANGE(5, 10);
    }

    // ========== Tools (10-19) ==========
    _execTool(comId, target, master) {
        const reactions = {
            10: `${target.name}的阴蒂在振动下剧烈颤抖，腰部不受控制地向上挺起……`,
            11: `${target.name}的阴道深处被振动杖刺激着，淫液大量涌出……`,
            12: `${target.name}的肛门被蠕虫侵入，肠壁因异物感而不断收缩……`,
            13: `${target.name}的阴蒂被夹子夹住，敏感的突起因持续的压迫而充血……`,
            14: `${target.name}的乳头被夹子夹紧，乳尖挺立成诱人的形状……`,
            15: `${target.name}的乳房被搾乳器不断吸吮，乳汁从乳头中渗出……`,
            16: `${target.name}看着飞机杯被使用，脸上泛起复杂的红晕……`,
            17: `${target.name}的身体被水流冲刷着，皮肤泛起一层诱人的粉红色……`,
            18: `${target.name}的肛门一颗颗吞入珠子，肠壁紧紧包裹着异物……`,
            19: `${target.name}的肛门被珠子撑开又收缩，强烈的排泄感让身体痉挛……`
        };
        UI.appendText((reactions[comId] || `${target.name}对道具产生了反应……`) + "\n");

        let cGain = 0, vGain = 0, bGain = 0, aGain = 0, pain = 0;
        const cSens = target.abl[0];
        const vSens = target.abl[2];
        const bSens = target.abl[1];
        const aSens = target.abl[3];

        switch (comId) {
            case 10: // Vibrating jewel
                cGain = RAND_RANGE(30, 60) + cSens * 10;
                break;
            case 11: // Vibrating wand (vibrator)
                vGain = RAND_RANGE(40, 70) + vSens * 10;
                target.addPalam(3, RAND_RANGE(20, 40)); // Lubrication
                break;
            case 12: // Anal worm
                if (target.tequip[13]) {
                    target.tequip[13] = 0;
                    UI.appendText(`${target.name}体内的蠕虫被取出了……\n`);
                } else {
                    aGain = RAND_RANGE(30, 60) + aSens * 8;
                    pain = RAND_RANGE(10, 25);
                    target.tequip[13] = 1;
                }
                break;
            case 13: // Clitoris cap
                if (target.tequip[14]) {
                    target.tequip[14] = 0;
                    UI.appendText(`${target.name}的阴蒂夹被取下了……\n`);
                } else {
                    target.tequip[14] = 1;
                    cGain = RAND_RANGE(25, 50) + cSens * 8;
                }
                break;
            case 14: // Nipple cap
                if (target.tequip[15]) {
                    target.tequip[15] = 0;
                    UI.appendText(`${target.name}的乳头夹被取下了……\n`);
                } else {
                    target.tequip[15] = 1;
                    bGain = RAND_RANGE(20, 40) + bSens * 6;
                }
                break;
            case 15: // Milking machine
                if (target.tequip[16]) {
                    target.tequip[16] = 0;
                    UI.appendText(`${target.name}的搾乳器被取下了……\n`);
                } else {
                    target.tequip[16] = 1;
                    bGain = RAND_RANGE(30, 50) + bSens * 8;
                    if (target.hasTalent(130)) {
                        target.addExp(54, 1); // Milk spray exp
                        UI.appendText(`乳汁从${target.name}的胸部流出……\n`);
                    }
                }
                break;
            case 16: // Onahole
                target.addPalam(5, RAND_RANGE(10, 20));
                target.addExp(22, 1);
                break;
            case 17: // Shower
                if (target.tequip[17]) {
                    target.tequip[17] = 0;
                    UI.appendText(`${target.name}的淋浴关掉了……\n`);
                } else {
                    target.tequip[17] = 1;
                    cGain = RAND_RANGE(10, 25) + cSens * 3;
                    target.addPalam(3, RAND_RANGE(30, 50)); // Water as lubrication
                }
                break;
            case 18: // Anal beads
                target.tequip[19] = 1;
                aGain = RAND_RANGE(30, 60) + aSens * 8;
                pain = RAND_RANGE(15, 30);
                break;
            case 19: // Anal beads (pulling)
                if (target.tequip[19]) {
                    aGain = RAND_RANGE(50, 100) + aSens * 12;
                    pain = RAND_RANGE(20, 40);
                    target.tequip[19] = 0;
                    UI.appendText(`珠子被一颗颗拉出……\n`);
                } else {
                    aGain = RAND_RANGE(30, 60) + aSens * 8;
                    pain = RAND_RANGE(15, 30);
                    target.tequip[19] = 1;
                }
                break;
        }

        target.addSource(0, cGain);
        target.addSource(1, vGain);
        target.addSource(2, aGain);
        target.addSource(3, bGain);
        target.addSource(16, pain);
        target.hp -= RAND_RANGE(15, 25);
    }

    // ========== Vaginal (20-24) ==========
    _execVagina(comId, target, master) {
        if (target.hasTalent(123)) {
            UI.appendText(`【${target.name}是无穴扶她，无法进行阴道性交。】\n`);
            return;
        }
        if (target.hasTalent(0)) {
            UI.appendText(`【${target.name}失去了处女！】\n`);
            target.removeTalent(0);
            target.cstr[3] = master.name; // First experience partner
        }

        const reactions = {
            20: `${target.name}的阴道被完全贯穿，小腹因冲击而不断收缩......`,
            21: `${target.name}的背部被压住，私处从后方被深深地贯穿，发出悲鸣般的喘息......`,
            22: `${target.name}的身体被抱在怀中，面对面的交合让面容残存在视野中......`,
            23: `${target.name}背对着主人坐下，私处从下方被顶起，只能无力地捂住嘴巴忍耐......`,
            24: `${target.name}跨坐在主人身上，腰肢狂野地起伏，不断追求更深的快感......`
        };
        UI.appendText((reactions[comId] || `${target.name}的身体因性交而颤抖......`) + "\n");

        const vSens = target.abl[2];
        const tech = master.abl[14] || 1;
        let vGain = RAND_RANGE(50, 100) + vSens * 15 + tech * 5;
        let lust = RAND_RANGE(30, 60);
        let yield_ = RAND_RANGE(10, 30);

        // Position modifiers
        if (comId === 22 || comId === 23) {
            vGain += RAND_RANGE(10, 20); // Sitting positions deeper
            yield_ += RAND_RANGE(5, 10);
        }
        if (comId === 24) {
            yield_ += RAND_RANGE(10, 20); // Reverse rape more yielding
            lust += RAND_RANGE(10, 20);
        }

        let bGain = 0, cGain = 0, pain = 0, shame = 0, love = 0;

        switch (comId) {
            case 120: // 插入G点刺激
                vGain += RAND_RANGE(30, 60) + vSens * 8;
                cGain = RAND_RANGE(15, 30) + target.abl[0] * 4;
                break;
            case 121: // 插入子宫口刺激
                vGain += RAND_RANGE(40, 80) + vSens * 10;
                pain = RAND_RANGE(10, 30);
                target.addPalam(11, RAND_RANGE(5, 15));
                break;
            case 128: // 正常位・接吻
                love = RAND_RANGE(15, 30);
                target.addPalam(5, RAND_RANGE(10, 20));
                break;
            case 129: // 正常位・胸爱抚
                bGain = RAND_RANGE(20, 40) + target.abl[1] * 5;
                break;
            case 130: // 正常位SP
                vGain += RAND_RANGE(30, 60);
                lust += RAND_RANGE(20, 40);
                break;
            case 131: // 后背位・胸爱抚
                bGain = RAND_RANGE(20, 40) + target.abl[1] * 5;
                vGain += RAND_RANGE(10, 20);
                break;
            case 132: // 后背位・打屁股
                pain = RAND_RANGE(20, 40);
                target.addExp(30, 1);
                break;
            case 133: // 站立后背位
                shame = RAND_RANGE(20, 40);
                vGain += RAND_RANGE(10, 20);
                break;
            case 134: // 后背位SP
                vGain += RAND_RANGE(30, 60);
                lust += RAND_RANGE(20, 40);
                break;
        }

        target.addSource(0, cGain);
        target.addSource(1, vGain);
        target.addSource(3, bGain);
        target.addSource(5, lust);
        target.addSource(16, pain);
        target.addSource(8, shame);
        target.addSource(17, yield_ + love);
        target.addExp(0, 1); // V exp
        target.addExp(4, 1); // Intercourse exp
        target.hp -= RAND_RANGE(30, 50);
        master.hp -= RAND_RANGE(20, 40);

        this._checkPregnancy(target, master);
    }

    // ========== Anal (25-29) ==========
    _execAnal(comId, target, master) {
        const reactions = {
            25: `${target.name}自己坐下将肉棒吞入肛门，脸上浮现出痛苦与满足交织的表情......`,
            26: `${target.name}的肛门被从正面贯穿，紧张的肠壁因异物的侵入而不断收缩......`,
            27: `${target.name}的臀部被撞击得发红，肛门因反复的抽送而失去了抗拒的力气......`,
            28: `${target.name}的身体被紧紧抱住，肛门被顶入的同时脸上泛起羞耻的红晕......`,
            29: `${target.name}背对着主人，肛门被深深地贯穿，只能无力地用手撑住地面......`
        };
        UI.appendText((reactions[comId] || `${target.name}的肛门因侵犯而颤抖......`) + "\n");

        const aSens = target.abl[3];
        const tech = master.abl[14] || 1;
        let aGain = RAND_RANGE(40, 80) + aSens * 12 + tech * 3;
        let pain = RAND_RANGE(20, 40);
        let lust = RAND_RANGE(10, 25);

        // Position modifiers
        if (comId === 25) {
            lust += RAND_RANGE(10, 20);
            pain -= RAND_RANGE(5, 10); // Self-control reduces pain
        }
        if (comId === 28 || comId === 29) {
            aGain += RAND_RANGE(10, 20);
            pain += RAND_RANGE(5, 10);
        }

        // Lubrication check
        if (target.palam[3] < 1000 && target.tequip[20] === 0) {
            pain += RAND_RANGE(20, 40);
            UI.appendText(`太干燥了……${target.name}痛苦不堪。\n`);
        }

        target.addSource(2, aGain);
        target.addSource(5, lust);
        target.addSource(16, pain);
        target.addSource(17, RAND_RANGE(5, 15));
        target.addExp(1, 1); // A exp
        target.hp -= RAND_RANGE(30, 50);
        master.hp -= RAND_RANGE(20, 40);
    }

    // ========== Service (30-38) ==========
    _execService(comId, target, master) {
        const reactions = {
            30: `${target.name}的手指缠绕着肉棒，熟练地上下撸动着……`,
            31: `${target.name}的口腔被填满，唾液顺着嘴角滑落，眼神逐渐迷离......`,
            32: `${target.name}的乳房夹紧肉棒，乳沟间传来的摩`,
            33: `${target.name}用大腿夹住摩擦……`,
            34: `${target.name}骑在${master.name}身上侍奉……`,
            35: `${target.name}将身体涂满泡沫，淫靡地贴在${master.name}身上滑动……`,
            36: `${target.name}骑在${master.name}身上，坚定地进行着肛交……`,
            37: `${target.name}将舌头压在${master.name}的肛门上，顺从地舔舐着……`,
            38: `${target.name}用脚侍奉了${master.name}……`
        };
        UI.appendText((reactions[comId] || `${target.name}的身体因侍奉而颤抖......`) + "\n");

        const sTech = target.abl[13] || 0;
        const cSens = target.abl[0];
        const bSens = target.abl[1];
        const aSens = target.abl[3];
        let cGain = 0, bGain = 0, aGain = 0, yield_ = 0, learn = 0;

        switch (comId) {
            case 30: // Handjob
                yield_ = RAND_RANGE(10, 25) + sTech * 3;
                learn = RAND_RANGE(10, 20);
                break;
            case 31: // Fellatio
                yield_ = RAND_RANGE(15, 30) + sTech * 4;
                cGain = RAND_RANGE(5, 15) + cSens * 2;
                learn = RAND_RANGE(15, 25);
                target.addExp(22, 1);
                break;
            case 32: // Paizuri
                yield_ = RAND_RANGE(15, 30) + sTech * 4;
                bGain = RAND_RANGE(10, 25) + bSens * 3;
                learn = RAND_RANGE(10, 20);
                target.addExp(35, 1); // B exp
                break;
            case 33: // Sumata
                yield_ = RAND_RANGE(10, 25) + sTech * 3;
                cGain = RAND_RANGE(10, 20) + cSens * 3;
                learn = RAND_RANGE(10, 20);
                break;
            case 34: // Cowgirl
                yield_ = RAND_RANGE(20, 35) + sTech * 4;
                cGain = RAND_RANGE(15, 30) + cSens * 4;
                target.addExp(4, 1); // Intercourse exp
                break;
            case 35: // Foam dance
                yield_ = RAND_RANGE(15, 30) + sTech * 3;
                cGain = RAND_RANGE(10, 20) + cSens * 3;
                bGain = RAND_RANGE(10, 20) + bSens * 3;
                target.addPalam(3, RAND_RANGE(50, 100)); // Soap + water
                break;
            case 36: // Cowgirl anal
                yield_ = RAND_RANGE(15, 30) + sTech * 3;
                aGain = RAND_RANGE(20, 40) + aSens * 5;
                pain = RAND_RANGE(10, 25);
                target.addExp(1, 1); // A exp
                break;
            case 37: // Anal service (rimming)
                yield_ = RAND_RANGE(10, 20) + sTech * 2;
                aGain = RAND_RANGE(5, 15);
                target.addPalam(11, RAND_RANGE(10, 20));
                break;
            case 38: // Footjob
                yield_ = RAND_RANGE(10, 25) + sTech * 3;
                learn = RAND_RANGE(10, 20);
                break;
            case 123: // 乳交口交
                yield_ = RAND_RANGE(20, 40) + sTech * 5;
                bGain = RAND_RANGE(15, 30) + bSens * 4;
                cGain = RAND_RANGE(5, 15) + cSens * 2;
                target.addExp(22, 1);
                target.addExp(35, 1);
                break;
            case 125: // 口交自慰
                yield_ = RAND_RANGE(15, 30) + sTech * 4;
                cGain = RAND_RANGE(20, 50) + cSens * 8;
                target.addExp(22, 1);
                target.addExp(10, 1);
                break;
            case 126: // 手淫口交
                yield_ = RAND_RANGE(20, 40) + sTech * 5;
                cGain = RAND_RANGE(5, 15) + cSens * 2;
                learn = RAND_RANGE(15, 25);
                target.addExp(22, 1);
                break;
        }

        target.addSource(0, cGain);
        target.addSource(2, aGain);
        target.addSource(3, bGain);
        target.addSource(17, yield_);
        target.addSource(19, learn);
        target.hp -= RAND_RANGE(10, 20);
        master.hp -= RAND_RANGE(15, 30);

        // 骑乘位侍奉也包含阴道插入
        if (comId === 34) {
            this._checkPregnancy(target, master);
        }
    }

    // ========== SM (40-49) ==========
    _execSM(comId, target, master) {
        const msgs = {
            40: `${master.name}让${target.name}趴在自己膝上，手掌重重地落在臀肉上……`,
            41: `${master.name}用鞭子抽打了${target.name}……`,
            42: `${master.name}用针刺了${target.name}……`,
            43: `${master.name}给${target.name}戴上了眼罩……`,
            44: `${master.name}用绳索绑住了${target.name}……`,
            45: `${master.name}给${target.name}戴上了口球……`,
            46: `${master.name}向${target.name}的肠道灌入温热的液体，并用栓子堵住……`,
            47: `${master.name}将${target.name}装入束缚装中……`,
            48: `${master.name}踩踏了${target.name}……`,
            49: `${master.name}将电极接在${target.name}的肛门上，释放出电脉冲……`
        };
        UI.appendText((msgs[comId] || "进行了SM行为。") + "\n");

        let pain = RAND_RANGE(20, 50);
        let fear = RAND_RANGE(10, 30);
        let mGain = 0;
        let shame = 0;

        switch (comId) {
            case 40: // Spanking
                pain = RAND_RANGE(20, 40);
                shame = RAND_RANGE(10, 20);
                break;
            case 41: // Whip
                pain = RAND_RANGE(40, 80);
                fear += RAND_RANGE(10, 20);
                break;
            case 42: // Needle
                pain = RAND_RANGE(60, 120);
                fear += RAND_RANGE(20, 40);
                target.addPalam(11, RAND_RANGE(20, 40));
                break;
            case 43: // Blindfold
                if (target.tequip[10]) {
                    target.tequip[10] = 0;
                    UI.appendText(`${target.name}的眼罩被摘下了……\n`);
                } else {
                    target.tequip[10] = 1;
                    fear += 20;
                    shame += RAND_RANGE(10, 20);
                    target.addExp(81, 1); // 洗脑经验+1
                }
                break;
            case 44: // Rope
                if (target.tequip[11]) {
                    target.tequip[11] = 0;
                    UI.appendText(`${target.name}身上的绳索被解开了……\n`);
                } else {
                    target.tequip[11] = 1;
                    pain += RAND_RANGE(10, 20);
                    fear += RAND_RANGE(10, 20);
                    target.addExp(51, 1); // Bondage exp
                }
                break;
            case 45: // Ball gag
                if (target.tequip[12]) {
                    target.tequip[12] = 0;
                    UI.appendText(`${target.name}的口球被取下了……\n`);
                } else {
                    target.tequip[12] = 1;
                    fear += 30;
                    shame += RAND_RANGE(15, 25);
                    target.addExp(81, 1); // 洗脑经验+1
                }
                break;
            case 46: // Enema + plug
                if (target.tequip[46]) {
                    target.tequip[46] = 0;
                    UI.appendText(`${target.name}体内的液体和栓子被排出了……\n`);
                    target.addPalam(8, RAND_RANGE(30, 60));
                    target.addPalam(11, RAND_RANGE(20, 40));
                } else {
                    target.tequip[46] = 1;
                    pain = RAND_RANGE(30, 60);
                    shame = RAND_RANGE(30, 60);
                    target.addPalam(11, RAND_RANGE(20, 40));
                    target.addExp(31, 1); // Urination exp
                }
                break;
            case 47: // Bondage suit
                if (target.tequip[47]) {
                    target.tequip[47] = 0;
                    UI.appendText(`${target.name}从束缚装中被释放出来……\n`);
                } else {
                    target.tequip[47] = 1;
                    pain = RAND_RANGE(10, 30);
                    shame = RAND_RANGE(20, 40);
                    fear += RAND_RANGE(10, 20);
                    target.addExp(51, 1);
                    target.addExp(81, 1); // 洗脑经验+1
                }
                break;
            case 48: // Trampling
                pain = RAND_RANGE(30, 60);
                shame = RAND_RANGE(15, 30);
                break;
            case 49: // Anal electrode
                if (target.tequip[49]) {
                    target.tequip[49] = 0;
                    UI.appendText(`${target.name}身上的电极被拆除了……\n`);
                } else {
                    target.tequip[49] = 1;
                    pain = RAND_RANGE(40, 80);
                    fear += RAND_RANGE(20, 40);
                    target.addSource(2, RAND_RANGE(20, 50) + target.abl[3] * 5); // 电击带来的A快感
                }
                break;
        }

        // Masochism pleasure
        const mSens = target.abl[21];
        if (mSens > 0) {
            mGain = Math.floor(pain * (mSens * 0.2));
            UI.appendText(`(被虐快感：${mGain})\n`);
        }

        target.addSource(16, pain);
        target.addSource(15, fear);
        target.addSource(8, shame);
        target.addSource(2, mGain);
        target.addExp(30, 1); // Masochistic pleasure exp
        target.hp -= RAND_RANGE(20, 40);
    }

    // ========== Items / Special (50-59) ==========
    _execItem(comId, target, master) {
        // 消耗型道具的物品ID映射
        const consumableMap = { 50: 20, 51: 21, 52: 22, 53: 53 };
        const itemId = consumableMap[comId];
        if (itemId !== undefined && (this.game.item[itemId] || 0) <= 0) {
            UI.appendText(`道具不足！无法使用${TRAIN_DEFS[comId]?.name || ''}。\n`);
            return;
        }
        if (itemId !== undefined) {
            this.game.item[itemId]--;
        }

        switch (comId) {
            case 50: // Lotion
                UI.appendText(`${master.name}在${target.name}身上涂了润滑液……\n`);
                target.tequip[20] = 1;
                target.addPalam(3, RAND_RANGE(200, 400));
                target.addSource(17, RAND_RANGE(5, 10));
                break;
            case 51: // Aphrodisiac
                UI.appendText(`${master.name}让${target.name}服下了媚药……\n`);
                target.tequip[21] = 1;
                target.addPalam(5, 200); // Lust surge
                target.addPalam(0, RAND_RANGE(50, 100));
                target.addPalam(3, RAND_RANGE(100, 200));
                break;
            case 52: // Diuretic
                UI.appendText(`${master.name}让${target.name}服下了利尿剂……\n`);
                target.tequip[22] = 1;
                target.addPalam(11, RAND_RANGE(10, 20));
                target.addExp(31, 1);
                break;
            case 53: // Crystal ball
                UI.appendText(`${master.name}让${target.name}在水晶球中看到自己的倒影……\n`);
                target.addPalam(8, RAND_RANGE(30, 60)); // Shame
                target.addPalam(11, RAND_RANGE(10, 20));
                break;
            case 54: // Outdoor play
                UI.appendText(`${master.name}将${target.name}带到户外的开放空气中……\n`);
                target.tequip[54] = 1;
                target.addPalam(8, RAND_RANGE(40, 80)); // Shame
                target.addPalam(11, RAND_RANGE(10, 30));
                if (target.hasTalent(89)) { // Exhibitionist
                    target.addPalam(5, RAND_RANGE(30, 60));
                    target.addSource(17, RAND_RANGE(10, 20));
                }
                break;
            case 55: // Do nothing
                UI.appendText(`${master.name}什么都没做，只是带着意味深长的微笑看着${target.name}……\n`);
                target.addPalam(11, RAND_RANGE(5, 15));
                target.addPalam(10, RAND_RANGE(5, 15)); // Fear
                break;
            case 56: // Conversation
                UI.appendText(`${master.name}与${target.name}轻声交谈，话语中暗藏深意……\n`);
                target.addSource(17, RAND_RANGE(20, 40));
                target.addSource(19, RAND_RANGE(10, 20));
                target.addExp(73, 1); // Conversation exp
                break;
            case 57: // Humiliation play
                UI.appendText(`${master.name}将${target.name}摆成羞耻的姿势……\n`);
                target.tequip[57] = 1;
                target.addPalam(8, RAND_RANGE(50, 100));
                target.addPalam(11, RAND_RANGE(10, 30));
                target.addSource(17, RAND_RANGE(10, 20));
                break;
            case 58: // Bath play
                UI.appendText(`${master.name}将${target.name}带到了浴室……\n`);
                target.tequip[58] = 1;
                target.addPalam(3, RAND_RANGE(100, 200));
                target.hp += RAND_RANGE(10, 20); // 恢复少量体力
                target.addSource(17, RAND_RANGE(10, 20));
                break;
            case 59: // Newlywed play
                UI.appendText(`${master.name}与${target.name}玩起了新婚角色扮演……\n`);
                target.tequip[59] = 1;
                target.addPalam(5, RAND_RANGE(20, 40));
                target.addSource(17, RAND_RANGE(20, 40));
                target.addSource(19, RAND_RANGE(10, 20));
                break;
        }
    }

    // ========== Assistant (60-71) ==========
    _execAssistant(comId, target, master) {
        const assi = this.game.getAssi();
        const assiName = assi ? assi.name : "Assistant";
        const tName = target.name;
        const mName = master.name;

        const msgs = {
            60: `${assiName}深深吻上了${tName}，舌头交缠在一起……`,
            61: `${mName}强迫${tName}为${assiName}舔阴……`,
            62: `${mName}在${tName}的眼前侵犯了${assiName}……`,
            63: `${tName}与${assiName}将秘处贴在一起摩擦着……`,
            64: `${mName}和${assiName}从两端同时侵犯了${tName}……`,
            65: `${mName}让${assiName}侵犯${tName}，自己在一旁观看……`,
            66: `${tName}同时将${mName}和${assiName}含入口中……`,
            67: `${tName}给${assiName}足交，脚趾缠绕着肉棒……`,
            68: `${tName}用嘴同时侍奉着${mName}和${assiName}……`,
            69: `${tName}与${assiName}以六九式交缠在一起，双方的嘴都没闲着……`,
            70: `${tName}与${assiName}同时用大腿夹住${mName}摩擦……`,
            71: `${tName}与${assiName}同时用胸部夹住${mName}摩擦……`
        };
        UI.appendText((msgs[comId] || `${assiName}也参与了调教……`) + "\n");

        let yield_ = RAND_RANGE(15, 30);
        let cGain = 0, vGain = 0, aGain = 0, bGain = 0;
        const aTech = assi ? (assi.abl[13] || 0) : 0;

        switch (comId) {
            case 60: // Kiss assistant
                cGain = RAND_RANGE(5, 15);
                yield_ += RAND_RANGE(5, 10);
                break;
            case 61: // Force cunnilingus on assistant
                cGain = RAND_RANGE(10, 25);
                target.addPalam(11, RAND_RANGE(10, 20));
                break;
            case 62: // Violate assistant
                vGain = RAND_RANGE(20, 40);
                if (assi) assi.addExp(4, 1);
                break;
            case 63: // Tribadism
                cGain = RAND_RANGE(20, 40) + target.abl[0] * 5;
                yield_ += RAND_RANGE(10, 20);
                target.addExp(40, 1); // Yuri exp
                break;
            case 64: // 3P
                vGain = RAND_RANGE(40, 80) + target.abl[2] * 10;
                cGain = RAND_RANGE(10, 25);
                target.addExp(4, 2);
                break;
            case 65: // Make assistant violate target
                vGain = RAND_RANGE(30, 60) + target.abl[2] * 8;
                aGain = RAND_RANGE(10, 25) + target.abl[3] * 3;
                yield_ += RAND_RANGE(10, 20);
                target.addExp(4, 1);
                break;
            case 66: // Two-penis fellatio
                cGain = RAND_RANGE(10, 20);
                yield_ += RAND_RANGE(15, 30);
                target.addExp(22, 1);
                break;
            case 67: // Footjob assistant
                yield_ += RAND_RANGE(10, 20);
                break;
            case 68: // Double fellatio
                cGain = RAND_RANGE(10, 20);
                yield_ += RAND_RANGE(15, 30);
                target.addExp(22, 1);
                break;
            case 69: // Sixty-nine
                cGain = RAND_RANGE(20, 40) + target.abl[0] * 5;
                yield_ += RAND_RANGE(15, 30);
                target.addExp(22, 1);
                break;
            case 70: // Double sumata
                cGain = RAND_RANGE(15, 30) + target.abl[0] * 4;
                yield_ += RAND_RANGE(15, 30);
                break;
            case 71: // Double paizuri
                bGain = RAND_RANGE(15, 30) + target.abl[1] * 4;
                yield_ += RAND_RANGE(15, 30);
                target.addExp(35, 1);
                break;
        }

        target.addSource(0, cGain);
        target.addSource(1, vGain);
        target.addSource(2, aGain);
        target.addSource(3, bGain);
        target.addSource(17, yield_);
        target.hp -= RAND_RANGE(15, 30);
        if (assi) assi.hp -= RAND_RANGE(10, 20);

        // 助手协助的阴道性交也可能导致怀孕
        if ([62, 64, 65].includes(comId)) {
            this._checkPregnancy(target, master);
        }
    }

    // ========== Default ==========
    _execDefault(comId, target, master) {
        UI.appendText(`执行了指令 ${comId}。\n`);
        target.addSource(0, RAND_RANGE(10, 30));
        target.hp -= 10;
    }

    // ========== 怀孕判定 ==========
    _checkPregnancy(target, master) {
        if (!target) return;
        // 只有女性或有穴扶她能怀孕
        if (target.talent[122] || target.talent[123]) return;
        if (target.talent[153]) return; // 已经怀孕
        // 基础概率 15%，容易怀孕 +10%，母性 +5%
        let rate = 15;
        if (target.talent[152]) rate += 10; // 容易怀孕
        if (target.talent[188]) rate += 5;  // 母性
        if (target.talent[42]) rate += 5;   // 容易湿
        if (target.talent[70]) rate += 5;   // 接受快感
        if (target.talent[153]) return; // 已怀孕
        if (RAND(100) < rate) {
            target.talent[153] = 1;
            target.cflag[800] = 0; // 怀孕天数
            UI.appendText(`【${target.name}的体内被注入了精液……似乎怀孕了。】\n`);
        }
    }

    // ========== TEQUIP持续性效果 ==========
    _applyTequipEffects(target) {
        const s = target.source;
        // 眼罩: 羞耻减少, 恐惧增加
        if (target.tequip[10]) {
            s[8] = Math.floor((s[8] || 0) * 0.7); // 羞耻-30%
            s[10] = Math.floor((s[10] || 0) * 1.2 + 10); // 恐惧+20%
        }
        // 绳索: 羞耻/屈服/疼痛增加
        if (target.tequip[11]) {
            s[8] = Math.floor((s[8] || 0) * 1.2 + 20); // 羞耻+20%
            s[6] = Math.floor((s[6] || 0) * 1.15 + 15); // 屈服+15%
            s[16] = Math.floor((s[16] || 0) * 1.1 + 10); // 疼痛+10%
        }
        // 口球: 羞耻增加
        if (target.tequip[12]) {
            s[8] = Math.floor((s[8] || 0) * 1.15 + 10);
        }
        // 肛门蠕虫: 持续A快感
        if (target.tequip[13]) {
            s[2] = Math.floor((s[2] || 0) + 20 + target.abl[3] * 3);
        }
        // 阴蒂夹: 持续C快感
        if (target.tequip[14]) {
            s[0] = Math.floor((s[0] || 0) + 20 + target.abl[0] * 3);
        }
        // 乳头夹: 持续B快感
        if (target.tequip[15]) {
            s[3] = Math.floor((s[3] || 0) + 15 + target.abl[1] * 2);
        }
        // 淋浴: 润滑增加
        if (target.tequip[17]) {
            target.addPalam(3, 50);
            s[8] = Math.floor((s[8] || 0) + 10);
        }
        // 肛门珠: 持续A快感
        if (target.tequip[19]) {
            s[2] = Math.floor((s[2] || 0) + 15 + target.abl[3] * 2);
        }
        // 润滑液: 大幅润滑
        if (target.tequip[20]) {
            target.addPalam(3, 200);
            if (s[16] && s[2] > 0) s[16] = Math.floor(s[16] * 0.7); // 肛门疼痛减轻
        }
        // 媚药: 全部快感+30% (C/V/A/B快感)
        if (target.tequip[21]) {
            s[0] = Math.floor((s[0] || 0) * 1.3);
            s[1] = Math.floor((s[1] || 0) * 1.3);
            s[2] = Math.floor((s[2] || 0) * 1.3);
            s[3] = Math.floor((s[3] || 0) * 1.3); // B快感(source[3]→palam[14])
        }
        // 利尿剂: 羞耻增加
        if (target.tequip[22]) {
            s[8] = Math.floor((s[8] || 0) + 20);
        }
        // 野外play: 羞耻+50%
        if (target.tequip[54]) {
            s[8] = Math.floor((s[8] || 0) * 1.5 + 30);
            s[15] = Math.floor((s[15] || 0) + 20);
        }
        // 羞耻play: 羞耻+80%
        if (target.tequip[57]) {
            s[8] = Math.floor((s[8] || 0) * 1.8 + 50);
            s[17] = Math.floor((s[17] || 0) + 20);
        }
        // 浴室play: 体力恢复效果，疼痛减轻
        if (target.tequip[58]) {
            if (s[16] && s[16] > 0) s[16] = Math.floor(s[16] * 0.7);
            target.addPalam(3, 100);
        }
        // 新婚play: 欲情/屈服增加
        if (target.tequip[59]) {
            s[5] = Math.floor((s[5] || 0) + 30);
            s[17] = Math.floor((s[17] || 0) + 20);
        }
        // 触手: 持续全部位快感
        if (target.tequip[90]) {
            s[0] = Math.floor((s[0] || 0) + 15 + target.abl[0] * 2);
            s[1] = Math.floor((s[1] || 0) + 15 + target.abl[2] * 2);
            s[2] = Math.floor((s[2] || 0) + 15 + target.abl[3] * 2);
            s[3] = Math.floor((s[3] || 0) + 10 + target.abl[1] * 2);
            s[15] = Math.floor((s[15] || 0) + 20);
        }
        // 束缚装: 大幅限制+羞耻/屈服/疼痛
        if (target.tequip[47]) {
            s[8] = Math.floor((s[8] || 0) * 1.3 + 30);
            s[6] = Math.floor((s[6] || 0) * 1.2 + 20);
            s[16] = Math.floor((s[16] || 0) * 1.15 + 15);
        }
    }

    // ========== Part-based Orgasm System (P2/P3) ==========
    _applyPartBasedSystem(comId, target, master) {
        const meta = (typeof getTrainMeta === 'function') ? getTrainMeta(comId) : null;
        if (!meta || !meta.stimulatedParts || meta.stimulatedParts.length === 0) return;

        // 1. Apply part gains
        const stimulatedIdx = [];
        for (const code of meta.stimulatedParts) {
            const idxMap = { C: 0, V: 1, A: 2, B: 3, N: 4, O: 5, W: 6, P: 7 };
            const idx = idxMap[code.toUpperCase()];
            if (idx === undefined) continue;
            stimulatedIdx.push(idx);

            // Base value from palam source (if any) or default
            let baseValue = 50; // default per-part gain
            const palamMap = { C: 0, V: 1, A: 2, B: 14, N: 14, O: 15, W: 1, P: 0 };
            const palamId = palamMap[code.toUpperCase()];
            if (palamId !== undefined && target.source) {
                const srcVal = target.source[palamId] || 0;
                baseValue = Math.max(30, Math.floor(srcVal * 0.5));
            }

            // Apply personality/energy multiplier
            const energyMult = target.getEnergyMultiplier ? target.getEnergyMultiplier() : 1.0;
            let finalValue = Math.floor(baseValue * energyMult);

            // Sensitivity multipliers
            if (target._sensitivityMultipliers && target._sensitivityMultipliers[idx]) {
                finalValue = Math.floor(finalValue * target._sensitivityMultipliers[idx]);
            }

            target.addPartGain(idx, finalValue);

            // Penis ejaculation gauge (for P part or linked parts)
            if (target.genitalConfig && target.genitalConfig.penises && target.genitalConfig.penises.length > 0) {
                if (typeof addPenisEjaculationGauge === 'function') {
                    addPenisEjaculationGauge(target, code, Math.floor(finalValue * 0.3));
                }
            }
        }

        // 2. Multi-part synergy bonus
        const n = stimulatedIdx.length;
        let synergy = 1.0;
        if (n >= 5) synergy = 1.35;
        else if (n >= 4) synergy = 1.25;
        else if (n >= 3) synergy = 1.20;
        else if (n >= 2) synergy = 1.10;
        if (synergy > 1.0) {
            for (const idx of stimulatedIdx) {
                const bonus = Math.floor((target.partGauge[idx] || 0) * (synergy - 1.0));
                target.addPartGain(idx, bonus);
            }
        }

        // 3. Decay unstimulated parts
        target.decayUnstimulatedParts(stimulatedIdx);

        // 4. Calculate total gauge
        if (typeof calculateTotalGauge === 'function') calculateTotalGauge(target);

        // 5. Check orgasm
        if (typeof checkOrgasm === 'function') {
            const orgasmResult = checkOrgasm(target);
            if (orgasmResult && orgasmResult.canClimax) {
                // 6. Check ejaculation
                let ejaculated = false;
                if (typeof checkEjaculation === 'function') {
                    const ejResults = checkEjaculation(target);
                    if (ejResults && ejResults.length > 0) {
                        ejaculated = true;
                        if (typeof applyEjaculation === 'function') {
                            const ejMsgs = applyEjaculation(target, ejResults);
                            for (const m of ejMsgs) UI.appendText(m + "\n", "accent");
                        }
                    }
                }

                // 7. Sync pleasure (orgasm + ejaculation simultaneously)
                if (ejaculated && orgasmResult.combo) {
                    UI.appendText(`【\u540c\u6b65\u5feb\u611f\uff01\u5feb\u4e50\u500d\u7387x2.5】\n`, "accent");
                    orgasmResult.multiplier = (orgasmResult.multiplier || 1.0) * 2.5;
                }

                // 8. Apply orgasm
                if (typeof applyOrgasm === 'function') {
                    const result = applyOrgasm(target, orgasmResult);
                    if (result && result.msg) UI.appendText(result.msg + "\n", "accent");
                    if (result && result.riskTriggered && result.riskType === "ultimate_awakening") {
                        target.talent[291] = 1; // 全觉之体
                    }
                }

                // Dialogue trigger
                if (this.game.dialogueSystem) this.game.dialogueSystem.onPalamCng(target, "climax");
            }
        }

        // 9. Apply stamina/energy costs from meta
        target.stamina = (target.stamina || target.base[2] || 0) - (meta.staminaCost?.target || 0);
        target.energy = (target.energy || 0) - (meta.energyCost?.target || 0);

        // 10. Route EXP gain (post-train will also give bulk, this is per-command bonus)
        for (let r = 0; r < 5; r++) {
            const val = (meta.routeTags && meta.routeTags[['obedience','desire','pain','shame','dominance'][r]]) || 0;
            if (val > 0 && target.addRouteExp) {
                target.addRouteExp(r, val);
            }
        }
    }

    // ========== Post-process ==========
    _postProcess(target, master) {
        // 先应用TEQUIP持续性效果
        this._applyTequipEffects(target);

        // Apply SOURCE to PALAM (使用映射转换)
        for (let i = 0; i < target.source.length; i++) {
            if (target.source[i] > 0) {
                const palamId = SOURCE_TO_PALAM[i];
                if (palamId !== undefined && palamId >= 0) {
                    target.addPalam(palamId, target.source[i]);
                }
            }
        }

        // Check climax
        const cPleasure = target.palam[0];
        const vPleasure = target.palam[1];
        const aPleasure = target.palam[2];
        const bPleasure = target.palam[14];
        const mPleasure = target.palam[15]; // M pleasure

        const climaxTypes = [];
        if (cPleasure > 10000) climaxTypes.push("C");
        if (vPleasure > 10000) climaxTypes.push("V");
        if (aPleasure > 10000) climaxTypes.push("A");
        if (bPleasure > 10000) climaxTypes.push("B");
        if (mPleasure > 10000) climaxTypes.push("M");

        if (climaxTypes.length > 0) {
            const typeStr = climaxTypes.join("+");
            UI.appendText(`\n★ ${target.name}达到了${typeStr}绝顶！\n`);
            target.addExp(2, climaxTypes.length); // Climax exp
            if (cPleasure > 10000) target.addPalam(0, -5000);
            if (vPleasure > 10000) target.addPalam(1, -5000);
            if (aPleasure > 10000) target.addPalam(2, -5000);
            if (bPleasure > 10000) target.addPalam(14, -5000);
            if (mPleasure > 10000) target.addPalam(15, -5000);
            target.hp -= RAND_RANGE(20, 40);
            if (this.game.dialogueSystem) this.game.dialogueSystem.onPalamCng(target, "climax");

            // === 射精判定（有阴茎的角色绝顶时射精） ===
            if (target.talent[121] || target.talent[122]) {
                UI.appendText(`【${target.name}射精了！】\n`);
                target.addExp(3, climaxTypes.length); // 射精经验
                if (target.talent[1]) {
                    target.removeTalent(1);
                    UI.appendText(`【${target.name}失去了童贞……】\n`);
                }
            }
        }

        // ========== 自然湿润计算 ==========
        // 情欲活动产生的快感自然转化为阴部湿润，无需依赖外部润滑剂
        const pleasureSum = (target.source[0] || 0) + (target.source[1] || 0) +
                            (target.source[2] || 0) + (target.source[3] || 0) +
                            (target.source[4] || 0) + (target.source[5] || 0);
        if (pleasureSum > 0) {
            // 基础湿润 = 快感总量的6% + 欲望等级×8
            let wetGain = Math.floor(pleasureSum * 0.06 + (target.abl[11] || 0) * 8);
            // 绝顶状态额外湿润
            if (climaxTypes.length > 0) wetGain = Math.floor(wetGain * 1.5);
            // 素质修正
            if (target.talent[42]) wetGain = Math.floor(wetGain * 2.0); // 容易湿
            if (target.talent[43]) wetGain = Math.floor(wetGain * 0.3); // 不易湿
            // 已有润滑液时自然分泌减少
            if (target.tequip[20]) wetGain = Math.floor(wetGain * 0.1);
            target.addPalam(3, wetGain);
            // 低湿润状态下进行V/A相关活动时显示提示
            if (wetGain >= 30 && target.palam[3] < 1500 && !target.tequip[20]) {
                if ((target.source[1] || 0) > 0 || (target.source[2] || 0) > 0) {
                    UI.appendText(`【自然湿润】${target.name}的私处因情欲而湿润了……(+${wetGain})\n`);
                }
            }
        }

        // Check mark acquisition
        if (target.palam[9] > 5000 && target.mark[0] < 3) { // Pain -> Pain mark
            if (RAND(3) === 0) {
                target.addMark(0, 1);
                UI.appendText(`【${target.name}获得了苦痛刻印 Lv.${target.mark[0]}】\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "pain_lv" + target.mark[0]);
            }
        }
        if (target.palam[5] > 8000 && target.mark[1] < 3) { // Lust -> Pleasure mark
            if (RAND(3) === 0) {
                target.addMark(1, 1);
                UI.appendText(`【${target.name}获得了快乐刻印 Lv.${target.mark[1]}】\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "pleasure_lv" + target.mark[1]);
            }
        }
        if (target.palam[6] > 6000 && target.mark[2] < 3) { // Yield -> Yield mark
            if (RAND(3) === 0) {
                target.addMark(2, 1);
                UI.appendText(`【${target.name}获得了屈服刻印 Lv.${target.mark[2]}】\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "yield_lv" + target.mark[2]);
            }
        }

        // Clear source after application
        target.source.fill(0);
    }

    // ========== Cosmetic (72-73) ==========
    _execCosmetic(comId, target, master) {
        const msgs = {
            72: `${master.name}仔细地剃去了${target.name}的阴毛……`,
            73: `${master.name}为${target.name}梳理了发型，改变了形象……`
        };
        UI.appendText((msgs[comId] || "进行了美容整形。") + "\n");

        if (comId === 72) {
            target.tequip[72] = 1; // Shaved
            target.addPalam(8, RAND_RANGE(20, 40)); // Shame
            target.addSource(17, RAND_RANGE(5, 15));
        } else if (comId === 73) {
            target.tequip[73] = 1; // 发型已改变
            target.addPalam(8, RAND_RANGE(10, 20));
            target.addSource(17, RAND_RANGE(5, 10));
            target.addSource(19, RAND_RANGE(10, 20));
        }
        target.hp -= RAND_RANGE(5, 10);
    }

    // ========== Rough / Extreme (80-90) ==========
    _execRough(comId, target, master) {
        const msgs = {
            80: `${master.name}抓住${target.name}的头，将阳具深深插入喉咙……`,
            81: `${master.name}将整只拳头塞入了${target.name}的阴道……`,
            82: `${master.name}将拳头推入了${target.name}的肛门……`,
            83: `${master.name}同时将双手塞入${target.name}的前后两穴……`,
            84: `${master.name}从内部压迫着${target.name}的G点……`,
            85: `${target.name}忍不住释放出一股尿液……`,
            87: `${master.name}用穿环刺穿了${target.name}的身体……`,
            90: `${master.name}强行贯穿了${target.name}的乳头……`
        };
        UI.appendText((msgs[comId] || "进行了极端行为。") + "\n");

        let pain = RAND_RANGE(30, 60);
        let fear = RAND_RANGE(20, 50);
        let cGain = 0, vGain = 0, aGain = 0, bGain = 0;
        const vSens = target.abl[2];
        const aSens = target.abl[3];
        const cSens = target.abl[0];

        switch (comId) {
            case 80: // Deep throat / Iruma
                cGain = RAND_RANGE(20, 40) + cSens * 4;
                pain = RAND_RANGE(30, 60);
                target.addExp(22, 1);
                target.addPalam(11, RAND_RANGE(20, 40));
                break;
            case 81: // Vaginal fisting
                if (target.hasTalent(123)) {
                    UI.appendText(`【${target.name}是无穴扶她，无法进行阴道拳交。】\n`);
                    break;
                }
                if (target.hasTalent(0)) {
                    UI.appendText(`【${target.name}是处女！痛苦难以想象！】\n`);
                    pain += 100;
                }
                vGain = RAND_RANGE(60, 120) + vSens * 15;
                pain = RAND_RANGE(50, 100);
                target.addExp(52, 1); // V expansion exp
                target.addPalam(11, RAND_RANGE(30, 60));
                break;
            case 82: // Anal fisting
                aGain = RAND_RANGE(50, 100) + aSens * 12;
                pain = RAND_RANGE(60, 120);
                target.addExp(53, 1); // A expansion exp
                target.addPalam(11, RAND_RANGE(30, 60));
                break;
            case 83: // Both-hole fisting
                if (target.hasTalent(0)) {
                    pain += 80;
                }
                vGain = RAND_RANGE(40, 80) + vSens * 10;
                aGain = RAND_RANGE(40, 80) + aSens * 10;
                pain = RAND_RANGE(80, 150);
                target.addExp(52, 1);
                target.addExp(53, 1);
                target.addPalam(11, RAND_RANGE(50, 100));
                target.addExp(5, 1); // Abnormal exp
                break;
            case 84: // G-spot torture
                vGain = RAND_RANGE(50, 100) + vSens * 15;
                cGain = RAND_RANGE(20, 40) + cSens * 5;
                pain = RAND_RANGE(10, 30);
                break;
            case 85: // Urination
                target.tequip[85] = 1;
                target.addPalam(8, RAND_RANGE(50, 100));
                target.addPalam(11, RAND_RANGE(20, 40));
                target.addExp(31, 1);
                pain = RAND_RANGE(10, 20);
                break;
            case 87: // Piercing
                if (target.tequip[87]) {
                    target.tequip[87] = 0;
                    UI.appendText(`${target.name}身上的穿环被取下了……\n`);
                } else {
                    target.tequip[87] = 1;
                    pain = RAND_RANGE(40, 80);
                    target.addPalam(11, RAND_RANGE(30, 60));
                    target.addExp(5, 1); // Abnormal exp
                }
                break;
            case 90: // Nipple fuck
                bGain = RAND_RANGE(30, 60) + target.abl[1] * 8;
                pain = RAND_RANGE(40, 80);
                target.addExp(5, 1);
                target.addPalam(11, RAND_RANGE(20, 40));
                break;
            case 111: // 撕破衣服
                pain = RAND_RANGE(10, 20);
                target.addPalam(8, RAND_RANGE(30, 60));
                target.addPalam(11, RAND_RANGE(20, 40));
                target.tequip[111] = 1;
                break;
            case 124: // 深喉
                cGain = RAND_RANGE(30, 60) + cSens * 6;
                pain = RAND_RANGE(40, 80);
                target.addExp(22, 1);
                target.addPalam(11, RAND_RANGE(30, 60));
                break;
            case 127: // 真空口交
                cGain = RAND_RANGE(30, 50) + cSens * 5;
                pain = RAND_RANGE(20, 40);
                target.addExp(22, 1);
                break;
        }

        // 痛苦带来的M快感
        const mSens = target.abl[21];
        let mGain = 0;
        if (mSens > 0) {
            mGain = Math.floor(pain * (mSens * 0.15));
        }

        target.addSource(0, cGain);
        target.addSource(1, vGain);
        target.addSource(2, aGain);
        target.addSource(3, bGain);
        target.addSource(16, pain);
        target.addSource(15, fear);
        target.addSource(2, mGain);
        target.hp -= RAND_RANGE(30, 60);
        master.hp -= RAND_RANGE(10, 30);
    }

    // ========== Monster / Tentacle (100) ==========
    _execMonster(comId, target, master) {
        const msgs = {
            100: `触手从召唤阵中涌出，缠绕住${target.name}的四肢……`
        };
        UI.appendText((msgs[comId] || "怪物袭击了。") + "\n");

        target.tequip[90] = 1; // Tentacle flag
        const cSens = target.abl[0];
        const vSens = target.abl[2];
        const aSens = target.abl[3];
        const bSens = target.abl[1];

        // 触手同时攻击所有部位
        target.addSource(0, RAND_RANGE(30, 60) + cSens * 6);
        target.addSource(1, RAND_RANGE(30, 60) + vSens * 6);
        target.addSource(2, RAND_RANGE(30, 60) + aSens * 6);
        target.addSource(3, RAND_RANGE(20, 40) + bSens * 4);
        target.addSource(16, RAND_RANGE(20, 40));
        target.addSource(15, RAND_RANGE(30, 60));
        target.addPalam(11, RAND_RANGE(20, 40));
        target.addExp(55, 1); // Tentacle exp
        target.addExp(5, 1);  // Abnormal exp
        target.hp -= RAND_RANGE(30, 50);
    }

    // ========== Free Training (150) ==========
    _execFree(comId, target, master) {
        UI.appendText(`${master.name}让${target.name}自由行动，观察着反应……\n`);
        target.addPalam(5, RAND_RANGE(10, 30));
        target.addSource(17, RAND_RANGE(10, 20));
        target.addSource(19, RAND_RANGE(10, 20));
        target.hp -= RAND_RANGE(5, 15);
    }

    // ========== Arena / Colosseum (200, 208) ==========
    _execArena(comId, target, master) {
        const arenaMsgs = {
            200: `${target.name}被丢入斗技场，被迫为生存而战……`,
            208: `无数触手从四面八方缠住${target.name}，钻入每一个孔穴……`
        };
        UI.appendText((arenaMsgs[comId] || `${target.name}在斗技场中战斗着……`) + "\n");

        let pain = RAND_RANGE(40, 80);
        let fear = RAND_RANGE(30, 60);
        let cGain = 0, vGain = 0, aGain = 0, bGain = 0;
        const cSens = target.abl[0];
        const vSens = target.abl[2];
        const aSens = target.abl[3];
        const bSens = target.abl[1];

        switch (comId) {
            case 200: // Colosseum generic
                pain = RAND_RANGE(40, 80);
                fear = RAND_RANGE(30, 60);
                break;
            case 208: // Tentacle arena
                cGain = RAND_RANGE(30, 60) + cSens * 6;
                vGain = RAND_RANGE(40, 80) + vSens * 8;
                aGain = RAND_RANGE(40, 80) + aSens * 8;
                bGain = RAND_RANGE(20, 40) + bSens * 4;
                pain = RAND_RANGE(30, 60);
                target.addExp(55, 1);
                target.addExp(5, 1);
                break;
        }

        target.addSource(0, cGain);
        target.addSource(1, vGain);
        target.addSource(2, aGain);
        target.addSource(3, bGain);
        target.addSource(16, pain);
        target.addSource(15, fear);
        target.addPalam(11, RAND_RANGE(20, 40));
        target.addExp(76, 1); // Arena exp
        target.addExp(80, 1); // Combat exp
        target.hp -= RAND_RANGE(40, 100);
    }

    // ========== Special (110) ==========
    _execSpecial(comId, target, master) {
        if (comId === 110) {
            const isDressed = target.tequip[110];
            if (isDressed) {
                UI.appendText(`${master.name}为${target.name}脱去了衣物……\n`);
                target.tequip[110] = 0;
                target.addPalam(8, RAND_RANGE(20, 40));
            } else {
                UI.appendText(`${master.name}为${target.name}穿上了衣服……\n`);
                target.tequip[110] = 1;
                target.addPalam(8, RAND_RANGE(10, 20));
            }
            target.addSource(17, RAND_RANGE(5, 10));
            target.hp -= RAND_RANGE(5, 10);
        } else {
            this._execDefault(comId, target, master);
        }
    }

    // ========== Talent Effects ==========
    _applyTalentEffects(target) {
        // 润滑修正 (直接修改PALAM)
        if (target.talent[42]) { // 容易湿
            target.addPalam(3, RAND_RANGE(20, 50));
        } else if (target.talent[43]) { // 不易湿
            target.palam[3] = Math.max(0, target.palam[3] - RAND_RANGE(10, 30));
        }

        // === 性格(10-18) ===
        if (target.talent[10]) { // 胆怯
            target.source[15] = Math.floor((target.source[15] || 0) * 1.5);
            target.source[17] = Math.floor((target.source[17] || 0) * 1.2);
        }
        if (target.talent[11]) { // 反抗心
            target.source[0] = Math.floor((target.source[0] || 0) * 0.8);
            target.source[1] = Math.floor((target.source[1] || 0) * 0.8);
            target.source[2] = Math.floor((target.source[2] || 0) * 0.8);
            target.source[3] = Math.floor((target.source[3] || 0) * 0.8);
            target.source[4] = Math.floor((target.source[4] || 0) * 0.8);
        }
        if (target.talent[12]) { // 刚强
            target.source[16] = Math.floor((target.source[16] || 0) * 0.5);
            target.source[15] = Math.floor((target.source[15] || 0) * 0.7);
        }
        if (target.talent[13]) { // 坦率
            target.source[17] = Math.floor((target.source[17] || 0) * 1.3);
        }
        if (target.talent[14]) { // 傲慢
            target.source[20] = Math.floor((target.source[20] || 0) * 1.3);
        }
        if (target.talent[15]) { // 高姿态
            target.source[17] = Math.floor((target.source[17] || 0) * 0.8);
        }
        if (target.talent[16]) { // 低姿态
            target.source[17] = Math.floor((target.source[17] || 0) * 1.5);
        }
        if (target.talent[17]) { // 老实
            target.source[8] = Math.floor((target.source[8] || 0) * 1.3);
        }
        if (target.talent[18]) { // 傲娇
            if (target.source[0] > 0) target.source[0] = Math.floor(target.source[0] * (RAND(2) === 0 ? 1.2 : 0.8));
        }

        // === 性向/兴趣(20-37) ===
        if (target.talent[20]) { // 克制
            for (const id of [0,1,2,3,4]) target.source[id] = Math.floor((target.source[id] || 0) * 0.7);
        }
        if (target.talent[21]) { // 冷漠
            for (const id of [5,6,7,8,17,19,20]) target.source[id] = Math.floor((target.source[id] || 0) * 0.5);
        }
        if (target.talent[22]) { // 缺乏感情
            target.source[15] = Math.floor((target.source[15] || 0) * 0.5);
        }
        if (target.talent[23]) { // 好奇心
            target.source[19] = Math.floor((target.source[19] || 0) * 1.5);
        }
        if (target.talent[24]) { // 保守
            target.source[19] = Math.floor((target.source[19] || 0) * 0.5);
        }
        if (target.talent[25]) { // 乐观
            target.source[20] = Math.floor((target.source[20] || 0) * 0.5);
        }
        if (target.talent[26]) { // 悲观
            target.source[20] = Math.floor((target.source[20] || 0) * 1.5);
        }
        if (target.talent[27]) { // 警戒心
            target.source[17] = Math.floor((target.source[17] || 0) * 0.7);
        }
        if (target.talent[28]) { // 喜欢炫耀
            target.source[8] = Math.floor((target.source[8] || 0) * 1.2);
        }
        if (target.talent[30]) { // 看重贞操
            target.source[20] = Math.floor((target.source[20] || 0) * 1.3);
        }
        if (target.talent[31]) { // 看轻贞操
            target.source[20] = Math.floor((target.source[20] || 0) * 0.7);
        }
        if (target.talent[32]) { // 压抑
            target.source[20] = Math.floor((target.source[20] || 0) * 0.7);
            target.source[15] = Math.floor((target.source[15] || 0) * 1.2);
        }
        if (target.talent[33]) { // 奔放
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
        }
        if (target.talent[34]) { // 抵抗
            target.source[20] = Math.floor((target.source[20] || 0) * 0.7);
            target.source[15] = Math.floor((target.source[15] || 0) * 1.2);
        }
        if (target.talent[35]) { // 害羞
            target.source[8] = Math.floor((target.source[8] || 0) * 1.5);
        }
        if (target.talent[36]) { // 不知羞耻
            target.source[8] = Math.floor((target.source[8] || 0) * 0.5);
        }
        if (target.talent[37]) { // 容易被要挟
            target.source[17] = Math.floor((target.source[17] || 0) * 1.2);
        }

        // === 体质(40-48) ===
        if (target.talent[40]) { // 害怕疼痛
            target.source[16] = Math.floor((target.source[16] || 0) * 1.5);
            target.source[20] = Math.floor((target.source[20] || 0) * 1.2);
        }
        if (target.talent[41]) { // 耐痛
            target.source[16] = Math.floor((target.source[16] || 0) * 0.5);
        }
        if (target.talent[44]) { // 爱哭鬼
            target.source[16] = Math.floor((target.source[16] || 0) * 1.2);
            target.source[15] = Math.floor((target.source[15] || 0) * 1.2);
        }
        if (target.talent[45]) { // 不易哭
            target.source[16] = Math.floor((target.source[16] || 0) * 0.8);
            target.source[15] = Math.floor((target.source[15] || 0) * 0.8);
        }
        if (target.talent[46]) { // 药瘾
            target.source[5] = Math.floor((target.source[5] || 0) * 1.3);
        }
        if (target.talent[48]) { // 眼镜
            target.source[19] = Math.floor((target.source[19] || 0) * 1.1);
        }
        if (target.talent[47]) { // 精液爱好
            target.source[4] = Math.floor((target.source[4] || 0) * 1.3);
        }

        // === 技术/知识(50-55) ===
        if (target.talent[50]) { // 学习快
            target.source[19] = Math.floor((target.source[19] || 0) * 1.3);
        }
        if (target.talent[51]) { // 学习慢
            target.source[19] = Math.floor((target.source[19] || 0) * 0.7);
        }
        if (target.talent[52]) { // 擅用舌头
            target.source[22] = Math.floor((target.source[22] || 0) * 1.2); // 口交快感
        }
        if (target.talent[53]) { // 调合知识
            // 媚药效果增强已在 exec 中处理，这里增加习得
            target.source[19] = Math.floor((target.source[19] || 0) * 1.1);
        }
        if (target.talent[54]) { // 药物抗性
            target.source[5] = Math.floor((target.source[5] || 0) * 0.7); // 欲情降低
        }
        if (target.talent[55]) { // 容易尿床
            target.source[8] = Math.floor((target.source[8] || 0) * 1.2); // 羞耻增加
        }

        // === 忠诚/献身(60-64) ===
        if (target.talent[60]) { // 容易自慰
            target.source[0] = Math.floor((target.source[0] || 0) * 1.2); // C快感增加
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2); // 欲情增加
        }
        if (target.talent[61]) { // 不怕污臭
            target.source[20] = Math.floor((target.source[20] || 0) * 0.8);
        }
        if (target.talent[62]) { // 反感污臭
            target.source[20] = Math.floor((target.source[20] || 0) * 1.3);
        }
        if (target.talent[63]) { // 献身
            target.source[17] = Math.floor((target.source[17] || 0) * 1.2);
        }
        if (target.talent[64]) { // 不怕脏
            target.source[20] = Math.floor((target.source[20] || 0) * 0.7);
        }

        // === 诚实/性癖(69-89) ===
        if (target.talent[69]) { // 抵抗诱惑
            target.source[5] = Math.floor((target.source[5] || 0) * 0.8);
        }
        if (target.talent[70]) { // 接受快感
            for (const id of [0,1,2,3,4]) target.source[id] = Math.floor((target.source[id] || 0) * 1.1);
        }
        if (target.talent[71]) { // 否定快感
            target.source[20] = Math.floor((target.source[20] || 0) * 1.2);
        }
        if (target.talent[72]) { // 容易上瘾
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
        }
        if (target.talent[73]) { // 容易陷落
            target.source[17] = Math.floor((target.source[17] || 0) * 1.2);
        }
        if (target.talent[74]) { // 自慰狂
            target.source[0] = Math.floor((target.source[0] || 0) * 1.3);
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
        }
        if (target.talent[75]) { // 性交狂
            target.source[1] = Math.floor((target.source[1] || 0) * 1.2);
            target.source[2] = Math.floor((target.source[2] || 0) * 1.1);
        }
        if (target.talent[76]) { // 淫乱
            for (const id of [0,1,2,3,4]) {
                if (target.source[id] > 0) target.source[id] = Math.floor(target.source[id] * 1.2);
            }
        }
        if (target.talent[77]) { // 尻穴狂
            target.source[2] = Math.floor((target.source[2] || 0) * 1.3);
        }
        if (target.talent[78]) { // 乳狂
            target.source[3] = Math.floor((target.source[3] || 0) * 1.3);
        }
        if (target.talent[79]) { // 男人婆
            target.source[3] = Math.floor((target.source[3] || 0) * 0.8);
            target.source[8] = Math.floor((target.source[8] || 0) * 0.8);
        }
        if (target.talent[81]) { // 双性恋
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
        }
        if (target.talent[82]) { // 讨厌男人
            target.source[20] = Math.floor((target.source[20] || 0) * 1.3);
        }
        if (target.talent[83]) { // 施虐狂
            target.source[16] = Math.floor((target.source[16] || 0) * 1.2);
            target.source[20] = Math.floor((target.source[20] || 0) * 0.8);
        }
        if (target.talent[84]) { // 嫉妒
            target.source[20] = Math.floor((target.source[20] || 0) * 1.2);
            target.source[15] = Math.floor((target.source[15] || 0) * 1.1);
        }
        if (target.talent[80]) { // 变态
            target.source[16] = Math.floor((target.source[16] || 0) * 1.2);
            target.source[8] = Math.floor((target.source[8] || 0) * 1.2);
        }
        if (target.talent[85]) { // 爱慕
            for (const id of [0,1,2,3,4]) target.source[id] = Math.floor((target.source[id] || 0) * 1.3);
        }
        if (target.talent[86]) { // 盲信
            target.source[17] = Math.floor((target.source[17] || 0) * 1.5);
        }
        if (target.talent[182]) { // 挚爱
            for (const id of [0,1,2,3,4]) target.source[id] = Math.floor((target.source[id] || 0) * 1.35);
        }
        if (target.talent[183]) { // 重塑
            for (const id of [0,1,2,3,4]) target.source[id] = Math.floor((target.source[id] || 0) * 1.2);
            target.source[15] = Math.floor((target.source[15] || 0) * 0.5);
            target.source[20] = Math.floor((target.source[20] || 0) * 0.5);
        }
        if (target.talent[87]) { // 小恶魔
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
        }
        if (target.talent[88]) { // 被虐狂
            target.source[16] = Math.floor((target.source[16] || 0) * 1.3);
        }
        if (target.talent[89]) { // 露出狂
            target.source[8] = Math.floor((target.source[8] || 0) * 1.5);
        }

        // === 体型(99-116) ===
        if (target.talent[99]) { // 魁梧
            target.source[16] = Math.floor((target.source[16] || 0) * 0.8);
            target.source[15] = Math.floor((target.source[15] || 0) * 0.8);
        }
        if (target.talent[100]) { // 娇小
            target.source[16] = Math.floor((target.source[16] || 0) * 1.2);
            target.source[15] = Math.floor((target.source[15] || 0) * 1.2);
        }
        if (target.talent[101]) target.source[0] = Math.floor((target.source[0] || 0) * 0.8); // C感觉低
        if (target.talent[102]) target.source[0] = Math.floor((target.source[0] || 0) * 1.2); // C感觉高
        if (target.talent[103]) target.source[1] = Math.floor((target.source[1] || 0) * 0.8); // V感觉低
        if (target.talent[104]) target.source[1] = Math.floor((target.source[1] || 0) * 1.2); // V感觉高
        if (target.talent[105]) target.source[2] = Math.floor((target.source[2] || 0) * 0.8); // A感觉低
        if (target.talent[106]) target.source[2] = Math.floor((target.source[2] || 0) * 1.2); // A感觉高
        if (target.talent[107]) target.source[3] = Math.floor((target.source[3] || 0) * 0.8); // B感觉低
        if (target.talent[108]) target.source[3] = Math.floor((target.source[3] || 0) * 1.2); // B感觉高
        if (target.talent[109]) target.source[3] = Math.floor((target.source[3] || 0) * 0.7); // 贫乳
        if (target.talent[110]) target.source[3] = Math.floor((target.source[3] || 0) * 1.3); // 巨乳
        if (target.talent[114]) target.source[3] = Math.floor((target.source[3] || 0) * 1.5); // 爆乳
        if (target.talent[116]) target.source[3] = Math.floor((target.source[3] || 0) * 0.5); // 绝壁

        // === 魅力(91-93) ===
        if (target.talent[91]) { // 魅惑
            for (let i = 0; i <= 5; i++) if (target.source[i] > 0) target.source[i] = Math.floor(target.source[i] * 1.1);
        }
        if (target.talent[92]) { // 谜之魅力
            for (let i = 0; i <= 5; i++) if (target.source[i] > 0) target.source[i] = Math.floor(target.source[i] * 1.2);
        }
        if (target.talent[93]) { // 压迫感
            target.source[15] = Math.floor((target.source[15] || 0) * 1.5);
        }

        // === personality2(160-179) ===
        if (target.talent[160]) { // 慈爱
            target.source[17] = Math.floor((target.source[17] || 0) * 1.2);
        }
        if (target.talent[162]) { // 懦弱
            target.source[15] = Math.floor((target.source[15] || 0) * 1.3);
        }
        if (target.talent[163]) { // 高贵
            target.source[20] = Math.floor((target.source[20] || 0) * 1.2);
        }
        if (target.talent[164]) { // 冷静
            target.source[15] = Math.floor((target.source[15] || 0) * 0.7);
        }
        if (target.talent[166]) { // 恶女
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
        }
        if (target.talent[161]) { // 自信家
            target.source[15] = Math.floor((target.source[15] || 0) * 0.8);
            target.source[20] = Math.floor((target.source[20] || 0) * 1.1);
        }
        if (target.talent[165]) { // 叛逆
            target.source[15] = Math.floor((target.source[15] || 0) * 1.3);
            target.source[17] = Math.floor((target.source[17] || 0) * 0.8);
        }
        if (target.talent[172]) { // 知性
            target.source[19] = Math.floor((target.source[19] || 0) * 1.2);
        }
        if (target.talent[173]) { // 庇护者
            target.source[17] = Math.floor((target.source[17] || 0) * 1.1);
        }
        // 174 贵公子已合并入 163 高贵
        if (target.talent[167]) { // 天真
            target.source[15] = Math.floor((target.source[15] || 0) * 0.8);
            target.source[20] = Math.floor((target.source[20] || 0) * 1.1);
        }
        if (target.talent[168]) { // 感性
            target.source[5] = Math.floor((target.source[5] || 0) * 1.2);
            target.source[15] = Math.floor((target.source[15] || 0) * 1.1);
        }
        if (target.talent[169]) { // 武人
            target.source[15] = Math.floor((target.source[15] || 0) * 0.7);
            target.source[17] = Math.floor((target.source[17] || 0) * 0.8);
            target.source[20] = Math.floor((target.source[20] || 0) * 1.2);
        }
        if (target.talent[170]) { // 孤独者
            target.source[15] = Math.floor((target.source[15] || 0) * 0.9);
            target.source[19] = Math.floor((target.source[19] || 0) * 1.2);
            target.source[17] = Math.floor((target.source[17] || 0) * 0.9);
        }
        if (target.talent[171]) { // 愚者
            target.source[15] = Math.floor((target.source[15] || 0) * 0.8);
            target.source[17] = Math.floor((target.source[17] || 0) * 1.1);
        }
        if (target.talent[175]) { // 伶俐
            target.source[19] = Math.floor((target.source[19] || 0) * 1.2);
            target.source[5] = Math.floor((target.source[5] || 0) * 1.1);
        }

        // === 崩坏(9) ===
        if (target.talent[9]) { // 崩坏
            // 崩坏后更顺从，快感更容易积累，恐怖/反感大幅降低
            for (const id of [0,1,2,3,4]) {
                if (target.source[id] > 0) target.source[id] = Math.floor(target.source[id] * 1.3);
            }
            target.source[15] = Math.floor((target.source[15] || 0) * 0.4);
            target.source[16] = Math.floor((target.source[16] || 0) * 0.4);
            target.source[17] = Math.floor((target.source[17] || 0) * 1.2);
            target.source[20] = Math.floor((target.source[20] || 0) * 0.5);
        }

        // === 淫感觉上升(230-233) ===
        if (target.talent[230]) target.source[0] = Math.floor((target.source[0] || 0) * 1.3); // C
        if (target.talent[231]) target.source[3] = Math.floor((target.source[3] || 0) * 1.3); // B
        if (target.talent[232]) target.source[1] = Math.floor((target.source[1] || 0) * 1.3); // V
        if (target.talent[233]) target.source[2] = Math.floor((target.source[2] || 0) * 1.3); // A
        if (target.talent[272]) { // 淫魔
            for (const id of [0,1,2,3,4]) {
                if (target.source[id] > 0) target.source[id] = Math.floor(target.source[id] * 1.2);
            }
        }

        // === 妊娠(153) ===
        if (target.talent[153]) {
            target.source[15] = Math.floor((target.source[15] || 0) * 1.3); // 恐怖+30%
        }

        // === 灭世魔王(94) — 主角专属：调教效果+50% ===
        const master = this.game.getMaster();
        if (master && master.talent[94]) {
            for (let i = 0; i < target.source.length; i++) {
                if (target.source[i] > 0) {
                    target.source[i] = Math.floor(target.source[i] * 1.5);
                }
            }
        }
    }

    // ========== 相性影响调教效果 (+/-15%) ==========
    _applyAffinityEffect(target, master) {
        if (!target || !master) return;

        // 高陷落状态判定：服从刻印Lv3+ 或 爱慕系/挚爱/重塑素质
        const isDeeplyFallen = (target.mark[0] || 0) >= 3
            || target.talent[85] || target.talent[86] || target.talent[182]
            || target.talent[183] || target.talent[76] || target.talent[272];

        let multiplier = 1.0;
        let label = '';

        if (isDeeplyFallen) {
            // 高陷落状态：相性锁定最高（灵魂共鸣）
            multiplier = 1.15;
            label = '灵魂共鸣 — 陷落锁定 (+15%)';
        } else {
            const diff = Math.abs((target.affinity || 50) - (master.affinity || 50));
            if (diff <= 10) { multiplier = 1.15; label = '相性极佳 (+15%)'; }
            else if (diff <= 25) { multiplier = 1.08; label = '相性良好 (+8%)'; }
            else if (diff <= 45) { multiplier = 1.0; label = ''; }
            else if (diff <= 65) { multiplier = 0.92; label = '相性不合 (-8%)'; }
            else { multiplier = 0.85; label = '相性冲突 (-15%)'; }
        }

        if (multiplier !== 1.0) {
            for (let i = 0; i < target.source.length; i++) {
                if (target.source[i] > 0) {
                    target.source[i] = Math.floor(target.source[i] * multiplier);
                }
            }
            if (label) {
                UI.appendText(`【相性】${label}\n`);
            }
        }
    }
}

window.TrainSystem = TrainSystem;
