import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!trimmedPassword) {
      setError("Password is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/logo.jpg"
              alt="Senior Design Marketplace"
              className="w-16 h-16 rounded object-cover"
            />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500">
              Sign in to Stevens Senior Design Marketplace
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                  focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                  transition-all duration-200 ease-in-out"
                placeholder="your.email@stevens.edu"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#9B2335] hover:underline transition-all duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                    focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                    transition-all duration-200 ease-in-out"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full py-3 px-4 rounded-[10px] text-sm font-semibold text-white overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(180deg, hsl(351,63%,58%) 0%, hsl(351,63%,42%) 100%)",
                boxShadow: "0 0 0 1px hsl(351,50%,52%), 0 1px 3px rgba(0,0,0,0.20)",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px hsl(351,50%,56%), 0 4px 12px rgba(155,35,53,0.30)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px hsl(351,50%,52%), 0 1px 3px rgba(0,0,0,0.20)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[10px]"
                style={{
                  background: "linear-gradient(180deg, rgba(255,200,200,0.32) 0%, rgba(255,255,255,0.02) 55%, rgba(0,0,0,0.12) 100%)",
                }}
              />
              <span className="relative z-10">{isSubmitting ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#9B2335] font-medium hover:underline
                transition-all duration-200 ease-in-out"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
