import React from 'react';

function TablaPreturno({ data }) {
  if (!data.length) {
    return <h5 className="text-center">No hay datos para mostrar.</h5>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="table-wrapper mt-4">
      <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        {data.length} {data.length === 1 ? 'registro' : 'registros'}
      </p>
      <table className="table table-sm table-striped table-hover table-bordered shadow-lg">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {headers.map((key, i) => {
                const valor = item[key];
                const keyNormalizado = key.toLowerCase();

                // Detectar si la columna es de tipo link
                const esColumnaLink = keyNormalizado === "evaluación" || keyNormalizado === "preturno";

                return (
                  <td key={i}>
                    {esColumnaLink && typeof valor === "string" && valor.startsWith("http") ? (
                      <a href={valor} target="_blank" rel="noopener noreferrer">🔍 Ver</a>
                    ) : (
                      valor
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaPreturno;
