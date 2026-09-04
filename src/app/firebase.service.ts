import {computed, inject, Injectable, resource, signal} from '@angular/core';
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
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {environment} from '../environments/environment';
import {ShowResource, ShowResourceLibrary} from '../interfaces/show';
import {User} from '@firebase/auth';
import {UserListItem, UsersDetails} from '../interfaces/users';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // Initialize Firebase
  private readonly app = initializeApp(environment.firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  private readonly auth = getAuth(this.app);

  private readonly db = getFirestore(this.app);

  private snackBar = inject(MatSnackBar);

  private readonly userSessionDetails = signal<User | undefined>(undefined);
  private readonly userInfosDetails = resource({
    params: () => {
      const userUID = this.userSessionDetails()?.uid;
      if (!userUID || userUID === '') {
        return undefined;
      }
      return {id: userUID};
    },
    loader: async ({params}) => {
      return await this.loadOrCreateProfile(params.id);
    },
    defaultValue: undefined,
  });
  readonly isLogged = computed(() => !!this.userSessionDetails());
  readonly isAdmin = computed(() => this.userInfosDetails.value()?.role === 'admin');

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    this.auth.languageCode = 'it';
    await setPersistence(this.auth, browserLocalPersistence);
    onAuthStateChanged(this.auth, async (user) => {
      if (!!user && !user.emailVerified) {
        await sendEmailVerification(user)
        this.snackBar.open('Email di verifica inviata', "OK", {duration: 2000});
        return;
      }
      this.userSessionDetails.set(user ?? undefined);
    });
  }

  // ============
  // LOGIN ACTION
  // ============

  async loginWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signupWithEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async loginWithGithub() {
    await signInWithPopup(this.auth, new GithubAuthProvider());
  }

  async logout() {
    await signOut(this.auth);
    this.userSessionDetails.set(undefined);
  }

  private async loadOrCreateProfile(uid: string) {
    const docRef = doc(this.db, 'users', uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as UsersDetails;
    }
    const newUserData: UsersDetails = {
      role: 'user',
      continueToWatch: [],
      favorites: []
    };
    await setDoc(docRef, newUserData, {merge: true});
    return newUserData;
  }

  getUserSessionDetails() {
    return this.userSessionDetails.asReadonly();
  }

  getUserInfosDetails() {
    return this.userInfosDetails.value;
  }

  // ============
  // USER DETAILS
  // ============

  async updateUser() {
    await setDoc(
      doc(
        this.db,
        "users",
        this.userSessionDetails()!.uid!
      ),
      this.userInfosDetails.value()
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
