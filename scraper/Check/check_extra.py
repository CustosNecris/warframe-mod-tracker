import json
import requests

URLS = {
    "mission": "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/missionRewards.json",
    "relic":   "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/relicRewards.json",
    "sortie":  "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/sortieRewards.json",
}

for kind, url in URLS.items():
    print(f"\n========== {kind} ==========")
    try:
        r = requests.get(url, timeout=30)
        print("Статус:", r.status_code)
        if r.status_code != 200:
            continue
        data = r.json()
        print("Тип корня:", type(data).__name__)
        if isinstance(data, dict):
            print("Ключей верхнего уровня:", len(data))
            print("Первые 5 ключей:", list(data.keys())[:5])
            first_key = list(data.keys())[0]
            first_val = data[first_key]
            print(f"\nСтруктура '{first_key}':")
            print(json.dumps(first_val, ensure_ascii=False, indent=2)[:1500])
        elif isinstance(data, list):
            print("Элементов:", len(data))
            print("Первый элемент:")
            print(json.dumps(data[0], ensure_ascii=False, indent=2)[:1500])
    except Exception as e:
        print("Ошибка:", e)