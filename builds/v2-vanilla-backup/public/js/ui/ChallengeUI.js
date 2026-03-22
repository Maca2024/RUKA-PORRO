/**
 * AI Academy - Challenge UI
 * In-game prompt editor, quiz UI, star ratings, feedback display
 */

const i18n = window.i18n;

class ChallengeUI {
    constructor() {
        this.element = null;
        this.currentChallenge = null;
        this.quizAnswers = [];
        this._create();
    }

    _create() {
        this.element = document.createElement('div');
        this.element.id = 'challenge-ui';
        this.element.className = 'challenge-overlay';
        this.element.style.display = 'none';
        this.element.innerHTML = `
            <div class="challenge-panel">
                <div class="challenge-header">
                    <h2 id="challenge-title"></h2>
                    <span id="challenge-type-badge" class="challenge-type-badge"></span>
                    <button class="challenge-close" onclick="window.game?.challengeSystem?.endChallenge()">&times;</button>
                </div>
                <div id="challenge-description" class="challenge-description"></div>
                <div id="challenge-content" class="challenge-content"></div>
                <div id="challenge-feedback" class="challenge-feedback" style="display:none"></div>
                <div class="challenge-actions">
                    <button id="challenge-submit-btn" class="challenge-btn primary" onclick="window.game?.challengeUI?.submit()">
                        ${i18n.t('challenge.submit')}
                    </button>
                </div>
            </div>
        `;
        document.getElementById('game-container').appendChild(this.element);
    }

    showChallenge(challenge) {
        this.currentChallenge = challenge;
        this.quizAnswers = [];
        const lang = i18n.lang;

        this.element.style.display = 'flex';
        document.getElementById('challenge-title').textContent = lang === 'nl' ? challenge.title_nl : challenge.title_en;
        document.getElementById('challenge-type-badge').textContent = i18n.t(`challenge.${challenge.type}`);
        document.getElementById('challenge-description').textContent = lang === 'nl' ? challenge.description_nl : challenge.description_en;
        document.getElementById('challenge-feedback').style.display = 'none';
        document.getElementById('challenge-submit-btn').textContent = i18n.t('challenge.submit');
        document.getElementById('challenge-submit-btn').disabled = false;

        const contentEl = document.getElementById('challenge-content');

        switch (challenge.type) {
            case 'prompt_writing':
                this._renderPromptWriting(contentEl, challenge, lang);
                break;
            case 'quiz':
                this._renderQuiz(contentEl, challenge, lang);
                break;
            case 'matching':
                this._renderMatching(contentEl, challenge, lang);
                break;
            case 'evaluation':
                this._renderEvaluation(contentEl, challenge, lang);
                break;
            case 'boss':
                this._renderPromptWriting(contentEl, challenge, lang);
                break;
        }
    }

    _renderPromptWriting(el, challenge, lang) {
        const task = lang === 'nl' ? challenge.task_nl : challenge.task_en;
        const weakPrompt = lang === 'nl' ? challenge.weak_prompt_nl : challenge.weak_prompt_en;

        el.innerHTML = `
            <div class="prompt-task">
                <p><strong>${lang === 'nl' ? 'Opdracht' : 'Task'}:</strong> ${task}</p>
                ${weakPrompt ? `<div class="weak-prompt"><em>${lang === 'nl' ? 'Originele prompt' : 'Original prompt'}:</em> "${weakPrompt}"</div>` : ''}
            </div>
            <textarea id="challenge-input" class="challenge-textarea" placeholder="${lang === 'nl' ? 'Schrijf je prompt hier...' : 'Write your prompt here...'}" rows="6"></textarea>
        `;
    }

