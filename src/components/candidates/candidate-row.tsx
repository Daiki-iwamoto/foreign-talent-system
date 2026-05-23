"use client";

import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { InlineStatusChanger } from "@/components/candidates/inline-status-changer";
import { InlineCompanyChanger } from "@/components/candidates/inline-company-changer";
import type { CandidateStatus } from "@/lib/status";

type Props = {
  id: string;
  full_name: string;
  nationality: string | null;
  industry: string | null;
  company_name: string | null;
  current_status: CandidateStatus;
};

export function CandidateRow({
  id,
  full_name,
  nationality,
  industry,
  company_name,
  current_status,
}: Props) {
  const router = useRouter();
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/candidates/${id}`)}
    >
      <TableCell className="font-medium whitespace-nowrap truncate" title={full_name}>
        {full_name}
      </TableCell>
      <TableCell className="whitespace-nowrap truncate" title={nationality ?? ""}>
        {nationality ?? "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap truncate" title={industry ?? ""}>
        {industry ?? "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <InlineCompanyChanger candidateId={id} initialValue={company_name} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <InlineStatusChanger candidateId={id} currentStatus={current_status} />
      </TableCell>
    </TableRow>
  );
}
