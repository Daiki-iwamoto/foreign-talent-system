import { UploadFlow } from "@/components/candidates/upload-flow";

export const metadata = {
  title: "履歴書アップロード | 求職者管理システム",
};

export default function UploadPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">履歴書アップロード</h1>
        <p className="text-sm text-muted-foreground mt-1">
          PDFをドロップすると、AIが履歴書の情報を自動抽出します。確認・修正のうえ登録してください。
        </p>
      </div>
      <UploadFlow />
    </div>
  );
}
