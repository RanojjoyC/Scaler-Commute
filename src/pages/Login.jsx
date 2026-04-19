import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bus } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, role);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fcfcfc]">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
            <Bus size={28} className="text-[#0353A4]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Scaler Commute</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Smart Campus Transport System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">I am a...</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex-1 py-2 text-[13px] font-bold rounded-xl border transition-all ${
                      role === "student" 
                      ? "bg-blue-50 border-[#0353A4]/30 text-[#0353A4] shadow-sm" 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-2 text-[13px] font-bold rounded-xl border transition-all ${
                      role === "admin" 
                      ? "bg-blue-50 border-[#0353A4]/30 text-[#0353A4] shadow-sm" 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    System Admin
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  placeholder="Rahul Singh"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              placeholder="rahul@scaler.com"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#0353A4] text-white font-bold text-[15px] py-3 rounded-xl hover:bg-[#024080] transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[14px] font-semibold text-gray-500 hover:text-[#0353A4] transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
