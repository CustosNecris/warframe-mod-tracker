import { useMemo } from "react";
import { t, translateCategoryFull } from "../i18n";

interface Props {
    query: string;
    onQuery: (v: string) => void;
    category: string;
    onCategory: (v: string) => void;
    rarity: string;
    onRarity: (v: string) => void;
    polarity: string;
    onPolarity: (v: string) => void;
    setFilter: string;
    onSetFilter: (v: string) => void;
    availableSets: string[];
    onlyWithSources: boolean;
    onOnlyWithSources: (v: boolean) => void;
    searchEffects: boolean;
    onSearchEffects: (v: boolean) => void;
    hideOwned: boolean;
    onHideOwned: (v: boolean) => void;
    wishlistFilter: boolean;
    onWishlistFilter: (v: boolean) => void;
    sortKey: string;
    onSortKey: (v: string) => void;
    language: "en" | "ru";
    onLanguage: (v: "en" | "ru") => void;
    theme: "dark" | "light";
    onTheme: (v: "dark" | "light") => void;
    cardSize: "compact" | "normal" | "large";
    onCardSize: (v: "compact" | "normal" | "large") => void;
    categories: { name: string; count: number }[];
    total: number;
    filtered: number;
    ownedCount: number;
    filteredOwned: number;
    totalRare: number;
    totalLegendary: number;
    onExport: () => void;
    onExportCSV: () => void;
    onCopyWishlist: () => void;
    onCopyOwned: () => void;
    onImport: () => void;
    onClearOwned: () => void;
    onResetFilters: () => void;
    isUpdating: boolean;
    progress: { step: string; percent: number } | null;
    onUpdateData: () => void;
    buildDate: string;
}

const CATEGORY_GROUP_ORDER = [
    "catWarframe", "catPrimary", "catSecondary", "catMelee", "catCompanions",
    "catArchwing", "catNecramech", "catPlexus", "catKDrive", "catSets", "catOther",
];

function getGroupForCategory(name: string): string {
    if (name.includes(":")) {
        const prefix = name.split(":")[0].trim();
        const map: Record<string, string> = {
            "Варфрейм": "catWarframe", "Основное": "catPrimary", "Вторичное": "catSecondary",
            "Ближний бой": "catMelee", "Компаньоны": "catCompanions", "Арчвинг": "catArchwing",
            "Некрамех": "catNecramech", "Плексус": "catPlexus", "K-Drive": "catKDrive",
            "Моды сетов": "catSets", "Прочее": "catOther",
        };
        return map[prefix] ?? "catOther";
    }
    const standalone: Record<string, string> = {
        "Арчвинг": "catArchwing", "Некрамех": "catNecramech", "Плексус": "catPlexus",
        "K-Drive": "catKDrive", "Компаньоны": "catCompanions", "Моды сетов": "catSets",
    };
    return standalone[name] ?? "catOther";
}

