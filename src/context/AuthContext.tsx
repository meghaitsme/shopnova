import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../data/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔐 [Auth] State changed. User:", currentUser?.email || "Guest");
      
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ LOGIN FUNCTION
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 [Auth] Attempting login...");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ [Auth] Login successful");
    } catch (error) {
      console.error("❌ [Auth] Login failed:", error);
      throw error; // Throw error so Login.tsx can catch it
    }
  };

  // ✅ REGISTER FUNCTION
  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("📝 [Auth] Attempting registration...");
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Update their display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // 3. (Optional) Save their profile in Firestore 'users' collection
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      console.log("✅ [Auth] Registration successful");
    } catch (error) {
      console.error("❌ [Auth] Registration failed:", error);
      throw error; // Throw error so Register.tsx can catch it
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};