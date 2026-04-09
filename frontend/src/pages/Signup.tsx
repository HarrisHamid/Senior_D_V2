import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "course coordinator">("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseCode = searchParams.get("courseCode");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: `${firstName} ${lastName}`.trim(),
        email,
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                  focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                  transition-all duration-200 ease-in-out"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                  focus:ring-2 focus:ring-[#9B2335] focus:border-transparent focus:outline-none
                  transition-all duration-200 ease-in-out"
                required
                disabled={isSubmitting}
              />
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
              className="w-full py-3 px-4 bg-[#9B2335] text-white font-medium rounded-lg
                hover:bg-[#7a1c2a] hover:shadow-lg
                focus:ring-2 focus:ring-[#9B2335] focus:ring-offset-2 focus:outline-none
                transition-all duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed"
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
