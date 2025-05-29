import React from 'react';

function Tabla({ data }) {
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
              {headers.map((key, i) => (
                <td key={i}>{item[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tabla;
