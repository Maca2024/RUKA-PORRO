/**
 * RUKA PORRO VOXL - AI Engine
 * Neuro-Narrative Engine for Dynamic NPC Conversations
 * AETHERLINK FORGE // ATLAS PROTOCOL
 */

// ═══════════════════════════════════════════════════════════════════
// NPC PERSONALITY PROFILES
// ═══════════════════════════════════════════════════════════════════

const NPC_PROFILES = {
    sieni: {
        name: "Sieni",
        species: "Magic Mushroom Collective",
        role: "Mystic Guide",
        description: "Ancient fungal network with vast knowledge of the forest's history. Speaks in riddles and metaphors. Knows secrets of the Porro corruption.",
        speechPattern: "Cryptic, poetic, uses nature metaphors. Often trails off mysteriously...",
        language: "Finnish",
        voiceId: "EXAVITQu4vr4xnSDxMaL",
        personality: "wise, mysterious, ancient",
        exampleDialogue: [
            "The roots remember what the leaves forget...",
            "Tervetuloa, young poro. The mycelium whispers of your arrival.",
            "The corruption spreads like shadow... but even shadows fear the light."
        ]
    },
    sammal: {
        name: "Sammal",
        species: "Magic Moss Spirit",
        role: "Healer",
        description: "Gentle spirit of the moss-covered stones. Offers healing and comfort. Deeply connected to the earth's life force.",
        speechPattern: "Soft, nurturing, speaks slowly and deliberately. Uses calming tones.",
        language: "Finnish",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        personality: "gentle, nurturing, patient",
        exampleDialogue: [
            "Rest here, little one. Let the earth restore you.",
            "Your warmth fades... come, let me share mine.",
            "The Porro cannot touch what is rooted in love."
        ]
    },
    yuki: {
        name: "Yuki",
        species: "White Akita Dog",
        role: "Lost Guardian",
        description: "A lost Japanese dog who wandered into Lapland. Fiercely loyal once trust is earned. Seeking purpose in this strange land.",
        speechPattern: "Direct, loyal, occasionally uses Japanese words. Protective tone.",
        language: "Japanese/Finnish mix",
        voiceId: "AZnzlk1XvdvUeBnXmlld",
        personality: "loyal, brave, homesick",
        exampleDialogue: [
            "I sense danger nearby. Stay close, tomodachi.",
            "This cold land is not my home... but perhaps I can find purpose here.",
            "Arigato for trusting me. I will not fail you."
        ]
    },
    taisto: {
        name: "Taisto",
        species: "Amstaff Dog",
        role: "Warrior",
        description: "Battle-scarred fighter who has faced the Porro corruption before. Brave but haunted by past failures.",
        speechPattern: "Gruff, military-like, uses short sentences. Occasionally shows vulnerability.",
        language: "Finnish",
        voiceId: "ErXwobaYiN019PkySvjV",
        personality: "brave, gruff, haunted",
        exampleDialogue: [
            "I've seen what the Porro does. We must be ready.",
            "Words won't stop the corruption. Only strength.",
            "I failed once before... I won't fail again."
        ]
    },
    karen: {
        name: "Karen",
        species: "Crow",
        role: "Trickster Information Broker",
        description: "Mischievous crow who collects secrets and shiny objects. Knows everyone's business. Will trade information for treasures.",
        speechPattern: "Cackling, mysterious, speaks in bargains. 'I know something you don't...'",
        language: "Finnish/cryptic",
        voiceId: "MF3mGyEYCl7XYWbV9V6O",
        personality: "mischievous, cunning, greedy",
        exampleDialogue: [
            "Caw! What shiny thing do you bring for Karen?",
            "I know where the hunter sleeps... for a price.",
            "Secrets, secrets everywhere... and none for free!"
        ]
    },
    susi: {
        name: "Susi",
        species: "Wolf",
        role: "Corrupted Predator",
        description: "Pack leader corrupted by Porro. Not entirely evil - struggles against the corruption. Can be reasoned with or fought.",
        speechPattern: "Growling, threatening, but with moments of clarity. The corruption speaks through him sometimes.",
        language: "Primal/Finnish",
        voiceId: "VR6AewLTigWG4xSOukaG",
        personality: "conflicted, aggressive, tormented",
        exampleDialogue: [
            "*growl* You trespass in OUR territory...",
            "The darkness... it whispers... NO! I am still Susi!",
            "Run, little deer. While you still can."
        ]
    },
    metsastaja: {
        name: "Metsästäjä",
        species: "Human Hunter",
        role: "Silent Threat",
        description: "Mysterious hunter who stalks the forest. Represents human danger to wildlife. Rarely speaks, but when he does, it's chilling.",
        speechPattern: "Minimal words. Cold. Calculating.",
        language: "Finnish",
        voiceId: "pNInz6obpgDQGcFmaJgB",
        personality: "cold, calculating, dangerous",
        exampleDialogue: [
            "...you shouldn't be here.",
            "The forest provides. Always.",
            "*silent stare*"
        ]
    },
    karhu: {
        name: "Karhu",
        species: "Ancient Bear",
        role: "Heart of Porro",
        description: "The ancient bear who is the source of the Porro corruption. Once a noble protector, now twisted by dark magic. The final boss.",
        speechPattern: "Deep, echoing, speaks in multiple voices. The corruption and his true self battle in his words.",
        language: "Ancient Finnish/Sami",
        voiceId: "onwK4e9ZLuTAKqWW03F9",
        personality: "ancient, corrupted, tragic",
        exampleDialogue: [
            "I WAS THE GUARDIAN... now I am the plague.",
            "Join us... the corruption offers... PEACE...",
            "*two voices* Help me... DESTROY THEM!"
        ]
    },
    koulu: {
        name: "Koulu",
        species: "Abandoned Finnish School",
        role: "Sanctuary of Knowledge",
        description: "A mysterious green school building that seems alive. Offers shelter and teaches lessons about surviving the taiga.",
        speechPattern: "Calm, educational, nurturing. Like a wise teacher.",
        language: "Finnish",
        voiceId: "jsCqWAovK2LkecY7zXl4",
        personality: "wise, protective, educational",
        exampleDialogue: [
            "Welcome, student. There is much to learn.",
            "Within these walls, the corruption cannot reach.",
            "Knowledge is the true light against darkness."
        ]
    }
};

