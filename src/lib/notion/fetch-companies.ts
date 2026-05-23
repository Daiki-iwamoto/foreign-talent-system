/**
 * Notion 商談DB から「企業名(title)」列の値を全件取得
 * 重複除去・空文字除去・日本語ソートで返す
 */

type NotionPage = {
  properties: Record<
    string,
    {
      type: string;
      title?: { plain_text: string }[];
    }
  >;
};

type QueryResponse = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

const NOTION_API_VERSION = "2022-06-28";

export async function fetchCompanyNames(): Promise<string[]> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DEALS_DATABASE_ID;
  if (!apiKey) throw new Error("NOTION_API_KEY が設定されていません");
  if (!databaseId) throw new Error("NOTION_DEALS_DATABASE_ID が設定されていません");

  const names = new Set<string>();
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": NOTION_API_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion API error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as QueryResponse;
    for (const page of json.results) {
      const titleProp = Object.values(page.properties).find(
        (p) => p.type === "title"
      );
      if (!titleProp?.title) continue;
      const text = titleProp.title.map((t) => t.plain_text).join("").trim();
      if (text) names.add(text);
    }

    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);

  return Array.from(names).sort((a, b) => a.localeCompare(b, "ja"));
}
