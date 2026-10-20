import { useMemo, useState } from "react";
import type { Mod } from "../types";
import { t, translateCategoryFull } from "../i18n";

interface Props {
    sourceLabel: string;
    mods: Mod[];
    owned: Set<string>;
    language: "en" | "ru";
    onClose: () => void;
    onOpenMod: (mod: Mod) => void;
}

export function SourceModsModal({
                                    sourceLabel,
                                    mods,
                                    owned,
                                    language,
                                    onClose,
                                    onOpenMod,
                                }: Props) {
    const [hideOwned, setHideOwned] = useState(false);

    const visible = useMemo(() => {
        let list = mods;
        if (hideOwned) list = list.filter((m) => !owned.has(m.name));
        return [...list].sort((a, b) => {
            const aChance = a.sources.find((s) => s.source === sourceLabel)?.chance ?? 0;
            const bChance = b.sources.find((s) => s.source === sourceLabel)?.chance ?? 0;
            return bChance - aChance;
        });
    }, [mods, hideOwned, owned, sourceLabel]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3 className="modal__title">
                        📍 {t("modalSource", language)} <span className="modal__source">{sourceLabel}</span>
                    </h3>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="modal__toolbar">
          <span className="modal__count">
            {t("modalFound", language)} {visible.length} {t("of", language)} {mods.length}
          </span>
                    <label className="modal__check">
                        <input
                            type="checkbox"
                            checked={hideOwned}
                            onChange={(e) => setHideOwned(e.target.checked)}
                        />
                        {t("modalHideOwned", language)}
                    </label>
                </div>

                <div className="modal__body">
                    {visible.length === 0 ? (
                        <p className="empty">{t("modalEmpty", language)}</p>
                    ) : (
                        visible.map((m) => {
                            const sourceData = m.sources.find((s) => s.source === sourceLabel);
                            const isOwned = owned.has(m.name);
                            const displayName = language === "ru" && m.nameRu ? m.nameRu : m.name;
                            return (
                                <div
                                    key={m.uniqueName ?? m.name}
                                    className={`source-mod-row ${isOwned ? "owned" : ""}`}
                                    onClick={() => onOpenMod(m)}
                                >
                                    <span className="source-mod-row__name">{displayName}</span>
                                    <span className="source-mod-row__category">{translateCategoryFull(m.category, language)}</span>
                                    <span className="source-mod-row__chance">
                    {sourceData ? `${sourceData.chance}%` : "—"}
                  </span>
                                    {isOwned && <span className="source-mod-row__owned">✔</span>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}