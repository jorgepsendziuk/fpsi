import type { CadastroSnapshot } from "@/lib/politicas/politicaSugestoes";

export type CulturaFormato = "slides" | "cartaz" | "quiz" | "email";

export type CulturaKit = {
  id: CulturaFormato;
  titulo: string;
  descricao: string;
  /** HTML imprimível / copiável */
  html: string;
};

function esc(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const CULTURA_TRILHAS = [
  { id: "onboarding", label: "Onboarding LGPD" },
  { id: "phishing", label: "Phishing e senhas" },
  { id: "direitos", label: "Direitos do titular" },
  { id: "incidente", label: "Como reportar incidente" },
  { id: "fornecedores", label: "Terceiros e operadores" },
] as const;

export function buildCulturaKits(snap: CadastroSnapshot, trilha = "onboarding"): CulturaKit[] {
  const org = esc(snap.orgao || "a organização");
  const dpo = esc(snap.dpoNome || "o Encarregado (DPO)");
  const canal = esc(snap.canalTitular || "o Portal do Titular do programa");
  const riscos = (snap.riscosAltos || []).slice(0, 5);
  const processos = snap.processos.slice(0, 6);
  const politicasHint = "políticas publicadas no programa";
  const fornecedores = snap.fornecedores.slice(0, 5).map((f) => f.nome);

  const slidesHtml = `
<article class="kit-slides">
  <section><h1>Cultura de privacidade — ${org}</h1><p>Trilha: ${esc(trilha)}</p></section>
  <section><h2>Quem é o Encarregado?</h2><p>${dpo}${snap.dpoEmail ? ` · ${esc(snap.dpoEmail)}` : ""}</p><p>Canal do titular: ${canal}</p></section>
  <section><h2>O que tratamos aqui</h2><ul>${processos.map((p) => `<li>${esc(p)}</li>`).join("") || "<li>Complete o mapeamento de dados.</li>"}</ul></section>
  <section><h2>Riscos desta casa</h2><ul>${riscos.map((r) => `<li>${esc(r)}</li>`).join("") || "<li>Ainda não há riscos altos cadastrados.</li>"}</ul></section>
  <section><h2>O que fazer se algo der errado</h2><p>Não tente “resolver sozinho”: registre o incidente no programa e avise ${dpo}.</p></section>
</article>`;

  const cartazHtml = `
<aside class="kit-cartaz">
  <h1>Seus dados importam — ${org}</h1>
  <p>Para exercer seus direitos (acesso, correção, exclusão e outros do art. 18 da LGPD):</p>
  <p><strong>${canal}</strong></p>
  <p>Encarregado: <strong>${dpo}</strong></p>
</aside>`;

  const quizPerguntas = [
    {
      q: `Quem é o Encarregado de ${org}?`,
      a: snap.dpoNome || "O encarregado nomeado no programa (art. 41 da LGPD).",
    },
    {
      q: "O titular pode pedir acesso ou correção dos dados?",
      a: "Sim. Art. 18 da LGPD — use o canal oficial.",
    },
    {
      q: "Se um e-mail pedir senha ou PIX urgente, o que fazer?",
      a: "Não clicar. Validar por outro canal e reportar ao GSI/DPO.",
    },
    {
      q: processos[0]
        ? `O processo “${processos[0]}” trata dados pessoais?`
        : "Por que mapear processos?",
      a: processos[0]
        ? "Se estiver no mapeamento/ROPA, sim — siga a finalidade e a base legal registradas."
        : "Para cumprir o art. 37 e saber finalidade, base legal e compartilhamentos.",
    },
    {
      q: "Um fornecedor pode usar os dados para finalidade própria?",
      a: "Não. O operador segue instruções do controlador (art. 39) e o contrato deve ter cláusulas.",
    },
  ];

  const quizHtml = `<section class="kit-quiz"><h1>Quiz — ${org}</h1><ol>${quizPerguntas
    .map(
      (p, i) =>
        `<li><p><strong>${i + 1}. ${esc(p.q)}</strong></p><p>Gabarito: ${esc(p.a)}</p></li>`
    )
    .join("")}</ol></section>`;

  const emailHtml = `
<div class="kit-email">
  <p>Olá,</p>
  <p>Estamos reforçando a cultura de privacidade em <strong>${org}</strong> (PPSI Controle 14 / art. 41 §2º III da LGPD).</p>
  <p>Encarregado: ${dpo}. Canal: ${canal}.</p>
  ${riscos.length ? `<p>Atenção especial nesta semana:</p><ul>${riscos.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
  ${fornecedores.length ? `<p>Fornecedores no radar: ${esc(fornecedores.join(", "))}.</p>` : ""}
  <p>Consulte as ${esc(politicasHint)} e, em dúvida, fale com o Encarregado antes de compartilhar dados.</p>
</div>`;

  return [
    {
      id: "slides",
      titulo: "Slides (reunião / mural digital)",
      descricao: "Cinco telas com DPO, processos, riscos e incidente.",
      html: slidesHtml,
    },
    {
      id: "cartaz",
      titulo: "Cartaz / one-pager",
      descricao: "Canal do titular e Encarregado.",
      html: cartazHtml,
    },
    {
      id: "quiz",
      titulo: "Quiz (5 perguntas)",
      descricao: "Gabarito para reunião ou e-mail.",
      html: quizHtml,
    },
    {
      id: "email",
      titulo: "Texto de campanha",
      descricao: "Intranet ou e-mail interno.",
      html: emailHtml,
    },
  ];
}
