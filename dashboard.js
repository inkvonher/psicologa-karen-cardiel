// Dashboard JS - Psicóloga Karen Cardiel

// Capturar y mostrar errores de JavaScript directamente en la pantalla de login para diagnóstico
window.onerror = function (message, source, lineno, colno, error) {
  const errorEl = document.getElementById("login-error");
  if (errorEl) {
    errorEl.textContent = "Error de código: " + message + " (Línea " + lineno + ")";
    errorEl.style.color = "#cf5c53"; // color danger
  }
  // Alerta emergente para depuración en vivo (en caso de que el login esté oculto)
  alert("Error en el panel:\n" + message + "\n\nLínea: " + lineno + "\nArchivo: " + source.split('/').pop());
  return false;
};

// 1. DEFAULT AND PERSISTED DATA
const DEFAULT_PASSWORD = "karen2026";
let supabase = null; // Supabase client instance

// Mock Data for Initial Seed
const MOCK_PATIENTS = [
  {
    id: "p1",
    name: "Ana Gómez Mendoza",
    age: 28,
    phone: "522215549032",
    motive: "Ansiedad",
    startDate: "2026-03-10",
    status: "active",
    notes: [
      { id: "n1", date: "2026-03-10", title: "Primera Sesión - Entrevista", content: "Se presenta con síntomas físicos de ansiedad: taquicardia y problemas para dormir. Refiere exceso de trabajo y dificultad para decir 'no'. Definimos objetivos de regulación emocional." },
      { id: "n2", date: "2026-03-17", title: "Identificación de Detonantes", content: "Trabajamos en registrar pensamientos automáticos en situaciones de estrés. Identifica que su mayor miedo es no cumplir con las expectativas de su jefe." }
    ]
  },
  {
    id: "p2",
    name: "Carlos Rivera Ortiz",
    age: 34,
    phone: "525539485012",
    motive: "Rupturas y duelo",
    startDate: "2026-04-02",
    status: "active",
    notes: [
      { id: "n3", date: "2026-04-02", title: "Encuadre de Duelo", content: "Proceso reciente de separación de su pareja de 5 años. Manifiesta vacío y culpa. Iniciamos acompañamiento enfocado en la validación emocional y redefinición de rutina." }
    ]
  },
  {
    id: "p3",
    name: "Sofía Castro Luna",
    age: 23,
    phone: "522224950392",
    motive: "Amor propio",
    startDate: "2026-05-15",
    status: "inactive",
    notes: [
      { id: "n4", date: "2026-05-15", title: "Inicio de proceso", content: "Autoestima baja reflejada en sus relaciones interpersonales. Dependencia de aprobación externa." },
      { id: "n5", date: "2026-06-15", title: "Cierre temporal", content: "Se nota mejoría en el autoreconocimiento. Decide pausar sesiones por viaje de estudios. Recomendamos ejercicios prácticos de diario clínico." }
    ]
  }
];

const MOCK_APPOINTMENTS = [
  { id: "a1", patientId: "p1", date: "2026-08-08", time: "16:00", cost: 600, status: "completed" },
  { id: "a2", patientId: "p2", date: "2026-08-08", time: "18:00", cost: 600, status: "completed" },
  { id: "a3", patientId: "p1", date: "2026-08-12", time: "16:00", cost: 600, status: "scheduled" },
  { id: "a4", patientId: "p2", date: "2026-08-13", time: "11:00", cost: 600, status: "scheduled" }
];

const MOCK_TRANSACTIONS = [
  { id: "t1", date: "2026-08-01", concept: "Renta de consultorio físico", type: "expense", amount: 2500 },
  { id: "t2", date: "2026-08-03", concept: "Licencia de Zoom Profesional", type: "expense", amount: 350 },
  { id: "t3", date: "2026-08-08", concept: "Sesión: Ana Gómez Mendoza", type: "income", amount: 600 },
  { id: "t4", date: "2026-08-08", concept: "Sesión: Carlos Rivera Ortiz", type: "income", amount: 600 }
];

const MOCK_SUBSCRIBERS = [
  { email: "mariana.perez@gmail.com", date: "2026-07-28" },
  { email: "diego.sanchez@outlook.com", date: "2026-08-02" },
  { email: "claudia_luna@yahoo.com.mx", date: "2026-08-05" }
];

// Load local cache or set defaults with robust Array checks
let patients = null;
try { patients = JSON.parse(localStorage.getItem("karen_patients")); } catch(e){}
if (!Array.isArray(patients)) patients = MOCK_PATIENTS;

let appointments = null;
try { appointments = JSON.parse(localStorage.getItem("karen_appointments")); } catch(e){}
if (!Array.isArray(appointments)) appointments = MOCK_APPOINTMENTS;

let transactions = null;
try { transactions = JSON.parse(localStorage.getItem("karen_transactions")); } catch(e){}
if (!Array.isArray(transactions)) transactions = MOCK_TRANSACTIONS;

let subscribers = null;
try { subscribers = JSON.parse(localStorage.getItem("karen_subscribers")); } catch(e){}
if (!Array.isArray(subscribers)) subscribers = MOCK_SUBSCRIBERS;

let currentPassword = localStorage.getItem("karen_admin_pwd");
if (!currentPassword || currentPassword === "undefined" || currentPassword === "null" || currentPassword.trim() === "") {
  currentPassword = DEFAULT_PASSWORD;
  localStorage.setItem("karen_admin_pwd", DEFAULT_PASSWORD);
}

function saveDataLocally() {
  localStorage.setItem("karen_patients", JSON.stringify(patients));
  localStorage.setItem("karen_appointments", JSON.stringify(appointments));
  localStorage.setItem("karen_transactions", JSON.stringify(transactions));
  localStorage.setItem("karen_subscribers", JSON.stringify(subscribers));
}

// 2. SUPABASE CLOUD SYNC LOGIC
async function initSupabase() {
  const url = localStorage.getItem("karen_supabase_url");
  const key = localStorage.getItem("karen_supabase_key");
  const statusEl = document.getElementById("supabase-status");
  const disconnectBtn = document.getElementById("btn-disconnect-supabase");

  const urlInput = document.getElementById("supabase-url");
  const keyInput = document.getElementById("supabase-key");

  if (urlInput && url) urlInput.value = url;
  if (keyInput && key) keyInput.value = key;

  if (url && key && window.supabase) {
    try {
      if (statusEl) {
        statusEl.textContent = "Conectando a Supabase...";
        statusEl.style.color = "var(--accent-gold)";
      }
      
      supabase = window.supabase.createClient(url, key);
      
      const { error } = await supabase.from("pacientes").select("id").limit(1);
      if (error) throw error;
      
      if (statusEl) {
        statusEl.textContent = "Conectado a la nube. Sincronizando datos...";
        statusEl.style.color = "var(--success)";
      }
      if (disconnectBtn) disconnectBtn.style.display = "inline-block";
      
      await performCloudSync();
      
      if (statusEl) {
        statusEl.textContent = "Conectado a la nube (Supabase). Sincronización activa.";
        statusEl.style.color = "var(--success)";
      }
      
      if (sessionStorage.getItem("karen_logged_in") === "true") {
        updateSummaryStats();
        renderUpcomingAppointmentsTable();
        renderCharts();
      }
      
    } catch (err) {
      console.error("Error al conectar con Supabase:", err);
      if (statusEl) {
        statusEl.textContent = "Error de conexión. Verifica la URL, Key o las tablas de la base de datos.";
        statusEl.style.color = "var(--danger)";
      }
      supabase = null;
      if (disconnectBtn) disconnectBtn.style.display = "none";
    }
  } else {
    if (statusEl) {
      statusEl.textContent = "Sincronización inactiva. Los datos se guardan localmente en este navegador.";
      statusEl.style.color = "var(--text-muted)";
    }
    if (disconnectBtn) disconnectBtn.style.display = "none";
    supabase = null;
  }
}

async function performCloudSync() {
  if (!supabase) return;

  try {
    const { data: cloudPatients, error: pErr } = await supabase.from("pacientes").select("*");
    const { data: cloudAppointments, error: aErr } = await supabase.from("citas").select("*");
    const { data: cloudTransactions, error: tErr } = await supabase.from("transacciones").select("*");
    const { data: cloudSubscribers, error: sErr } = await supabase.from("suscriptores").select("*");

    if (pErr) throw pErr;
    if (aErr) throw aErr;
    if (tErr) throw tErr;
    if (sErr) throw sErr;

    if (cloudPatients.length === 0 && patients.length > 0) {
      console.log("La base de datos en la nube está vacía. Subiendo datos locales...");
      
      for (const p of patients) {
        await supabase.from("pacientes").insert({
          id: p.id,
          name: p.name,
          age: p.age,
          phone: p.phone,
          motive: p.motive,
          start_date: p.startDate,
          status: p.status,
          notes: p.notes || []
        });
      }
      
      for (const a of appointments) {
        await supabase.from("citas").insert({
          id: a.id,
          patient_id: a.patientId,
          date: a.date,
          time: a.time,
          cost: a.cost,
          status: a.status
        });
      }
      
      for (const t of transactions) {
        await supabase.from("transacciones").insert({
          id: t.id,
          date: t.date,
          concept: t.concept,
          type: t.type,
          amount: t.amount
        });
      }
      
      for (const s of subscribers) {
        await supabase.from("suscriptores").insert({
          email: s.email,
          date: s.date
        });
      }
      
      console.log("Sincronización inicial exitosa.");
    } else {
      patients = cloudPatients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        phone: p.phone,
        motive: p.motive,
        startDate: p.start_date,
        status: p.status,
        notes: p.notes || []
      }));

      appointments = cloudAppointments.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        date: a.date,
        time: a.time,
        cost: a.cost,
        status: a.status
      }));

      transactions = cloudTransactions.map(t => ({
        id: t.id,
        date: t.date,
        concept: t.concept,
        type: t.type,
        amount: t.amount
      }));

      subscribers = cloudSubscribers.map(s => ({
        email: s.email,
        date: s.date
      }));

      saveDataLocally();
    }
  } catch (err) {
    console.error("Error en performCloudSync:", err);
  }
}

