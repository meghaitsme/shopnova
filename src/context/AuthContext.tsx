import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../data/firebase';
// 🚨 FIX: Use 'type' before User to satisfy verbatimModuleSyntax
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  user: any; // You can change this to User | null if you want stricter typing
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // currentUser is automatically typed as User | null by Firebase
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

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};