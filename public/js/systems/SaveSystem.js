/**
 * AI Academy - Save System
 * localStorage persistence for all progression
 */

class SaveSystem {
    constructor() {
        this.storageKey = 'ai_academy_save';
        this.data = this.load();
    }

    getDefaults() {
        return {
            // Progression
            xp: 0,
            currentWorld: 1,
            highestWorld: 1,

            // Challenge completion: { challengeId: { score, completedAt } }
            completedChallenges: {},

            // Badges earned
            badges: [],

            // Mentor interactions
            mentorsMet: [],
            conversationCounts: {},

            // Settings
            language: 'nl',

            // Timestamps
            createdAt: Date.now(),
            lastPlayed: Date.now(),
            totalPlayTime: 0
        };
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                data.totalPlayTime += (Date.now() - (data.lastPlayed || Date.now()));
                return { ...this.getDefaults(), ...data };
            }
        } catch (e) {
            console.warn('Could not load save data:', e);
        }
        return this.getDefaults();
    }

    save() {
        try {
            this.data.lastPlayed = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save data:', e);
        }
    }

    completeChallenge(challengeId, score) {
        if (!this.data.completedChallenges) this.data.completedChallenges = {};

        const existing = this.data.completedChallenges[challengeId];
        if (!existing || score > existing.score) {
            this.data.completedChallenges[challengeId] = {
                score,
                completedAt: Date.now()
            };
        }
        this.save();
    }

    isChallengeCompleted(challengeId) {
        return !!this.data.completedChallenges?.[challengeId];
    }

    getChallengeScore(challengeId) {
        return this.data.completedChallenges?.[challengeId]?.score || 0;
    }

    meetMentor(mentorKey) {
        if (!this.data.mentorsMet.includes(mentorKey)) {
            this.data.mentorsMet.push(mentorKey);
        }
        this.data.conversationCounts[mentorKey] = (this.data.conversationCounts[mentorKey] || 0) + 1;
        this.save();
    }

    setCurrentWorld(worldId) {
        this.data.currentWorld = worldId;
        if (worldId > this.data.highestWorld) {
            this.data.highestWorld = worldId;
        }
        this.save();
    }

    reset() {
        this.data = this.getDefaults();
        this.save();
    }
}

window.SaveSystem = SaveSystem;
