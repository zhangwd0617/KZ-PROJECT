/**
 * BodyModSystem — extracted from Game.js
 */
Game.prototype.bodyModifyLevelUp = function(index) {
        const c = this.getChara(index);
        if (!c) return { success: false, msg: '角色不存在' };
        if (this.money < 10000) return { success: false, msg: '金钱不足！需要10000G' };
        this.money -= 10000;
        c.level += 1;
        c.cflag[9] = c.level;
        // 提升基础属性        c.maxHp = Math.floor(c.maxHp * 1.1);
        c.hp = c.maxHp;
        c.maxMp = Math.floor(c.maxMp * 1.05);
        c.mp = c.maxMp;
        c.atk += 5;
        c.def += 3;
        return { success: true, msg: `${c.name} 接受改造后升到Lv.${c.level}！` };
    }

Game.prototype.bodyModifyLactation = function(index) {
        const c = this.getChara(index);
        if (!c) return { success: false, msg: '角色不存在' };
        if (c.talent[130]) return { success: false, msg: `${c.name} 已经是母乳体质了` };
        if (this.money < 50000) return { success: false, msg: '金钱不足！需要50000G' };
        this.money -= 50000;
        c.talent[130] = 1;
        // 胸围变大一个size
        const breastOrder = [116, 109, 110, 114]; // 绝壁→贫乳→巨乳→爆乳
        let currentIdx = -1;
        for (let i = 0; i < breastOrder.length; i++) {
            if (c.talent[breastOrder[i]]) {
                currentIdx = i;
                break;
            }
        }
        if (currentIdx >= 0 && currentIdx < breastOrder.length - 1) {
            c.talent[breastOrder[currentIdx]] = 0;
            c.talent[breastOrder[currentIdx + 1]] = 1;
        } else if (currentIdx === -1) {
            // 没有任何胸部特质，默认给巨乳
            c.talent[110] = 1;
        }
        // 如果是男性则变为无穴扶她
        if (c.talent[122]) {
            c.talent[122] = 0;
            c.talent[121] = 1;
            c.talent[123] = 1;
        }
        return { success: true, msg: `${c.name} 的乳腺被改造激活，开始泌乳。胸部变得更加丰满了...` };
    }

Game.prototype.bodyModifyFutanari = function(index) {
        const c = this.getChara(index);
        if (!c) return { success: false, msg: '角色不存在' };
        if (c.talent[121]) return { success: false, msg: `${c.name} 已经是扶她了` };
        if (this.money < 50000) return { success: false, msg: '金钱不足！需要50000G' };
        this.money -= 50000;
        c.talent[121] = 1;
        if (c.talent[122]) {
            // 男性→无穴扶她
            c.talent[122] = 0;
            c.talent[123] = 1;
            return { success: true, msg: `${c.name} 接受了扶她化改造，变成了无穴扶她。` };
        } else {
            // 女性→有穴扶她（保留处女状态）
            return { success: true, msg: `${c.name} 接受了扶她化改造，变成了有穴扶她。` };
        }
    }

    // ========== 设施与地下城系统 ==========
