"""
Сборщик данных о модах Warframe.
"""

import json
import logging
import re
import time
from collections import Counter, defaultdict
from pathlib import Path

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scraper")

MODS_URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json"
EXPORT_UPGRADES_URL = "https://browse.wf/warframe-public-export-plus/ExportUpgrades.json"
DICT_RU_URL = "https://browse.wf/warframe-public-export-plus/dict.ru.json"

MOD_LOCATIONS_URL = "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/modLocations.json"
EXTRA_SOURCES = {
    "mission":   "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/missionRewards.json",
    "sortie":    "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/sortieRewards.json",
    "transient": "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/transientRewards.json",
    "cetus":     "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/cetusBountyRewards.json",
    "solaris":   "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/solarisBountyRewards.json",
    "deimos":    "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/deimosRewards.json",
}

ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = DATA_DIR / "mods.json"
ICONS_DIR = DATA_DIR / "icons"

NON_AUGMENT_COMPAT = {
    "", "warframe", "aura", "any", "none", "mod",
    "unique", "primary", "secondary", "melee",
}

PRIMARY_SUBTYPES = {
    "rifle": "Основное: Винтовки",
    "assault rifle": "Основное: Винтовки",
    "shotgun": "Основное: Дробовики",
    "sniper": "Основное: Снайперские",
    "bow": "Основное: Луки",
}

SECONDARY_SUBTYPES = {
    "pistol": "Вторичное: Пистолеты",
    "tome": "Вторичное: Фолианты",
    "thrown": "Вторичное: Метательное",
}

MELEE_SUBTYPES = {
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
}

UNIQUENAME_HINTS = [
    ("/mods/rifle/", "Основное: Винтовки"),
    ("/mods/longgun/", "Основное: Винтовки"),
    ("/mods/shotgun/", "Основное: Дробовики"),
    ("/mods/bow/", "Основное: Луки"),
    ("/mods/sniper", "Основное: Снайперские"),
    ("/mods/pistol/", "Вторичное: Пистолеты"),
    ("/mods/dualpistol", "Вторичное: Парные пистолеты"),
    ("/mods/thrown/", "Вторичное: Метательное"),
    ("/mods/melee/", "Ближний бой: Общие"),
    ("/mods/warframe/", "Варфрейм: Обычные"),
    ("/mods/aura/", "Варфрейм: Ауры"),
    ("/mods/archwing/", "Арчвинг"),
    ("/mods/archgun/", "Арчвинг"),
    ("/mods/archmelee/", "Арчвинг"),
    ("/mods/necramech/", "Некрамех"),
    ("/mods/parazon/", "Прочее: Паразон"),
    ("/mods/companion/", "Компаньоны"),
    ("/mods/sentinel/", "Компаньоны"),
    ("/mods/beast/", "Компаньоны"),
    ("/mods/kdrive/", "K-Drive"),
    ("/mods/hoverboard/", "K-Drive"),
    ("/mods/antiques/", "Прочее: Артефакты Тектолиста"),
    ("/powersuits/", "Варфрейм: Аугменты"),
]

TAG_RE = re.compile(r"<[^>]+>")
SET_RE = re.compile(r"/Sets/([^/]+)/", re.IGNORECASE)

def _parse_enemy_name(enemy_name: str) -> tuple[str, str]:
    if "/" in enemy_name:
        parts = enemy_name.split("/", 1)
        planet = parts[0].strip()
        rest = parts[1].strip()

        rot = ""
        rot_match = re.search(r"Rotation\s+([ABC])", rest, re.IGNORECASE)
        if rot_match:
            rot = f"ротация {rot_match.group(1).upper()}"
            rest = re.sub(r",?\s*Rotation\s+[ABC]", "", rest, flags=re.IGNORECASE)

        mtype = ""
        type_match = re.search(r"\(([^)]+)\)", rest)
        if type_match:
            mtype = type_match.group(1).strip()
            rest = re.sub(r"\s*\([^)]+\)", "", rest)

        node = rest.strip().strip(',')
        details = [x for x in [mtype, rot] if x]

        if details:
            return f"{planet}: {node} ({', '.join(details)})", "mission"
        return f"{planet}: {node}", "mission"

    return f"Враг: {enemy_name}", "enemy"

