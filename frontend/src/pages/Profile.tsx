import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { GridPattern } from "@/components/ui/grid-pattern";
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Check,
  Lock,
} from "lucide-react";

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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const names = user?.name?.split(" ") || ["", ""];
  const [formData, setFormData] = useState({
    firstName: names[0] || "",
    lastName: names.slice(1).join(" ") || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  const handleSaveProfile = async () => {
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();
    const nameRegex = /^[a-zA-Z\s'-]+$/;

    if (!trimmedFirst) {
      toast.error("First name is required");
      return;
    }
    if (trimmedFirst.length > 50) {
      toast.error("First name must be 50 characters or fewer");
      return;
    }
    if (!nameRegex.test(trimmedFirst)) {
      toast.error(
        "First name can only contain letters, spaces, hyphens, and apostrophes",
      );
      return;
    }
    if (!trimmedLast) {
      toast.error("Last name is required");
      return;
    }
    if (trimmedLast.length > 50) {
      toast.error("Last name must be 50 characters or fewer");
      return;
    }
    if (!nameRegex.test(trimmedLast)) {
      toast.error(
        "Last name can only contain letters, spaces, hyphens, and apostrophes",
      );
      return;
    }

    try {
      setIsSaving(true);
      await updateUser({ name: `${trimmedFirst} ${trimmedLast}` });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      await userService.changePassword({
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const allRequirementsMet = passwordRequirements.every((r) =>
    r.test(passwordData.newPassword),
  );
  const passwordsMatch =
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordData.confirmPassword.length > 0;
  const canSubmit =
    passwordData.oldPassword.length > 0 && allRequirementsMet && passwordsMatch;

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 w-[3px] rounded-full"
              style={{
                height: "3.5rem",
                background:
                  "linear-gradient(to bottom, #9B2335, rgba(155,35,53,0.15))",
              }}
            />
            <div>
              <p
                className="text-[11px] font-bold uppercase mb-1.5"
                style={{ letterSpacing: "0.18em", color: "#9B2335" }}
              >
                Account
              </p>
              <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                My Profile
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">
                Manage your personal information and security settings.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Profile Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background:
                  "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
              }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p
                  className="text-[10px] font-bold uppercase text-gray-400"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Profile Information
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <User className="w-4 h-4" style={{ color: "#9B2335" }} />
                </div>
              </div>

              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #9B2335, #c23b52)",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-5">
                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      First Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 py-2">
                        {names[0] || "—"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 py-2">
                        {names.slice(1).join(" ") || "—"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Label>
                  <p className="text-sm font-medium text-gray-900 py-2">
                    {user.email}
                  </p>
                </div>

                {/* Major (students only) */}
                {user.role === "student" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Major
                    </Label>
                    <p className="text-sm font-medium text-gray-900 py-2">
                      {user.major ?? "—"}
                    </p>
                  </div>
                )}

                {/* Role + Verification row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Role
                    </Label>
                    <div className="py-2">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          background: "rgba(155,35,53,0.08)",
                          color: "#9B2335",
                        }}
                      >
                        {user.role === "student"
                          ? "Student"
                          : "Course Coordinator"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Verification
                    </Label>
                    <div className="py-2 flex items-center gap-2">
                      {!user.verificationNeeded ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            Not Verified
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-5 mt-5 border-t border-gray-100">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background:
                  "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
              }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p
                  className="text-[10px] font-bold uppercase text-gray-400"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Change Password
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <Lock className="w-4 h-4" style={{ color: "#9B2335" }} />
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password + Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="md:pt-7">
                    <ul className="space-y-1.5">
                      {passwordRequirements.map((req) => {
                        const met = req.test(passwordData.newPassword);
                        return (
                          <li
                            key={req.label}
                            className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${met ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            <Check
                              className={`h-3.5 w-3.5 shrink-0 ${met ? "opacity-100" : "opacity-30"}`}
                            />
                            {req.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword.length > 0 && (
                    <p
                      className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}
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

                <div className="pt-1">
                  <button
                    onClick={handleChangePassword}
                    disabled={!canSubmit || isChangingPassword}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                  >
                    {isChangingPassword && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
