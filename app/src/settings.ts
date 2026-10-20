const KEY = "warframe-mods-settings";

export interface Settings {
    query: string;
    category: string;
    rarity: string;
    polarity: string;
    setFilter: string;
    onlyWithSources: boolean;
    searchEffects: boolean;
    hideOwned: boolean;
    sortKey: string;
    language: "en" | "ru";
    theme: "dark" | "light";
    cardSize: "compact" | "normal" | "large";
}

export const DEFAULT_SETTINGS: Settings = {
    query: "",
    category: "",
    rarity: "",
    polarity: "",
    setFilter: "",
    onlyWithSources: true,
    searchEffects: true,
    hideOwned: false,
    sortKey: "name-asc",
    language: "en",
    theme: "dark",
    cardSize: "normal",
};

export function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<Settings>;
        return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(s: Settings): void {
    localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetFilters(s: Settings): Settings {
    return {
        ...s,
        query: DEFAULT_SETTINGS.query,
        category: DEFAULT_SETTINGS.category,
        rarity: DEFAULT_SETTINGS.rarity,
        polarity: DEFAULT_SETTINGS.polarity,
        setFilter: DEFAULT_SETTINGS.setFilter,
        onlyWithSources: DEFAULT_SETTINGS.onlyWithSources,
        searchEffects: DEFAULT_SETTINGS.searchEffects,
        hideOwned: DEFAULT_SETTINGS.hideOwned,
        sortKey: DEFAULT_SETTINGS.sortKey,
    };
}