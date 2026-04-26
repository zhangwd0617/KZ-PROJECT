// V12.0: 铁砧镇城镇界面
Object.assign(UI, {
    renderTown(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【铁砧镇 — 地下城入口枢纽】\n`, "accent");
        this.appendText(`所有勇者从铁砧镇进入地下城，战败或撤退后返回此处恢复。\n`);
        this.appendDivider();

        // 统计在城镇的勇者（taskType === 3 或在第1层进度为0的勇者）
        const townHeroes = game.invaders.filter(h => {
            const taskType = h.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
            const floor = game.getHeroFloor(h);
            const progress = game.getHeroProgress(h);
            return taskType === 3 || (floor <= 1 && progress <= 0 && h.hp > 0);
        });

        if (townHeroes.length > 0) {
            this.appendText(`\n🏘️ 当前在城镇的勇者（${townHeroes.length}人）\n`, "info");
            for (const hero of townHeroes) {
                const attitude = hero.cflag[CFLAGS.HERO_ATTITUDE] || 1;
                let attitudeTag = '';
                if (attitude === 1) attitudeTag = '⚔️讨伐';
                else if (attitude === 2) attitudeTag = '⚖️中立';
                else if (attitude === 3) attitudeTag = '😈倾向魔王';
                const hpPct = Math.floor((hero.hp / hero.maxHp) * 100);
                const mpPct = Math.floor((hero.mp / hero.maxMp) * 100);
                const curseCount = (typeof GearSystem !== 'undefined' && GearSystem.countCursedGear) ? GearSystem.countCursedGear(hero) : 0;
                let status = [];
                if (hpPct < 100) status.push(`HP${hpPct}%`);
                if (mpPct < 100) status.push(`MP${mpPct}%`);
                if (curseCount > 0) status.push(`诅咒×${curseCount}`);
                const statusStr = status.length > 0 ? `（${status.join(' / ')}）` : '（状态良好）';
                this.appendText(`  ${hero.name} Lv.${hero.level} ${attitudeTag} 💰${hero.gold}G ${statusStr}\n`);
            }
        } else {
            this.appendText(`\n🏘️ 当前城镇没有勇者。\n`, "dim");
        }

        this.appendDivider();
        this.appendText(`\n【城镇设施】\n`, "accent");
        this.appendText(`🏨 旅店：恢复HP/MP至满，费用=等级×10G\n`);
        this.appendText(`⛪ 净化神殿：解除所有诅咒装备，费用=诅咒件数×100G\n`);
        this.appendText(`🔍 鉴定所：鉴定所有未鉴定物品，费用=件数×50G\n`);
        this.appendText(`📋 委托板：勇者自动接取城镇委托任务\n`);
        this.appendText(`🛒 商店：出售/购买装备道具（地下城商店中已存在）\n`);

        // 中立冒险者（静态描述）
        this.appendDivider();
        this.appendText(`\n【中立冒险者】\n`, "accent");
        const npcs = [
            '老练的铁匠格朗——提供装备强化情报',
            '游吟诗人艾拉——贩卖地下城传闻',
            '神秘商人维克多——高价收购稀有物品',
        ];
        for (const npc of npcs) {
            this.appendText(`  • ${npc}\n`);
        }

        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    }
});
