import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      await authService.verifyEmail(code.trim());
      await refreshUser();
      toast.success("Email verified! Welcome aboard.");
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid or expired code";
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerificationCode();
      toast.success("A new code has been sent to your email");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/logo.jpg"
              alt="Stevens Senior Design"
              className="w-14 h-14 rounded object-cover"
            />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-sm text-gray-500">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-gray-700">{user?.email}</span>.
              Enter it below to activate your account.
            </p>
          </div>

          {/* Code input */}
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl font-mono tracking-[0.5em] border border-gray-300 rounded-xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-[#9B2335] focus:border-transparent placeholder:text-gray-300"
              autoFocus
            />

            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="w-full py-3 px-4 bg-[#9B2335] text-white font-medium rounded-lg
                hover:bg-[#7a1c2a] disabled:opacity-50 disabled:cursor-not-allowed
                focus:ring-2 focus:ring-[#9B2335] focus:ring-offset-2 focus:outline-none
                transition-all duration-200"
            >
              {verifying ? "Verifying…" : "Verify Email"}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Didn't receive a code?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[#9B2335] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
