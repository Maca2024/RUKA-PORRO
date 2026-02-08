/**
 * AI Academy - Transition UI
 * Full-screen transition animations between worlds
 */

class TransitionUI {
    constructor() {
        this.element = document.createElement('div');
        this.element.id = 'transition-ui';
        this.element.className = 'transition-overlay';
        this.element.style.display = 'none';
        this.element.innerHTML = `
            <div class="transition-content">
                <div id="transition-world-number" class="transition-number"></div>
                <h1 id="transition-world-name" class="transition-name"></h1>
                <p id="transition-world-skill" class="transition-skill"></p>
                <div class="transition-loading-bar">
                    <div id="transition-progress" class="transition-progress"></div>
                </div>
            </div>
        `;
        document.getElementById('game-container').appendChild(this.element);
    }

    async show(worldId) {
        const name = i18n.t(`world.${worldId}.name`);
        const skill = i18n.t(`world.${worldId}.skill`);

        document.getElementById('transition-world-number').textContent = `${i18n.t('hud.world')} ${worldId}`;
        document.getElementById('transition-world-name').textContent = name;
        document.getElementById('transition-world-skill').textContent = skill;
        document.getElementById('transition-progress').style.width = '0%';

        this.element.style.display = 'flex';
        this.element.classList.add('show');

        // Animate progress bar
        await new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 2;
                document.getElementById('transition-progress').style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 20);
        });
    }

    async hide() {
        this.element.classList.remove('show');
        this.element.classList.add('hide');

        await new Promise(resolve => setTimeout(resolve, 500));

        this.element.style.display = 'none';
        this.element.classList.remove('hide');
    }
}

window.TransitionUI = TransitionUI;
