# RUKA PORRO VOXL - System Architecture Blueprint

## AETHERLINK FORGE // ATLAS PROTOCOL // L3: STRATEGIC ARCHITECTURE

---

## Executive Summary

This document defines the complete technical architecture for scaling RUKA PORRO VOXL from a prototype to a production-grade open-world experience with real-time AI-powered NPC conversations.

### Key Deliverables
1. **10x World Expansion** - From 400x400 to 4000x4000 units
2. **Neuro-Narrative Engine** - Dynamic AI-driven storylines
3. **Omni-Dialogue System** - Real-time voice conversations with NPCs
4. **Multi-Modal AI Integration** - Anthropic Claude + Google Gemini + ElevenLabs

---

## 1. THINKING PROCESS LOG

### Architectural Decisions Made

#### Decision 1: Spatial Scaling Strategy
**Problem:** 10x map expansion would create 100x more geometry, causing memory overflow.
**Solution:** Implement Chunk-Based Streaming with LOD (Level of Detail)
- World divided into 64x64 unit chunks
- Only 5x5 chunk grid (25 chunks) loaded around player
- Far chunks use simplified geometry
- Procedural generation for unexplored areas

#### Decision 2: Latency Architecture for Voice
**Problem:** Real-time voice requires <1000ms total latency.
**Solution:** Streaming Pipeline Architecture
```
STT (150ms) -> LLM Streaming (300ms first token) -> TTS Streaming (200ms first audio)
Total First Response: ~650ms (acceptable)
```

#### Decision 3: AI Model Selection
**Problem:** Balance between intelligence and speed.
**Solution:** Tiered AI System
- **Gemini 1.5 Flash**: Quick responses, ambient dialogue, simple questions
- **Claude 3.5 Sonnet**: Complex lore, plot decisions, emotional moments
- **Claude 3.5 Opus**: Critical story moments, boss dialogues (fallback)

#### Decision 4: Memory Architecture
**Problem:** NPCs need persistent memory across sessions.
**Solution:** Hybrid Memory System
- **Short-term**: JSON state in localStorage
- **Long-term**: Vector embeddings for semantic search (future)
- **Session**: Conversation buffer (last 10 exchanges)

---

## 2. THE WORLD-SCALE ALGORITHM

### 2.1 Macro-Grid Chunk System

```
WORLD STRUCTURE (4000 x 4000 units)
├── Chunk Grid: 62 x 62 chunks (each 64x64 units)
├── Active Zone: 5x5 chunks around player (320x320 visible)
├── Buffer Zone: +2 chunks (pre-loading)
└── Generation Zones:
    ├── ZONE_NORTH: Karhu Territory (Mountains, Boss Area)
    ├── ZONE_EAST: Susi Domain (Dense Forest, Wolf Packs)
    ├── ZONE_WEST: Koulu Haven (Clearings, Safe Zones)
    ├── ZONE_SOUTH: Metsästäjä Grounds (Human Settlements)
    └── ZONE_CENTER: Starting Area (Tutorial, Friendly NPCs)
```

### 2.2 Procedural Generation Algorithm

```javascript
ChunkGenerator {
    generateChunk(chunkX, chunkZ) {
        // 1. Determine biome from world position
        biome = getBiomeAt(chunkX * 64, chunkZ * 64)

        // 2. Generate height map using multi-octave noise
        heightMap = generatePerlinNoise(chunkX, chunkZ, {
            octaves: 4,
            persistence: 0.5,
            lacunarity: 2.0,
            scale: 0.02
        })

        // 3. Apply biome modifiers
        if (biome == MOUNTAIN) heightMap *= 2.5
        if (biome == VALLEY) heightMap *= 0.3

        // 4. Generate features
        trees = placeTrees(biome, density: 0.15)
        rocks = placeRocks(biome, density: 0.05)
        lichen = placeLichen(biome, density: 0.02)

        // 5. Place NPCs if chunk contains spawn point
        npcs = checkNPCSpawns(chunkX, chunkZ)

        return Chunk { heightMap, trees, rocks, lichen, npcs }
    }
}
```

