import {Injectable, signal, WritableSignal} from '@angular/core';
import {initializeApp} from "firebase/app";
import {addDoc, collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query} from "firebase/firestore";
import {browserSessionPersistence, getAuth, GoogleAuthProvider, setPersistence, signInWithPopup} from "firebase/auth";
import {environment} from '../environments/environment';
import {ShowResource, ShowResourceLibrary} from '../interfaces/show';
import {User} from '@firebase/auth';
import {UsersDetails} from '../interfaces/users';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private firebaseConfig = {
    apiKey: environment.firebaseKey,
    authDomain: "pintastreaming.firebaseapp.com",
    projectId: "pintastreaming",
    storageBucket: "pintastreaming.firebasestorage.app",
    messagingSenderId: environment.firebaseMessagingSenderId,
    appId: environment.firebaseAppId,
    measurementId: environment.firebaseMeasurementId
  };

  // Initialize Firebase
  private app = initializeApp(this.firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  private auth = getAuth(this.app);

  private db = getFirestore(this.app);

  private provider = new GoogleAuthProvider();

  private userDetails: WritableSignal<User | null> = signal(null);
  private isAdminFlag: WritableSignal<boolean> = signal(false);

  async loginWithGoogle() {
    this.auth.languageCode = 'it';
    try {
      await setPersistence(this.auth, browserSessionPersistence);
      const result = await signInWithPopup(this.auth, this.provider);
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      this.userDetails.set(result.user);
      await this.fetchIsAdmin();
      return this.userDetails.asReadonly();
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error(errorCode, errorMessage, email, credential);
      return null;
    }
  }

  async getUserDetails() {
    await this.auth.authStateReady();
    this.userDetails.set(this.auth.currentUser);
    return this.userDetails.asReadonly();
  }

  async updateShows(newMovies: ShowResource[], newTvSeries: ShowResource[]) {
    await addDoc(collection(this.db, "shows"), {
      date: new Date(),
      movies: newMovies,
      tvSeries: newTvSeries,
    });
  }

  async isAdmin() {
    await this.fetchIsAdmin();
    return this.isAdminFlag.asReadonly();
  }

  private async fetchIsAdmin() {
    console.log("isAdmin check");
    const user = await this.getUserDetails();
    const userUID = user()?.uid;

    if (!userUID || userUID === '') {
      this.isAdminFlag.set(false);
      return;
    }

    const docRef = doc(this.db, "users", userUID || '');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const user = docSnap.data() as UsersDetails;
      this.isAdminFlag.set(user.role === 'admin');
    } else {
      this.isAdminFlag.set(false);
    }
  }

  async fetchShows() {
    const q = query(
      collection(this.db, "shows"),
      orderBy("date", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0].data();
    console.log(querySnapshot);
    console.log(data);
    return data as ShowResourceLibrary;
  }

}
