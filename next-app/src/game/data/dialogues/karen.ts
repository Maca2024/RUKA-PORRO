/**
 * RUKA-PORRO — Karen Dialogue Tree
 * Karen is the trickster crow. Voice: theatrical, quick, bargain-driven,
 * self-important but secretly useful.
 * 13 nodes covering: first perch meeting, bargaining, riddles, information
 * about the corruption, trust-gated snark, and grudging farewell.
 */

import type { DialogueTree } from '../../types/game'

export const KAREN_DIALOGUE: DialogueTree = {
  npcId: 'karen',
  entryNodeId: 'karen_entry',
  nodes: {
    // ── ENTRY ─────────────────────────────────────────────────────────────────
    karen_entry: {
      id: 'karen_entry',
      speaker: 'karen',
      text: '...',
      textFi: '...',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [],
      autoNext: 'karen_first_notice',
    },

    // ── FIRST MEETING ─────────────────────────────────────────────────────────
    karen_first_notice: {
      id: 'karen_first_notice',
      speaker: 'karen',
      text: 'CAW! Oh my. Oh my, oh my, oh my. A baby reindeer wandering under my trees. Do you know how rare that is? Do you know who I am? I am Karen. THE Karen. I know everything that happens in this forest. Everything. And I mean everything.',
      textFi: 'KRAAK! Voi minua. Voi minua, voi minua, voi minua. Pikku poro vaeltaa puitteni alla. Tiedätkö kuinka harvinaista se on? Tiedätkö kuka olen? Olen Karen. SE Karen. Tiedän kaiken mitä tässä metsässä tapahtuu. Kaiken. Ja tarkoitan kaiken.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_who_is_karen',
          text: 'Who is Karen?',
          textFi: 'Kuka on Karen?',
          trustDelta: -2,
          next: 'karen_offended_who',
        },
        {
          id: 'c_impressive',
          text: 'Wow, you know everything?',
          textFi: 'Vau, tiedät kaiken?',
          trustDelta: 3,
          next: 'karen_boast',
        },
        {
          id: 'c_need_info',
          text: 'I need information about the corruption.',
          textFi: 'Tarvitsen tietoa korruptiosta.',
          trustDelta: 0,
          next: 'karen_price_first',
        },
      ],
      autoNext: null,
    },

    karen_offended_who: {
      id: 'karen_offended_who',
      speaker: 'karen',
      text: 'WHO IS KAREN. Who is— I— CAW. Unbelievable. I have lived in these trees for twenty-three years, I have watched three generations of wolves come and go, I have memorised the hiding places of every squirrel within six kilometres, and this baby reindeer asks WHO IS KAREN.',
      textFi: 'KUKA ON KAREN. Kuka on— Minä— KRAAK. Uskomaton. Olen asunut näissä puissa kaksikymmentäkolme vuotta, olen seurannut kolmea sukupolvea susia tulevan ja menevän, olen muistanut jokaisen oravain piilopaikan kuuden kilometrin säteellä, ja tämä pikku poro kysyy KUKA ON KAREN.',
      emotion: 'angry',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_sorry_karen',
          text: 'Sorry! I just arrived. Of course you are famous.',
          textFi: 'Anteeksi! Tulin juuri. Olet tietysti kuuluisa.',
          trustDelta: 5,
          next: 'karen_mollified',
        },
      ],
      autoNext: null,
    },

    karen_mollified: {
      id: 'karen_mollified',
      speaker: 'karen',
      text: '...Fine. Fine fine fine. You are forgiven. I suppose you are new and do not know the social order of this forest yet. I am at the top, just so we are clear. Now. What do you want?',
      textFi: '...Selvä. Selvä selvä selvä. Olet annettu anteeksi. Arvasin, että olet uusi etkä vielä tiedä tämän metsän sosiaalista järjestystä. Olen huipulla, jotta se on selvää. Nyt. Mitä haluat?',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_need_info_mollified',
          text: 'I need to know about the corruption.',
          textFi: 'Minun täytyy tietää korruptiosta.',
          trustDelta: 0,
          next: 'karen_price_first',
        },
      ],
      autoNext: null,
    },

    karen_boast: {
      id: 'karen_boast',
      speaker: 'karen',
      text: 'Oh, I do not just know things — I collect them. Like shiny objects, but better. I know where the wolf sleeps. I know what the old bear mutters in his cave. I know which ice is thin and which is thick. Knowledge is the best treasure, little deer. And I have mountains of it.',
      textFi: 'Oh, en vain tiedä asioita — keräilen niitä. Kuten kiiltäviä esineitä, mutta parempia. Tiedän missä susi nukkuu. Tiedän mitä vanha karhu mutisee luolassaan. Tiedän mikä jää on ohutta ja mikä paksua. Tieto on paras aarre, pikku hirvi. Ja minulla on siitä vuoria.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_sell_info',
          text: 'Will you share some knowledge with me?',
          textFi: 'Jaatko tietoa minun kanssani?',
          trustDelta: 2,
          next: 'karen_price_first',
        },
      ],
      autoNext: null,
    },

    // ── BARGAINING ────────────────────────────────────────────────────────────
    karen_price_first: {
      id: 'karen_price_first',
      speaker: 'karen',
      text: 'Knowledge for free? Oh no no no no no. Karen does not do charity. If you want what I know, you bring me what I want. And what I want is: three. Shiny. Things. Coins, trinkets, crystals, whatever. Shiny. Three of them. Then we talk.',
      textFi: 'Tietoa ilmaiseksi? Oh ei ei ei ei ei. Karen ei tee hyväntekeväisyyttä. Jos haluat tietää mitä tiedän, tuo minulle mitä haluan. Ja minä haluan: kolme. Kiiltävää. Asiaa. Kolikoita, koruja, kristalleja, mitä tahansa. Kiiltäviä. Kolme kappaletta. Sitten puhutaan.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_deal',
          text: 'Deal. I will find three shiny things.',
          textFi: 'Sopimus. Löydän kolme kiiltävää asiaa.',
          trustDelta: 5,
          next: 'karen_deal_accepted',
          icon: 'handshake',
        },
        {
          id: 'c_that_is_unfair',
          text: 'That seems like a lot...',
          textFi: 'Se tuntuu paljolta...',
          trustDelta: -3,
          next: 'karen_negotiate',
        },
      ],
      autoNext: null,
    },

    karen_negotiate: {
      id: 'karen_negotiate',
      speaker: 'karen',
      text: 'A lot? A LOT? I am offering you the secrets of the entire forest, and you are complaining about three small shiny objects? Fine. I will make it easy: one coin, one crystal, and one thing that makes me go "ooooh". That is basically one and a half shiny things. Best deal in Lapland.',
      textFi: 'Paljolta? PALJOLTA? Tarjoan sinulle koko metsän salaisuuksia, ja valitat kolmesta pienestä kiiltävästä esineestä? Selvä. Teen sen helpoksi: yksi kolikko, yksi kristalli ja yksi asia joka saa minut sanomaan "oooh". Se on käytännössä puolentoista kiiltävää asiaa. Lapin paras diili.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_ok_deal',
          text: 'OK! It is a deal.',
          textFi: 'OK! Sovittu.',
          trustDelta: 5,
          next: 'karen_deal_accepted',
        },
      ],
      autoNext: null,
    },

    karen_deal_accepted: {
      id: 'karen_deal_accepted',
      speaker: 'karen',
      text: 'Smart deer. Very smart deer. Go and get the shiny things — they will be scattered around the treetop area because, well, I may have dropped some recently. Bring them back here and I will tell you things that will make your little antler stubs tingle.',
      textFi: 'Älykäs poro. Hyvin älykäs poro. Mene ja hae kiiltävät asiat — ne ovat hajallaan puualueella koska, no, olen saattanut pudottaa joitakin äskettäin. Tuo ne takaisin tänne ja kerron sinulle asioita jotka saavat pikkusarvesi kihotamaan.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [],
      autoNext: null,
      missionTrigger: 'm4_crow_feathers',
    },

    // ── AFTER SHINY THINGS DELIVERED ─────────────────────────────────────────
    karen_received_payment: {
      id: 'karen_received_payment',
      speaker: 'karen',
      text: 'Ooooh. Ooh. OH. These are beautiful. This coin has a little fish on it! I have never seen a fish coin before! And this crystal is — CAW! Perfect. You have excellent taste for a hoofed creature. A deal is a deal. Listen carefully.',
      textFi: 'Oooh. Ooh. OH. Nämä ovat kauniita. Tässä kolikossa on pieni kala siinä! En ole koskaan nähnyt kalakolia ennen! Ja tämä kristalli on — KRAAK! Täydellinen. Sinulla on erinomainen maku kaviojalalle. Diili on diili. Kuuntele tarkasti.',
      emotion: 'happy',
      condition: { type: 'has_item', itemId: 'shiny_coin' },
      choices: [
        {
          id: 'c_tell_me',
          text: 'Tell me everything!',
          textFi: 'Kerro minulle kaikki!',
          trustDelta: 5,
          next: 'karen_corruption_secret',
        },
      ],
      autoNext: null,
    },

    // ── CORRUPTION SECRET ─────────────────────────────────────────────────────
    karen_corruption_secret: {
      id: 'karen_corruption_secret',
      speaker: 'karen',
      text: 'The darkness — the corruption — it comes from the deep cave in the far north. Inside sleeps Karhu, the old bear. He used to be great, you know. Used to protect this whole forest. But something happened — grief, I think. He lost something dear and it broke him. The darkness poured in. Now it spreads from his dreams.',
      textFi: 'Pimeys — korruptio — tulee syvästä luolasta kaukana pohjoisessa. Sisällä nukkuu Karhu, vanha karhu. Hän oli ennen suuri, tiedätkö. Suojeli ennen koko tätä metsää. Mutta jotain tapahtui — suru, luulen. Hän menetti jotain rakasta ja se rikkoi hänet. Pimeys virtasi sisään. Nyt se leviää hänen unistaan.',
      emotion: 'mysterious',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_how_to_help_karhu',
          text: 'Can we help Karhu? Can we heal him?',
          textFi: 'Voimme me auttaa Karhuta? Voidaanko hänet parantaa?',
          trustDelta: 5,
          next: 'karen_healing_theory',
        },
        {
          id: 'c_need_to_fight',
          text: 'I will have to fight him?',
          textFi: 'Minun täytyy taistella häntä vastaan?',
          trustDelta: 0,
          next: 'karen_fight_warning',
        },
      ],
      autoNext: null,
    },

    karen_healing_theory: {
      id: 'karen_healing_theory',
      speaker: 'karen',
      text: 'Hmm. Interesting question. I like interesting questions. My theory — and I have many theories — is that the corruption has no power over pure things. Clean snow. True friendship. The combined strength of allies who really trust each other. If you could bring all of that together, right into the heart of the cave… maybe. Maybe.',
      textFi: 'Hmm. Mielenkiintoinen kysymys. Pidän mielenkiintoisista kysymyksistä. Teoriani — ja minulla on monta teoriaa — on, että korruptiolla ei ole valtaa puhtaiden asioiden yli. Puhdas lumi. Aito ystävyys. Liittolaisten yhdistetty voima, jotka todella luottavat toisiinsa. Jos voisit tuoda kaiken sen yhteen, suoraan luolan sydämeen… ehkä. Ehkä.',
      emotion: 'wise',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_will_you_help',
          text: 'Will you help me, Karen?',
          textFi: 'Autko minua, Karen?',
          trustDelta: 8,
          next: 'karen_agrees_to_help',
        },
      ],
      autoNext: null,
    },

    karen_fight_warning: {
      id: 'karen_fight_warning',
      speaker: 'karen',
      text: 'Fighting him by yourself? Ha! That is like a sparrow fighting a thunder cloud. You will need everyone — the mushroom, the moss, the white dog, that ridiculous brawler at the mountain. And me, obviously. I am very useful in a fight. I peck things.',
      textFi: 'Taistella häntä vastaan yksin? Ha! Se on kuin varpunen taistelee ukkospilveä vastaan. Tarvitset kaikki — sienen, sammaleen, valkoisen koiran, sen naurettavan tapelijan vuoristolla. Ja minut, tietysti. Olen hyvin hyödyllinen taistelussa. Nokitan asioita.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [
        {
          id: 'c_will_you_come_karen',
          text: 'Will you come with us?',
          textFi: 'Tuletko mukaan kanssamme?',
          trustDelta: 8,
          next: 'karen_agrees_to_help',
        },
      ],
      autoNext: null,
    },

    karen_agrees_to_help: {
      id: 'karen_agrees_to_help',
      speaker: 'karen',
      text: '...Yes. Fine. I will help. Not because I am soft — I am NOT soft — but because if the forest dies, my trees die, and if my trees die, I have nowhere to perch. It is entirely selfish. Completely. Take this feather. It means you can call me when you need eyes in the sky.',
      textFi: '...Kyllä. Selvä. Autan. Ei siksi, että olen pehmeä — en OLE pehmeä — vaan siksi, että jos metsä kuolee, minun puut kuolevat, ja jos minun puut kuolevat, minulla ei ole paikkaa istua. Se on täysin itsekkäästi. Kokonaan. Ota tämä sulka. Se tarkoittaa, että voit kutsua minut kun tarvitset silmiä taivaalla.',
      emotion: 'happy',
      condition: { type: 'always' },
      choices: [],
      autoNext: 'karen_farewell',
      trustDelta: 10,
    },

    // ── FAREWELL ──────────────────────────────────────────────────────────────
    karen_farewell: {
      id: 'karen_farewell',
      speaker: 'karen',
      text: 'Now go. Go go go. I have things to watch, shiny objects to count, and secrets to collect. And stop looking up — you are making me nervous. CAW.',
      textFi: 'Mene nyt. Mene mene mene. Minulla on asioita katsottavana, kiiltäviä esineitä laskettavana ja salaisuuksia kerättävänä. Lopeta ylös katsominen — teet minut hermostuneeksi. KRAAK.',
      emotion: 'playful',
      condition: { type: 'always' },
      choices: [],
      autoNext: null,
    },
  },
}
