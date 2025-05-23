const filas = "ABCDEFGHIJKLM".split("");
const columnas = 21;
const sala = document.getElementById("sala");
const encabezado = document.getElementById("encabezado");
const seleccionadosDiv = document.getElementById("seleccionados");
const seleccionados = new Set();

let ocupados = [];
let esAdmin = false;

// URL pública CSV exportada desde Google Sheets (debes poner tu ID aquí)
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTsgqAF-a0LLlL-Cd_lGdrg4nSWbt0fZHG3vQ4XEoDCUUCX5JsbdoGAPSMFNnGJ6tJ0Nxr0hvN_25IH/pub?output=csv";

function crearEncabezado() {
  encabezado.innerHTML = "";
  for (let i = columnas; i >= 1; i--) {
    const numDiv = document.createElement("div");
    numDiv.className = "letra";
    numDiv.textContent = i;
    encabezado.appendChild(numDiv);
  }
}

// Nuevo: obtener estados desde Google Sheet pública (CSV)
async function obtenerButacasOcupadas() {
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error("Error al cargar hoja: " + res.status);
    const csvText = await res.text();

    // Parse CSV: se asume formato: butaca,estado (sin encabezado o con encabezado en la 1ra línea)
    const lines = csvText.trim().split("\n");
    ocupados = [];
    lines.slice(1).forEach(line => {
      const [butaca, estado] = line.split(",");
      if (estado && estado.trim().toLowerCase() !== "libre") {
        ocupados.push(butaca.trim());
      }
    });
  } catch (error) {
    console.error("Error al obtener butacas ocupadas:", error);
  }
}

function crearAsientos() {
  sala.innerHTML = "";
  filas.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "fila";

    for (let col = columnas; col >= 1; col--) {
      const id = fila + col;
      const seat = document.createElement("div");
      seat.className = "asiento";
      seat.textContent = id;

      if (["A", "B", "C", "D", "E"].includes(fila)) seat.classList.add("vip");
      if (ocupados.includes(id)) {
        seat.classList.add("ocupado");
      }

      seat.onclick = () => {
        if (seat.classList.contains("ocupado") && !esAdmin) return;

        if (seleccionados.has(id)) {
          seleccionados.delete(id);
          seat.style.backgroundColor = seat.classList.contains("vip") ? "gold" : "green";
        } else {
          seleccionados.add(id);
          seat.style.backgroundColor = "orange";
        }
        actualizarSeleccion();
      };

      filaDiv.appendChild(seat);
    }
    sala.appendChild(filaDiv);
  });
}

function actualizarSeleccion() {
  const lista = Array.from(seleccionados).sort().join(", ");
  if (!lista) {
    seleccionadosDiv.textContent = "Asientos seleccionados: ninguno";
    return;
  }

  let total = 0;
  Array.from(seleccionados).forEach(id => {
    const fila = id.charAt(0);
    total += ["A", "B", "C", "D", "E"].includes(fila) ? 27000 : 17000;
  });

  seleccionadosDiv.textContent = `Asientos seleccionados: ${lista} | Total: $${total.toLocaleString("es-CL")}`;
}

function enviarReserva() {
  if (seleccionados.size === 0) {
    alert("Debes seleccionar al menos un asiento.");
    return;
  }

  const butacasArray = Array.from(seleccionados);
  let total = 0;
  butacasArray.forEach(id => {
    const fila = id.charAt(0);
    total += ["A", "B", "C", "D", "E"].includes(fila) ? 27000 : 17000;
  });

  // No hacemos POST porque la hoja es solo lectura
  // Solo enviamos el mensaje WhatsApp

  const mensaje = `Hola, quiero reservar los siguientes asientos para el evento INBA Chile 2025: ${butacasArray.join(", ")} (Total: $${total.toLocaleString("es-CL")}). Por favor confirmar.`;
  const url = "https://wa.me/56961451122?text=" + encodeURIComponent(mensaje);
  window.open(url, "_blank");
}

function modoAdmin() {
  const clave = prompt("Ingrese clave de administrador:");
  if (clave === "cultur1sm0") {
    esAdmin = true;
    alert("Modo administrador activado.");
  } else {
    alert("Clave incorrecta, modo visitante activado.");
    esAdmin = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  crearEncabezado();
  await obtenerButacasOcupadas();
  crearAsientos();
  actualizarSeleccion();
});
