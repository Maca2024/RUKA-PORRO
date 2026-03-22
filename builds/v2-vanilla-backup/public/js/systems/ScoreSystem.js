/**
 * AI Academy - Score System
 * XP, levels, badges, world completion tracking
 */

const CONFIG = window.CONFIG;
const getMentorsForWorld = window.getMentorsForWorld;

class ScoreSystem {
    constructor(saveSystem) {
        this.saveSystem = saveSystem;
    }

    get xp() {
        return this.saveSystem.data.xp || 0;
    }

    get level() {
        const xpLevels = CONFIG.academy.xpPerLevel;
        for (let i = xpLevels.length - 1; i >= 0; i--) {
            if (this.xp >= xpLevels[i]) return i + 1;
        }
        return 1;
    }

    get xpForCurrentLevel() {
        const xpLevels = CONFIG.academy.xpPerLevel;
        const lvl = this.level;
        return xpLevels[lvl - 1] || 0;
    }

    get xpForNextLevel() {
        const xpLevels = CONFIG.academy.xpPerLevel;
        const lvl = this.level;
        return xpLevels[lvl] || xpLevels[xpLevels.length - 1] + 1000;
    }

    get xpProgress() {
        const current = this.xp - this.xpForCurrentLevel;
        const needed = this.xpForNextLevel - this.xpForCurrentLevel;
        return needed > 0 ? current / needed : 1;
    }

    addXP(amount) {
        const oldLevel = this.level;
        this.saveSystem.data.xp = (this.saveSystem.data.xp || 0) + amount;
        this.saveSystem.save();

        const newLevel = this.level;
        if (newLevel > oldLevel) {
            // Level up!
            window.dispatchEvent(new CustomEvent('levelUp', { detail: { level: newLevel } }));
        }

        window.dispatchEvent(new CustomEvent('xpGained', { detail: { amount, total: this.xp } }));
    }

    getWorldCompletion(worldId) {
        const challenges = this.saveSystem.data.completedChallenges || {};
        const mentors = getMentorsForWorld(worldId);
        let completed = 0;
        let total = 0;

        for (const mentor of mentors) {
            if (mentor.challenges) {
                total += mentor.challenges.length;
                for (const challenge of mentor.challenges) {
                    if (challenges[challenge.id]) completed++;
                }
            }
        }

        return total > 0 ? completed / total : 0;
    }

    // Badge system
    get badges() {
        return this.saveSystem.data.badges || [];
    }

    awardBadge(badgeId) {
        if (!this.saveSystem.data.badges) this.saveSystem.data.badges = [];
        if (!this.saveSystem.data.badges.includes(badgeId)) {
            this.saveSystem.data.badges.push(badgeId);
            this.saveSystem.save();
            window.dispatchEvent(new CustomEvent('badgeEarned', { detail: { badgeId } }));
        }
    }

    checkBadges() {
        // Auto-check for earned badges
        if (this.level >= 5 && !this.badges.includes('level_5')) this.awardBadge('level_5');
        if (this.level >= 10 && !this.badges.includes('level_10')) this.awardBadge('level_10');

        for (let w = 1; w <= CONFIG.academy.totalWorlds; w++) {
            if (this.getWorldCompletion(w) >= 1 && !this.badges.includes(`world_${w}_complete`)) {
                this.awardBadge(`world_${w}_complete`);
            }
        }

        const totalChallenges = Object.keys(this.saveSystem.data.completedChallenges || {}).length;
        if (totalChallenges >= 10 && !this.badges.includes('10_challenges')) this.awardBadge('10_challenges');
        if (totalChallenges >= 25 && !this.badges.includes('25_challenges')) this.awardBadge('25_challenges');
    }
}

// Badge definitions
const BADGES = {
    level_5: { name_nl: 'AI Leerling', name_en: 'AI Apprentice', icon: '🎓' },
    level_10: { name_nl: 'AI Expert', name_en: 'AI Expert', icon: '🏆' },
    world_1_complete: { name_nl: 'Ontwaakt', name_en: 'Awakened', icon: '🌅' },
    world_2_complete: { name_nl: 'Prompt Smid', name_en: 'Prompt Smith', icon: '🔨' },
    world_3_complete: { name_nl: 'Context Meester', name_en: 'Context Master', icon: '💎' },
    world_4_complete: { name_nl: 'Voorbeeld Expert', name_en: 'Example Expert', icon: '🌾' },
    '10_challenges': { name_nl: '10 Uitdagingen', name_en: '10 Challenges', icon: '⭐' },
    '25_challenges': { name_nl: '25 Uitdagingen', name_en: '25 Challenges', icon: '🌟' },
    first_perfect: { name_nl: 'Perfectionist', name_en: 'Perfectionist', icon: '💯' },
    all_mentors_met: { name_nl: 'Sociaal Dier', name_en: 'Social Butterfly', icon: '🦋' },
};

window.ScoreSystem = ScoreSystem;
window.BADGES = BADGES;
export { ScoreSystem, BADGES };
