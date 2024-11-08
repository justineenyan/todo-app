import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {
  apiKey: "AIzaSyBPDg3PjYsoODp6VWrfWBj5m8Ejd6fRg4g",
  authDomain: "todo-app-ae996.firebaseapp.com",
  projectId: "todo-app-ae996",
  storageBucket: "todo-app-ae996.firebasestorage.app",
  messagingSenderId: "441284624570",
  appId: "1:441284624570:web:fe9455043bc7fc4d03c283"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };  