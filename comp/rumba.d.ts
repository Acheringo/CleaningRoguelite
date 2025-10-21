export declare enum RumbaStatus {
    IDLE = 0,
    CLEANING = 1,
    MOVING = 2,
    RETURNING = 3
}
export interface RumbaLevels {
    batterylvl: number;
    cleanlvl: number;
    speedlvl: number;
    rechargelvl: number;
}
export interface RumbaStats {
    battery: number;
    cleaning: number;
    speed: number;
    recharge: number;
}
export declare class Rumba {
    protected num: number;
    protected bat: number;
    protected status: RumbaStatus;
    protected levels: RumbaLevels;
    protected stats: RumbaStats;
    position: {
        x: number;
        y: number;
    };
    startBattery: number;
    private startClean;
    private startSpeed;
    private startRecharge;
    constructor(num: number, status: RumbaStatus);
    getStatus(): RumbaStatus;
    getBattery(): number;
    getLevels(): RumbaLevels;
    getStats(): RumbaStats;
    calcUpgrades(): void;
    upgradeLevel(levelType: keyof RumbaLevels): void;
    changePosition(newX: number, newY: number): void;
    updateBattery(change: number): void;
}
//# sourceMappingURL=rumba.d.ts.map