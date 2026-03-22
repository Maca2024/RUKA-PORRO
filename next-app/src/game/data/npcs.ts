/**
 * RUKA-PORRO — NPC Definitions
 * All 9 characters in the Finnish Lapland world.
 * Typed against NPCDefinition from game.ts.
 */

import type { NPCDefinition, NPCId } from '../types/game'

export const NPC_DEFINITIONS: Record<NPCId, NPCDefinition> = {
  // ────────────────────────────────────────────────────────────────────────────
  // 1. SIENI — Mystic Mushroom Guide
  // ────────────────────────────────────────────────────────────────────────────
  sieni: {
    id: 'sieni',
    name: 'Sieni the Mushroom',
    nameFi: 'Sieni',
    species: 'Magic Mushroom',
    role: 'Mystic Guide',
    personality: 'wise',
    description:
      'An ancient mushroom spirit who has grown in the Lapland forest for hundreds of years. Sieni speaks in gentle riddles and guides lost wanderers with timeless wisdom.',
    descriptionFi:
      'Muinainen sieniolento, joka on kasvanut Lapin metsässä satoja vuosia. Sieni puhuu lempeissä arvoituksissa ja opastaa eksyviä kulkijoita ikuisella viisaudellaan.',
    noticeRadius: 10,
    fleeThreshold: null,
    wanderSpeed: 0.5,
    trustGainRate: 8,
    initialTrust: 30,
    spawnPoint: { x: 12, y: 0, z: 8 },
    modelType: 'mushroom_entity',
    color: '#C0392B',
    favoriteItems: ['forest_berries', 'morning_dew', 'lichen_flake'],
    fearItems: [],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 2. SAMMAL — Magic Moss Healer
  // ────────────────────────────────────────────────────────────────────────────
  sammal: {
    id: 'sammal',
    name: 'Sammal the Moss',
    nameFi: 'Sammal',
    species: 'Magic Moss',
    role: 'Forest Healer',
    personality: 'gentle',
    description:
      'A soft-spoken healer made entirely of living moss. Sammal absorbs the forest\'s pain and transforms it into warmth. She knows every healing herb in Lapland.',
    descriptionFi:
      'Hiljaisesti puhuva parantaja, joka on kokonaan elävää sammalta. Sammal imee metsän kivun itseensä ja muuttaa sen lämmöksi. Hän tuntee jokaisen Lapin parantavan yrtin.',
    noticeRadius: 8,
    fleeThreshold: null,
    wanderSpeed: 0.3,
    trustGainRate: 10,
    initialTrust: 20,
    spawnPoint: { x: -18, y: 0, z: 24 },
    modelType: 'moss_entity',
    color: '#27AE60',
    favoriteItems: ['clean_water', 'sunlight_shard', 'healing_herb'],
    fearItems: ['corruption_shard', 'dark_smoke'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 3. YUKI — White Akita Guardian
  // ────────────────────────────────────────────────────────────────────────────
  yuki: {
    id: 'yuki',
    name: 'Yuki',
    nameFi: 'Yuki',
    species: 'White Akita Dog',
    role: 'Guardian',
    personality: 'loyal',
    description:
      'A large white Akita who guards the frozen lake with quiet strength. Yuki is deeply loyal once trust is earned, and will stand between danger and a friend without hesitation.',
    descriptionFi:
      'Iso valkoinen Akita, joka vartioi jäätynyttä järveä hiljaisella voimalla. Yuki on syvästi uskollinen, kun luottamus on ansaittu, ja asettuu vaaraan ja ystävän väliin epäröimättä.',
    noticeRadius: 18,
    fleeThreshold: null,
    wanderSpeed: 1.2,
    trustGainRate: 12,
    initialTrust: 0,
    spawnPoint: { x: 45, y: 0, z: -12 },
    modelType: 'dog_akita',
    color: '#F5F5F0',
    favoriteItems: ['dried_fish', 'warm_blanket', 'reindeer_hide'],
    fearItems: ['wolf_howl', 'dark_forest_smell'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 4. TAISTO — Amstaff Warrior
  // ────────────────────────────────────────────────────────────────────────────
  taisto: {
    id: 'taisto',
    name: 'Taisto the Warrior',
    nameFi: 'Taisto',
    species: 'American Staffordshire Terrier',
    role: 'Warrior',
    personality: 'brave',
    description:
      'A stocky, battle-scarred Amstaff who patrols the mountain pass alone. Taisto is all heart — fiercely brave, sometimes reckless, but absolutely reliable in a fight.',
    descriptionFi:
      'Lihaksikas, taisteluarpiset Amstaff, joka partio yksin vuoristosolassa. Taisto on täynnä sydäntä — raivokkaasti rohkea, toisinaan holtitton, mutta täysin luotettava taistelussa.',
    noticeRadius: 20,
    fleeThreshold: null,
    wanderSpeed: 1.5,
    trustGainRate: 7,
    initialTrust: -10,
    spawnPoint: { x: 62, y: 4, z: 55 },
    modelType: 'dog_amstaff',
    color: '#8B6914',
    favoriteItems: ['battle_bone', 'warriors_flag', 'antler_treat'],
    fearItems: ['magic_silence', 'freezing_ice'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 5. KAREN — Trickster Crow
  // ────────────────────────────────────────────────────────────────────────────
  karen: {
    id: 'karen',
    name: 'Karen the Crow',
    nameFi: 'Karen',
    species: 'Crow',
    role: 'Trickster Informant',
    personality: 'mischievous',
    description:
      'A sharp-eyed crow who rules the treetops and collects secrets like shiny objects. Karen will help — for the right price. She is never quite honest, but never entirely lying either.',
    descriptionFi:
      'Terävä­silmäinen varis, joka hallitsee latvuksia ja kerää salaisuuksia kuin kiiltäviä esineitä. Karen auttaa — sopivaan hintaan. Hän ei ole koskaan täysin rehellinen, muttei täysin valehtelekaan.',
    noticeRadius: 25,
    fleeThreshold: -50,
    wanderSpeed: 2.0,
    trustGainRate: 5,
    initialTrust: -20,
    spawnPoint: { x: -5, y: 14, z: -30 },
    modelType: 'crow',
    color: '#1A1A2E',
    favoriteItems: ['shiny_coin', 'silver_trinket', 'glowing_mushroom'],
    fearItems: ['loud_bells', 'bright_torch'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 6. KOULU — Finnish School Sanctuary
  // ────────────────────────────────────────────────────────────────────────────
  koulu: {
    id: 'koulu',
    name: 'Koulu the Old School',
    nameFi: 'Koulu',
    species: 'Sanctuary Building',
    role: 'Sanctuary',
    personality: 'sanctuary',
    description:
      'An old Finnish schoolhouse standing at the center of the world, warm and golden with lamplight. It remembers all who have ever learned within its walls, and opens its doors to those in need.',
    descriptionFi:
      'Vanha suomalainen koulurakennus seisoo maailman keskipisteessä, lämmin ja kultainen lamppuvalossa. Se muistaa kaikki, jotka ovat koskaan oppineet sen seinien sisällä, ja avaa ovensa apua tarvitseville.',
    noticeRadius: 30,
    fleeThreshold: null,
    wanderSpeed: 0,
    trustGainRate: 15,
    initialTrust: 50,
    spawnPoint: { x: 0, y: 0, z: 0 },
    modelType: 'building_school',
    color: '#D4A017',
    favoriteItems: [],
    fearItems: ['corruption_shard', 'dark_fire'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 7. SUSI — Corrupted Wolf (Predator)
  // ────────────────────────────────────────────────────────────────────────────
  susi: {
    id: 'susi',
    name: 'Susi the Wolf',
    nameFi: 'Susi',
    species: 'Wolf',
    role: 'Corrupted Predator',
    personality: 'threatening',
    description:
      'Once the noble guardian of the deep forest, Susi was slowly consumed by Porro\'s corruption. Now territorial and dangerous, a faint echo of his former self still flickers beneath the darkness.',
    descriptionFi:
      'Ennen syvän metsän jalo vartija, Susi nieltiin hitaasti Porron korruption toimesta. Nyt reviiriä puolustava ja vaarallinen, hänen entisestä itsestään vain himmeä kaiku välkkyy pimeyden alla.',
    noticeRadius: 30,
    fleeThreshold: 40,
    wanderSpeed: 1.8,
    trustGainRate: 3,
    initialTrust: -80,
    spawnPoint: { x: -80, y: 1, z: 60 },
    modelType: 'wolf',
    color: '#4A0E8F',
    isCorruptionSource: false,
    favoriteItems: [],
    fearItems: ['fire_torch', 'koulu_bell', 'healers_light'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 8. METSÄSTÄJÄ — Human Hunter Threat
  // ────────────────────────────────────────────────────────────────────────────
  metsastaja: {
    id: 'metsastaja',
    name: 'The Hunter',
    nameFi: 'Metsästäjä',
    species: 'Human',
    role: 'Threat',
    personality: 'cunning',
    description:
      'A patient, skilled hunter who moves through the forest without a sound. He is not evil — only misguided. He does not understand the magic of the forest or the friends you have made.',
    descriptionFi:
      'Kärsivällinen, taitava metsästäjä, joka liikkuu metsässä äänettömästi. Hän ei ole paha — vain harhaan johdettu. Hän ei ymmärrä metsän taikaa tai ystäviäsi.',
    noticeRadius: 22,
    fleeThreshold: null,
    wanderSpeed: 1.3,
    trustGainRate: 1,
    initialTrust: -100,
    spawnPoint: { x: -50, y: 0, z: -80 },
    modelType: 'human_hunter',
    color: '#5D4037',
    favoriteItems: [],
    fearItems: ['koulu_bell', 'animal_alliance_call'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 9. KARHU — Ancient Bear Final Boss
  // ────────────────────────────────────────────────────────────────────────────
  karhu: {
    id: 'karhu',
    name: 'Karhu the Ancient Bear',
    nameFi: 'Karhu',
    species: 'Ancient Bear',
    role: 'Final Boss',
    personality: 'ancient',
    description:
      'The original protector of all Lapland, Karhu fell to Porro\'s corruption centuries ago. His grief at the loss of the forest became a darkness that spread across the land. Defeating him means healing him.',
    descriptionFi:
      'Koko Lapin alkuperäinen suojelija, Karhu antautui Porron korruptiolle vuosisatoja sitten. Hänen surunsa metsän menetyksestä muuttui pimeydeksi, joka levisi kaikkialle. Hänen voittamisensa tarkoittaa hänen parantamistaan.',
    noticeRadius: 40,
    fleeThreshold: null,
    wanderSpeed: 0.8,
    trustGainRate: 0,
    initialTrust: -100,
    spawnPoint: { x: -120, y: -5, z: 120 },
    modelType: 'bear',
    color: '#1B0000',
    isCorruptionSource: true,
    favoriteItems: [],
    fearItems: ['alliance_light', 'poro_call', 'pure_snow'],
  },
}