    _renderQuiz(el, challenge, lang) {
        const questions = challenge.questions;
        this.quizAnswers = new Array(questions.length).fill(-1);

        el.innerHTML = questions.map((q, qi) => `
            <div class="quiz-question">
                <p class="quiz-q"><strong>${qi + 1}.</strong> ${lang === 'nl' ? q.q_nl : q.q_en}</p>
                <div class="quiz-options">
                    ${(lang === 'nl' ? q.options_nl : q.options_en).map((opt, oi) => `
                        <label class="quiz-option" data-qi="${qi}" data-oi="${oi}">
                            <input type="radio" name="q${qi}" value="${oi}" onchange="window.game?.challengeUI?.setQuizAnswer(${qi}, ${oi})">
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    _renderMatching(el, challenge, lang) {
        const pairs = challenge.pairs;
        const terms = pairs.map((p, i) => ({ text: lang === 'nl' ? p.term_nl : p.term_en, index: i }));
        const defs = [...pairs.map((p, i) => ({ text: lang === 'nl' ? p.def_nl : p.def_en, index: i }))];
        // Shuffle definitions
        for (let i = defs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [defs[i], defs[j]] = [defs[j], defs[i]];
        }

        el.innerHTML = `
            <div class="matching-grid">
                <div class="matching-col">
                    <h4>${lang === 'nl' ? 'Begrippen' : 'Terms'}</h4>
                    ${terms.map(t => `<div class="matching-term" data-index="${t.index}">${t.text}</div>`).join('')}
                </div>
                <div class="matching-col">
                    <h4>${lang === 'nl' ? 'Beschrijvingen' : 'Definitions'}</h4>
                    ${defs.map((d, i) => `
                        <select class="matching-select" data-term="${i}">
                            <option value="">-- ${lang === 'nl' ? 'Kies' : 'Choose'} --</option>
                            ${terms.map(t => `<option value="${t.index}">${t.text}</option>`).join('')}
                        </select>
                        <span class="matching-def">${d.text}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    _renderEvaluation(el, challenge, lang) {
        const prompts = challenge.prompts_to_evaluate;

        el.innerHTML = `
            <div class="eval-prompts">
                ${prompts.map((p, i) => `
                    <div class="eval-prompt">
                        <p class="eval-prompt-text">"${lang === 'nl' ? p.prompt_nl : p.prompt_en}"</p>
                        <div class="eval-rating">
                            <span>${lang === 'nl' ? 'Jouw score' : 'Your rating'}:</span>
                            ${[1,2,3,4,5].map(s => `
                                <button class="star-btn" data-prompt="${i}" data-score="${s}" onclick="window.game?.challengeUI?.setEvalScore(${i}, ${s})">
                                    ☆
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.evalScores = new Array(prompts.length).fill(0);
    }

    setQuizAnswer(questionIndex, answerIndex) {
        this.quizAnswers[questionIndex] = answerIndex;
    }

    setEvalScore(promptIndex, score) {
        this.evalScores[promptIndex] = score;
        // Update star display
        document.querySelectorAll(`.star-btn[data-prompt="${promptIndex}"]`).forEach(btn => {
            btn.textContent = parseInt(btn.dataset.score) <= score ? '★' : '☆';
        });
    }

    async submit() {
        if (!this.currentChallenge) return;

        const btn = document.getElementById('challenge-submit-btn');
        btn.disabled = true;
        btn.textContent = i18n.t('dialogue.thinking');

        let playerResponse;

        switch (this.currentChallenge.type) {
            case 'prompt_writing':
            case 'boss':
                playerResponse = document.getElementById('challenge-input')?.value || '';
                break;
            case 'quiz':
                playerResponse = this.quizAnswers;
                break;
            case 'matching':
                playerResponse = this._getMatchingAnswers();
                break;
            case 'evaluation':
                playerResponse = this.evalScores;
                break;
        }

        const result = await window.game?.challengeSystem?.submitResponse(playerResponse);

        if (result) {
            this._showFeedback(result);
        }
    }

    _getMatchingAnswers() {
        const selects = document.querySelectorAll('.matching-select');
        const pairs = this.currentChallenge.pairs;
        const lang = i18n.lang;

        return Array.from(selects).map((sel, i) => {
            const termIndex = parseInt(sel.value);
            if (isNaN(termIndex)) return { term: '', definition: '' };
            return {
                term: lang === 'nl' ? pairs[termIndex]?.term_nl : pairs[termIndex]?.term_en,
                definition: lang === 'nl' ? pairs[i]?.def_nl : pairs[i]?.def_en
            };
        });
    }

    _showFeedback(result) {
        const feedbackEl = document.getElementById('challenge-feedback');
        feedbackEl.style.display = 'block';
        feedbackEl.textContent = '';

        const stars = '★'.repeat(result.score) + '☆'.repeat(5 - result.score);
        const scoreLabel = result.score >= 5 ? i18n.t('score.perfect')
            : result.score >= 4 ? i18n.t('score.great')
            : result.score >= 3 ? i18n.t('score.good')
            : result.score >= 2 ? i18n.t('score.ok')
            : i18n.t('score.retry');

        const starsDiv = document.createElement('div');
        starsDiv.className = 'feedback-stars';
        starsDiv.textContent = stars;
        const labelDiv = document.createElement('div');
        labelDiv.className = 'feedback-label';
        labelDiv.textContent = scoreLabel;
        const textDiv = document.createElement('div');
        textDiv.className = 'feedback-text';
        textDiv.textContent = result.feedback;
        const xpDiv = document.createElement('div');
        xpDiv.className = 'feedback-xp';
        xpDiv.textContent = '+' + result.xp + ' XP';
        feedbackEl.appendChild(starsDiv);
        feedbackEl.appendChild(labelDiv);
        feedbackEl.appendChild(textDiv);
        feedbackEl.appendChild(xpDiv);

        if (result.nextRound) {
            const roundP = document.createElement('p');
            roundP.className = 'feedback-round';
            roundP.textContent = i18n.t('boss.round') + ' ' + result.round + '/' + result.totalRounds;
            feedbackEl.appendChild(roundP);
        }

        const btn = document.getElementById('challenge-submit-btn');
        if (result.nextRound) {
            btn.textContent = `${i18n.t('boss.round')} ${result.round + 1}`;
            btn.disabled = false;
        } else {
            btn.textContent = '✓';
            setTimeout(() => this.hide(), 3000);
        }
    }

    hide() {
        this.element.style.display = 'none';
        this.currentChallenge = null;
    }
}

window.ChallengeUI = ChallengeUI;
export { ChallengeUI };
