"use client"

import { useState, useRef } from "react"
import Swal from "sweetalert2"
import "./ModalSubida.css"

const ruta = import.meta.env.VITE_RUTA_BLK;

const gruposDisponibles = ['RedColsa', 'Estategias'];
const ModalSubida = ({ visible, onClose }) => {
  const [grupo, setgrupo] = useState("")
  const [cliente, setCliente] = useState("")
  const [campania, setCampania] = useState("")
  const [link, setLink] = useState("")
  const fileInputRef = useRef(null)


  const limpiarCampos = () => {
    setgrupo("")
    setCliente("")
    setCampania("")
    setLink("")
    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
  }

  const handleSubmit = async () => {
    const file = fileInputRef.current.files[0]

    if (!grupo || !cliente || !campania || !file || !link) {
      Swal.fire("Campos requeridos", "Por favor completa todos los campos y selecciona un archivo.", "warning")
      return
    }
    try {
      new URL(link)
    } catch (_) {
      Swal.fire("Link inválido", "Por favor ingresa un link válido (ej: https://...)", "error")
      return
    }

    const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]
    const fileExtension = file.name.split(".").pop().toLowerCase()

    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire("Archivo inválido", "Solo se permiten archivos .pdf, .doc(x), .xls(x), .ppt(x)", "error")
      return
    }

    const formData = new FormData()
    formData.append("grupo", grupo)
    formData.append("cliente", cliente)
    formData.append("campania", campania)
    formData.append("evaluacion", link)
    formData.append("archivo", file)

    try {
      const res = await fetch(`${ruta}/insertar`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Error al registrar el preturno")

      Swal.fire("Excelente", "Preturno registrado correctamente", "success")
      limpiarCampos()
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire("Error", "Error en el registro del preturno", "error")
    }
  }

  if (!visible) return null

  return (
    <div className="modal-superposicion">
      <div className="contenido-modal">
        <h3>Registrar preturno</h3>


        <select
          type="text"
          placeholder="Grupo"
          value={grupo}
          onChange={(e) => setgrupo(e.target.value)}
          className="entrada-modal"
        >

          <option value="">Selecciona un grupo</option>
          {gruposDisponibles.map((nombreGrupo, index) => (
            <option key={index} value={nombreGrupo}>
              {nombreGrupo}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="entrada-modal"
        />

        <input
          type="text"
          placeholder="Campaña"
          value={campania}
          onChange={(e) => setCampania(e.target.value)}
          className="entrada-modal"
        />

        <input
          type="text"
          placeholder="Link de evaluación"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="entrada-modal"
        />

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          className="entrada-modal"
        />

        <div className="botones-modal">
          <button className="btn-enviar" onClick={handleSubmit}>
            ✓ Aceptar
          </button>
          <button
            className="btn-cancelar"
            onClick={() => {
              limpiarCampos()
              onClose()
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalSubida
