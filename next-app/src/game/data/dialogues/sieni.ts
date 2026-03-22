/**
 * RUKA-PORRO — Sieni Dialogue Tree
 * Sieni is the first NPC kids meet. Voice: warm, ancient, speaks in gentle riddles.
 * 18 nodes covering: welcome, basics tutorial, mission hints, corruption warning,
 * trust-gated responses, and farewell.
 */

import type { DialogueTree } from '../../types/game'

export const SIENI_DIALOGUE: DialogueTree = {
  npcId: 'sieni',
  entryNodeId: 'sieni_entry',
  nodes: {
    // ── ENTRY GATE ────────────────────────────────────────────────────────────
    // Branches by trust so returning players get a personalised greeting.
    sieni_entry: {
      id: 'sieni_entry',
      speaker: 'sieni',
      text: '...',
      textFi: '...',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [],
      autoNext: 'sieni_welcome_first',
    },

    // ── FIRST MEETING ─────────────────────────────────────────────────────────
    sieni_welcome_first: {
      id: 'sieni_welcome_first',
      speaker: 'sieni',
      text: 'Ah… a little reindeer calf steps into the snow. The forest has been waiting for you, small one. I am Sieni. I have grown in this soil for three hundred winters. Come closer — I will not bite. Mushrooms never do.',
      textFi: 'Aa… pieni poronvasikka astuu lumeen. Metsä on odottanut sinua, pikkuinen. Olen Sieni. Olen kasvanut tässä maassa kolmesataa talvea. Tule lähemmäksi — en pure. Sienet eivät koskaan pure.',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_who_are_you',
          text: 'Who are you?',
          textFi: 'Kuka olet?',
          trustDelta: 0,
          next: 'sieni_who_i_am',
        },
        {
          id: 'c_what_is_this_place',
          text: 'Where am I?',
          textFi: 'Missä olen?',
          trustDelta: 0,
          next: 'sieni_where_you_are',
        },
        {
          id: 'c_hello',
          text: 'Hello, Sieni! I am Poro.',
          textFi: 'Hei, Sieni! Olen Poro.',
          trustDelta: 5,
          next: 'sieni_hello_response',
        },
      ],
      autoNext: null,
    },

    sieni_who_i_am: {
      id: 'sieni_who_i_am',
      speaker: 'sieni',
      text: 'Who am I? Ha. That is a question I once spent fifty years pondering. I am a guide — or a friend — or simply a mushroom who grew in the right place at the right time. What matters is this: I know this forest, and this forest knows me. And now, it knows you too.',
      textFi: 'Kuka olen? Ha. Se on kysymys, jota pohdin kerran viisikymmentä vuotta. Olen opas — tai ystävä — tai yksinkertaisesti sieni, joka kasvoi oikeassa paikassa oikeaan aikaan. Tärkeintä on tämä: tunnen tämän metsän, ja tämä metsä tuntee minut. Ja nyt se tuntee myös sinut.',
      emotion: 'mysterious',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_back_to_start',
          text: 'Tell me more about this place.',
          textFi: 'Kerro minulle lisää tästä paikasta.',
          trustDelta: 2,
          next: 'sieni_where_you_are',
        },
      ],
      autoNext: null,
    },

    sieni_where_you_are: {
      id: 'sieni_where_you_are',
      speaker: 'sieni',
      text: 'You are in Lapland — the land of snow and silence, of dancing lights and deep forests. This is a place where magic is as real as the cold on your nose. But something is wrong here. Something dark has been creeping through the roots. That is why you came, I think.',
      textFi: 'Olet Lapissa — lumen ja hiljaisuuden, tanssivien valojen ja syvien metsien maassa. Tämä on paikka, jossa taika on yhtä todellinen kuin kylmyys nenässäsi. Mutta täällä on jotain vialla. Jotain synkkää on hiipiyt juurien läpi. Siksi tulit, luulen.',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_dark_thing',
          text: 'What is the dark thing?',
          textFi: 'Mikä on se synkkä asia?',
          trustDelta: 2,
          next: 'sieni_corruption_hint',
        },
        {
          id: 'c_what_should_i_do',
          text: 'What should I do?',
          textFi: 'Mitä minun pitäisi tehdä?',
          trustDelta: 2,
          next: 'sieni_first_task',
        },
      ],
      autoNext: null,
    },

    sieni_hello_response: {
      id: 'sieni_hello_response',
      speaker: 'sieni',
      text: 'Poro! What a perfect name for a little reindeer. And look at those antler stubs! Very promising. Now then, Poro — this forest needs your help, and I suspect you need its help too. Shall we begin?',
      textFi: 'Poro! Mikä täydellinen nimi pienelle porille. Ja katso noita sarvenhirviksiä! Hyvin lupaavat. No sitten, Poro — tämä metsä tarvitsee apuasi, ja epäilen, että sinä tarvitset sen apua myös. Aloitetaanko?',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_yes_begin',
          text: 'Yes! Let\'s begin!',
          textFi: 'Kyllä! Aloitetaan!',
          trustDelta: 5,
          next: 'sieni_first_task',
        },
        {
          id: 'c_tell_me_more_first',
          text: 'Tell me more first.',
          textFi: 'Kerro enemmän ensin.',
          trustDelta: 0,
          next: 'sieni_where_you_are',
        },
      ],
      autoNext: null,
    },

    // ── TUTORIAL / FIRST TASK ─────────────────────────────────────────────────
    sieni_first_task: {
      id: 'sieni_first_task',
      speaker: 'sieni',
      text: 'Then listen well. To the north, near the old yellow school building, is your first safe place. To get there: walk with your legs, run when you must, and pick up what the forest offers. The red berries on that bush over there — take three. They are sweet and they will help you. Then go to the school.',
      textFi: 'Kuuntele sitten tarkasti. Pohjoiseen, vanhan keltaisen koulurakennuksen lähellä, on ensimmäinen turvallinen paikkasi. Päästäksesi sinne: kävele jaloillasi, juokse kun täytyy, ja nosta mitä metsä tarjoaa. Nuo punaiset marjat tuolla pensaassa — ota kolme. Ne ovat makeita ja auttavat sinua. Mene sitten kouluun.',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_understand',
          text: 'I understand. I will do it!',
          textFi: 'Ymmärrän. Teen sen!',
          trustDelta: 3,
          next: 'sieni_tutorial_encouragement',
          icon: 'thumbs_up',
        },
        {
          id: 'c_how_do_i_run',
          text: 'How do I run?',
          textFi: 'Miten juoksen?',
          trustDelta: 0,
          next: 'sieni_how_to_run',
        },
      ],
      autoNext: null,
      missionTrigger: 'm1_first_snow',
    },

    sieni_how_to_run: {
      id: 'sieni_how_to_run',
      speaker: 'sieni',
      text: 'Ah, the ancient question! Hold down the run button — it is the one that makes your hooves move faster. Reindeer are born to run across snow, you know. Your legs remember even if you have forgotten. Try it!',
      textFi: 'Aa, muinainen kysymys! Pidä juoksupainike pohjassa — se on se, joka saa kaviot liikkumaan nopeammin. Porot on syntynyt juoksemaan lumen yli, tiedätkö. Jalkasi muistavat vaikka olet unohtanut. Kokeile!',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_ok_thanks',
          text: 'OK, I will try!',
          textFi: 'OK, kokeilen!',
          trustDelta: 2,
          next: 'sieni_tutorial_encouragement',
        },
      ],
      autoNext: null,
    },

    sieni_tutorial_encouragement: {
      id: 'sieni_tutorial_encouragement',
      speaker: 'sieni',
      text: 'That is the spirit! Remember: the forest is your friend, not your enemy. Step gently, listen carefully, and never give up. I will be here if you need me. Now go, little Poro — the berries and the school are waiting!',
      textFi: 'Se on oikea asenne! Muista: metsä on ystäväsi, ei vihollisesi. Astu varovasti, kuuntele tarkasti, äläkä koskaan luovuta. Olen täällä jos tarvitset minua. Mene nyt, pieni Poro — marjat ja koulu odottavat!',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [],
      autoNext: null,
    },

    // ── CORRUPTION WARNING ────────────────────────────────────────────────────
    sieni_corruption_hint: {
      id: 'sieni_corruption_hint',
      speaker: 'sieni',
      text: 'Listen to the riddle of the roots: something ancient and sad has turned the darkness against the light. The trees call it Porro — not a name you want to say too loudly. It began far away, in a cold cave, with a sleeping bear who forgot to dream of spring.',
      textFi: 'Kuuntele juurten arvoitusta: jotain muinaista ja surullista on kääntänyt pimeyden valoa vastaan. Puut kutsuvat sitä Porroksi — nimi, jota et halua sanoa liian kovaa. Se alkoi kaukaa, kylmässä luolassa, nukkuvasta karhusta, joka unohti uneksia keväästä.',
      emotion: 'warning',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_how_to_stop',
          text: 'How do we stop it?',
          textFi: 'Miten lopetamme sen?',
          trustDelta: 3,
          next: 'sieni_corruption_solution',
        },
        {
          id: 'c_scared',
          text: 'That sounds scary...',
          textFi: 'Kuulostaa pelottavalta...',
          trustDelta: 1,
          next: 'sieni_courage',
        },
      ],
      autoNext: null,
    },

    sieni_corruption_solution: {
      id: 'sieni_corruption_solution',
      speaker: 'sieni',
      text: 'Every shadow has a seed of light. Every lost creature has a memory of goodness. The answer is not a sword, little one — it is friendship. Collect enough trust, gather enough allies, and the darkness will have nowhere left to hide. Begin with the healer in the forest clearing. Her name is Sammal.',
      textFi: 'Jokaisessa varjossa on valon siemen. Jokaisessa kadonneessa olennossa on hyvyyden muisto. Vastaus ei ole miekka, pikkuinen — se on ystävyys. Kerää tarpeeksi luottamusta, kokoa tarpeeksi liittolaisia, ja pimeydellä ei ole enää paikkaa piiloutua. Aloita parantajasta metsäaukiolla. Hänen nimensä on Sammal.',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_find_sammal',
          text: 'I will find Sammal!',
          textFi: 'Löydän Sammalin!',
          trustDelta: 5,
          next: 'sieni_farewell',
        },
      ],
      autoNext: null,
      missionTrigger: 'm2_whispers',
    },

    sieni_courage: {
      id: 'sieni_courage',
      speaker: 'sieni',
      text: 'Being scared is not weakness, little one. It means you understand the danger. But I will tell you a secret — courage is not the absence of fear. It is taking one step forward even when you are afraid. And you just asked me how to stop it. That was courage, right there.',
      textFi: 'Pelkääminen ei ole heikkous, pikkuinen. Se tarkoittaa, että ymmärrät vaaran. Mutta kerron sinulle salaisuuden — rohkeus ei ole pelon puuttuminen. Se on askeleen ottaminen eteenpäin vaikka pelkäisi. Ja sinä vain kysyit minulta kuinka lopettaa se. Se oli rohkeutta, juuri siinä.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_i_can_do_it',
          text: 'I can do it!',
          textFi: 'Voin tehdä sen!',
          trustDelta: 5,
          next: 'sieni_corruption_solution',
        },
      ],
      autoNext: null,
    },

    // ── TRUST-GATED RESPONSES ─────────────────────────────────────────────────
    sieni_high_trust_greeting: {
      id: 'sieni_high_trust_greeting',
      speaker: 'sieni',
      text: 'Ah, my favourite little reindeer returns! The roots told me you were coming — they always do. I can see how much you have grown, Poro. The forest is proud of you. Now, what wisdom do you seek today?',
      textFi: 'Aa, suosikki­porontyttäreni palaa! Juuret kertoivat minulle tulevasi — ne tekevät aina niin. Näen kuinka paljon olet kasvanut, Poro. Metsä on sinusta ylpeä. Mitä viisautta etsit tänään?',
      emotion: 'happy',
      condition: { type: 'trust_gte', value: 60 },
      choices: [
        {
          id: 'c_mission_hint',
          text: 'Can you give me a hint for my next step?',
          textFi: 'Voitko antaa minulle vihjeen seuraavasta askeleesta?',
          trustDelta: 0,
          next: 'sieni_mission_riddle',
        },
        {
          id: 'c_just_saying_hi',
          text: 'Just saying hi!',
          textFi: 'Tulin vain sanomaan hei!',
          trustDelta: 3,
          next: 'sieni_farewell',
        },
      ],
      autoNext: null,
    },

    sieni_low_trust_greeting: {
      id: 'sieni_low_trust_greeting',
      speaker: 'sieni',
      text: 'Oh. You came back. The roots have been quiet about you — that worries me a little. Are you all right, little one? Remember: I am here to help, not to judge.',
      textFi: 'Oh. Tulit takaisin. Juuret ovat olleet hiljaa sinusta — se hieman huolestuttaa minua. Onko kaikki hyvin, pikkuinen? Muista: olen täällä auttamaan, en tuomitsemaan.',
      emotion: 'sad',
      condition: { type: 'trust_lte', value: -10 },
      choices: [
        {
          id: 'c_sorry',
          text: 'I am sorry. I want to do better.',
          textFi: 'Olen pahoillani. Haluan tehdä paremmin.',
          trustDelta: 10,
          next: 'sieni_encouragement_after_low',
        },
        {
          id: 'c_need_help',
          text: 'I need help.',
          textFi: 'Tarvitsen apua.',
          trustDelta: 5,
          next: 'sieni_first_task',
        },
      ],
      autoNext: null,
    },

    sieni_encouragement_after_low: {
      id: 'sieni_encouragement_after_low',
      speaker: 'sieni',
      text: 'Good. That is all I needed to hear. Everyone takes wrong turns sometimes — even mushrooms. The path forward is always there, as long as you are looking for it. Let me tell you what to do next.',
      textFi: 'Hyvä. Se oli kaikki mitä tarvitsin kuulla. Jokainen eksyy joskus — jopa sienet. Eteenpäin vievä tie on aina olemassa, kunhan etsit sitä. Kerrotaan sinulle mitä tehdä seuraavaksi.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_yes_tell_me',
          text: 'Please tell me.',
          textFi: 'Kerro minulle.',
          trustDelta: 0,
          next: 'sieni_first_task',
        },
      ],
      autoNext: null,
    },

    // ── MISSION RIDDLE HINT ───────────────────────────────────────────────────
    sieni_mission_riddle: {
      id: 'sieni_mission_riddle',
      speaker: 'sieni',
      text: 'Then listen to the riddle of the pines: the one who was lost near cold water remembers warmth when offered a small gift of the sea. Seek her with patience and dried salt, and she will run beside you for the rest of the journey.',
      textFi: 'Kuuntele sitten mäntyjen arvoitusta: se, joka eksyi kylmän veden lähelle, muistaa lämmön kun sille tarjotaan pieni meren lahja. Etsi häntä kärsivällisyydellä ja kuivatulla suolalla, niin hän juoksee rinnallasi koko matkan ajan.',
      emotion: 'mysterious',
      condition: { type: 'trust_gte', value: 40 },
      choices: [
        {
          id: 'c_yuki',
          text: 'Is that Yuki? The dog by the lake?',
          textFi: 'Onko se Yuki? Se koira järven lähellä?',
          trustDelta: 8,
          next: 'sieni_riddle_correct',
        },
        {
          id: 'c_dont_understand',
          text: 'I do not understand the riddle.',
          textFi: 'En ymmärrä arvoitusta.',
          trustDelta: 0,
          next: 'sieni_riddle_hint_2',
        },
      ],
      autoNext: null,
    },

    sieni_riddle_hint_2: {
      id: 'sieni_riddle_hint_2',
      speaker: 'sieni',
      text: 'Hmm. Let me try again. There is a dog — white as new snow — who sits alone beside the frozen lake to the east. She is waiting, though she does not know it yet. Bring her something she loves and she will trust you.',
      textFi: 'Hmm. Yritän uudestaan. On koira — valkoinen kuin uusi lumi — joka istuu yksin jäätyneen järven rannalla idässä. Hän odottaa, vaikkei vielä tiedä sitä. Tuo hänelle jotain mitä hän rakastaa ja hän luottaa sinuun.',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_got_it',
          text: 'Got it! I will bring her dried fish.',
          textFi: 'Selvä! Tuon hänelle kuivattua kalaa.',
          trustDelta: 5,
          next: 'sieni_riddle_correct',
        },
      ],
      autoNext: null,
    },

    sieni_riddle_correct: {
      id: 'sieni_riddle_correct',
      speaker: 'sieni',
      text: 'Yes! The roots sing when you understand! Yuki has been alone for too long. A little kindness and a small fish will open her heart. Go to the frozen lake — she will be on the north shore, watching the ice.',
      textFi: 'Kyllä! Juuret laulavat kun ymmärrät! Yuki on ollut yksin liian kauan. Pieni ystävällisyys ja pieni kala avaa hänen sydämensä. Mene jäätyneelle järvelle — hän on pohjoisrannalla, katselemassa jäätä.',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [],
      autoNext: 'sieni_farewell',
      missionTrigger: 'm3_lost_dog',
    },

    // ── FAREWELL ──────────────────────────────────────────────────────────────
    sieni_farewell: {
      id: 'sieni_farewell',
      speaker: 'sieni',
      text: 'Off you go then, little Poro. The snow remembers every step you take. Make them count. And remember — whenever the forest feels too dark or too cold, you can always come back and talk to an old mushroom.',
      textFi: 'Mene nyt, pieni Poro. Lumi muistaa jokaisen askeleesi. Tee ne merkityksellisiksi. Ja muista — aina kun metsä tuntuu liian pimeältä tai liian kylmältä, voit aina palata juttelemaan vanhalle sienelle.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [],
      autoNext: null,
    },
  },
}
