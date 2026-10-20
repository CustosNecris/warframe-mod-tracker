import { createPortal } from "react-dom";

interface Props {
    name: string;
    text: string;
    anchorRect: DOMRect;
}

const TOOLTIP_W = 260;
const MARGIN = 12;
const ESTIMATED_HEIGHT = 140;

export function Tooltip({ name, text, anchorRect }: Props) {
    // Если сверху мало места — показываем снизу
    const above = anchorRect.top > ESTIMATED_HEIGHT + MARGIN;

    // Центрируем по горизонтали, но не даём вылезти за экран
    const rawLeft = anchorRect.left + anchorRect.width / 2 - TOOLTIP_W / 2;
    const left = Math.max(8, Math.min(window.innerWidth - TOOLTIP_W - 8, rawLeft));

    const top = above ? anchorRect.top - MARGIN : anchorRect.bottom + MARGIN;

    return createPortal(
        <div
            className={`tooltip ${above ? "tooltip--above" : "tooltip--below"}`}
            style={{
                left,
                top,
                width: TOOLTIP_W,
                transform: above ? "translateY(-100%)" : "none",
            }}
        >
            <div className="tooltip__name">{name}</div>
            <div className="tooltip__desc">{text}</div>
        </div>,
        document.body
    );
}