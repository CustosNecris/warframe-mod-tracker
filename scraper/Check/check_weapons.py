import json
from collections import Counter, defaultdict

with open("../data/mods.json", encoding="utf-8") as f:
    d = json.load(f)

# Все уникальные пары (type, compatName) для оружейных модов
print("=== Все type / compatName для оружейных категорий ===\n")

combos = Counter()
for m in d:
    t = (m.get("type") or "").lower()
    if any(k in t for k in ["primary", "secondary", "melee", "shotgun", "arch", "necramech"]):
        combos[(m.get("type"), m.get("compatName"))] += 1

for (t, c), n in sorted(combos.items(), key=lambda x: (-x[1], x[0][0] or "")):
    print(f"  {n:5}  type={t!r:30} compat={c!r}")

print("\n\n=== Уникальные compatName для БЛИЖНЕГО БОЯ (melee mod) ===\n")
melee_compat = Counter()
for m in d:
    if (m.get("type") or "").lower() == "melee mod":
        melee_compat[m.get("compatName")] += 1
for c, n in sorted(melee_compat.items(), key=lambda x: -x[1]):
    print(f"  {n:5}  {c!r}")

print("\n\n=== Уникальные compatName для ОСНОВНОГО ===\n")
primary_compat = Counter()
for m in d:
    if (m.get("type") or "").lower() in ("primary mod", "shotgun mod"):
        primary_compat[m.get("compatName")] += 1
for c, n in sorted(primary_compat.items(), key=lambda x: -x[1]):
    print(f"  {n:5}  {c!r}")

print("\n\n=== Уникальные compatName для ВТОРИЧНОГО ===\n")
secondary_compat = Counter()
for m in d:
    if (m.get("type") or "").lower() == "secondary mod":
        secondary_compat[m.get("compatName")] += 1
for c, n in sorted(secondary_compat.items(), key=lambda x: -x[1]):
    print(f"  {n:5}  {c!r}")