import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, runTransaction } from "firebase/firestore";

// --- 1. CONFIGURACIÓN FIREBASE (INTACTA) ---
const firebaseConfig = {
  apiKey: "AIzaSyA-DMiiqIbjszdvj09F2086JXOz4npDYK4",
  authDomain: "wai-licencia.firebaseapp.com",
  databaseURL: "https://wai-licencia-default-rtdb.firebaseio.com",
  projectId: "wai-licencia",
  storageBucket: "wai-licencia.firebasestorage.app",
  messagingSenderId: "816648166004",
  appId: "1:816648166004:web:7f2e2572a444b94939cf21",
  measurementId: "G-WVGE3JELBE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// LINKS
const WHATSAPP_SOPORTE = "https://wa.me/573004085041";
const LINK_DESCARGA = "https://github.com/templo1923/loginwai/releases/download/v5.12.05/WAI.Agente.Setup.5.12.5.exe"; 
const URL_TUTORIALES = "https://loginwaibot.vercel.app/tutoriales/";

// --- ICONOS ---
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
  Video: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Support: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 9v4l3 3"></path></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>,
  Plan: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>,
  Check: ({ color }) => <svg className={`w-5 h-5 mr-2 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>,
  Reseller: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Windows: () => <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.949-1.323L24 0v11.523h-13.051V2.126zM0 12.6h9.75v9.451L0 20.699V12.6zm10.949 0H24v9.274l-13.051 2.002V12.6z"/></svg>,
  Admin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  Key: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>,
  Crown: () => <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
};

// --- DATA TEMPORAL (Solo si necesitas el botón admin, si no, puedes ignorar esto) ---
const PLANES_PARA_DB = { /* ... (El mismo JSON de antes) ... */ };

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseData, setLicenseData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(0); 
  const [porcentajeDias, setPorcentajeDias] = useState(100); // Nuevo para barra visual

  // CONFIG
  const [mensajeGlobal, setMensajeGlobal] = useState(""); 
  const [appVersion, setAppVersion] = useState("v1.0.0");
  const [activeTab, setActiveTab] = useState("inicio"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  // ESTADO PLANES
  const [planesDB, setPlanesDB] = useState([]); 
  const [planFilter, setPlanFilter] = useState('personal'); // Nuevo: Filtro visual para pestaña planes
  
  // ESTADOS REVENDEDOR
  const [ventaTipo, setVentaTipo] = useState('personal'); 
  const [ventaEmail, setVentaEmail] = useState("");
  const [ventaOpcionID, setVentaOpcionID] = useState(""); 
  const [ventaMsg, setVentaMsg] = useState("");
  const [isReseller, setIsReseller] = useState(false); 

  // 1. INICIO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await verificarLicencia(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. CARGAR
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, "configuracion", "general"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.mensaje_global) setMensajeGlobal(data.mensaje_global);
          if (data.version_actual) setAppVersion(data.version_actual);
        }

        const planesSnap = await getDoc(doc(db, "configuracion", "planes"));
        if (planesSnap.exists()) {
          const data = planesSnap.data();
          const listaPlanes = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).filter(p => p.activo);
          
          listaPlanes.sort((a, b) => a.costoCreditos - b.costoCreditos);
          setPlanesDB(listaPlanes);
        }
      } catch (e) { console.error(e); }
    };
    fetchConfig();
  }, []);

  // 3. DIAS Y PORCENTAJE
  useEffect(() => {
    if (licenseData?.fecha_vencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = new Date(licenseData.fecha_vencimiento);
      vencimiento.setMinutes(vencimiento.getMinutes() + vencimiento.getTimezoneOffset());
      const diff = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
      setDiasRestantes(diff);

      // Lógica simple para barra de progreso (suponiendo ciclo de 30 días como base visual)
      let percent = Math.max(0, Math.min(100, (diff / 30) * 100));
      if (diff > 30) percent = 100; 
      setPorcentajeDias(percent);
    }
  }, [licenseData]);

  const verificarLicencia = async (usuario) => {
    try {
      const docRef = doc(db, "licenciaWaCRM", usuario.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLicenseData(data);
        if (['revendedor', 'vip', 'admin'].includes(data.rol)) setIsReseller(true);
      } else {
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 2); 
        const fechaStr = fechaFin.toISOString().split('T')[0];
        const serial = "WAICRM-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        const newData = {
          activa: true,
          fecha_vencimiento: fechaStr,
          email: usuario.email,
          nombre: usuario.displayName,
          license_key: serial,
          fecha_creacion_web: new Date().toISOString(),
          hwid: "",
          rol: "usuario", 
          tipo_plan: "gratis", 
          licencias_disponibles: 0 
        };
        await setDoc(docRef, newData);
        setLicenseData(newData);
      }
    } catch (error) { console.error(error); }
  };

  // --- BOTÓN ADMIN ---
  const handleSubirPlanesAutomaticamente = async () => {
    if (!window.confirm("¿Seguro que quieres subir todos los planes?")) return;
    try {
      await setDoc(doc(db, "configuracion", "planes"), PLANES_PARA_DB);
      alert("✅ ¡ÉXITO! Recarga la página.");
      window.location.reload();
    } catch (e) { alert("❌ Error: " + e.message); }
  };

  // --- TRANSACCIÓN ---
  const handleProcesarVenta = async (e) => {
    e.preventDefault();
    setVentaMsg("Procesando...");
    if (!ventaEmail.includes("@")) { setVentaMsg("❌ Email inválido"); return; }
    if (!ventaOpcionID) { setVentaMsg("❌ Selecciona un plan"); return; }
    const planSeleccionado = planesDB.find(p => p.id === ventaOpcionID);
    if (!planSeleccionado) { setVentaMsg("❌ Plan no encontrado"); return; }

    try {
      await runTransaction(db, async (transaction) => {
        const resellerRef = doc(db, "licenciaWaCRM", user.email);
        const resellerDoc = await transaction.get(resellerRef);
        if (!resellerDoc.exists()) throw "Error cuenta";
        
        const miSaldo = resellerDoc.data().licencias_disponibles || 0;
        const costo = planSeleccionado.costoCreditos;
        if (miSaldo < costo) throw `❌ Saldo insuficiente. Tienes ${miSaldo}, requieres ${costo}.`;

        const clienteRef = doc(db, "licenciaWaCRM", ventaEmail);
        const clienteDoc = await transaction.get(clienteRef);
        
        let clienteData = clienteDoc.exists() ? clienteDoc.data() : {
            email: ventaEmail, nombre: "Cliente Externo", license_key: "WAI-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            fecha_creacion_web: new Date().toISOString(), hwid: "", rol: "usuario", tipo_plan: "gratis", licencias_disponibles: 0
        };

        const creditosAEntregar = planSeleccionado.creditosOtorgados || 0;
        if (creditosAEntregar > 0) {
            clienteData.licencias_disponibles = (clienteData.licencias_disponibles || 0) + creditosAEntregar;
            if (planSeleccionado.categoria === 'vip') clienteData.rol = 'vip';
            else if (planSeleccionado.categoria === 'revendedor') clienteData.rol = 'revendedor';
            else if (clienteData.rol === 'usuario') clienteData.rol = 'revendedor';
            clienteData.tipo_plan = planSeleccionado.id; 
        } else {
            const fechaBase = new Date();
            const fechaFin = new Date(fechaBase);
            fechaFin.setDate(fechaFin.getDate() + (planSeleccionado.dias || 30));
            clienteData.activa = true;
            clienteData.fecha_vencimiento = fechaFin.toISOString().split('T')[0];
            clienteData.tipo_plan = planSeleccionado.id;
        }
        clienteData.updated_by = user.email;
        transaction.update(resellerRef, { licencias_disponibles: miSaldo - costo });
        if (clienteDoc.exists()) transaction.update(clienteRef, clienteData); else transaction.set(clienteRef, clienteData);
      });
      setVentaMsg(`✅ Activado: ${planSeleccionado.nombre}`); setVentaEmail(""); verificarLicencia(user); 
    } catch (error) { setVentaMsg(typeof error === 'string' ? error : "❌ Error transacción"); }
  };

  const getPlanesPorCategoria = (cat) => {
    return planesDB.filter(p => {
        const categoria = p.categoria || (p.id.includes('personal') ? 'personal' : p.id.includes('revendedor') || p.id.includes('r_') ? 'revendedor' : 'vip');
        return categoria === cat;
    });
  };

  const handleLogin = async () => { try { await signInWithPopup(auth, provider); } catch (e) { alert(e.message); } };
  const handleLogout = () => { signOut(auth); setUser(null); };
  const handleCopy = () => { navigator.clipboard.writeText(user.email); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-900 font-bold">Cargando...</div>;

  // --- VISTA LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 font-sans relative overflow-hidden">
        {/* Fondo Decorativo */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-black opacity-90"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {mensajeGlobal && <div className="absolute top-0 left-0 w-full bg-yellow-500 text-gray-900 text-center py-3 font-black text-sm shadow-lg z-50 tracking-wide">📢 {mensajeGlobal}</div>}
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-10 text-center relative z-10">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform -rotate-3">
             <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">WAI<span className="text-blue-400">CRM</span></h1>
          <p className="text-blue-200 text-lg font-medium mb-8">El Agente IA #1 para WhatsApp</p>
          
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-white/10">
             <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-sm mb-2 uppercase tracking-widest"><Icons.Crown /> <span>Prueba Gratuita</span></div>
             <p className="text-gray-300 text-sm">Acceso total a funciones Premium por 2 días. Sin tarjeta de crédito.</p>
          </div>

          <button onClick={handleLogin} className="w-full bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg transform hover:-translate-y-1">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 mr-3" alt="G" />
              <span>Continuar con Google</span>
          </button>
          
          <p className="mt-8 text-xs text-gray-500">Al ingresar aceptas nuestros términos de servicio.</p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-72 bg-white border-r border-gray-100 flex flex-col shadow-xl md:shadow-none`}>
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">WAI<span className="text-blue-600">PRO</span></h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        
        <div className="p-6">
           <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3 border border-blue-100">
              <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                 <p className="text-xs text-blue-600 font-medium truncate">{isReseller ? 'Socio Verificado' : 'Usuario'}</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab("inicio")} className={`flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === "inicio" ? "bg-gray-900 text-white shadow-lg shadow-gray-200 transform scale-105" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}><Icons.Home /> <span className="ml-3">Dashboard</span></button>
          
          {isReseller && (
            <button onClick={() => setActiveTab("revendedor")} className={`flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === "revendedor" ? "bg-green-600 text-white shadow-lg shadow-green-200 transform scale-105" : "text-gray-500 hover:bg-green-50 hover:text-green-700"}`}>
              <Icons.Reseller /> <span className="ml-3">Zona Socios</span>
            </button>
          )}

          <button onClick={() => setActiveTab("planes")} className={`flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === "planes" ? "bg-blue-600 text-white shadow-lg shadow-blue-200 transform scale-105" : "text-gray-500 hover:bg-blue-50 hover:text-blue-700"}`}><Icons.Plan /> <span className="ml-3">Planes & Precios</span></button>
          <button onClick={() => setActiveTab("tutoriales")} className={`flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === "tutoriales" ? "bg-purple-600 text-white shadow-lg shadow-purple-200 transform scale-105" : "text-gray-500 hover:bg-purple-50 hover:text-purple-700"}`}><Icons.Video /> <span className="ml-3">Academia</span></button>
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <a href={WHATSAPP_SOPORTE} target="_blank" rel="noreferrer" className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"><Icons.Support /> <span className="ml-3">Ayuda & Soporte</span></a>
             <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"><Icons.Logout /> <span className="ml-3">Cerrar Sesión</span></button>
          </div>
        </nav>
        
        {/* Banner Descarga */}
        <div className="p-4">
           <a href={LINK_DESCARGA} target="_blank" rel="noreferrer" className="block w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-4 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full -mr-8 -mt-8"></div>
             <p className="text-xs text-gray-400 font-bold uppercase mb-1">Versión Windows</p>
             <p className="text-sm font-bold flex items-center justify-center gap-2"><Icons.Windows /> Descargar App</p>
           </a>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-8 shadow-sm z-20 sticky top-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 mr-4"><Icons.Menu /></button>
            <div>
               <h3 className="text-xl font-black text-gray-800 capitalize tracking-tight">{activeTab === 'revendedor' ? 'Panel de Control' : activeTab}</h3>
               <p className="text-xs text-gray-400 font-medium">Bienvenido de nuevo, {user.displayName.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {mensajeGlobal && <div className="hidden md:block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-xs font-bold animate-pulse">📢 {mensajeGlobal}</div>}
             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200">🔔</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          
          {/* --- TAB: INICIO (REDDISEÑADO PRO) --- */}
          {activeTab === "inicio" && (
            <div className="max-w-6xl mx-auto space-y-8">
               
               {/* 1. SECCIÓN ESTADO LICENCIA (HERO CARD) */}
               <div className="grid md:grid-cols-3 gap-6">
                  {/* Tarjeta Principal */}
                  <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl p-8 flex flex-col justify-between min-h-[220px]">
                     {/* Fondo abstracto */}
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-16 -mb-16"></div>
                     
                     <div className="relative z-10 flex justify-between items-start">
                        <div>
                           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Estado del Servicio</p>
                           <h2 className="text-3xl font-black tracking-tight mb-1 flex items-center gap-3">
                              {diasRestantes > 0 ? "Licencia Activa" : "Licencia Vencida"}
                              <span className={`w-3 h-3 rounded-full ${diasRestantes > 0 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`}></span>
                           </h2>
                           <p className="text-gray-400 text-sm">
                              {diasRestantes > 0 ? `Tu software está funcionando correctamente.` : `Renueva para continuar usando el servicio.`}
                           </p>
                        </div>
                        {diasRestantes > 0 && <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-xs font-bold">PLAN {licenseData?.tipo_plan?.split('_')[0].toUpperCase()}</div>}
                     </div>

                     <div className="relative z-10 mt-6">
                        <div className="flex justify-between text-xs font-bold mb-2">
                           <span>Días Restantes: {Math.max(0, diasRestantes)}</span>
                           <span>{porcentajeDias.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                           <div className={`h-full rounded-full transition-all duration-1000 ease-out ${diasRestantes > 5 ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-red-500"}`} style={{ width: `${porcentajeDias}%` }}></div>
                        </div>
                     </div>
                  </div>

                  {/* Tarjeta Credencial (Estilo Glass ID) */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Icons.Key /></div>
                      <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Tu Credencial de Acceso</h4>
                      
                      <div className="flex-1 flex flex-col justify-center">
                         <label className="text-xs text-gray-400 font-bold mb-1 ml-1">Usuario (Email)</label>
                         <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between group-hover:border-blue-300 transition">
                            <span className="font-mono text-sm font-bold text-gray-700 truncate mr-2">{user.email}</span>
                            <button onClick={handleCopy} className={`p-2 rounded-lg text-xs font-bold transition ${copied ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 shadow-sm hover:text-blue-600'}`}>{copied ? 'OK' : 'COPIAR'}</button>
                         </div>
                         <p className="text-[10px] text-gray-400 mt-2 text-center">Usa este correo para loguearte en el software.</p>
                      </div>
                  </div>
               </div>

               {/* 2. SECCIÓN DETALLES (GRID) */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <p className="text-gray-400 text-xs font-bold uppercase mb-1">Vencimiento</p>
                     <p className="text-lg font-bold text-gray-800">{licenseData?.fecha_vencimiento || "--"}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <p className="text-gray-400 text-xs font-bold uppercase mb-1">Plan Actual</p>
                     <p className="text-lg font-bold text-blue-600 capitalize">{licenseData?.tipo_plan?.replace(/_/g, ' ') || "Gratis"}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <p className="text-gray-400 text-xs font-bold uppercase mb-1">Versión</p>
                     <p className="text-lg font-bold text-gray-800">{appVersion}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <p className="text-gray-400 text-xs font-bold uppercase mb-1">ID Hardware</p>
                     <p className={`text-lg font-bold ${licenseData?.hwid ? "text-green-600" : "text-yellow-600"}`}>{licenseData?.hwid ? "Vinculado" : "Pendiente"}</p>
                  </div>
               </div>
               
               {/* 3. BOTÓN RENOVAR (Si aplica) */}
               {diasRestantes <= 5 && (
                 <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xl">!</div>
                       <div>
                          <h4 className="font-bold text-red-800">Tu licencia está por vencer</h4>
                          <p className="text-red-600 text-sm">Evita interrupciones en tu servicio renovando hoy mismo.</p>
                       </div>
                    </div>
                    <button onClick={() => setActiveTab("planes")} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition">Renovar Ahora</button>
                 </div>
               )}

            </div>
          )}

          {/* --- TAB: REVENDEDOR --- */}
          {activeTab === "revendedor" && isReseller && (
            <div className="max-w-4xl mx-auto space-y-6">
               {/* Header Saldo */}
               <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <h2 className="text-3xl font-black mb-2">{licenseData?.licencias_disponibles || 0}</h2>
                  <p className="text-green-100 font-medium uppercase tracking-wider text-sm">Licencias (Créditos) Disponibles</p>
                  <div className="mt-6 flex gap-3">
                     <button onClick={() => setActiveTab('planes')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-2 rounded-lg font-bold text-sm transition">Comprar Stock</button>
                     <button onClick={() => alert("Historial pronto")} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-lg font-bold text-sm transition">Ver Historial</button>
                  </div>
               </div>

               {/* Formulario */}
               <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Icons.Key /> Activar Licencia / Transferir Stock</h3>
                  
                  <form onSubmit={handleProcesarVenta} className="space-y-6">
                     {/* Selector de Tipo Estilizado */}
                     <div className="flex p-1 bg-gray-100 rounded-xl">
                        {['personal', 'revendedor', 'vip'].map(type => (
                           <button 
                             key={type}
                             type="button" 
                             onClick={() => { setVentaTipo(type); setVentaOpcionID(''); }} 
                             className={`flex-1 py-3 rounded-lg text-sm font-bold capitalize transition-all ${ventaTipo === type ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             {type === 'personal' ? 'Cliente Final' : type}
                           </button>
                        ))}
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo Electrónico del Cliente</label>
                        <input type="email" required placeholder="nombre@correo.com" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition font-medium" value={ventaEmail} onChange={(e) => setVentaEmail(e.target.value)} />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {getPlanesPorCategoria(ventaTipo).length > 0 ? (
                          getPlanesPorCategoria(ventaTipo).map((op) => (
                             <div key={op.id} onClick={() => setVentaOpcionID(op.id)} className={`cursor-pointer p-4 rounded-xl border-2 transition relative ${ventaOpcionID === op.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                                <h4 className="font-bold text-gray-800 text-sm">{op.nombre}</h4>
                                <div className="flex justify-between items-end mt-3">
                                   <span className="text-xs text-gray-500 font-medium">Costo:</span>
                                   <span className="font-black text-gray-900 text-lg">{op.costoCreditos}</span>
                                </div>
                                {op.creditosOtorgados > 0 && <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">STOCK</div>}
                             </div>
                          ))
                        ) : <p className="col-span-3 text-center text-gray-400 py-4">No hay planes disponibles.</p>}
                     </div>

                     <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                        PROCESAR ACTIVACIÓN
                     </button>
                  </form>
                  {ventaMsg && <div className={`mt-6 p-4 rounded-xl text-center font-bold animate-pulse ${ventaMsg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ventaMsg}</div>}
               </div>
            </div>
          )}

          {/* --- TAB: PLANES (PÚBLICO) --- */}
          {activeTab === "planes" && (
            <div className="max-w-6xl mx-auto text-center space-y-8">
               <div className="max-w-2xl mx-auto">
                 <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Elige el plan perfecto</h2>
                 <p className="text-gray-500 text-lg">Desbloquea todo el potencial de tu negocio con nuestras herramientas de automatización.</p>
               </div>
               
               {/* 1. SWITCHER DE CATEGORÍA VISUAL */}
               <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 mb-8">
                  {['personal', 'revendedor', 'vip'].map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setPlanFilter(cat)}
                      className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${planFilter === cat ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {cat === 'personal' ? 'Para Mí' : cat === 'revendedor' ? 'Revendedor' : 'Socio VIP'}
                    </button>
                  ))}
               </div>

               {/* 2. GRID DE PLANES */}
               <div className="grid md:grid-cols-3 gap-8 text-left">
                  {getPlanesPorCategoria(planFilter).length > 0 ? getPlanesPorCategoria(planFilter).map((plan, i) => (
                    <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
                       <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${planFilter === 'personal' ? 'from-blue-500 to-indigo-500' : planFilter === 'revendedor' ? 'from-green-500 to-emerald-500' : 'from-yellow-400 to-orange-500'}`}></div>
                       
                       <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${planFilter === 'personal' ? 'text-blue-600' : planFilter === 'revendedor' ? 'text-green-600' : 'text-yellow-600'}`}>{plan.nombre}</h3>
                       
                       <div className="flex items-baseline mb-6">
                          <span className="text-4xl font-black text-gray-900 tracking-tight">{plan.precio_sugerido}</span>
                          <span className="text-gray-400 ml-2 font-medium text-sm">/ {plan.dias > 0 ? (plan.dias / 30) + ' mes' : 'pack'}</span>
                       </div>
                       
                       <div className="space-y-4 mb-8">
                          {plan.caracteristicas ? plan.caracteristicas.map((f, idx) => (
                             <div key={idx} className="flex items-start">
                                <div className={`mt-1 p-0.5 rounded-full ${planFilter === 'personal' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                <span className="ml-3 text-sm text-gray-600 font-medium">{f}</span>
                             </div>
                          )) : <p className="text-gray-400 text-sm">Características no disponibles.</p>}
                       </div>

                       <a href={`${WHATSAPP_SOPORTE}?text=Hola, me interesa el plan ${plan.nombre}`} target="_blank" rel="noreferrer" className={`block w-full py-4 text-center rounded-xl font-bold text-white transition-all shadow-lg ${planFilter === 'personal' ? 'bg-gray-900 hover:bg-black' : planFilter === 'revendedor' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                          {planFilter === 'personal' ? 'Comenzar Ahora' : 'Solicitar Pack'}
                       </a>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center py-12">
                       <div className="inline-block p-4 rounded-full bg-gray-50 mb-4 animate-spin">⏳</div>
                       <p className="text-gray-400 font-medium">Cargando planes de la base de datos...</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* --- TAB: TUTORIALES --- */}
          {activeTab === "tutoriales" && (
             <div className="w-full h-full absolute inset-0 p-8 pt-0 overflow-hidden">
                <iframe src={URL_TUTORIALES} className="w-full h-full rounded-3xl border border-gray-200 shadow-xl bg-white" title="Tutoriales" frameBorder="0"></iframe>
             </div>
          )}

        </main>
      </div>

      {/* --- BOTÓN FLOTANTE ADMIN (SOLO PARA CARGAR DATA - BORRAR LUEGO) --- */}
      <button onClick={handleSubirPlanesAutomaticamente} className="fixed bottom-4 right-4 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg font-bold text-xs z-50 hover:scale-110 transition opacity-50 hover:opacity-100" title="Cargar Planes DB">⚡</button>

    </div>
  );
}

export default App;
