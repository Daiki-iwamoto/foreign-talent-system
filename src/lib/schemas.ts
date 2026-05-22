import { z } from "zod";
import { CANDIDATE_STATUSES } from "./status";

export const candidateStatusSchema = z.enum(CANDIDATE_STATUSES);

const optionalNullableString = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

const optionalNullableDate = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null))
  .refine(
    (v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v),
    "日付は YYYY-MM-DD 形式で入力してください"
  );

export const candidateFormSchema = z.object({
  full_name: z
    .string()
    .min(1, "氏名は必須です")
    .max(200, "氏名は200文字以内で入力してください"),
  nationality: optionalNullableString,
  date_of_birth: optionalNullableDate,
  gender: optionalNullableString,
  email: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null))
    .refine(
      (v) => v === null || z.string().email().safeParse(v).success,
      "正しいメールアドレスを入力してください"
    ),
  phone: optionalNullableString,
  industry: optionalNullableString,
  company_name: optionalNullableString,
  job_title: optionalNullableString,
  work_history: optionalNullableString,
  education: optionalNullableString,
  memo: optionalNullableString,
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;

export const createCandidatePayloadSchema = candidateFormSchema.extend({
  pdf_file_path: z.string().min(1),
  ocr_raw_text: z.string().nullish(),
});

export const statusChangePayloadSchema = z.object({
  to_status: candidateStatusSchema,
  comment: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8, "パスワードは8文字以上で設定してください"),
});

export const loginSchema = z.object({
  email: z.string().email("正しいメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type InviteUserValues = z.infer<typeof inviteUserSchema>;
