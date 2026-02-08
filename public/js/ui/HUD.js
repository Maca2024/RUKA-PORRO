/**
 * AI Academy - HUD
 * XP bar, level, badges, world name, challenge counter
 */

class HUD {
    constructor() {
        this.element = null;
        this._create();
    }

    _create() {
        this.element = document.createElement('div');
        this.element.id = 'academy-hud';
        this.element.innerHTML = `
            <div class="hud-top">
                <div class="hud-world-info">
                    <span id="hud-world-name">AI Academy</span>
                    <span id="hud-world-skill" class="hud-skill"></span>
                </div>
                <div class="hud-right-section">
                    <button id="lang-toggle" class="lang-btn" onclick="i18n.toggleLanguage(); window.game?.hud?.update();">NL</button>
                    <button id="map-btn" class="map-btn" onclick="window.game?.worldMapUI?.toggle();">🗺</button>
                </div>
            </div>
            <div class="hud-bottom-left">
                <div class="hud-xp-section">
                    <span id="hud-level" class="hud-level">Lv.1</span>
                    <div class="hud-xp-bar-container">
                        <div id="hud-xp-bar" class="hud-xp-bar" style="width: 0%"></div>
                    </div>
                    <span id="hud-xp-text" class="hud-xp-text">0 XP</span>
                </div>
                <div id="hud-badges" class="hud-badges"></div>
                <div id="hud-challenge-count" class="hud-challenge-count"></div>
            </div>
            <div class="hud-controls">
                <p>WASD / ← → - ${i18n.t('controls.move')}</p>
                <p>SPACE - ${i18n.t('controls.jump')}</p>
                <p>SHIFT - ${i18n.t('controls.sprint')}</p>
                <p>V - ${i18n.t('controls.talk')}</p>
                <p>C - ${i18n.t('controls.camera')}</p>
                <p>M - ${i18n.t('controls.map')}</p>
            </div>
        `;
        document.getElementById('game-container').appendChild(this.element);
    }

    setWorld(worldId) {
        const worldName = i18n.t(`world.${worldId}.name`);
        const worldSkill = i18n.t(`world.${worldId}.skill`);
        document.getElementById('hud-world-name').textContent = `${i18n.t('hud.world')} ${worldId}: ${worldName}`;
        document.getElementById('hud-world-skill').textContent = worldSkill;
    }

    update() {
        const game = window.game;
        if (!game?.scoreSystem) return;

        const score = game.scoreSystem;

        // Level
        document.getElementById('hud-level').textContent = `Lv.${score.level}`;

        // XP bar
        document.getElementById('hud-xp-bar').style.width = `${score.xpProgress * 100}%`;
        document.getElementById('hud-xp-text').textContent = `${score.xp} XP`;

        // Badges
        const badgesEl = document.getElementById('hud-badges');
        const badges = score.badges;
        badgesEl.innerHTML = badges.slice(-5).map(b =>
            `<span class="hud-badge" title="${BADGES[b]?.[`name_${i18n.lang}`] || b}">${BADGES[b]?.icon || '⭐'}</span>`
        ).join('');

        // Challenge count
        if (game.challengeSystem) {
            const worldId = game.worldManager?.currentWorldId || 1;
            const completed = game.challengeSystem.getCompletedCount(worldId);
            const total = game.challengeSystem.getTotalCount(worldId);
            document.getElementById('hud-challenge-count').textContent =
                `${i18n.t('hud.challenges')}: ${completed}/${total}`;
        }

        // Language toggle
        document.getElementById('lang-toggle').textContent = i18n.t('lang.current');
    }
}

window.HUD = HUD;
