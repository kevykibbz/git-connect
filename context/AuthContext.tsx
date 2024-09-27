"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/api";
import { useRouter } from "next/navigation";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  education: "",
  work_experience: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const LOGIN_EXPIRATION_TIME:number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {

        const loginTimestamp = localStorage.getItem("loginTimestamp");

        // Check if 24 hours have passed
        if (loginTimestamp && Date.now() - parseInt(loginTimestamp, 10) > LOGIN_EXPIRATION_TIME) {
          setIsAuthenticated(false);
          setUser(INITIAL_USER);
          localStorage.removeItem("loginTimestamp");
          router.push("/auth/signin"); 
          return false;
        }

        // If no login timestamp exists, set it now (first login)
        if (!loginTimestamp) {
          localStorage.setItem("loginTimestamp", Date.now().toString());
        }
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          education:currentAccount.education,
          work_experience: currentAccount.work_experience,
        });
        setIsAuthenticated(true);
        return true;
      }

      // If no user is logged in
      setIsAuthenticated(false);
      setUser(INITIAL_USER); // Reset user to initial state
      return false;
    } catch (error) {
      console.error("Error fetching current user:", error);
      setIsAuthenticated(false);
      setUser(INITIAL_USER); // Reset user to initial state on error
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Trigger authentication check on component mount
    checkAuthUser();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);