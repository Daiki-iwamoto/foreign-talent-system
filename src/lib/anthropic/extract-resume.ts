import { getAnthropicClient } from "./client";

export type ResumeExtract = {
  full_name: string;
  nationality: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  industry: string;
  job_title: string;
  work_history: string;
  education: string;
  raw_text: string;
};

const EMPTY_EXTRACT: ResumeExtract = {
  full_name: "",
  nationality: "",
  date_of_birth: "",
  gender: "",
  email: "",
  phone: "",
  industry: "",
  job_title: "",
  work_history: "",
  education: "",
  raw_text: "",
};

const RESUME_TOOL = {
  name: "extract_resume",
  description: "履歴書PDFから求職者情報を抽出する",
  input_schema: {
    type: "object" as const,
    properties: {
      full_name: { type: "string", description: "氏名(漢字、ローマ字、カタカナのいずれか)" },
      nationality: { type: "string", description: "国籍(例: 日本、ベトナム、フィリピン)" },
      date_of_birth: {
        type: "string",
        description: "生年月日。YYYY-MM-DD 形式。不明なら空文字列",
      },
      gender: { type: "string", description: "性別。男性/女性/その他/不明 のいずれか" },
      email: { type: "string", description: "メールアドレス" },
      phone: { type: "string", description: "電話番号" },
      industry: { type: "string", description: "希望業界または直近の業界" },
      job_title: { type: "string", description: "希望職種または直近の職種" },
      work_history: {
        type: "string",
        description: "職歴サマリー。改行区切りの箇条書きで簡潔に",
      },
      education: {
        type: "string",
        description: "学歴サマリー。改行区切りの箇条書きで簡潔に",
      },
      raw_text: { type: "string", description: "PDFから読み取った生テキスト全文" },
    },
    required: [
      "full_name",
      "nationality",
      "date_of_birth",
      "gender",
      "email",
      "phone",
      "industry",
      "job_title",
      "work_history",
      "education",
      "raw_text",
    ],
  },
};

export async function extractResumeFromPdf(pdfBuffer: Buffer): Promise<ResumeExtract> {
  const client = getAnthropicClient();
  const base64 = pdfBuffer.toString("base64");

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    tools: [RESUME_TOOL],
    tool_choice: { type: "tool", name: "extract_resume" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text:
              "添付の履歴書PDFから求職者情報を抽出してください。抽出できない項目は空文字列にしてください。" +
              "氏名・国籍・生年月日・性別・連絡先・希望業界/職種・職歴・学歴を日本語で整理してください。" +
              "raw_text には PDF から読み取れた全テキストを格納してください。",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Extract<typeof block, { type: "tool_use" }> =>
      block.type === "tool_use" && block.name === "extract_resume"
  );

  if (!toolUse) {
    return EMPTY_EXTRACT;
  }

  const input = toolUse.input as Partial<ResumeExtract>;
  return {
    ...EMPTY_EXTRACT,
    ...input,
  };
}
