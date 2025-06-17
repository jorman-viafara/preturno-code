import React, { useState } from 'react';
import Swal from 'sweetalert2';

const ruta = import.meta.env.VITE_RUTA_BLK;
const gruposDisponibles = ['RedColsa', 'Estategias'];
function Botones({ fetchData, setFilter }) {
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla si la modal esta abierta
    const [cedula, setCedula] = useState('');
    const [nombre, setNombre] = useState('');
    const [grupo, setGrupo] = useState('');

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

    // Cierra la modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        limpiarCampos()
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

    return (
        <div>
            <div className="botones-container">
                <button onClick={handleActualizar} className="btn-azul">
                    Actualizar
                </button>
                <button onClick={handleAgregar} className="btn-verde">
                    Agregar Usuario
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
