import { Rumba, RumbaStatus } from "./rumba.js";

export enum tileState{
    CLEAN,
    DIRT,
    WALL,
    CHARGER,
    POWERUP
}

export class Tile{
    protected state: tileState;

    constructor(state: tileState) {
        this.state = state;
    }

    getState(): tileState {
        return this.state;
    }
    changeState(nuevo: tileState){
        this.state=nuevo;
    } 
}

export class Map{
    protected rumbi: Rumba;
    protected width: number;
    protected height: number;
    protected grid: Tile[][]=[];
    protected toClean: number=0;
    protected healProbability: number=0.0001;
    protected dirtProbability: number=0.1;
    protected expProbability: number=0.1;

    constructor(width: number, height: number, rumbi: Rumba) {
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
        this.rumbi = rumbi;
    }

    protected createGrid(): Tile[][] {
        const grid: Tile[][] = [];
        let numberOfChargers=0;
        for (let y = 0; y < this.height; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < this.width; x++) {
                if(x===0 || y===0 || x===this.width-1 || y===this.height-1){
                    row.push(new Tile(tileState.WALL));
                }
                else if(Math.random() < this.healProbability){
                    row.push(new Tile(tileState.CHARGER));
                    numberOfChargers++;
                }
                else if(this.healProbability < Math.random() && Math.random() < (this.expProbability + this.healProbability)){
                    row.push(new Tile(tileState.POWERUP));
                }
                else if((this.healProbability+this.expProbability)<Math.random() && Math.random()<(this.dirtProbability + this.expProbability + this.healProbability)){
                    row.push(new Tile(tileState.DIRT));
                    this.toClean++;
                }
                else{
                    row.push(new Tile(tileState.CLEAN));
                }
            }
            grid.push(row);
        }
        if(numberOfChargers===0){
            const chargerX=Math.floor(Math.random()*(this.width-2))+1;
            const chargerY=Math.floor(Math.random()*(this.height-2))+1;
            if(grid[chargerY]?.[chargerX]!==undefined && grid[chargerY][chargerX].getState()!==tileState.WALL){
                grid[chargerY][chargerX]=new Tile(tileState.CHARGER);
            }
        }
        return grid;
    }

    showMap(): void {
        const mapDiv = document.getElementById('map');
        for (let y = 0; y < this.height; y++) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[y]?.[x]?.getState();
                if(tile!==undefined){
                    if(this.rumbi.position.x === x && this.rumbi.position.y === y){
                        row += 'O';
                    }
                    else{
                        switch (tile) {
                            case tileState.WALL:
                                row += 'x';
                                break;
                            case tileState.DIRT:
                                row += '·';
                                break;
                            case tileState.CHARGER:
                                row += 'H';
                                break;
                            case tileState.POWERUP:
                                row += '+';
                                break;
                            default:
                                row += ' ';
                                break;
                        }
                    }
                }
            }
            console.log(row);
            if(mapDiv) {
                mapDiv.innerHTML += `<pre>${row}</pre>`;
            }
        }
    }

    cleanMap(): void {
        const mapDiv = document.getElementById('map');
        if(mapDiv) mapDiv.innerHTML = '';
    }

    getTile(x: number, y: number): Tile | null {
        if(this.grid[y] && this.grid[y][x]){
            return this.grid[y][x];
        }
        return null;
    }
    changeTile(x: number, y:number, nuevo: tileState): void{
        if(this.grid[y] && this.grid[y][x]){
            this.grid[y][x].changeState(nuevo);
        }
    }
    getToClean(): number{
        return this.toClean;
    }
    reduceDirtCount(): void{
        if(this.toClean>0){
            this.toClean--;
        }
    }
}