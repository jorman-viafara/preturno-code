"use client"

import { useState, useRef } from "react"
import Swal from "sweetalert2"
import "./ModalSubida.css"

const ModalSubida = ({ visible, onClose }) => {
  const [cliente, setCliente] = useState("")
  const [campania, setCampania] = useState("")
  const [link, setLink] = useState("")
  const fileInputRef = useRef(null)

  const limpiarCampos = () => {
    setCliente("")
    setCampania("")
    setLink("")
    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
  }

  const handleSubmit = async () => {
    const file = fileInputRef.current.files[0]

    if (!cliente || !campania || !file || !link) {
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
    formData.append("file", file)

    try {
      const fileRes = await fetch("https://bluelink.local/api-preturno/upload", {
        method: "POST",
        body: formData,
      })

      if (!fileRes.ok) throw new Error("Error al subir archivo")

      const jsonRes = await fetch("https://bluelink.local/api-preturno/update-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cliente, campaña: campania, link }),
      })

      if (!jsonRes.ok) throw new Error("Error al enviar JSON")

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
