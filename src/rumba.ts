export enum RumbaStatus {
    IDLE,
    CLEANING,
    MOVING,
    RETURNING
}

export interface RumbaLevels{
    batterylvl: number;
    cleanlvl: number;
    speedlvl: number;
    rechargelvl: number;
}

export interface RumbaStats{
    battery: number;
    cleaning: number;
    speed: number;
    recharge: number;
}

export class Rumba {
    protected num: number;
    protected bat: number=100;
    protected status: RumbaStatus;
    protected levels: RumbaLevels = {
        batterylvl: 1,
        cleanlvl: 1,
        speedlvl: 1,
        rechargelvl: 1
    };
    protected stats: RumbaStats={
        battery: 100,
        cleaning: 1,
        speed: 1,
        recharge: 1
    };

    position: {x: number, y: number}={x:0,y:0};

    startBattery=100;
    private startClean=1;
    private startSpeed=1;
    private startRecharge=1;

    constructor(num: number, status: RumbaStatus) {
        this.num = num;
        this.status=status;
    }

    getStatus(): RumbaStatus {
        return this.status;
    }
    getBattery(): number {
        return this.bat;
    }
    getLevels(): RumbaLevels {
        return this.levels;
    }
    getStats(): RumbaStats {
        return this.stats;
    }

    calcUpgrades(): void {
        this.stats.battery = this.startBattery + (this.levels.batterylvl - 1) * 20;
        this.stats.cleaning = this.startClean + (this.levels.cleanlvl - 1) * 0.5;
        this.stats.speed = this.startSpeed + (this.levels.speedlvl - 1) * 0.5;
        this.stats.recharge = this.startRecharge + (this.levels.rechargelvl - 1) * 0.5;
    }

    upgradeLevel(levelType: keyof RumbaLevels): void {
        this.levels[levelType]++;
        this.calcUpgrades();
    }

    changePosition(newX: number, newY: number): void {
        this.position.x = newX;
        this.position.y = newY;
    }

    updateBattery(change: number):void{
        this.bat+=change;
    }
}