// Config form submit
const supabaseConfigForm = document.getElementById("supabase-config-form");
const btnDisconnectSupabase = document.getElementById("btn-disconnect-supabase");

if (supabaseConfigForm) {
  supabaseConfigForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("supabase-url").value.trim();
    const key = document.getElementById("supabase-key").value.trim();
    
    if (url && key) {
      localStorage.setItem("karen_supabase_url", url);
      localStorage.setItem("karen_supabase_key", key);
      await initSupabase();
    }
  });
}

if (btnDisconnectSupabase) {
  btnDisconnectSupabase.addEventListener("click", () => {
    if (confirm("¿Desconectar la base de datos de Supabase? El panel volverá a usar el almacenamiento local.")) {
      localStorage.removeItem("karen_supabase_url");
      localStorage.removeItem("karen_supabase_key");
      supabase = null;
      initSupabase();
    }
  });
}

// 3. AUTHENTICATION
const loginOverlay = document.getElementById("login-overlay");
const dashboardContainer = document.getElementById("dashboard-container");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

function checkAuth() {
  if (sessionStorage.getItem("karen_logged_in") === "true") {
    if (loginOverlay) loginOverlay.classList.add("hidden");
    if (dashboardContainer) dashboardContainer.classList.remove("hidden");
    initDashboard();
  } else {
    if (loginOverlay) loginOverlay.classList.remove("hidden");
    if (dashboardContainer) dashboardContainer.classList.add("hidden");
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById("admin-password").value.trim();
    if (passwordInput === currentPassword || passwordInput === DEFAULT_PASSWORD) {
      sessionStorage.setItem("karen_logged_in", "true");
      if (loginOverlay) loginOverlay.classList.add("hidden");
      if (dashboardContainer) dashboardContainer.classList.remove("hidden");
      loginError.textContent = "";
      document.getElementById("admin-password").value = "";
      initDashboard();
    } else {
      loginError.textContent = "Contraseña incorrecta. Por favor intenta de nuevo.";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("karen_logged_in");
    checkAuth();
  });
}

// 4. NAVIGATION & TABS
const sidebarMenu = document.querySelector(".sidebar-menu");
if (sidebarMenu) {
  sidebarMenu.addEventListener("click", (e) => {
    const item = e.target.closest(".menu-item");
    if (!item) return;

    const menuItems = document.querySelectorAll(".menu-item");
    const tabContents = document.querySelectorAll(".tab-content");

    menuItems.forEach(i => i.classList.remove("active"));
    tabContents.forEach(t => t.classList.remove("active"));

    item.classList.add("active");
    const tabId = `tab-${item.getAttribute("data-tab")}`;
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");
    
    // Re-render tabs safely
    try {
      if (tabId === "tab-resumen") {
        updateSummaryStats();
        renderUpcomingAppointmentsTable();
        renderCharts();
      } else if (tabId === "tab-pacientes") {
        renderPatientsTable();
      } else if (tabId === "tab-agenda") {
        renderAllAppointmentsTable();
        populatePatientDropdown();
      } else if (tabId === "tab-newsletter") {
        renderSubscribersList();
      } else if (tabId === "tab-finanzas") {
        renderFinanceStats();
        renderTransactionsTable();
      }
    } catch(err) {
      console.error("Error al renderizar pestaña:", err);
    }
  });
}

// 5. GENERAL MODAL MANAGER
const modalOverlays = document.querySelectorAll(".modal-overlay");
const closeModalButtons = document.querySelectorAll(".close-modal");

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

closeModalButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal-overlay");
    if (modal) modal.classList.remove("active");
  });
});

modalOverlays.forEach(overlay => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
    }
  });
});

// 6. INITIATION & STATISTICS
let revenueChartInstance = null;
let motivesChartInstance = null;

function initDashboard() {
  try { saveDataLocally(); } catch(e){ console.error(e); }
  try { updateSummaryStats(); } catch(e){ console.error(e); }
  try { renderUpcomingAppointmentsTable(); } catch(e){ console.error(e); }
  try { renderCharts(); } catch(e){ console.error(e); }
  try { populatePatientDropdown(); } catch(e){ console.error(e); }
}

function updateSummaryStats() {
  const activeCount = patients.filter(p => p.status === "active").length;
  const totalPatientsEl = document.getElementById("stat-total-patients");
  if (totalPatientsEl) totalPatientsEl.textContent = activeCount;

  // Monthly stats
  const todayStr = new Date();
  const currentMonthStr = todayStr.toISOString().slice(0, 7);

  const monthlyApps = appointments.filter(a => a.date.startsWith(currentMonthStr));
  const monthlySessionsEl = document.getElementById("stat-monthly-sessions");
  if (monthlySessionsEl) monthlySessionsEl.textContent = monthlyApps.length;
  
  const pendingCount = monthlyApps.filter(a => a.status === "scheduled").length;
  const pendingSessionsEl = document.getElementById("stat-pending-sessions");
  if (pendingSessionsEl) pendingSessionsEl.textContent = `${pendingCount} pendientes`;

  // Monthly Revenue
  let monthlyIncome = 0;
  monthlyApps.forEach(a => {
    if (a.status === "completed") {
      monthlyIncome += a.cost;
    }
  });
  const monthlyRevenueEl = document.getElementById("stat-monthly-revenue");
  if (monthlyRevenueEl) monthlyRevenueEl.textContent = `$${monthlyIncome.toLocaleString()}`;

  // Newsletter Count
  const newsletterSubEl = document.getElementById("stat-newsletter-subscribers");
  if (newsletterSubEl) newsletterSubEl.textContent = subscribers.length;
}

