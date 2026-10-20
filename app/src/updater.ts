import type { Mod, ModSource } from "./types";
import { appDataDir, join } from "@tauri-apps/api/path";
import { writeTextFile, readTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";

const MODS_URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json";
const MOD_LOCATIONS_URL = "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/modLocations.json";
const EXPORT_UPGRADES_URL = "https://browse.wf/warframe-public-export-plus/ExportUpgrades.json";
const DICT_RU_URL = "https://browse.wf/warframe-public-export-plus/dict.ru.json";

const EXTRA_SOURCES: Record<string, string> = {
    mission:   "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/missionRewards.json",
    sortie:    "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/sortieRewards.json",
    transient: "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/transientRewards.json",
    cetus:     "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/cetusBountyRewards.json",
    solaris:   "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/solarisBountyRewards.json",
    deimos:    "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/deimosRewards.json",
    relic:     "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/relics.json",
    syndicate: "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/syndicates.json",
};

export interface CachedData {
    buildDate: string;
    mods: Mod[];
}

export interface UpdateProgress {
    step: string;
    percent: number;
}

type ProgressCallback = (p: UpdateProgress) => void;

async function getCachePath(): Promise<string> {
    const dir = await appDataDir();
    return await join(dir, "warframe_mods_cache.json");
}

export async function loadCachedData(): Promise<CachedData | null> {
    try {
        const dir = await appDataDir();

        // Если папки нет, то и кэша нет
        if (!(await exists(dir))) return null;

        const path = await getCachePath();
        const raw = await readTextFile(path);
        const parsed = JSON.parse(raw) as CachedData;
        if (!parsed.mods || !Array.isArray(parsed.mods)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export async function clearCache(): Promise<void> {
    // Файл перезапишется при следующем сохранении
}

async function saveCache(data: CachedData): Promise<void> {
    try {
        const dir = await appDataDir();

        // Создаем директорию, если ее нет
        if (!(await exists(dir))) {
            await mkdir(dir, { recursive: true });
        }

        const path = await getCachePath();
        await writeTextFile(path, JSON.stringify(data));
    } catch (e) {
        console.error("Не удалось сохранить кэш на диск:", e);
    }
}

const NON_AUGMENT_COMPAT = new Set(["", "warframe", "aura", "any", "none", "mod", "unique", "primary", "secondary", "melee"]);

const PRIMARY_SUBTYPES: Record<string, string> = {
    "rifle": "Основное: Винтовки",
    "assault rifle": "Основное: Винтовки",
    "shotgun": "Основное: Дробовики",
    "sniper": "Основное: Снайперские",
    "bow": "Основное: Луки",
};

const SECONDARY_SUBTYPES: Record<string, string> = {
    "pistol": "Вторичное: Пистолеты",
    "tome": "Вторичное: Фолианты",
    "thrown": "Вторичное: Метательное",
};

const MELEE_SUBTYPES: Record<string, string> = {
    "sword": "Ближний бой: Мечи",
    "dual swords": "Ближний бой: Парные мечи",
    "heavy blade": "Ближний бой: Тяжёлые клинки",
    "polearm": "Ближний бой: Древковое",
    "polearms": "Ближний бой: Древковое",
    "staff": "Ближний бой: Посохи",
    "claws": "Ближний бой: Когти",
    "fist": "Ближний бой: Кулаки",
    "scythe": "Ближний бой: Косы",
    "nikana": "Ближний бой: Никаны",
    "two-handed nikana": "Ближний бой: Двуручные Никаны",
    "rapier": "Ближний бой: Рапиры",
    "glaive": "Ближний бой: Глефы",
    "glaives": "Ближний бой: Глефы",
    "hammer": "Ближний бой: Молоты",
    "whip": "Ближний бой: Плети",
    "whips": "Ближний бой: Плети",
    "gunblade": "Ближний бой: Ганблэйды",
    "blade and whip": "Ближний бой: Меч и Хлыст",
    "sword and shield": "Ближний бой: Мечи и Щиты",
    "tonfa": "Ближний бой: Тонфы",
    "warfan": "Ближний бой: Веера",
    "nunchaku": "Ближний бой: Нунчаки",
    "machete": "Ближний бой: Мачете",
    "assault saw": "Ближний бой: Штурмовые Пилы",
    "sparring": "Ближний бой: Спарринг",
    "dagger": "Ближний бой: Кинжалы",
    "daggers": "Ближний бой: Кинжалы",
    "dual daggers": "Ближний бой: Парные кинжалы",
    "thrown melee": "Ближний бой: Глефы",
    "ripkas": "Ближний бой: Когти",
    "furax": "Ближний бой: Кулаки",
    "ack & brunt": "Ближний бой: Мечи и Щиты",
    "silva & aegis": "Ближний бой: Мечи и Щиты",
    "jat kittag": "Ближний бой: Молоты",
    "skana": "Ближний бой: Мечи",
    "hate": "Ближний бой: Косы",
    "obex": "Ближний бой: Спарринг",
    "kestrel": "Ближний бой: Глефы",
    "dark dagger": "Ближний бой: Кинжалы",
    "dual cleavers": "Ближний бой: Парные мечи",
    "venato": "Ближний бой: Косы",
    "mire": "Ближний бой: Мечи",
    "prova": "Ближний бой: Мачете",
    "jaw sword": "Ближний бой: Мечи",
    "twin basolk": "Ближний бой: Парные мечи",
    "amanata": "Ближний бой: Никаны",
    "venka": "Ближний бой: Когти",
};

const UNIQUENAME_HINTS: [string, string][] = [
    ["/mods/rifle/", "Основное: Винтовки"],
    ["/mods/longgun/", "Основное: Винтовки"],
    ["/mods/shotgun/", "Основное: Дробовики"],
    ["/mods/bow/", "Основное: Луки"],
    ["/mods/sniper", "Основное: Снайперские"],
    ["/mods/pistol/", "Вторичное: Пистолеты"],
    ["/mods/dualpistol", "Вторичное: Парные пистолеты"],
    ["/mods/thrown/", "Вторичное: Метательное"],
    ["/mods/melee/", "Ближний бой: Общие"],
    ["/mods/warframe/", "Варфрейм: Обычные"],
    ["/mods/aura/", "Варфрейм: Ауры"],
    ["/mods/archwing/", "Арчвинг"],
    ["/mods/archgun/", "Арчвинг"],
    ["/mods/archmelee/", "Арчвинг"],
    ["/mods/necramech/", "Некрамех"],
    ["/mods/parazon/", "Прочее: Паразон"],
    ["/mods/companion/", "Компаньоны"],
    ["/mods/sentinel/", "Компаньоны"],
    ["/mods/beast/", "Компаньоны"],
    ["/mods/kdrive/", "K-Drive"],
    ["/mods/hoverboard/", "K-Drive"],
    ["/mods/antiques/", "Прочее: Артефакты Тектолиста"],
    ["/powersuits/", "Варфрейм: Аугменты"],
];

const SET_RE = /\/Sets\/([^/]+)\//i;

function extractSetName(uniqueName: string): string | null {
    const m = SET_RE.exec(uniqueName || "");
    return m ? m[1] : null;
}

function guessCategory(mod: any): string {
    const compat = String(mod.compatName ?? "").trim().toLowerCase();
    const t = String(mod.type ?? "").trim().toLowerCase();
    const un = String(mod.uniqueName ?? "").toLowerCase();

    if (t.includes("plexus") || t.includes("railjack")) return "Плексус";
    if (t.includes("archwing") || t.includes("arch-gun") || t.includes("arch-melee")) return "Арчвинг";
    if (t.includes("necramech")) return "Некрамех";
    if (t.includes("companion") || t.includes("sentinel") || t.includes("beast")) return "Компаньоны";
    if (t.includes("parazon")) return "Прочее: Паразон";
    if (t.includes("k-drive") || t.includes("kdrive") || t.includes("hoverboard")) return "K-Drive";
    if (t === "posture mod" || t.includes("stance")) return "Ближний бой: Стойки";
    if (t === "transmutation mod") return "Прочее: Трансмутация";
    if (t.includes("riven")) return "Прочее: Ривены";
    if (t === "tektolyst artifact mod") return "Прочее: Артефакты Тектолиста";
    if (t === "peculiar mod") return "Варфрейм: Особые";

    if (t === "warframe mod" || t.includes("aura") || compat === "aura") {
        if (compat === "aura") return "Варфрейм: Ауры";
        if (un.includes("exilus")) return "Варфрейм: Эксилус";
        if (compat && !NON_AUGMENT_COMPAT.has(compat)) return "Варфрейм: Аугменты";
        return "Варфрейм: Обычные";
    }

    if (t === "primary mod" || t === "shotgun mod") {
        if (PRIMARY_SUBTYPES[compat]) return PRIMARY_SUBTYPES[compat];
        if (compat && !NON_AUGMENT_COMPAT.has(compat) && !["primary", "unique", "any", "none"].includes(compat))
            return "Основное: Аугменты";
        return "Основное: Прочее";
    }

    if (t === "secondary mod") {
        if (SECONDARY_SUBTYPES[compat]) return SECONDARY_SUBTYPES[compat];
        if (compat && !NON_AUGMENT_COMPAT.has(compat) && compat !== "secondary")
            return "Вторичное: Аугменты";
        return "Вторичное: Прочее";
    }

    if (t === "melee mod") {
        if (compat === "melee") return "Ближний бой: Общие";
        if (MELEE_SUBTYPES[compat]) return MELEE_SUBTYPES[compat];
        if (compat && !NON_AUGMENT_COMPAT.has(compat)) return "Ближний бой: Аугменты";
        return "Ближний бой: Общие";
    }

    for (const [fragment, category] of UNIQUENAME_HINTS) {
        if (un.includes(fragment)) return category;
    }

    if (compat === "warframe" || compat === "aura") return "Варфрейм: Обычные";

    return "Прочее: Разное";
}

function dedupPriority(mod: any): number {
    const t = String(mod?.type ?? "").toLowerCase();
    const compat = String(mod?.compatName ?? "").trim().toLowerCase();
    if (t === "focus way") return 10;
    if (compat && compat !== "any" && compat !== "none") return 100;
    return 50;
}

const TAG_RE = /<[^>]+>/g;

function cleanEffect(text: string): string {
    if (!text) return text;
    let s = text.replace(TAG_RE, "");
    s = s.replace(/\\n/g, "\n");
    const lines = s.split("\n").map((line) => line.replace(/ +/g, " ").trim()).filter(Boolean);
    return lines.join("\n");
}

function extractEffects(levelStats: any[] | null | undefined): string[] {
    if (!levelStats || levelStats.length === 0) return [];
    const last = levelStats[levelStats.length - 1]?.stats ?? [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of last) {
        if (typeof e === "string" && !seen.has(e)) {
            seen.add(e);
            out.push(cleanEffect(e));
        }
    }
    return out;
}

function parseEnemyName(enemyName: string): { label: string; kind: "enemy" | "mission" } {
    if (enemyName.includes("/")) {
        const [planet, ...restParts] = enemyName.split("/");
        let rest = restParts.join("/").trim();

        let rot = "";
        const rotMatch = /Rotation\s+([ABC])/i.exec(rest);
        if (rotMatch) {
            rot = `ротация ${rotMatch[1].toUpperCase()}`;
            rest = rest.replace(/,?\s*Rotation\s+[ABC]/gi, "").trim();
        }

        let mtype = "";
        const typeMatch = /\(([^)]+)\)/.exec(rest);
        if (typeMatch) {
            mtype = typeMatch[1].trim();
            rest = rest.replace(/\s*\([^)]+\)/g, "").trim();
        }

        const node = rest.replace(/,$/, "").trim();
        const details = [mtype, rot].filter(Boolean);

        if (details.length > 0) {
            return { label: `${planet.trim()}: ${node} (${details.join(", ")})`, kind: "mission" };
        }
        return { label: `${planet.trim()}: ${node}`, kind: "mission" };
    }

    return { label: `Враг: ${enemyName}`, kind: "enemy" };
}

function canonicalSourceKey(source: string): string {
    const m = /^([^:]+):\s*([^(]+)/.exec(source);
    if (m) {
        const planet = m[1].trim().toLowerCase();
        const node = m[2].trim().toLowerCase();
        const rotMatch = /ротация\s+([ABC])/i.exec(source);
        const rotation = rotMatch ? rotMatch[1].toUpperCase() : "";
        return `${planet}:${node}:${rotation}`;
    }
    return source;
}

function buildModSources(raw: any[]): Record<string, ModSource[]> {
    const grouped: Record<string, Record<string, ModSource>> = {};
    for (const entry of raw) {
        const modName = entry?.modName;
        if (!modName) continue;
        for (const enemy of entry.enemies ?? []) {
            const enemyName = enemy?.enemyName ?? "Неизвестный враг";
            const chance = enemy?.chance;
            if (chance == null) continue;
            const { label, kind } = parseEnemyName(enemyName);
            const value: ModSource = {
                source: label,
                chance: Math.round(Number(chance) * 100) / 100,
                kind,
            };
            const key = canonicalSourceKey(label);
            grouped[modName] ??= {};
            const existing = grouped[modName][key];
            if (!existing || value.chance > existing.chance) {
                grouped[modName][key] = value;
            }
        }
    }
    const out: Record<string, ModSource[]> = {};
    for (const [name, sourcesMap] of Object.entries(grouped)) {
        out[name] = Object.values(sourcesMap).sort((a, b) => b.chance - a.chance);
    }
    return out;
}

function extractDropsFromMods(modsRaw: any[]): Record<string, ModSource[]> {
    const out: Record<string, ModSource[]> = {};
    for (const mod of modsRaw) {
        const name = mod?.name;
        const drops = mod?.drops;
        if (!name || !Array.isArray(drops)) continue;
        const list: ModSource[] = [];
        for (const d of drops) {
            const location = d?.location;
            const chance = d?.chance;
            const dropType = d?.type;
            if (dropType && dropType !== name) continue;
            if (!location || chance == null) continue;

            const { label, kind } = parseEnemyName(location);
            list.push({
                source: label,
                chance: Math.round(Number(chance) * 100) / 100,
                kind,
            });
        }
        if (list.length > 0) out[name] = list;
    }
    return out;
}

function getObtainHint(mod: any): string | null {
    const t = String(mod?.type ?? "").toLowerCase();
    const compat = String(mod?.compatName ?? "").toLowerCase();

    if (t === "tektolyst artifact mod") {
        return "Выпадает в миссиях The Perita Rebellion. После квеста The Old Peace продаётся у Marie в Sanctum Anatomica.";
    }
    if (t.includes("plexus") || t.includes("railjack")) {
        return "Мод для Плексуса. Выпадает в миссиях Рейлджека или покупается в Доке.";
    }
    if (t === "warframe mod" && compat && !NON_AUGMENT_COMPAT.has(compat) && compat !== "aura") {
        return "Продаётся за репутацию в синдикатах (Steel Meridian, Red Veil, Cephalon Suda и др.)";
    }
    if (t.includes("riven")) {
        return "Создаётся из Rivens через Transmutation или покупается у других игроков";
    }
    if (t === "transmutation mod") {
        return "Получается в результате трансмутации или из миссий";
    }
    if (mod?.tradable) {
        return "Можно купить или обменять у других игроков";
    }
    return null;
}

function formatPath(prefix: string, path: string[]): string {
    const clean = path.filter((p) => !["rewards", "items", "levels"].includes(p));
    if (clean.length === 0) return prefix;

    if (prefix === "relic") {
        return `Реликвия: ${clean.slice(0, 2).join(" ")}`;
    }
    if (prefix === "syndicate") {
        return `Синдикат: ${clean[0]}`;
    }

    const parts = clean.filter((p) => !["A", "B", "C"].includes(p)).slice(0, 2);
    let label = parts.length === 2 ? `${parts[0]}: ${parts[1]}` : (parts[0] ?? prefix);
    const rot = clean.find((p) => ["A", "B", "C"].includes(p));
    if (rot) label += ` (ротация ${rot})`;
    return label;
}

function unwrapRoot(data: any): any {
    if (data && typeof data === "object" && !Array.isArray(data)) {
        const keys = Object.keys(data);
        if (keys.length === 1 && (keys[0].toLowerCase().endsWith("rewards") || ["relics", "syndicates"].includes(keys[0].toLowerCase()))) {
            return data[keys[0]];
        }
    }
    return data;
}

function* iterRewardItems(
    node: any, prefix: string, path: string[], namesSet: Set<string>
): Generator<[string, string, number]> {
    if (node && typeof node === "object") {
        if (!Array.isArray(node)) {
            if (prefix === "relic" && "tier" in node && "relicName" in node) {
                path = [...path, node.tier, node.relicName];
            }
        }

        if (!Array.isArray(node) && "itemName" in node && "chance" in node) {
            const itemName = node.itemName;
            const chance = node.chance;
            if (typeof itemName === "string" && chance != null && namesSet.has(itemName)) {
                yield [itemName, formatPath(prefix, path), Math.round(Number(chance) * 100) / 100];
            }
            return;
        }
        if (Array.isArray(node)) {
            for (let idx = 0; idx < node.length; idx++) {
                const item = node[idx];
                let label = String(idx);
                if (item && typeof item === "object" && !Array.isArray(item)) {
                    for (const nk of ["name", "missionName", "relicName", "syndicateName", "bountyName", "itemName"]) {
                        if (typeof item[nk] === "string" && item[nk]) { label = item[nk]; break; }
                    }
                }
                yield* iterRewardItems(item, prefix, [...path, label], namesSet);
            }
        } else {
            for (const key of Object.keys(node)) {
                if (prefix === "relic" && ["tier", "relicName"].includes(key)) continue;
                yield* iterRewardItems(node[key], prefix, [...path, String(key)], namesSet);
            }
        }
    }
}

async function buildExtraSources(namesSet: Set<string>): Promise<Record<string, ModSource[]>> {
    const result: Record<string, ModSource[]> = {};
    for (const [kind, url] of Object.entries(EXTRA_SOURCES)) {
        try {
            const data = await fetchJson(url);
            const unwrapped = unwrapRoot(data);
            for (const [modName, source, chance] of iterRewardItems(unwrapped, kind, [], namesSet)) {
                (result[modName] ??= []).push({ source, chance, kind: kind as ModSource["kind"] });
            }
        } catch { /* пропускаем */ }
    }

    const final: Record<string, ModSource[]> = {};
    for (const [modName, sources] of Object.entries(result)) {
        const seen = new Map<string, ModSource>();
        for (const s of sources) {
            const key = canonicalSourceKey(s.source);
            const existing = seen.get(key);
            if (!existing || s.chance > existing.chance) seen.set(key, s);
        }
        final[modName] = Array.from(seen.values()).sort((a, b) => b.chance - a.chance);
    }
    return final;
}

function mergeSources(...lists: ModSource[][]): ModSource[] {
    const merged = new Map<string, ModSource>();
    for (const list of lists) {
        for (const s of list) {
            const key = canonicalSourceKey(s.source);
            const existing = merged.get(key);
            if (!existing) {
                merged.set(key, s);
            } else if (s.chance > existing.chance) {
                merged.set(key, s);
            } else if (s.chance === existing.chance && s.source.length > existing.source.length) {
                merged.set(key, s);
            }
        }
    }
    return Array.from(merged.values()).sort((a, b) => b.chance - a.chance);
}

function buildRuNames(
    exportUpgrades: Record<string, any>,
    dictRu: Record<string, string>
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [uniqueName, data] of Object.entries(exportUpgrades)) {
        const key = data?.name;
        if (!key) continue;
        const ru = dictRu[key];
        if (ru) out[uniqueName] = ru;
    }
    return out;
}

async function fetchJson(url: string): Promise<any> {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`${url}: ${r.status} ${r.statusText}`);
    return r.json();
}

export async function downloadAndBuildMods(onProgress?: ProgressCallback): Promise<CachedData> {
    const report = (step: string, percent: number) => onProgress?.({ step, percent });

    report("Скачиваю список модов…", 5);
    const modsRaw = (await fetchJson(MODS_URL)) as any[];

    report("Скачиваю локализацию…", 20);
    const exportUpgrades = (await fetchJson(EXPORT_UPGRADES_URL)) as Record<string, any>;
    const dictRu = (await fetchJson(DICT_RU_URL)) as Record<string, string>;

    report("Скачиваю данные о дропе…", 35);
    const locationsRaw = (await fetchJson(MOD_LOCATIONS_URL)) as any[] | { modLocations?: any[] };
    const locations: any[] = Array.isArray(locationsRaw)
        ? locationsRaw
        : locationsRaw.modLocations ?? [];

    report("Скачиваю дополнительные источники…", 50);

    const namesSet = new Set<string>();
    for (const mod of modsRaw) if (mod?.name) namesSet.add(mod.name);

    const modSources = buildModSources(locations);
    const extraSources = await buildExtraSources(namesSet);
    const dropsFromMods = extractDropsFromMods(modsRaw);
    const ruNames = buildRuNames(exportUpgrades, dictRu);

    report("Обрабатываю данные…", 75);

    const result: Mod[] = [];
    for (const mod of modsRaw) {
        const name = mod?.name;
        if (!name) continue;

        const nameLower = name.toLowerCase();
        if (nameLower.includes("sampleantique")) continue;

        if (String(mod?.type ?? "").toLowerCase() === "mod set mod") continue;
        if (String(mod?.type ?? "").toLowerCase() === "focus way") continue;

        const un = mod.uniqueName;
        const enemy = modSources[name] ?? [];
        const extra = extraSources[name] ?? [];
        const dropsMods = dropsFromMods[name] ?? [];

        result.push({
            name,
            nameRu: ruNames[un] ?? null,
            uniqueName: un,
            category: guessCategory(mod),
            type: mod.type ?? null,
            compatName: mod.compatName ?? null,
            rarity: mod.rarity ?? null,
            polarity: mod.polarity ?? null,
            baseDrain: mod.baseDrain ?? null,
            fusionLimit: mod.fusionLimit ?? null,
            modSet: extractSetName(un),
            imageName: mod.imageName ?? null,
            wikiaThumbnail: mod.wikiaThumbnail ?? null,
            tradable: Boolean(mod.tradable),
            effects: extractEffects(mod.levelStats),
            sources: mergeSources(enemy, extra, dropsMods),
            iconLocal: null,
            obtainHint: getObtainHint(mod),
        });
    }

    report("Дедупликация…", 90);

    const dedup = new Map<string, Mod>();
    for (const mod of result) {
        const existing = dedup.get(mod.name);
        if (!existing) { dedup.set(mod.name, mod); continue; }
        const newPrio = dedupPriority(mod);
        const oldPrio = dedupPriority(existing);
        if (newPrio > oldPrio) dedup.set(mod.name, mod);
        else if (newPrio === oldPrio && existing.sources.length === 0 && mod.sources.length > 0)
            dedup.set(mod.name, mod);
    }
    const finalMods = Array.from(dedup.values());

    finalMods.sort((a, b) => {
        const aHas = a.sources.length > 0 ? 0 : 1;
        const bHas = b.sources.length > 0 ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas;
        return a.name.localeCompare(b.name);
    });

    const buildDate = new Date().toISOString();
    report("Готово", 100);

    const cached: CachedData = { buildDate, mods: finalMods };
    await saveCache(cached);
    return cached;
}

export async function runUpdate(
    onProgress: ProgressCallback
): Promise<{ ok: true; data: CachedData } | { ok: false; error: string }> {
    try {
        const data = await downloadAndBuildMods(onProgress);
        return { ok: true, data };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}