import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Copy,
  Users,
  X,
  Lock,
  Unlock,
  Globe,
  Check,
  UserPlus,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { groupService } from "@/services/group.service";
import type { JoinRequest } from "@/services/group.service";
import { useAuth } from "@/contexts/AuthContext";

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
}

interface PopulatedProject {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  assignedGroup: string | null;
  majors: { major: string }[];
}

interface PopulatedGroup {
  _id: string;
  groupNumber: number;
  groupCode?: string;
  isOpen: boolean;
  isPublic: boolean;
  groupMembers: PopulatedMember[];
  interestedProjects: PopulatedProject[];
  assignedProject: string | null;
  joinRequests: JoinRequest[];
}

/* ── shared card chrome ─────────────────────────────────── */
const CardShell = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div
      className="h-[3px]"
      style={{
        background:
          "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
      }}
    />
    <div className="p-6">{children}</div>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[10px] font-bold uppercase text-gray-400"
    style={{ letterSpacing: "0.18em" }}
  >
    {children}
  </p>
);

const IconBadge = ({ icon: Icon }: { icon: React.ElementType }) => (
  <div
    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
    style={{ background: "rgba(155,35,53,0.08)" }}
  >
    <Icon className="w-4 h-4" style={{ color: "#9B2335" }} />
  </div>
);

