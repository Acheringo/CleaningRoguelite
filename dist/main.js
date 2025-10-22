import { Rumba } from './rumba.js';
import { RumbaStatus } from './rumba.js';
import {} from './rumba.js';
import {} from './rumba.js';
import { tileState } from './mapBuilder.js';
import { Tile } from './mapBuilder.js';
import { Map } from './mapBuilder.js';
import { RepurchasablePowerUp } from './powerups.js';
//document.body.style.backgroundColor = "#eef";
let moveAllowed = true;
let charging = false;
let exp = 0;
let points = 0;
let time = 0;
let level = 1;
let rumbi = new Rumba(1, RumbaStatus.IDLE);
let map;
let batteryExtender = new RepurchasablePowerUp("Battery Extender", 1.7);
rumbi.changePosition(25, 25);
document.addEventListener("keydown", (event) => {
    if (moveAllowed) {
        switch (event.key) {
            case "ArrowUp":
                if (map.getTile(rumbi.position.x, rumbi.position.y - 1)?.getState() !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x, rumbi.position.y - 1);
                    moveAllowed = false;
                }
                break;
            case "ArrowDown":
                if (map.getTile(rumbi.position.x, rumbi.position.y + 1)?.getState() !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x, rumbi.position.y + 1);
                    moveAllowed = false;
                }
                break;
            case "ArrowLeft":
                if (map.getTile(rumbi.position.x - 1, rumbi.position.y)?.getState() !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x - 1, rumbi.position.y);
                    moveAllowed = false;
                }
                break;
            case "ArrowRight":
                if (map.getTile(rumbi.position.x + 1, rumbi.position.y)?.getState() !== tileState.WALL && rumbi.getBattery() > 0) {
                    rumbi.changePosition(rumbi.position.x + 1, rumbi.position.y);
                    moveAllowed = false;
                }
                break;
        }
    }
});
// Tabla de powerups: base y multiplicador (usa los del constructor RepurchasablePowerUp)
const powerupsCfg = {
    battery: { id: 'buy-battery', base: 20, mult: 1.7, lvl: () => rumbi.getLevels().batterylvl, up: () => rumbi.upgradeLevel('batterylvl') },
    charging: { id: 'buy-charging', base: 20, mult: 1.9, lvl: () => rumbi.getLevels().rechargelvl, up: () => rumbi.upgradeLevel('rechargelvl') }
};
function priceOf(base, mult, level) {
    // nivel 1 = precio base
    return Math.floor(base * Math.pow(mult, Math.max(0, level - 1)));
}
function renderPowerupsOnce() {
    // Bind una sola vez
    document.getElementById(powerupsCfg.battery.id)
        ?.addEventListener('click', () => buyPowerup('battery'));
    document.getElementById(powerupsCfg.charging.id)
        ?.addEventListener('click', () => buyPowerup('charging'));
}
function buyPowerup(kind) {
    const cfg = powerupsCfg[kind];
    const lvl = cfg.lvl();
    const price = priceOf(cfg.base, cfg.mult, lvl);
    rumbi.calcUpgrades();
    if (exp >= price) {
        exp -= price;
        cfg.up();
        updateGame(); // refresca UI
    }
}
function updatePowerupsUI() {
    const expSpan = document.getElementById('exp-total');
    if (expSpan)
        expSpan.textContent = String(exp);
    // Actualiza precios, niveles y disabled
    ['battery', 'charging'].forEach((k) => {
        const cfg = powerupsCfg[k];
        const lvl = cfg.lvl();
        const price = priceOf(cfg.base, cfg.mult, lvl);
        const btn = document.getElementById(cfg.id);
        const priceSpan = document.getElementById(`price-${k}`);
        const lvlSpan = document.getElementById(`lvl-${k}`);
        if (priceSpan)
            priceSpan.textContent = String(price);
        if (lvlSpan)
            lvlSpan.textContent = String(lvl);
        if (btn)
            btn.disabled = exp < price;
    });
}
function updateGame() {
    const mapDiv = document.getElementById('map');
    const statsDiv = document.getElementById('stats');
    const powerupsDiv = document.getElementById('powerups');
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
                    if (rumbi.getBattery() < rumbi.getStats().battery) {
                        charging = true;
                        rumbi.updateBattery(rumbi.getStats().recharge);
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
    // Refresca UI de powerups sin recrear botones
    if (powerupsDiv)
        updatePowerupsUI();
}
function start(lvl, rumbi) {
    map = new Map(5 * lvl, 5 * lvl, rumbi);
    rumbi.changePosition(Math.floor(lvl * 5 / 2), Math.floor(lvl * 5 / 2));
    time = 0;
}
start(level, rumbi);
renderPowerupsOnce();
const ticker = setInterval(() => {
    updateGame();
    time += 0.05;
}, 50);
//# sourceMappingURL=main.js.map