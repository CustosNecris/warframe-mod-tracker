// Локализация отображаемых терминов.

const UI_STRINGS: Record<string, { en: string; ru: string }> = {
    search: { en: "Search by name or effect…", ru: "Поиск: имя или эффект…" },
    sort: { en: "Sort by", ru: "Сортировка" },
    sortNameAsc: { en: "Name (A → Z)", ru: "Имя (A → Z)" },
    sortNameDesc: { en: "Name (Z → A)", ru: "Имя (Z → A)" },
    sortRarityAsc: { en: "Rarity (Common → Legendary)", ru: "Редкость (Common → Legendary)" },
    sortRarityDesc: { en: "Rarity (Legendary → Common)", ru: "Редкость (Legendary → Common)" },
    sortChanceDesc: { en: "Drop chance (high → low)", ru: "Шанс дропа (высокий → низкий)" },
    sortChanceAsc: { en: "Drop chance (low → high)", ru: "Шанс дропа (низкий → высокий)" },
    sortRankDesc: { en: "Rank (high → low)", ru: "Ранг (высокий → низкий)" },
    onlyWithSources: { en: "Only with sources", ru: "Только с источниками" },
    searchEffects: { en: "Search in effects", ru: "Искать в эффектах" },
    hideOwned: { en: "Hide already owned", ru: "Скрыть уже имеющиеся" },
    wishlistFilter: { en: "Only wishlist (★)", ru: "Только желаемое (★)" },
    rarity: { en: "Rarity", ru: "Редкость" },
    all: { en: "All", ru: "Все" },
    common: { en: "Common", ru: "Обычные" },
    uncommon: { en: "Uncommon", ru: "Необычные" },
    rare: { en: "Rare", ru: "Редкие" },
    legendary: { en: "Legendary", ru: "Легендарные" },
    polarity: { en: "Polarity", ru: "Полярность" },
    polMadurai: { en: "Madurai", ru: "Мадурай" },
    polVazarin: { en: "Vazarin", ru: "Вазарин" },
    polNaramon: { en: "Naramon", ru: "Нарамон" },
    polZenurik: { en: "Zenurik", ru: "Зенурик" },
    polUmbra: { en: "Umbra", ru: "Умбра" },
    polPenjaga: { en: "Penjaga", ru: "Пенджага" },
    polUnairu: { en: "Unairu", ru: "Унайру" },
    polAny: { en: "Any", ru: "Любая" },
    cardSize: { en: "Card size", ru: "Размер карточек" },
    compact: { en: "Compact", ru: "Компакт" },
    normal: { en: "Normal", ru: "Обычный" },
    large: { en: "Large", ru: "Крупный" },
    resetFilters: { en: "↺ Reset filters", ru: "↺ Сбросить фильтры" },
    found: { en: "Found:", ru: "Найдено:" },
    of: { en: "of", ru: "из" },
    inCollection: { en: "In collection:", ru: "В коллекции:" },
    export: { en: "💾 JSON", ru: "💾 JSON" },
    exportCSV: { en: "📄 CSV", ru: "📄 CSV" },
    copyWishlist: { en: "📋 Copy ★", ru: "📋 Копировать ★" },
    import: { en: "📂 Import", ru: "📂 Импорт" },
    clearCollection: { en: "🗑️ Clear collection", ru: "🗑️ Очистить коллекцию" },
    updateData: { en: "🔄 Update data", ru: "🔄 Обновить данные" },
    updating: { en: "⏳ Updating…", ru: "⏳ Обновление…" },
    dataFrom: { en: "Data:", ru: "Данные:" },
    categories: { en: "Categories", ru: "Категории" },
    modalSource: { en: "Mods from source:", ru: "Моды из источника:" },
    modalFound: { en: "Found mods:", ru: "Найдено модов:" },
    modalHideOwned: { en: "Hide already owned", ru: "Скрыть уже имеющиеся" },
    modalEmpty: { en: "No mods to display.", ru: "Нет модов для отображения." },
    catWarframe: { en: "Warframe", ru: "Варфрейм" },
    catPrimary: { en: "Primary", ru: "Основное" },
    catSecondary: { en: "Secondary", ru: "Вторичное" },
    catMelee: { en: "Melee", ru: "Ближний бой" },
    catCompanions: { en: "Companions", ru: "Компаньоны" },
    catArchwing: { en: "Archwing", ru: "Арчвинг" },
    catNecramech: { en: "Necramech", ru: "Некрамех" },
    catPlexus: { en: "Plexus", ru: "Плексус" },
    catKDrive: { en: "K-Drive", ru: "K-Drive" },
    catSets: { en: "Mod sets", ru: "Моды сетов" },
    catOther: { en: "Other", ru: "Прочее" },
};