### 2.3 LOD System

| Distance | LOD Level | Detail |
|----------|-----------|--------|
| 0-64 units | LOD0 | Full detail, all objects |
| 64-192 units | LOD1 | Reduced tree geometry, no small objects |
| 192-320 units | LOD2 | Billboard trees, terrain only |
| 320+ units | LOD3 | Fog/hidden |

---

## 3. THE NEURO-VOICE PIPELINE

### 3.1 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYER INTERACTION                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SPEECH-TO-TEXT (Web Speech API / Whisper)                      │
│  ├── Input: Player voice                                         │
│  ├── Output: Transcribed text                                    │
│  └── Latency: ~150ms                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONTEXT BUILDER                                                 │
│  ├── NPC Personality Profile                                     │
│  ├── Current Quest State                                         │
│  ├── Player History (last 10 exchanges)                          │
│  ├── World State (time, weather, corruption level)               │
│  └── Porro Corruption Meter                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI ROUTER (Omni-Dialogue Wrapper)                               │
│  ├── Route to Gemini Flash (simple queries, speed priority)      │
│  ├── Route to Claude Sonnet (complex dialogue, lore)             │
│  └── Route to Claude Opus (critical story moments)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LLM PROCESSING (Streaming)                                      │
│  ├── System Prompt: NPC personality + context                    │
│  ├── User Message: Player input                                  │
│  ├── Output: Streamed response tokens                            │
│  └── Latency: ~300ms to first token                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STORY MANAGER                                                   │
│  ├── Parse response for story triggers                           │
│  ├── Update quest progress                                       │
│  ├── Adjust NPC trust levels                                     │
│  └── Modify world state                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ELEVENLABS TTS (Streaming)                                      │
│  ├── Input: LLM response text                                    │
│  ├── Voice ID: NPC-specific voice                                │
│  ├── Output: Audio stream                                        │
│  └── Latency: ~200ms to first audio chunk                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AUDIO PLAYBACK + SUBTITLES                                      │
│  ├── Play audio with lip-sync indicators                         │
│  ├── Display subtitles                                           │
│  └── Show NPC expression changes                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 API Integration Code Structure

```javascript
// Omni-Dialogue API Wrapper
class OmniDialogue {
    constructor(config) {
        this.anthropicKey = config.anthropicKey;
        this.geminiKey = config.geminiKey;
        this.elevenLabsKey = config.elevenLabsKey;
        this.audioContext = new AudioContext();
    }

    // Route to appropriate AI based on complexity
    async routeQuery(npc, playerInput, context) {
        const complexity = this.assessComplexity(playerInput, context);

        if (complexity === 'simple') {
            return this.queryGeminiFlash(npc, playerInput, context);
        } else if (complexity === 'complex') {
            return this.queryClaudeSonnet(npc, playerInput, context);
        } else {
            return this.queryClaudeOpus(npc, playerInput, context);
        }
    }

    // Streaming response with TTS
    async streamConversation(npc, playerInput, context) {
        const textStream = await this.routeQuery(npc, playerInput, context);
        const audioQueue = [];
        let sentenceBuffer = '';

        for await (const chunk of textStream) {
            sentenceBuffer += chunk;

            // Send complete sentences to TTS
            if (this.isCompleteSentence(sentenceBuffer)) {
                const audioChunk = await this.textToSpeech(
                    sentenceBuffer,
                    npc.voiceId
                );
                audioQueue.push(audioChunk);
                this.playNextAudio(audioQueue);
                sentenceBuffer = '';
            }
        }
    }
}
```

---

## 4. DYNAMIC STORY ENGINE

### 4.1 Story State Structure

