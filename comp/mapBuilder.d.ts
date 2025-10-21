import { Rumba } from "./rumba.js";
export declare enum tileState {
    CLEAN = 0,
    DIRT = 1,
    WALL = 2,
    CHARGER = 3,
    POWERUP = 4
}
export declare class Tile {
    protected state: tileState;
    constructor(state: tileState);
    getState(): tileState;
    changeState(nuevo: tileState): void;
}
export declare class Map {
    protected rumbi: Rumba;
    protected width: number;
    protected height: number;
    protected grid: Tile[][];
    protected toClean: number;
    protected healProbability: number;
    protected dirtProbability: number;
    protected expProbability: number;
    constructor(width: number, height: number, rumbi: Rumba);
    protected createGrid(): Tile[][];
    showMap(): void;
    cleanMap(): void;
    getTile(x: number, y: number): Tile | null;
    changeTile(x: number, y: number, nuevo: tileState): void;
    getToClean(): number;
    reduceDirtCount(): void;
}
//# sourceMappingURL=mapBuilder.d.ts.map