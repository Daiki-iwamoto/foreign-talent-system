"use client";

import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CandidateFormValues } from "@/lib/schemas";

export function CandidateFormFields({
  form,
  idPrefix = "",
}: {
  form: UseFormReturn<CandidateFormValues>;
  idPrefix?: string;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  const id = (k: string) => `${idPrefix}${k}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="氏名 *" error={errors.full_name?.message}>
        <Input id={id("full_name")} {...register("full_name")} />
      </Field>
      <Field label="国籍" error={errors.nationality?.message}>
        <Input id={id("nationality")} {...register("nationality")} />
      </Field>
      <Field label="生年月日 (YYYY-MM-DD)" error={errors.date_of_birth?.message}>
        <Input id={id("date_of_birth")} placeholder="1990-01-01" {...register("date_of_birth")} />
      </Field>
      <Field label="性別" error={errors.gender?.message}>
        <Input id={id("gender")} {...register("gender")} />
      </Field>
      <Field label="メールアドレス" error={errors.email?.message}>
        <Input id={id("email")} type="email" {...register("email")} />
      </Field>
      <Field label="電話番号" error={errors.phone?.message}>
        <Input id={id("phone")} {...register("phone")} />
      </Field>
      <Field label="業界" error={errors.industry?.message}>
        <Input id={id("industry")} {...register("industry")} />
      </Field>
      <Field label="企業名" error={errors.company_name?.message}>
        <Input id={id("company_name")} {...register("company_name")} />
      </Field>
      <Field label="職種" error={errors.job_title?.message}>
        <Input id={id("job_title")} {...register("job_title")} />
      </Field>
      <Field label="職歴サマリー" error={errors.work_history?.message} fullWidth>
        <Textarea id={id("work_history")} rows={4} {...register("work_history")} />
      </Field>
      <Field label="学歴サマリー" error={errors.education?.message} fullWidth>
        <Textarea id={id("education")} rows={3} {...register("education")} />
      </Field>
      <Field label="社内メモ" error={errors.memo?.message} fullWidth>
        <Textarea id={id("memo")} rows={3} {...register("memo")} />
      </Field>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  fullWidth,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
