/**
 * AI Academy - Internationalization System
 * Bilingual NL/EN support with language toggle
 */

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('ai_academy_lang') || 'nl';
        this.strings = {
            nl: {
                // Game title
                'game.title': 'AI Academy',
                'game.subtitle': 'Leer AI door te spelen',
                'game.loading': 'Wereld wordt geladen...',

                // HUD
                'hud.world': 'Wereld',
                'hud.level': 'Level',
                'hud.xp': 'XP',
                'hud.badges': 'Badges',
                'hud.challenges': 'Uitdagingen',
                'hud.completion': 'Voortgang',

                // Controls
                'controls.title': 'Besturing',
                'controls.move': 'Bewegen',
                'controls.jump': 'Springen',
                'controls.sprint': 'Rennen',
                'controls.talk': 'Praten met mentor',
                'controls.camera': 'Camera modus',
                'controls.map': 'Wereldkaart',
                'controls.escape': 'Sluiten',

                // Dialogue
                'dialogue.placeholder': 'Typ je bericht of druk V om te spreken...',
                'dialogue.hint': 'ENTER om te verzenden | V voor spraak | ESC om te sluiten',
                'dialogue.thinking': 'Aan het nadenken...',

                // Challenge types
                'challenge.prompt_writing': 'Prompt Schrijven',
                'challenge.quiz': 'Quiz',
                'challenge.matching': 'Matchen',
                'challenge.evaluation': 'Evaluatie',
                'challenge.boss': 'Baasgevecht',
                'challenge.submit': 'Verzenden',
                'challenge.skip': 'Overslaan',
                'challenge.stars': 'sterren',
                'challenge.complete': 'Uitdaging voltooid!',
                'challenge.failed': 'Probeer het opnieuw',

                // Worlds
                'world.1.name': 'Het Ontwaken',
                'world.1.skill': 'Wat is AI?',
                'world.2.name': 'De Prompt Smederij',
                'world.2.skill': 'Prompt Engineering',
                'world.3.name': 'Context Grotten',
                'world.3.skill': 'Context Windows & Geheugen',
                'world.4.name': 'Few-Shot Velden',
                'world.4.skill': 'Few-shot Learning',
                'world.5.name': 'Keten van Gedachten Bergen',
                'world.5.skill': 'Stap-voor-stap Redeneren',
                'world.6.name': 'De RAG Ruines',
                'world.6.skill': 'Retrieval-Augmented Generation',
                'world.7.name': 'Fine-Tune Fabriek',
                'world.7.skill': 'Model Aanpassing',
                'world.8.name': 'Agent Arena',
                'world.8.skill': 'AI Agents & Tools',
                'world.9.name': 'De Ethiek Citadel',
                'world.9.skill': 'Verantwoorde AI',
                'world.10.name': 'Finale Integratie',
                'world.10.skill': 'Alle vaardigheden gecombineerd',

                // Portal
                'portal.locked': 'Portaal vergrendeld - Rond meer uitdagingen af',
                'portal.ready': 'Portaal actief! Loop erin om te reizen',
                'portal.travel': 'Reizen naar',

                // Notifications
                'notify.levelup': 'Level omhoog!',
                'notify.badge': 'Badge verdiend',
                'notify.xp': 'XP verdiend',
                'notify.worldcomplete': 'Wereld voltooid!',
                'notify.newchallenge': 'Nieuwe uitdaging beschikbaar',

                // World Map
                'map.title': 'Wereldkaart',
                'map.locked': 'Vergrendeld',
                'map.current': 'Huidige wereld',
                'map.completed': 'Voltooid',

                // Boss
                'boss.encounter': 'Baasgevecht!',
                'boss.round': 'Ronde',
                'boss.victory': 'Overwonnen!',
                'boss.defeat': 'Verslagen... Probeer opnieuw',

                // Scores
                'score.perfect': 'Perfect!',
                'score.great': 'Geweldig!',
                'score.good': 'Goed!',
                'score.ok': 'Kan beter',
                'score.retry': 'Probeer opnieuw',

                // AI instruction for mentors
                'ai.language_instruction': 'Antwoord altijd in het Nederlands. Gebruik eenvoudige, toegankelijke taal geschikt voor beginners.',

                // Language toggle
                'lang.switch': 'EN',
                'lang.current': 'NL',
            },
            en: {
                // Game title
                'game.title': 'AI Academy',
                'game.subtitle': 'Learn AI by Playing',
                'game.loading': 'Loading world...',

                // HUD
                'hud.world': 'World',
                'hud.level': 'Level',
                'hud.xp': 'XP',
                'hud.badges': 'Badges',
                'hud.challenges': 'Challenges',
                'hud.completion': 'Progress',

                // Controls
                'controls.title': 'Controls',
                'controls.move': 'Move',
                'controls.jump': 'Jump',
                'controls.sprint': 'Sprint',
                'controls.talk': 'Talk to mentor',
                'controls.camera': 'Camera mode',
                'controls.map': 'World map',
                'controls.escape': 'Close',

                // Dialogue
                'dialogue.placeholder': 'Type your message or press V to speak...',
                'dialogue.hint': 'ENTER to send | V for voice | ESC to close',
                'dialogue.thinking': 'Thinking...',

                // Challenge types
                'challenge.prompt_writing': 'Prompt Writing',
                'challenge.quiz': 'Quiz',
                'challenge.matching': 'Matching',
                'challenge.evaluation': 'Evaluation',
                'challenge.boss': 'Boss Battle',
                'challenge.submit': 'Submit',
                'challenge.skip': 'Skip',
                'challenge.stars': 'stars',
                'challenge.complete': 'Challenge complete!',
                'challenge.failed': 'Try again',

                // Worlds
                'world.1.name': 'The Awakening',
                'world.1.skill': 'What is AI?',
                'world.2.name': 'The Prompt Forge',
                'world.2.skill': 'Prompt Engineering',
                'world.3.name': 'Context Caverns',
                'world.3.skill': 'Context Windows & Memory',
                'world.4.name': 'Few-Shot Fields',
                'world.4.skill': 'Few-shot Learning',
                'world.5.name': 'Chain of Thought Mountains',
                'world.5.skill': 'Step-by-step Reasoning',
                'world.6.name': 'The RAG Ruins',
                'world.6.skill': 'Retrieval-Augmented Generation',
                'world.7.name': 'Fine-Tune Factory',
                'world.7.skill': 'Model Customization',
                'world.8.name': 'Agent Arena',
                'world.8.skill': 'AI Agents & Tools',
                'world.9.name': 'The Ethics Citadel',
                'world.9.skill': 'Responsible AI',
                'world.10.name': 'Final Integration',
                'world.10.skill': 'All Skills Combined',

                // Portal
                'portal.locked': 'Portal locked - Complete more challenges',
                'portal.ready': 'Portal active! Walk in to travel',
                'portal.travel': 'Traveling to',

                // Notifications
                'notify.levelup': 'Level up!',
                'notify.badge': 'Badge earned',
                'notify.xp': 'XP earned',
                'notify.worldcomplete': 'World completed!',
                'notify.newchallenge': 'New challenge available',

                // World Map
                'map.title': 'World Map',
                'map.locked': 'Locked',
                'map.current': 'Current world',
                'map.completed': 'Completed',

                // Boss
                'boss.encounter': 'Boss Battle!',
                'boss.round': 'Round',
                'boss.victory': 'Victory!',
                'boss.defeat': 'Defeated... Try again',

                // Scores
                'score.perfect': 'Perfect!',
                'score.great': 'Great!',
                'score.good': 'Good!',
                'score.ok': 'Could be better',
                'score.retry': 'Try again',

                // AI instruction for mentors
                'ai.language_instruction': 'Always respond in English. Use simple, accessible language suitable for beginners.',

                // Language toggle
                'lang.switch': 'NL',
                'lang.current': 'EN',
            }
        };
    }

    t(key, replacements = {}) {
        let str = this.strings[this.currentLang]?.[key] || this.strings['en']?.[key] || key;
        for (const [k, v] of Object.entries(replacements)) {
            str = str.replace(`{${k}}`, v);
        }
        return str;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('ai_academy_lang', lang);
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    toggleLanguage() {
        this.setLanguage(this.currentLang === 'nl' ? 'en' : 'nl');
    }

    get lang() {
        return this.currentLang;
    }
}

window.I18n = I18n;
window.i18n = new I18n();
