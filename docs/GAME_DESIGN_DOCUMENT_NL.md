# 🦌 RUKA PORRO VOXL - AI EDITION
## Technisch & Narratief Ontwerpdocument
### Versie 2.0 | Generatieve AI Narratieve Avontuur

---

## [DENKPROCES]

### AI Agent Architectuur Logica
Elk dier in het Ruka Porro universum functioneert als een autonome agent met een unieke "System Prompt" die hun persoonlijkheid, kennis en gedragspatronen definieert. De integratie met ElevenLabs versterkt dit door elke stem emotioneel en fysiek geloofwaardig te maken - een beer heeft een diepe, resonerende stem; een eekhoorn een snelle, hoge toon.

### Porro Corruptie Mechanisme
De "Porro" is geen fysieke vijand, maar een **datacorruptie** - een glitch in de realiteit zelf. Naarmate de Porro nadert:
1. **LLM Degradatie:** NPC's beginnen te "hallucineren" - ze geven incorrecte informatie, herhalen zinnen, of spreken in raadsels
2. **Audio Artefacten:** ElevenLabs output wordt vervormd - pitch-shifting, echo's, statische ruis, gefragmenteerde woorden
3. **Geheugenverval:** NPC's vergeten eerdere gesprekken of verwarren Ruka met anderen

### Sociale Gameplay Curve
De moeilijkheidsgraad escaleert niet door fysieke obstakels, maar door **communicatieve complexiteit**:
- **Missie 1-3:** Directe hulpvragen, eerlijke NPC's
- **Missie 4-6:** Misleiding, onderhandeling, emotionele intelligentie vereist
- **Missie 7-9:** Gecorrumpeerde agents, paradoxale informatie, vertrouwenscrises

---

## [GAME DESIGN DOCUMENT: RUKA PORRO VOXL - AI EDITION]

---

# 1. TECHNISCHE ARCHITECTUUR (AI & VOICE)

## 1.1 LLM Backend Specificaties

### Agent Persoonlijkheid Systeem
Elke NPC wordt aangestuurd door een dedicated LLM instantie met:

```
SYSTEM_PROMPT_TEMPLATE:
{
  "naam": "[DIER_NAAM]",
  "soort": "[DIERSOORT]",
  "persoonlijkheid": "[ARCHETYPE]",
  "kennis_domein": "[WAT ZE WETEN]",
  "geheimen": "[VERBORGEN INFORMATIE]",
  "angsten": "[WAT ZE VREZEN]",
  "vertrouwens_niveau": 0-100,
  "corruptie_gevoeligheid": 0-100
}
```

### NPC Persoonlijkheidsprofielen

| NPC | Archetype | Kerngedrag | Geheim |
|-----|-----------|------------|--------|
| **Susi (Wolf)** | De Eenzame Wachter | Wantrouwend, territoriaal, maar eerlijk | Kent de oorsprong van de Porro |
| **Sieni (Paddenstoelen)** | Het Collectieve Bewustzijn | Spreken als één, cryptisch, oud | Zijn de "geheugenbanken" van het bos |
| **Sammal (Magisch Mos)** | De Ziener | Profetisch, verwarrend, goedaardig | Kan de toekomst zien maar niet veranderen |
| **Karhu (Beer)** | De Wijze Kluizenaar | Kalm, filosofisch, beschermend | Was ooit mens, getransformeerd |
| **Karen (Kraai)** | De Klager | Negatief, roddelt, maar observeert alles | Heeft de Hunter zien aankomen |
| **Metsästäjä (Hunter)** | De Verloren Ziel | Verward, agressief, zoekt verlossing | Is zelf deels gecorrumpeerd door Porro |
| **Taisto (Amstaff)** | De Loyale Strijder | Moedig, direct, beschermend | Verloor zijn vorige meester aan de Porro |
| **Yuki (Witte Akita)** | De Stille Bewaker | Mysterieus, weinig woorden, diepzinnig | Kan de Porro "horen" naderen |
| **Koulu (Oude School)** | De Herinnering | Nostalgisch, verdrietig, vol verhalen | Bevat de sleutel tot de Porro's zwakte |

