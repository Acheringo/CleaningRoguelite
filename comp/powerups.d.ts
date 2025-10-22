export declare class RepurchasablePowerUp {
    protected name: string;
    protected expScaling: number;
    protected level: number;
    protected nextLevelExp: number;
    protected basePrice: number;
    protected price: number;
    protected priceIncreaseRate: number;
    constructor(name: string, expScaling: number, priceIncreaseRate?: number);
    updateLevel(newLevel: number): void;
    getLevel(): number;
    getName(): string;
    getLevelExp(): number;
    getBasePrice(): number;
    getPriceIncreaseRate(): number;
}
//# sourceMappingURL=powerups.d.ts.map