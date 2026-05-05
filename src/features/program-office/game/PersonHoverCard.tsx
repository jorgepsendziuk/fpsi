"use client";

import type { OfficePersonSheetPayload } from "./OfficeExperienceContext";
import { GAME_RPG_FRAME } from "./gameTheme";
import { rpgPixelFont } from "./rpgGameFont";

/** Painel flutuante in-world (Html); estilo moldura do escritório RPG. */
export function PersonHoverCard({ payload }: { payload: OfficePersonSheetPayload }) {
  return (
    <div
      className={rpgPixelFont.className}
      style={{
        minWidth: 210,
        maxWidth: 300,
        padding: "12px 14px",
        background: "linear-gradient(180deg, #ebe4d8 0%, #ded8cf 55%, #d2c9bc 100%)",
        color: "#1a120c",
        border: GAME_RPG_FRAME.border,
        boxShadow: `${GAME_RPG_FRAME.boxShadow}, 0 10px 28px rgba(0,0,0,0.28)`,
        pointerEvents: "none",
        textAlign: "left",
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: 0.06,
          textTransform: "uppercase",
          marginBottom: payload.subtitle ? 4 : 8,
          wordBreak: "break-word",
        }}
      >
        {payload.title}
      </div>
      {payload.subtitle ? (
        <div
          style={{
            fontSize: 7,
            opacity: 0.82,
            marginBottom: 10,
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          {payload.subtitle}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {payload.rows.map((row) => (
          <div key={row.label}>
            <div
              style={{
                fontSize: 6,
                letterSpacing: 0.12,
                textTransform: "uppercase",
                color: "#5d4037",
                marginBottom: 3,
              }}
            >
              {row.label}
            </div>
            <div style={{ fontSize: 8, wordBreak: "break-word", color: "#2a1f14" }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
