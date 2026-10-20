import json

with open("../data/mods.json", encoding="utf-8") as f:
    d = json.load(f)

def show(name, limit=15):
    m = next((x for x in d if x["name"] == name), None)
    if not m:
        print(f"{name}: не найден")
        return
    print(f"\n=== {name} ({len(m['sources'])} источников) ===")
    for s in m["sources"][:limit]:
        print(f"  {s['chance']:8.2f}%  [{s.get('kind', '?'):8}]  {s['source']}")

show("Serration")
show("Agile Aim", 5)
show("Vitality", 10)
show("Split Chamber", 10)

all_chances = [s["chance"] for m in d for s in m["sources"]]
print(f"\n=== Общая статистика ===")
print(f"Всего источников: {len(all_chances)}")
print(f"Максимум: {max(all_chances):.2f}%")
print(f"Минимум (ненулевой): {min(c for c in all_chances if c > 0):.2f}%")
print(f"Среднее: {sum(all_chances)/len(all_chances):.2f}%")

print("\n=== Топ-5 максимальных ===")
top = sorted(((s["chance"], m["name"], s["source"]) for m in d for s in m["sources"]), reverse=True)[:5]
for ch, name, src in top:
    print(f"  {ch:8.2f}%  {name}  ← {src}")