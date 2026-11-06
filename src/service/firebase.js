import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmFscp32iwlMZ-6wY4f-bssye5rw63Hd8",
  authDomain: "uberclone-11943.firebaseapp.com",
  projectId: "uberclone-11943",
  storageBucket: "uberclone-11943.firebasestorage.app",
  messagingSenderId: "879857380599",
  appId: "1:879857380599:web:5d4d8035489357831337f2",
  measurementId: "G-XPXLWP986L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);