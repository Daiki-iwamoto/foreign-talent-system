export const CANDIDATE_STATUSES = [
  "searching",
  "interview_scheduling",
  "interviewed",
  "offered",
  "hired",
  "working",
  "resigned",
  "unreachable",
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export const STATUS_META: Record<
  CandidateStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  searching: {
    label: "求職中",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  },
  interview_scheduling: {
    label: "面接調整中",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dotClass: "bg-indigo-500",
  },
  interviewed: {
    label: "面接済",
    badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
    dotClass: "bg-cyan-500",
  },
  offered: {
    label: "内定",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  hired: {
    label: "入社決定",
    badgeClass: "bg-lime-100 text-lime-800 border-lime-200",
    dotClass: "bg-lime-500",
  },
  working: {
    label: "就業中",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  resigned: {
    label: "退職",
    badgeClass: "bg-gray-200 text-gray-700 border-gray-300",
    dotClass: "bg-gray-500",
  },
  unreachable: {
    label: "連絡不通",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    dotClass: "bg-red-500",
  },
};

export function getStatusLabel(status: CandidateStatus): string {
  return STATUS_META[status].label;
}