def _canonical_source_key(source: str) -> str:
    m = re.match(r"^([^:]+):\s*([^(]+)", source)
    if m:
        planet = m.group(1).strip().lower()
        node = m.group(2).strip().lower()
        rot_match = re.search(r"ротация\s+([ABC])", source, re.IGNORECASE)
        rotation = rot_match.group(1).upper() if rot_match else ""
        return f"{planet}:{node}:{rotation}"
    return source

def _extract_set_name(unique_name: str) -> str | None:
    if not unique_name:
        return None
    m = SET_RE.search(unique_name)
    if m:
        return m.group(1)
    return None

def fetch_json(url: str):
    try:
        log.info("Скачиваю %s", url)
        r = requests.get(url, timeout=60)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log.warning("Не удалось скачать %s: %s", url, e)
        return None

def guess_category(mod: dict) -> str:
    compat = (mod.get("compatName") or "").strip().lower()
    t = (mod.get("type") or "").strip().lower()
    un = (mod.get("uniqueName") or "").lower()

    if "plexus" in t or "railjack" in t:
        return "Плексус"
    if "archwing" in t or "arch-gun" in t or "arch-melee" in t:
        return "Арчвинг"
    if "necramech" in t:
        return "Некрамех"
    if "companion" in t or "sentinel" in t or "beast" in t:
        return "Компаньоны"
    if "parazon" in t:
        return "Прочее: Паразон"
    if "k-drive" in t or "kdrive" in t or "hoverboard" in t:
        return "K-Drive"
    if t == "posture mod" or "stance" in t:
        return "Ближний бой: Стойки"
    if t == "mod set mod":
        return "Моды сетов"
    if t == "transmutation mod":
        return "Прочее: Трансмутация"
    if "riven" in t:
        return "Прочее: Ривены"
    if t == "tektolyst artifact mod":
        return "Прочее: Артефакты Тектолиста"
    if t == "peculiar mod":
        return "Варфрейм: Особые"

    if t == "warframe mod" or "aura" in t or compat == "aura":
        if compat == "aura":
            return "Варфрейм: Ауры"
        if "exilus" in un:
            return "Варфрейм: Эксилус"
        if compat and compat not in NON_AUGMENT_COMPAT:
            return "Варфрейм: Аугменты"
        return "Варфрейм: Обычные"

    if t == "primary mod" or t == "shotgun mod":
        if compat in PRIMARY_SUBTYPES:
            return PRIMARY_SUBTYPES[compat]
        if compat and compat not in NON_AUGMENT_COMPAT and compat not in ("primary", "unique", "any", "none"):
            return "Основное: Аугменты"
        return "Основное: Прочее"

    if t == "secondary mod":
        if compat in SECONDARY_SUBTYPES:
            return SECONDARY_SUBTYPES[compat]
        if compat and compat not in NON_AUGMENT_COMPAT and compat != "secondary":
            return "Вторичное: Аугменты"
        return "Вторичное: Прочее"

    if t == "melee mod":
        if compat == "melee":
            return "Ближний бой: Общие"
        if compat in MELEE_SUBTYPES:
            return MELEE_SUBTYPES[compat]
        if compat and compat not in NON_AUGMENT_COMPAT:
            return "Ближний бой: Аугменты"
        return "Ближний бой: Общие"

    for fragment, category in UNIQUENAME_HINTS:
        if fragment in un:
            return category

    if compat in ("warframe", "aura"):
        return "Варфрейм: Обычные"

    return "Прочее: Разное"

def clean_effect(text: str) -> str:
    if not text:
        return text
    text = TAG_RE.sub("", text)
    text = text.replace("\\n", "\n")
    lines = [re.sub(r" +", " ", line).strip() for line in text.split("\n")]
    lines = [line for line in lines if line]
    return "\n".join(lines)

def extract_effects(level_stats: list | None) -> list[str]:
    if not level_stats:
        return []
    last = level_stats[-1].get("stats") or []
    return [clean_effect(e) for e in last]

