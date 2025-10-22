import {Rumba} from './rumba.js'
import {RumbaStatus} from './rumba.js'
import {type RumbaLevels} from './rumba.js'
import {type RumbaStats} from './rumba.js'

import { tileState } from './mapBuilder.js'
import { Tile } from './mapBuilder.js'
import { Map } from './mapBuilder.js'

import { RepurchasablePowerUp } from './powerups.js'


//document.body.style.backgroundColor = "#eef";
let moveAllowed=true;
let charging=false;

let exp=0;
let points=0;
let time=0;

let level=1;

let rumbi = new Rumba(1,RumbaStatus.IDLE);
let map:Map;
let batteryExtender = new RepurchasablePowerUp("Battery Extender", 1.7);

rumbi.changePosition(25,25);
function autoMoveRandom(tick: number, every: number): void {
    if (every <= 0) return; // seguridad
    if (tick % every !== 0) return; // solo mover cada 'every' ticks

    if (!moveAllowed) return; // esperar a que se procese el movimiento anterior
    if (rumbi.getBattery() <= 0) return;

    const x = rumbi.position.x;
    const y = rumbi.position.y;
    const dirs = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
    ] as const;

    const candidates: [number, number][] = [];
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

// Tabla de powerups: base y multiplicador (usa los del constructor RepurchasablePowerUp)
const powerupsCfg = {
  battery: { id: 'buy-battery',  base: 20, mult: 1.7, lvl: () => rumbi.getLevels().batterylvl,  up: () => rumbi.upgradeLevel('batterylvl') },
  charging: {id: 'buy-charging', base: 20, mult: 1.9, lvl: ()=> rumbi.getLevels().rechargelvl, up: () => rumbi.upgradeLevel('rechargelvl')}
};

function priceOf(base: number, mult: number, level: number): number {
  // nivel 1 = precio base
  return Math.floor(base * Math.pow(mult, Math.max(0, level - 1)));
}

function renderPowerupsOnce() {
  // Bind una sola vez
  (document.getElementById(powerupsCfg.battery.id) as HTMLButtonElement | null)
    ?.addEventListener('click', () => buyPowerup('battery'));
  (document.getElementById(powerupsCfg.charging.id) as HTMLButtonElement | null)
    ?.addEventListener('click', () => buyPowerup('charging'));
}

function buyPowerup(kind: keyof typeof powerupsCfg) {
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
  if (expSpan) expSpan.textContent = String(exp);

  // Actualiza precios, niveles y disabled
  (['battery','charging'] as const).forEach((k) => {
    const cfg = powerupsCfg[k];
    const lvl = cfg.lvl();
    const price = priceOf(cfg.base, cfg.mult, lvl);
    const btn = document.getElementById(cfg.id) as HTMLButtonElement | null;

    const priceSpan = document.getElementById(`price-${k}`);
    const lvlSpan = document.getElementById(`lvl-${k}`);

    if (priceSpan) priceSpan.textContent = String(price);
    if (lvlSpan) lvlSpan.textContent = String(lvl);

    if (btn) btn.disabled = exp < price;
  });
}

function updateGame() {
    const mapDiv = document.getElementById('map');
    const statsDiv = document.getElementById('stats');
    const powerupsDiv = document.getElementById('powerups');

    if (mapDiv) mapDiv.innerHTML = `<h3>Rumba Map(level: ${level}):</h3><br>`;
    map.showMap();
    
    if(!moveAllowed){
        const currentTile = map.getTile(rumbi.position.x, rumbi.position.y);
        if(currentTile!==null){
            switch (currentTile.getState()) {
                case tileState.DIRT:
                    map.changeTile(rumbi.position.x, rumbi.position.y, tileState.CLEAN);
                    rumbi.updateBattery(-2);
                    moveAllowed=true;
                    points++;
                    map.reduceDirtCount();
                    break;
                case tileState.CHARGER:
                    if(rumbi.getBattery()<rumbi.getStats().battery){
                        charging=true;
                        rumbi.updateBattery(rumbi.getStats().recharge);
                        break;
                    }
                    else{
                        charging=false;
                        moveAllowed=true;
                        break;
                    }
                case tileState.POWERUP:
                    map.changeTile(rumbi.position.x, rumbi.position.y, tileState.CLEAN);
                    rumbi.updateBattery(-1);
                    exp++;
                    moveAllowed=true;
                    break;
                default:
                    moveAllowed=true;
                    charging=false;
                    rumbi.updateBattery(-1);
                    break;
            }
        }
    }
    
    if(statsDiv) {
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

    // REMOVE any existing restart button if Rumba is alive
    const existingRestart = document.getElementById('btn-restart');
    if (rumbi.getBattery() > 0 && existingRestart) existingRestart.remove();

    // GAME OVER: show message + restart button (keeps EXP, resets points and map)
    if(rumbi.getBattery()<=0){
        stopTicker(); // DETENER el loop aquí
        if(statsDiv) {
            statsDiv.innerHTML = `<h2>Rumba Stats</h2><br>Battery depleted! Game Over.<br><br>`;
            // only create the button once
            if(!document.getElementById('btn-restart')) {
                const btn = document.createElement('button');
                btn.id = 'btn-restart';
                btn.textContent = 'Reiniciar (mantener EXP)';
                btn.addEventListener('click', () => {
                    console.log('Clicked button');
                    // reset score only, keep experience
                    points = 0;
                    time = 0;

                    // clear previous map render
                    const mapDiv = document.getElementById('map');
                    if (mapDiv) mapDiv.innerHTML = '';

                    // restart from level 1 (not current level)
                    level = 1;
                    start(level, rumbi);

                    // ensure stats reflect upgrades and restore battery to full
                    rumbi.calcUpgrades();
                    const maxBat = rumbi.getStats().battery;
                    rumbi.updateBattery(maxBat);

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
        if (powerupsDiv) updatePowerupsUI();
        return;
    }

    if(map.getToClean()===0){
        level++;
        start(level,rumbi);
    }

    // Refresca UI de powerups sin recrear botones
    if (powerupsDiv) updatePowerupsUI();
}

function start(lvl:number, rumbi:Rumba){
    map= new Map(5*lvl,5*lvl,rumbi);
    rumbi.changePosition(Math.floor(lvl*5/2),Math.floor(lvl*5/2));
    time=0;
}

start(level,rumbi);
let tickCount=0;
let autoMoveInterval=10;
renderPowerupsOnce();
let ticker:number | null=null;
function startTicker(){
    if(ticker) clearInterval(ticker);
    ticker = setInterval(() => {
        autoMoveRandom(tickCount, autoMoveInterval);
        updateGame();
        time += 0.05;
        tickCount++;
    }, 50);
}

function stopTicker(){
    if(ticker){
        clearInterval(ticker);
        ticker = null;
    }
}

startTicker();
