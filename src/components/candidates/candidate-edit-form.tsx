"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CandidateFormFields } from "@/components/candidates/candidate-form";
import { candidateFormSchema, type CandidateFormValues } from "@/lib/schemas";
import type { Candidate } from "@/types/database";

export function CandidateEditForm({ candidate }: { candidate: Candidate }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      full_name: candidate.full_name,
      nationality: candidate.nationality ?? "",
      date_of_birth: candidate.date_of_birth ?? "",
      gender: candidate.gender ?? "",
      email: candidate.email ?? "",
      phone: candidate.phone ?? "",
      industry: candidate.industry ?? "",
      company_name: candidate.company_name ?? "",
      job_title: candidate.job_title ?? "",
      work_history: candidate.work_history ?? "",
      education: candidate.education ?? "",
      memo: candidate.memo ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "保存に失敗しました");
      toast.success("保存しました");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存に失敗しました";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <CandidateFormFields form={form} idPrefix={`edit-${candidate.id}-`} />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          保存
        </Button>
      </div>
    </form>
  );
}
