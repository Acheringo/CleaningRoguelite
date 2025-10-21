import { Rumba } from './rumba.js';
import { RumbaStatus } from './rumba.js';
import {} from './rumba.js';
import {} from './rumba.js';
import { tileState } from './mapBuilder.js';
import { Tile } from './mapBuilder.js';
import { Map } from './mapBuilder.js';
//document.body.style.backgroundColor = "#eef";
let moveAllowed = true;
let charging = false;
let exp = 0;
let points = 0;
let time = 0;
let level = 1;
let rumbi = new Rumba(1, RumbaStatus.IDLE);
let map;
rumbi.changePosition(25, 25);
document.addEventListener("keydown", (event) => {
    var _a, _b, _c, _d;
    if (moveAllowed) {
        switch (event.key) {
            case "ArrowUp":
                if (((_a = map.getTile(rumbi.position.x, rumbi.position.y - 1)) === null || _a === void 0 ? void 0 : _a.getState()) !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x, rumbi.position.y - 1);
                    moveAllowed = false;
                }
                break;
            case "ArrowDown":
                if (((_b = map.getTile(rumbi.position.x, rumbi.position.y + 1)) === null || _b === void 0 ? void 0 : _b.getState()) !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x, rumbi.position.y + 1);
                    moveAllowed = false;
                }
                break;
            case "ArrowLeft":
                if (((_c = map.getTile(rumbi.position.x - 1, rumbi.position.y)) === null || _c === void 0 ? void 0 : _c.getState()) !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x - 1, rumbi.position.y);
                    moveAllowed = false;
                }
                break;
            case "ArrowRight":
                if (((_d = map.getTile(rumbi.position.x + 1, rumbi.position.y)) === null || _d === void 0 ? void 0 : _d.getState()) !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x + 1, rumbi.position.y);
                    moveAllowed = false;
                }
                break;
        }
    }
});
function updateGame() {
    const mapDiv = document.getElementById('map');
    const statsDiv = document.getElementById('stats');
    const powerupsDiv = document.getElementById('powerups');
    if (powerupsDiv) {
        powerupsDiv.innerHTML = '';
        powerupsDiv.innerHTML += `<h3>Power-ups Collected:</h3>`;
        powerupsDiv.innerHTML += `<p>Total Experience: ${exp}</p>`;
    }
    if (mapDiv)
        mapDiv.innerHTML = `<h3>Rumba Map(level: ${level}):</h3><br>`;
    map.showMap();
    if (!moveAllowed) {
        const currentTile = map.getTile(rumbi.position.x, rumbi.position.y);
        if (currentTile !== null) {
            switch (currentTile.getState()) {
                case tileState.DIRT:
                    map.changeTile(rumbi.position.x, rumbi.position.y, tileState.CLEAN);
                    rumbi.updateBattery(-2);
                    moveAllowed = true;
                    points++;
                    map.reduceDirtCount();
                    break;
                case tileState.CHARGER:
                    if (rumbi.getBattery() < 100) {
                        charging = true;
                        rumbi.updateBattery(1);
                        break;
                    }
                    else {
                        charging = false;
                        moveAllowed = true;
                        break;
                    }
                case tileState.POWERUP:
                    map.changeTile(rumbi.position.x, rumbi.position.y, tileState.CLEAN);
                    rumbi.updateBattery(-1);
                    exp++;
                    moveAllowed = true;
                    break;
                default:
                    moveAllowed = true;
                    charging = false;
                    rumbi.updateBattery(-1);
                    break;
            }
        }
    }
    if (statsDiv) {
        statsDiv.innerHTML = `
            <h2>Rumba Stats</h2><br>
            Battery: ${rumbi.getBattery()} %<br>
            Status: ${rumbi.getStatus()}<br>
            Points: ${points}<br>
            Experience: ${exp}<br>
            Remaining dirt patches: ${map.getToClean()}<br>
            Time passed: ${time.toFixed(2)} s<br>
        `;
    }
    if (rumbi.getBattery() <= 0) {
        if (statsDiv) {
            statsDiv.innerHTML = '';
            statsDiv.innerHTML += `<br>Battery depleted! Game Over.`;
        }
    }
    if (map.getToClean() === 0) {
        level++;
        start(level, rumbi);
    }
}
function start(lvl, rumbi) {
    map = new Map(5 * lvl, 5 * lvl, rumbi);
    rumbi.changePosition(Math.floor(lvl * 5 / 2), Math.floor(lvl * 5 / 2));
    time = 0;
}
start(level, rumbi);
const ticker = setInterval(() => {
    updateGame();
    time += 0.05;
}, 50);
//# sourceMappingURL=main.js.map