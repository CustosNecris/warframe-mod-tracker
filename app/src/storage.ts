const OWNED_KEY = "warframe-mods-owned";
const WISHLIST_KEY = "warframe-mods-wishlist";

export function loadOwned(): Set<string> {
    try {
        const raw = localStorage.getItem(OWNED_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as string[]);
    } catch {
        return new Set();
    }
}

export function saveOwned(owned: Set<string>) {
    localStorage.setItem(OWNED_KEY, JSON.stringify([...owned]));
}

export function loadWishlist(): Set<string> {
    try {
        const raw = localStorage.getItem(WISHLIST_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as string[]);
    } catch {
        return new Set();
    }
}

export function saveWishlist(wishlist: Set<string>) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]));
}