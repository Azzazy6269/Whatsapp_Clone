import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";

const LoginPage = () => {
  const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; 

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { setUser } = ChatState();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) navigate("/chats");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      let data;

      if (isLoginTab) {
        const response = await axios.post(
          ENDPOINT+"/api/users/login",
          { email, password },
          config
        );
        data = response.data;
      } else {
        if (!name) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        const response = await axios.post(
          ENDPOINT+"/api/users/register",
          { name, email, password },
          config
        );
        data = response.data;
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      
      setLoading(false);
      navigate("/chats");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center p-4 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-[#075E54] mb-2 tracking-wide flex items-center justify-center gap-2">
          <span className="text-4xl">💬</span> WhatsApp Clone
        </h1>
        <p className="text-gray-500 text-sm font-medium">Connect with your friends in real-time</p>
      </div>

      <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="card-body p-8">
          
          <div className="flex bg-[#f0f2f5] p-1 rounded-xl mb-6">
            <button 
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                isLoginTab 
                  ? "bg-white text-[#075E54] shadow-sm" 
                  : "text-gray-500 hover:text-gray-800"
              }`} 
              onClick={() => { setIsLoginTab(true); setError(""); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                !isLoginTab 
                  ? "bg-white text-[#075E54] shadow-sm" 
                  : "text-gray-500 hover:text-gray-800"
              }`} 
              onClick={() => { setIsLoginTab(false); setError(""); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-4 font-medium flex items-center gap-2 shadow-sm">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginTab && (
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full h-11 px-4 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-[#128C7E] focus:ring-1 focus:ring-[#128C7E] text-sm transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                className="w-full h-11 px-4 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-[#128C7E] focus:ring-1 focus:ring-[#128C7E] text-sm transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-[#128C7E] focus:ring-1 focus:ring-[#128C7E] text-sm transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* زرار الإرسال الأخضر بـ تأثير الحساب المطور للواتساب */}
            <button 
              type="submit" 
              className={`btn bg-[#128C7E] hover:bg-[#075E54] text-white border-none w-full h-11 min-h-0 mt-6 rounded-lg text-sm font-bold tracking-wide shadow-md transition-all duration-200 ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Processing..." : isLoginTab ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;