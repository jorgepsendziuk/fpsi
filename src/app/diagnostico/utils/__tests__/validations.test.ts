import { validateResponsavel, validateMedida, validateControle } from '../validations';

describe('validations', () => {
  describe('validateResponsavel', () => {
    it('should validate a valid responsavel', () => {
      const responsavel = {
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate responsavel with missing required fields', () => {
      const responsavel = {
        nome: '',
        email: '',
        cargo: '',
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome é obrigatório',
        email: 'Email é obrigatório',
        cargo: 'Cargo é obrigatório',
      });
    });

    it('should validate responsavel with invalid email', () => {
      const responsavel = {
        nome: 'Responsável Teste',
        email: 'email-invalido',
        cargo: 'Analista',
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        email: 'Email inválido',
      });
    });

    it('should validate responsavel with long fields', () => {
      const responsavel = {
        nome: 'a'.repeat(256),
        email: 'teste@exemplo.com',
        cargo: 'a'.repeat(256),
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome deve ter no máximo 255 caracteres',
        cargo: 'Cargo deve ter no máximo 255 caracteres',
      });
    });
  });

  describe('validateMedida', () => {
    it('should validate a valid medida', () => {
      const medida = {
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate medida with missing required fields', () => {
      const medida = {
        nome: '',
        controle: 0,
        programa: 0,
        status: '',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome é obrigatório',
        controle: 'Controle é obrigatório',
        programa: 'Programa é obrigatório',
        status: 'Status é obrigatório',
      });
    });

    it('should validate medida with invalid status', () => {
      const medida = {
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'status-invalido',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        status: 'Status inválido',
      });
    });

    it('should validate medida with long fields', () => {
      const medida = {
        nome: 'a'.repeat(256),
        controle: 1,
        programa: 1,
        status: 'ativo',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome deve ter no máximo 255 caracteres',
      });
    });
  });

  describe('validateControle', () => {
    it('should validate a valid controle', () => {
      const controle = {
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate controle with missing required fields', () => {
      const controle = {
        nome: '',
        descricao: '',
        status: '',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome é obrigatório',
        descricao: 'Descrição é obrigatória',
        status: 'Status é obrigatório',
      });
    });

    it('should validate controle with invalid status', () => {
      const controle = {
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'status-invalido',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        status: 'Status inválido',
      });
    });

    it('should validate controle with long fields', () => {
      const controle = {
        nome: 'a'.repeat(256),
        descricao: 'a'.repeat(1001),
        status: 'ativo',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome deve ter no máximo 255 caracteres',
        descricao: 'Descrição deve ter no máximo 1000 caracteres',
      });
    });
  });
}); 