import { capitalizeText } from "@/lib/utils";
import { JobStatus } from "@prisma/client";
import {
  Edit,
  Bookmark,
  CheckCircle,
  CalendarClock,
  XCircle,
  MessageSquareOff,
  Lock,
  Archive,
} from "lucide-react";

export function getJobStatusLabel(s: JobStatus) {
  return capitalizeText(s.replaceAll("_", " "));
}

export const JOB_STATUS_CONFIG = {
  [JobStatus.BOOKMARKED]: {
    color: "blue",
    icon: Bookmark,
    label: "Bookmarked",
  },
  [JobStatus.APPLYING]: {
    color: "violet",
    icon: Edit,
    label: "Applying",
  },
  [JobStatus.APPLIED]: {
    color: "emerald",
    icon: CheckCircle,
    label: "Applied",
  },
  [JobStatus.INTERVIEWING]: {
    color: "amber",
    icon: CalendarClock,
    label: "Interviewing",
  },
  [JobStatus.REJECTED]: {
    color: "rose",
    icon: XCircle,
    label: "Rejected",
  },
  [JobStatus.NO_ANSWER]: {
    color: "slate",
    icon: MessageSquareOff,
    label: "No Answer",
  },
  [JobStatus.CLOSED]: {
    color: "zinc",
    icon: Lock,
    label: "Closed",
  },
  [JobStatus.ARCHIVED]: {
    color: "stone",
    icon: Archive,
    label: "Archived",
  },
};
