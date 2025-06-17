import { useState, useEffect } from 'react';
import { Controle } from '../../../app/diagnostico/types';

interface DiagnosticoControlesData {
  controles: Controle[];
  loading: boolean;
  error: string | null;
}

export const useDiagnosticoControles = (diagnosticoId: number) => {
  const [data, setData] = useState<DiagnosticoControlesData>({
    controles: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (diagnosticoId) {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call
      setTimeout(() => {
        setData({
          controles: [
            {
              id: 1,
              diagnostico: diagnosticoId,
              numero: 1,
              nome: `Controle ${diagnosticoId}`,
              texto: `Texto do controle ${diagnosticoId}`,
            },
          ],
          loading: false,
          error: null,
        });
      }, 1000);
    }
  }, [diagnosticoId]);

  const refetch = () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    // Refetch logic here
  };

  return { ...data, refetch };
}; 