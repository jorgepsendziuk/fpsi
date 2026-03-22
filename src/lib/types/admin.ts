export interface PoliticaModelo {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  ordem: number;
  secoes: PoliticaSecao[];
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PoliticaSecao {
  id: number;
  secao: string;
  titulo: string;
  descricao?: string;
  texto?: string;
}

export interface PoliticaPrograma {
  id: number;
  programa_id: number;
  tipo_politica: string;
  secoes: PoliticaSecao[];
  created_at: string;
  updated_at: string;
}
