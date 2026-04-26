import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
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
      toast.error("First name can only contain letters, spaces, hyphens, and apostrophes");
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
      toast.error("Last name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    try {
      setIsSaving(true);
      await updateUser({
        name: `${trimmedFirst} ${trimmedLast}`,
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
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
                      <p className="text-foreground font-medium">
                        {names[0] || ""}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-foreground font-medium">
                        {names.slice(1).join(" ") || ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </Label>
                  <Badge variant="outline" className="w-fit">
                    {user.role === "student" ? "student" : "course coordinator"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Verification Status</Label>
                  <div className="flex items-center gap-2">
                    {!user.verificationNeeded ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="text-sm text-success">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="text-sm text-destructive">
                          Not Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0">
                      {isSaving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gray-200 text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] hover:bg-white"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0">
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          {(() => {
            const allRequirementsMet = passwordRequirements.every((r) =>
              r.test(passwordData.newPassword),
            );
            const passwordsMatch =
              passwordData.newPassword === passwordData.confirmPassword &&
              passwordData.confirmPassword.length > 0;
            const canSubmit =
              passwordData.oldPassword.length > 0 &&
              allRequirementsMet &&
              passwordsMatch;

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                                met ? "text-green-600" : "text-muted-foreground"
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
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                          passwordsMatch ? "text-green-600" : "text-destructive"
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

                  <Button
                    onClick={handleChangePassword}
                    disabled={!canSubmit || isChangingPassword}
                    className="w-full bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0"
                  >
                    {isChangingPassword && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
