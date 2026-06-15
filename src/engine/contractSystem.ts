import { StationOrder, OrderItem, Station, CandyType, BASIC_CANDY_TYPES, RiddleOrderItem, Clue, ClueType } from '@/types';
import { STATIONS, GAME_CONFIG, CANDY_ATTRIBUTES, FLAVOR_NAMES, COLOR_NAMES, ORIGIN_NAMES, PREFERENCE_NAMES, CLUE_COSTS, CLUE_NAMES } from '@/data/config';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateCluesForCandy(candyType: CandyType): Clue[] {
  const attributes = CANDY_ATTRIBUTES[candyType];
  const clueTypes: ClueType[] = ['flavor', 'color', 'origin', 'preference'];

  return clueTypes.map(type => {
    let value = '';
    switch (type) {
      case 'flavor':
        value = FLAVOR_NAMES[attributes.flavor];
        break;
      case 'color':
        value = COLOR_NAMES[attributes.color];
        break;
      case 'origin':
        value = ORIGIN_NAMES[attributes.origin];
        break;
      case 'preference':
        value = PREFERENCE_NAMES[attributes.preference];
        break;
    }
    return {
      type,
      value,
      revealed: false,
      cost: CLUE_COSTS[type],
    };
  });
}

function generateRiddleItems(selectedTypes: CandyType[], baseQuantity: number): RiddleOrderItem[] {
  return selectedTypes.map(type => ({
    candyType: type,
    quantity: baseQuantity + Math.floor(Math.random() * 5),
    clues: generateCluesForCandy(type),
    guessedType: null,
    guessAttempts: 0,
  }));
}

export function generateOrder(stationId: string, reputation: number): StationOrder {
  const station = STATIONS.find(s => s.id === stationId);
  if (!station) {
    throw new Error(`Station not found: ${stationId}`);
  }

  const difficultyLevel = getDifficultyLevel(stationId, reputation);
  const itemCount = getItemCount(difficultyLevel);
  const baseQuantity = getBaseQuantity(difficultyLevel);

  const availableTypes = shuffle([...BASIC_CANDY_TYPES]);
  const selectedTypes = availableTypes.slice(0, itemCount);

  const isRiddle = Math.random() < GAME_CONFIG.RIDDLE_CHANCE;
  const baseRewardMultiplier = isRiddle ? GAME_CONFIG.RIDDLE_BASE_MULTIPLIER : 1;

  const items: OrderItem[] = selectedTypes.map(type => ({
    candyType: type,
    quantity: baseQuantity + Math.floor(Math.random() * 5),
  }));

  const riddleItems = isRiddle ? generateRiddleItems(selectedTypes, baseQuantity) : [];

  const baseReward = Math.floor(items.reduce((sum, item) => sum + item.quantity * 5, 0) * baseRewardMultiplier);
  const isUrgent = Math.random() < getUrgentChance(difficultyLevel);
  const urgentBonus = isUrgent ? Math.floor(baseReward * GAME_CONFIG.URGENT_BONUS_RATE) : 0;

  const order: StationOrder = {
    id: generateId(),
    stationId,
    stationName: station.name,
    items,
    reward: baseReward,
    penalty: Math.floor(baseReward * GAME_CONFIG.MISMATCH_PENALTY_RATE) * itemCount,
    isUrgent,
    urgentBonus,
    isRiddle,
    riddleItems,
    baseRewardMultiplier,
  };

  return order;
}

function getDifficultyLevel(stationId: string, reputation: number): number {
  const stationIndex = STATIONS.findIndex(s => s.id === stationId);
  const baseLevel = stationIndex + 1;

  const repBonus = Math.floor(reputation / 200);

  return Math.min(baseLevel + repBonus, 5);
}

function getItemCount(difficultyLevel: number): number {
  switch (difficultyLevel) {
    case 1: return 2;
    case 2: return 2;
    case 3: return 3;
    case 4: return 3;
    case 5: return 4;
    default: return 2;
  }
}

function getBaseQuantity(difficultyLevel: number): number {
  switch (difficultyLevel) {
    case 1: return 5;
    case 2: return 8;
    case 3: return 10;
    case 4: return 12;
    case 5: return 15;
    default: return 5;
  }
}