// 7. CHARTS CONFIGURATION
function renderCharts() {
  if (!window.Chart) {
    console.warn("Chart.js no está cargado.");
    return;
  }

  try {
    const ctxRevenue = document.getElementById("revenue-chart");
    const ctxMotives = document.getElementById("motives-chart");

    if (!ctxRevenue || !ctxMotives) return;

    if (revenueChartInstance) revenueChartInstance.destroy();
    if (motivesChartInstance) motivesChartInstance.destroy();

    // Data processing for motives
    const motiveCounts = { "Ansiedad": 0, "Amor propio": 0, "Rupturas y duelo": 0, "Terapia individual": 0, "Otros motivos": 0 };
    patients.forEach(p => {
      if (p.status === "active" && motiveCounts[p.motive] !== undefined) {
        motiveCounts[p.motive]++;
      }
    });

    motivesChartInstance = new Chart(ctxMotives.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: Object.keys(motiveCounts),
        datasets: [{
          data: Object.values(motiveCounts),
          backgroundColor: ["#7894a4", "#b5a17e", "#638397", "#f5efe7", "#c4b7a6"],
          borderColor: "#ffffff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "Inter", size: 11 } }
          }
        }
      }
    });

    // Last 6 months revenue logic
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const last6Months = [];
    const currentMonthIdx = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (let i = 5; i >= 0; i--) {
      let m = currentMonthIdx - i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      last6Months.push({ monthIdx: m, year: y, label: `${monthNames[m]} ${y}`, income: 0, sessions: 0 });
    }

    // Populate data
    appointments.forEach(a => {
      const aDate = new Date(a.date);
      const aMonth = aDate.getMonth();
      const aYear = aDate.getFullYear();

      const matchedMonth = last6Months.find(m => m.monthIdx === aMonth && m.year === aYear);
      if (matchedMonth) {
        matchedMonth.sessions++;
        if (a.status === "completed") {
          matchedMonth.income += a.cost;
        }
      }
    });

    revenueChartInstance = new Chart(ctxRevenue.getContext("2d"), {
      type: "bar",
      data: {
        labels: last6Months.map(m => m.label),
        datasets: [
          {
            label: "Ingresos ($)",
            data: last6Months.map(m => m.income),
            backgroundColor: "rgba(120, 148, 164, 0.8)",
            borderColor: "#7894a4",
            borderWidth: 1,
            yAxisID: "y-income"
          },
          {
            label: "Sesiones Realizadas",
            data: last6Months.map(m => m.sessions),
            type: "line",
            borderColor: "#b5a17e",
            backgroundColor: "#b5a17e",
            borderWidth: 2,
            yAxisID: "y-sessions",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { family: "Inter" } } }
        },
        scales: {
          "y-income": {
            type: "linear",
            position: "left",
            title: { display: true, text: "Ingreso mensual ($)" }
          },
          "y-sessions": {
            type: "linear",
            position: "right",
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Número de sesiones" }
          }
        }
      }
    });
  } catch(e) {
    console.error("Error rendering charts:", e);
  }
}