def build_mod_sources(mod_locations_raw: list[dict]) -> dict[str, list[dict]]:
    result: dict[str, list[dict]] = defaultdict(list)
    for entry in mod_locations_raw:
        mod_name = entry.get("modName")
        if not mod_name:
            continue
        for enemy in entry.get("enemies", []):
            enemy_name = enemy.get("enemyName", "Неизвестный враг")
            chance = enemy.get("chance")
            if chance is None:
                continue
            label, kind = _parse_enemy_name(enemy_name)
            result[mod_name].append({
                "source": label,
                "chance": round(float(chance), 2),
                "kind": kind,
            })

    final: dict[str, list[dict]] = {}
    for mod_name, sources in result.items():
        seen: dict[str, dict] = {}
        for s in sources:
            key = _canonical_source_key(s["source"])
            existing = seen.get(key)
            if not existing:
                seen[key] = s
            elif s["chance"] > existing["chance"]:
                seen[key] = s
            elif s["chance"] == existing["chance"] and len(s["source"]) > len(existing["source"]):
                seen[key] = s
        final[mod_name] = sorted(seen.values(), key=lambda x: -x["chance"])
    return final

def _extract_drops_from_mods(mods_raw: list[dict]) -> dict[str, list[dict]]:
    result: dict[str, list[dict]] = defaultdict(list)
    for mod in mods_raw:
        name = mod.get("name")
        drops = mod.get("drops")
        if not name or not isinstance(drops, list):
            continue
        for d in drops:
            location = d.get("location")
            chance = d.get("chance")
            drop_type = d.get("type")
            if drop_type and drop_type != name:
                continue
            if not location or chance is None:
                continue

            label, kind = _parse_enemy_name(location)
            result[name].append({
                "source": label,
                "chance": round(float(chance), 2),
                "kind": kind,
            })
    return dict(result)

def _get_obtain_hint(mod: dict) -> str | None:
    t = (mod.get("type") or "").lower()
    compat = (mod.get("compatName") or "").lower()

    if t == "tektolyst artifact mod":
        return "Выпадает в миссиях The Perita Rebellion. После квеста The Old Peace продаётся у Marie в Sanctum Anatomica."
    if "plexus" in t or "railjack" in t:
        return "Мод для Плексуса. Выпадает в миссиях Рейлджека или покупается в Доке."
    if t == "warframe mod" and compat and compat not in NON_AUGMENT_COMPAT and compat != "aura":
        return "Продаётся за репутацию в синдикатах (Steel Meridian, Red Veil, Cephalon Suda и др.)"
    if "riven" in t:
        return "Создаётся из Rivens через Transmutation или покупается у других игроков"
    if t == "transmutation mod":
        return "Получается в результате трансмутации или из миссий"
    if mod.get("tradable"):
        return "Можно купить или обменять у других игроков"
    return None

def _format_path(prefix: str, path: list[str]) -> str:
    clean = [p for p in path if p not in ("rewards", "items", "levels")]
    if not clean:
        return prefix

    if prefix == "relic":
        return f"Реликвия: {' '.join(clean[:2])}"

    if prefix == "syndicate":
        return f"Синдикат: {clean[0]}"

    parts = [p for p in clean if p not in ("A", "B", "C")][:2]
    label = ": ".join(parts) if len(parts) == 2 else (parts[0] if parts else prefix)
    rot = next((p for p in clean if p in ("A", "B", "C")), None)
    if rot:
        label += f" (ротация {rot})"
    return label

def _unwrap_root(data, kind: str):
    if isinstance(data, dict) and len(data) == 1:
        only_key = next(iter(data.keys()))
        if only_key.lower().endswith("rewards") or only_key.lower() in ("relics", "syndicates"):
            return data[only_key]
    return data

def _iter_reward_items(data, prefix: str, names_set: set[str]):
    def walk(node, path: list[str]):
        if isinstance(node, dict):
            if prefix == "relic" and "tier" in node and "relicName" in node:
                path = path + [node["tier"], node["relicName"]]

            if "itemName" in node and "chance" in node:
                item_name = node["itemName"]
                chance = node["chance"]
                if item_name in names_set and chance is not None:
                    label = _format_path(prefix, path)
                    yield item_name, label, round(float(chance), 2)
                return
            for key, value in node.items():
                if prefix == "relic" and key in ("tier", "relicName"):
                    continue
                yield from walk(value, path + [str(key)])
        elif isinstance(node, list):
            for idx, value in enumerate(node):
                label = str(idx)
                if isinstance(value, dict):
                    for name_key in ("name", "missionName", "relicName",
                                     "syndicateName", "bountyName", "itemName"):
                        v = value.get(name_key)
                        if isinstance(v, str) and v:
                            label = v
                            break
                yield from walk(value, path + [label])

    yield from walk(data, [])

