/**
 * EconomySystem — extracted from Game.js
 */
Game.prototype.buyRandomSlave = function(index) {
        if (!this._slaveMarketCandidates || !this._slaveMarketCandidates[index]) return;
        const { slave, price } = this._slaveMarketCandidates[index];
        if (this.money < price) {
            UI.showToast("金钱不足！", "danger");
            return;
        }
        this.money -= price;
        slave.cflag[CFLAGS.CAPTURE_STATUS] = 1;
        this.addCharaFromTemplate(slave);
        UI.showToast(`购买了【${slave.name}】！`);
        // 从候选列表移除
        this._slaveMarketCandidates.splice(index, 1);
        UI.renderSlaveMarket(this);
    }

Game.prototype.refreshSlaveMarket = function() {
        if (this.money < 500) {
            UI.showToast("金钱不足！", "danger");
            return;
        }
        this.money -= 500;
        this._slaveMarketCandidates = null;
        UI.showToast("已刷新奴隶市场商品");
        UI.renderSlaveMarket(this);
    }

    // ========== 肉体改造==========
Game.prototype._calcGearPrice = function(gear) {
        if (!gear) return 0;
        const basePrices = [10, 100, 1000, 10000, 100000, 1000000];
        const base = basePrices[gear.rarity] || 10;
        const levelMult = 1 + (gear.level || 1) * 0.02;
        let price = Math.floor(base * levelMult);
        if (gear.type === 'weapon') {
            price *= 2; // 武器价格是防具的2【        } else if (gear.type === 'item') {
            price = Math.floor(price * 0.5); // 道具价格是防具的一【
}
        return price;
    }

    // ========== 楼层设施系统 ==========

    // 检查勇者是否跨越了楼层设施位置
