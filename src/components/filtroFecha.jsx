"use client"

import { useState } from "react"
import "./FiltroFecha.css"

function FiltroFecha({ fechaFiltro, setFechaFiltro }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFechaChange = (e) => {
    setFechaFiltro(e.target.value)
  }

  const clearFecha = () => {
    setFechaFiltro("")
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    const date = new Date(fecha)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="filtro-fecha-container">
      <label htmlFor="fechaFiltro" className="filtro-fecha-label">
        Filtrar por fecha
      </label>

      <div className="filtro-fecha-wrapper">
        <div className="input-container">
          <div className="icon-calendar">📅</div>

          <input
            type="date"
            id="fechaFiltro"
            className="filtro-fecha-input"
            value={fechaFiltro}
            onChange={handleFechaChange}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          />

          {fechaFiltro && (
            <button type="button" onClick={clearFecha} className="clear-button" title="Limpiar fecha">
              ✕
            </button>
          )}
        </div>


        <div className={`indicator ${isOpen ? "active" : ""}`}></div>
      </div>

      <div className="botones-rapidos">
        <button
          type="button"
          onClick={() => setFechaFiltro(new Date().toISOString().split("T")[0])}
          className="boton-rapido boton-hoy"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            setFechaFiltro(yesterday.toISOString().split("T")[0])
          }}
          className="boton-rapido boton-ayer"
        >
          Ayer
        </button>
        <button
          type="button"
          onClick={() => {
            const lastWeek = new Date()
            lastWeek.setDate(lastWeek.getDate() - 7)
            setFechaFiltro(lastWeek.toISOString().split("T")[0])
          }}
          className="boton-rapido boton-semana"
        >
          Hace 1 semana
        </button>
      </div>
    </div>
  )
}

export default FiltroFecha
