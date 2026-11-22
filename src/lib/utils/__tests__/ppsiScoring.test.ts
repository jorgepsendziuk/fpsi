import { describe, expect, it } from 'vitest';
import {
  calculateNacFromMedidas,
  getIndicadorMaturityLabel,
  getPesoNim,
} from '../ppsiScoring';

describe('ppsiScoring', () => {
  it('mapeia escala NIM gradual conforme IN 4/2026', () => {
    expect(getPesoNim(1, 2)).toBe(0);
    expect(getPesoNim(5, 2)).toBe(1);
    expect(getPesoNim(6, 2)).toBeNull();
  });

  it('calcula NAC como média das medidas aplicáveis', () => {
    const { nac } = calculateNacFromMedidas(
      [{ resposta: 4 }, { resposta: 5 }, { resposta: 6 }],
      2
    );
    expect(nac).toBeCloseTo(0.875);
  });

  it('usa faixas Tabela 6 para indicadores', () => {
    expect(getIndicadorMaturityLabel(0.2)).toBe('Inicial');
    expect(getIndicadorMaturityLabel(0.45)).toBe('Intermediário');
    expect(getIndicadorMaturityLabel(0.75)).toBe('Em aprimoramento');
    expect(getIndicadorMaturityLabel(0.95)).toBe('Aprimorado');
  });
});