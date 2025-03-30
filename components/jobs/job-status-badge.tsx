import { JobStatus } from "@prisma/client";
import clsx from "clsx";
import { getJobStatusLabel, JOB_STATUS_CONFIG } from "./utils";

const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  violet: "bg-violet-100 text-violet-700 border-violet-300",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-300",
  amber: "bg-amber-100 text-amber-700 border-amber-300",
  rose: "bg-rose-100 text-rose-700 border-rose-300",
  slate: "bg-slate-100 text-slate-700 border-slate-300",
  zinc: "bg-zinc-100 text-zinc-700 border-zinc-300",
  stone: "bg-stone-100 text-stone-700 border-stone-300",
};

export function JobStatusIndicator({ status }: { status: JobStatus | null }) {
  if (!status) return null;

  const config = JOB_STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium`,
        colorClasses[config.color]
      )}
    >
      <Icon className="me-1" size={14} />
      {getJobStatusLabel(status)}
    </span>
  );
}