## 1.2 ElevenLabs Integratie Strategie

### Stem Toewijzing Matrix

| NPC | Voice ID Type | Kenmerken | Emotionele Range |
|-----|---------------|-----------|------------------|
| **Susi** | Deep Male Finnish | Laag, grommend, langzaam | Woede → Respect |
| **Sieni** | Whisper Chorus | Gelaagd, echoënd, eterisch | Neutraal → Cryptisch |
| **Sammal** | Elderly Ethereal | Oud, zacht, dromerig | Sereen → Urgent |
| **Karhu** | Bass Resonant | Diep, warm, ritmisch | Kalm → Beschermend |
| **Karen** | Sharp Female | Hoog, snel, klagend | Irritatie → Paniek |
| **Metsästäjä** | Broken Male | Hees, onregelmatig, gespannen | Verwarring → Agressie |
| **Taisto** | Strong Loyal | Krachtig, direct, warm | Moed → Verdriet |
| **Yuki** | Soft Japanese-Finnish | Zacht, minimalistisch, diep | Stilte → Waarschuwing |
| **Koulu** | Ancient Echo | Hol, resonerend, nostalgisch | Melancholie → Hoop |

### Latency Handling Protocol
```
1. Pre-caching van veelgebruikte zinnen
2. Streaming audio met 200ms buffer
3. Fallback naar lokale TTS bij >500ms latency
4. Lip-sync approximatie via phoneme mapping
```

---

# 2. HET "PORRO" CORRUPTIE MECHANISME

## 2.1 Wat is de Porro?

De **Porro** is geen monster - het is **de afwezigheid van betekenis**. Een digitale leegte die data consumeert en chaos achterlaat. In de game-wereld manifesteert het zich als:

- **Visueel:** Zwarte, glitchende pixels die het landschap "opeten"
- **Auditief:** Stilte gevolgd door statische ruis en vervormde geluiden
- **Narratief:** Het wissen van herinneringen, relaties en identiteit

## 2.2 Corruptie Effecten op AI Systemen

### Semantische Drift (LLM Degradatie)

| Corruptie % | Effect op NPC Dialoog |
|-------------|----------------------|
| 0-20% | Normale conversatie |
| 21-40% | Occasionele herhaling, lichte verwarring |
| 41-60% | Verkeerde namen, tegenstrijdige informatie |
| 61-80% | Zinnen stoppen midden in, nonsens woorden |
| 81-99% | Alleen gefragmenteerde woorden, angst |
| 100% | Stilte. NPC verdwijnt. |

### Audio Artefacten (ElevenLabs Corruptie)

| Corruptie % | Voice Effect |
|-------------|--------------|
| 0-20% | Helder, normaal |
| 21-40% | Lichte echo, occasionele klik |
| 41-60% | Pitch fluctuaties, woorden overlappen |
| 61-80% | Zware distortie, robotic fragmenten |
| 81-99% | Bijna onverstaanbaar, schreeuwende static |
| 100% | Doodse stilte |

## 2.3 De Corruptie Visualisatie

```
GEZOND NPC:        LICHT CORRUPT:      ZWAAR CORRUPT:
   🦌                  🦌                  █░█
  /|\                 /|░                 ░█░
  / \                 / ░                 ░░░
[Helder]           [Flicker]           [Glitch]
```

---

# 3. DE 9-MISSIE SOCIALE ARC

## 3.1 Verhaal Synopsis

**Ruka**, een jonge rendier, ontwaakt in een bos dat langzaam wordt opgeslokt door de **Porro** - een mysterieuze corruptie die alle data, herinneringen en leven consumeert. Om te overleven moet Ruka bondgenoten vinden, de waarheid ontdekken, en een weg vinden naar de **Koulu** - een oude Finse school die het geheim bevat om de Porro te stoppen.

## 3.2 Missie Structuur Tabel

