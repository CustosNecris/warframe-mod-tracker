import type { Mod } from "../types";
import { ModCard } from "./ModCard";

interface Props {
    mods: Mod[];
    owned: Set<string>;
    wishlist: Set<string>;
    language: "en" | "ru";
    query?: string;
    onToggleOwned: (name: string) => void;
    onToggleWishlist: (name: string) => void;
    onOpen: (mod: Mod) => void;
}

export function ModGrid({
                            mods, owned, wishlist, language, query = "", onToggleOwned, onToggleWishlist, onOpen,
                        }: Props) {
    if (mods.length === 0) return <p className="empty">Ничего не найдено.</p>;

    return (
        <div className="mod-grid">
            {mods.map((m) => (
                <ModCard
                    key={m.uniqueName ?? m.name}
                    mod={m}
                    owned={owned.has(m.name)}
                    wishlisted={wishlist.has(m.name)}
                    language={language}
                    query={query}
                    onToggleOwned={onToggleOwned}
                    onToggleWishlist={onToggleWishlist}
                    onOpen={onOpen}
                />
            ))}
        </div>
    );
}