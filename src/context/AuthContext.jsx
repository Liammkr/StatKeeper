import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, off } from "firebase/database";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let userRef = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (userRef) {
        off(userRef);
        userRef = null;
      }

      if (firebaseUser) {
        userRef = ref(db, `users/${firebaseUser.uid}`);

        onValue(userRef, (snapshot) => {
          setUserData(snapshot.exists() ? snapshot.val() : null);
          setAuthLoading(false);
        });
      } else {
        setUserData(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userRef) off(userRef);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        authLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
