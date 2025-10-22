export var RumbaStatus;
(function (RumbaStatus) {
    RumbaStatus[RumbaStatus["IDLE"] = 0] = "IDLE";
    RumbaStatus[RumbaStatus["CLEANING"] = 1] = "CLEANING";
    RumbaStatus[RumbaStatus["MOVING"] = 2] = "MOVING";
    RumbaStatus[RumbaStatus["RETURNING"] = 3] = "RETURNING";
})(RumbaStatus || (RumbaStatus = {}));
export class Rumba {
    constructor(num, status) {
        this.bat = 100;
        this.levels = {
            batterylvl: 1,
            cleanlvl: 1,
            speedlvl: 1,
            rechargelvl: 1
        };
        this.stats = {
            battery: 100,
            cleaning: 1,
            speed: 1,
            recharge: 1
        };
        this.position = { x: 0, y: 0 };
        this.startBattery = 100;
        this.startClean = 1;
        this.startSpeed = 1;
        this.startRecharge = 1;
        this.num = num;
        this.status = status;
    }
    getStatus() {
        return this.status;
    }
    getBattery() {
        return this.bat;
    }
    getLevels() {
        return this.levels;
    }
    getStats() {
        return this.stats;
    }
    calcUpgrades() {
        this.stats.battery = this.startBattery + (this.levels.batterylvl - 1) * 20;
        this.stats.recharge = this.levels.rechargelvl;
    }
    upgradeLevel(levelType) {
        this.levels[levelType]++;
        this.calcUpgrades();
    }
    changePosition(newX, newY) {
        this.position.x = newX;
        this.position.y = newY;
    }
    updateBattery(change) {
        this.bat += change;
    }
}
//# sourceMappingURL=rumba.js.map