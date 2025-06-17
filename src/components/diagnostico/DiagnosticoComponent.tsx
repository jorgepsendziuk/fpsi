import React from 'react';
import { Diagnostico, Controle } from '../../app/diagnostico/types';

interface DiagnosticoComponentProps {
  diagnostico: Diagnostico;
  controles: Controle[];
  onControleClick: (id: number) => void;
  onAddControle: () => void;
  onEditDiagnostico: (diagnostico: Diagnostico) => void;
  onDeleteDiagnostico: (id: number) => void;
  loading?: boolean;
  error?: string;
}

export const DiagnosticoComponent: React.FC<DiagnosticoComponentProps> = ({
  diagnostico,
  controles,
  onControleClick,
  onAddControle,
  onEditDiagnostico,
  onDeleteDiagnostico,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>{diagnostico.descricao}</h2>
      <button onClick={() => onAddControle()}>Adicionar Controle</button>
      <button onClick={() => onEditDiagnostico(diagnostico)}>Editar</button>
      <button onClick={() => onDeleteDiagnostico(diagnostico.id)}>Excluir</button>
      
      {controles.length === 0 ? (
        <p>Nenhum controle cadastrado</p>
      ) : (
        <ul>
          {controles.map((controle) => (
            <li key={controle.id} onClick={() => onControleClick(controle.id)}>
              {controle.nome}
              <p>{controle.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiagnosticoComponent; 