function getUrgentChance(difficultyLevel: number): number {
  switch (difficultyLevel) {
    case 1: return 0.1;
    case 2: return 0.2;
    case 3: return 0.35;
    case 4: return 0.4;
    case 5: return 0.5;
    default: return 0.2;
  }
}

export function getAvailableStations(reputation: number): Station[] {
  return STATIONS.filter(s => s.reputationRequired <= reputation);
}

export function getNextStation(reputation: number): Station | null {
  const locked = STATIONS.filter(s => s.reputationRequired > reputation);
  if (locked.length === 0) return null;
  return locked[0];
}

export function getStationProgress(reputation: number): { current: Station | null; next: Station | null; progress: number } {
  const available = getAvailableStations(reputation);
  const current = available.length > 0 ? available[available.length - 1] : null;
  const next = getNextStation(reputation);

  let progress = 0;
  if (current && next) {
    const range = next.reputationRequired - current.reputationRequired;
    const earned = reputation - current.reputationRequired;
    progress = range > 0 ? (earned / range) * 100 : 100;
  } else if (next) {
    progress = (reputation / next.reputationRequired) * 100;
  } else {
    progress = 100;
  }

  return { current, next, progress: Math.min(progress, 100) };
}

export function revealClue(
  order: StationOrder,
  riddleItemIndex: number,
  clueType: ClueType,
  playerCoins: number
): { updatedOrder: StationOrder; cost: number; success: boolean; message: string } {
  if (!order.isRiddle || !order.riddleItems[riddleItemIndex]) {
    return { updatedOrder: order, cost: 0, success: false, message: '无效的谜语订单' };
  }

  const riddleItem = order.riddleItems[riddleItemIndex];
  const clue = riddleItem.clues.find(c => c.type === clueType);

  if (!clue) {
    return { updatedOrder: order, cost: 0, success: false, message: '线索不存在' };
  }

  if (clue.revealed) {
    return { updatedOrder: order, cost: 0, success: false, message: '该线索已揭开' };
  }

  if (playerCoins < clue.cost) {
    return { updatedOrder: order, cost: 0, success: false, message: '金币不足' };
  }

  const newRiddleItems = [...order.riddleItems];
  newRiddleItems[riddleItemIndex] = {
    ...riddleItem,
    clues: riddleItem.clues.map(c =>
      c.type === clueType ? { ...c, revealed: true } : c
    ),
  };

  return {
    updatedOrder: { ...order, riddleItems: newRiddleItems },
    cost: clue.cost,
    success: true,
    message: `成功揭开${CLUE_NAMES[clueType]}线索：${clue.value}`,
  };
}

export function makeGuess(
  order: StationOrder,
  riddleItemIndex: number,
  guessedType: CandyType
): { updatedOrder: StationOrder; isCorrect: boolean; message: string } {
  if (!order.isRiddle || !order.riddleItems[riddleItemIndex]) {
    return { updatedOrder: order, isCorrect: false, message: '无效的谜语订单' };
  }

  const riddleItem = order.riddleItems[riddleItemIndex];

  if (riddleItem.guessAttempts >= GAME_CONFIG.RIDDLE_MAX_GUESS_ATTEMPTS) {
    return { updatedOrder: order, isCorrect: false, message: '猜测次数已用完' };
  }

  if (riddleItem.guessedType === guessedType) {
    return { updatedOrder: order, isCorrect: false, message: '不能重复猜测相同类型' };
  }

  const isCorrect = riddleItem.candyType === guessedType;

  const newRiddleItems = [...order.riddleItems];
  newRiddleItems[riddleItemIndex] = {
    ...riddleItem,
    guessedType,
    guessAttempts: riddleItem.guessAttempts + 1,
  };

  return {
    updatedOrder: { ...order, riddleItems: newRiddleItems },
    isCorrect,
    message: isCorrect ? '猜测正确！' : '猜测错误，再试试吧',
  };
}

export function getEffectiveOrderItems(order: StationOrder): OrderItem[] {
  if (!order.isRiddle) return order.items;

  return order.riddleItems.map(item => ({
    candyType: item.guessedType || item.candyType,
    quantity: item.quantity,
  }));
}
