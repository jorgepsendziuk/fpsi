import { useEffect } from 'react';

export const useControleMedidas = (
  controleId: number,
  state: any,
  handleMedidaFetch: (controleId: number, programaId: number) => void,
  handleMedidaChange: (controleId: number, programaId: number, medidaId: number, field: string, value: any) => void
) => {
  useEffect(() => {
    if (controleId) {
      handleMedidaFetch(controleId, 1); // Assuming programa ID is 1 for now
    }
  }, [controleId, handleMedidaFetch]);

  const medidas = state.medidas?.[controleId] || [];

  return medidas.map((medida: any) => ({
    ...medida,
    handleChange: (field: string, value: any) => {
      handleMedidaChange(controleId, 1, medida.id, field, value);
    },
  }));
}; 