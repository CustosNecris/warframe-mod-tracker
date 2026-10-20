import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { Mod, ModSource } from "../types";
import {
    translateRarity,
    translateType,
    translateEffects,
    translateSource,
    translateCategoryFull,
} from "../i18n";
import { Highlight } from "./Highlight";
import { fetchMarketPrice, MarketPrice, getUrlName } from "../market";

interface Props {
    mod: Mod;
    allMods: Mod[];
    owned: Set<string>;
    language: "en" | "ru";
    query?: string;
    onClose: () => void;
    onToggleOwned: (name: string) => void;
    onSourceClick?: (source: string) => void;
}

const TOP_N = 5;

function iconUrl(mod: Mod): string | null {
    if (mod.wikiaThumbnail) {
        return mod.wikiaThumbnail.replace(/\/scale-to-width-down\/\d+/, "/scale-to-width-down/512");
    }
    if (mod.imageName) {
        return `https://cdn.warframestat.us/img/${encodeURIComponent(mod.imageName)}`;
    }
    return null;
}

const KIND_LABELS: Record<string, string> = {
    enemy: "🎯 Враги",
    mission: "🗺️ Миссии",
    relic: "💎 Реликвии",
    sortie: "🎖️ Sortie",
    syndicate: "🏛️ Синдикаты",
    transient: "⚡ События",
    cetus: "🌊 Cetus",
    solaris: "❄️ Orb Vallis",
    deimos: "🦴 Deimos",
};

const KIND_ORDER = [
    "enemy", "mission", "relic", "sortie", "syndicate", "transient", "cetus", "solaris", "deimos",
];

function SourceGroup({
                         kind, items, language, onSourceClick,
                     }: {
    kind: string; items: ModSource[]; language: "en" | "ru"; onSourceClick?: (source: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? items : items.slice(0, TOP_N);
    const hidden = items.length - visible.length;

    return (
        <div className="source-group">
            <div className="source-group__title">
                {KIND_LABELS[kind] ?? kind}
                <span className="source-group__count">{items.length}</span>
            </div>
            {visible.map((s, i) => (
                <div
                    key={i}
                    className={`source-row ${onSourceClick ? "clickable" : ""}`}
                    onClick={() => onSourceClick?.(s.source)}
                    title={onSourceClick ? "Показать все моды из этого источника" : undefined}
                >
                    <span>{translateSource(s.source, language)}</span>
                    <span className="chance">{s.chance}%</span>
                </div>
            ))}
            {hidden > 0 && !expanded && (
                <button className="source-group__more" onClick={() => setExpanded(true)}>
                    Показать ещё {hidden}
                </button>
            )}
            {expanded && items.length > TOP_N && (
                <button className="source-group__more" onClick={() => setExpanded(false)}>
                    Свернуть
                </button>
            )}
        </div>
    );
}

function SourceList({ sources, language, onSourceClick }: {
    sources: ModSource[]; language: "en" | "ru"; onSourceClick?: (source: string) => void;
}) {
    const groups: Record<string, ModSource[]> = {};
    for (const s of sources) {
        const k = s.kind ?? "enemy";
        (groups[k] ??= []).push(s);
    }
    const sortedGroups = Object.entries(groups).sort(
        ([a], [b]) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b)
    );
    return (
        <>
            {sortedGroups.map(([kind, items]) => (
                <SourceGroup key={kind} kind={kind} items={items} language={language} onSourceClick={onSourceClick} />
            ))}
        </>
    );
}

export function ModDetail({
                              mod, allMods, owned, language, query = "", onClose, onToggleOwned, onSourceClick,
                          }: Props) {
    const [price, setPrice] = useState<MarketPrice | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoadingPrice(true);
        setPrice(null);

        fetchMarketPrice(mod.name).then((p) => {
            if (isMounted) {
                setPrice(p);
                setLoadingPrice(false);
            }
        });

        return () => { isMounted = false; };
    }, [mod.name]);

    const icon = iconUrl(mod);

    const showRu = language === "ru" && mod.nameRu;
    const primaryName = showRu ? mod.nameRu! : mod.name;
    const secondaryName = showRu ? mod.name : null;

    const rarityLabel = translateRarity(mod.rarity, language);
    const typeLabel = translateType(mod.type, language);
    const translatedEffects = translateEffects(mod.effects, language);

    const setMods = mod.modSet ? allMods.filter((m) => m.modSet === mod.modSet) : [];
    const setOwnedCount = setMods.filter((m) => owned.has(m.name)).length;
    const setTotalCount = setMods.length;

    return (
        <aside className="detail">
            <button className="detail__close" onClick={onClose}>✕</button>

            <h2><Highlight text={primaryName} query={query} /></h2>
            {secondaryName && <p className="detail__secondary">{secondaryName}</p>}

            <p className="detail__meta">
                {translateCategoryFull(mod.category, language)} • {rarityLabel} • {typeLabel}
                {mod.modSet && (
                    <span className="detail__set-progress">
            • Сет {mod.modSet}: <strong>{setOwnedCount} / {setTotalCount}</strong>
          </span>
                )}
            </p>

            <div className="market-price">
                {loadingPrice ? (
                    <span className="market-price__loading">Загрузка цены...</span>
                ) : price ? (
                    <div className="market-price__row">
                        <span className="market-price__label">💰 Средняя цена:</span>
                        <span className="market-price__value">{price.avg} пл.</span>
                        <span className="market-price__vol">
              (продано за 48ч: <strong style={{ color: "var(--accent-2)" }}>{price.volume}</strong>)
            </span>
                        <button
                            onClick={() => openUrl(`https://warframe.market/items/${getUrlName(mod.name)}`)}
                            className="market-price__link"
                        >
                            Открыть
                        </button>
                    </div>
                ) : (
                    <span className="market-price__none">Нет данных о цене</span>
                )}
            </div>

            {icon && (
                <img
                    src={icon}
                    alt={primaryName}
                    className="detail__icon"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
            )}

            {translatedEffects.length > 0 && (
                <div className="detail__effects">
                    {translatedEffects.map((e, i) => (
                        <div key={i}><Highlight text={e} query={query} /></div>
                    ))}
                </div>
            )}

            <button
                className={`detail__own ${owned.has(mod.name) ? "active" : ""}`}
                onClick={() => onToggleOwned(mod.name)}
            >
                {owned.has(mod.name) ? "✔ У меня есть" : "Отметить как «есть»"}
            </button>

            <h3>Источники выпадения</h3>
            {mod.sources.length === 0 ? (
                mod.obtainHint ? (
                    <div className="obtain-hint">
                        <div className="obtain-hint__title">ℹ️ Как получить</div>
                        <div className="obtain-hint__text">{mod.obtainHint}</div>
                    </div>
                ) : (
                    <p className="empty">Нет данных о выпадении.</p>
                )
            ) : (
                <>
                    <SourceList sources={mod.sources} language={language} onSourceClick={onSourceClick} />
                    {mod.obtainHint && (
                        <div className="obtain-hint">
                            <div className="obtain-hint__title">ℹ️ Дополнительно</div>
                            <div className="obtain-hint__text">{mod.obtainHint}</div>
                        </div>
                    )}
                </>
            )}
        </aside>
    );
}