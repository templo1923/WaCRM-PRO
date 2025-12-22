import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE ---
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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [licenseData, setLicenseData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(0); // Nuevo estado para el contador

  // --- FUNCIÓN PARA CALCULAR DÍAS RESTANTES VISUALMENTE ---
  useEffect(() => {
    if (licenseData?.fecha_vencimiento) {
      const hoy = new Date();
      // Reiniciamos la hora de hoy a las 00:00 para comparar solo fechas
      hoy.setHours(0, 0, 0, 0);

      const vencimiento = new Date(licenseData.fecha_vencimiento);
      // Ajustamos zona horaria sumando las horas de diferencia para evitar desfases
      vencimiento.setMinutes(vencimiento.getMinutes() + vencimiento.getTimezoneOffset());

      const diferenciaTiempo = vencimiento - hoy;
      const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
      
      setDiasRestantes(diferenciaDias);
    }
  }, [licenseData]);


  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const emailKey = user.email; 
      const docRef = doc(db, "licenciaWaCRM", emailKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLicenseData(docSnap.data());
      } else {
        // --- CORRECCIÓN DE FECHAS (USAR HORA LOCAL) ---
        const fechaActual = new Date();
        const fechaFin = new Date(fechaActual);
        fechaFin.setDate(fechaActual.getDate() + 2); // Sumar 2 días exactos
        
        // Formatear manualmente a YYYY-MM-DD para evitar errores de zona horaria UTC
        const year = fechaFin.getFullYear();
        const month = String(fechaFin.getMonth() + 1).padStart(2, '0');
        const day = String(fechaFin.getDate()).padStart(2, '0');
        const fechaVencimientoString = `${year}-${month}-${day}`;

        const serialRandom = "WAI-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        const newData = {
          activa: true,
          fecha_vencimiento: fechaVencimientoString,
          email: user.email,
          nombre: user.displayName,
          license_key: serialRandom,
          fecha_creacion_web: new Date().toISOString(),
          hwid: "", 
          fecha_ultimo_acceso: "",
          fecha_registro_app: ""
        };

        await setDoc(docRef, newData);
        setLicenseData(newData);
      }
      
      setUser(user);
    } catch (error) {
      console.error("Error login:", error);
      alert("Error al iniciar sesión: " + error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
    setLicenseData(null);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-4 font-sans">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative z-10 transition-all duration-300">
        
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">WACRM</h1>

        {!user ? (
          <>
            <p className="text-red-500 font-bold text-lg uppercase tracking-wide mb-2">
              ¡PRUEBA GRATIS DE 2 DÍAS!
            </p>
            <p className="text-gray-600 text-base mb-2">
              Regístrate con un clic y activa tu licencia al instante.
            </p>

            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mb-8">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Licencia Automática Inmediata</span>
            </div>

            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Generando licencia...</span>
              ) : (
                <>
                  <div className="bg-white p-1 rounded-sm mr-3 flex items-center justify-center w-8 h-8">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <span className="text-lg">Entrar con Google</span>
                </>
              )}
            </button>
          </>

        ) : (
          <div className="text-left animate-fade-in-up">
            
            <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
              <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-full mr-4 border-2 border-blue-100" />
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{user.displayName}</h4>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* CAJA VERDE DINÁMICA */}
            <div className={`border rounded-lg p-4 mb-6 ${diasRestantes > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                 {diasRestantes > 0 ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 )}
                 
                 <p className={`${diasRestantes > 0 ? 'text-green-700' : 'text-red-700'} font-bold text-sm uppercase`}>
                    {diasRestantes > 0 
                      ? `LICENCIA ACTIVA (${diasRestantes} DÍAS RESTANTES)` 
                      : `LICENCIA VENCIDA (HACE ${Math.abs(diasRestantes)} DÍAS)`}
                 </p>
              </div>
              <p className={`text-xs ${diasRestantes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diasRestantes > 0 ? 'Tu cuenta está lista para usarse.' : 'Contacta a soporte para renovar.'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Tu Usuario (Email):</label>
              <div className="flex shadow-sm">
                <input 
                  readOnly 
                  value={user.email} 
                  className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-l-lg focus:outline-none text-sm"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-4 font-bold text-white transition-all rounded-r-lg text-sm flex items-center ${copied ? 'bg-green-500' : 'bg-blue-900 hover:bg-blue-800'}`}
                >
                  {copied ? '¡COPIADO!' : 'COPIAR'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 space-y-2">
               <div className="flex justify-between">
                 <span className="font-semibold">Vencimiento:</span>
                 {/* Aquí mostramos la fecha que viene de Firebase */}
                 <span className="font-bold text-blue-600">{licenseData?.fecha_vencimiento || "Cargando..."}</span>
               </div>
               <div className="flex justify-between">
                 <span className="font-semibold">Estado:</span>
                 {/* Si los días restantes son mayor a 0, está activo, si no, vencido */}
                 <span className={diasRestantes > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {diasRestantes > 0 ? "Activo" : "Vencido"}
                 </span>
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;