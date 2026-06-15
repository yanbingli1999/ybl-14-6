import { useState } from 'react';
import useGameStore from '@/store/useGameStore';
import { CANDY_CONFIG, STATIONS, CLUE_NAMES } from '@/data/config';
import { BASIC_CANDY_TYPES } from '@/types';
import { getCandyLoad } from '@/engine/loadingSystem';
import { MapPin, Flame, Coins, AlertTriangle, HelpCircle, Eye, Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { CandyType, ClueType } from '@/types';

export default function StationOrderPanel() {
  const { currentOrder, train, currentStationId, profile, changeStation, revealClue, makeGuess } = useGameStore();
  const [expandedRiddle, setExpandedRiddle] = useState<number | null>(null);
  const [showGuessMenu, setShowGuessMenu] = useState<number | null>(null);

  if (!currentOrder) return null;

  const station = STATIONS.find(s => s.id === currentStationId);
  const availableStations = STATIONS.filter(
    s => s.reputationRequired <= profile.reputation
  );

  const handleRevealClue = (riddleItemIndex: number, clueType: ClueType) => {
    revealClue(riddleItemIndex, clueType);
  };

  const handleMakeGuess = (riddleItemIndex: number, guessedType: CandyType) => {
    makeGuess(riddleItemIndex, guessedType);
    setShowGuessMenu(null);
  };

  const renderRiddleItem = (item: any, index: number) => {
    const guessedConfig = item.guessedType ? CANDY_CONFIG[item.guessedType] : null;
    const realConfig = CANDY_CONFIG[item.candyType];
    const isExpanded = expandedRiddle === index;
    const revealedClues = item.clues.filter((c: any) => c.revealed).length;
    const remainingAttempts = 3 - item.guessAttempts;
    const isCorrect = item.guessedType === item.candyType;

    const displayType = item.guessedType || null;
    const displayConfig = displayType ? CANDY_CONFIG[displayType] : null;
    const loaded = displayType ? getCandyLoad(train, displayType) : 0;
    const progress = Math.min((loaded / item.quantity) * 100, 100);
    const isComplete = loaded >= item.quantity;

    return (
      <div key={index} className="bg-white/50 rounded-xl p-3 border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            {displayConfig ? (
              <span className="text-2xl">{displayConfig.emoji}</span>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
            )}
            {item.guessedType && (
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-700">
                {displayConfig ? displayConfig.name : '???'}
                {item.guessedType && !isCorrect && (
                  <span className="text-xs text-red-500 ml-2">(猜测中)</span>
                )}
              </span>
              <span className={isComplete ? 'text-green-600 font-bold text-sm' : 'text-gray-500 text-sm'}>
                {loaded}/{item.quantity}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isComplete ? '#6BCB77' : (displayConfig?.color || '#9B59B6'),
                }}
              />
            </div>
          </div>

          <button
            onClick={() => setExpandedRiddle(isExpanded ? null : index)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>已揭开线索: {revealedClues}/4</span>
              <span>剩余猜测次数: {remainingAttempts}/3</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {item.clues.map((clue: any) => (
                <button
                  key={clue.type}
                  onClick={() => !clue.revealed && handleRevealClue(index, clue.type)}
                  disabled={clue.revealed || profile.coins < clue.cost}
                  className={`p-2 rounded-lg text-left text-sm transition-all ${
                    clue.revealed
                      ? 'bg-green-50 border border-green-200'
                      : profile.coins >= clue.cost
                        ? 'bg-purple-50 border border-purple-200 hover:bg-purple-100 cursor-pointer'
                        : 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700">{CLUE_NAMES[clue.type]}</span>
                    {clue.revealed ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-yellow-600 text-xs flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />
                        {clue.cost}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${clue.revealed ? 'text-green-700' : 'text-gray-400'}`}>
                    {clue.revealed ? clue.value : '点击揭开'}
                  </div>
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowGuessMenu(showGuessMenu === index ? null : index)}
                disabled={item.guessAttempts >= 3 || isCorrect}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isCorrect ? '已猜对' : item.guessAttempts >= 3 ? '猜测次数用完' : '猜测糖果类型'}
              </button>

              {showGuessMenu === index && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-10">
                  <div className="grid grid-cols-5 gap-1">
                    {BASIC_CANDY_TYPES.map(type => {
                      const config = CANDY_CONFIG[type];
                      return (
                        <button
                          key={type}
                          onClick={() => handleMakeGuess(index, type)}
                          className="p-2 rounded-lg hover:bg-gray-100 flex flex-col items-center transition-colors"
                        >
                          <span className="text-xl">{config.emoji}</span>
                          <span className="text-xs text-gray-600 mt-1">{config.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNormalItem = (item: any, index: number) => {
    const config = CANDY_CONFIG[item.candyType];
    const loaded = getCandyLoad(train, item.candyType);
    const progress = Math.min((loaded / item.quantity) * 100, 100);
    const isComplete = loaded >= item.quantity;

    return (
      <div key={index} className="flex items-center gap-3">
        <span className="text-xl">{config.emoji}</span>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{config.name}</span>
            <span className={isComplete ? 'text-green-600 font-bold' : 'text-gray-500'}>
              {loaded}/{item.quantity}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: isComplete ? '#6BCB77' : config.color,
              }}
            />
          </div>
        </div>
        {isComplete && <span className="text-green-500">✓</span>}
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl p-4 shadow-lg border-2"
      style={{
        background: `linear-gradient(135deg, ${station?.themeColor}15, ${station?.themeColor}05)`,
        borderColor: station?.themeColor + '40',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5" style={{ color: station?.themeColor }} />
        <h3 className="text-lg font-bold text-gray-800">{station?.name}</h3>
        {currentOrder.isRiddle && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
            <HelpCircle className="w-3 h-3" />
            谜语委托
          </span>
        )}
        {currentOrder.isUrgent && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            <Flame className="w-3 h-3" />
            急单
          </span>
        )}
      </div>

      {currentOrder.isRiddle && (
        <div className="mb-3 p-2 bg-purple-50 rounded-lg text-xs text-purple-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>谜语订单奖励更高！揭开线索或直接猜测，猜对后即可装车</span>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">订单需求</h4>
        <div className="space-y-2">
          {currentOrder.isRiddle
            ? currentOrder.riddleItems.map((item, index) => renderRiddleItem(item, index))
            : currentOrder.items.map((item, index) => renderNormalItem(item, index))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-yellow-600">
          <Coins className="w-4 h-4" />
          <span className="font-bold">
            +{currentOrder.reward}
            {currentOrder.isRiddle && (
              <span className="text-purple-500 ml-1">(谜语加成)</span>
            )}
            {currentOrder.isUrgent && (
              <span className="text-red-500 ml-1">(+{currentOrder.urgentBonus} 加急)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <AlertTriangle className="w-4 h-4" />
          <span>罚金 -{currentOrder.penalty}</span>
        </div>
      </div>

      {availableStations.length > 1 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">切换车站</h4>
          <div className="flex gap-2 flex-wrap">
            {availableStations.map(s => (
              <button
                key={s.id}
                onClick={() => changeStation(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${s.id === currentStationId
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                style={
                  s.id === currentStationId
                    ? { backgroundColor: s.themeColor }
                    : {}
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
