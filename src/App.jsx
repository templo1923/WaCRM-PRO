rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para tus usuarios (ya las tienes)
    match /licenciaWaCRM/{email} {
      allow read, write: if request.auth != null;
    }

    // --- AGREGA ESTO PARA LA CONFIGURACIÓN ---
    match /configuracion/{documento} {
      allow read: if true;  // Cualquiera puede leer la versión y mensajes
      allow write: if false; // Nadie puede escribir, solo tú desde la consola
    }

  }
}
