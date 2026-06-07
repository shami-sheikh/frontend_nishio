import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "../context/AuthContext";
function Register() {
  const [loading, setloading] = useState(false);
  const navigate=useNavigate()
  const [error, seterror] = useState("");
  const { login } = useAuth();
  const [formdata, setformdata] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleinput = (e, key) => {
    setformdata({
      ...formdata,
      [key]: e.target.value,
    });
  };

  const handleregister = async (e) => {
    e.preventDefault();
    setloading(true);
    seterror("");
    const {userName,email,password,confirmPassword}=formdata;
    if(!userName||!email||!password||!confirmPassword){
        toast.error("all feilds are required")
        return;
    }
    if(password !==confirmPassword){
        toast.error("password did not match")
        return
    }
    try {
        
      const res = await axiosInstance.post("/auth/register", formdata);
      login(res.data?.user, res.data.user.token);
      toast.success("registration succeesfull✅")
navigate("/")
    } catch (err) {
      seterror(
        err.response?.data?.extraDetails ||
          err.response?.data?.message ||
          "Registration failed",
      );
      toast.error(
         error.response?.data?.extraDetails ||
          error.response?.data?.message ||
          "Registration failed",
      );
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 bg-[#0a0a0a] bg-radial-[at_top_right_rgba(239,68,68,0.15)] justify-center items-center flex font-sans">
      <div className="w-full max-w-md space-y-4">
        {/* Main Card Container */}
        <div className="bg-zinc-950 border border-zinc-850/80 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <h1 className="text-transparent bg-clip-text bg-linear-to-r from-white via-zinc-200 to-zinc-400 text-5xl font-extrabold tracking-tight italic">
              Nishiogram
            </h1>
            <p className="text-zinc-400 mt-3 text-sm font-medium tracking-wide">
              Sign up to see photos and videos from your friends.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleregister} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                value={formdata.userName}
                onChange={(e) => handleinput(e, "userName")}
                className="w-full bg-zinc-900 text-white placeholder-zinc-600 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800"
              />
              <p className="text-xs text-zinc-500 mt-2">Spaces are allowed in username</p>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formdata.email}
                onChange={(e) => handleinput(e, "email")}
                className="w-full bg-zinc-900 text-white placeholder-zinc-600 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formdata.password}
                onChange={(e) => handleinput(e, "password")}
                className="w-full bg-zinc-900 text-white placeholder-zinc-600 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formdata.confirmPassword}
                onChange={(e) => handleinput(e, "confirmPassword")}
                className="w-full bg-zinc-900 text-white placeholder-zinc-600 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white text-black font-semibold rounded-xl py-3.5 mt-2 text-sm tracking-wide transition-all duration-200 hover:bg-zinc-200 active:scale-[0.99] cursor-pointer"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Bottom Login Redirect Card */}
        <div className="bg-zinc-950 border border-zinc-850/80 rounded-2xl p-5 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white font-semibold hover:underline ml-1"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
