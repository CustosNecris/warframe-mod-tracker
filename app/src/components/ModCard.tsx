import { memo, useRef, useState } from "react";
import type { Mod } from "../types";
import { Tooltip } from "./Tooltip";
import { Highlight } from "./Highlight";
import { translateEffects, translateCategoryFull } from "../i18n";

interface Props {
    mod: Mod;
    owned: boolean;
    wishlisted: boolean;
    language: "en" | "ru";
    query?: string;
    onToggleOwned: (name: string) => void;
    onToggleWishlist: (name: string) => void;
    onOpen: (mod: Mod) => void;
}

function rarityClass(r: string | null): string {
    switch (r?.toLowerCase()) {
        case "common": return "rarity-common";
        case "uncommon": return "rarity-uncommon";
        case "rare": return "rarity-rare";
        case "legendary": return "rarity-legendary";
        default: return "rarity-common";
    }
}

function polaritySymbol(p: string | null): string {
    if (!p) return "—";
    const map: Record<string, string> = {
        madurai: "V", vazarin: "D", naramon: "—", zenurik: "=",
        umbra: "U", penjaga: "P", unairu: "U", aura: "A",
    };
    return map[p.toLowerCase()] ?? p.charAt(0).toUpperCase();
}

function iconUrl(mod: Mod): string | null {
    if (mod.wikiaThumbnail) {
        return mod.wikiaThumbnail.replace(/\/scale-to-width-down\/\d+/, "/scale-to-width-down/256");
    }
    if (mod.imageName) {
        return `https://cdn.warframestat.us/img/${encodeURIComponent(mod.imageName)}`;
    }
    return null;
}

function ModCardInner({ mod, owned, wishlisted, language, query = "", onToggleOwned, onToggleWishlist, onOpen }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
    const [imgFailed, setImgFailed] = useState(false);

    const icon = imgFailed ? null : iconUrl(mod);

    const translatedEffects = translateEffects(mod.effects, language);
    const tooltipText = translatedEffects.join("\n");
    const hasTooltip = tooltipText.length > 0;

    const handleEnter = () => {
        if (ref.current) setHoverRect(ref.current.getBoundingClientRect());
    };
    const handleLeave = () => setHoverRect(null);

    const effectText = translatedEffects.length > 0
        ? translatedEffects[translatedEffects.length - 1]
        : "";

    const showRu = language === "ru" && mod.nameRu;
    const primaryName = showRu ? mod.nameRu! : mod.name;
    const secondaryName = showRu ? mod.name : null;

    return (
        <>
            <div
                ref={ref}
                className={`mod-card ${rarityClass(mod.rarity)} ${owned ? "owned" : ""}`}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <div className="mod-card__badges">
                    <input
                        type="checkbox"
                        className="mod-card__checkbox"
                        checked={owned}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleOwned(mod.name);
                        }}
                        title={owned ? "Убрать из коллекции" : "Отметить как «есть»"}
                    />
                    <button
                        className={`mod-card__wishlist ${wishlisted ? "active" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(mod.name);
                        }}
                        title={wishlisted ? "Убрать из желаемого" : "Добавить в желаемое"}
                    >
                        {wishlisted ? "★" : "☆"}
                    </button>
                </div>

                {mod.fusionLimit !== null && mod.fusionLimit !== undefined && (
                    <div className="mod-card__rank">^{mod.fusionLimit}</div>
                )}

                <div className="mod-card__art" onClick={() => onOpen(mod)}>
                    {icon ? (
                        <img
                            src={icon}
                            alt={primaryName}
                            className="mod-card__art-img"
                            loading="lazy"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="mod-card__art-placeholder" />
                    )}
                </div>

                <div className="mod-card__info" onClick={() => onOpen(mod)}>
                    <div className="mod-card__title">
                        <Highlight text={primaryName} query={query} />
                    </div>
                    {secondaryName && (
                        <div className="mod-card__title-secondary">{secondaryName}</div>
                    )}
                    {effectText && (
                        <div className="mod-card__effect">
                            <Highlight text={effectText} query={query} />
                        </div>
                    )}
                </div>

                <div className="mod-card__footer">
          <span className="mod-card__polarity" title={mod.polarity ?? "Без полярности"}>
            {polaritySymbol(mod.polarity)}
          </span>
                    <span className="mod-card__type">
            {translateCategoryFull(mod.category, language).toUpperCase()}
          </span>
                </div>
            </div>

            {hoverRect && hasTooltip && (
                <Tooltip name={primaryName} text={tooltipText} anchorRect={hoverRect} />
            )}
        </>
    );
}

export const ModCard = memo(ModCardInner);