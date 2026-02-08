/**
 * AI Academy - World Map UI
 * 10-world overview with completion tracking
 */

class WorldMapUI {
    constructor() {
        this.element = null;
        this.visible = false;
        this._create();
    }

    _create() {
        this.element = document.createElement('div');
        this.element.id = 'world-map-ui';
        this.element.className = 'worldmap-overlay';
        this.element.style.display = 'none';
        this.element.innerHTML = `
            <div class="worldmap-panel">
                <div class="worldmap-header">
                    <h2>${i18n.t('map.title')}</h2>
                    <button class="worldmap-close" onclick="window.game?.worldMapUI?.hide()">&times;</button>
                </div>
                <div id="worldmap-grid" class="worldmap-grid"></div>
            </div>
        `;
        document.getElementById('game-container').appendChild(this.element);
    }

    toggle() {
        if (this.visible) this.hide();
        else this.show();
    }

    show() {
        this.visible = true;
        this.element.style.display = 'flex';
        this._render();
    }

    hide() {
        this.visible = false;
        this.element.style.display = 'none';
    }

    _render() {
        const grid = document.getElementById('worldmap-grid');
        const game = window.game;
        const currentWorld = game?.worldManager?.currentWorldId || 1;
        const highestWorld = game?.saveSystem?.data?.highestWorld || 1;

        grid.innerHTML = '';

        for (let w = 1; w <= CONFIG.academy.totalWorlds; w++) {
            const name = i18n.t(`world.${w}.name`);
            const skill = i18n.t(`world.${w}.skill`);
            const completion = game?.scoreSystem?.getWorldCompletion(w) || 0;
            const isLocked = w > highestWorld + 1;
            const isCurrent = w === currentWorld;
            const isCompleted = completion >= 1;
            const biome = BIOME_CONFIGS[w];

            const card = document.createElement('div');
            card.className = `worldmap-card ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;

            card.innerHTML = `
                <div class="worldmap-card-number">${w}</div>
                <div class="worldmap-card-name">${isLocked ? '???' : name}</div>
                <div class="worldmap-card-skill">${isLocked ? i18n.t('map.locked') : skill}</div>
                <div class="worldmap-card-progress">
                    <div class="worldmap-progress-bar" style="width: ${completion * 100}%"></div>
                </div>
                <div class="worldmap-card-status">
                    ${isCurrent ? i18n.t('map.current') : isCompleted ? i18n.t('map.completed') : isLocked ? '🔒' : `${Math.round(completion * 100)}%`}
                </div>
            `;

            if (!isLocked && !isCurrent) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    if (game?.worldManager?.canAccessWorld(w)) {
                        game.worldManager.loadWorld(w);
                        this.hide();
                    }
                });
            }

            grid.appendChild(card);
        }
    }
}

window.WorldMapUI = WorldMapUI;
