import ReactMarkdown from "react-markdown";
import { MoodShell } from "./MoodShell";

export function MoodDocument({ markdown, current, section }: { markdown: string; current: string; section: string }) {
  return (
    <MoodShell current={current}>
      <header className="document-hero">
        <span className="world-kicker">MOOD · {section}</span>
        <article className="document-lead"><ReactMarkdown>{markdown}</ReactMarkdown></article>
      </header>
      <section className="document-entry">
        <div className="entry-line"><span>WORLD</span><i /><span>PROTOCOL</span><i /><span>PORTAL</span></div>
        <p>This page renders its Markdown source directly. Meaning remains upstream of interface.</p>
      </section>
    </MoodShell>
  );
}
