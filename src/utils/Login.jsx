import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import toast from 'react-hot-toast';
import axiosInstance from '../api/AxiosInstance';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInput = (e, key) => {
    setFormData({
      ...formData,
      [key]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { email, password } = formData;
    
    if (!email || !password) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }
    
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      toast.success(res.data.message || "Login successful");
      if (res.data?.user) login(res.data.user, res.data.user.token);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.extraDetails ||
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 bg-[#0a0a0a] bg-radial-[at_top_right_rgba(239,68,68,0.15)] justify-center items-center flex font-sans">
      <div className="w-full max-w-md space-y-4">
        
        {/* Main Card Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 text-5xl font-extrabold tracking-tight italic">
              Nishiogram
            </h1>
            <p className="text-zinc-400 mt-3 text-sm font-medium tracking-wide">
              Log in to see photos and videos from your friends.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 h-12 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-800 transition-all duration-200">
                <FiMail size={16} className="text-zinc-500 shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInput(e, "email")}
                  className="bg-transparent w-full outline-none text-sm text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 h-12 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-800 transition-all duration-200">
                <FiLock size={16} className="text-zinc-500 shrink-0" />
                <input
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInput(e, "password")}
                  className="bg-transparent w-full outline-none text-sm text-white placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-zinc-500 hover:text-zinc-300 transition-all shrink-0 cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
    
            {/* Forgot Password */}
            <div className="text-right pr-1">
              <span className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full active:scale-90 text-black font-semibold rounded-xl py-3.5 mt-2 text-sm transition-all duration-200 ${
                loading 
                  ? "bg-gray-600 cursor-not-allowed opacity-70" 
                  : "bg-white tracking-wide hover:bg-zinc-200 active:scale-[0.99] cursor-pointer"
              }`}
            >
             {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* Bottom Register Redirect Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-white font-semibold hover:underline ml-1"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;