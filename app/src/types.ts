export interface ModSource {
    source: string;
    chance: number;
    kind?: "enemy" | "mission" | "relic" | "sortie" | "syndicate" | "transient" | "cetus" | "solaris" | "deimos";
}

export interface Mod {
    name: string;
    nameRu: string | null;
    uniqueName: string;
    category: string;
    type: string | null;
    compatName: string | null;
    rarity: string | null;
    polarity: string | null;
    baseDrain: number | null;
    fusionLimit: number | null;
    modSet: string | null;
    imageName: string | null;
    wikiaThumbnail: string | null;
    tradable: boolean;
    effects: string[];
    sources: ModSource[];
    iconLocal: string | null;
    obtainHint: string | null;
}