```javascript
WorldState = {
    // Time & Environment
    dayTime: 0.0 - 1.0,
    weather: 'clear' | 'snow' | 'blizzard' | 'aurora',
    season: 'winter',

    // Main Story
    currentAct: 1 | 2 | 3,
    currentMission: 1-9,
    missionProgress: {},

    // Porro Corruption
    porroLevel: 0-100,
    corruptedZones: [],

    // Player Stats
    playerStats: { health, energy, warmth, hunger },
    inventory: [],

    // NPC States
    npcStates: {
        sieni: { trust: 0, met: false, quests: [] },
        sammal: { trust: 0, met: false, healing: 0 },
        yuki: { trust: 0, met: false, rescued: false },
        taisto: { trust: 0, met: false, alliance: false },
        karen: { trust: 0, met: false, secrets: [] },
        susi: { trust: 0, defeated: false, pack: 5 },
        metsastaja: { trust: 0, evaded: 0, spotted: 0 },
        karhu: { trust: 0, awakened: false, defeated: false },
        koulu: { discovered: false, lessons: 0 }
    },

    // Conversation History
    conversationHistory: {
        // Per NPC: last 10 exchanges
    },

    // Story Flags
    flags: {
        tutorial_complete: false,
        first_corruption_seen: false,
        alliance_formed: false,
        hunter_encountered: false,
        bear_awakened: false,
        aurora_witnessed: false
    }
}
```

### 4.2 Dynamic Story Manager Class

```javascript
class DynamicStoryManager {
    constructor() {
        this.state = this.loadState() || this.getDefaultState();
        this.triggers = this.initializeTriggers();
        this.narrativeGraph = this.buildNarrativeGraph();
    }

    // Update state based on game events
    processEvent(event) {
        switch(event.type) {
            case 'NPC_INTERACTION':
                this.updateNPCRelationship(event.npc, event.outcome);
                break;
            case 'QUEST_PROGRESS':
                this.advanceQuest(event.quest, event.step);
                break;
            case 'CORRUPTION_CHANGE':
                this.updateCorruption(event.delta);
                break;
            case 'ZONE_ENTERED':
                this.checkZoneTriggers(event.zone);
                break;
        }

        this.checkStoryTriggers();
        this.saveState();
    }

    // Build context for AI conversations
    buildConversationContext(npc) {
        return {
            npcPersonality: NPC_PROFILES[npc.name],
            trustLevel: this.state.npcStates[npc.name].trust,
            currentQuest: this.getCurrentQuest(),
            previousConversations: this.getConversationHistory(npc.name),
            worldContext: {
                timeOfDay: this.state.dayTime,
                weather: this.state.weather,
                porroLevel: this.state.porroLevel,
                playerStats: this.state.playerStats
            },
            storyFlags: this.getRelevantFlags(npc.name)
        };
    }

    // Generate NPC system prompt
    generateSystemPrompt(npc, context) {
        return `
You are ${npc.name}, a ${npc.species} in the Finnish Lapland taiga.

PERSONALITY:
${context.npcPersonality.description}

SPEAKING STYLE:
${context.npcPersonality.speechPattern}

CURRENT RELATIONSHIP:
Trust Level: ${context.trustLevel}/100
Previous Interactions: ${context.previousConversations.length}

WORLD STATE:
- Time: ${context.worldContext.timeOfDay < 0.5 ? 'Day' : 'Night'}
- Weather: ${context.worldContext.weather}
- Porro Corruption: ${context.worldContext.porroLevel}%

CURRENT QUEST:
${JSON.stringify(context.currentQuest)}

INSTRUCTIONS:
- Stay in character at all times
- Reference previous conversations when relevant
- React to the player's current state (tired, hungry, cold)
- Hint at the Porro corruption when appropriate
- Respond in 2-3 sentences maximum for natural conversation
- Use ${context.npcPersonality.language} occasionally
`;
    }
}
```

### 4.3 NPC Personality Profiles

