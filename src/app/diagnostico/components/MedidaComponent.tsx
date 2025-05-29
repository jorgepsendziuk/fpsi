import React from 'react';

interface Medida {
  id: number;
  nome: string;
  controle: number;
  programa: number;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
}

interface MedidaComponentProps {
  medida: Medida;
  onEditMedida: (medida: Medida) => void;
  onDeleteMedida: (id: number) => void;
  loading?: boolean;
  error?: string;
}

export const MedidaComponent: React.FC<MedidaComponentProps> = ({
  medida,
  onEditMedida,
  onDeleteMedida,
  loading,
  error,
}) => {
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>{medida.nome}</h3>
      <p>{medida.status === 'inativo' ? 'Inativo' : 'Ativo'}</p>
      <button onClick={() => onEditMedida(medida)}>Editar</button>
      <button onClick={() => onDeleteMedida(medida.id)}>Excluir</button>
    </div>
  );
}; 