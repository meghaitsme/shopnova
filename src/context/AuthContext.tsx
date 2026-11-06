
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { auth, db } from '../data/firebase';

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        setLoading(true);
        setUser(currentUser);
        setIsAdmin(false);

        if (currentUser) {

          console.log(
            '[Auth] Logged in:',
            currentUser.email
          );

          try {

            const userRef = doc(
              db,
              'users',
              currentUser.uid
            );

            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {

              const role = userSnap.data().role;

              setIsAdmin(role === 'admin');

              console.log(
                '[Auth] User role:',
                role
              );

            } else {

              console.warn(
                '[Auth] User profile does not exist.'
              );

              setIsAdmin(false);

            }

          } catch (error) {

            console.error(
              '[Auth] Error fetching user role:',
              error
            );

            setIsAdmin(false);

          }

        } else {

          console.log('[Auth] Guest user');

          setIsAdmin(false);

        }

        setLoading(false);

      }
    );

    return () => unsubscribe();

  }, []);

  // LOGIN
  const login = async (
    email: string,
    password: string
  ) => {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  };

  // REGISTER
  const register = async (
    email: string,
    password: string,
    name: string
  ) => {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const newUser = userCredential.user;

    try {

      await updateProfile(newUser, {
        displayName: name
      });

      await setDoc(
        doc(db, 'users', newUser.uid),
        {
          uid: newUser.uid,
          name: name,
          email: email,
          role: 'customer',
          createdAt: new Date()
        }
      );

      console.log(
        '[Auth] Customer profile created successfully'
      );

    } catch (error) {

      console.error(
        '[Auth] Profile creation failed:',
        error
      );

      throw error;

    }

  };

  // LOGOUT
  const logout = async () => {

    await signOut(auth);

  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        login,
        register,
        logout,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;

};
