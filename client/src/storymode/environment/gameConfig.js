const City_TMJ = new URL('../assets/maps/bar_district.tmj', import.meta.url).href;
const Neighborhood_TMJ = new URL('../assets/maps/neighborhood.tmj', import.meta.url).href;
const Bar_TMJ = new URL('../assets/maps/bar.tmj', import.meta.url).href;
const JimDonnasHouse_TMJ = new URL('../assets/maps/jim_donnas_House.tmj', import.meta.url).href;
const JohnsHouse_TMJ = new URL('../assets/maps/johns_house.tmj', import.meta.url).href;
const Office_TMJ = new URL('../assets/maps/office.tmj', import.meta.url).href;
const PD_TMJ = new URL('../assets/maps/pd.tmj', import.meta.url).href;
const Shop_TMJ = new URL('../assets/maps/flower_shop.tmj', import.meta.url).href;
const PLAYER_PNG = new URL('../assets/sprites/npcs/player/sheet.png', import.meta.url).href;


export const GAME = {
  flags: new Set(),
  clues: new Set(),
  claims: {},
  metadata: new Map()
};
export const MAPS = {
  office: {
    path: Office_TMJ,
    start: { x: 20, y: 5 },
    npcs: [
    ],
    exits: [
      { x: 0, y: 10, to: "pd", toStart: { x: 18, y: 4 } },
    ],
  },
  pd: {
    path: PD_TMJ,
    start: { x: 3, y: 11 },
    npcs: [{ id: "lucas", x: 24, y: 5, gid: 1105, dialogueId: "lucas", spriteId: "lucas", direction: "right" },
    { id: "bobby", x: 10, y: 10, gid: 1105, dialogueId: "bobbyMarcus", direction: "up" },
    { id: "jack", x: 37, y: 12, gid: 1105, dialogueId: "jackAlex" },
    { id: "alex", x: 36, y: 12, gid: 1105, dialogueId: "jackAlex" },
    { id: "maya", x: 33, y: 4, gid: 1105, },
    { id: "ace", x: 38, y: 4, gid: 1105, dialogueId: "ace" }
    ],
    bgm: "pd",
  },
  bar: {
    path: Bar_TMJ,
    start: { x: 13, y: 23 },
    npcs: [{ id: "jane", x: 22, y: 6, gid: 3428, dialogueId: "jane", direction: "up" },
    { id: "bartender", gid: 106 },
    { id: "marcus", gid: 106 },
    { id: "gambler", x: 1, y: 20, gid: 3586, dialogueId: "gambler", direction: "right" },
    { id: "maya", x: 26, y: 22, gid: 3586, dialogueId: "mayaBar" },
    ],
    bgm: "bar",
    exits: [
      { x: 13, y: 28, to: "city", toStart: { x: 26, y: 20 } },
    ],
  },
  shop: {
    path: Shop_TMJ,
    start: { x: 16, y: 17 },
    npcs: [
      { id: "florist", x: 1, y: 5, gid: 106, dialogueId: "florist" },
      { id: "angry_patron", name: "Angry Patron", x: 12, y: 6, gid: 106, dialogueId: "angry_patron", direction: "up" },
    ],
    exits: [
      { x: 16, y: 17, to: "city", toStart: { x: 34, y: 25 } },
    ],
    bgm: "shop",
  },
  city: {
    path: City_TMJ,
    start: { x: 4, y: 26 },
    autoStartRequires: { flagsAny: ["poem_passed", "BobbyDirty", "BobbyGood"] },
    autoStartDialogue: true,
    npcs: [
      { id: "lucasCity", x: 39, y: 8, gid: 106, dialogueId: "lucasCity", spriteId: "lucas" },
      { id: "frank", x: 1, y: 14, gid: 106, dialogueId: "frank", direction: "right"},
      { id: "bobbyCity", x: 10, y: 25, gid: 106, dialogueId: "bobby", spriteId: "bobby", direction: "right" },
      { id: "delivery_girl", x: 12, y: 25, gid: 106, dialogueId: "bobby", direction: "left" },
      { id: "marcus", gid: 106, dialogueId: "marcus" },
      { id: "maya", gid: 106, dialogueId: "maya" },
      { id: "flower_promoter", x: 40, y: 25, gid: 106, dialogueId: "flower_promoter" },
    ],
    exits: [
      { x: 39, y: 20, to: "bar", toStart: { x: 13, y: 23 } },
      { x: 43, y: 25, to: "shop", toStart: { x: 16, y: 16 } },
      { x: 0, y: 27, to: "neighborhood", toStart: { x: 33, y: 6 } },
    ],
    bgm: "city",
  },
  neighborhood: {
    path: Neighborhood_TMJ,
    start: { x: 5, y: 70 },
    npcs: [
      { id: "hayes", x: 43, y: 67, gid: 437, dialogueId: "hayes", direction: "right" },
      { id: "sneak", x: 4, y: 70, gid: 437, dialogueId: "sneak" },
      { id: "tim", x: 34, y: 41, gid: 451, dialogueId: "tim" },
      { id: "sam", x: 21, y: 28, gid: 438, dialogueId: "sam" },
    ],
    exits: [
      { x: 9, y: 39, to: "jimDonnasHouse", toStart: { x: 6, y: 21 } },
      { x: 7, y: 25, to: "johnsHouse", toStart: { x: 1, y: 20 } },
      { x: 33, y: 0, to: "city", toStart: { x: 4, y: 26 } },
    ],
    bgm: "neighborhood",
  },
  jimDonnasHouse: {
    path: JimDonnasHouse_TMJ,
    start: { x: 6, y: 21 },
    npcs: [{ id: "jim", x: 8, y: 6, gid: 424, dialogueId: "jimDonna" },
    { id: "donna", x: 9, y: 6, gid: 439, dialogueId: "jimDonna" }
    ],
    exits: [
      { x: 6, y: 21, to: "neighborhood", toStart: { x: 14, y: 39 } },
    ],
    bgm: "neighborhood",
  },
  johnsHouse: {
    path: JohnsHouse_TMJ,
    start: { x: 1, y: 20 },
    npcs: [{ id: "john", x: 7, y: 17, gid: 1605, dialogueId: "john" },],
    exits: [
      { x: 1, y: 20, to: "neighborhood", toStart: { x: 15, y: 24 } },
    ],
    bgm: "neighborhood",
  },
};

export const SPRITE = {
  fw: 16,
  fh: 32,
  idleCols: 1,
  walkCols: 4,
  rows: {
    down: 0,
    side: 1,
    up: 2,
  },

  msPerFrame: { idle: 250, walk: 110 },
  src: PLAYER_PNG,
};