export function t(key: string, lang: "en" | "ru"): string {
    return UI_STRINGS[key]?.[lang] ?? key;
}

const CATEGORY_MAP_EN: Record<string, string> = {
    "Варфрейм": "Warframe",
    "Основное": "Primary",
    "Вторичное": "Secondary",
    "Ближний бой": "Melee",
    "Компаньоны": "Companions",
    "Арчвинг": "Archwing",
    "Некрамех": "Necramech",
    "Плексус": "Plexus",
    "K-Drive": "K-Drive",
    "Моды сетов": "Mod sets",
    "Прочее": "Other",
    "Аугменты": "Augments",
    "Ауры": "Auras",
    "Обычные": "Normal",
    "Особые": "Peculiar",
    "Стойки": "Stances",
    "Эксилус": "Exilus",
    "Винтовки": "Rifles",
    "Дробовики": "Shotguns",
    "Луки": "Bows",
    "Снайперские": "Snipers",
    "Метательное": "Thrown",
    "Пистолеты": "Pistols",
    "Фолианты": "Tomes",
    "Глефы": "Glaives",
    "Древковое": "Polearms",
    "Кинжалы": "Daggers",
    "Парные кинжалы": "Dual Daggers",
    "Плети": "Whips",
    "Когти": "Claws",
    "Общие": "General",
    "Ганблэйды": "Gunblades",
    "Меч и Хлыст": "Blade & Whip",
    "Мечи и Щиты": "Sword & Shield",
    "Нунчаки": "Nunchaku",
    "Двуручные Никаны": "Two-Handed Nikana",
    "Мачете": "Machete",
    "Штурмовые Пилы": "Assault Saw",
    "Спарринг": "Sparring",
    "Тонфы": "Tonfas",
    "Веера": "Warfans",
};

export function translateCategoryFull(name: string, lang: "en" | "ru"): string {
    if (lang === "ru" || !name) return name;
    return name.split(": ").map((part) => CATEGORY_MAP_EN[part] ?? part).join(": ");
}

const RARITY_RU: Record<string, string> = {
    common: "Обычный",
    uncommon: "Необычный",
    rare: "Редкий",
    legendary: "Легендарный",
    riven: "Рив",
};

const TYPE_RU: Record<string, string> = {
    "warframe mod": "Мод варфрейма",
    "aura mod": "Аура",
    "primary mod": "Мод основного оружия",
    "secondary mod": "Мод вторичного оружия",
    "melee mod": "Мод ближнего боя",
    "shotgun mod": "Мод дробовика",
    "stance mod": "Стойка",
    "posture mod": "Стойка",
    "companion mod": "Мод компаньона",
    "sentinel mod": "Мод стража",
    "sentinel weapon mod": "Мод оружия стража",
    "archwing mod": "Мод арчвинга",
    "arch-gun mod": "Мод арч-оружия",
    "arch-melee mod": "Мод арч-меча",
    "necramech mod": "Мод некрамеха",
    "parazon mod": "Мод паразона",
    "plexus mod": "Мод плексуса",
    "focus way": "Школа фокуса",
    "transmutation mod": "Мод трансмутации",
    "tektolyst artifact mod": "Артефакт Рейлджека",
    "mod set mod": "Мод сета",
    "k-drive mod": "Мод K-Drive",
    "riven mod": "Рив",
    "mod": "Мод",
};

const POLARITY_RU: Record<string, string> = {
    madurai: "Мадурай",
    vazarin: "Вазарин",
    naramon: "Нарамон",
    zenurik: "Зенурик",
    umbra: "Умбра",
    penjaga: "Пенджага",
    unairu: "Унайру",
    aura: "Аура",
};