def build_extra_sources(names_set: set[str]) -> dict[str, list[dict]]:
    result: dict[str, list[dict]] = defaultdict(list)
    for kind, url in EXTRA_SOURCES.items():
        data = fetch_json(url)
        if not data:
            log.warning("  %s: файл недоступен", kind)
            continue
        unwrapped = _unwrap_root(data, kind)
        count = 0
        for mod_name, label, chance in _iter_reward_items(unwrapped, kind, names_set):
            result[mod_name].append({
                "source": label,
                "chance": chance,
                "kind": kind,
            })
            count += 1
        log.info("  %s: найдено %d совпадений", kind, count)

    final: dict[str, list[dict]] = {}
    for mod_name, sources in result.items():
        seen: dict[str, dict] = {}
        for s in sources:
            key = _canonical_source_key(s["source"])
            existing = seen.get(key)
            if not existing or s["chance"] > existing["chance"]:
                seen[key] = s
        final[mod_name] = sorted(seen.values(), key=lambda x: -x["chance"])
    return final

def _merge_sources(*source_lists: list[dict]) -> list[dict]:
    merged: dict[str, dict] = {}
    for sources in source_lists:
        for s in sources:
            key = _canonical_source_key(s["source"])
            existing = merged.get(key)
            if not existing:
                merged[key] = s
            elif s["chance"] > existing["chance"]:
                merged[key] = s
            elif s["chance"] == existing["chance"] and len(s["source"]) > len(existing["source"]):
                merged[key] = s
    return sorted(merged.values(), key=lambda x: -x["chance"])

def _dedup_priority(mod: dict) -> int:
    t = (mod.get("type") or "").lower()
    compat = (mod.get("compatName") or "").strip().lower()

    if t == "focus way":
        return 10
    if compat and compat not in ("any", "none"):
        return 100
    return 50

def build_ru_names_map(export_upgrades: dict, dict_ru: dict[str, str]) -> dict[str, str]:
    result = {}
    for unique_name, data in export_upgrades.items():
        name_key = data.get("name")
        if not name_key:
            continue
        ru_name = dict_ru.get(name_key)
        if ru_name:
            result[unique_name] = ru_name
    return result

def build_final_dataset() -> list[dict]:
    mods_raw = fetch_json(MODS_URL)
    if not mods_raw:
        log.error("Не удалось получить Mods.json")
        return []
    log.info("Получено %d модов из Mods.json", len(mods_raw))

    export_upgrades = fetch_json(EXPORT_UPGRADES_URL) or {}
    dict_ru = fetch_json(DICT_RU_URL) or {}
    log.info("ExportUpgrades: %d, dict.ru: %d", len(export_upgrades), len(dict_ru))

    ru_names = build_ru_names_map(export_upgrades, dict_ru)
    log.info("Русских названий: %d", len(ru_names))

    mod_locations_raw = fetch_json(MOD_LOCATIONS_URL)
    mod_sources: dict[str, list[dict]] = {}
    if mod_locations_raw:
        if isinstance(mod_locations_raw, dict) and "modLocations" in mod_locations_raw:
            mod_locations_raw = mod_locations_raw["modLocations"]
        mod_sources = build_mod_sources(mod_locations_raw)
        log.info("Модов с источниками (modLocations): %d", len(mod_sources))

    names_set = {m["name"] for m in mods_raw if m.get("name")}
    extra_sources = build_extra_sources(names_set)
    log.info("Модов с доп. источниками: %d", len(extra_sources))

    drops_from_mods = _extract_drops_from_mods(mods_raw)
    log.info("Модов с drops из Mods.json: %d", len(drops_from_mods))

    result = []
    skipped = 0
    for mod in mods_raw:
        name = mod.get("name")
        if not name:
            continue

        name_lower = name.lower()
        if "sampleantique" in name_lower:
            skipped += 1
            continue

        if (mod.get("type") or "").lower() == "focus way":
            skipped += 1
            continue

        # Игнорируем технические моды сетов
        if (mod.get("type") or "").lower() == "mod set mod":
            skipped += 1
            continue

        un = mod.get("uniqueName")
        enemy = mod_sources.get(name, [])
        extra = extra_sources.get(name, [])
        drops_mods = drops_from_mods.get(name, [])
        merged = _merge_sources(enemy, extra, drops_mods)

        result.append({
            "name": name,
            "nameRu": ru_names.get(un),
            "uniqueName": un,
            "category": guess_category(mod),
            "type": mod.get("type"),
            "compatName": mod.get("compatName"),
            "rarity": mod.get("rarity"),
            "polarity": mod.get("polarity"),
            "baseDrain": mod.get("baseDrain"),
            "fusionLimit": mod.get("fusionLimit"),
            "modSet": _extract_set_name(un),
            "imageName": mod.get("imageName"),
            "wikiaThumbnail": mod.get("wikiaThumbnail"),
            "tradable": mod.get("tradable", False),
            "effects": extract_effects(mod.get("levelStats")),
            "sources": merged,
            "obtainHint": _get_obtain_hint(mod),
            "iconLocal": None,
        })

    log.info("Пропущено технических: %d", skipped)

    dedup: dict[str, dict] = {}
    for mod in result:
        existing = dedup.get(mod["name"])
        if existing is None:
            dedup[mod["name"]] = mod
            continue
        new_prio = _dedup_priority(mod)
        old_prio = _dedup_priority(existing)
        if new_prio > old_prio:
            dedup[mod["name"]] = mod
        elif new_prio == old_prio and not existing["sources"] and mod["sources"]:
            dedup[mod["name"]] = mod
    result = list(dedup.values())

    result.sort(key=lambda m: (not m["sources"], m["name"]))
    return result

