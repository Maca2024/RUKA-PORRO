/**
 * AI Academy - Challenge System
 * Types: prompt_writing, quiz, matching, evaluation, boss
 */

const getMentorsForWorld = window.getMentorsForWorld;
const CONFIG = window.CONFIG;
const i18n = window.i18n;

class ChallengeSystem {
    constructor(game) {
        this.game = game;
        this.currentChallenge = null;
        this.worldChallenges = [];
        this.inChallenge = false;
        this.currentRound = 0;
    }

    loadWorldChallenges(worldId) {
        this.worldChallenges = [];
        const mentors = getMentorsForWorld(worldId);
        for (const mentor of mentors) {
            if (mentor.challenges) {
                for (const challenge of mentor.challenges) {
                    this.worldChallenges.push({
                        ...challenge,
                        mentorKey: mentor.key,
                        mentorName: mentor.name
                    });
                }
            }
        }
    }

    getChallengesForMentor(mentorKey) {
        return this.worldChallenges.filter(c => c.mentorKey === mentorKey);
    }

    getCompletedCount(worldId) {
        const save = this.game.saveSystem;
        if (!save) return 0;
        const mentors = getMentorsForWorld(worldId);
        let completed = 0;
        for (const mentor of mentors) {
            if (mentor.challenges) {
                for (const challenge of mentor.challenges) {
                    if (save.isChallengeCompleted(challenge.id)) completed++;
                }
            }
        }
        return completed;
    }

    getTotalCount(worldId) {
        const mentors = getMentorsForWorld(worldId);
        let total = 0;
        for (const mentor of mentors) {
            if (mentor.challenges) total += mentor.challenges.length;
        }
        return total;
    }

    async startChallenge(challengeId) {
        const challenge = this.worldChallenges.find(c => c.id === challengeId);
        if (!challenge) return;

        if (this.game.saveSystem?.isChallengeCompleted(challengeId)) {
            // Allow replay but mark it
            challenge._replay = true;
        }

        this.currentChallenge = challenge;
        this.inChallenge = true;
        this.currentRound = 0;

        // Show challenge UI
        if (this.game.challengeUI) {
            this.game.challengeUI.showChallenge(challenge);
        }
    }

    async submitResponse(playerResponse) {
        if (!this.currentChallenge || !this.inChallenge) return null;

        const challenge = this.currentChallenge;
        const lang = i18n.lang;
        let result = null;

        switch (challenge.type) {
            case 'prompt_writing':
                result = await this._evaluatePromptWriting(challenge, playerResponse);
                break;
            case 'quiz':
                result = this._evaluateQuiz(challenge, playerResponse);
                break;
            case 'matching':
                result = this._evaluateMatching(challenge, playerResponse);
                break;
            case 'evaluation':
                result = await this._evaluateEvaluation(challenge, playerResponse);
                break;
            case 'boss':
                result = await this._evaluateBoss(challenge, playerResponse);
                break;
        }

        if (result) {
            // Handle multi-round challenges
            if (challenge.rounds && this.currentRound < challenge.rounds - 1) {
                this.currentRound++;
                result.nextRound = true;
                result.round = this.currentRound;
                result.totalRounds = challenge.rounds;
            } else {
                // Challenge complete
                this._completeChallenge(challenge, result);
            }
        }

        return result;
    }

    async _evaluatePromptWriting(challenge, playerResponse) {
        const lang = i18n.lang;
        const rubric = lang === 'nl' ? challenge.rubric_nl : challenge.rubric_en;
        const task = lang === 'nl' ? challenge.task_nl : challenge.task_en;

        const result = await this.game.aiEngine.evaluateChallenge(
            challenge.id,
            playerResponse,
            `OPDRACHT: ${task}\n\nRUBRIEK: ${rubric}`
        );

        return {
            type: 'prompt_writing',
            score: Math.min(5, Math.max(1, result.score)),
            feedback: result.feedback,
            xp: Math.floor(challenge.xp * (result.score / 5))
        };
    }

