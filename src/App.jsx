import React, { useState, useEffect, useRef } from 'react';
import Filtro from './components/Filtro';
import Tabla from './components/Tabla';
import Botones from './components/Botones';
import ModalSubida from './components/SubirPreturno';
import Swal from 'sweetalert2';
import FiltroFecha from './components/filtroFecha';
import "./components/ModalSubida.css"
import TablaPreturno from './components/TablaRegistrosPreturno';

const ruta = import.meta.env.VITE_RUTA_BLK;
function App() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [vistaActual, setVistaActual] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState('');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (vista) => {
    try {
      const url =
        vista === 'preturno'
          ? ruta+'/registros'
          : ruta+'/preturno';
          
          

      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };


  const meses = {
    enero: '01',
    febrero: '02',
    marzo: '03',
    abril: '04',
    mayo: '05',
    junio: '06',
    julio: '07',
    agosto: '08',
    septiembre: '09',
    octubre: '10',
    noviembre: '11',
    diciembre: '12',
  };


  function fechaTextoAFechaISO(fechaTexto) {
    // fechaTexto
    const [fechaParte] = fechaTexto.split(' '); // "2025-mayo-28"
    const [anio, mesTexto, dia] = fechaParte.split('-');
    const mesNumero = meses[mesTexto.toLowerCase()];
    if (!mesNumero) return null; // mes no válido
    return `${anio}-${mesNumero}-${dia.padStart(2, '0')}`;
  }

  // Luego en el filtro
  const filteredData = data.filter(item => {
    const matchesText = Object.values(item).some(value =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    );

    const fechaISO = fechaTextoAFechaISO(item["fecha y hora"]);
    const matchesDate = fechaFiltro ? fechaISO === fechaFiltro : true;

    return matchesText && matchesDate;
  });

  const toggleVista = () => {
    const nuevaVista = vistaActual === 'preturno' ? 'registros' : 'preturno';
    setVistaActual(nuevaVista);
    fetchData(nuevaVista);
  };

  return (
    <div className="page-container">
      <header className="mb-4 text-center">
        <img src="/preturno-admin/bluelink_logo.png" alt="Encabezado" className="img-fluid mb-3" style={{ maxHeight: '80px' }} />
      </header>
      {/* Botón para añadir preturno */}
      <div style={{ marginTop: '30px' }} className="upload-container">
        <button onClick={() => setModalVisible(true)} className="btn-enviar">
          ➕ Añadir Preturno
        </button>
      </div>
      {/* Botón para alternar entre vistas */}
      <div style={{ marginTop: '30px' }} className="upload-container1">
        <button onClick={toggleVista} className="btn-enviar">
          {vistaActual === 'preturno' ? '👤 Seguimiento Analistas' : '📋 Registros Preturno'}
        </button>
      </div>
      <div className="full-width-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '8px',
            alignItems: 'center',  // Alineación vertical centrada
            width: '100%',
          }}
        >
          <div style={{ marginTop: '-10px', marginRight: '100px' }}>
            <Filtro filter={filter} setFilter={setFilter} />
          </div>
          <FiltroFecha fechaFiltro={fechaFiltro} setFechaFiltro={setFechaFiltro} />
        </div>
        {vistaActual === 'preturno' ? (
            <Tabla data={filteredData} />
          ) : (
            <TablaPreturno data={filteredData} />
          )}
        <Botones fetchData={fetchData} setFilter={setFilter} vistaActual={setVistaActual}/>
      </div>
      <footer className="text-center text-muted mt-5 mb-3">
        ©2025 Juan_DiegoDEV | ©MerzDEV | ©JormanDEV  Todos los derechos reservados.
      </footer>
      <ModalSubida visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
}

export default App;