```javascript
const NPC_PROFILES = {
    sieni: {
        name: "Sieni",
        species: "Magic Mushroom Collective",
        role: "Mystic Guide",
        description: "Ancient fungal network with vast knowledge of the forest's history. Speaks in riddles and metaphors. Knows secrets of the Porro corruption.",
        speechPattern: "Cryptic, poetic, uses nature metaphors. Often trails off mysteriously...",
        language: "Finnish",
        voiceId: "EXAVITQu4vr4xnSDxMaL", // ElevenLabs voice
        triggers: ["corruption", "history", "prophecy", "forest"],
        questRole: "Provides cryptic guidance and lore exposition"
    },
    sammal: {
        name: "Sammal",
        species: "Magic Moss Spirit",
        role: "Healer",
        description: "Gentle spirit of the moss-covered stones. Offers healing and comfort. Deeply connected to the earth's life force.",
        speechPattern: "Soft, nurturing, speaks slowly and deliberately. Uses calming tones.",
        language: "Finnish",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        triggers: ["healing", "rest", "peace", "life"],
        questRole: "Heals player, provides safe haven"
    },
    yuki: {
        name: "Yuki",
        species: "White Akita Dog",
        role: "Lost Guardian",
        description: "A lost Japanese dog who wandered into Lapland. Fiercely loyal once trust is earned. Seeking purpose in this strange land.",
        speechPattern: "Direct, loyal, occasionally uses Japanese words. Protective tone.",
        language: "Japanese/Finnish mix",
        voiceId: "AZnzlk1XvdvUeBnXmlld",
        triggers: ["loyalty", "protection", "home", "pack"],
        questRole: "Becomes companion after rescue quest"
    },
    taisto: {
        name: "Taisto",
        species: "Amstaff Dog",
        role: "Warrior",
        description: "Battle-scarred fighter who has faced the Porro corruption before. Brave but haunted by past failures.",
        speechPattern: "Gruff, military-like, uses short sentences. Occasionally shows vulnerability.",
        language: "Finnish",
        voiceId: "ErXwobaYiN019PkySvjV",
        triggers: ["fight", "courage", "corruption", "battle"],
        questRole: "Combat ally in Act III"
    },
    karen: {
        name: "Karen",
        species: "Crow",
        role: "Trickster Information Broker",
        description: "Mischievous crow who collects secrets and shiny objects. Knows everyone's business. Will trade information for treasures.",
        speechPattern: "Cackling, mysterious, speaks in bargains. 'I know something you don't...'",
        language: "Finnish/cryptic",
        voiceId: "MF3mGyEYCl7XYWbV9V6O",
        triggers: ["secrets", "trade", "shiny", "information"],
        questRole: "Provides quest hints for a price"
    },
    susi: {
        name: "Susi",
        species: "Wolf",
        role: "Corrupted Predator",
        description: "Pack leader corrupted by Porro. Not entirely evil - struggles against the corruption. Can be reasoned with or fought.",
        speechPattern: "Growling, threatening, but with moments of clarity. The corruption speaks through him sometimes.",
        language: "Primal/Finnish",
        voiceId: "VR6AewLTigWG4xSOukaG",
        triggers: ["territory", "pack", "corruption", "hunger"],
        questRole: "Act II antagonist, can become ally"
    },
    metsastaja: {
        name: "Metsästäjä",
        species: "Human Hunter",
        role: "Silent Threat",
        description: "Mysterious hunter who stalks the forest. Represents human danger to wildlife. Rarely speaks, but when he does, it's chilling.",
        speechPattern: "Minimal words. Cold. Calculating. 'You shouldn't be here...'",
        language: "Finnish",
        voiceId: "pNInz6obpgDQGcFmaJgB",
        triggers: ["hunting", "danger", "escape", "survival"],
        questRole: "Stealth challenge, evade or confront"
    },
    karhu: {
        name: "Karhu",
        species: "Ancient Bear",
        role: "Heart of Porro",
        description: "The ancient bear who is the source of the Porro corruption. Once a noble protector, now twisted by dark magic. The final boss.",
        speechPattern: "Deep, echoing, speaks in multiple voices. The corruption and his true self battle in his words.",
        language: "Ancient Finnish/Sami",
        voiceId: "onwK4e9ZLuTAKqWW03F9",
        triggers: ["power", "corruption", "ancient", "salvation"],
        questRole: "Final boss, requires all alliances to defeat"
    },
    koulu: {
        name: "Koulu",
        species: "Abandoned Finnish School",
        role: "Sanctuary of Knowledge",
        description: "A mysterious green school building that seems alive. Offers shelter and teaches lessons about surviving the taiga.",
        speechPattern: "Calm, educational, nurturing. Like a wise teacher.",
        language: "Finnish",
        voiceId: "jsCqWAovK2LkecY7zXl4",
        triggers: ["learning", "shelter", "safety", "knowledge"],
        questRole: "Safe zone, provides tutorials and lore"
    }
};
```

