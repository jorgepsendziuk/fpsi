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

interface Controle {
  id: number;
  nome: string;
  descricao: string;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
}

interface ControleComponentProps {
  controle: Controle;
  medidas: Medida[];
  onMedidaClick: (id: number) => void;
  onAddMedida: () => void;
  onEditControle: (controle: Controle) => void;
  onDeleteControle: (id: number) => void;
  loading?: boolean;
  error?: string;
}

export const ControleComponent: React.FC<ControleComponentProps> = ({
  controle,
  medidas,
  onMedidaClick,
  onAddMedida,
  onEditControle,
  onDeleteControle,
  loading,
  error,
}) => {
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>{controle.nome}</h2>
      <p>{controle.descricao}</p>
      <p>{controle.status === 'inativo' ? 'Inativo' : 'Ativo'}</p>
      
      <button onClick={() => onEditControle(controle)}>Editar</button>
      <button onClick={() => onDeleteControle(controle.id)}>Excluir</button>
      
      <div>
        <h3>Medidas</h3>
        <button onClick={onAddMedida}>Adicionar Medida</button>
        
        {medidas.length === 0 ? (
          <p>Nenhuma medida cadastrada</p>
        ) : (
          medidas.map((medida) => (
            <div key={medida.id} onClick={() => onMedidaClick(medida.id)}>
              {medida.nome}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 