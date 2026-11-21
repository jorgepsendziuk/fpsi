import type { CadastroSnapshot } from "@/lib/politicas/politicaSugestoes";

export type NossaCasa = {
  orgao: string;
  dpoNome: string;
  dpoEmail: string;
  canal: string;
  processos: string[];
  riscos: string[];
  fornecedores: string[];
};

export function buildNossaCasa(snap: CadastroSnapshot): NossaCasa {
  return {
    orgao: snap.orgao || "a organização",
    dpoNome: snap.dpoNome || "Encarregado indicado no programa",
    dpoEmail: snap.dpoEmail || "",
    canal: snap.canalTitular || "Portal do titular do programa",
    processos: (snap.processos || []).slice(0, 5),
    riscos: (snap.riscosAltos || []).slice(0, 5),
    fornecedores: (snap.fornecedores || []).slice(0, 5).map((f) => f.nome),
  };
}
