const state = {
    balance: 0,
    rebirths: 0,
    multiplier: 1.0,
    clickBase: 0.00010000,
    autoBase: 0,
    isCooldown: false,
    cooldownMs: 150,
    upgrades: {
        click: { level: 0, cost: 0.00100000, increment: 0.00010000, costMult: 1.4 },
        auto: { level: 0, cost: 0.00500000, increment: 0.00050000, costMult: 1.5 },
        crit: { level: 0, cost: 0.01000000, increment: 1, costMult: 1.8 },
        overclock: { level: 0, cost: 0.05000000, increment: 0.00200000, costMult: 1.6 },
        node: { level: 0, cost: 0.15000000, increment: 0.01000000, costMult: 1.7 }
    }
};

function saveGame() {
    localStorage.setItem('bitcoinClickerSave', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('bitcoinClickerSave');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.balance = parsed.balance ?? state.balance;
            state.rebirths = parsed.rebirths ?? state.rebirths;
            state.multiplier = parsed.multiplier ?? state.multiplier;
            
            if (parsed.upgrades) {
                for (const key in state.upgrades) {
                    if (parsed.upgrades[key]) {
                        state.upgrades[key].level = parsed.upgrades[key].level ?? state.upgrades[key].level;
                        state.upgrades[key].cost = parsed.upgrades[key].cost ?? state.upgrades[key].cost;
                    }
                }
            }
            state.isCooldown = false;
        } catch (e) {
            console.error("Error loading save", e);
        }
    }
}

const dom = {
    balance: document.getElementById('balance'),
    perSecond: document.getElementById('per-second'),
    coinContainer: document.getElementById('coin-container'),
    cooldownOverlay: document.getElementById('cooldown-overlay'),
    rebirthCount: document.getElementById('rebirth-count'),
    multiplierValue: document.getElementById('multiplier-value'),
    
    lvlClick: document.getElementById('lvl-click'),
    costClick: document.getElementById('cost-click'),
    buyClick: document.getElementById('buy-click'),

    lvlAuto: document.getElementById('lvl-auto'),
    costAuto: document.getElementById('cost-auto'),
    buyAuto: document.getElementById('buy-auto'),

    lvlCrit: document.getElementById('lvl-crit'),
    costCrit: document.getElementById('cost-crit'),
    buyCrit: document.getElementById('buy-crit'),

    lvlOverclock: document.getElementById('lvl-overclock'),
    costOverclock: document.getElementById('cost-overclock'),
    buyOverclock: document.getElementById('buy-overclock'),

    lvlNode: document.getElementById('lvl-node'),
    costNode: document.getElementById('cost-node'),
    buyNode: document.getElementById('buy-node'),

    nextMultiplier: document.getElementById('next-multiplier'),
    rebirthCost: document.getElementById('rebirth-cost'),
    btnRebirth: document.getElementById('btn-rebirth'),

    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
};

dom.cooldownOverlay.innerHTML = '<div class="cooldown-spinner"></div>';

function formatBTC(val) {
    return val.toFixed(8);
}

function getClickValue() {
    return (state.clickBase + 
            (state.upgrades.click.level * state.upgrades.click.increment) + 
            (state.upgrades.overclock.level * state.upgrades.overclock.increment)) * state.multiplier;
}

function getAutoValue() {
    return (state.autoBase + 
            (state.upgrades.auto.level * state.upgrades.auto.increment) +
            (state.upgrades.node.level * state.upgrades.node.increment)) * state.multiplier;
}

function getRebirthCost() {
    return 1.0 * Math.pow(2.5, state.rebirths);
}

function getNextMultiplier() {
    return state.multiplier + 1.0;
}

