import React from 'react';

interface Programa {
  id: number;
  nome: string;
  descricao: string;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
}

interface ProgramaComponentProps {
  programa: Programa;
  onEditPrograma: (programa: Programa) => void;
  onDeletePrograma: (id: number) => void;
  loading?: boolean;
  error?: string;
}

const ProgramaComponent: React.FC<ProgramaComponentProps> = ({
  programa,
  onEditPrograma,
  onDeletePrograma,
  loading,
  error,
}) => {
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>{programa.nome}</h2>
      <p>{programa.descricao}</p>
      <p>{programa.status === 'inativo' ? 'Inativo' : 'Ativo'}</p>
      <button onClick={() => onEditPrograma(programa)}>Editar</button>
      <button onClick={() => onDeletePrograma(programa.id)}>Excluir</button>
    </div>
  );
};

export default ProgramaComponent; 