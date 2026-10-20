import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile // <-- Import this to save the name
} from 'firebase/auth';
import { auth } from '../data/firebase';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>; // <-- Added name here
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 [Auth] Checking auth state...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("✅ [Auth] User is logged in:", currentUser.displayName || currentUser.email);
        localStorage.setItem('user', JSON.stringify({ email: currentUser.email, uid: currentUser.uid }));
      } else {
        console.log("❌ [Auth] No user logged in.");
        localStorage.removeItem('user');
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log(`🔑 [Auth] Attempting login for: ${email}`);
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ [Auth] Login successful!");
  };

  const register = async (email: string, password: string, name: string) => { // <-- Added name here
    console.log(`📝 [Auth] Attempting registration for: ${email}`);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Save the name to their profile
      await updateProfile(userCredential.user, { displayName: name });
      
      // 3. Force state update so the UI shows the name immediately
      setUser({ ...userCredential.user, displayName: name });
      
      console.log("✅ [Auth] Registration successful! Name saved:", name);
    } catch (error: any) {
      console.error("❌ [Auth] Registration failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    console.log("🚪 [Auth] Logging out...");
    await signOut(auth);
    console.log("✅ [Auth] Logged out.");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};