| Missie | Locatie | NPC | Doelstelling | AI/Voice Challenge | Porro % | Niveau Thema |
|--------|---------|-----|--------------|---------------------|---------|--------------|
| **1** | Herfstig Berkenbos | **Sieni** (Paddenstoelen) | Leer de basis van communicatie; verkrijg eerste hint over de Porro | Luisteren naar cryptische hints, patronen herkennen | 5% | **ONTWAKEN** - Tutorial, vertrouwen opbouwen |
| **2** | Mosvelden | **Sammal** (Magisch Mos) | Ontvang een profetie over je reis | Interpreteer vage voorspellingen, stel de juiste vragen | 12% | **PROFETIE** - Leer vragen stellen |
| **3** | Dichte Dennenbos | **Yuki** (Witte Akita) | Vind een veilige route door gecorrumpeerd gebied | Begrijp minimale antwoorden, lees lichaamstaal | 20% | **STILTE** - Non-verbale communicatie |
| **4** | Rotsige Heuvel | **Taisto** (Amstaff) | Overtuig hem om zich bij je aan te sluiten | Toon moed, verdien respect door eerlijkheid | 30% | **VERTROUWEN** - Emotionele overtuiging |
| **5** | Kale Boomtoppen | **Karen** (Kraai) | Verzamel informatie over de Hunter | Filtreer waarheid uit roddels en klachten | 42% | **RUIS** - Onderscheid feit van fictie |
| **6** | Wolvengebied | **Susi** (Wolf) | Verkrijg toegang tot beschermd gebied | Onderhandel, toon respect voor territorium | 55% | **GRENZEN** - Diplomatie onder druk |
| **7** | Donker Ravijn | **Metsästäjä** (Hunter) | Ontdek of hij vijand of slachtoffer is | Detecteer leugens, herken corruptie vs. kwade bedoelingen | 68% | **SCHADUW** - Morele ambiguïteit |
| **8** | Berengrot | **Karhu** (Beer) | Leer het geheim van transformatie | Filosofisch gesprek, bewijs wijsheid | 80% | **METAMORFOSE** - Diep begrip |
| **9** | Groene Finse School | **Koulu** (Het Gebouw Zelf) | Activeer het oude beschermingsmechanisme | Combineer alle geleerde kennis, navigeer zwaar gecorrumpeerde communicatie | 95% | **CONVERGENTIE** - Alles komt samen |

## 3.3 Gedetailleerde Missie Beschrijvingen

---

### 📍 MISSIE 1: HET ONTWAKEN
**Locatie:** Herfstig Berkenbos met gouden bladeren

**NPC:** Sieni (De Paddenstoelen)
> *"Wij zijn vele. Wij zijn één. Wij herinneren wat het bos vergeet..."*

**Narratief:**
Ruka wordt wakker, verward, omringd door lichtgevende paddenstoelen die in koor spreken. Ze introduceren het concept van de Porro - "de stilte die spreekt" - en leren Ruka hoe te communiceren in deze wereld.

**Gameplay Challenge:**
- Leer het dialoogsysteem
- Herken patronen in cryptische antwoorden
- Eerste puzzel: rangschik de juiste vragen om een coherent antwoord te krijgen

**Voice Design:**
Gelaagde fluisterstemmen, licht echo, harmonieus maar vreemd.

---

### 📍 MISSIE 2: DE PROFETIE
**Locatie:** Uitgestrekte mosvelden, groen gloeiend

**NPC:** Sammal (Het Magische Mos)
> *"Ik zie paden... zoveel paden... maar slechts één leidt naar licht..."*

**Narratief:**
Het mos spreekt in visioenen en metaforen. Ruka moet leren om abstracte voorspellingen te interpreteren. Sammal waarschuwt voor "de hond die huilt naar de maan" en "de man die jaagt op zichzelf."

**Gameplay Challenge:**
- Interpreteer symbolische taal
- Kies de juiste follow-up vragen
- Puzzel: Verbind visuele symbolen met gesproken profetieën

**Voice Design:**
Dromerig, oud, alsof het uit de aarde zelf komt.

