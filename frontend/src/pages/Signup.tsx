import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GridPattern } from "@/components/ui/grid-pattern";

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
  { label: "At least one special character (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "course coordinator">("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseCode = searchParams.get("courseCode");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // First name validation
    if (!trimmedFirst) {
      setError("First name is required");
      return;
    }
    if (trimmedFirst.length > 50) {
      setError("First name must be 50 characters or fewer");
      return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedFirst)) {
      setError("First name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    // Last name validation
    if (!trimmedLast) {
      setError("Last name is required");
      return;
    }
    if (trimmedLast.length > 50) {
      setError("Last name must be 50 characters or fewer");
      return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedLast)) {
      setError("Last name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    // Email validation
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    // if (!trimmedEmail.endsWith("@stevens.edu")) {
    //   setError("You must use a Stevens email address (@stevens.edu)");
    //   return;
    // }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password.length > 128) {
      setError("Password must be 128 characters or fewer");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: `${trimmedFirst} ${trimmedLast}`,
        email: trimmedEmail,
        password,
        role,
      });
      navigate(
        courseCode ? `/dashboard?courseCode=${courseCode}` : "/dashboard",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            <img src="/logo.jpg" alt="Senior Design Marketplace" className="w-16 h-16 rounded object-cover" />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500">
              Join Stevens Senior Design Marketplace
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
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                    focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                    transition-all duration-200 ease-in-out"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                    focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                    transition-all duration-200 ease-in-out"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg bg-gray-50
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {requirements.map((req) => {
                    const met = req.test(password);
                    return (
                      <li
                        key={req.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                          met ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 shrink-0 ${met ? "opacity-100" : "opacity-30"}`} />
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg bg-gray-50
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
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) =>
                      setRole(
                        e.target.value as "student" | "course coordinator",
                      )
                    }
                    className="w-4 h-4 text-[#9B2335] border-gray-300 focus:ring-[#9B2335]"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700">Student</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="course coordinator"
                    checked={role === "course coordinator"}
                    onChange={(e) =>
                      setRole(
                        e.target.value as "student" | "course coordinator",
                      )
                    }
                    className="w-4 h-4 text-[#9B2335] border-gray-300 focus:ring-[#9B2335]"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-gray-700">Course Coordinator</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#c23b52] hover:bg-[#ad3248] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(194,59,82,0.45)] active:translate-y-0 active:shadow-none active:bg-[#9B2335] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer  */}
          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#9B2335] font-medium hover:underline
                transition-all duration-200 ease-in-out"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
