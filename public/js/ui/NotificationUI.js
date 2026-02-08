/**
 * AI Academy - Notification UI
 * Toast notifications for achievements, level-ups, etc.
 */

class NotificationUI {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        document.getElementById('game-container').appendChild(this.container);
        this.queue = [];
        this.showing = false;

        // Listen for game events
        window.addEventListener('levelUp', (e) => {
            this.show(i18n.t('notify.levelup'), `Level ${e.detail.level}`, 'levelup');
        });
        window.addEventListener('badgeEarned', (e) => {
            const badge = BADGES[e.detail.badgeId];
            const name = badge?.[`name_${i18n.lang}`] || e.detail.badgeId;
            this.show(i18n.t('notify.badge'), `${badge?.icon || '⭐'} ${name}`, 'badge');
        });
    }

    show(title, subtitle = '', type = 'info') {
        this.queue.push({ title, subtitle, type });
        if (!this.showing) this._showNext();
    }

    _showNext() {
        if (this.queue.length === 0) {
            this.showing = false;
            return;
        }

        this.showing = true;
        const { title, subtitle, type } = this.queue.shift();

        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.innerHTML = `
            <div class="notification-title">${title}</div>
            ${subtitle ? `<div class="notification-subtitle">${subtitle}</div>` : ''}
        `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        // Animate out
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
                this._showNext();
            }, 400);
        }, 3000);
    }
}

window.NotificationUI = NotificationUI;