const EFFECT_TERMS: Array<[RegExp, string]> = [
    [/\bCritical Hit Chance\b/g, "крит. шанс"],
    [/\bCritical Hit Damage\b/g, "крит. урон"],
    [/\bCritical Chance\b/g, "крит. шанс"],
    [/\bCritical Damage\b/g, "крит. урон"],
    [/\bStatus Chance\b/g, "шанс статуса"],
    [/\bStatus Duration\b/g, "длительность статуса"],
    [/\bReload Speed\b/g, "скорость перезарядки"],
    [/\bFire\/Charge Rate\b/g, "скорость атаки/заряда"],
    [/\bFire Rate\b/g, "скорострельность"],
    [/\bCharge Rate\b/g, "скорость заряда"],
    [/\bAttack Speed\b/g, "скорость атаки"],
    [/\bMagazine Capacity\b/g, "ёмкость магазина"],
    [/\bAmmo Maximum\b/g, "макс. боезапас"],
    [/\bAmmo Capacity\b/g, "ёмкость боезапаса"],
    [/\bAmmo Pickups\b/g, "подбираемые боеприпасы"],
    [/\bPunch Through\b/g, "пробитие"],
    [/\bHeadshot Kill\b/g, "убийство в голову"],
    [/\bHeadshot\b/g, "хедшот"],
    [/\bMovement Speed\b/g, "скорость передвижения"],
    [/\bParkour Velocity\b/g, "скорость паркура"],
    [/\bAim Glide\b/g, "планирование при прицеливании"],
    [/\bKnockdown Recovery\b/g, "восстановление после падения"],
    [/\bHolster Speed\b/g, "скорость смены оружия"],
    [/\bWeapon Swap\b/g, "смена оружия"],
    [/\bCombo Duration\b/g, "длительность комбо"],
    [/\bCombo Counter\b/g, "счётчик комбо"],
    [/\bHeavy Attack\b/g, "тяжёлая атака"],
    [/\bSlam Attack\b/g, "удар в землю"],
    [/\bFinisher Damage\b/g, "урон добивания"],
    [/\bAbility Strength\b/g, "сила способностей"],
    [/\bAbility Duration\b/g, "длительность способностей"],
    [/\bAbility Range\b/g, "радиус способностей"],
    [/\bAbility Efficiency\b/g, "эффективность способностей"],
    [/\bEnergy Max\b/g, "макс. энергия"],
    [/\bShield Recharge\b/g, "перезарядка щитов"],
    [/\bHealth Regen\b/g, "регенерация здоровья"],
    [/\bToxin Resistance\b/g, "сопротивление токсину"],
    [/\bHeat Resistance\b/g, "сопротивление огню"],
    [/\bCold Resistance\b/g, "сопротивление холоду"],
    [/\bElectricity Resistance\b/g, "сопротивление электричеству"],
    [/\bRadiation Resistance\b/g, "сопротивление радиации"],
    [/\bSlash Resistance\b/g, "сопротивление режущему урону"],
    [/\bImpact Resistance\b/g, "сопротивление ударному урону"],
    [/\bPuncture Resistance\b/g, "сопротивление пронзающему урону"],
    [/\bCorrosive Damage\b/g, "коррозийный урон"],
    [/\bSlash Damage\b/g, "режущий урон"],
    [/\bImpact Damage\b/g, "ударный урон"],
    [/\bPuncture Damage\b/g, "пронзающий урон"],
    [/\bToxin Damage\b/g, "урон токсином"],
    [/\bHeat Damage\b/g, "урон огнём"],
    [/\bCold Damage\b/g, "урон холодом"],
    [/\bBlast Damage\b/g, "урон взрывом"],
    [/\bMagnetic Damage\b/g, "магнитный урон"],
    [/\bRadiation Damage\b/g, "радиационный урон"],
    [/\bViral Damage\b/g, "вирусный урон"],
    [/\bMelee Damage\b/g, "урон ближнего боя"],
    [/\bWeapon Damage\b/g, "урон оружия"],
    [/\bDamage on Health\b/g, "урон по здоровью"],
    [/\bDamage\b/g, "урон"],
    [/\bSlash\b/g, "режущий"],
    [/\bImpact\b/g, "ударный"],
    [/\bPuncture\b/g, "пронзающий"],
    [/\bHeat\b/g, "огонь"],
    [/\bCold\b/g, "холод"],
    [/\bToxin\b/g, "токсин"],
    [/\bElectricity\b/g, "электричество"],
    [/\bViral\b/g, "вирус"],
    [/\bCorrosive\b/g, "коррозия"],
    [/\bRadiation\b/g, "радиация"],
    [/\bMagnetic\b/g, "магнит"],
    [/\bGas\b/g, "газ"],
    [/\bBlast\b/g, "взрыв"],
    [/\bResistance\b/g, "сопротивление"],
    [/\bArmor\b/g, "броня"],
    [/\bShields\b/g, "щиты"],
    [/\bShield\b/g, "щит"],
    [/\bHealth\b/g, "здоровье"],
    [/\bEnergy\b/g, "энергия"],
    [/\bStrength\b/g, "сила"],
    [/\bDuration\b/g, "длительность"],
    [/\bRange\b/g, "радиус"],
    [/\bEfficiency\b/g, "эффективность"],
    [/\bZoom\b/g, "прицеливание"],
    [/\bRecoil\b/g, "отдача"],
    [/\bMultishot\b/g, "мультивыстрел"],
    [/\bSlide\b/g, "скольжение"],
    [/\bRegeneration\b/g, "регенерация"],
    [/\bRecharge\b/g, "перезарядка"],
    [/\bDelay\b/g, "задержка"],
    [/\bEnemies\b/g, "враги"],
    [/\bEnemy\b/g, "враг"],
    [/\bAllies\b/g, "союзники"],
    [/\bSquad\b/g, "отряд"],
    [/\bCompanion\b/g, "компаньон"],
    [/\bSentinel\b/g, "страж"],
    [/\bKubrow\b/g, "кубрау"],
    [/\bKavat\b/g, "кават"],
    [/\bAura\b/g, "аура"],
    [/\bRank\b/g, "ранг"],
    [/\bper second\b/g, "в секунду"],
    [/\bper rank\b/g, "за ранг"],
];

