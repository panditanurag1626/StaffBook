const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo",
    authDomain: "staffbook-e43b7.firebaseapp.com",
    projectId: "staffbook-e43b7",
    storageBucket: "staffbook-e43b7.firebasestorage.app",
    messagingSenderId: "834211101436",
    appId: "1:834211101436:web:20b1b8ff0bf74fcf4cf579"
};

const app = initializeApp(firebaseConfig);
try {
  const db = getDatabase(app);
  console.log('DB Type:', typeof db);
  if (db && db._repo) {
     console.log('Database URL assigned by default:', db._repo.repoInfo_.host);
  }
} catch (e) {
  console.error("Failed getDatabase:", e);
}
