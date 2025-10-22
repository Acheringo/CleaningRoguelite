export class RepurchasablePowerUp {
    constructor(name, expScaling, priceIncreaseRate = 1.5) {
        this.level = 1;
        this.nextLevelExp = 10;
        this.basePrice = 50;
        this.price = this.basePrice;
        this.name = name;
        this.expScaling = expScaling;
        this.priceIncreaseRate = priceIncreaseRate;
    }
    updateLevel(newLevel) {
        this.level = newLevel;
        this.nextLevelExp = Math.floor(this.nextLevelExp * this.expScaling);
        this.price = Math.floor(this.basePrice * Math.pow(this.priceIncreaseRate, this.level - 1));
    }
    getLevel() {
        return this.level;
    }
    getName() {
        return this.name;
    }
    getLevelExp() {
        return this.nextLevelExp;
    }
    getBasePrice() {
        return this.basePrice;
    }
    getPriceIncreaseRate() {
        return this.priceIncreaseRate;
    }
}
//# sourceMappingURL=powerups.js.map