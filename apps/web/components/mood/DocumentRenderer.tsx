import ReactMarkdown from "react-markdown";
import { ProtocolCard } from "./ProtocolCard";
import { TimelineSection } from "./TimelineSection";

export function DocumentRenderer({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown components={{
      li: ({ children }) => <ProtocolCard>{children}</ProtocolCard>,
      pre: ({ children }) => <TimelineSection><pre>{children}</pre></TimelineSection>,
    }}>
      {markdown}
    </ReactMarkdown>
  );
}