    _evaluateQuiz(challenge, selectedAnswers) {
        const questions = challenge.questions;
        let correct = 0;

        // selectedAnswers is array of indices
        const answers = Array.isArray(selectedAnswers) ? selectedAnswers : [selectedAnswers];

        for (let i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i].correct) correct++;
        }

        const score = Math.round((correct / questions.length) * 5);
        const lang = i18n.lang;

        return {
            type: 'quiz',
            score,
            correct,
            total: questions.length,
            feedback: score >= 4
                ? (lang === 'nl' ? 'Uitstekend! Je begrijpt het goed!' : 'Excellent! You understand well!')
                : (lang === 'nl' ? `${correct}/${questions.length} goed. Probeer het opnieuw!` : `${correct}/${questions.length} correct. Try again!`),
            xp: Math.floor(challenge.xp * (score / 5))
        };
    }

    _evaluateMatching(challenge, playerMatches) {
        // playerMatches is array of { term, definition } pairs
        const pairs = challenge.pairs;
        let correct = 0;
        const lang = i18n.lang;

        if (Array.isArray(playerMatches)) {
            for (let i = 0; i < pairs.length; i++) {
                const term = lang === 'nl' ? pairs[i].term_nl : pairs[i].term_en;
                const def = lang === 'nl' ? pairs[i].def_nl : pairs[i].def_en;
                if (playerMatches[i]?.term === term && playerMatches[i]?.definition === def) {
                    correct++;
                }
            }
        }

        const score = Math.round((correct / pairs.length) * 5);

        return {
            type: 'matching',
            score,
            correct,
            total: pairs.length,
            feedback: score >= 4
                ? (lang === 'nl' ? 'Perfect gematcht!' : 'Perfectly matched!')
                : (lang === 'nl' ? `${correct}/${pairs.length} goed gekoppeld.` : `${correct}/${pairs.length} correctly matched.`),
            xp: Math.floor(challenge.xp * (score / 5))
        };
    }

    async _evaluateEvaluation(challenge, playerEvaluations) {
        // Player evaluates prompts - we check if their ratings are close
        const prompts = challenge.prompts_to_evaluate;
        let totalDiff = 0;

        const evals = Array.isArray(playerEvaluations) ? playerEvaluations : [playerEvaluations];

        for (let i = 0; i < prompts.length; i++) {
            const expected = prompts[i].expected_rating;
            const given = evals[i] || 3;
            totalDiff += Math.abs(expected - given);
        }

        const avgDiff = totalDiff / prompts.length;
        const score = Math.max(1, Math.round(5 - avgDiff));
        const lang = i18n.lang;

        return {
            type: 'evaluation',
            score,
            feedback: score >= 4
                ? (lang === 'nl' ? 'Je hebt een scherp oog voor promptkwaliteit!' : 'You have a sharp eye for prompt quality!')
                : (lang === 'nl' ? 'Probeer beter te letten op specificiteit en context.' : 'Try to pay more attention to specificity and context.'),
            xp: Math.floor(challenge.xp * (score / 5))
        };
    }

    async _evaluateBoss(challenge, playerResponse) {
        return await this._evaluatePromptWriting(challenge, playerResponse);
    }

    _completeChallenge(challenge, result) {
        this.inChallenge = false;

        // Camera shake for dramatic effect
        if (this.game.camera) {
            this.game.camera.addShake(result.score >= 4 ? 0.5 : 0.2);
        }

        // Save completion
        if (this.game.saveSystem && !challenge._replay) {
            this.game.saveSystem.completeChallenge(challenge.id, result.score);
        }

        // Award XP
        if (this.game.scoreSystem) {
            this.game.scoreSystem.addXP(result.xp || 0);
        }

        // Check for first perfect badge
        if (result.score === 5 && this.game.scoreSystem && !this.game.scoreSystem.badges.includes('first_perfect')) {
            this.game.scoreSystem.awardBadge('first_perfect');
        }

        // Show notification
        if (this.game.notificationUI) {
            const starText = '★'.repeat(result.score) + '☆'.repeat(5 - result.score);
            this.game.notificationUI.show(
                i18n.t('challenge.complete'),
                `${starText} (+${result.xp} XP)`,
                'challenge'
            );
        }

        // Check if world is now complete enough for portal
        if (this.game.portalSystem) {
            const worldId = this.game.worldManager.currentWorldId;
            const completion = this.getCompletedCount(worldId) / this.getTotalCount(worldId);
            if (completion >= CONFIG.academy.portalActivationThreshold) {
                this.game.portalSystem.activate();
            }
        }

        // Update HUD
        if (this.game.hud) {
            this.game.hud.update();
        }

        // Refresh objectives
        if (this.game.objectiveSystem) {
            this.game.objectiveSystem.onChallengeCompleted();
        }

        this.currentChallenge = null;
    }

    endChallenge() {
        this.inChallenge = false;
        this.currentChallenge = null;
        this.currentRound = 0;
        if (this.game.challengeUI) {
            this.game.challengeUI.hide();
        }
    }
}

window.ChallengeSystem = ChallengeSystem;
export { ChallengeSystem };