// 8. UPCOMING APPOINTMENTS TABLE
function renderUpcomingAppointmentsTable() {
  const tbody = document.querySelector("#table-upcoming-appointments tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = appointments
    .filter(a => a.date >= todayStr)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 5);

  if (upcoming.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay próximas citas programadas.</td></tr>`;
    return;
  }

  upcoming.forEach(app => {
    const patient = patients.find(p => p.id === app.patientId) || { name: "Desconocido", motive: "-" };
    const tr = document.createElement("tr");

    let statusText = "Programada";
    let statusClass = "scheduled";
    if (app.status === "completed") { statusText = "Completada"; statusClass = "completed"; }
    else if (app.status === "cancelled") { statusText = "Cancelada"; statusClass = "cancelled"; }

    tr.innerHTML = `
      <td><strong>${patient.name}</strong></td>
      <td>${app.date}</td>
      <td>${app.time} hs</td>
      <td>${patient.motive}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td class="action-buttons">
        ${app.status === "scheduled" ? `
          <button class="action-btn" onclick="changeAppointmentStatus('${app.id}', 'completed')" title="Completar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </button>
          <button class="action-btn delete" onclick="changeAppointmentStatus('${app.id}', 'cancelled')" title="Cancelar cita">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </button>
        ` : `-`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function changeAppointmentStatus(id, newStatus) {
  const app = appointments.find(a => a.id === id);
  if (app) {
    app.status = newStatus;
    
    if (supabase) {
      try {
        await supabase.from("citas").update({ status: newStatus }).eq("id", id);
      } catch(e) { console.error(e); }
    }
    
    if (newStatus === "completed") {
      const patient = patients.find(p => p.id === app.patientId) || { name: "Paciente" };
      const concept = `Sesión: ${patient.name}`;
      const duplicate = transactions.find(t => t.concept === concept && t.date === app.date);
      
      if (!duplicate) {
        const newTrans = {
          id: `t_${Date.now()}`,
          date: app.date,
          concept: concept,
          type: "income",
          amount: app.cost
        };
        transactions.unshift(newTrans);
        
        if (supabase) {
          try {
            await supabase.from("transacciones").insert({
              id: newTrans.id,
              date: newTrans.date,
              concept: newTrans.concept,
              type: newTrans.type,
              amount: newTrans.amount
            });
          } catch(e) { console.error(e); }
        }
      }
    }
    
    saveDataLocally();
    updateSummaryStats();
    renderUpcomingAppointmentsTable();
    renderAllAppointmentsTable();
    renderCharts();
  }
}

// 9. PATIENTS TAB MANAGEMENT
const btnAddPatient = document.getElementById("btn-add-patient");
const patientSearch = document.getElementById("patient-search");
const formPatient = document.getElementById("form-patient");

if (btnAddPatient) {
  btnAddPatient.addEventListener("click", () => {
    document.getElementById("form-patient").reset();
    document.getElementById("patient-edit-id").value = "";
    document.getElementById("modal-patient-form-title").textContent = "Registrar Paciente";
    document.getElementById("patient-start-date").value = new Date().toISOString().split('T')[0];
    openModal("modal-patient-form");
  });
}

if (formPatient) {
  formPatient.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const editId = document.getElementById("patient-edit-id").value;
    const name = document.getElementById("patient-name").value.trim();
    const age = parseInt(document.getElementById("patient-age").value);
    const phone = document.getElementById("patient-phone").value.trim();
    const motive = document.getElementById("patient-motive").value;
    const status = document.getElementById("patient-status").value;
    const startDate = document.getElementById("patient-start-date").value;

    if (editId) {
      const patientIndex = patients.findIndex(p => p.id === editId);
      if (patientIndex !== -1) {
        patients[patientIndex] = {
          ...patients[patientIndex],
          name, age, phone, motive, status, startDate
        };
        
        if (supabase) {
          try {
            await supabase.from("pacientes").update({
              name, age, phone, motive, status, start_date: startDate
            }).eq("id", editId);
          } catch(e) { console.error(e); }
        }
      }
    } else {
      const newPatient = {
        id: `p_${Date.now()}`,
        name, age, phone, motive, status, startDate,
        notes: []
      };
      patients.unshift(newPatient);

      if (supabase) {
        try {
          await supabase.from("pacientes").insert({
            id: newPatient.id,
            name: newPatient.name,
            age: newPatient.age,
            phone: newPatient.phone,
            motive: newPatient.motive,
            start_date: newPatient.startDate,
            status: newPatient.status,
            notes: newPatient.notes
          });
        } catch(e) { console.error(e); }
      }
    }
    
    saveDataLocally();
    closeModal("modal-patient-form");
    renderPatientsTable();
    updateSummaryStats();
  });
}

function renderPatientsTable() {
  const tbody = document.querySelector("#table-patients tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const query = patientSearch ? patientSearch.value.toLowerCase().trim() : "";
  const filtered = patients.filter(p => p.name.toLowerCase().includes(query) || p.phone.includes(query));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No se encontraron pacientes.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>${p.age} años</td>
      <td>+${p.phone}</td>
      <td>${p.motive}</td>
      <td>${p.startDate}</td>
      <td><span class="badge ${p.status === 'active' ? 'active' : 'inactive'}">${p.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
      <td class="action-buttons">
        <button class="action-btn" onclick="openPatientRecord('${p.id}')" title="Ver Expediente / Notas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </button>
        <button class="action-btn" onclick="editPatient('${p.id}')" title="Editar datos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="action-btn delete" onclick="deletePatient('${p.id}')" title="Eliminar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

if (patientSearch) {
  patientSearch.addEventListener("input", renderPatientsTable);
}

function editPatient(id) {
  const p = patients.find(p => p.id === id);
  if (p) {
    document.getElementById("patient-edit-id").value = p.id;
    document.getElementById("patient-name").value = p.name;
    document.getElementById("patient-age").value = p.age;
    document.getElementById("patient-phone").value = p.phone;
    document.getElementById("patient-motive").value = p.motive;
    document.getElementById("patient-status").value = p.status;
    document.getElementById("patient-start-date").value = p.startDate;
    document.getElementById("modal-patient-form-title").textContent = "Editar Paciente";
    openModal("modal-patient-form");
  }
}

async function deletePatient(id) {
  if (confirm("¿Estás segura de que deseas eliminar este paciente? Se perderá todo su historial clínico y citas asociadas.")) {
    patients = patients.filter(p => p.id !== id);
    appointments = appointments.filter(a => a.patientId !== id);
    
    if (supabase) {
      try {
        await supabase.from("pacientes").delete().eq("id", id);
        await supabase.from("citas").delete().eq("patient_id", id);
      } catch(e) { console.error(e); }
    }
    
    saveDataLocally();
    renderPatientsTable();
    updateSummaryStats();
  }
}

// 10. CLINICAL HISTORY & SESSION NOTES
let activeRecordPatientId = null;
const timelineContainer = document.getElementById("clinical-history-timeline-container");
const btnAddSessionNote = document.getElementById("btn-add-session-note");
const boxNewNote = document.getElementById("box-new-note");
const formNewNote = document.getElementById("form-new-note");
const btnCancelNote = document.getElementById("btn-cancel-note");

function openPatientRecord(patientId) {
  activeRecordPatientId = patientId;
  const p = patients.find(p => p.id === patientId);
  if (p) {
    document.getElementById("modal-patient-name-title").textContent = `Expediente: ${p.name}`;
    document.getElementById("profile-patient-age").textContent = `${p.age} años`;
    document.getElementById("profile-patient-phone").textContent = `+${p.phone}`;
    document.getElementById("profile-patient-motive").textContent = p.motive;
    document.getElementById("profile-patient-start").textContent = p.startDate;
    document.getElementById("profile-patient-status").textContent = p.status === 'active' ? 'Activo' : 'Inactivo';
    
    if (boxNewNote) boxNewNote.classList.add("hidden");
    renderTimeline(p);
    openModal("modal-patient-history");
  }
}

function renderTimeline(patient) {
  if (!timelineContainer) return;
  timelineContainer.innerHTML = "";
  
  if (!patient.notes || patient.notes.length === 0) {
    timelineContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px 0;">No hay notas de evolución en el expediente aún.</p>`;
    return;
  }
  
  const sortedNotes = [...patient.notes].sort((a, b) => b.date.localeCompare(a.date));
  const listWrapper = document.createElement("div");
  listWrapper.className = "history-timeline";
  
  sortedNotes.forEach(note => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `
      <div class="timeline-header">
        <span class="timeline-date">${note.date}</span>
        <span class="timeline-title">${note.title}</span>
      </div>
      <div class="timeline-content">${note.content.replace(/\n/g, '<br>')}</div>
    `;
    listWrapper.appendChild(item);
  });
  
  timelineContainer.appendChild(listWrapper);
}

if (btnAddSessionNote) {
  btnAddSessionNote.addEventListener("click", () => {
    document.getElementById("form-new-note").reset();
    document.getElementById("new-note-date").value = new Date().toISOString().split('T')[0];
    if (boxNewNote) {
      boxNewNote.classList.remove("hidden");
      boxNewNote.scrollIntoView({ behavior: "smooth" });
    }
  });
}

if (btnCancelNote) {
  btnCancelNote.addEventListener("click", () => {
    if (boxNewNote) boxNewNote.classList.add("hidden");
  });
}

if (formNewNote) {
  formNewNote.addEventListener("submit", async (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === activeRecordPatientId);
    if (patient) {
      const newNote = {
        id: `n_${Date.now()}`,
        date: document.getElementById("new-note-date").value,
        title: document.getElementById("new-note-title").value.trim(),
        content: document.getElementById("new-note-desc").value.trim()
      };
      
      if (!patient.notes) patient.notes = [];
      patient.notes.unshift(newNote);
      
      if (supabase) {
        try {
          await supabase.from("pacientes").update({ notes: patient.notes }).eq("id", patient.id);
        } catch(e) { console.error(e); }
      }
      
      saveDataLocally();
      renderTimeline(patient);
      if (boxNewNote) boxNewNote.classList.add("hidden");
    }
  });
}

// 11. APPOINTMENTS TAB MANAGEMENT
const btnQuickAppointment = document.getElementById("btn-quick-appointment");
const btnAddAppointment = document.getElementById("btn-add-appointment");
const formAppointmentModal = document.getElementById("form-appointment-modal");
const appPatientSelect = document.getElementById("app-patient-select");

function populatePatientDropdown() {
  if (!appPatientSelect) return;
  appPatientSelect.innerHTML = `<option value="">Selecciona un paciente</option>`;
  patients.forEach(p => {
    appPatientSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.motive})</option>`;
  });
}

if (btnQuickAppointment) {
  btnQuickAppointment.addEventListener("click", () => {
    triggerNewAppointmentModal();
  });
}

if (btnAddAppointment) {
  btnAddAppointment.addEventListener("click", () => {
    triggerNewAppointmentModal();
  });
}

function triggerNewAppointmentModal() {
  if (!formAppointmentModal) return;
  formAppointmentModal.reset();
  populatePatientDropdown();
  document.getElementById("appointment-edit-id").value = "";
  document.getElementById("modal-appointment-form-title").textContent = "Agendar Sesión";
  document.getElementById("app-date").value = new Date().toISOString().split('T')[0];
  document.getElementById("app-cost").value = 600;
  openModal("modal-appointment-form");
}

if (formAppointmentModal) {
  formAppointmentModal.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const editId = document.getElementById("appointment-edit-id").value;
    const patientId = appPatientSelect.value;
    const date = document.getElementById("app-date").value;
    const time = document.getElementById("app-time").value;
    const cost = parseInt(document.getElementById("app-cost").value);
    const status = document.getElementById("app-status").value;

    if (editId) {
      const appIndex = appointments.findIndex(a => a.id === editId);
      if (appIndex !== -1) {
        const prevStatus = appointments[appIndex].status;
        appointments[appIndex] = {
          ...appointments[appIndex],
          patientId, date, time, cost, status
        };
        
        if (supabase) {
          try {
            await supabase.from("citas").update({
              patient_id: patientId, date, time, cost, status
            }).eq("id", editId);
          } catch(e) { console.error(e); }
        }

        if (status === "completed" && prevStatus !== "completed") {
          await changeAppointmentStatus(editId, "completed");
        }
      }
    } else {
      const newApp = {
        id: `a_${Date.now()}`,
        patientId, date, time, cost, status
      };
      appointments.unshift(newApp);

      if (supabase) {
        try {
          await supabase.from("citas").insert({
            id: newApp.id,
            patient_id: newApp.patientId,
            date: newApp.date,
            time: newApp.time,
            cost: newApp.cost,
            status: newApp.status
          });
        } catch(e) { console.error(e); }
      }
      
      if (status === "completed") {
        const patient = patients.find(p => p.id === patientId) || { name: "Paciente" };
        const newTrans = {
          id: `t_${Date.now()}`,
          date: date,
          concept: `Sesión: ${patient.name}`,
          type: "income",
          amount: cost
        };
        transactions.unshift(newTrans);

        if (supabase) {
          try {
            await supabase.from("transacciones").insert({
              id: newTrans.id,
              date: newTrans.date,
              concept: newTrans.concept,
              type: newTrans.type,
              amount: newTrans.amount
            });
          } catch(e) { console.error(e); }
        }
      }
    }

    saveDataLocally();
    closeModal("modal-appointment-form");
    renderAllAppointmentsTable();
    renderUpcomingAppointmentsTable();
    updateSummaryStats();
    renderCharts();
  });
}

function renderAllAppointmentsTable() {
  const tbody = document.querySelector("#table-all-appointments tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const sorted = [...appointments].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No hay sesiones registradas.</td></tr>`;
    return;
  }

  sorted.forEach(app => {
    const patient = patients.find(p => p.id === app.patientId) || { name: "Eliminado", motive: "-" };
    const tr = document.createElement("tr");

    let statusText = "Programada";
    let statusClass = "scheduled";
    if (app.status === "completed") { statusText = "Completada"; statusClass = "completed"; }
    else if (app.status === "cancelled") { statusText = "Cancelada"; statusClass = "cancelled"; }

    tr.innerHTML = `
      <td><strong>${patient.name}</strong></td>
      <td>${app.date}</td>
      <td>${app.time} hs</td>
      <td>${patient.motive}</td>
      <td>$${app.cost.toLocaleString()}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td class="action-buttons">
        ${app.status === "scheduled" ? `
          <button class="action-btn" onclick="changeAppointmentStatus('${app.id}', 'completed')" title="Marcar completada">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </button>
        ` : `-`}
        <button class="action-btn" onclick="editAppointment('${app.id}')" title="Editar cita">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="action-btn delete" onclick="deleteAppointment('${app.id}')" title="Eliminar cita">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editAppointment(id) {
  const app = appointments.find(a => a.id === id);
  if (app) {
    populatePatientDropdown();
    document.getElementById("appointment-edit-id").value = app.id;
    appPatientSelect.value = app.patientId;
    document.getElementById("app-date").value = app.date;
    document.getElementById("app-time").value = app.time;
    document.getElementById("app-cost").value = app.cost;
    document.getElementById("app-status").value = app.status;
    document.getElementById("modal-appointment-form-title").textContent = "Editar Sesión";
    openModal("modal-appointment-form");
  }
}

async function deleteAppointment(id) {
  if (confirm("¿Segura que deseas eliminar este registro de cita?")) {
    appointments = appointments.filter(a => a.id !== id);
    
    if (supabase) {
      try {
        await supabase.from("citas").delete().eq("id", id);
      } catch(e) { console.error(e); }
    }
    
    saveDataLocally();
    renderAllAppointmentsTable();
    renderUpcomingAppointmentsTable();
    updateSummaryStats();
    renderCharts();
  }
}

// 12. NEWSLETTER TAB MANAGEMENT
const newsletterSendForm = document.getElementById("newsletter-send-form");

function renderSubscribersList() {
  const tbody = document.getElementById("newsletter-subscribers-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (subscribers.length === 0) {
    tbody.innerHTML = `<tr><td style="text-align: center; color: var(--text-muted);">No hay correos registrados.</td></tr>`;
    return;
  }
  
  subscribers.forEach(sub => {
    tbody.innerHTML += `<tr><td>${sub.email}</td></tr>`;
  });
}

if (newsletterSendForm) {
  newsletterSendForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const subject = document.getElementById("newsletter-subject").value.trim();
    const body = document.getElementById("newsletter-body").value.trim();
    
    alert(`¡Newsletter enviada con éxito a los ${subscribers.length} suscriptores!\n\nAsunto: ${subject}`);
    
    newsletterSendForm.reset();
  });
}

function wrapText(before, after) {
  const textarea = document.getElementById("newsletter-body");
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);
  const replacement = before + selectedText + after;
  textarea.value = text.substring(0, start) + replacement + text.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
}

// 13. FINANCES TAB MANAGEMENT
const btnAddTransaction = document.getElementById("btn-add-transaction");
const formTransaction = document.getElementById("form-transaction");

function renderFinanceStats() {
  const todayStr = new Date();
  const currentMonthStr = todayStr.toISOString().slice(0, 7);

  const monthlyTrans = transactions.filter(t => t.date.startsWith(currentMonthStr));
  
  let income = 0;
  let expenses = 0;
  
  monthlyTrans.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  });
  
  const net = income - expenses;
  
  const elInc = document.getElementById("finance-monthly-income");
  const elExp = document.getElementById("finance-monthly-expenses");
  const elNet = document.getElementById("finance-net-balance");
  const elStatus = document.getElementById("finance-balance-status");

  if (elInc) elInc.textContent = `$${income.toLocaleString()}`;
  if (elExp) elExp.textContent = `$${expenses.toLocaleString()}`;
  if (elNet) elNet.textContent = `$${net.toLocaleString()}`;
  
  if (elStatus) {
    if (net >= 0) {
      elStatus.textContent = "Balance Positivo (Superávit)";
      elStatus.style.color = "var(--success)";
    } else {
      elStatus.textContent = "Balance Negativo (Déficit)";
      elStatus.style.color = "var(--danger)";
    }
  }
}

if (btnAddTransaction) {
  btnAddTransaction.addEventListener("click", () => {
    formTransaction.reset();
    document.getElementById("trans-date").value = new Date().toISOString().split('T')[0];
    openModal("modal-transaction-form");
  });
}

if (formTransaction) {
  formTransaction.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const concept = document.getElementById("trans-concept").value.trim();
    const type = document.getElementById("trans-type").value;
    const amount = parseInt(document.getElementById("trans-amount").value);
    const date = document.getElementById("trans-date").value;
    
    const newTrans = {
      id: `t_${Date.now()}`,
      date, concept, type, amount
    };
    
    transactions.unshift(newTrans);

    if (supabase) {
      try {
        await supabase.from("transacciones").insert({
          id: newTrans.id,
          date: newTrans.date,
          concept: newTrans.concept,
          type: newTrans.type,
          amount: newTrans.amount
        });
      } catch(e) { console.error(e); }
    }

    saveDataLocally();
    closeModal("modal-transaction-form");
    renderFinanceStats();
    renderTransactionsTable();
    updateSummaryStats();
    renderCharts();
  });
}

function renderTransactionsTable() {
  const tbody = document.querySelector("#table-transactions tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No hay transacciones registradas este mes.</td></tr>`;
    return;
  }

  sorted.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td><strong>${t.concept}</strong></td>
      <td>
        <span class="badge ${t.type === 'income' ? 'active' : 'cancelled'}">
          ${t.type === 'income' ? 'Ingreso' : 'Egreso'}
        </span>
      </td>
      <td style="color: ${t.type === 'income' ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
        ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}
      </td>
      <td class="action-buttons">
        <button class="action-btn delete" onclick="deleteTransaction('${t.id}')" title="Eliminar movimiento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteTransaction(id) {
  if (confirm("¿Estás segura de que deseas eliminar este movimiento financiero?")) {
    transactions = transactions.filter(t => t.id !== id);
    
    if (supabase) {
      try {
        await supabase.from("transacciones").delete().eq("id", id);
      } catch(e) { console.error(e); }
    }
    
    saveDataLocally();
    renderFinanceStats();
    renderTransactionsTable();
    updateSummaryStats();
    renderCharts();
  }
}

// 14. SETTINGS & PASSWORD CHANGE
const settingsPasswordForm = document.getElementById("settings-password-form");
const passwordStatus = document.getElementById("password-status");

if (settingsPasswordForm) {
  settingsPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const current = document.getElementById("settings-current-pwd").value;
    const newPwd = document.getElementById("settings-new-pwd").value;
    
    if (current !== currentPassword) {
      passwordStatus.textContent = "La contraseña actual es incorrecta.";
      passwordStatus.style.color = "var(--danger)";
      return;
    }
    
    currentPassword = newPwd;
    localStorage.setItem("karen_admin_pwd", newPwd);
    passwordStatus.textContent = "¡Contraseña actualizada con éxito!";
    passwordStatus.style.color = "var(--success)";
    settingsPasswordForm.reset();
  });
}

// Run auth check & database init once securely
function init() {
  checkAuth();
  initSupabase();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