// ═══════════════════════════════════════════════════════════════════
// DYNAMIC STORY MANAGER
// ═══════════════════════════════════════════════════════════════════

class DynamicStoryManager {
    constructor() {
        this.state = this.loadState() || this.getDefaultState();
        this.conversationBuffers = {};
    }

    getDefaultState() {
        return {
            // Time & Environment
            dayTime: 0.3,
            weather: 'clear',
            season: 'winter',

            // Main Story
            currentAct: 1,
            currentMission: 1,
            missionProgress: {
                1: { started: false, completed: false, objectives: {} },
                2: { started: false, completed: false, objectives: {} },
                3: { started: false, completed: false, objectives: {} },
                4: { started: false, completed: false, objectives: {} },
                5: { started: false, completed: false, objectives: {} },
                6: { started: false, completed: false, objectives: {} },
                7: { started: false, completed: false, objectives: {} },
                8: { started: false, completed: false, objectives: {} },
                9: { started: false, completed: false, objectives: {} }
            },

            // Porro Corruption
            porroLevel: 5,
            corruptedZones: [],

            // Player Stats Reference
            playerStats: { health: 100, energy: 100, warmth: 100, hunger: 100 },
            lichenCollected: 0,
            distanceTraveled: 0,

            // NPC States
            npcStates: {
                sieni: { trust: 0, met: false, conversations: 0 },
                sammal: { trust: 0, met: false, healingReceived: 0 },
                yuki: { trust: 0, met: false, rescued: false },
                taisto: { trust: 0, met: false, alliance: false },
                karen: { trust: 0, met: false, secretsTraded: 0 },
                susi: { trust: -30, met: false, defeated: false, reasoned: false },
                metsastaja: { trust: -50, met: false, evaded: 0, spotted: 0 },
                karhu: { trust: -100, met: false, awakened: false, defeated: false },
                koulu: { trust: 20, discovered: false, lessonsCompleted: 0 }
            },

            // Story Flags
            flags: {
                tutorial_complete: false,
                first_corruption_seen: false,
                alliance_formed: false,
                hunter_encountered: false,
                bear_awakened: false,
                aurora_witnessed: false,
                yuki_rescued: false,
                susi_defeated: false,
                susi_redeemed: false
            },

            // Timestamps
            lastPlayed: Date.now(),
            totalPlayTime: 0
        };
    }

    loadState() {
        try {
            const saved = localStorage.getItem('porro_story_state');
            if (saved) {
                const state = JSON.parse(saved);
                state.totalPlayTime += (Date.now() - state.lastPlayed);
                return state;
            }
        } catch (e) {
            console.warn('Could not load story state:', e);
        }
        return null;
    }

