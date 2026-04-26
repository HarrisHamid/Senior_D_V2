import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { Eye, EyeOff, Check, ArrowLeft } from "lucide-react";

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  {
    label: "At least one uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "At least one special character",
    test: (p: string) => /[^a-zA-Z0-9]/.test(p),
  },
];

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allMet = passwordRequirements.every((r) => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = allMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canSubmit) return;
    setError("");
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      navigate("/login", {
        state: { message: "Password reset successfully. You can now sign in." },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Reset link is invalid or has expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/logo.jpg"
              alt="Senior Design Marketplace"
              className="w-16 h-16 rounded object-cover"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Set new password
            </h1>
            <p className="text-gray-500 text-sm">
              Choose a strong password for your account.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}{" "}
              <Link to="/forgot-password" className="underline font-medium">
                Request a new link
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New password
              </label>
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
              {password.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {passwordRequirements.map((req) => {
                    const met = req.test(password);
                    return (
                      <li
                        key={req.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                          met ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 ${met ? "opacity-100" : "opacity-30"}`}
                        />
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                    focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                    transition-all duration-200 ease-in-out"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirm.length > 0 && (
                <p
                  className={`mt-1.5 flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                    passwordsMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${passwordsMatch ? "opacity-100" : "opacity-30"}`}
                  />
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full py-3 px-4 bg-[#9B2335] text-white font-semibold rounded-lg
                hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)]
                active:translate-y-0 active:shadow-none
                focus:ring-2 focus:ring-[#9B2335] focus:ring-offset-2 focus:outline-none
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <p className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-[#9B2335] hover:underline transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
