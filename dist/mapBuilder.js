import { Rumba, RumbaStatus } from "./rumba.js";
export var tileState;
(function (tileState) {
    tileState[tileState["CLEAN"] = 0] = "CLEAN";
    tileState[tileState["DIRT"] = 1] = "DIRT";
    tileState[tileState["WALL"] = 2] = "WALL";
    tileState[tileState["CHARGER"] = 3] = "CHARGER";
    tileState[tileState["POWERUP"] = 4] = "POWERUP";
})(tileState || (tileState = {}));
export class Tile {
    constructor(state) {
        this.state = state;
    }
    getState() {
        return this.state;
    }
    changeState(nuevo) {
        this.state = nuevo;
    }
}
export class Map {
    constructor(width, height, rumbi) {
        this.grid = [];
        this.toClean = 0;
        this.healProbability = 0.0001;
        this.dirtProbability = 0.1;
        this.expProbability = 0.1;
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
        this.rumbi = rumbi;
    }
    createGrid() {
        const grid = [];
        let numberOfChargers = 0;
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
                    row.push(new Tile(tileState.WALL));
                }
                else if (Math.random() < this.healProbability) {
                    row.push(new Tile(tileState.CHARGER));
                    numberOfChargers++;
                }
                else if (this.healProbability < Math.random() && Math.random() < (this.expProbability + this.healProbability)) {
                    row.push(new Tile(tileState.POWERUP));
                }
                else if ((this.healProbability + this.expProbability) < Math.random() && Math.random() < (this.dirtProbability + this.expProbability + this.healProbability)) {
                    row.push(new Tile(tileState.DIRT));
                    this.toClean++;
                }
                else {
                    row.push(new Tile(tileState.CLEAN));
                }
            }
            grid.push(row);
        }
        if (numberOfChargers === 0) {
            const chargerX = Math.floor(Math.random() * (this.width - 2)) + 1;
            const chargerY = Math.floor(Math.random() * (this.height - 2)) + 1;
            if (grid[chargerY]?.[chargerX] !== undefined && grid[chargerY][chargerX].getState() !== tileState.WALL) {
                grid[chargerY][chargerX] = new Tile(tileState.CHARGER);
            }
        }
        return grid;
    }
    showMap() {
        const mapDiv = document.getElementById('map');
        for (let y = 0; y < this.height; y++) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[y]?.[x]?.getState();
                if (tile !== undefined) {
                    if (this.rumbi.position.x === x && this.rumbi.position.y === y) {
                        row += 'O';
                    }
                    else {
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
            if (mapDiv) {
                mapDiv.innerHTML += `<pre>${row}</pre>`;
            }
        }
    }
    cleanMap() {
        const mapDiv = document.getElementById('map');
        if (mapDiv)
            mapDiv.innerHTML = '';
    }
    getTile(x, y) {
        if (this.grid[y] && this.grid[y][x]) {
            return this.grid[y][x];
        }
        return null;
    }
    changeTile(x, y, nuevo) {
        if (this.grid[y] && this.grid[y][x]) {
            this.grid[y][x].changeState(nuevo);
        }
    }
    getToClean() {
        return this.toClean;
    }
    reduceDirtCount() {
        if (this.toClean > 0) {
            this.toClean--;
        }
    }
}
//# sourceMappingURL=mapBuilder.js.map