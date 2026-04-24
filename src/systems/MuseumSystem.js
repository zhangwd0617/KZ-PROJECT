/**
 * MuseumSystem — extracted from Game.js
 */
Game.prototype.addSpecimen = function(chara, method) {
        const specimen = {
            id: Date.now() + RAND(100000),
            name: chara.name,
            level: chara.level,
            job: this._getJobNameForSpecimen(chara),
            personality: chara.getPersonalityName ? chara.getPersonalityName() : '未知',
            gender: chara.talent[122] ? '男' : '女',
            talentSnapshot: this._snapshotTalents(chara),
            markSnapshot: [...chara.mark],
            method: method,
            description: this._generateSpecimenDesc(chara, method),
            day: this.day,
            hp: chara.maxHp,
            mp: chara.maxMp,
            atk: chara.atk,
            def: chara.def
        };
        this.museum.specimens.push(specimen);
        this.addFame(3); // 制作标本 +3 声望
        return specimen;
    }

Game.prototype._getJobNameForSpecimen = function(c) {
        for (let i = 200; i <= 210; i++) {
            if (c.talent[i] && TALENT_DEFS[i]) return TALENT_DEFS[i].name;
        }
        return '无职业';
    }

Game.prototype._snapshotTalents = function(chara) {
        const keyTalents = [];
        const important = [0,1,10,11,12,13,14,15,30,31,32,40,41,42,50,60,70,71,74,75,76,77,78,80,81,82,83,85,88,89,91,92,93,99,100,109,110,114,116,121,122,130,153,157,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,179];
        for (const tid of important) {
            if (chara.talent[tid] && TALENT_DEFS[tid]) {
                keyTalents.push(TALENT_DEFS[tid].name);
            }
        }
        return keyTalents.slice(0, 8);
    }

Game.prototype._generateSpecimenDesc = function(chara, method) {
        const descs = {
            specimen: `${chara.name}的遗体被魔王的炼金术士精心处理。肌肤被注入了防腐魔药，保持着生前最后的表情——那是混杂着恐惧与屈辱的神情。双眼被换成了宝石，在黑暗中依然倒映着魔王城的烛火。她的身体被摆成跪伏的姿态，仿佛仍在向魔王献上永恒的臣服。旁边的铭牌记载着她生前的等级与罪状："入侵魔王城，下场如此。"`
        };
        return descs[method] || descs.specimen;
    }

    // 将物品加入收藏馆
Game.prototype.addMuseumItem = function(gear, sourceName) {
        if (!gear) return false;
        this.museum.items.push({
            id: Date.now() + RAND(100000),
            gear: JSON.parse(JSON.stringify(gear)),
            source: sourceName || '未知来源',
            day: this.day
        });
        return true;
    }

    // 没收角色身上的一件装备道具
Game.prototype.confiscateGear = function(charaIndex, slot, windex) {
        const c = this.getChara(charaIndex);
        if (!c || !c.gear) return { success: false, msg: '角色不存在' };
        let removed = null;
        if (slot === 'weapon' && c.gear.weapons && c.gear.weapons[windex]) {
            removed = c.gear.weapons[windex];
            c.gear.weapons.splice(windex, 1);
        } else if (slot === 'item' && c.gear.items && c.gear.items[windex]) {
            removed = c.gear.items[windex];
            c.gear.items.splice(windex, 1);
        } else if (c.gear[slot]) {
            removed = c.gear[slot];
            c.gear[slot] = null;
        }
        if (!removed) return { success: false, msg: '没有可没收的物品' };
        this.addMuseumItem(removed, `没收${c.name}的装备`);
        return { success: true, gear: removed, msg: `没收了${removed.name}的装备` };
    }

    // 将收藏馆物品赠与角色
Game.prototype.giftMuseumItemToChara = function(itemIndex, charaIndex) {
        const item = this.museum.items[itemIndex];
        if (!item) return { success: false, msg: '物品不存在' };
        const c = this.getChara(charaIndex);
        if (!c) return { success: false, msg: '角色不存在' };
        const r = GearSystem.equipItem(c, item.gear, true);
        if (r.success) {
            this.museum.items.splice(itemIndex, 1);
        }
        return r;
    }

    // 卖出收藏馆物品
Game.prototype.sellMuseumItem = function(index) {
        const item = this.museum.items[index];
        if (!item) return 0;
        const price = this._calcGearPrice(item.gear);
        this.money += price;
        this.museum.items.splice(index, 1);
        return price;
    }

    // 扔掉收藏馆物品
Game.prototype.discardMuseumItem = function(index) {
        if (index < 0 || index >= this.museum.items.length) return false;
        this.museum.items.splice(index, 1);
        return true;
    }

