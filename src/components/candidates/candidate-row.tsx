"use client";

import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { InlineStatusChanger } from "@/components/candidates/inline-status-changer";
import type { CandidateStatus } from "@/lib/status";

type Props = {
  id: string;
  full_name: string;
  nationality: string | null;
  industry: string | null;
  current_status: CandidateStatus;
};

export function CandidateRow({ id, full_name, nationality, industry, current_status }: Props) {
  const router = useRouter();
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/candidates/${id}`)}
    >
      <TableCell className="font-medium">{full_name}</TableCell>
      <TableCell>{nationality ?? "—"}</TableCell>
      <TableCell>{industry ?? "—"}</TableCell>
      <TableCell>
        <InlineStatusChanger candidateId={id} currentStatus={current_status} />
      </TableCell>
    </TableRow>
  );
}