export function Sidebar(p: Props) {
    const groupedCategories = useMemo(() => {
        const groups: Record<string, { name: string; count: number }[]> = {};
        for (const cat of p.categories) {
            const groupKey = getGroupForCategory(cat.name);
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(cat);
        }
        for (const g of Object.keys(groups)) {
            groups[g].sort((a, b) => a.name.localeCompare(b.name));
        }
        return groups;
    }, [p.categories]);

    const orderedGroups = useMemo(
        () => CATEGORY_GROUP_ORDER.filter((g) => groupedCategories[g]),
        [groupedCategories]
    );

    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <h1 className="sidebar__title">Warframe Mod Tracker</h1>
                <button
                    className="theme-toggle"
                    onClick={() => p.onTheme(p.theme === "dark" ? "light" : "dark")}
                    title={p.theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                >
                    {p.theme === "dark" ? "☀️" : "🌙"}
                </button>
            </div>

            <div className="lang-switch">
                <button className={p.language === "en" ? "active" : ""} onClick={() => p.onLanguage("en")}>EN</button>
                <button className={p.language === "ru" ? "active" : ""} onClick={() => p.onLanguage("ru")}>RU</button>
            </div>

            <input
                type="text"
                placeholder={t("search", p.language)}
                value={p.query}
                onChange={(e) => p.onQuery(e.target.value)}
                className="sidebar__search"
            />

            <select className="sidebar__sort" value={p.sortKey} onChange={(e) => p.onSortKey(e.target.value)}>
                <option value="name-asc">{t("sortNameAsc", p.language)}</option>
                <option value="name-desc">{t("sortNameDesc", p.language)}</option>
                <option value="rarity-asc">{t("sortRarityAsc", p.language)}</option>
                <option value="rarity-desc">{t("sortRarityDesc", p.language)}</option>
                <option value="chance-desc">{t("sortChanceDesc", p.language)}</option>
                <option value="chance-asc">{t("sortChanceAsc", p.language)}</option>
                <option value="rank-desc">{t("sortRankDesc", p.language)}</option>
            </select>

            <label className="sidebar__check">
                <input type="checkbox" checked={p.onlyWithSources} onChange={(e) => p.onOnlyWithSources(e.target.checked)} />
                {t("onlyWithSources", p.language)}
            </label>
            <label className="sidebar__check">
                <input type="checkbox" checked={p.searchEffects} onChange={(e) => p.onSearchEffects(e.target.checked)} />
                {t("searchEffects", p.language)}
            </label>
            <label className="sidebar__check">
                <input type="checkbox" checked={p.hideOwned} onChange={(e) => p.onHideOwned(e.target.checked)} />
                {t("hideOwned", p.language)}
            </label>
            <label className="sidebar__check">
                <input type="checkbox" checked={p.wishlistFilter} onChange={(e) => p.onWishlistFilter(e.target.checked)} />
                {t("wishlistFilter", p.language)}
            </label>

            <div className="sidebar__field">
                <label className="sidebar__field-label">{t("rarity", p.language)}</label>
                <div className="rarity-switch">
                    <button className={p.rarity === "" ? "active" : ""} onClick={() => p.onRarity("")}>{t("all", p.language)}</button>
                    <button className={`rarity-common ${p.rarity === "common" ? "active" : ""}`} onClick={() => p.onRarity(p.rarity === "common" ? "" : "common")}>{t("common", p.language)}</button>
                    <button className={`rarity-uncommon ${p.rarity === "uncommon" ? "active" : ""}`} onClick={() => p.onRarity(p.rarity === "uncommon" ? "" : "uncommon")}>{t("uncommon", p.language)}</button>
                    <button className={`rarity-rare ${p.rarity === "rare" ? "active" : ""}`} onClick={() => p.onRarity(p.rarity === "rare" ? "" : "rare")}>{t("rare", p.language)}</button>
                    <button className={`rarity-legendary ${p.rarity === "legendary" ? "active" : ""}`} onClick={() => p.onRarity(p.rarity === "legendary" ? "" : "legendary")}>{t("legendary", p.language)}</button>
                </div>
            </div>

            <div className="sidebar__field">
                <label className="sidebar__field-label">{t("polarity", p.language)}</label>
                <select className="sidebar__sort" value={p.polarity} onChange={(e) => p.onPolarity(e.target.value)}>
                    <option value="">{t("polAny", p.language)}</option>
                    <option value="madurai">{t("polMadurai", p.language)}</option>
                    <option value="vazarin">{t("polVazarin", p.language)}</option>
                    <option value="naramon">{t("polNaramon", p.language)}</option>
                    <option value="zenurik">{t("polZenurik", p.language)}</option>
                    <option value="umbra">{t("polUmbra", p.language)}</option>
                    <option value="penjaga">{t("polPenjaga", p.language)}</option>
                    <option value="unairu">{t("polUnairu", p.language)}</option>
                </select>
            </div>

            <div className="sidebar__field">
                <label className="sidebar__field-label">Сет</label>
                <select className="sidebar__sort" value={p.setFilter} onChange={(e) => p.onSetFilter(e.target.value)}>
                    <option value="">Все сеты</option>
                    {p.availableSets.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="sidebar__field">
                <label className="sidebar__field-label">{t("cardSize", p.language)}</label>
                <div className="size-switch">
                    <button className={p.cardSize === "compact" ? "active" : ""} onClick={() => p.onCardSize("compact")}>{t("compact", p.language)}</button>
                    <button className={p.cardSize === "normal" ? "active" : ""} onClick={() => p.onCardSize("normal")}>{t("normal", p.language)}</button>
                    <button className={p.cardSize === "large" ? "active" : ""} onClick={() => p.onCardSize("large")}>{t("large", p.language)}</button>
                </div>
            </div>

            <button className="sidebar__reset" onClick={p.onResetFilters}>{t("resetFilters", p.language)}</button>

            <div className="sidebar__stats">
                <div className="sidebar__stats-row">
                    <span>{t("found", p.language)}</span>
                    <strong>{p.filtered} {t("of", p.language)} {p.total}</strong>
                </div>
                <div className="sidebar__stats-row">
                    <span>{t("inCollection", p.language)}</span>
                    <strong>{p.ownedCount}</strong>
                </div>

                <div className="sidebar__stats-advanced">
                    <div>Редких в базе: {p.totalRare}</div>
                    <div>Легендарных: {p.totalLegendary}</div>
                </div>

                {p.filtered > 0 && (
                    <>
                        <div className="progress-bar" title={`${p.filteredOwned} ${t("of", p.language)} ${p.filtered}`}>
                            <div className="progress-bar__fill" style={{ width: `${(p.filteredOwned / p.filtered) * 100}%` }} />
                        </div>
                        <div className="progress-label">
                            {p.filteredOwned} / {p.filtered} ({Math.round((p.filteredOwned / p.filtered) * 100)}%)
                        </div>
                    </>
                )}
            </div>

            <div className="sidebar__actions">
                <button onClick={p.onExport} title="Save collection to JSON">{t("export", p.language)}</button>
                <button onClick={p.onImport} title="Load collection from JSON">{t("import", p.language)}</button>
            </div>

            <div className="sidebar__actions" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button onClick={p.onExportCSV} title="Save collection to CSV">
                    {t("exportCSV", p.language)}
                </button>
                <button onClick={p.onCopyWishlist} title="Copy Wishlist (WTB)">
                    {t("copyWishlist", p.language)}
                </button>
            </div>

            <div className="sidebar__actions" style={{ gridTemplateColumns: '1fr' }}>
                <button onClick={p.onCopyOwned} title="Copy Owned (WTS)" style={{ borderColor: "var(--accent-2)", color: "var(--accent-2)" }}>
                    📋 Копировать WTS
                </button>
            </div>

            {p.ownedCount > 0 && (
                <button className="sidebar__clear" onClick={p.onClearOwned}>{t("clearCollection", p.language)}</button>
            )}

            <button className="sidebar__updates" onClick={p.onUpdateData} disabled={p.isUpdating}>
                {p.isUpdating ? t("updating", p.language) : t("updateData", p.language)}
            </button>

            {p.isUpdating && p.progress && (
                <>
                    <div className="progress-bar">
                        <div className="progress-bar__fill" style={{ width: `${p.progress.percent}%` }} />
                    </div>
                    <div className="progress-label">{p.progress.step}</div>
                </>
            )}

            <div className="sidebar__build-date">{t("dataFrom", p.language)} {p.buildDate}</div>

            <h3 className="sidebar__subtitle">{t("categories", p.language)}</h3>
            <button className={`cat-btn ${p.category === "" ? "active" : ""}`} onClick={() => p.onCategory("")}>
                <span>{t("all", p.language)}</span>
                <span className="cat-count">{p.total}</span>
            </button>

            {orderedGroups.map((groupKey) => (
                <div key={groupKey} className="cat-group">
                    <div className="cat-group__title">{t(groupKey, p.language)}</div>
                    {groupedCategories[groupKey].map((c) => {
                        const rawDisplayName = c.name.includes(": ") ? c.name.split(": ").slice(1).join(": ") : c.name;
                        const displayName = translateCategoryFull(rawDisplayName, p.language);
                        return (
                            <button
                                key={c.name}
                                className={`cat-btn ${p.category === c.name ? "active" : ""}`}
                                onClick={() => p.onCategory(c.name)}
                            >
                                <span>{displayName}</span>
                                <span className="cat-count">{c.count}</span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </aside>
    );
}