import { getMaturityLabel } from '../maturity';

describe('maturity utils', () => {
  describe('getMaturityLabel', () => {
    it('should return correct label for low maturity', () => {
      expect(getMaturityLabel(0)).toBe('Inicial');
      expect(getMaturityLabel(25)).toBe('Inicial');
    });

    it('should return correct label for medium maturity', () => {
      expect(getMaturityLabel(26)).toBe('Intermediário');
      expect(getMaturityLabel(50)).toBe('Intermediário');
      expect(getMaturityLabel(75)).toBe('Intermediário');
    });

    it('should return correct label for high maturity', () => {
      expect(getMaturityLabel(76)).toBe('Avançado');
      expect(getMaturityLabel(100)).toBe('Avançado');
    });

    it('should handle edge cases', () => {
      expect(getMaturityLabel(-1)).toBe('Inicial');
      expect(getMaturityLabel(101)).toBe('Avançado');
    });
  });
}); 