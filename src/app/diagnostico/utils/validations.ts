import { Responsavel, Medida, Controle } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateResponsavel = (responsavel: Partial<Responsavel>): ValidationResult => {
  const errors: string[] = [];

  if (!responsavel.nome || responsavel.nome.trim() === '') {
    errors.push('Nome é obrigatório');
  }

  if (!responsavel.email || responsavel.email.trim() === '') {
    errors.push('Email é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavel.email)) {
    errors.push('Email deve ter um formato válido');
  }

  if (!responsavel.departamento || responsavel.departamento.trim() === '') {
    errors.push('Departamento é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMedida = (medida: Partial<Medida>): ValidationResult => {
  const errors: string[] = [];

  if (!medida.medida || medida.medida.trim() === '') {
    errors.push('Medida é obrigatória');
  }

  if (!medida.descricao || medida.descricao.trim() === '') {
    errors.push('Descrição é obrigatória');
  }

  if (medida.resposta !== undefined && (medida.resposta < 0 || medida.resposta > 100)) {
    errors.push('Resposta deve estar entre 0 e 100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateControle = (controle: Partial<Controle>): ValidationResult => {
  const errors: string[] = [];

  if (!controle.nome || controle.nome.trim() === '') {
    errors.push('Nome é obrigatório');
  }

  if (!controle.texto || controle.texto.trim() === '') {
    errors.push('Texto é obrigatório');
  }

  if (!controle.diagnostico) {
    errors.push('Diagnóstico é obrigatório');
  }

  if (!controle.numero || controle.numero <= 0) {
    errors.push('Número deve ser maior que zero');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 