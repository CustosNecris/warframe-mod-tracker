import requests


def check(name, url):
    print(f"\n=== {name} ===")
    try:
        data = requests.get(url, timeout=15).json()
        # Разворачиваем корень, если он есть
        if isinstance(data, dict):
            key = list(data.keys())[0]
            data = data[key]

        if isinstance(data, list):
            print(f"Элементов: {len(data)}")
            first = data[0]
            print(f"Ключи первого элемента: {list(first.keys())}")

            # Ищем массив наград
            rewards = first.get("rewards") or first.get("items") or []
            if rewards:
                print(f"Пример награды: {rewards[0]}")
            else:
                print(f"Содержимое первого элемента: {first}")
        elif isinstance(data, dict):
            first_key = list(data.keys())[0]
            print(f"Первый ключ: {first_key}")
            print(f"Значение: {str(data[first_key])[:300]}...")
    except Exception as e:
        print(f"Ошибка: {e}")


check("relics", "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/relics.json")
check("syndicates", "https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/syndicates.json")