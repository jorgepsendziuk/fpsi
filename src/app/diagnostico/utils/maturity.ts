export const getMaturityLabel = (score: number): string => {
  if (score >= 80) return 'Avançado';
  if (score >= 50) return 'Intermediário';
  return 'Inicial';
}; 