# Feature: Escritório de governança (camada visual)

Código da experiência **Escritório de governança** — mesa PPSI 2.0, quadros, folhas, comitês, salas por departamento.

- **Documentação:** [docs/essentials/features/OFFICE_RPG_GOVERNANCA.md](../../../docs/essentials/features/OFFICE_RPG_GOVERNANCA.md)
- **Rota:** `src/app/programas/[id]/escritorio/page.tsx` (fina; só monta `ProgramOfficeShell`).
- **Interface jogo** (`game/`):
  - `OfficeGameScene.tsx` — sala completa (parede, piso, mesa, comités, corredor).
  - `GameCorridorStrip.tsx` — corredor horizontal com portas por departamento.
  - `GameHudBar.tsx` — barra inferior (dicas PPSI + atalhos).
  - `GameHotspot.tsx` — bonecos na mesa.
  - `gameHints.ts` — textos educativos rotativos por `programa.id`.
  - `gameTheme.ts` — paleta / sombras.
  - `index.ts` — reexports.
- **Modos:** toggle **Jogo** | **Lista** (preferência em `localStorage`: `fpsi-program-office-ui-mode`).
- **Regra:** o núcleo do app não importa isto exceto pelo hub e pela rota fina.
