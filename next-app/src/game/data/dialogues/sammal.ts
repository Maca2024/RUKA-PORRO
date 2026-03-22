/**
 * RUKA-PORRO — Sammal Dialogue Tree
 * Sammal is the forest healer. Voice: soft, nurturing, nature-wise, unhurried.
 * 12 nodes covering: first meeting, healing offer, nature wisdom,
 * corruption knowledge, trust-gated care, and farewell.
 */

import type { DialogueTree } from '../../types/game'

export const SAMMAL_DIALOGUE: DialogueTree = {
  npcId: 'sammal',
  entryNodeId: 'sammal_entry',
  nodes: {
    // ── ENTRY ─────────────────────────────────────────────────────────────────
    sammal_entry: {
      id: 'sammal_entry',
      speaker: 'sammal',
      text: '...',
      textFi: '...',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [],
      autoNext: 'sammal_welcome',
    },

    // ── FIRST MEETING ─────────────────────────────────────────────────────────
    sammal_welcome: {
      id: 'sammal_welcome',
      speaker: 'sammal',
      text: 'Oh… hello, little one. I almost missed you among the snowflakes. I am Sammal — I grow here in the clearing where the sun touches the ground for just a little while each day. Are you hurt? You look a little cold. Come, let me see.',
      textFi: 'Oh… hei, pikkuinen. Melkein erehdyin näkemättä sinua lumihiutaleiden joukossa. Olen Sammal — kasvatan itseäni täällä aukiolla, jossa aurinko koskettaa maata vain hetkeksi joka päivä. Oletko loukkaantunut? Näytät hieman kylmältä. Tule, katsotaan.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_who_are_you_sammal',
          text: 'Who are you?',
          textFi: 'Kuka olet?',
          trustDelta: 0,
          next: 'sammal_about_herself',
        },
        {
          id: 'c_yes_cold',
          text: 'Yes, I am cold and tired.',
          textFi: 'Kyllä, olen kylmä ja väsynyt.',
          trustDelta: 2,
          next: 'sammal_healing_offer',
        },
        {
          id: 'c_sieni_sent_me',
          text: 'Sieni sent me. The forest is in danger.',
          textFi: 'Sieni lähetti minut. Metsä on vaarassa.',
          trustDelta: 5,
          next: 'sammal_knows_about_corruption',
        },
      ],
      autoNext: null,
    },

    sammal_about_herself: {
      id: 'sammal_about_herself',
      speaker: 'sammal',
      text: 'I am the healer of this clearing. When an animal is hurt or sick, they find their way here — as if the ground itself guides their feet. I listen to what the body needs and I give what the forest has. Warmth, rest, a few good herbs. Nothing magical — except that it works.',
      textFi: 'Olen tämän aukion parantaja. Kun eläin on loukkaantunut tai sairas, he löytävät tiensä tänne — ikään kuin maa itse ohjaisi heidän askeleitaan. Kuuntelen mitä keho tarvitsee ja annan mitä metsällä on. Lämpöä, lepoa, muutaman hyvän yrtin. Ei mitään maagista — paitsi että se toimii.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_can_you_heal_me',
          text: 'Can you heal me?',
          textFi: 'Voitko parantaa minut?',
          trustDelta: 2,
          next: 'sammal_healing_offer',
        },
        {
          id: 'c_what_herbs',
          text: 'What kind of herbs do you use?',
          textFi: 'Mitä yrttejä käytät?',
          trustDelta: 3,
          next: 'sammal_herb_wisdom',
        },
      ],
      autoNext: null,
    },

    // ── HEALING ───────────────────────────────────────────────────────────────
    sammal_healing_offer: {
      id: 'sammal_healing_offer',
      speaker: 'sammal',
      text: 'Of course. Sit still for a moment and breathe slowly. Feel the ground under your hooves — it is cold, yes, but it is solid and real. I will press a little warm moss against your side. There. Can you feel the warmth spreading? That is the forest saying: you are welcome here.',
      textFi: 'Tietysti. Istu hetken paikoillaan ja hengitä rauhallisesti. Tunne maa kavioittesi alla — se on kylmä, kyllä, mutta vankka ja todellinen. Panen pienen lämpimän sammalen kylkeäsi vasten. Siinä. Tunnetko lämmön leviävän? Se on metsä sanomassa: olet tervetullut tänne.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_feel_better',
          text: 'I feel better already. Thank you.',
          textFi: 'Voin jo paremmin. Kiitos.',
          trustDelta: 8,
          next: 'sammal_you_are_welcome',
        },
      ],
      autoNext: null,
      trustDelta: 5,
    },

    sammal_you_are_welcome: {
      id: 'sammal_you_are_welcome',
      speaker: 'sammal',
      text: 'You are very welcome, little reindeer. Remember: whenever you feel hurt or cold during your journey, find a quiet spot, press your nose to the ground, and think of this clearing. It will help a little. And if that is not enough — come back to me.',
      textFi: 'Ole hyvä, pieni poro. Muista: aina kun tunnet itsesi loukkaantuneeksi tai kylmäksi matkallasi, löydä hiljainen paikka, paina nenäsi maahan ja ajattele tätä aukiota. Se auttaa hieman. Ja jos se ei riitä — tule takaisin luokseni.',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_ask_about_corruption',
          text: 'Do you know what is wrong with the forest?',
          textFi: 'Tiedätkö mitä metsässä on vialla?',
          trustDelta: 2,
          next: 'sammal_knows_about_corruption',
        },
        {
          id: 'c_goodbye_sammal',
          text: 'Thank you. I should keep going.',
          textFi: 'Kiitos. Minun pitää jatkaa.',
          trustDelta: 2,
          next: 'sammal_farewell',
        },
      ],
      autoNext: null,
    },

    // ── HERB WISDOM ───────────────────────────────────────────────────────────
    sammal_herb_wisdom: {
      id: 'sammal_herb_wisdom',
      speaker: 'sammal',
      text: 'Let me show you. Those small yellow flowers near the pine roots — they warm the belly. The blue berries on the low bushes — they sharpen your eyes in the dark. And the silvery lichen on the rocks? That one is special. It soothes fear. Keep your eyes open as you walk — the forest is a pharmacy, if you know how to read it.',
      textFi: 'Näytän sinulle. Ne pienet keltaiset kukat mäntynjuurien lähellä — ne lämmittävät vatsan. Siniset marjat matalissa pensaissa — ne terävöittävät silmiäsi pimeässä. Ja hopeinen jäkälä kivissä? Se on erityinen. Se lievittää pelkoa. Pidä silmät auki kävellessäsi — metsä on apteekki, jos osaat lukea sitä.',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_thanks_herb',
          text: 'This is so helpful. Thank you!',
          textFi: 'Tämä on niin hyödyllistä. Kiitos!',
          trustDelta: 5,
          next: 'sammal_healing_offer',
        },
      ],
      autoNext: null,
    },

    // ── CORRUPTION KNOWLEDGE ──────────────────────────────────────────────────
    sammal_knows_about_corruption: {
      id: 'sammal_knows_about_corruption',
      speaker: 'sammal',
      text: 'I know. I have felt it for weeks now — through the roots, through the soil. The plants at the edge of the forest are turning grey. Their leaves feel wrong, like cold metal instead of soft green. Something is poisoning the ground from far away. Something very large and very old.',
      textFi: 'Tiedän. Olen tuntenut sen jo viikkoja — juurien kautta, maan kautta. Metsän reunan kasvit muuttuvat harmaaksi. Niiden lehdet tuntuvat vääriltä, kuin kylmältä metallilta pehmeän vihreän sijaan. Jotain myrkyttää maata kaukaa. Jotain hyvin suurta ja hyvin vanhaa.',
      emotion: 'warning',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_what_can_we_do',
          text: 'What can we do to stop it?',
          textFi: 'Mitä voimme tehdä pysäyttääksemme sen?',
          trustDelta: 5,
          next: 'sammal_corruption_advice',
        },
        {
          id: 'c_are_you_scared',
          text: 'Are you scared?',
          textFi: 'Pelkäättkö?',
          trustDelta: 3,
          next: 'sammal_scared_but_ready',
        },
      ],
      autoNext: null,
    },

    sammal_scared_but_ready: {
      id: 'sammal_scared_but_ready',
      speaker: 'sammal',
      text: 'Yes, I am scared. I would be lying if I said I was not. But fear and courage live in the same heart, little one. I have been here a long time. I have seen the forest recover from fires and floods. It always finds a way. And this time, I think you are part of that way.',
      textFi: 'Kyllä, pelkään. Valehtelisin jos sanoisin muuta. Mutta pelko ja rohkeus asuvat samassa sydämessä, pikkuinen. Olen ollut täällä kauan. Olen nähnyt metsän toipuvan tulipaloista ja tulvista. Se löytää aina tien. Ja tällä kertaa luulen, että sinä olet osa sitä tietä.',
      emotion: 'sad',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_help_together',
          text: 'I will help. We will fix this together.',
          textFi: 'Autan. Korjaamme tämän yhdessä.',
          trustDelta: 8,
          next: 'sammal_corruption_advice',
        },
      ],
      autoNext: null,
    },

    sammal_corruption_advice: {
      id: 'sammal_corruption_advice',
      speaker: 'sammal',
      text: 'The corruption spreads through fear and loneliness. Every friend you make, every creature you help — it pushes the darkness back a little. Bring me two healing herbs from the eastern slope and I will make something that protects you on your journey. Will you do that?',
      textFi: 'Korruptio leviää pelon ja yksinäisyyden kautta. Jokainen ystävä jonka teet, jokainen olento jota autat — se työntää pimeyttä hieman taaksepäin. Tuo minulle kaksi paranemisyrttitä itäiseltä rinteeltä ja teen jotain joka suojelee sinua matkallasi. Teetkö sen?',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_yes_herbs',
          text: 'Yes! I will bring you the herbs.',
          textFi: 'Kyllä! Tuon sinulle yrtit.',
          trustDelta: 5,
          next: 'sammal_herb_quest_accepted',
          icon: 'herb',
        },
        {
          id: 'c_where_herbs',
          text: 'Where exactly are the herbs?',
          textFi: 'Missä tarkalleen ovat yrtit?',
          trustDelta: 0,
          next: 'sammal_herb_directions',
        },
      ],
      autoNext: null,
      missionTrigger: 'm2_whispers',
    },

    sammal_herb_directions: {
      id: 'sammal_herb_directions',
      speaker: 'sammal',
      text: 'Follow the path of small stones heading east from this clearing. After the two birch trees that grow very close together — like old friends leaning on each other — you will see a rocky slope. The healing herbs grow in the cracks of the rocks, where a little trickle of meltwater keeps them soft.',
      textFi: 'Seuraa pienten kivien polkua idästä päin tältä aukiolta. Kahden koivun jälkeen, jotka kasvavat hyvin lähekkäin — kuin vanhat ystävät, jotka nojailevat toisiinsa — näet kivisen rinteen. Paranemisyrtit kasvavat kivien halkeamissa, missä pieni sulamisveden puro pitää ne pehmeänä.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_got_directions',
          text: 'I found it on the map. I will go now!',
          textFi: 'Löysin sen kartalta. Lähden nyt!',
          trustDelta: 3,
          next: 'sammal_herb_quest_accepted',
        },
      ],
      autoNext: null,
    },

    sammal_herb_quest_accepted: {
      id: 'sammal_herb_quest_accepted',
      speaker: 'sammal',
      text: 'Thank you, little Poro. Come back safely. And while you walk — breathe in the cold air and remember: the forest loves you. Even when it is dark, even when it is cold, even when you are afraid. It loves you.',
      textFi: 'Kiitos, pieni Poro. Tule takaisin turvallisesti. Ja kävele — hengitä kylmää ilmaa ja muista: metsä rakastaa sinua. Vaikka olisi pimeää, vaikka olisi kylmää, vaikka pelkäisit. Se rakastaa sinua.',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [],
      autoNext: 'sammal_farewell',
    },

    // ── FAREWELL ──────────────────────────────────────────────────────────────
    sammal_farewell: {
      id: 'sammal_farewell',
      speaker: 'sammal',
      text: 'Go gently, little one. The clearing will always be here. I will be here. Come back when you need warmth, or when you just need a quiet place to breathe. The door is always open — even if I am just moss.',
      textFi: 'Mene hiljaa, pikkuinen. Aukio on aina täällä. Olen aina täällä. Tule takaisin kun tarvitset lämpöä, tai kun tarvitset vain hiljaisen paikan hengittää. Ovi on aina auki — vaikka olen vain sammalta.',
      emotion: 'gentle',
      condition: { type: 'always' },
      choices: [],
      autoNext: null,
    },
  },
}
