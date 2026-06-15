import { Train, StationOrder, DispatchResult, OrderItem, CandyType, RiddleResult } from '@/types';
import { GAME_CONFIG, CANDY_CONFIG } from '@/data/config';
import { getCandyLoad } from './loadingSystem';
import { getRealOrderItems, getDisplayOrderItems } from './contractSystem';

function calculateRiddleResults(order: StationOrder): {
  riddleResults: RiddleResult[];
  clueCosts: number;
  perfectGuessBonus: number;
  totalRewardMultiplier: number;
  wrongGuessPenalty: number;
} {
  const riddleResults: RiddleResult[] = [];
  let clueCosts = 0;
  let perfectGuessBonus = 0;
  let totalRewardMultiplier = 1;
  let wrongGuessPenalty = 0;

  if (!order.isRiddle) {
    return { riddleResults, clueCosts, perfectGuessBonus, totalRewardMultiplier, wrongGuessPenalty };
  }

  for (const item of order.riddleItems) {
    const revealedClues = item.clues.filter(c => c.revealed).length;
    clueCosts += item.clues.filter(c => c.revealed).reduce((sum, c) => sum + c.cost, 0);

    const isCorrect = item.guessedType === item.candyType;
    const wrongGuesses = item.guessedType ? item.guessAttempts - (isCorrect ? 1 : 0) : item.guessAttempts;

    let rewardBonus = 0;
    let guessPenalty = 0;

    if (item.guessAttempts > 0) {
      if (isCorrect) {
        if (revealedClues === 0 && item.guessAttempts === 1) {
          perfectGuessBonus += GAME_CONFIG.RIDDLE_PERFECT_GUESS_BONUS;
        }

        const noClueBonus = Math.max(0, 4 - revealedClues) * GAME_CONFIG.RIDDLE_NO_CLUE_BONUS * 0.1;
        rewardBonus = noClueBonus;
        totalRewardMultiplier += noClueBonus;
      } else {
        guessPenalty = wrongGuesses * GAME_CONFIG.RIDDLE_WRONG_GUESS_PENALTY;
        wrongGuessPenalty += wrongGuesses * GAME_CONFIG.RIDDLE_WRONG_GUESS_PENALTY * 100;
        totalRewardMultiplier = Math.max(0.3, totalRewardMultiplier - guessPenalty);
      }
    }

    riddleResults.push({
      candyType: item.candyType,
      guessedType: item.guessedType,
      isCorrect,
      cluesRevealed: revealedClues,
      guessAttempts: item.guessAttempts,
      rewardBonus,
      guessPenalty,
    });
  }

  return { riddleResults, clueCosts, perfectGuessBonus, totalRewardMultiplier, wrongGuessPenalty };
}

export function calculateDispatchResult(
  train: Train,
  order: StationOrder
): DispatchResult {
  const realItems = getRealOrderItems(order);
  const correctItems: OrderItem[] = [];
  const mismatches: OrderItem[] = [];
  let matchPoints = 0;
  let totalRequired = 0;

  for (const item of realItems) {
    const loaded = getCandyLoad(train, item.candyType);
    totalRequired += item.quantity;

    if (loaded >= item.quantity) {
      correctItems.push({ ...item });
      matchPoints += item.quantity;
    } else if (loaded > 0) {
      correctItems.push({ candyType: item.candyType, quantity: loaded });
      mismatches.push({ candyType: item.candyType, quantity: item.quantity - loaded });
      matchPoints += loaded;
    } else {
      mismatches.push({ ...item });
    }
  }

  if (order.isRiddle) {
    for (const riddleItem of order.riddleItems) {
      if (riddleItem.guessedType && riddleItem.guessedType !== riddleItem.candyType) {
        const guessedLoad = getCandyLoad(train, riddleItem.guessedType);
        if (guessedLoad > 0) {
          const alreadyCounted = mismatches.find(m => m.candyType === riddleItem.guessedType);
          if (!alreadyCounted) {
            mismatches.push({ candyType: riddleItem.guessedType, quantity: guessedLoad });
          }
        }
      }
    }
  }

  for (const carriage of train.carriages) {
    const inOrder = realItems.find(i => i.candyType === carriage.candyType);
    if (!inOrder && carriage.currentLoad > 0) {
      const alreadyCounted = mismatches.find(m => m.candyType === carriage.candyType);
      if (!alreadyCounted) {
        mismatches.push({ candyType: carriage.candyType, quantity: carriage.currentLoad });
      }
    }
  }

  const matchRate = totalRequired > 0 ? matchPoints / totalRequired : 0;
  const success = matchRate >= 0.8;

  const { riddleResults, clueCosts, perfectGuessBonus, totalRewardMultiplier, wrongGuessPenalty } = calculateRiddleResults(order);

  let reward = 0;
  if (success) {
    reward = Math.floor(order.reward * totalRewardMultiplier);
    if (order.isUrgent) {
      reward += Math.floor(order.reward * GAME_CONFIG.URGENT_BONUS_RATE);
    }
    reward += perfectGuessBonus;
  }

  let penalty = 0;
  if (mismatches.length > 0) {
    penalty = Math.floor(order.reward * GAME_CONFIG.MISMATCH_PENALTY_RATE) * mismatches.length;
    penalty = Math.min(penalty, order.penalty);
  }

  penalty += wrongGuessPenalty;
  penalty = Math.min(penalty, order.reward);

  const reputationChange = success
    ? GAME_CONFIG.REPUTATION_PER_SUCCESS + (order.isRiddle ? 5 : 0)
    : GAME_CONFIG.REPUTATION_PER_FAIL;

  return {
    success,
    matchRate,
    reward,
    penalty,
    mismatches,
    correctItems,
    reputationChange,
    isRiddle: order.isRiddle,
    riddleResults,
    clueCosts,
    perfectGuessBonus,
  };
}

export function canDispatch(train: Train): boolean {
  const totalLoad = train.carriages.reduce((sum, c) => sum + c.currentLoad, 0);
  return totalLoad > 0;
}

export function getMatchColor(matchRate: number): string {
  if (matchRate >= 0.9) return '#6BCB77';
  if (matchRate >= 0.7) return '#FFD93D';
  if (matchRate >= 0.5) return '#FF9F43';
  return '#FF4757';
}
