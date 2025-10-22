export class RepurchasablePowerUp {
    protected name: string;
    protected expScaling: number;
    protected level: number=1;
    protected nextLevelExp: number=10;
    protected basePrice: number=50;
    protected price: number=this.basePrice;
    protected priceIncreaseRate: number;
    constructor(name: string, expScaling: number, priceIncreaseRate: number=1.5) {
        this.name = name;
        this.expScaling = expScaling;
        this.priceIncreaseRate = priceIncreaseRate;
    }

    updateLevel(newLevel: number) {
        this.level = newLevel;
        this.nextLevelExp = Math.floor(this.nextLevelExp * this.expScaling);
        this.price = Math.floor(this.basePrice * Math.pow(this.priceIncreaseRate, this.level - 1));
    }
    getLevel(): number {
        return this.level;
    }
    getName(): string {
        return this.name;
    }
    getLevelExp(): number {
        return this.nextLevelExp;
    }
    getBasePrice(): number {
        return this.basePrice;
    }
    getPriceIncreaseRate(): number {
        return this.priceIncreaseRate;
    }

}