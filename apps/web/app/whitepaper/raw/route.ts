import content from "../content.json";

export async function GET() {
  return new Response(content.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": "attachment; filename=MOOD_English_Whitepaper_v0.1.md",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
