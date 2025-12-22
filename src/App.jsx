import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

// Links
const WHATSAPP_VENTAS = "https://wa.me/573000000000?text=Hola,%20quiero%20adquirir%20el%20plan%20"; 
const LINK_DESCARGA = "https://tudominio.com/descargar-wacrm"; 
// URL DE TUTORIALES
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
  Check: () => <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
};

// --- DATA DE PLANES ---
const PLANES_DATA = [
  {
    nombre: "Mensual",
    precio: "$15 USD",
    periodo: "/mes",
    color: "blue",
    features: ["Licencia para 1 PC", "Envíos Ilimitados", "Soporte Básico", "Actualizaciones incluidas"],
    popular: false
  },
  {
    nombre: "Semestral",
    precio: "$70 USD",
    periodo: "/6 meses",
    color: "purple",
    features: ["Licencia para 1 PC", "Ahorras 20%", "Soporte Prioritario", "Actualizaciones VIP", "Anti-Ban System"],
    popular: true 
  },
  {
    nombre: "Anual",
    precio: "$120 USD",
    periodo: "/año",
    color: "indigo",
    features: ["Licencia para 2 PC", "Mejor Precio", "Soporte Remoto 24/7", "Todas las funciones PRO", "Garantía total"],
    popular: false
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseData, setLicenseData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(0); 
  
  // VARIABLES DINÁMICAS
  const [mensajeGlobal, setMensajeGlobal] = useState(""); 
  const [appVersion, setAppVersion] = useState("v1.0.0"); // Default

  const [activeTab, setActiveTab] = useState("inicio"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  // --- 1. PERSISTENCIA ---
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

  // --- 2. CONFIGURACIÓN GLOBAL (CORREGIDO PARA DEBUG) ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("Intentando leer configuracion/general..."); // DEBUG
        const docRef = doc(db, "configuracion", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Datos encontrados:", data); // DEBUG
          
          if (data.mensaje_global) setMensajeGlobal(data.mensaje_global);
          if (data.version_actual) setAppVersion(data.version_actual);
        } else {
          console.log("El documento 'configuracion/general' no existe en Firebase.");
        }
      } catch (e) { 
        console.error("Error leyendo configuración:", e); 
      }
    };
    fetchConfig();
  }, []);

  // --- 3. CÁLCULO DE DÍAS ---
  useEffect(() => {
    if (licenseData?.fecha_vencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = new Date(licenseData.fecha_vencimiento);
      const offset = vencimiento.getTimezoneOffset();
      vencimiento.setMinutes(vencimiento.getMinutes() + offset);
      const diferenciaTiempo = vencimiento - hoy;
      const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
      setDiasRestantes(diferenciaDias);
    }
  }, [licenseData]);

  const verificarLicencia = async (usuario) => {
    try {
      const emailKey = usuario.email; 
      const docRef = doc(db, "licenciaWaCRM", emailKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLicenseData(docSnap.data());
      } else {
        // Lógica de creación (2 días)
        const fechaActual = new Date();
        const fechaFin = new Date(fechaActual);
        fechaFin.setDate(fechaActual.getDate() + 2); 
        
        const year = fechaFin.getFullYear();
        const month = String(fechaFin.getMonth() + 1).padStart(2, '0');
        const day = String(fechaFin.getDate()).padStart(2, '0');
        const fechaVencimientoString = `${year}-${month}-${day}`;
        const serialRandom = "WAICRM-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        const newData = {
          activa: true,
          fecha_vencimiento: fechaVencimientoString,
          email: usuario.email,
          nombre: usuario.displayName,
          license_key: serialRandom,
          fecha_creacion_web: new Date().toISOString(),
          hwid: "", 
        };
        await setDoc(docRef, newData);
        setLicenseData(newData);
      }
    } catch (error) {
      console.error("Error trayendo data:", error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try { await signInWithPopup(auth, provider); } catch (error) { alert("Error: " + error.message); setLoading(false); }
  };

  const handleLogout = () => { signOut(auth); setUser(null); setLicenseData(null); };

  const handleCopy = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-blue-900 font-bold">Cargando sistema...</div>;

  // --- VISTA LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4 font-sans">
        {mensajeGlobal && <div className="absolute top-0 left-0 w-full bg-yellow-400 text-blue-900 text-center py-2 font-bold text-sm shadow-md z-20 px-4">📢 {mensajeGlobal}</div>}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative z-10 transition-all duration-300 border-t-8 border-blue-500">
          <h1 className="text-4xl font-black text-gray-800 mb-1 tracking-tighter">WAICRM<span className="text-blue-600">-PRO</span></h1>
          <div className="mt-6 animate-fade-in-down">
            <div className="bg-blue-50 rounded-lg p-3 mb-6 inline-block border border-blue-100">
               <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">¡2 DÍAS GRATIS!</p>
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">Regístrate y automatiza tu WhatsApp</p>
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mb-8 text-sm">
              <Icons.Check /> <span>Incluye todas las funciones premium</span>
            </div>
            <button onClick={handleLogin} className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="w-6 h-6 mr-3"><svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></div>
                <span className="group-hover:text-blue-600 transition-colors">Regístrate con Google</span>
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"><span>🔒 Encuentra la clave de tu licencia al iniciar sesión</span></div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA PANEL ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-blue-900 tracking-tighter">WACRM<span className="text-blue-500">PRO</span></h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => { setActiveTab("inicio"); setSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === "inicio" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>
            <Icons.Home /> <span className="ml-3">Inicio</span>
          </button>
          
          <button onClick={() => { setActiveTab("planes"); setSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === "planes" ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}>
            <Icons.Plan /> <span className="ml-3">Planes Premium</span>
          </button>
          
          <button onClick={() => { setActiveTab("tutoriales"); setSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === "tutoriales" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>
            <Icons.Video /> <span className="ml-3">Tutoriales</span>
          </button>
          
          <a href={WHATSAPP_VENTAS + "Soporte"} target="_blank" rel="noreferrer" className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 hover:text-green-600 transition-colors">
            <Icons.Support /> <span className="ml-3">Soporte WhatsApp</span>
          </a>

          <a href={LINK_DESCARGA} target="_blank" rel="noreferrer" className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 hover:text-blue-600 transition-colors">
            <Icons.Download /> <span className="ml-3">Descargar Software</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <Icons.Logout /> <span className="ml-3">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 mr-4 focus:outline-none"><Icons.Menu /></button>
            <h3 className="text-lg font-bold text-gray-700 capitalize">{activeTab.replace("planes", "Planes & Precios")}</h3>
          </div>
          <div className="flex items-center space-x-3">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-gray-800">{user.displayName}</p>
               <p className="text-xs text-gray-500">{user.email}</p>
             </div>
             <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200" />
          </div>
        </header>

        {mensajeGlobal && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-6 mt-6 rounded shadow-sm"><p className="font-bold">📢 Aviso Importante</p><p>{mensajeGlobal}</p></div>}

        <main className="flex-1 overflow-y-auto p-6 relative">
          
          {/* TAB: INICIO */}
          {activeTab === "inicio" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                   <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Estado de Licencia</h4>
                   <div className="flex items-center gap-2">
                      <span className={`text-3xl font-black ${diasRestantes > 0 ? "text-green-500" : "text-red-500"}`}>{diasRestantes > 0 ? "ACTIVA" : "VENCIDA"}</span>
                      {diasRestantes > 0 && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">PRO</span>}
                   </div>
                   <p className="text-gray-400 text-sm mt-1">{diasRestantes > 0 ? `Te quedan ${diasRestantes} días de acceso.` : `Expiró hace ${Math.abs(diasRestantes)} días.`}</p>
                </div>
                {diasRestantes <= 0 && <button onClick={() => setActiveTab("planes")} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-center transition shadow-lg shadow-red-200">Renovar Ahora</button>}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2">
                 <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Tu Credencial de Acceso</h4>
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                       <label className="text-xs text-gray-400 font-semibold block mb-1">Usuario / Email</label>
                       <input readOnly value={user.email} className="w-full bg-transparent font-mono text-gray-800 font-bold focus:outline-none text-lg"/>
                    </div>
                    <button onClick={handleCopy} className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${copied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}>{copied ? '¡Copiado!' : 'Copiar'}</button>
                 </div>
                 <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">Use este correo en el software de escritorio.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-3">
                 <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Detalles Técnicos</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-gray-400">Fecha Registro</p><p className="font-semibold text-gray-700">{new Date(licenseData?.fecha_creacion_web).toLocaleDateString() || "N/A"}</p></div>
                    <div><p className="text-gray-400">Vencimiento</p><p className="font-semibold text-blue-600">{licenseData?.fecha_vencimiento || "N/A"}</p></div>
                    {/* VERSIÓN CONECTADA A FIREBASE */}
                    <div><p className="text-gray-400">Versión Actual</p><p className="font-semibold text-gray-700">{appVersion}</p></div>
                    <div><p className="text-gray-400">Estado HWID</p><p className="font-semibold text-gray-700">{licenseData?.hwid ? "Vinculado PC" : "Pendiente"}</p></div>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: PLANES */}
          {activeTab === "planes" && (
            <div className="max-w-6xl mx-auto text-center">
               <h2 className="text-3xl font-black text-gray-800 mb-2">Elige el plan perfecto para ti</h2>
               <p className="text-gray-500 mb-10">Desbloquea todo el potencial de WaCRM y automatiza tus ventas.</p>

               <div className="grid md:grid-cols-3 gap-8">
                  {PLANES_DATA.map((plan, index) => (
                    <div key={index} className={`relative bg-white rounded-3xl p-8 border transition-all duration-300 ${plan.popular ? "border-purple-500 shadow-2xl scale-105 z-10" : "border-gray-200 shadow-lg hover:shadow-xl"}`}>
                       {plan.popular && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Más Popular</div>}
                       <h3 className={`text-xl font-bold mb-2 text-${plan.color}-600`}>{plan.nombre}</h3>
                       <div className="flex justify-center items-baseline mb-6">
                          <span className="text-4xl font-black text-gray-800">{plan.precio}</span>
                          <span className="text-gray-400">{plan.periodo}</span>
                       </div>
                       <ul className="space-y-4 mb-8 text-left">
                          {plan.features.map((feat, i) => (
                             <li key={i} className="flex items-center text-sm text-gray-600">
                                <Icons.Check /> {feat}
                             </li>
                          ))}
                       </ul>
                       <a href={WHATSAPP_VENTAS + plan.nombre} target="_blank" rel="noreferrer" className={`block w-full py-3 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 ${plan.popular ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-800 hover:bg-black"}`}>
                          Elegir Plan
                       </a>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* TAB: TUTORIALES (IFRAME CORREGIDO) */}
          {activeTab === "tutoriales" && (
             <div className="w-full h-full absolute inset-0 p-6 pt-0 overflow-hidden">
                <iframe 
                  src={URL_TUTORIALES} 
                  title="Tutoriales WaCRM"
                  className="w-full h-full rounded-2xl border border-gray-200 shadow-sm"
                  frameBorder="0"
                ></iframe>
             </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
