import json
from collections import Counter

with open("../data/mods.json", encoding="utf-8") as f:
    d = json.load(f)

# 1. Что попало в «Варфрейм: Обычные» — какие типы?
print("=== Варфрейм: Обычные — типы и compatName ===")
c = Counter()
for m in d:
    if m["category"] == "Варфрейм: Обычные":
        c[(m["type"], m["compatName"])] += 1
for key, n in c.most_common(20):
    print(f"  {n:4}  type={key[0]!r:25} compat={key[1]!r}")

# 2. Что в «Ближний бой: Мечи» — какие compatName?
print("\n=== Ближний бой: Мечи — compatName ===")
c = Counter()
for m in d:
    if m["category"] == "Ближний бой: Мечи":
        c[m["compatName"]] += 1
for key, n in c.most_common(30):
    print(f"  {n:4}  {key!r}")

# 3. Есть ли моды с type="Mod Set Mod" (мы их отсеиваем?)
print("\n=== Проверка на Mod Set Mod в финале ===")
sets = [m for m in d if "set" in (m.get("type") or "").lower()]
print(f"  Найдено: {len(sets)}")
for m in sets[:10]:
    print(f"    {m['name']:30} | {m['type']} | {m['category']}")

# 4. Ауры — где они?
print("\n=== Аура-моды ===")
auras = [m for m in d if "aura" in (m.get("type") or "").lower() or
         (m.get("type") or "").lower() == "warframe mod" and "aura" in (m.get("compatName") or "").lower()]
print(f"  Найдено: {len(auras)}")
for m in auras[:15]:
    print(f"    {m['name']:30} | type={m['type']!r:25} | compat={m['compatName']!r}")