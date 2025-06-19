import React, { useState } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ruta = import.meta.env.VITE_RUTA_BLK;
const gruposDisponibles = ['RedColsa', 'Estategias'];

function Botones({ fetchData, setFilter }) {
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla si la modal esta abierta
    const [cedula, setCedula] = useState('');
    const [nombre, setNombre] = useState('');
    const [grupo, setGrupo] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [isMassiveModalOpen, setIsMassiveModalOpen] = useState(false);

    const handleActualizar = () => {
        setFilter('');      // Limpia el filtro
        fetchData(vistaActual);        // Refresca los datos
    };


    const limpiarCampos = () => {
        setCedula("")
        setNombre("")
        setGrupo("")
    }

    // Abre la modal
    const handleAgregar = () => {
        setIsModalOpen(true);
    };

    const handleAgregarMasivo = () => {
        setIsMassiveModalOpen(true);
    };

    // Cierra la modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        limpiarCampos()
    };

    const handleCloseMassiveModal = () => {
        setIsMassiveModalOpen(false);
        setArchivo(null);
        setGrupo('');
    };

    const validarCedula = (cedula) => {
        const regex = /^\d{8,11}$/;
        return regex.test(cedula);
    };

    // Enviar formulario
    const handleSubmit = async () => {
        if (!validarCedula(cedula)) {
            popup('Error', 'El número de identificación debe tener entre 8 y 11 números y solo contener dígitos', 'error', false);
            return;
        }

        if (nombre.trim() === '') {
            popup('Error', 'El nombre no puede estar vacío', 'error', false);
            return;
        }
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre.trim())) {
            popup('Error', 'El nombre solo debe contener letras y espacios', 'error', false);
            return;
        }
        if (grupo.trim() === '') {
            popup('Error', 'El grupo  no puede estar vacío, si no pertenece a ningun grupo digite "NINGUNO"', 'error', false);
            return;
        }

        const response = await fetch(ruta + '/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cedula, nombre, grupo }),
        });

        const data = await response.json();
        if (response.ok) {
            popup('Registro exitoso', 'Usuario agregado exitosamente', 'success', true);
            fetchData();  // Actualiza la tabla de datos si es necesario
            setIsModalOpen(false);  // Cierra la modal
        } else {
            popup('Error', 'Error al agregar usuario', 'warning', false);
        }   
    };
    // Genera y descarga una plantilla Excel con columnas predeterminadas para cedula y nombre
    const handleExcelTemplateDownload = () => {
        const ws = XLSX.utils.json_to_sheet([{ cedula: '', nombre: '' }]);
         // Ajuste de ancho de columnas
        ws['!cols'] = [
            { wch: 15 }, // cedula
            { wch: 40 }  // nombre
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PlantillaUsuarios');
        XLSX.writeFile(wb, 'plantilla_usuarios.xlsx');
    };
    // Guarda el archivo Excel seleccionado por el usuario para su posterior procesamiento
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setArchivo(file);
    };

    const handleMassiveSubmit = async () => {
        if (!archivo || grupo.trim() === '') {
            return popup('Error', 'Archivo o grupo faltante', 'error');
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            for (const row of rows) {
                if (!row.cedula || !row.nombre) continue;
                await fetch(ruta + '/agregar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cedula: row.cedula, nombre: row.nombre, grupo })
                });
            }

            popup('Éxito', 'Usuarios cargados correctamente', 'success');
            fetchData();
            handleCloseMassiveModal();
        };

        reader.readAsArrayBuffer(archivo);
    };

    return (
        <div>
            <div className="botones-container">
                <button onClick={handleActualizar} className="btn-azul">
                    Actualizar
                </button>
                <button onClick={handleAgregar} className="btn-verde">
                    Agregar Usuario Manualmente
                </button>
                <button onClick={handleAgregarMasivo} className="btn-verde">
                    Agregar Usuario Masivamente
                </button> 
            </div> 

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-superposicion">
                    <div className="contenido-modal">
                        <h3>Agregar Usuario</h3>

                        <label>Número de identificación:</label>
                        <input
                            type="text"
                            placeholder="Ingresa el número de identificación..."
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            className="entrada-modal"
                            pattern="^\d{8,11}$" required
                        />


                        <label>Nombres y apellidos:</label>
                        <input
                            type="text"
                            placeholder="Ingresa nombres y apellidos..."
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="entrada-modal"
                            required
                        />
                        <label>Grupo:</label>
                        <select
                            type="text"
                            placeholder="Grupo"
                            value={grupo}
                            onChange={(e) => setGrupo(e.target.value)}
                            className="entrada-modal"
                        >

                            <option value="">Selecciona un grupo</option>
                            {gruposDisponibles.map((nombreGrupo, index) => (
                                <option key={index} value={nombreGrupo}>
                                    {nombreGrupo}
                                </option>
                            ))}
                        </select>



                        <div className="botones-modal">
                            <button className="btn-enviar" onClick={handleSubmit}>
                                ✓ Enviar
                            </button>
                            <button
                                className="btn-cancelar"
                                onClick={handleCloseModal}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isMassiveModalOpen && (
                <div className="modal-superposicion">
                    <div className="contenido-modal">
                        <h3>Insertar Usuarios Masivamente</h3>
                        <p>1. Descarga la plantilla y abrela.</p>
                        <p>2. Pega todos los usuarios de un mismo grupo, en la columna nombre poner nombres y apellidos en mayuscula y guarda el archivo.</p>
                        <p>3. Sube el archivo en "Seleccionar archivo" y elige el grupo al que pertenecen los usuarios de ese archivo.</p>
                        <p>4. Por ultimo click en Enviar.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <button onClick={handleExcelTemplateDownload} className="btn-verde">Descargar Plantilla</button>
                        </div>
                        <br />
                        <div>
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="entrada-modal" />
                        </div>
                        <br />
                        <select value={grupo} onChange={(e) => setGrupo(e.target.value)} className="entrada-modal">
                            <option value="">Selecciona un grupo</option>
                            {gruposDisponibles.map((g, i) => <option key={i} value={g}>{g}</option>)}
                        </select>
                        <div className="botones-modal">
                            <button onClick={handleMassiveSubmit} className="btn-enviar">✓ Enviar</button>
                            <button onClick={handleCloseMassiveModal} className="btn-cancelar">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
function popup(title, text, icon, draggable = true) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        draggable: draggable
    });
};


export default Botones;