---

## 5. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [ ] Implement chunk-based world system
- [ ] Create basic procedural generation
- [ ] Set up API configuration system
- [ ] Build basic audio context for playback

### Phase 2: AI Integration (Week 2)
- [ ] Implement OmniDialogue wrapper
- [ ] Connect to Anthropic Claude API
- [ ] Connect to Google Gemini API
- [ ] Connect to ElevenLabs API
- [ ] Build speech recognition (Web Speech API)

### Phase 3: Story Engine (Week 3)
- [ ] Implement DynamicStoryManager
- [ ] Create NPC personality system
- [ ] Build conversation context builder
- [ ] Implement state persistence

### Phase 4: World Expansion (Week 4)
- [ ] Expand world to 4000x4000
- [ ] Add biome variations
- [ ] Place NPCs in expanded zones
- [ ] Implement LOD system

### Phase 5: Polish (Week 5)
- [ ] Optimize performance
- [ ] Add visual feedback for voice
- [ ] Implement conversation UI
- [ ] Testing and bug fixes

---

## 6. API CONFIGURATION

### Required API Keys

```javascript
// config.js - Store securely, never commit to git
const API_CONFIG = {
    anthropic: {
        apiKey: 'sk-ant-...',
        model: 'claude-3-5-sonnet-20241022',
        fallbackModel: 'claude-3-5-haiku-20241022'
    },
    gemini: {
        apiKey: 'AIza...',
        model: 'gemini-1.5-flash',
        fallbackModel: 'gemini-1.5-pro'
    },
    elevenLabs: {
        apiKey: 'xi_...',
        defaultVoice: 'EXAVITQu4vr4xnSDxMaL',
        model: 'eleven_multilingual_v2'
    }
};
```

### API Endpoints

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Anthropic | `https://api.anthropic.com/v1/messages` | LLM dialogue |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models` | Fast LLM |
| ElevenLabs | `https://api.elevenlabs.io/v1/text-to-speech` | Voice synthesis |

---

## 7. SECURITY CONSIDERATIONS

### API Key Management
- **Never expose API keys in client-side code**
- Use a backend proxy server for API calls
- Implement rate limiting
- Use environment variables

### Recommended Architecture
```
[Browser Client] <-> [Express Proxy Server] <-> [AI APIs]
                            |
                    [Rate Limiter]
                            |
                    [API Key Storage]
```

---

## 8. METRICS & MONITORING

### Key Performance Indicators
- **Voice Latency**: Target <1000ms end-to-end
- **Chunk Load Time**: Target <100ms per chunk
- **Memory Usage**: Target <500MB total
- **Frame Rate**: Target 60fps stable

### Logging
```javascript
const metrics = {
    voiceLatency: [],
    apiCalls: { anthropic: 0, gemini: 0, elevenLabs: 0 },
    chunkLoads: 0,
    errors: []
};
```

---

*Document Version: 2.0*
*Last Updated: January 2026*
*Protocol: AETHERLINK FORGE // ATLAS*
