const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo",
    authDomain: "staffbook-e43b7.firebaseapp.com",
    projectId: "staffbook-e43b7",
    storageBucket: "staffbook-e43b7.firebasestorage.app",
    messagingSenderId: "834211101436",
    appId: "1:834211101436:web:20b1b8ff0bf74fcf4cf579"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log(auth.currentUser);