function updateUI() {
    dom.balance.textContent = formatBTC(state.balance);
    dom.perSecond.textContent = `${formatBTC(getAutoValue())} BTC / сек`;
    dom.rebirthCount.textContent = state.rebirths;
    dom.multiplierValue.textContent = `x${state.multiplier.toFixed(1)}`;

    dom.lvlClick.textContent = state.upgrades.click.level;
    dom.costClick.textContent = formatBTC(state.upgrades.click.cost);
    dom.buyClick.disabled = state.balance < state.upgrades.click.cost;

    dom.lvlAuto.textContent = state.upgrades.auto.level;
    dom.costAuto.textContent = formatBTC(state.upgrades.auto.cost);
    dom.buyAuto.disabled = state.balance < state.upgrades.auto.cost;

    dom.lvlCrit.textContent = state.upgrades.crit.level;
    dom.costCrit.textContent = formatBTC(state.upgrades.crit.cost);
    dom.buyCrit.disabled = state.balance < state.upgrades.crit.cost;

    dom.lvlOverclock.textContent = state.upgrades.overclock.level;
    dom.costOverclock.textContent = formatBTC(state.upgrades.overclock.cost);
    dom.buyOverclock.disabled = state.balance < state.upgrades.overclock.cost;

    dom.lvlNode.textContent = state.upgrades.node.level;
    dom.costNode.textContent = formatBTC(state.upgrades.node.cost);
    dom.buyNode.disabled = state.balance < state.upgrades.node.cost;

    dom.nextMultiplier.textContent = `x${getNextMultiplier().toFixed(1)}`;
    dom.rebirthCost.textContent = formatBTC(getRebirthCost());
    dom.btnRebirth.disabled = state.balance < getRebirthCost();
}

function createFloatingNumber(e, value, isCrit) {
    const el = document.createElement('div');
    el.className = `floating-number ${isCrit ? 'crit' : ''}`;
    el.textContent = `+${formatBTC(value)}${isCrit ? ' (КРИТ!)' : ''}`;
    
    const rect = dom.coinContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    dom.coinContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function createParticle(e) {
    const el = document.createElement('div');
    el.className = 'particle';
    const rect = dom.coinContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 80 + Math.random() * 150;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    
    dom.coinContainer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

dom.coinContainer.addEventListener('click', (e) => {
    if (state.isCooldown) return;
    
    let val = getClickValue();
    let isCrit = false;
    
    const critChance = state.upgrades.crit.level * state.upgrades.crit.increment;
    if (Math.random() * 100 < critChance) {
        val *= 5;
        isCrit = true;
    }
    
    state.balance += val;
    createFloatingNumber(e, val, isCrit);
    
    const particleCount = isCrit ? 12 : 5;
    for (let i = 0; i < particleCount; i++) {
        createParticle(e);
    }
    
    updateUI();
    
    state.isCooldown = true;
    dom.coinContainer.classList.add('on-cooldown');
    
    setTimeout(() => {
        state.isCooldown = false;
        dom.coinContainer.classList.remove('on-cooldown');
    }, state.cooldownMs);
});

function buyUpgrade(key) {
    if (state.balance >= state.upgrades[key].cost) {
        state.balance -= state.upgrades[key].cost;
        state.upgrades[key].level++;
        state.upgrades[key].cost *= state.upgrades[key].costMult;
        updateUI();
        saveGame();
    }
}

dom.buyClick.addEventListener('click', () => buyUpgrade('click'));
dom.buyAuto.addEventListener('click', () => buyUpgrade('auto'));
dom.buyCrit.addEventListener('click', () => buyUpgrade('crit'));
dom.buyOverclock.addEventListener('click', () => buyUpgrade('overclock'));
dom.buyNode.addEventListener('click', () => buyUpgrade('node'));

dom.btnRebirth.addEventListener('click', () => {
    if (state.balance >= getRebirthCost()) {
        state.rebirths++;
        state.multiplier = getNextMultiplier();
        state.balance = 0;
        
        state.upgrades.click.level = 0;
        state.upgrades.click.cost = 0.00100000;
        state.upgrades.auto.level = 0;
        state.upgrades.auto.cost = 0.00500000;
        state.upgrades.crit.level = 0;
        state.upgrades.crit.cost = 0.01000000;
        state.upgrades.overclock.level = 0;
        state.upgrades.overclock.cost = 0.05000000;
        state.upgrades.node.level = 0;
        state.upgrades.node.cost = 0.15000000;
        
        updateUI();
        saveGame();
    }
});

dom.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dom.tabs.forEach(t => t.classList.remove('active'));
        dom.tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
});

setInterval(() => {
    const autoVal = getAutoValue();
    if (autoVal > 0) {
        state.balance += autoVal / 10;
        updateUI();
    }
}, 100);

loadGame();
updateUI();

setInterval(saveGame, 5000);
window.addEventListener('beforeunload', saveGame);

function buyEasterEgg() {
    alert("🎉 Вітаємо! Ти знайшов пасхалку!");
}
