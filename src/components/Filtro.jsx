import React from 'react';

function Filtro({ filter, setFilter }) {
  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="filtro-input-container">
        <input
            type="text"
            placeholder="Buscar..."
            value={filter}
            onChange={handleChange}
            className="form-control"
        /> 
    </div>
  );
}

export default Filtro;