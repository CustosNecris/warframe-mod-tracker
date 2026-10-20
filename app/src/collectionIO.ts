import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import type { Mod } from "./types";

export interface CollectionFile {
    version: 1;
    exportedAt: string;
    appVersion: string;
    owned: string[];
}

const FILE_VERSION = 1;
const APP_VERSION = "0.3.0";

export async function exportCollection(owned: Set<string>): Promise<string | null> {
    const filePath = await save({
        title: "Экспорт коллекции модов (JSON)",
        defaultPath: `warframe-mods-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) return null;

    const payload: CollectionFile = {
        version: FILE_VERSION,
        exportedAt: new Date().toISOString(),
        appVersion: APP_VERSION,
        owned: [...owned].sort(),
    };

    await writeTextFile(filePath, JSON.stringify(payload, null, 2));
    return filePath;
}

export async function exportCollectionCSV(owned: Set<string>, allMods: Mod[]): Promise<string | null> {
    const filePath = await save({
        title: "Экспорт коллекции модов (CSV)",
        defaultPath: `warframe-mods-${new Date().toISOString().slice(0, 10)}.csv`,
        filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (!filePath) return null;

    const ownedMods = allMods.filter((m) => owned.has(m.name));

    const esc = (val: string | number | null | undefined) => {
        const s = String(val ?? "").replace(/"/g, '""');
        return `"${s}"`;
    };

    const headers = ["Name (EN)", "Name (RU)", "Category", "Rarity", "Max Chance (%)", "Top 5 Sources"];
    const delimiter = ";";

    const lines: string[] = [headers.join(delimiter)];

    for (const m of ownedMods) {
        const maxChance = m.sources.length ? Math.max(...m.sources.map((s) => s.chance)) : 0;

        // Берем топ-5 и разделяем их переносом строки (\n)
        const topSources = m.sources.slice(0, 5);
        let sourcesStr = topSources.map((s) => `• ${s.source} (${s.chance}%)`).join("\n");
        if (m.sources.length > 5) {
            sourcesStr += `\n... и ещё ${m.sources.length - 5}`;
        }

        const chanceStr = maxChance > 0 ? String(maxChance).replace(".", ",") : "";

        lines.push([
            esc(m.name),
            esc(m.nameRu || ""),
            esc(m.category),
            esc(m.rarity || ""),
            chanceStr,
            esc(sourcesStr), // Функция esc() автоматически обернет переносы в кавычки
        ].join(delimiter));
    }

    const csvContent = "\uFEFF" + lines.join("\r\n"); // \r\n для правильных переносов в Windows

    await writeTextFile(filePath, csvContent);
    return filePath;
}

export async function importCollection(): Promise<string[] | null> {
    const selected = await open({
        title: "Импорт коллекции модов (JSON)",
        multiple: false,
        directory: false,
        filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!selected || typeof selected !== "string") return null;

    const content = await readTextFile(selected);
    const parsed = JSON.parse(content) as Partial<CollectionFile>;

    if (!parsed.owned || !Array.isArray(parsed.owned)) {
        throw new Error("Неверный формат файла: нет поля 'owned'.");
    }

    return parsed.owned.filter((x): x is string => typeof x === "string");
}