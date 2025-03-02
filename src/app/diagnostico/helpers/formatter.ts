/**
 * Utility functions for data formatting
 */

export const sanitizeCNPJ = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 14);
};

export const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

export const getEntityInitial = (program: any, orgaos: any[]) => {
  if (program.setor === 2 && program.razao_social) {
    // For private sector, use company name
    return program.razao_social.charAt(0).toUpperCase();
  } else if (program.setor !== 2 && program.orgao) {
    // For public sector with selected organization
    const matchingOrg = orgaos.find(org => org.id === program.orgao);
    if (matchingOrg?.nome) {
      return matchingOrg.nome.charAt(0).toUpperCase();
    }
  }
  // Default fallback to program ID
  return program.id.toString();
};
