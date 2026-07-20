/** Tokens visuais da landing — alinhados ao logo FPSI (azul, escudo verde, cadeado âmbar). */
export const landing = {
  ink: "#061525",
  navy: "#0A2744",
  blue: "#1565C0",
  blueBright: "#2196F3",
  shield: "#43A047",
  shieldDeep: "#2E7D32",
  lock: "#F9A825",
  mist: "#E8F1F8",
  paper: "#F5F8FB",
  text: "#0F2438",
  muted: "rgba(15, 36, 56, 0.68)",
  line: "rgba(15, 36, 56, 0.12)",
  heroText: "#F4F8FC",
  heroMuted: "rgba(244, 248, 252, 0.78)",
} as const;

export const featureAccents: Record<string, string> = {
  responsabilidades: "linear-gradient(145deg, #37474F 0%, #546E7A 100%)",
  diagnostico: "linear-gradient(145deg, #1B5E20 0%, #43A047 100%)",
  "planos-acao": "linear-gradient(145deg, #0D47A1 0%, #1E88E5 100%)",
  conformidade: "linear-gradient(145deg, #01579B 0%, #0288D1 100%)",
  politicas: "linear-gradient(145deg, #004D40 0%, #00897B 100%)",
  auditoria: "linear-gradient(145deg, #263238 0%, #455A64 100%)",
};
