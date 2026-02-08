/**
 * AI Academy - Mentor Profiles
 * All 20+ mentor personalities across 10 worlds
 */

const MENTOR_PROFILES = {
    // ═══════════════════════════════════════════
    // WORLD 1: The Awakening - Wat is AI?
    // ═══════════════════════════════════════════
    'koulu_sensei': {
        name: 'Koulu-Sensei',
        species: 'Wijze Schoolgebouw',
        role: 'Hoofdmentor',
        world: 1,
        position: { x: 0, z: 30 },
        description_nl: 'Een mysterieus Fins schoolgebouw dat tot leven is gekomen. De eerste leraar die je ontmoet. Legt de basis uit van wat AI is en hoe het werkt.',
        description_en: 'A mysterious Finnish school building come to life. The first teacher you meet. Explains the basics of what AI is and how it works.',
        personality: 'geduldig, warm, bemoedigend, helder',
        speechPattern: 'Rustig, educatief, gebruikt eenvoudige analogieen. Vergelijkt AI met alledaagse dingen.',
        modelCreator: 'school',
        voiceId: 'jsCqWAovK2LkecY7zXl4',
        challenges: [
            {
                id: 'w1_c1',
                type: 'quiz',
                title_nl: 'Wat is AI eigenlijk?',
                title_en: 'What is AI actually?',
                description_nl: 'Beantwoord vragen over de basis van kunstmatige intelligentie.',
                description_en: 'Answer questions about the basics of artificial intelligence.',
                questions: [
                    {
                        q_nl: 'Wat doet een AI-model als het een antwoord geeft?',
                        q_en: 'What does an AI model do when it gives an answer?',
                        options_nl: ['Het zoekt het antwoord op internet', 'Het voorspelt het meest waarschijnlijke volgende woord', 'Het kopieert uit een boek', 'Het vraagt een mens'],
                        options_en: ['It searches the answer on the internet', 'It predicts the most likely next word', 'It copies from a book', 'It asks a human'],
                        correct: 1
                    },
                    {
                        q_nl: 'Welk van deze is GEEN voorbeeld van AI?',
                        q_en: 'Which of these is NOT an example of AI?',
                        options_nl: ['ChatGPT', 'Een rekenmachine', 'Gezichtsherkenning', 'Spraakassistent'],
                        options_en: ['ChatGPT', 'A calculator', 'Face recognition', 'Voice assistant'],
                        correct: 1
                    }
                ],
                xp: 50,
                stars: 5
            },
            {
                id: 'w1_c2',
                type: 'prompt_writing',
                title_nl: 'Je eerste prompt',
                title_en: 'Your first prompt',
                description_nl: 'Schrijf een prompt om een AI te vragen wat het verschil is tussen een mens en een robot. De AI beoordeelt je prompt.',
                description_en: 'Write a prompt to ask an AI the difference between a human and a robot. The AI evaluates your prompt.',
                task_nl: 'Schrijf een duidelijke vraag aan een AI over het verschil tussen mensen en robots.',
                task_en: 'Write a clear question to an AI about the difference between humans and robots.',
                rubric_nl: 'Beoordeel op: duidelijkheid, specificiteit, en of het een goed antwoord zou uitlokken.',
                rubric_en: 'Evaluate on: clarity, specificity, and whether it would elicit a good answer.',
                xp: 75,
                stars: 5
            }
        ]
    },

    'sieni': {
        name: 'Sieni',
        species: 'Magisch Paddenstoelennetwerk',
        role: 'Mystieke Gids',
        world: 1,
        position: { x: 50, z: 50 },
        description_nl: 'Oud schimmelnetwerk met enorme kennis. Spreekt in raadsels en metaforen. Legt uit hoe AI leert van patronen, net als een myceliumnetwerk.',
        description_en: 'Ancient fungal network with vast knowledge. Speaks in riddles and metaphors. Explains how AI learns from patterns, like a mycelium network.',
        personality: 'wijs, mysterieus, oud',
        speechPattern: 'Cryptisch, poetisch, natuurmetaforen. "De wortels onthouden wat de bladeren vergeten..."',
        modelCreator: 'mushroom',
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        challenges: [
            {
                id: 'w1_c3',
                type: 'matching',
                title_nl: 'Patronen herkennen',
                title_en: 'Recognizing patterns',
                description_nl: 'Koppel AI-concepten aan hun juiste beschrijvingen, net zoals AI patronen leert herkennen.',
                description_en: 'Match AI concepts to their correct descriptions, just like AI learns to recognize patterns.',
                pairs: [
                    { term_nl: 'Machine Learning', term_en: 'Machine Learning', def_nl: 'Computer leert van voorbeelden', def_en: 'Computer learns from examples' },
                    { term_nl: 'Training Data', term_en: 'Training Data', def_nl: 'De voorbeelden waarvan AI leert', def_en: 'The examples AI learns from' },
                    { term_nl: 'Model', term_en: 'Model', def_nl: 'Het geleerde patroon in de computer', def_en: 'The learned pattern in the computer' },
                    { term_nl: 'Inferentie', term_en: 'Inference', def_nl: 'AI past geleerd patroon toe op nieuwe input', def_en: 'AI applies learned pattern to new input' }
                ],
                xp: 60,
                stars: 5
            }
        ]
    },

    // ═══════════════════════════════════════════
    // WORLD 2: The Prompt Forge - Prompt Engineering
    // ═══════════════════════════════════════════
    'taisto': {
        name: 'Taisto',
        species: 'Strijdhond',
        role: 'Prompt Smid',
        world: 2,
        position: { x: -30, z: 40 },
        description_nl: 'Een geharde Amstaff-strijder die nu prompts smeedt in plaats van wapens. Leert je sterke, precieze prompts te schrijven.',
        description_en: 'A hardened Amstaff warrior who now forges prompts instead of weapons. Teaches you to write strong, precise prompts.',
        personality: 'direct, no-nonsense, eerlijk',
        speechPattern: 'Kort, krachtig. "Een slechte prompt is als een bot zwaard. Slijp je woorden!"',
        modelCreator: 'amstaff',
        voiceId: 'ErXwobaYiN019PkySvjV',
        challenges: [
            {
                id: 'w2_c1',
                type: 'prompt_writing',
                title_nl: 'De Prompt Aambeeld',
                title_en: 'The Prompt Anvil',
                description_nl: 'Verbeter een zwakke prompt tot een sterke. Taisto beoordeelt je smeedwerk.',
                description_en: 'Improve a weak prompt into a strong one. Taisto evaluates your forging.',
                weak_prompt_nl: 'Vertel me iets over honden',
                weak_prompt_en: 'Tell me something about dogs',
                task_nl: 'Maak deze vage prompt specifiek, duidelijk en actionable. Voeg context, doelgroep en gewenst formaat toe.',
                task_en: 'Make this vague prompt specific, clear and actionable. Add context, audience and desired format.',
                rubric_nl: 'Beoordeel op: specificiteit (is het duidelijk?), context (is er achtergrond?), formaat (staat beschreven wat voor antwoord gewenst is?), lengte (niet te kort, niet te lang).',
                rubric_en: 'Evaluate on: specificity (is it clear?), context (is there background?), format (is desired answer format specified?), length (not too short, not too long).',
                xp: 80,
                stars: 5
            },
            {
                id: 'w2_c2',
                type: 'evaluation',
                title_nl: 'Prompt Keurmeester',
                title_en: 'Prompt Inspector',
                description_nl: 'Beoordeel drie prompts van "andere studenten" en leg uit wat er goed en fout aan is.',
                description_en: 'Evaluate three prompts from "other students" and explain what is good and bad about them.',
                prompts_to_evaluate: [
                    { prompt_nl: 'Schrijf een verhaal', prompt_en: 'Write a story', expected_rating: 1 },
                    { prompt_nl: 'Schrijf een kort sprookje van 200 woorden voor kinderen van 6 jaar over een dappere muis', prompt_en: 'Write a short fairy tale of 200 words for 6-year-olds about a brave mouse', expected_rating: 4 },
                    { prompt_nl: 'Schrijf een professionele e-mail aan mijn baas om een vrije dag te vragen voor volgende week vrijdag, in een beleefde maar directe toon', prompt_en: 'Write a professional email to my boss to request a day off for next Friday, in a polite but direct tone', expected_rating: 5 }
                ],
                xp: 70,
                stars: 5
            }
        ]
    },

    'karen': {
        name: 'Karen',
        species: 'Kraai',
        role: 'Informatie Handelaar',
        world: 2,
        position: { x: 40, z: -30 },
        description_nl: 'Slimme kraai die geheimen verzamelt. Leert je over system prompts en het sturen van AI-gedrag.',
        description_en: 'Clever crow who collects secrets. Teaches about system prompts and steering AI behavior.',
        personality: 'slim, nieuwsgierig, speels',
        speechPattern: 'Kakelt, stelt tegenvragen. "Kra! Je prompt mist iets... raad maar wat!"',
        modelCreator: 'crow',
        voiceId: 'MF3mGyEYCl7XYWbV9V6O',
        challenges: [
            {
                id: 'w2_c3',
                type: 'prompt_writing',
                title_nl: 'Het Rollenspel',
                title_en: 'The Role Play',
                description_nl: 'Schrijf een system prompt die een AI een specifiek karakter geeft. Karen test of je AI echt in karakter blijft.',
                description_en: 'Write a system prompt that gives an AI a specific character. Karen tests if your AI truly stays in character.',
                task_nl: 'Schrijf een system prompt voor een AI die zich gedraagt als een piraat die kookadvies geeft. De AI moet altijd in piraten-stijl antwoorden.',
                task_en: 'Write a system prompt for an AI that behaves as a pirate giving cooking advice. The AI must always answer in pirate style.',
                rubric_nl: 'Beoordeel op: karakter-definitie, consistentie-instructies, creativiteit, duidelijkheid van de grenzen.',
                rubric_en: 'Evaluate on: character definition, consistency instructions, creativity, clarity of boundaries.',
                xp: 85,
                stars: 5
            }
        ]
    },

    'flame_spirit': {
        name: 'Vuurgeest',
        species: 'Elementaire Geest',
        role: 'Prompt Tester',
        world: 2,
        position: { x: 0, z: -60 },
        description_nl: 'Een vlam die leeft in de smederij. Test je prompts door ze uit te voeren en het resultaat te tonen. Leert je iteratief verbeteren.',
        description_en: 'A flame living in the forge. Tests your prompts by executing them and showing results. Teaches iterative improvement.',
        personality: 'energiek, eerlijk, wisselvallig',
        speechPattern: 'Flitst op en neer. "Laat me je prompt proeven... *FWOOSH* Hmm, te vaag! Probeer opnieuw!"',
        modelCreator: 'flame',
        voiceId: 'VR6AewLTigWG4xSOukaG',
        challenges: [
            {
                id: 'w2_c4',
                type: 'prompt_writing',
                title_nl: 'Iteratief Slijpen',
                title_en: 'Iterative Sharpening',
                description_nl: 'Schrijf een prompt, krijg feedback, verbeter hem, drie rondes lang.',
                description_en: 'Write a prompt, get feedback, improve it, three rounds.',
                task_nl: 'Schrijf een prompt voor een AI om een nieuwsartikel samen te vatten. Na elke ronde krijg je feedback en kun je verbeteren.',
                task_en: 'Write a prompt for an AI to summarize a news article. After each round you get feedback and can improve.',
                rubric_nl: 'Beoordeel op: verbetering per ronde, specifieke instructies, lengte-controle, toon-specificatie.',
                rubric_en: 'Evaluate on: improvement per round, specific instructions, length control, tone specification.',
                rounds: 3,
                xp: 100,
                stars: 5
            }
        ]
    },

    // ═══════════════════════════════════════════
    // WORLD 3: Context Caverns - Context & Memory
    // ═══════════════════════════════════════════
    'sammal': {
        name: 'Sammal',
        species: 'Mosgeest',
        role: 'Geheugenmeester',
        world: 3,
        position: { x: -40, z: 30 },
        description_nl: 'Zachte geest van de bemoste stenen. Leert je over context windows - hoeveel een AI kan "onthouden" in een gesprek.',
        description_en: 'Gentle spirit of moss-covered stones. Teaches about context windows - how much an AI can "remember" in a conversation.',
        personality: 'zacht, geduldig, grondig',
        speechPattern: 'Langzaam, bedachtzaam. "Elke steen onthoudt... maar zelfs stenen vergeten na genoeg regen."',
        modelCreator: 'moss',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        challenges: [
            {
                id: 'w3_c1',
                type: 'quiz',
                title_nl: 'Het Geheugen van AI',
                title_en: 'The Memory of AI',
                description_nl: 'Test je kennis over hoe AI-context werkt.',
                description_en: 'Test your knowledge about how AI context works.',
                questions: [
                    {
                        q_nl: 'Wat is een "context window" bij een AI?',
                        q_en: 'What is a "context window" in AI?',
                        options_nl: ['Het scherm waarop je typt', 'De hoeveelheid tekst die AI tegelijk kan verwerken', 'Een venster in de server', 'De tijd die AI nodig heeft'],
                        options_en: ['The screen you type on', 'The amount of text AI can process at once', 'A window in the server', 'The time AI needs'],
                        correct: 1
                    },
                    {
                        q_nl: 'Wat gebeurt er als je gesprek langer wordt dan het context window?',
                        q_en: 'What happens when your conversation exceeds the context window?',
                        options_nl: ['De AI crasht', 'De AI vergeet het begin van het gesprek', 'Het gesprek wordt automatisch opgeslagen', 'Er gebeurt niets'],
                        options_en: ['The AI crashes', 'The AI forgets the beginning of the conversation', 'The conversation is automatically saved', 'Nothing happens'],
                        correct: 1
                    }
                ],
                xp: 60,
                stars: 5
            },
            {
                id: 'w3_c2',
                type: 'prompt_writing',
                title_nl: 'Context Meester',
                title_en: 'Context Master',
                description_nl: 'Schrijf een prompt die slim omgaat met beperkt geheugen door de belangrijkste context samen te vatten.',
                description_en: 'Write a prompt that cleverly handles limited memory by summarizing key context.',
                task_nl: 'Je hebt een lang document van 10 paginas. Schrijf een prompt die een AI vraagt om het samen te vatten, maar geef ook instructies voor hoe de samenvatting gestructureerd moet zijn.',
                task_en: 'You have a long 10-page document. Write a prompt asking an AI to summarize it, but also give instructions for how the summary should be structured.',
                rubric_nl: 'Beoordeel op: structuur-instructies, lengte-specificatie, prioriteit van informatie, duidelijkheid.',
                rubric_en: 'Evaluate on: structure instructions, length specification, information priority, clarity.',
                xp: 80,
                stars: 5
            }
        ]
    },

    'the_echo': {
        name: 'De Echo',
        species: 'Grot Echo',
        role: 'Contexttester',
        world: 3,
        position: { x: 60, z: -40 },
        description_nl: 'Een mysterieuze echo in de kristalgrot die alles herhaalt maar steeds meer vergeet. Demonstreert context-limieten live.',
        description_en: 'A mysterious echo in the crystal cave that repeats everything but gradually forgets. Demonstrates context limits live.',
        personality: 'speels, verward, eerlijk',
        speechPattern: 'Herhaalt woorden, raakt langzaam in de war. "Ja, dat zei je... of was het iets anders? De grot vergeet..."',
        modelCreator: 'echo_crystal',
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        challenges: [
            {
                id: 'w3_c3',
                type: 'prompt_writing',
                title_nl: 'De Vergeetachtige Grot',
                title_en: 'The Forgetful Cave',
                description_nl: 'Schrijf een prompt die een AI helpt om lange gesprekken te onthouden door slim samen te vatten.',
                description_en: 'Write a prompt that helps an AI remember long conversations by summarizing cleverly.',
                task_nl: 'Ontwerp een strategie (als prompt) voor een AI-assistent die lange klantenservice-gesprekken moet voeren zonder de context te verliezen.',
                task_en: 'Design a strategy (as a prompt) for an AI assistant that needs to handle long customer service conversations without losing context.',
                rubric_nl: 'Beoordeel op: samenvatting-strategie, prioritering van info, duidelijke instructies, haalbaarheid.',
                rubric_en: 'Evaluate on: summarization strategy, info prioritization, clear instructions, feasibility.',
                xp: 90,
                stars: 5
            }
        ]
    },

    // ═══════════════════════════════════════════
    // WORLD 4: Few-Shot Fields - Few-shot Learning
    // ═══════════════════════════════════════════
    'yuki': {
        name: 'Yuki',
        species: 'Witte Akita',
        role: 'Voorbeeld-Gever',
        world: 4,
        position: { x: 30, z: 60 },
        description_nl: 'Een trouwe Japanse hond die leert door voorbeelden. Demonstreert hoe je AI kunt sturen met 1-3 voorbeelden (few-shot learning).',
        description_en: 'A loyal Japanese dog who learns by examples. Demonstrates how to guide AI with 1-3 examples (few-shot learning).',
        personality: 'trouw, leergierig, precies',
        speechPattern: 'Direct, loyaal. "Geef me een voorbeeld, tomodachi, en ik leer! Nog een voorbeeld... nu begrijp ik het!"',
        modelCreator: 'akita',
        voiceId: 'AZnzlk1XvdvUeBnXmlld',
        challenges: [
            {
                id: 'w4_c1',
                type: 'prompt_writing',
                title_nl: 'Zero-shot vs Few-shot',
                title_en: 'Zero-shot vs Few-shot',
                description_nl: 'Schrijf eerst een prompt zonder voorbeelden, dan met 2-3 voorbeelden. Vergelijk de resultaten.',
                description_en: 'Write a prompt without examples first, then with 2-3 examples. Compare results.',
                task_nl: 'Schrijf twee versies van een prompt die een AI vraagt om productnamen te verzinnen voor een nieuw drankje: een zero-shot versie (zonder voorbeelden) en een few-shot versie (met 2-3 voorbeelden van gewenste stijl).',
                task_en: 'Write two versions of a prompt asking an AI to invent product names for a new drink: a zero-shot version (without examples) and a few-shot version (with 2-3 examples of desired style).',
                rubric_nl: 'Beoordeel op: verschil tussen zero en few-shot, kwaliteit van voorbeelden, duidelijkheid van patroon, specificiteit.',
                rubric_en: 'Evaluate on: difference between zero and few-shot, quality of examples, clarity of pattern, specificity.',
                xp: 85,
                stars: 5
            }
        ]
    },

    'scarecrow_sage': {
        name: 'Vogelverschrikker Wijze',
        species: 'Levende Vogelverschrikker',
        role: 'Patroonherkenner',
        world: 4,
        position: { x: -50, z: 20 },
        description_nl: 'Een vogelverschrikker die tot leven kwam door patronen te herkennen. Leert je hoe AI patronen uit voorbeelden haalt.',
        description_en: 'A scarecrow that came to life by recognizing patterns. Teaches how AI extracts patterns from examples.',
        personality: 'excentriek, enthousiast, verrassend slim',
        speechPattern: 'Beweegt stijf, maar denkt scherp. "Kijk! Drie voorbeelden en ik ZIE het patroon! Fascinerend!"',
        modelCreator: 'scarecrow',
        voiceId: 'onwK4e9ZLuTAKqWW03F9',
        challenges: [
            {
                id: 'w4_c2',
                type: 'prompt_writing',
                title_nl: 'Patroon Planten',
                title_en: 'Pattern Planting',
                description_nl: 'Gebruik few-shot learning om een AI een specifiek formaat te leren volgen.',
                description_en: 'Use few-shot learning to teach an AI to follow a specific format.',
                task_nl: 'Schrijf een few-shot prompt die een AI leert om filmrecensies te schrijven in precies dit formaat: Emoji + Titel + Score/10 + One-liner. Geef 3 voorbeelden en vraag om een 4e.',
                task_en: 'Write a few-shot prompt teaching an AI to write movie reviews in exactly this format: Emoji + Title + Score/10 + One-liner. Give 3 examples and ask for a 4th.',
                rubric_nl: 'Beoordeel op: consistentie van voorbeelden, duidelijkheid van formaat, variatie in voorbeelden, kwaliteit van instructie.',
                rubric_en: 'Evaluate on: consistency of examples, clarity of format, variety in examples, quality of instruction.',
                xp: 90,
                stars: 5
            },
            {
                id: 'w4_c3',
                type: 'evaluation',
                title_nl: 'Oogst Beoordelen',
                title_en: 'Harvest Evaluation',
                description_nl: 'Beoordeel welke few-shot prompts het best werken en waarom.',
                description_en: 'Evaluate which few-shot prompts work best and why.',
                prompts_to_evaluate: [
                    {
                        prompt_nl: 'Vertaal naar het Frans: Hello -> Bonjour, Goodbye -> Au revoir, Thank you -> ?',
                        prompt_en: 'Translate to French: Hello -> Bonjour, Goodbye -> Au revoir, Thank you -> ?',
                        expected_rating: 4
                    },
                    {
                        prompt_nl: 'Maak er emoji van. Voorbeeld: kat=🐱. Hond=?',
                        prompt_en: 'Turn into emoji. Example: cat=🐱. Dog=?',
                        expected_rating: 3
                    }
                ],
                xp: 65,
                stars: 5
            }
        ]
    },

    // ═══════════════════════════════════════════
    // WORLD 5-10: Stub profiles (expanded post-MVP)
    // ═══════════════════════════════════════════
    'susi': {
        name: 'Susi',
        species: 'Wolf',
        role: 'Redeneringsgids',
        world: 5,
        position: { x: 0, z: 100 },
        description_nl: 'Een wolf die stap voor stap denkt. Leert chain-of-thought reasoning.',
        description_en: 'A wolf that thinks step by step. Teaches chain-of-thought reasoning.',
        personality: 'analytisch, geduldig, methodisch',
        speechPattern: 'Stap... voor... stap... Eerst dit. Dan dat. Begrijp je?',
        modelCreator: 'wolf',
        voiceId: 'VR6AewLTigWG4xSOukaG',
        challenges: []
    },

    'mountain_oracle': {
        name: 'Berg Orakel',
        species: 'Bergtop Geest',
        role: 'Meester Redeneerder',
        world: 5,
        position: { x: 50, z: -50 },
        description_nl: 'Spreekt alleen in logische stappen. De ultieme chain-of-thought leraar.',
        description_en: 'Speaks only in logical steps. The ultimate chain-of-thought teacher.',
        personality: 'diepzinnig, gestructureerd, kalm',
        speechPattern: 'Premisse 1... Premisse 2... Conclusie... Begrijp je de keten?',
        modelCreator: 'crystal_pillar',
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        challenges: []
    },

    'archivist': {
        name: 'De Archivaris',
        species: 'Spectrale Bibliothecaris',
        role: 'RAG Meester',
        world: 6,
        position: { x: -30, z: 50 },
        description_nl: 'Beheert de ruines van een enorme bibliotheek. Leert hoe AI externe kennis kan ophalen.',
        description_en: 'Manages the ruins of a vast library. Teaches how AI can retrieve external knowledge.',
        personality: 'precies, georganiseerd, behulpzaam',
        speechPattern: 'Laat me dat even opzoeken... Ah ja, sectie 4, pagina 312...',
        modelCreator: 'ghostly_figure',
        voiceId: 'jsCqWAovK2LkecY7zXl4',
        challenges: []
    },

    'metsastaja': {
        name: 'Metsastaja',
        species: 'Jager',
        role: 'Kenniszoeker',
        world: 6,
        position: { x: 60, z: -30 },
        description_nl: 'Jaagt op kennis in plaats van dieren. Expert in het vinden van de juiste bronnen.',
        description_en: 'Hunts knowledge instead of animals. Expert at finding the right sources.',
        personality: 'gefocust, stil, efficiënt',
        speechPattern: 'Minimale woorden. "Die bron... daar. Gebruik hem."',
        modelCreator: 'hunter',
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        challenges: []
    },

    'factory_foreman': {
        name: 'Fabrieksbaas',
        species: 'Steampunk Automaton',
        role: 'Fine-Tune Expert',
        world: 7,
        position: { x: 0, z: 40 },
        description_nl: 'Beheert de fine-tune fabriek. Leert hoe je AI-modellen kunt aanpassen aan specifieke taken.',
        description_en: 'Manages the fine-tune factory. Teaches how to customize AI models for specific tasks.',
        personality: 'efficiënt, precies, trots op zijn werk',
        speechPattern: 'Tandwielen draaien. "Specificaties! Ik heb specificaties nodig! Hoe wil je je model?"',
        modelCreator: 'automaton',
        voiceId: 'ErXwobaYiN019PkySvjV',
        challenges: []
    },

    'arena_master': {
        name: 'Arena Meester',
        species: 'Holografische AI',
        role: 'Agent Trainer',
        world: 8,
        position: { x: 0, z: 0 },
        description_nl: 'Bestuurt de futuristische arena. Leert over AI agents die tools kunnen gebruiken.',
        description_en: 'Controls the futuristic arena. Teaches about AI agents that can use tools.',
        personality: 'spectaculair, uitdagend, eerlijk',
        speechPattern: 'Theatraal. "WELKOM in de arena! Laat je agent zijn waarde bewijzen!"',
        modelCreator: 'hologram',
        voiceId: 'VR6AewLTigWG4xSOukaG',
        challenges: []
    },

    'tool_smith': {
        name: 'Gereedschapmaker',
        species: 'Cyborg Smid',
        role: 'Tool Expert',
        world: 8,
        position: { x: -50, z: -50 },
        description_nl: 'Maakt de tools die AI agents gebruiken. Leert over function calling en tool use.',
        description_en: 'Creates the tools AI agents use. Teaches about function calling and tool use.',
        personality: 'praktisch, hands-on, enthousiast',
        speechPattern: 'Altijd bezig. "Dit tool... hiervoor. Dat tool... daarvoor. Combineer ze!"',
        modelCreator: 'cyborg',
        voiceId: 'AZnzlk1XvdvUeBnXmlld',
        challenges: []
    },

    'the_judge': {
        name: 'De Rechter',
        species: 'Marmeren Standbeeld',
        role: 'Ethiek Bewaker',
        world: 9,
        position: { x: 30, z: 30 },
        description_nl: 'Onpartijdig standbeeld dat oordeelt over ethische AI-dilemmas.',
        description_en: 'Impartial statue that judges ethical AI dilemmas.',
        personality: 'onpartijdig, wijs, streng maar eerlijk',
        speechPattern: 'Formeel. "Het hof overweegt... Aan de ene kant... aan de andere kant..."',
        modelCreator: 'statue',
        voiceId: 'onwK4e9ZLuTAKqWW03F9',
        challenges: []
    },

    'the_mirror': {
        name: 'De Spiegel',
        species: 'Reflecterend Oppervlak',
        role: 'Bias Detector',
        world: 9,
        position: { x: -40, z: -40 },
        description_nl: 'Spiegelt je eigen vooroordelen terug. Leert over bias in AI-systemen.',
        description_en: 'Reflects your own biases back. Teaches about bias in AI systems.',
        personality: 'eerlijk, confronterend, empathisch',
        speechPattern: 'Kalm maar direct. "Wat je ziet in mij... is wat de AI leerde van ons."',
        modelCreator: 'mirror_pillar',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        challenges: []
    }
};

// Helper: get mentors for a specific world
function getMentorsForWorld(worldId) {
    return Object.entries(MENTOR_PROFILES)
        .filter(([_, m]) => m.world === worldId)
        .map(([key, m]) => ({ key, ...m }));
}

window.MENTOR_PROFILES = MENTOR_PROFILES;
window.getMentorsForWorld = getMentorsForWorld;