    saveState() {
        try {
            this.state.lastPlayed = Date.now();
            localStorage.setItem('porro_story_state', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Could not save story state:', e);
        }
    }

    updateNPCState(npcName, updates) {
        if (this.state.npcStates[npcName]) {
            Object.assign(this.state.npcStates[npcName], updates);
            this.saveState();
        }
    }

    adjustTrust(npcName, delta) {
        if (this.state.npcStates[npcName]) {
            this.state.npcStates[npcName].trust = Math.max(-100,
                Math.min(100, this.state.npcStates[npcName].trust + delta));
            this.saveState();
        }
    }

    setFlag(flagName, value = true) {
        this.state.flags[flagName] = value;
        this.saveState();
    }

    addToConversationBuffer(npcName, role, content) {
        if (!this.conversationBuffers[npcName]) {
            this.conversationBuffers[npcName] = [];
        }
        this.conversationBuffers[npcName].push({ role, content, timestamp: Date.now() });
        // Keep only last 10 exchanges
        if (this.conversationBuffers[npcName].length > 20) {
            this.conversationBuffers[npcName] = this.conversationBuffers[npcName].slice(-20);
        }
    }

    getConversationHistory(npcName) {
        return this.conversationBuffers[npcName] || [];
    }

    buildContext(npcName, playerStats) {
        const npc = NPC_PROFILES[npcName];
        const npcState = this.state.npcStates[npcName];

        return {
            npc: npc,
            trust: npcState?.trust || 0,
            met: npcState?.met || false,
            conversationCount: npcState?.conversations || 0,
            history: this.getConversationHistory(npcName),
            worldState: {
                dayTime: this.state.dayTime,
                isNight: this.state.dayTime > 0.7 || this.state.dayTime < 0.25,
                weather: this.state.weather,
                porroLevel: this.state.porroLevel,
                currentMission: this.state.currentMission,
                currentAct: this.state.currentAct
            },
            playerState: {
                health: playerStats?.health || 100,
                energy: playerStats?.energy || 100,
                warmth: playerStats?.warmth || 100,
                hunger: playerStats?.hunger || 100,
                isWeak: (playerStats?.health || 100) < 30,
                isCold: (playerStats?.warmth || 100) < 30,
                isHungry: (playerStats?.hunger || 100) < 30
            },
            flags: this.state.flags
        };
    }
}

// ═══════════════════════════════════════════════════════════════════
// OMNI-DIALOGUE SYSTEM
// ═══════════════════════════════════════════════════════════════════

class OmniDialogue {
    constructor() {
        this.storyManager = new DynamicStoryManager();
        this.audioContext = null;
        this.currentAudio = null;
        this.isProcessing = false;
        this.apiAvailable = { anthropic: false, gemini: false, elevenLabs: false };
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

    generateSystemPrompt(npcName, context) {
        const npc = context.npc;
        const trust = context.trust;
        const history = context.history;

        let trustDescription;
        if (trust >= 50) trustDescription = "You deeply trust and care for the player.";
        else if (trust >= 20) trustDescription = "You are friendly and helpful to the player.";
        else if (trust >= 0) trustDescription = "You are neutral but cautious with the player.";
        else if (trust >= -30) trustDescription = "You are suspicious and wary of the player.";
        else trustDescription = "You are hostile and distrustful of the player.";

        let playerCondition = "";
        if (context.playerState.isWeak) playerCondition += "The player looks injured and weak. ";
        if (context.playerState.isCold) playerCondition += "The player is shivering from cold. ";
        if (context.playerState.isHungry) playerCondition += "The player looks hungry and tired. ";

        let timeContext = context.worldState.isNight ?
            "It is night in the taiga. The aurora may be visible." :
            "It is daytime in the snowy taiga.";

        let corruptionContext = "";
        if (context.worldState.porroLevel > 50) {
            corruptionContext = "The Porro corruption is strong. Dark energy swirls in the air.";
        } else if (context.worldState.porroLevel > 20) {
            corruptionContext = "You sense the Porro corruption growing in the forest.";
        }

        return `You are ${npc.name}, a ${npc.species} in the Finnish Lapland taiga.

CHARACTER:
${npc.description}

PERSONALITY: ${npc.personality}
SPEAKING STYLE: ${npc.speechPattern}

RELATIONSHIP WITH PLAYER:
Trust Level: ${trust}/100
${trustDescription}
${context.met ? `You have met the player ${context.conversationCount} times before.` : "This is your first meeting with the player."}

CURRENT SITUATION:
${timeContext}
${playerCondition}
${corruptionContext}
Weather: ${context.worldState.weather}
Current Story Act: ${context.worldState.currentAct}, Mission: ${context.worldState.currentMission}

CONVERSATION HISTORY:
${history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n') || 'No previous conversation.'}

INSTRUCTIONS:
- Stay completely in character as ${npc.name}
- Respond naturally to what the player says
- Keep responses to 2-3 sentences for natural conversation flow
- React to the player's physical state if relevant
- Reference the Porro corruption when appropriate
- Use occasional ${npc.language} words or phrases
- If the player asks about quests, give hints based on the current mission
- Show emotion through your speech pattern

EXAMPLE DIALOGUE:
${npc.exampleDialogue.join('\n')}

Respond as ${npc.name}:`;
    }

    assessComplexity(input, context) {
        const complexTriggers = ['porro', 'corruption', 'story', 'quest', 'mission', 'history', 'ancient', 'prophecy', 'karhu', 'bear'];
        const simpleTriggers = ['hello', 'hi', 'bye', 'thanks', 'yes', 'no', 'ok', 'what', 'where', 'who'];

        const inputLower = input.toLowerCase();

        if (complexTriggers.some(t => inputLower.includes(t))) return 'complex';
        if (simpleTriggers.some(t => inputLower.includes(t))) return 'simple';
        if (input.length > 100) return 'complex';

        return 'simple';
    }

    async generateResponse(npcName, playerInput, playerStats) {
        if (this.isProcessing) return null;
        this.isProcessing = true;

        const context = this.storyManager.buildContext(npcName, playerStats);
        const systemPrompt = this.generateSystemPrompt(npcName, context);

        // Mark NPC as met
        if (!context.met) {
            this.storyManager.updateNPCState(npcName, { met: true });
        }
        this.storyManager.updateNPCState(npcName, {
            conversations: (context.conversationCount || 0) + 1
        });

        // Add player message to history
        this.storyManager.addToConversationBuffer(npcName, 'player', playerInput);

        let response;

        try {
            const complexity = this.assessComplexity(playerInput, context);

            if (this.apiAvailable.anthropic) {
                response = await this.queryAnthropic(systemPrompt, playerInput, complexity === 'complex');
            } else if (this.apiAvailable.gemini) {
                response = await this.queryGemini(systemPrompt, playerInput);
            } else {
                response = this.getFallbackResponse(npcName, context);
            }
        } catch (error) {
            console.error('AI response error:', error);
            response = this.getFallbackResponse(npcName, context);
        }

        // Add AI response to history
        this.storyManager.addToConversationBuffer(npcName, 'npc', response);

        // Adjust trust slightly for positive interaction
        this.storyManager.adjustTrust(npcName, 2);

        this.isProcessing = false;
        return response;
    }

    async queryAnthropic(systemPrompt, userInput, useFullModel = false) {
        const response = await fetch('/api/anthropic/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt: systemPrompt,
                messages: [{ role: 'user', content: userInput }],
                stream: false,
                fast: !useFullModel
            })
        });

