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
function autoMoveRandom(tick, every) {
    if (every <= 0)
        return; // seguridad
    if (tick % every !== 0)
        return; // solo mover cada 'every' ticks
    if (!moveAllowed)
        return; // esperar a que se procese el movimiento anterior
    if (rumbi.getBattery() <= 0)
        return;
    const x = rumbi.position.x;
    const y = rumbi.position.y;
    const dirs = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
    ];
    const candidates = [];
    for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const t = map.getTile(nx, ny);
        if (t && t.getState() !== tileState.WALL) {
            candidates.push([nx, ny]);
        }
    }
    if (candidates.length === 0) {
        // sin movimiento posible: no hacer nada
        return;
    }
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    if (choice !== undefined) {
        rumbi.changePosition(choice[0], choice[1]);
    }
    moveAllowed = false; // marcar para que updateGame procese la casilla destino
}
function prioritizeHealing(tick, every) {
    if (every <= 0)
        return; // seguridad
    if (tick % every !== 0)
        return;
    if (!moveAllowed)
        return;
    if (rumbi.getBattery() <= 0)
        return;
    if (rumbi.getBattery() > 30)
        autoMoveRandom(tick, every);
    else if (Math.random() < 0.6) {
        const xr = rumbi.position.x;
        const yr = rumbi.position.y;
        let chargerPos = null;
        chargerPos = map.getClosestHealingPosition(rumbi);
        if (chargerPos) {
            const dx = chargerPos.x - xr;
            const dy = chargerPos.y - yr;
            if (Math.abs(dx) > Math.abs(dy)) {
                // mover en x
                const stepX = dx > 0 ? 1 : -1;
                const t = map.getTile(xr + stepX, yr);
                if (t && t.getState() !== tileState.WALL) {
                    rumbi.changePosition(xr + stepX, yr);
                }
                else if (dy !== 0) {
                    const stepY = dy > 0 ? 1 : -1;
                    const t2 = map.getTile(xr, yr + stepY);
                    if (t2 && t2.getState() !== tileState.WALL) {
                        rumbi.changePosition(xr, yr + stepY);
                    }
                }
            }
            else {
                //mover en y
                const stepY = dy > 0 ? 1 : -1;
                const t = map.getTile(xr, yr + stepY);
                if (t && t.getState() !== tileState.WALL) {
                    rumbi.changePosition(xr, yr + stepY);
                }
                else if (dx !== 0) {
                    const stepX = dx > 0 ? 1 : -1;
                    const t2 = map.getTile(xr + stepX, yr);
                    if (t2 && t2.getState() !== tileState.WALL) {
                        rumbi.changePosition(xr + stepX, yr);
                    }
                }
            }
            moveAllowed = false;
        }
    }
    else {
        autoMoveRandom(tick, every);
        moveAllowed = false;
    }
}
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
let currentMovementMode = 'random';
const HEALING_UPGRADE_PRICE = 5;
let healingUpgradePurchased = false;
function renderMovementUpgradesOnce() {
    const movDiv = document.getElementById('movement-upgrades');
    if (!movDiv)
        return;
    movDiv.innerHTML = '<h3>Movement Upgrades</h3>';
    // Botón para comprar prioritizeHealing
    const healingBtn = document.createElement('button');
    healingBtn.id = 'buy-healing-movement';
    healingBtn.textContent = `Buy Smart Healing Movement (${HEALING_UPGRADE_PRICE} EXP)`;
    healingBtn.addEventListener('click', () => {
        if (exp >= HEALING_UPGRADE_PRICE && !healingUpgradePurchased) {
            exp -= HEALING_UPGRADE_PRICE;
            healingUpgradePurchased = true;
            currentMovementMode = 'random';
            updateMovementUI();
            updateGame();
        }
    });
    movDiv.appendChild(healingBtn);
    // Selector de modo (solo visible después de comprar)
    const modeDiv = document.createElement('div');
    modeDiv.id = 'movement-mode-selector';
    modeDiv.style.display = 'none';
    modeDiv.innerHTML = `
        <p>Movement Mode:</p>
        <label><input type="radio" name="movement" value="random" checked> Random</label><br>
        <label><input type="radio" name="movement" value="healing"> Smart Healing</label>
    `;
    movDiv.appendChild(modeDiv);
    // Listeners para los radio buttons
    const radios = modeDiv.querySelectorAll('input[name="movement"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const target = e.target;
            currentMovementMode = target.value;
        });
    });
}
function updateMovementUI() {
    const healingBtn = document.getElementById('buy-healing-movement');
    const modeSelector = document.getElementById('movement-mode-selector');
    if (healingUpgradePurchased) {
        if (healingBtn)
            healingBtn.style.display = 'none';
        if (modeSelector)
            modeSelector.style.display = 'block';
    }
    else {
        if (healingBtn) {
            healingBtn.disabled = exp < HEALING_UPGRADE_PRICE;
            healingBtn.textContent = `Buy Smart Healing Movement (${HEALING_UPGRADE_PRICE} EXP)`;
        }
    }
}
function updateGame(lostmovement = -1, lostcleaning = -2) {
    const mapDiv = document.getElementById('map');
    const statsDiv = document.getElementById('stats');
    const powerupsDiv = document.getElementById('powerups');
    if (mapDiv)
        mapDiv.innerHTML = `<h3>Level ${level} map:</h3><br>`;
    map.showMap();
    if (!moveAllowed) {
        const currentTile = map.getTile(rumbi.position.x, rumbi.position.y);
        if (currentTile !== null) {
            switch (currentTile.getState()) {
                case tileState.DIRT:
                    map.changeTile(rumbi.position.x, rumbi.position.y, tileState.CLEAN);
                    rumbi.updateBattery(lostcleaning, 1, 1);
                    moveAllowed = true;
                    points++;
                    map.reduceDirtCount();
                    break;
                case tileState.CHARGER:
                    if (rumbi.getBattery() < rumbi.getStats().battery) {
                        charging = true;
                        rumbi.updateBattery(rumbi.getStats().recharge, tickCount, healingInterval);
                        break;
                    }
                    else {
                        charging = false;
                        moveAllowed = true;
                        break;
                    }
                case tileState.POWERUP:
                    map.changeTile(rumbi.position.x, rumbi.position.y, tileState.CLEAN);
                    rumbi.updateBattery(lostmovement, 1, 1);
                    exp++;
                    moveAllowed = true;
                    break;
                default:
                    moveAllowed = true;
                    charging = false;
                    rumbi.updateBattery(lostmovement, 1, 1);
                    break;
            }
        }
    }
    if (statsDiv) {
        statsDiv.innerHTML = `
            <h2>Robot Stats</h2><br>
            Battery: ${rumbi.getBattery()} %<br>
            Points: ${points}<br>
            Experience: ${exp}<br>
            Remaining dirt patches: ${map.getToClean()}<br>
            Time passed: ${time.toFixed(2)} s<br>
        `;
    }
    // REMOVE any existing restart button if Rumba is alive
    const existingRestart = document.getElementById('btn-restart');
    if (rumbi.getBattery() > 0 && existingRestart)
        existingRestart.remove();
    // GAME OVER: show message + restart button (keeps EXP, resets points and map)
    if (rumbi.getBattery() <= 0) {
        stopTicker(); // DETENER el loop aquí
        if (statsDiv) {
            statsDiv.innerHTML = `<h2>Robot Stats</h2><br>Battery depleted! Game Over.<br><br>`;
            // only create the button once
            if (!document.getElementById('btn-restart')) {
                const btn = document.createElement('button');
                btn.id = 'btn-restart';
                btn.textContent = 'Restart (keep EXP and upgrades)';
                btn.addEventListener('click', () => {
                    console.log('Clicked button');
                    // reset score only, keep experience
                    points = 0;
                    time = 0;
                    // clear previous map render
                    const mapDiv = document.getElementById('map');
                    if (mapDiv)
                        mapDiv.innerHTML = '';
                    // restart from level 1 (not current level)
                    level = 1;
                    start(level, rumbi);
                    // ensure stats reflect upgrades and restore battery to full
                    rumbi.calcUpgrades();
                    const maxBat = rumbi.getStats().battery;
                    rumbi.updateBattery(maxBat, 1, 1);
                    // reset tick counter / flags so automatic movement resumes correctly
                    tickCount = 0;
                    moveAllowed = true;
                    charging = false;
                    // remove button and refresh UI
                    btn.remove();
                    updateGame();
                    startTicker(); // REINICIAR el loop aquí
                });
                statsDiv.appendChild(btn);
            }
        }
        // stop further processing in this tick while game over
        if (powerupsDiv)
            updatePowerupsUI();
        return;
    }
    if (map.getToClean() === 0) {
        level++;
        start(level, rumbi);
    }
    // Refresca UI de powerups sin recrear botones
    if (powerupsDiv)
        updatePowerupsUI();
    updateMovementUI();
}
function start(lvl, rumbi) {
    map = new Map(5 * lvl, 5 * lvl, rumbi);
    rumbi.changePosition(Math.floor(lvl * 5 / 2), Math.floor(lvl * 5 / 2));
    time = 0;
}
start(level, rumbi);
let tickCount = 0;
let autoMoveInterval = 50;
let healingInterval = 5;
renderPowerupsOnce();
renderMovementUpgradesOnce();
let ticker = null;
function startTicker() {
    let lostmovement;
    let lostcleaning;
    if (ticker)
        clearInterval(ticker);
    ticker = setInterval(() => {
        // Elegir función de movimiento según el modo actual
        if (currentMovementMode === 'healing') {
            prioritizeHealing(tickCount, autoMoveInterval);
            lostmovement = -2;
            lostcleaning = -2;
        }
        else {
            autoMoveRandom(tickCount, autoMoveInterval);
            lostmovement = -1;
            lostcleaning = -2;
        }
        updateGame(lostmovement, lostcleaning);
        time += 0.01;
        tickCount++;
    }, 10);
}
function stopTicker() {
    if (ticker) {
        clearInterval(ticker);
        ticker = null;
    }
}
startTicker();
//# sourceMappingURL=main.js.map