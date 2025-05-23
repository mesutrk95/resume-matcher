import { Variation } from '@/types/resume';
import { useResumeBuilder } from '../context/useResumeBuilder';
import { MatchPercentageIndicator } from '../match-percentage-indicator';
import { useMemo } from 'react';
import { hashString } from '@/lib/utils';
import { RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const VariationMatchingScores = ({
  variation,
  className,
}: {
  className?: string;
  variation: Variation;
}) => {
  const { resumeAnalyzeResults } = useResumeBuilder();
  const score = resumeAnalyzeResults?.itemsScore?.[variation.id];

  const contentHash = useMemo(() => {
    return variation.content && hashString(variation.content, 8);
  }, [variation.content]);

  if (!score) return null;
  const isInvalid = contentHash !== score.hash;
  return (
    <>
      <div className={'flex flex-wrap gap-1 mt-2 ' + className}>
        {/* {contentHash !== score.hash && <>Refresh the Score</>} */}
        {isInvalid ? (
          <>
            <Badge className="flex gap-2 cursor-pointer">
              <RefreshCcw size={14} strokeWidth={2.5} />
              Re-evaluate Score
            </Badge>
          </>
        ) : (
          <>
            <MatchPercentageIndicator value={(score?.score || 0) * 100} />
            {score?.matched_keywords?.map(k => (
              <span
                key={k}
                className={`rounded-full px-2 py-1 bg-slate-200 font-bold text-xs ${isInvalid && 'line-through'}`}
              >
                {k}
              </span>
            ))}
          </>
        )}
      </div>
    </>
  );
};
