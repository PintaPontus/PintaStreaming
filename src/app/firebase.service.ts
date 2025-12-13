import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {initializeApp} from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc
} from "firebase/firestore";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {environment} from '../environments/environment';
import {ShowResource, ShowResourceLibrary} from '../interfaces/show';
import {User} from '@firebase/auth';
import {UserListItem, UsersDetails} from '../interfaces/users';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private readonly firebaseConfig = {
    apiKey: environment.firebaseKey,
    authDomain: "pintastreaming.firebaseapp.com",
    projectId: "pintastreaming",
    storageBucket: "pintastreaming.firebasestorage.app",
    messagingSenderId: environment.firebaseMessagingSenderId,
    appId: environment.firebaseAppId,
    measurementId: environment.firebaseMeasurementId
  };

  // Initialize Firebase
  private readonly app = initializeApp(this.firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  private readonly auth = getAuth(this.app);

  private readonly db = getFirestore(this.app);

  private readonly provider = new GoogleAuthProvider();

  private readonly userSessionDetails: WritableSignal<User | undefined> = signal(undefined);
  private readonly userInfosDetails: WritableSignal<UsersDetails | undefined> = signal(undefined);
  private readonly isAdminFlag: Signal<boolean> = computed(() => this.userInfosDetails()?.role === 'admin');

  // ============
  // LOGIN ACTION
  // ============

  async loginWithEmail(email: string, password: string) {
    await setPersistence(this.auth, browserSessionPersistence);
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    await this.setupLoggedUser(result.user);
  }

  async signupWithEmail(email: string, password: string) {
    await setPersistence(this.auth, browserSessionPersistence);
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.setupLoggedUser(result.user);
  }

  async loginWithGoogle() {
    this.auth.languageCode = 'it';
    await setPersistence(this.auth, browserSessionPersistence);
    const result = await signInWithPopup(this.auth, this.provider);
    await this.setupLoggedUser(result.user);
  }

  async logout() {
    await signOut(this.auth);
    this.userSessionDetails.set(undefined);
    this.userInfosDetails.set(undefined);
  }

  async setupLoggedUser(user: User) {

    this.userSessionDetails.set(user);
    const currentUser = await this.fetchCurrentUser();

    if (!currentUser()) {
      await setDoc(
        doc(this.db, "users", this.userSessionDetails()!.uid!),
        {
          role: 'user',
          continueToWatch: [],
          favorites: []
        } as UsersDetails);
    }
  }

  // ============
  // USER DETAILS
  // ============

  getUserSessionDetails() {
    this.auth.authStateReady()
      .then(_ => {
        this.userSessionDetails.set(this.auth.currentUser || undefined);
      });
    return this.userSessionDetails.asReadonly();
  }

  getUserInfosDetails() {
    this.fetchCurrentUser();
    return this.userInfosDetails.asReadonly();
  }

  isAdmin() {
    return this.isAdminFlag;
  }

  async fetchCurrentUser() {
    await this.auth.authStateReady();
    const userUID = this.userSessionDetails()?.uid;

    if (!userUID || userUID === '') {
      return this.userInfosDetails;
    }

    const docRef = doc(this.db, "users", userUID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return this.userInfosDetails;
    }

    const docData = docSnap.data() as UsersDetails;

    this.userInfosDetails.set(docData);

    return this.userInfosDetails;
  }

  async updateUser() {
    await setDoc(
      doc(
        this.db,
        "users",
        this.userSessionDetails()!.uid!
      ),
      this.userInfosDetails()
    );
  }

  // ==========
  // USER SHOWS
  // ==========

  async addToContinueToWatch(newShow: UserListItem) {
    this.userInfosDetails.update(userSnap => {
      if (!userSnap) {
        return userSnap;
      }

      const continueToWatch = this.addShowToContinueList(newShow, userSnap.continueToWatch)

      return {
        ...userSnap,
        continueToWatch
      };
    });
    await this.updateUser()
  }

  async removeContinueToWatch(oldShow: UserListItem) {
    this.userInfosDetails.update(userSnap => {
      if (!userSnap) {
        return userSnap;
      }

      const continueToWatch = this.removeShowToCommonList(oldShow, userSnap.continueToWatch)

      return {
        ...userSnap,
        continueToWatch
      };
    });
    await this.updateUser()
  }

  async toggleToFavorite(selectedShow: UserListItem) {
    this.userInfosDetails.update(userSnap => {
      if (!userSnap) {
        return userSnap;
      }

      const favoritesBase = userSnap.favorites || [];
      const exists = favoritesBase.some(f => f.id === selectedShow.id && f.type === selectedShow.type);

      const favorites = exists
        ? this.removeShowToCommonList(selectedShow, favoritesBase)
        : this.addShowToCommonList(selectedShow, favoritesBase);

      return {
        ...userSnap,
        favorites
      };
    });
    await this.updateUser()
  }

  private addShowToContinueList(newShow: UserListItem, showList: UserListItem[] | undefined) {
    const updatedList = this.addShowToCommonList(newShow, showList);
    return updatedList.slice(0, 20);
  }

  private addShowToCommonList(newShow: UserListItem, showList: UserListItem[] | undefined) {
    const baseList = showList ? [...showList] : [];

    baseList.push(newShow);

    const showsMap = new Map();

    baseList.forEach(currShow => {
      const key = `${currShow.type}-${currShow.id}`;
      const existingShow = showsMap.get(key) as UserListItem | undefined;

      showsMap.set(
        key,
        existingShow && (existingShow.lastUpdate || 0) > (currShow.lastUpdate || 0)
          ? existingShow
          : currShow
      )
    })

    const result = Array.from(showsMap.values());

    result.sort((a, b) => b.lastUpdate - a.lastUpdate);

    return result;
  }

  private removeShowToCommonList(oldShow: UserListItem, showList: UserListItem[] | undefined) {
    const baseList = showList ? [...showList] : [];

    const filteredList = baseList.filter(f => f.id !== oldShow.id || f.type !== oldShow.type);

    filteredList.sort((a, b) => b.lastUpdate - a.lastUpdate);

    return filteredList;
  }

  // =======================
  // STREAMMABLE SHOWS LISTS
  // =======================

  async fetchShows() {
    const q = query(
      collection(this.db, "shows"),
      orderBy("date", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0].data();
    return data as ShowResourceLibrary;
  }

  async updateShows(newMovies: ShowResource[], newTvSeries: ShowResource[]) {
    await addDoc(collection(this.db, "shows"), {
      date: new Date(),
      movies: newMovies,
      tvSeries: newTvSeries,
    });
  }

}