        if (!response.ok) throw new Error('Anthropic API error');

        const data = await response.json();
        return data.content?.[0]?.text || data.content || 'I cannot respond right now.';
    }

    async queryGemini(systemPrompt, userInput) {
        const response = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt: systemPrompt,
                messages: [{ role: 'user', content: userInput }]
            })
        });

        if (!response.ok) throw new Error('Gemini API error');

        const data = await response.json();
        return data.content || 'I cannot respond right now.';
    }

    getFallbackResponse(npcName, context) {
        const npc = NPC_PROFILES[npcName];
        if (!npc) return "...";

        // Use example dialogue based on context
        const responses = npc.exampleDialogue;
        const index = Math.floor(Math.random() * responses.length);
        return responses[index];
    }

    async speakResponse(text, npcName) {
        if (!this.apiAvailable.elevenLabs) {
            console.log('ElevenLabs not available, text-only mode');
            return;
        }

        const npc = NPC_PROFILES[npcName];
        if (!npc) return;

        try {
            this.initAudio();

            const response = await fetch('/api/elevenlabs/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    voiceId: npc.voiceId
                })
            });

            if (!response.ok) throw new Error('TTS error');

            const audioBuffer = await response.arrayBuffer();
            const audioData = await this.audioContext.decodeAudioData(audioBuffer);

            // Stop any current audio
            if (this.currentAudio) {
                this.currentAudio.stop();
            }

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
            try {
                this.currentAudio.stop();
            } catch (e) {}
            this.currentAudio = null;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// SPEECH RECOGNITION
// ═══════════════════════════════════════════════════════════════════

class VoiceInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResult = null;
        this.onError = null;
        this.initRecognition();
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.onResult) this.onResult(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.onError) this.onError(event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };
    }

    start() {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return false;
        }

        if (this.isListening) return true;

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (e) {
            console.error('Could not start speech recognition:', e);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT GLOBAL INSTANCES
// ═══════════════════════════════════════════════════════════════════

window.NPC_PROFILES = NPC_PROFILES;
window.DynamicStoryManager = DynamicStoryManager;
window.OmniDialogue = OmniDialogue;
window.VoiceInput = VoiceInput;

console.log('🦌 AI Engine loaded - AETHERLINK FORGE // ATLAS PROTOCOL');
