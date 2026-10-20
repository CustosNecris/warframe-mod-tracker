import json
import requests

URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json"
print("Скачиваю RAW Mods.json...")
data = requests.get(URL, timeout=60).json()
print(f"Всего записей: {len(data)}")

print("\n=== Все 'Lightning Dash' в RAW ===")
for m in data:
    if m.get("name") == "Lightning Dash":
        print(json.dumps({
            "name": m.get("name"),
            "uniqueName": m.get("uniqueName"),
            "type": m.get("type"),
            "compatName": m.get("compatName"),
            "rarity": m.get("rarity"),
        }, indent=2, ensure_ascii=False))

print("\n=== Все моды с 'Parkour' в uniqueName ===")
for m in data:
    un = (m.get("uniqueName") or "").lower()
    if "parkour" in un:
        print(f"  {m.get('name'):30} | {m.get('type'):20} | {m.get('uniqueName')}")