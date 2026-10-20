import type { ReactNode } from "react";

interface Props {
    text: string;
    query: string;
}

export function Highlight({ text, query }: Props) {
    const q = query.trim().toLowerCase();
    if (!q) return <>{text}</>;

    const lower = text.toLowerCase();
    const parts: ReactNode[] = [];
    let last = 0;
    let idx = lower.indexOf(q, last);
    let key = 0;

    while (idx !== -1) {
        if (idx > last) parts.push(text.slice(last, idx));
        parts.push(<mark key={key++}>{text.slice(idx, idx + q.length)}</mark>);
        last = idx + q.length;
        idx = lower.indexOf(q, last);
    }

    if (last < text.length) parts.push(text.slice(last));
    return <>{parts}</>;
}