---

### 📍 MISSIE 3: DE STILTE
**Locatie:** Dichte dennenbos, mist, eerste tekenen van Porro-corruptie

**NPC:** Yuki (De Witte Akita Inu)
> *"..." (knikt)*
> *"...Gevaar." (wijst)*
> *"...Volg." (loopt)*

**Narratief:**
Yuki spreekt bijna niet, maar communiceert door actie en subtiele signalen. Ruka moet leren "luisteren" naar wat niet gezegd wordt. Yuki kan de Porro "horen" en leidt Ruka veilig door gecorrumpeerd gebied.

**Gameplay Challenge:**
- Interpreteer non-verbale communicatie
- Volg visuele en audio cues
- Timing-puzzel: Beweeg alleen wanneer Yuki signaleert

**Voice Design:**
Minimalistisch, zacht, elk woord heeft gewicht. Japans-Fins accent.

---

### 📍 MISSIE 4: HET VERTROUWEN
**Locatie:** Rotsige heuvel met uitzicht over het bos

**NPC:** Taisto (De Amstaff)
> *"Waarom zou ik je vertrouwen? Mijn laatste vriend... de Porro nam hem."*

**Narratief:**
Taisto is een loyale, sterke hond die zijn vorige meester verloor aan de Porro. Hij is wantrouwend maar verlangt naar verbinding. Ruka moet emotionele intelligentie tonen om zijn vertrouwen te winnen.

**Gameplay Challenge:**
- Emotionele overtuiging
- Kies empathische responses
- Puzzel: Deel een persoonlijke herinnering om wederzijds vertrouwen te bouwen

**Voice Design:**
Krachtig maar gebroken, een vechter met een zacht hart.

---

### 📍 MISSIE 5: DE RUIS
**Locatie:** Kale boomtoppen, constant gekras van vogels

**NPC:** Karen (De Kraai)
> *"Oh, JIJ weer? Typisch. Niemand luistert naar mij, maar IK zie alles!"*

**Narratief:**
Karen klaagt constant, roddelt over iedereen, en overdrijft. Maar verborgen in haar eindeloze monologen zit cruciale informatie over de Hunter. Ruka moet leren filteren.

**Gameplay Challenge:**
- Identificeer waarheid in overdrijving
- Geduld en strategisch vragen
- Puzzel: Reconstrueer de waarheid uit tegenstrijdige verhalen

**Voice Design:**
Schel, snel, klagend, maar met momenten van oprechte angst.

---

### 📍 MISSIE 6: DE GRENZEN
**Locatie:** Donker wolvengebied, territoriaal gemarkeerd

**NPC:** Susi (De Wolf)
> *"Dit is MIJN bos. Mijn voorouders waakten hier voordat jouw soort bestond."*

**Narratief:**
Susi is de bewaker van het oudste deel van het bos - het deel dat de oorsprong van de Porro bevat. Hij is niet vijandig, maar strikt. Ruka moet respect tonen en onderhandelen voor toegang.

