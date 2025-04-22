"use client";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export default function Auth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("登录失败:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="flex items-center space-y-4">
      {user ? (
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
      ) : (
        <button onClick={login} className="bg-blue-500 text-white px-6 py-2 rounded">
          Sign in with Google
        </button>
      )}
    </div>
  );
}