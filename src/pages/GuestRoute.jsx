import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const GuestRouter = ({ children }) => {
  const { isLoggedIn, initializing } = useAuth();

  if (initializing) return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return isLoggedIn ? <Navigate to="/" /> : children;
};