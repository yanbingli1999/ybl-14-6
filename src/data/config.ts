import { CandyType, Station, Train, BOARD_SIZE, CandyAttributes, FlavorType, ColorType, OriginType, PreferenceType, ClueType } from '@/types';

export const CANDY_CONFIG: Record<CandyType, { name: string; color: string; points: number; emoji: string }> = {
  strawberry: { name: '草莓糖', color: '#FF6B9D', points: 10, emoji: '🍓' },
  lemon: { name: '柠檬糖', color: '#FFD93D', points: 10, emoji: '🍋' },
  mint: { name: '薄荷糖', color: '#6BCB77', points: 10, emoji: '🍀' },
  blueberry: { name: '蓝莓糖', color: '#4D96FF', points: 10, emoji: '🫐' },
  grape: { name: '葡萄糖', color: '#9B59B6', points: 10, emoji: '🍇' },
  rainbow: { name: '彩虹糖', color: 'linear-gradient(135deg, #FF6B9D, #FFD93D, #6BCB77, #4D96FF, #9B59B6)', points: 50, emoji: '🌈' },
  bomb: { name: '炸弹糖', color: '#FF4757', points: 30, emoji: '💣' },
};

export const CANDY_ATTRIBUTES: Record<CandyType, CandyAttributes> = {
  strawberry: { flavor: 'sweet', color: 'red', origin: 'candy-town', preference: 'festival' },
  lemon: { flavor: 'sour', color: 'yellow', origin: 'lemon-estate', preference: 'daily' },
  mint: { flavor: 'fresh', color: 'green', origin: 'mint-forest', preference: 'common' },
  blueberry: { flavor: 'fruity', color: 'blue', origin: 'blueberry-port', preference: 'luxury' },
  grape: { flavor: 'rich', color: 'purple', origin: 'grape-castle', preference: 'royal' },
  rainbow: { flavor: 'sweet', color: 'purple', origin: 'candy-town', preference: 'festival' },
  bomb: { flavor: 'rich', color: 'red', origin: 'grape-castle', preference: 'royal' },
};

export const FLAVOR_NAMES: Record<FlavorType, string> = {
  sweet: '香甜',
  sour: '酸爽',
  fresh: '清新',
  fruity: '果香',
  rich: '浓郁',
};

export const COLOR_NAMES: Record<ColorType, string> = {
  red: '红色',
  yellow: '黄色',
  green: '绿色',
  blue: '蓝色',
  purple: '紫色',
};

export const ORIGIN_NAMES: Record<OriginType, string> = {
  'candy-town': '糖果小镇',
  'lemon-estate': '柠檬庄园',
  'mint-forest': '薄荷森林',
  'blueberry-port': '蓝莓港口',
  'grape-castle': '葡萄城堡',
};

export const PREFERENCE_NAMES: Record<PreferenceType, string> = {
  royal: '皇家专供',
  common: '平民喜爱',
  luxury: '奢华享受',
  daily: '日常必备',
  festival: '节日庆典',
};

export const CLUE_NAMES: Record<ClueType, string> = {
  flavor: '口味',
  color: '颜色',
  origin: '产地',
  preference: '贵宾偏好',
};

export const CLUE_COSTS: Record<ClueType, number> = {
  flavor: 10,
  color: 15,
  origin: 20,
  preference: 25,
};

export const STATIONS: Station[] = [
  {
    id: 'candy-town',
    name: '糖果小镇',
    reputationRequired: 0,
    themeColor: '#FF6B9D',
    description: '甜蜜的起点，适合新手列车长',
  },
  {
    id: 'lemon-estate',
    name: '柠檬庄园',
    reputationRequired: 100,
    themeColor: '#FFD93D',
    description: '酸爽的柠檬订单，需要更多技巧',
  },
  {
    id: 'mint-forest',
    name: '薄荷森林',
    reputationRequired: 300,
    themeColor: '#6BCB77',
    description: '急单频发的森林车站',
  },
  {
    id: 'blueberry-port',
    name: '蓝莓港口',
    reputationRequired: 600,
    themeColor: '#4D96FF',
    description: '大额订单的港口贸易站',
  },
  {
    id: 'grape-castle',
    name: '葡萄城堡',
    reputationRequired: 1000,
    themeColor: '#9B59B6',
    description: '皇家级别的复杂订单',
  },
];

export const INITIAL_TRAIN: Train = {
  id: 'candy-express',
  name: '糖果快车',
  carriages: [
    { id: 'car-1', candyType: 'strawberry', capacity: 20, currentLoad: 0 },
    { id: 'car-2', candyType: 'lemon', capacity: 20, currentLoad: 0 },
    { id: 'car-3', candyType: 'mint', capacity: 20, currentLoad: 0 },
    { id: 'car-4', candyType: 'blueberry', capacity: 20, currentLoad: 0 },
    { id: 'car-5', candyType: 'grape', capacity: 20, currentLoad: 0 },
  ],
};

export const GAME_CONFIG = {
  BOARD_SIZE,
  INITIAL_MOVES: 30,
  COMBO_BONUS_MULTIPLIER: 0.5,
  MATCH_MIN: 3,
  FOUR_MATCH_SPECIAL: 'bomb' as const,
  FIVE_MATCH_SPECIAL: 'rainbow' as const,
  DISPATCH_BASE_REWARD: 50,
  MISMATCH_PENALTY_RATE: 0.3,
  URGENT_BONUS_RATE: 0.5,
  REPUTATION_PER_SUCCESS: 10,
  REPUTATION_PER_FAIL: -5,
  LOAD_PER_MATCH: 1,
  RIDDLE_CHANCE: 0.3,
  RIDDLE_BASE_MULTIPLIER: 1.5,
  RIDDLE_NO_CLUE_BONUS: 0.5,
  RIDDLE_WRONG_GUESS_PENALTY: 0.2,
  RIDDLE_PERFECT_GUESS_BONUS: 30,
  RIDDLE_MAX_GUESS_ATTEMPTS: 3,
};
