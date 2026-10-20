import requests

BASE = "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/"

# Список возможных названий файлов
CANDIDATES = [
    "relicRewards.json",
    "relics.json",
    "syndicateRewards.json",
    "syndicates.json",
    "keyRewards.json",
    "resourceRewards.json",
    "blueprintRewards.json",
]

print("Проверка доступных файлов в WFCD drop-data:\n")

for filename in CANDIDATES:
    url = BASE + filename
    try:
        r = requests.head(url, timeout=10)
        if r.status_code == 200:
            print(f"✅ [200] {filename}")
        else:
            print(f"❌ [{r.status_code}] {filename}")
    except Exception as e:
        print(f"⚠️ [ERR] {filename} — {e}")