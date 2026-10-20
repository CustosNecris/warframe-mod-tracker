import { useEffect, useMemo, useState } from "react";
import type { Mod } from "./types";
import { ModGrid } from "./components/ModGrid";
import { ModDetail } from "./components/ModDetail";
import { Sidebar } from "./components/Sidebar";
import { SourceModsModal } from "./components/SourceModsModal";
import { loadOwned, saveOwned, loadWishlist, saveWishlist } from "./storage";
import { exportCollection, exportCollectionCSV, importCollection } from "./collectionIO";
import { loadSettings, saveSettings, resetFilters, type Settings } from "./settings";
import { loadCachedData, runUpdate, type UpdateProgress } from "./updater";
import bundledMods from "./data/mods.json";

const FALLBACK_MODS = bundledMods as Mod[];

const RARITY_ORDER: Record<string, number> = {
    common: 1, uncommon: 2, rare: 3, legendary: 4, riven: 5,
};

function maxChance(mod: Mod): number {
    if (mod.sources.length === 0) return -1;
    return Math.max(...mod.sources.map((s) => s.chance));
}

function sortMods(list: Mod[], key: string): Mod[] {
    const sorted = [...list];
    const [field, dir] = key.split("-");
    const mult = dir === "desc" ? -1 : 1;
    switch (field) {
        case "name": sorted.sort((a, b) => mult * a.name.localeCompare(b.name)); break;
        case "rarity":
            sorted.sort((a, b) => {
                const ra = RARITY_ORDER[(a.rarity ?? "").toLowerCase()] ?? 0;
                const rb = RARITY_ORDER[(b.rarity ?? "").toLowerCase()] ?? 0;
                return mult * (ra - rb) || a.name.localeCompare(b.name);
            });
            break;
        case "chance": sorted.sort((a, b) => mult * (maxChance(a) - maxChance(b)) || a.name.localeCompare(b.name)); break;
        case "rank": sorted.sort((a, b) => mult * ((a.fusionLimit ?? 0) - (b.fusionLimit ?? 0)) || a.name.localeCompare(b.name)); break;
    }
    return sorted;
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleString("ru-RU", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
}

export default function App() {
    const [settings, setSettings] = useState<Settings>(() => loadSettings());
    const [opened, setOpened] = useState<Mod | null>(null);
    const [openedSource, setOpenedSource] = useState<string | null>(null);

    const [owned, setOwned] = useState<Set<string>>(() => loadOwned());
    const [wishlist, setWishlist] = useState<Set<string>>(() => loadWishlist());
    const [wishlistFilter, setWishlistFilter] = useState(false);

    const [toast, setToast] = useState<string | null>(null);

    const [mods, setMods] = useState<Mod[]>(FALLBACK_MODS);
    const [buildDate, setBuildDate] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);
    const [progress, setProgress] = useState<UpdateProgress | null>(null);

    useEffect(() => {
        loadCachedData().then((cache) => {
            if (cache) { setMods(cache.mods); setBuildDate(cache.buildDate); }
            setIsLoaded(true);
        });
    }, []);

    const modNames = useMemo(() => new Set(mods.map((m) => m.name)), [mods]);

    const availableSets = useMemo(() => {
        const sets = new Set<string>();
        for (const m of mods) { if (m.modSet) sets.add(m.modSet); }
        return Array.from(sets).sort();
    }, [mods]);

    const sourceIndex = useMemo(() => {
        const idx = new Map<string, Mod[]>();
        for (const m of mods) {
            for (const s of m.sources) {
                const key = s.source;
                if (!idx.has(key)) idx.set(key, []);
                idx.get(key)!.push(m);
            }
        }
        return idx;
    }, [mods]);

    useEffect(() => { saveSettings(settings); }, [settings]);
    useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);
    useEffect(() => { document.documentElement.dataset.size = settings.cardSize; }, [settings.cardSize]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                document.querySelector<HTMLInputElement>(".sidebar__search")?.focus();
            }
            if (e.key === "Escape") { setOpened(null); setOpenedSource(null); }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const {
        query, category, rarity, polarity, setFilter, onlyWithSources, searchEffects, hideOwned,
        sortKey, language, theme, cardSize,
    } = settings;

    const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const categories = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const m of mods) counts[m.category] = (counts[m.category] ?? 0) + 1;
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
    }, [mods]);

    const totalRare = useMemo(() => mods.filter((m) => m.rarity?.toLowerCase() === "rare").length, [mods]);
    const totalLegendary = useMemo(() => mods.filter((m) => m.rarity?.toLowerCase() === "legendary").length, [mods]);

    const filtered = useMemo(() => {
        let result = mods;
        if (onlyWithSources) result = result.filter((m) => m.sources.length > 0);
        if (wishlistFilter) result = result.filter((m) => wishlist.has(m.name));
        if (category) result = result.filter((m) => m.category === category);
        if (rarity) result = result.filter((m) => (m.rarity ?? "").toLowerCase() === rarity);
        if (polarity) result = result.filter((m) => (m.polarity ?? "").toLowerCase() === polarity);
        if (setFilter) result = result.filter((m) => m.modSet === setFilter);
        if (query) {
            const q = query.toLowerCase();
            result = result.filter((m) => {
                if (m.name.toLowerCase().includes(q)) return true;
                if (m.nameRu && m.nameRu.toLowerCase().includes(q)) return true;
                if (searchEffects && m.effects.some((e) => e.toLowerCase().includes(q))) return true;
                return false;
            });
        }
        if (hideOwned) result = result.filter((m) => !owned.has(m.name));
        return sortMods(result, sortKey);
    }, [mods, query, category, rarity, polarity, setFilter, onlyWithSources, searchEffects, hideOwned, wishlistFilter, owned, wishlist, sortKey]);

    const filteredOwned = useMemo(() => filtered.reduce((acc, m) => acc + (owned.has(m.name) ? 1 : 0), 0), [filtered, owned]);

    const handleToggleOwned = (name: string) => {
        const next = new Set(owned);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        saveOwned(next);
        setOwned(next);
    };

    const handleToggleWishlist = (name: string) => {
        const next = new Set(wishlist);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        saveWishlist(next);
        setWishlist(next);
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const handleExport = async () => {
        if (owned.size === 0) { showToast("Коллекция пуста."); return; }
        try {
            const path = await exportCollection(owned);
            if (path) showToast(`Экспортировано (JSON): ${path}`);
        } catch (e) { showToast(`Ошибка экспорта: ${e}`); }
    };

    const handleExportCSV = async () => {
        if (owned.size === 0) { showToast("Коллекция пуста."); return; }
        try {
            const path = await exportCollectionCSV(owned, mods);
            if (path) showToast(`Экспортировано (CSV): ${path}`);
        } catch (e) { showToast(`Ошибка экспорта CSV: ${e}`); }
    };

    const handleCopyWishlist = () => {
        if (wishlist.size === 0) { showToast("Список желаемого пуст."); return; }
        const names = Array.from(wishlist).map((n) => {
            const mod = mods.find((m) => m.name === n);
            return language === "ru" && mod?.nameRu ? mod.nameRu : n;
        }).join(", ");
        navigator.clipboard.writeText(`Куплю: ${names}`)
            .then(() => showToast(`Скопировано ${wishlist.size} модов (WTB)`))
            .catch(() => showToast("Ошибка копирования"));
    };

    const handleCopyOwned = () => {
        if (owned.size === 0) { showToast("Коллекция пуста."); return; }
        const names = Array.from(owned).map((n) => {
            const mod = mods.find((m) => m.name === n);
            return language === "ru" && mod?.nameRu ? mod.nameRu : n;
        }).join(", ");
        navigator.clipboard.writeText(`Продам: ${names}`)
            .then(() => showToast(`Скопировано ${owned.size} модов (WTS)`))
            .catch(() => showToast("Ошибка копирования"));
    };

    const handleImport = async () => {
        try {
            const names = await importCollection();
            if (!names) return;
            const valid = names.filter((n) => modNames.has(n));
            const unknown = names.length - valid.length;
            const next = new Set(owned);
            for (const n of valid) next.add(n);
            saveOwned(next);
            setOwned(next);
            showToast(`Импортировано: ${valid.length} модов` + (unknown > 0 ? ` (${unknown} пропущено)` : ""));
        } catch (e) { showToast(`Ошибка импорта: ${e}`); }
    };

    const handleClearOwned = () => {
        if (!confirm("Снять все отметки? Это действие нельзя отменить.")) return;
        saveOwned(new Set());
        setOwned(new Set());
        showToast("Коллекция очищена");
    };

    const handleResetFilters = () => {
        setSettings((prev) => resetFilters(prev));
        setWishlistFilter(false);
        showToast("Фильтры сброшены");
    };

    const handleUpdateData = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        setProgress({ step: "Начинаю…", percent: 0 });

        const result = await runUpdate(setProgress);

        if (result.ok) {
            setMods(result.data.mods);
            setBuildDate(result.data.buildDate);
            showToast(`✓ Данные обновлены: ${result.data.mods.length} модов (${formatDate(result.data.buildDate)})`);
        } else {
            showToast(`Ошибка обновления: ${result.error}`);
        }
        setIsUpdating(false);
        setProgress(null);
    };

    const handleSourceClick = (source: string) => setOpenedSource(source);

    if (!isLoaded) return <div className="app" style={{ padding: 20 }}>Загрузка данных...</div>;

    return (
        <div className="app">
            <Sidebar
                query={query} onQuery={(v) => update("query", v)}
                category={category} onCategory={(v) => update("category", v)}
                rarity={rarity} onRarity={(v) => update("rarity", v)}
                polarity={polarity} onPolarity={(v) => update("polarity", v)}
                setFilter={setFilter} onSetFilter={(v) => update("setFilter", v)}
                availableSets={availableSets}
                onlyWithSources={onlyWithSources} onOnlyWithSources={(v) => update("onlyWithSources", v)}
                searchEffects={searchEffects} onSearchEffects={(v) => update("searchEffects", v)}
                hideOwned={hideOwned} onHideOwned={(v) => update("hideOwned", v)}
                wishlistFilter={wishlistFilter} onWishlistFilter={setWishlistFilter}
                sortKey={sortKey} onSortKey={(v) => update("sortKey", v)}
                language={language} onLanguage={(v) => update("language", v)}
                theme={theme} onTheme={(v) => update("theme", v)}
                cardSize={cardSize} onCardSize={(v) => update("cardSize", v)}
                categories={categories}
                total={mods.length}
                filtered={filtered.length}
                ownedCount={owned.size}
                filteredOwned={filteredOwned}
                totalRare={totalRare}
                totalLegendary={totalLegendary}
                onExport={handleExport}
                onExportCSV={handleExportCSV}
                onCopyWishlist={handleCopyWishlist}
                onCopyOwned={handleCopyOwned}
                onImport={handleImport}
                onClearOwned={handleClearOwned}
                onResetFilters={handleResetFilters}
                isUpdating={isUpdating}
                progress={progress}
                onUpdateData={handleUpdateData}
                buildDate={buildDate ? formatDate(buildDate) : "из сборки"}
            />
            <main className="main">
                <ModGrid
                    mods={filtered}
                    owned={owned}
                    wishlist={wishlist}
                    language={language}
                    query={query}
                    onToggleOwned={handleToggleOwned}
                    onToggleWishlist={handleToggleWishlist}
                    onOpen={setOpened}
                />
            </main>
            {opened && (
                <ModDetail
                    mod={opened}
                    allMods={mods}
                    owned={owned}
                    language={language}
                    query={query}
                    onClose={() => setOpened(null)}
                    onToggleOwned={handleToggleOwned}
                    onSourceClick={handleSourceClick}
                />
            )}
            {openedSource && (
                <SourceModsModal
                    sourceLabel={openedSource}
                    mods={sourceIndex.get(openedSource) ?? []}
                    owned={owned}
                    language={language}
                    onClose={() => setOpenedSource(null)}
                    onOpenMod={(mod) => { setOpened(mod); setOpenedSource(null); }}
                />
            )}
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}