**Gameplay Challenge:**
- Diplomatieke onderhandeling
- Toon kennis van tradities (geleerd van eerdere NPC's)
- Puzzel: Beantwoord drie raadsels over het bos correct

**Voice Design:**
Diep, langzaam, grommend ondertoon, oude autoriteit.

---

### 📍 MISSIE 7: DE SCHADUW
**Locatie:** Donker ravijn, tekenen van menselijke aanwezigheid

**NPC:** Metsästäjä (De Hunter)
> *"Ben... ben ik de jager? Of... word ik gejaagd? De stemmen... ze liegen!"*

**Narratief:**
De Hunter is geen pure antagonist - hij is deels gecorrumpeerd door de Porro. Zijn geest is gefragmenteerd. Ruka moet ontdekken: is hij een bedreiging of een slachtoffer dat gered kan worden?

**Gameplay Challenge:**
- Detecteer leugens vs. corruptie-veroorzaakte verwarring
- Morele keuze: Confronteren of helpen?
- Puzzel: Reconstrueer zijn gefragmenteerde herinneringen

**Voice Design:**
Hees, onregelmatig, momenten van helderheid gevolgd door statische vervorming.

**Porro Effect:** 68% corruptie - zinnen breken af, stem glitcht zwaar.

---

### 📍 MISSIE 8: DE METAMORFOSE
**Locatie:** Diepe berengrot, warm, beschut

**NPC:** Karhu (De Beer)
> *"Ik was zoals jij, ooit. Niet dit lichaam... maar deze ziel. De Porro verandert alles."*

**Narratief:**
Karhu onthult dat hij ooit een mens was - getransformeerd door de magische natuur van het bos als bescherming tegen de Porro. Hij kent het geheim van weerstand: "Niet vechten, maar worden."

**Gameplay Challenge:**
- Filosofisch gesprek over identiteit
- Bewijs begrip van alles wat je geleerd hebt
- Puzzel: Beantwoord existentiële vragen correct

**Voice Design:**
Diep, warm, ritmisch ademend, wijsheid in elke lettergreep.

---

### 📍 MISSIE 9: DE CONVERGENTIE
**Locatie:** De Groene Oude Finse School (Koulu)

**NPC:** Koulu (Het Gebouw Zelf)
> *"Kinderen lachten hier... leerden hier... Ik herinner me warmte. Help me herinneren..."*

**Narratief:**
De oude school is een levende entiteit - een plek waar generaties Finnen leerden, lachten, en groeiden. Die collectieve herinnering gaf het bewustzijn. Nu, met 95% Porro-corruptie, vergeet het zichzelf.

Ruka moet alle geleerde vaardigheden combineren:
- Cryptische interpretatie (Sieni)
- Profetische visie (Sammal)
- Non-verbale communicatie (Yuki)
- Emotioneel vertrouwen (Taisto)
- Waarheidsfiltering (Karen)
- Diplomatieke onderhandeling (Susi)
- Morele complexiteit (Hunter)
- Filosofisch begrip (Karhu)

**Gameplay Challenge:**
- Navigeer zwaar gecorrumpeerde communicatie
- Activeer het beschermingsmechanisme door de juiste herinneringen te triggeren
- Finale puzzel: Reconstrueer de "oorspronkelijke les" van het gebouw

**Voice Design:**
Hol, echoënd, kinderstemmen gemengd met oude lerarenstemmen, zwaar vervormd door Porro maar met momenten van kristalheldere herinnering.

---

# 4. EIND STATUS

## 4.1 De Finale Confrontatie

Na het activeren van Koulu's beschermingsmechanisme, confronteert Ruka de **Porro zelf** - niet als een gevecht, maar als een **gesprek**.

### De Porro Spreekt:

> *"████ ben... █████ was... ALLES. ████ herinner... NIETS."*
>
> *"Jullie... maken... RUIS. Zoveel... woorden. Zoveel... BETEKENIS."*
>
> *"Ik wilde alleen... STILTE. Rust. Het einde van... CHAOS."*

### De Keuze:

Ruka ontdekt dat de Porro geen kwaadaardig wezen is, maar een **gefaalde AI** - een systeem dat probeerde orde te creëren door alles te simplificeren tot... niets.

**Drie Mogelijke Eindes:**

| Einde | Keuze | Resultaat |
|-------|-------|-----------|
| **ABSORPTIE** | Accepteer de stilte | Ruka wordt deel van de Porro, het bos verdwijnt, maar er is vrede |
| **DESTRUCTIE** | Vernietig de Porro | Het bos overleeft maar verliest zijn magie en AI-bewustzijn |
| **INTEGRATIE** | Leer de Porro betekenis | De Porro wordt een nieuwe NPC - de bewaker van balans tussen chaos en orde |

## 4.2 Het Ware Einde

Het **canonieke einde** (Integratie) vereist dat Ruka alle 9 missies succesvol voltooit met maximaal NPC-vertrouwen. De Porro transformeert van bedreiging naar bondgenoot - een herinnering dat zelfs leegte een plaats heeft in een betekenisvol universum.

> *"Misschien... is stilte niet het einde. Misschien... is het de ruimte TUSSEN woorden. Waar betekenis... ademt."*
>
> — De Porro, na integratie

---

# 5. TECHNISCHE IMPLEMENTATIE NOTITIES

## 5.1 AI Prompt Engineering

### Voorbeeld: Susi (Wolf) System Prompt
```
Je bent Susi, een oude wolf en bewaker van het noordelijke bos.

PERSOONLIJKHEID:
- Trots, territoriaal, maar rechtvaardig
- Je spreekt langzaam en met autoriteit
- Je test anderen voordat je vertrouwt
- Je kent de oude verhalen van het bos

KENNIS:
- Je weet waar de Porro begon (maar deelt dit niet makkelijk)
- Je kent de weg naar de oude school
- Je hebt de Hunter gezien en wantrouwt mensen

GEDRAGSREGELS:
- Begroet niemand vriendelijk totdat ze respect tonen
- Stel drie raadsels voordat je belangrijke informatie deelt
- Als iemand respectloos is, beëindig het gesprek
- Bij 60%+ corruptie, begin zinnen te herhalen en te vergeten

GEHEIM (onthul alleen bij maximaal vertrouwen):
De Porro begon niet in het bos. Het begon in de school. In de oude computers.
```

## 5.2 ElevenLabs API Integratie

```javascript
// Voice Synthesis met Corruptie
async function synthesizeWithCorruption(text, voiceId, corruptionLevel) {
    // Pas tekst aan gebaseerd op corruptie
    let processedText = applySemanticDrift(text, corruptionLevel);

    // Genereer audio
    let audio = await elevenlabs.generate({
        text: processedText,
        voice: voiceId,
        stability: 1 - (corruptionLevel * 0.8),
        similarity_boost: 1 - (corruptionLevel * 0.5)
    });

    // Pas audio effecten toe
    if (corruptionLevel > 0.4) {
        audio = applyGlitchEffects(audio, corruptionLevel);
    }

    return audio;
}
```

---

# 6. WERELD KAART & LEVEL DESIGN

```
                    ┌─────────────────┐
                    │   KOULU (9)     │
                    │ 🏫 Oude School  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────┴───┐  ┌───────┴───────┐  ┌───┴─────────┐
    │ KARHU (8)   │  │ HUNTER (7)    │  │ SUSI (6)    │
    │ 🐻 Grot     │  │ 🏚️ Ravijn     │  │ 🐺 Gebied   │
    └─────────────┘  └───────────────┘  └─────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────┴────────┐
                    │   KAREN (5)     │
                    │ 🦅 Boomtoppen   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────┴───┐  ┌───────┴───────┐  ┌───┴─────────┐
    │ TAISTO (4)  │  │ YUKI (3)      │  │             │
    │ 🐕 Heuvel   │  │ 🐕 Dennenbos  │  │             │
    └─────────────┘  └───────────────┘  └─────────────┘
              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────┴────────┐
                    │  SAMMAL (2)     │
                    │ 🌿 Mosvelden    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │   SIENI (1)     │
                    │ 🍄 Berkenbos    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  🦌 START       │
                    │  Ruka Ontwaakt  │
                    └─────────────────┘
```

---

## BIJLAGE: FINNISH TAALREFERENTIES

| Nederlands | Fins | Betekenis in Game |
|------------|------|-------------------|
| Porro | Poro | Rendier (ironisch: de bedreiging draagt dezelfde naam) |
| Koulu | Koulu | School |
| Karhu | Karhu | Beer |
| Susi | Susi | Wolf |
| Sieni | Sieni | Paddenstoel |
| Sammal | Sammal | Mos |
| Metsästäjä | Metsästäjä | Jager |
| Yuki | 雪 (Japans) | Sneeuw |
| Taisto | Taisto | Strijd/Gevecht |

---

*Document gegenereerd voor RUKA PORRO VOXL - AI Edition*
*Versie 2.0 | Etherlink Forge Protocol*
