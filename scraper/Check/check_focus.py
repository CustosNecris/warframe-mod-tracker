import json

with open("../data/mods.json", encoding="utf-8") as f:
    d = json.load(f)

print("=== Моды со словом 'Dash' в имени ===")
for m in d:
    if "dash" in m["name"].lower():
        print(f"  {m['name']:30} | {m['category']:10} | {m['uniqueName']}")

print("\n=== Первые 20 модов категории Фокус ===")
focus = [m for m in d if m["category"] == "Фокус"]
for m in focus[:20]:
    print(f"  {m['name']:30} | {m['uniqueName']}")

print("\n=== Моды с 'Bullet Jump' в эффектах ===")
for m in d:
    for e in m["effects"]:
        if "Bullet Jump" in e or "Jump" in e:
            print(f"  {m['name']:30} | {m['category']:10} | {m['uniqueName']}")
            break