/* ── component ──────────────────────────────────────────── */
const Group = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myGroup, setMyGroup] = useState<PopulatedGroup | null>(null);
  const [loading, setLoading] = useState(() => !!user?.groupId);
  const [memberToRemove, setMemberToRemove] = useState<PopulatedMember | null>(
    null,
  );

  useEffect(() => {
    if (!user?.groupId) return;
    groupService
      .getGroupById(user.groupId)
      .then((res) => setMyGroup(res.data as unknown as PopulatedGroup))
      .catch(() => toast.error("Failed to load group."))
      .finally(() => setLoading(false));
  }, [user?.groupId]);

  const handleCopyCode = () => {
    if (!myGroup?.groupCode) return;
    navigator.clipboard.writeText(myGroup.groupCode);
    toast.success("Group code copied to clipboard");
  };

  const handleToggleStatus = async () => {
    if (!myGroup) return;
    try {
      const res = await groupService.toggleStatus(myGroup._id);
      setMyGroup(res.data as unknown as PopulatedGroup);
      const newStatus = (res.data as unknown as PopulatedGroup).isOpen
        ? "Open"
        : "Closed";
      toast.success(`Group status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update group status.");
    }
  };

  const handleToggleVisibility = async () => {
    if (!myGroup) return;
    try {
      const res = await groupService.toggleVisibility(myGroup._id);
      setMyGroup(res.data as unknown as PopulatedGroup);
      toast.success(res.message);
    } catch {
      toast.error("Failed to update group visibility.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!myGroup) return;
    try {
      await groupService.leaveGroup(myGroup._id);
      toast.success("You have left the group");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to leave group.",
      );
    }
  };

  const handleRemoveInterest = async (projectId: string) => {
    if (!myGroup) return;
    try {
      const res = await groupService.removeInterestedProject(
        myGroup._id,
        projectId,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      toast.success("Interest removed from project");
    } catch {
      toast.error("Failed to remove interest.");
    }
  };

  const handleRemoveMember = async () => {
    if (!myGroup || !memberToRemove) return;
    try {
      const res = await groupService.removeMember(
        myGroup._id,
        memberToRemove._id,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      setMemberToRemove(null);
      toast.success(`${memberToRemove.name} has been removed from the group`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member",
      );
    }
  };

  const handleRespondToRequest = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    if (!myGroup) return;
    try {
      const res = await groupService.respondToJoinRequest(
        myGroup._id,
        requestId,
        status,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      toast.success(res.message);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to respond to request.",
      );
    }
  };

  /* ── loading / empty states ─── */
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-gray-400 text-sm">Loading group…</p>
        </div>
      </div>
    );
  }

  if (!myGroup) {
    return (
      <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're not in a group
          </h1>
          <p className="text-gray-400 mb-6 text-sm">
            Create a new group or join one from the dashboard.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
            style={{ background: "#9B2335" }}
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const interestedProjects = myGroup.interestedProjects ?? [];
  const members = myGroup.groupMembers ?? [];
  const pendingRequests = (myGroup.joinRequests ?? []).filter(
    (r) => r.status === "pending",
  );
  const isLeader = members.length > 0 && members[0]._id === user?.id;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const projectStatus = (p: PopulatedProject) => {
    if (p.assignedGroup) return "Assigned";
    if (p.isOpen) return "Open";
    return "Closed";
  };

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
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
                  My Group
                </p>
                <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                  Group {myGroup.groupNumber}
                </h1>
                <p className="text-gray-400 mt-1.5 text-sm">
                  Manage your team and track project interests.
                </p>
              </div>
            </div>

            {/* Status pills */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: myGroup.isOpen ? "#10b981" : "#d1d5db",
                  }}
                />
                {myGroup.isOpen ? "Open" : "Closed"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-gray-600">
                {myGroup.isPublic !== false ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                {myGroup.isPublic !== false ? "Public" : "Private"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* ── Left column ── */}
          <div className="space-y-5">
            {/* Members */}
            <CardShell>
              <div className="flex items-center justify-between mb-6">
                <SectionLabel>Members ({members.length})</SectionLabel>
                <IconBadge icon={Users} />
              </div>

              <div className="space-y-2">
                {members.map((member: PopulatedMember, idx: number) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: "rgba(155,35,53,0.1)",
                          color: "#9B2335",
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{member.name}</span>
                          {idx === 0 && (
                            <span
                              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md shrink-0"
                              style={{
                                background: "rgba(155,35,53,0.08)",
                                color: "#9B2335",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Leader
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {isLeader && idx !== 0 && (
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardShell>

            {/* Interested Projects */}
            <CardShell>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <SectionLabel>Interested Projects</SectionLabel>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {interestedProjects.length} of 4 selected
                  </p>
                </div>
                <Link
                  to="/marketplace"
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: "#9B2335" }}
                >
                  Browse <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {interestedProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    No projects selected yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Browse the marketplace to add up to 4 interests.
                  </p>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold transition-colors"
                    style={{ color: "#9B2335" }}
                  >
                    Browse Projects <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {interestedProjects.map((project: PopulatedProject) => {
                    const status = projectStatus(project);
                    return (
                      <div
                        key={project._id}
                        className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {project.name}
                            </h3>
                            <span
                              className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={
                                status === "Assigned"
                                  ? {
                                      background: "#f5f3ff",
                                      color: "#6d28d9",
                                    }
                                  : status === "Open"
                                    ? {
                                        background: "#ecfdf5",
                                        color: "#065f46",
                                      }
                                    : {
                                        background: "#f3f4f6",
                                        color: "#6b7280",
                                      }
                              }
                            >
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(project.majors ?? [])
                              .slice(0, 3)
                              .map((rm: { major: string }, i: number) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                >
                                  {rm.major}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3 shrink-0">
                          <Link
                            to={`/project/${project._id}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#9B2335] hover:bg-[rgba(155,35,53,0.06)] transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleRemoveInterest(project._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardShell>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Group Overview / Invite Code */}
            <CardShell>
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Invite Code</SectionLabel>
                <IconBadge icon={Copy} />
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100 mb-2">
                <p className="text-lg font-mono font-bold text-gray-900 tracking-[0.12em]">
                  {myGroup.groupCode}
                </p>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: "#9B2335" }}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              <p className="text-xs text-gray-400">
                {myGroup.isPublic !== false
                  ? "Share to let students join instantly"
                  : "Students request to join — you approve each one"}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <SectionLabel>Controls</SectionLabel>
                <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={handleToggleStatus}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                  >
                    {myGroup.isOpen ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Close Group
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Open Group
                      </>
                    )}
                  </button>
                  {isLeader && (
                    <button
                      onClick={handleToggleVisibility}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                    >
                      {myGroup.isPublic !== false ? (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" /> Make Public
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </CardShell>

            {/* Join Requests — leader + private only */}
            {isLeader && myGroup.isPublic === false && (
              <CardShell>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SectionLabel>Join Requests</SectionLabel>
                    {pendingRequests.length > 0 && (
                      <span
                        className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full"
                        style={{ background: "#9B2335" }}
                      >
                        {pendingRequests.length}
                      </span>
                    )}
                  </div>
                  <IconBadge icon={UserPlus} />
                </div>

                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {req.userId.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {req.userId.email}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-2">
                          <button
                            onClick={() =>
                              handleRespondToRequest(req._id, "approved")
                            }
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleRespondToRequest(req._id, "rejected")
                            }
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardShell>
            )}

            {/* Leave Group */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <SectionLabel>Danger Zone</SectionLabel>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                    Leave Group
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Leave Group?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to leave Group {myGroup.groupNumber}
                      ? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button variant="destructive" onClick={handleLeaveGroup}>
                      Leave Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Remove Member Confirmation */}
        <Dialog
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Member?</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-foreground">
                  {memberToRemove?.name}
                </span>{" "}
                from the group? They will need to rejoin using the group code.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setMemberToRemove(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveMember}>
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Group;
