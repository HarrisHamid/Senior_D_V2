import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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

          {submitted ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Check your email
                </h1>
                <p className="text-gray-500 text-sm">
                  If an account exists for{" "}
                  <span className="font-medium text-gray-700">{email}</span>,
                  we've sent a password reset link. It expires in 60 minutes.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[#9B2335] hover:underline transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Forgot password?
                </h1>
                <p className="text-gray-500 text-sm">
                  Enter your Stevens email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#9B2335] text-white font-semibold rounded-lg
                    hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)]
                    active:translate-y-0 active:shadow-none
                    focus:ring-2 focus:ring-[#9B2335] focus:ring-offset-2 focus:outline-none
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
