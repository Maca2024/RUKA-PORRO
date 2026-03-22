/**
 * AI Academy - Dialogue UI
 * Mentor conversation interface with challenge access
 */

const i18n = window.i18n;

class DialogueUI {
    constructor() {
        // Uses existing DOM elements from index.html
    }

    show(mentorKey) {
        const dialogueUI = document.getElementById('dialogue-ui');
        if (dialogueUI) {
            dialogueUI.classList.add('show');
            const input = document.getElementById('dialogue-input');
            if (input) {
                input.placeholder = i18n.t('dialogue.placeholder');
                input.focus();
            }
            const hint = document.getElementById('dialogue-hint');
            if (hint) hint.textContent = i18n.t('dialogue.hint');
        }

        // Show available challenges for this mentor
        this._showChallengeButtons(mentorKey);
    }

    hide() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.remove('show');

        const dialogueUI = document.getElementById('dialogue-ui');
        if (dialogueUI) dialogueUI.classList.remove('show');

        this._hideChallengeButtons();
    }

    showResponse(mentorName, response) {
        const dialogueBox = document.getElementById('dialogue-box');
        const npcNameEl = document.getElementById('dialogue-npc-name');
        const npcResponseEl = document.getElementById('dialogue-npc-response');

        if (dialogueBox && npcNameEl && npcResponseEl) {
            npcNameEl.textContent = mentorName;
            npcResponseEl.textContent = response;
            dialogueBox.classList.add('show');
        }
    }

    showThinking() {
        const npcResponseEl = document.getElementById('dialogue-npc-response');
        if (npcResponseEl) npcResponseEl.textContent = i18n.t('dialogue.thinking');
    }

    _showChallengeButtons(mentorKey) {
        const game = window.game;
        if (!game?.challengeSystem) return;

        const challenges = game.challengeSystem.getChallengesForMentor(mentorKey);
        if (challenges.length === 0) return;

        // Remove existing buttons
        this._hideChallengeButtons();

        const container = document.createElement('div');
        container.id = 'challenge-buttons';
        container.className = 'challenge-buttons';

        const lang = i18n.lang;
        challenges.forEach(c => {
            const completed = game.saveSystem?.isChallengeCompleted(c.id);
            const score = game.saveSystem?.getChallengeScore(c.id) || 0;
            const btn = document.createElement('button');
            btn.className = `challenge-start-btn ${completed ? 'completed' : ''}`;
            btn.innerHTML = `
                <span class="challenge-btn-icon">${completed ? '★'.repeat(score) + '☆'.repeat(5-score) : '📝'}</span>
                <span class="challenge-btn-title">${lang === 'nl' ? c.title_nl : c.title_en}</span>
                <span class="challenge-btn-type">${i18n.t(`challenge.${c.type}`)}</span>
            `;
            btn.addEventListener('click', () => {
                game.challengeSystem.startChallenge(c.id);
            });
            container.appendChild(btn);
        });

        const dialogueUI = document.getElementById('dialogue-ui');
        if (dialogueUI) dialogueUI.appendChild(container);
    }

    _hideChallengeButtons() {
        const existing = document.getElementById('challenge-buttons');
        if (existing) existing.remove();
    }
}

window.DialogueUI = DialogueUI;
export { DialogueUI };
