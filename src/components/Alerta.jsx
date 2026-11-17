'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AlertaContext = createContext(null);

export function AlertaProvider({ children }) {
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    if (!alerta) return;

    const timer = setTimeout(() => setAlerta(null), 2800);
    return () => clearTimeout(timer);
  }, [alerta]);

  const value = useMemo(
    () => ({
      showAlert: (mensagem, tipo = 'info') => setAlerta({ mensagem, tipo }),
    }),
    []
  );

  return (
    <AlertaContext.Provider value={value}>
      {children}
      {alerta && (
        <div className={`alerta-container alerta-${alerta.tipo}`} role="alert" aria-live="assertive">
          <span className="alerta-icon">
            {alerta.tipo === 'success' ? '✓' : alerta.tipo === 'error' ? '!' : 'i'}
          </span>
          <span className="alerta-text">{alerta.mensagem}</span>
        </div>
      )}
    </AlertaContext.Provider>
  );
}

export function useAlerta() {
  const context = useContext(AlertaContext);

  if (!context) {
    throw new Error('useAlerta deve ser usado dentro de um AlertaProvider');
  }

  return context;
}
