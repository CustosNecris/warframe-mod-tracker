import json
import collections

with open("../data/mods.json", encoding="utf-8") as f:
    d = json.load(f)

all_chances = []
for m in d:
    for s in m["sources"]:
        all_chances.append((m["name"], s["chance"], s.get("kind", "?"), s["source"]))

print("=== Максимальные шансы ===")
for name, ch, kind, src in sorted(all_chances, key=lambda x: -x[1])[:10]:
    print(f"  {ch:8.2f}%  [{kind:8}]  {name}  ← {src}")

print("\n=== Минимальные шансы (ненулевые) ===")
nonzero = [(n, c, k, s) for n, c, k, s in all_chances if c > 0]
for name, ch, kind, src in sorted(nonzero, key=lambda x: x[1])[:10]:
    print(f"  {ch:8.2f}%  [{kind:8}]  {name}  ← {src}")

zeros = [(n, c, k, s) for n, c, k, s in all_chances if c == 0]
print(f"\nВсего с шансом 0%: {len(zeros)}")

kinds = collections.defaultdict(list)
for n, c, k, s in all_chances:
    kinds[k].append(c)

print("\n=== Статистика по типам ===")
for kind, values in sorted(kinds.items()):
    print(f"  {kind:10}: min={min(values):.3f}, max={max(values):.3f}, avg={sum(values)/len(values):.3f}, count={len(values)}")