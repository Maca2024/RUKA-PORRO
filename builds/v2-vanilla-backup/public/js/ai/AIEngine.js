/**
 * AI Academy - AI Engine
 * Educational conversation engine with challenge evaluation
 */

const MENTOR_PROFILES = window.MENTOR_PROFILES;
const i18n = window.i18n;

class AIEngine {
    constructor() {
        this.conversationBuffers = {};
        this.isProcessing = false;
        this.apiAvailable = { anthropic: false, gemini: false, elevenLabs: false };
        this.audioContext = null;
        this.currentAudio = null;
        this.checkAPIStatus();
    }

    async checkAPIStatus() {
        try {
            const response = await fetch('/api/status');
            this.apiAvailable = await response.json();
            console.log('API Status:', this.apiAvailable);
        } catch (e) {
            console.warn('API status check failed, using fallback mode');
        }
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    addToHistory(mentorKey, role, content) {
        if (!this.conversationBuffers[mentorKey]) {
            this.conversationBuffers[mentorKey] = [];
        }
        this.conversationBuffers[mentorKey].push({ role, content, timestamp: Date.now() });
        if (this.conversationBuffers[mentorKey].length > 20) {
            this.conversationBuffers[mentorKey] = this.conversationBuffers[mentorKey].slice(-20);
        }
    }

    getHistory(mentorKey) {
        return this.conversationBuffers[mentorKey] || [];
    }

    generateMentorSystemPrompt(mentorKey, playerInput) {
        const mentor = MENTOR_PROFILES[mentorKey];
        if (!mentor) return '';

        const lang = i18n.lang;
        const langInstruction = i18n.t('ai.language_instruction');
        const description = lang === 'nl' ? mentor.description_nl : mentor.description_en;
        const history = this.getHistory(mentorKey);
        const worldName = i18n.t(`world.${mentor.world}.name`);
        const worldSkill = i18n.t(`world.${mentor.world}.skill`);

        return `Je bent ${mentor.name}, een ${mentor.species} in de AI Academy - een educatief spel dat AI-vaardigheden leert.

KARAKTER:
${description}

PERSOONLIJKHEID: ${mentor.personality}
SPREEKSTIJL: ${mentor.speechPattern}

WERELD: ${worldName} - ${worldSkill}
ROL: ${mentor.role}

${langInstruction}

CONTEXT:
- Dit is een educatief spel voor beginners (16+) die niets van AI weten
- Gebruik eenvoudige taal en veel analogieen
- Leg AI-concepten uit alsof je het aan een tiener uitlegt
- De speler is Porro, een rendier dat door 10 werelden reist om AI te leren
- Elke wereld leert een andere AI-vaardigheid
- Deze wereld gaat over: ${worldSkill}

GESPREKSGESCHIEDENIS:
${history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n') || 'Eerste ontmoeting.'}

INSTRUCTIES:
- Blijf in karakter als ${mentor.name}
- Houd antwoorden kort (2-3 zinnen) voor natuurlijke conversatie
- Relateer alles aan het thema van deze wereld: ${worldSkill}
- Als de speler vragen stelt over AI, geef duidelijke educatieve antwoorden
- Als de speler klaar lijkt, verwijs naar beschikbare uitdagingen
- Wees bemoedigend en geduldig

Antwoord als ${mentor.name}:`;
    }

    async generateResponse(mentorKey, playerInput) {
        if (this.isProcessing) return null;
        this.isProcessing = true;

        const systemPrompt = this.generateMentorSystemPrompt(mentorKey, playerInput);
        this.addToHistory(mentorKey, 'player', playerInput);

        let response;

        try {
            if (this.apiAvailable.anthropic) {
                response = await this.queryAnthropic(systemPrompt, playerInput);
            } else if (this.apiAvailable.gemini) {
                response = await this.queryGemini(systemPrompt, playerInput);
            } else {
                response = this.getFallbackResponse(mentorKey);
            }
        } catch (error) {
            console.error('AI response error:', error);
            response = this.getFallbackResponse(mentorKey);
        }

        this.addToHistory(mentorKey, 'npc', response);
        this.isProcessing = false;
        return response;
    }

    async evaluateChallenge(challengeId, playerResponse, rubric) {
        const lang = i18n.lang;
        const langInstruction = i18n.t('ai.language_instruction');

        const systemPrompt = `Je bent een strenge maar eerlijke AI-docent die studentwerk beoordeelt in de AI Academy.

${langInstruction}

OPDRACHT ID: ${challengeId}

BEOORDELINGSRICHTLIJNEN:
${rubric}

INSTRUCTIES:
- Geef een score van 1-5 sterren
- Geef korte, constructieve feedback (2-3 zinnen)
- Wees bemoedigend maar eerlijk
- Formatteer je antwoord exact als:
SCORE: [1-5]
FEEDBACK: [je feedback hier]`;

        const userMessage = `Beoordeel dit antwoord van de student:\n\n${playerResponse}`;

        try {
            let result;
            if (this.apiAvailable.anthropic) {
                result = await this.queryAnthropic(systemPrompt, userMessage);
            } else if (this.apiAvailable.gemini) {
                result = await this.queryGemini(systemPrompt, userMessage);
            } else {
                return { score: 3, feedback: lang === 'nl' ? 'Goed geprobeerd! Geen AI beschikbaar voor gedetailleerde feedback.' : 'Good try! No AI available for detailed feedback.' };
            }

            // Parse response
            const scoreMatch = result.match(/SCORE:\s*(\d)/);
            const feedbackMatch = result.match(/FEEDBACK:\s*([\s\S]+)/);

            return {
                score: scoreMatch ? parseInt(scoreMatch[1]) : 3,
                feedback: feedbackMatch ? feedbackMatch[1].trim() : result
            };
        } catch (error) {
            console.error('Evaluation error:', error);
            return { score: 3, feedback: lang === 'nl' ? 'Kon niet beoordelen. Probeer opnieuw.' : 'Could not evaluate. Try again.' };
        }
    }

    async queryAnthropic(systemPrompt, userInput) {
        const response = await fetch('/api/anthropic/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt,
                messages: [{ role: 'user', content: userInput }],
                stream: false,
                fast: false
            })
        });

        if (!response.ok) throw new Error('Anthropic API error');
        const data = await response.json();
        return data.content?.[0]?.text || data.content || 'Ik kan nu niet antwoorden.';
    }

    async queryGemini(systemPrompt, userInput) {
        const response = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt,
                messages: [{ role: 'user', content: userInput }]
            })
        });

        if (!response.ok) throw new Error('Gemini API error');
        const data = await response.json();
        return data.content || 'Ik kan nu niet antwoorden.';
    }

    getFallbackResponse(mentorKey) {
        const mentor = MENTOR_PROFILES[mentorKey];
        if (!mentor) return '...';

        const lang = i18n.lang;
        const fallbacks = {
            nl: [
                `Welkom, jonge leerling. Ik ben ${mentor.name}. Vraag me iets over ${i18n.t(`world.${mentor.world}.skill`)}!`,
                `Interessante vraag! In deze wereld leer je over ${i18n.t(`world.${mentor.world}.skill`)}.`,
                `Goed dat je hier bent. Probeer een van mijn uitdagingen!`
            ],
            en: [
                `Welcome, young student. I am ${mentor.name}. Ask me about ${i18n.t(`world.${mentor.world}.skill`)}!`,
                `Interesting question! In this world you learn about ${i18n.t(`world.${mentor.world}.skill`)}.`,
                `Good that you're here. Try one of my challenges!`
            ]
        };

        const responses = fallbacks[lang] || fallbacks.en;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async speakResponse(text, mentorKey) {
        if (!this.apiAvailable.elevenLabs) return;

        const mentor = MENTOR_PROFILES[mentorKey];
        if (!mentor?.voiceId) return;

        try {
            this.initAudio();
            const response = await fetch('/api/elevenlabs/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId: mentor.voiceId })
            });

            if (!response.ok) throw new Error('TTS error');

            const audioBuffer = await response.arrayBuffer();
            const audioData = await this.audioContext.decodeAudioData(audioBuffer);

            if (this.currentAudio) this.currentAudio.stop();

            const source = this.audioContext.createBufferSource();
            source.buffer = audioData;
            source.connect(this.audioContext.destination);
            source.start();
            this.currentAudio = source;
        } catch (error) {
            console.error('TTS error:', error);
        }
    }

    stopSpeaking() {
        if (this.currentAudio) {
            try { this.currentAudio.stop(); } catch (e) {}
            this.currentAudio = null;
        }
    }
}

window.AIEngine = AIEngine;
export { AIEngine };
