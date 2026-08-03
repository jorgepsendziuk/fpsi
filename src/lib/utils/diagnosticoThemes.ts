/** Identidade visual dos 4 eixos do diagnóstico (alinhado ao programa / landing). */
export type DiagnosticoTheme = {
  gradient: string;
  color: string;
  accent: string;
  softBg: string;
};

export const DIAGNOSTICO_THEMES: Record<number, DiagnosticoTheme> = {
  1: {
    gradient: "linear-gradient(135deg, #37474F 0%, #607D8B 100%)",
    color: "#607D8B",
    accent: "#78909C",
    softBg: "rgba(96, 125, 139, 0.1)",
  },
  2: {
    gradient: "linear-gradient(135deg, #0A2744 0%, #1565C0 100%)",
    color: "#1565C0",
    accent: "#2196F3",
    softBg: "rgba(21, 101, 192, 0.1)",
  },
  3: {
    gradient: "linear-gradient(135deg, #004D40 0%, #00897B 100%)",
    color: "#00897B",
    accent: "#26A69A",
    softBg: "rgba(0, 137, 123, 0.1)",
  },
  4: {
    gradient: "linear-gradient(135deg, #4527A0 0%, #7E57C2 100%)",
    color: "#7E57C2",
    accent: "#9575CD",
    softBg: "rgba(126, 87, 194, 0.1)",
  },
};

export function getDiagnosticoTheme(id: number): DiagnosticoTheme {
  return (
    DIAGNOSTICO_THEMES[id] ?? {
      gradient: "linear-gradient(135deg, #1565C0 0%, #2196F3 100%)",
      color: "#1565C0",
      accent: "#2196F3",
      softBg: "rgba(21, 101, 192, 0.1)",
    }
  );
}
