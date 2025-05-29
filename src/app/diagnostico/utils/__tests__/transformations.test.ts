import { transformResponsavel, transformMedida, transformControle } from '../transformations';

describe('transformations', () => {
  describe('transformResponsavel', () => {
    it('should transform responsavel data correctly', () => {
      const responsavel = {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      };

      const result = transformResponsavel(responsavel);

      expect(result).toEqual({
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: new Date('2024-01-01'),
        data_atualizacao: new Date('2024-01-01'),
      });
    });

    it('should handle responsavel with missing optional fields', () => {
      const responsavel = {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
      };

      const result = transformResponsavel(responsavel);

      expect(result).toEqual({
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });

    it('should handle responsavel with invalid dates', () => {
      const responsavel = {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: 'data-invalida',
        data_atualizacao: 'data-invalida',
      };

      const result = transformResponsavel(responsavel);

      expect(result).toEqual({
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });
  });

  describe('transformMedida', () => {
    it('should transform medida data correctly', () => {
      const medida = {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      };

      const result = transformMedida(medida);

      expect(result).toEqual({
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: new Date('2024-01-01'),
        data_atualizacao: new Date('2024-01-01'),
      });
    });

    it('should handle medida with missing optional fields', () => {
      const medida = {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
      };

      const result = transformMedida(medida);

      expect(result).toEqual({
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });

    it('should handle medida with invalid dates', () => {
      const medida = {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: 'data-invalida',
        data_atualizacao: 'data-invalida',
      };

      const result = transformMedida(medida);

      expect(result).toEqual({
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });
  });

  describe('transformControle', () => {
    it('should transform controle data correctly', () => {
      const controle = {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      };

      const result = transformControle(controle);

      expect(result).toEqual({
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: new Date('2024-01-01'),
        data_atualizacao: new Date('2024-01-01'),
      });
    });

    it('should handle controle with missing optional fields', () => {
      const controle = {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
      };

      const result = transformControle(controle);

      expect(result).toEqual({
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });

    it('should handle controle with invalid dates', () => {
      const controle = {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: 'data-invalida',
        data_atualizacao: 'data-invalida',
      };

      const result = transformControle(controle);

      expect(result).toEqual({
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });
  });
}); 