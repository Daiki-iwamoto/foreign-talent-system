# 外国人材求職者管理システム

外国人材紹介会社向けの社内システム。履歴書PDFをドラッグ&ドロップでアップロードすると、
Claude API による自動抽出で求職者情報がデータベース化され、ステータス管理ができます。

## 機能

- 履歴書PDFのドラッグ&ドロップアップロード(複数同時可)
- Claude API による氏名・国籍・連絡先・職歴・学歴などの自動抽出
- 抽出結果のプレビュー&手動修正
- 求職者一覧の検索・ステータスフィルター
- 詳細ページで PDF をブラウザ内表示
- 8段階のステータス管理(求職中 / 面接調整中 / 面接済 / 内定 / 入社決定 / 就業中 / 退職 / 連絡不通)
- ステータス変更履歴のタイムライン表示
- 社内メモ
- 管理者画面からのユーザー追加

## 技術スタック

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui ベースの軽量コンポーネント
- Supabase Cloud(PostgreSQL + Storage + Auth)
- Anthropic Claude API (claude-sonnet-4-5) で履歴書PDFを直接処理
- react-hook-form + zod

---

## セットアップ(macOS 想定)

### 1. 前提ツールのインストール

```bash
# Node.js(20以上推奨)
brew install node

# Supabase CLI(マイグレーション適用に使用)
brew install supabase/tap/supabase
```

### 2. リポジトリ取得 & 依存インストール

```bash
git clone <repo-url> foreign-talent-system
cd foreign-talent-system
npm install
```

### 3. Supabase プロジェクトの作成

1. https://supabase.com にサインアップ
2. **New Project** で新規プロジェクト作成(リージョンは `Tokyo` 推奨)
3. **Settings → API** から以下をコピー
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`(秘密)

### 4. Anthropic API キーの取得

1. https://console.anthropic.com にサインアップ
2. **API Keys → Create Key** で新規キー発行
3. **Plans** からクレジットを購入(最低 $5)
4. キーを `ANTHROPIC_API_KEY` にコピー

   料金目安: 1件あたり約 $0.012 → 30件/日 × 22営業日 = 月約 $8

### 5. 環境変数の設定

```bash
cp .env.example .env.local
# .env.local を開いて、上記4で取得した値を貼り付け
# ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME も任意の値で設定
```

### 6. DBマイグレーションの適用

```bash
# Supabase プロジェクトをローカルにリンク
supabase login
supabase link --project-ref <your-project-ref>
# project-ref はダッシュボードURLの xxxxxx.supabase.co の xxxxxx 部分

# マイグレーション適用
supabase db push
```

`supabase/migrations/` 配下の3ファイルが適用されます:
- `20260516000001_init_schema.sql` — テーブル + ENUM + インデックス
- `20260516000002_rls_policies.sql` — Row Level Security
- `20260516000003_storage_bucket.sql` — `resumes` バケット + ポリシー

### 7. 初期管理者の作成

```bash
npm run create-admin
```

`.env.local` の `ADMIN_EMAIL` / `ADMIN_PASSWORD` で管理者アカウントが作成されます。

### 8. 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000
```

ブラウザで開くと `/login` にリダイレクトされます。初期管理者のメール/パスワードでログインしてください。

---

## 動作確認手順

1. http://localhost:3000 → 管理者でログイン
2. サイドバーの「ユーザー管理」から社内メンバーを追加
3. 「履歴書アップロード」を開き、日本語履歴書PDFをドラッグ&ドロップ
4. AIが解析 → 抽出結果が表示されたら内容確認・必要なら修正 → 「登録」
5. 「求職者一覧」に戻ると、新規登録された求職者が表示される
6. 行をクリックして詳細ページへ。PDFが右側に表示される
7. 「ステータス変更」ボタンから別ステータスに変更、コメント追加 → 履歴タイムラインに反映される
8. 一覧ページで検索ボックスやステータスフィルターを試す
9. ログアウトして、別ユーザーで再ログインしても同じデータが見えることを確認

---

## ディレクトリ構成

```
src/
├── app/
│   ├── login/                 # ログイン画面
│   ├── (app)/                 # 認証必須ルート
│   │   ├── candidates/
│   │   │   ├── page.tsx       # 一覧
│   │   │   ├── upload/        # PDFアップロード
│   │   │   └── [id]/          # 詳細
│   │   └── admin/users/       # ユーザー管理
│   └── api/                   # Route Handlers
│       ├── extract/                  # PDF → Claude 抽出
│       ├── candidates/               # 登録 + CRUD
│       └── admin/invite-user/        # ユーザー作成
├── components/                # UI コンポーネント
├── lib/
│   ├── supabase/              # サーバー/ブラウザ/middleware クライアント
│   ├── anthropic/             # Claude API 呼び出し
│   ├── status.ts              # ステータス定義
│   ├── schemas.ts             # zod バリデーション
│   └── utils.ts               # cn()
└── types/database.ts          # DB 型定義

supabase/
├── config.toml
└── migrations/*.sql

scripts/
└── create-admin-user.ts       # 初期管理者作成
```

---

## セキュリティ

- 全ページが認証必須(middleware で `/login` 以外をガード)
- パスワードは Supabase Auth が bcrypt 相当で安全に管理
- `SUPABASE_SERVICE_ROLE_KEY` はサーバーサイドのみ使用(クライアントには公開されない)
- PDFファイルは Storage に private で保存。`/api/candidates/[id]/pdf` 経由でのみアクセス可
- 削除など破壊的操作は確認ダイアログ必須
- Row Level Security により、DBレイヤーでも認証済みユーザーのみアクセス可

本番運用時は HTTPS 必須です(Vercel や Cloud Run などにデプロイすれば自動付与されます)。

---

## トラブルシューティング

### `supabase db push` でエラー
- `supabase link` で正しいプロジェクトにリンクできているか確認
- 既に同名のテーブルが存在する場合は `supabase db reset` で初期化(注意: データ消える)

### Claude API でエラー
- `ANTHROPIC_API_KEY` が正しく設定されているか確認
- Anthropic Console のクレジット残高を確認
- 履歴書PDFが20MB以下か確認

### ログインできない
- `npm run create-admin` を再実行(既存ユーザーがあればスキップされる)
- Supabase Dashboard の **Authentication → Users** に該当ユーザーが存在するか確認

### PDF が表示されない
- ブラウザの開発者ツールで `/api/candidates/[id]/pdf` のレスポンスを確認
- Storage の `resumes` バケットにファイルが存在するか Supabase Dashboard で確認

---

## 利用可能なスクリプト

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm start` | 本番サーバー起動(build 後) |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run create-admin` | 初期管理者作成 |
| `npm run gen-types` | Supabase からDB型を自動生成 |