def download_icons(dataset: list[dict]) -> None:
    ICONS_DIR.mkdir(exist_ok=True)
    total = len(dataset)
    ok = skip = fail = no_url = 0

    for i, mod in enumerate(dataset, 1):
        raw = mod["uniqueName"] or mod["name"]
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", raw)
        local_name = f"{safe}.png"
        local_path = ICONS_DIR / local_name

        if local_path.exists() and local_path.stat().st_size > 0:
            mod["iconLocal"] = local_name
            skip += 1
            continue

        url = mod.get("wikiaThumbnail")
        if not url and mod.get("imageName"):
            url = f"https://cdn.warframestat.us/img/{mod['imageName']}"
        if not url:
            mod["iconLocal"] = None
            no_url += 1
            continue

        try:
            r = requests.get(url, timeout=20)
            r.raise_for_status()
            local_path.write_bytes(r.content)
            mod["iconLocal"] = local_name
            ok += 1
        except Exception as e:
            log.debug("Не скачал %s: %s", url, e)
            mod["iconLocal"] = None
            fail += 1

        if i % 100 == 0:
            log.info("  Прогресс %d/%d (скачано=%d, уже было=%d, без URL=%d, ошибок=%d)",
                     i, total, ok, skip, no_url, fail)
        time.sleep(0.03)

    log.info("Иконки: скачано=%d, уже было=%d, без URL=%d, ошибок=%d",
             ok, skip, no_url, fail)

def main() -> None:
    log.info("=== Старт ===")
    dataset = build_final_dataset()
    if not dataset:
        log.error("Пусто — выход")
        return

    log.info("Скачиваю иконки...")
    download_icons(dataset)

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    with_sources = sum(1 for m in dataset if m["sources"])
    with_effects = sum(1 for m in dataset if m["effects"])
    with_icons = sum(1 for m in dataset if m.get("iconLocal"))
    with_ru = sum(1 for m in dataset if m.get("nameRu"))
    with_hint = sum(1 for m in dataset if m.get("obtainHint"))
    with_set = sum(1 for m in dataset if m.get("modSet"))

    log.info("=== Готово ===")
    log.info("Всего модов: %d", len(dataset))
    log.info("С источниками: %d", with_sources)
    log.info("С эффектами: %d", with_effects)
    log.info("С иконками: %d", with_icons)
    log.info("С русскими именами: %d", with_ru)
    log.info("С подсказками: %d", with_hint)
    log.info("В сетах: %d", with_set)

    log.info("Категории:")
    cat_counts = Counter(m["category"] for m in dataset)
    for name, count in sorted(cat_counts.items(), key=lambda x: (-x[1], x[0])):
        log.info("  %-35s %d", name, count)

    log.info("Файл: %s", OUTPUT_FILE)

if __name__ == "__main__":
    main()