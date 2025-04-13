export function MatchPercentageIndicator({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 75) return 'text-green-500';
    if (value >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`text-xs font-bold bg-slate-200 py-1 px-2 rounded-full ${getColor()}`}>
      {value.toFixed(0)}% Match
    </div>
  );
}
