import json
import collections

with open("../data/mods.json", encoding="utf-8") as f:
    d = json.load(f)

def dump(cat, limit=40):
    items = [m for m in d if m["category"] == cat]
    print(f"\n=== {cat} ({len(items)}) ===")
    for m in items[:limit]:
        print(f"  {m['name']:35} | {m['type']:25} | {m['compatName']}")

dump("Прочее")
dump("Основное: Специальное")
dump("Плексус: Интегрированные")

print("\n=== Тестовые/технические моды ===")
for m in d:
    low = m["name"].lower()
    if "sample" in low or "test" in low or "debug" in low:
        print(f"  {m['name']:35} | {m['type']:25} | {m['uniqueName']}")