function translateEffectString(text: string): string {
    let s = text;
    for (const [re, replacement] of EFFECT_TERMS) {
        s = s.replace(re, replacement);
    }
    s = s.replace(/ +/g, " ");
    return s;
}

export function translateRarity(rarity: string | null, lang: "en" | "ru"): string {
    if (!rarity) return "—";
    if (lang === "en") return rarity;
    return RARITY_RU[rarity.toLowerCase()] ?? rarity;
}

export function translateType(type: string | null, lang: "en" | "ru"): string {
    if (!type) return "—";
    if (lang === "en") return type;
    return TYPE_RU[type.toLowerCase()] ?? type;
}

export function translatePolarity(polarity: string | null, lang: "en" | "ru"): string {
    if (!polarity) return "—";
    if (lang === "en") return polarity;
    return POLARITY_RU[polarity.toLowerCase()] ?? polarity;
}

export function translateEffect(text: string, lang: "en" | "ru"): string {
    if (lang === "en") return text;
    return translateEffectString(text);
}

export function translateEffects(list: string[], lang: "en" | "ru"): string[] {
    if (lang === "en") return list;
    return list.map(translateEffectString);
}

const PLANETS_RU: Record<string, string> = {
    mercury: "Меркурий",
    venus: "Венера",
    earth: "Земля",
    mars: "Марс",
    phobos: "Фобос",
    deimos: "Деймос",
    ceres: "Церера",
    jupiter: "Юпитер",
    europa: "Европа",
    saturn: "Сатурн",
    uranus: "Уран",
    neptune: "Нептун",
    pluto: "Плутон",
    sedna: "Седна",
    eris: "Эрида",
    void: "Бездна",
    lua: "Луа",
    kuva: "Кува",
    zariman: "Зариман",
    hollvania: "Холвания",
};

const REGIONS_RU: Record<string, string> = {
    cetus: "Цетус",
    "orb vallis": "Орб Валлис",
    "cambion drift": "Камбион Дрифт",
    necralisk: "Некралиск",
    fortuna: "Фортуна",
    "sanctum anatomica": "Санктум Анатомика",
    duviri: "Дувири",
};

const FACTIONS_RU: Record<string, string> = {
    grineer: "Гринир",
    corpus: "Корпус",
    infested: "Заражённые",
    orokin: "Орокин",
    sentient: "Сентиенты",
    corrupted: "Порабощённые",
    narmer: "Нармер",
    murmur: "Шёпот",
    tenno: "Тэнно",
    holdfasts: "Хранители",
    entrati: "Энтрати",
    cavia: "Кавия",
    ostrons: "Остроны",
    "solaris united": "Солярис Объединённый",
};

function translateSourceString(source: string): string {
    let s = source;

    s = s.replace(/^([A-Za-z]+(?:\s[A-Za-z]+)*):/, (match, name) => {
        const lower = name.toLowerCase();
        if (PLANETS_RU[lower]) return `${PLANETS_RU[lower]}:`;
        if (REGIONS_RU[lower]) return `${REGIONS_RU[lower]}:`;
        return match;
    });

    for (const [en, ru] of Object.entries(FACTIONS_RU)) {
        const re = new RegExp(`\\b${en}\\b`, "gi");
        s = s.replace(re, ru);
    }

    return s;
}

export function translateSource(source: string, lang: "en" | "ru"): string {
    if (lang === "en") return source;
    return translateSourceString(source);
}