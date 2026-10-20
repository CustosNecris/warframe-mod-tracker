import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

export interface MarketPrice {
    avg: number;
    min: number;
    max: number;
    volume: number; // Количество проданных за 48ч
}

export function getUrlName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

async function fetchJson(url: string) {
    const res = await tauriFetch(url, {
        method: "GET",
        headers: {
            "Platform": "pc",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });

    if (!res.ok) {
        console.error(`[Market] Ошибка API (${res.status}): ${url}`);
        return null;
    }
    return res.json();
}

export async function fetchMarketPrice(modName: string): Promise<MarketPrice | null> {
    const urlName = getUrlName(modName);
    const statsUrl = `https://api.warframe.market/v1/items/${urlName}/statistics`;

    try {
        const statsData = await fetchJson(statsUrl);
        if (!statsData) return null;

        const stats = statsData.payload?.statistics_closed;
        if (!stats) return null;

        const recent = stats["48hours"]?.length > 0 ? stats["48hours"] : stats["90days"];
        if (!recent || recent.length === 0) return null;

        const latest = recent[recent.length - 1];

        return {
            avg: Math.round(latest.avg_price),
            min: Math.round(latest.min_price),
            max: Math.round(latest.max_price),
            volume: latest.volume,
        };
    } catch (e) {
        console.error("[Market] Критическая ошибка:", e);
        return null;
    }
}