import { Variation } from "@/types/resume";
import { useResumeBuilder } from "../context/useResumeBuilder";
import { MatchPercentageIndicator } from "../match-percentage-indicator";

export const VariationMatchingScores = ({
  variation,
}: {
  variation: Variation;
}) => {
  const { resumeAnalyzeResults } = useResumeBuilder();
  const score = resumeAnalyzeResults?.itemsScore?.[variation.id];
  if (!score) return null;

  return (
    <>
      <div className="flex flex-wrap gap-1 mt-2">
        <MatchPercentageIndicator value={(score?.score || 0) * 100} />
        {score?.matched_keywords?.map((k) => (
          <span
            key={k}
            className="rounded-full px-2 py-1 bg-slate-200 font-bold text-xs"
          >
            {k}
          </span>
        ))}
      </div>
    </>
  );
};
