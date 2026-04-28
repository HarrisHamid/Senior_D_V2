import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  FolderOpen,
  Globe,
  Lock,
  ArrowRight,
  BarChart3,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { projectService } from "@/services/project.service";
import { groupService } from "@/services/group.service";
import type { ProjectData } from "@/services/project.service";
import type { GroupData } from "@/services/group.service";

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "course coordinator") return <CoordinatorDashboard />;
  return <StudentDashboard />;
};

/* ─────────────────────────────────────────────────────────────
   Student Dashboard
───────────────────────────────────────────────────────────── */
const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [groupCode, setGroupCode] = useState("");
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupVisibility, setNewGroupVisibility] = useState<
    "public" | "private" | null
  >(null);

  const handleCreateGroup = async () => {
    if (!newGroupVisibility) return;
    setCreatingGroup(true);
    try {
      await groupService.createNewGroup(
        newGroupVisibility === "public",
        newGroupName.trim() || undefined,
      );
      toast.success("Group created!");
      setCreateDialogOpen(false);
      setNewGroupName("");
      setNewGroupVisibility(null);
      await refreshUser();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create group",
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = groupCode.trim();
    if (trimmedCode.length === 0) {
      toast.error("Please enter a group code");
      return;
    }
    if (trimmedCode.length !== 10) {
      toast.error("Group codes are exactly 10 characters");
      return;
    }
    setJoiningGroup(true);
    try {
      const res = await groupService.joinGroup(trimmedCode);
      if (res.requestPending) {
        toast.success("Join request sent! The group leader will review it.");
      } else {
        toast.success("Joined group!");
        await refreshUser();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join group");
    } finally {
      setJoiningGroup(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    projectService
      .getAllProjects()
      .then((res) => setProjectCount(res.data.pagination.total))
      .catch(() => {});
    if (user.groupId) {
      groupService
        .getGroupById(user.groupId)
        .then((res) => setGroup(res.data as unknown as GroupData))
        .catch(() => {});
    }
  }, [user]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
                  Student Portal
                </p>
                <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                  Welcome back, {firstName}.
                </h1>
                <p className="text-gray-400 mt-1.5 text-sm">
                  Browse projects and manage your group.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* My Group */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background:
                  "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
              }}
            />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p
                  className="text-[10px] font-bold uppercase text-gray-400"
                  style={{ letterSpacing: "0.18em" }}
                >
                  My Group
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <Users className="w-4 h-4" style={{ color: "#9B2335" }} />
                </div>
              </div>

              {group ? (
                <>
                  <div className="flex-1 space-y-3">
                    <p className="text-xl font-bold text-gray-900">
                      {group.name ?? `Group ${group.groupNumber}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: group.isOpen ? "#10b981" : "#d1d5db",
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: group.isOpen ? "#065f46" : "#6b7280",
                        }}
                      >
                        {group.isOpen ? "Open to members" : "Closed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {group.numberOfMembers ?? group.groupMembers.length}{" "}
                      members
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      to="/group"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                    >
                      View Group <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      You haven't joined a group yet.
                    </p>
                    <button
                      onClick={() => setCreateDialogOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200"
                    >
                      <Users className="w-4 h-4" /> Create a Group
                    </button>
                  </div>

                  <Dialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create a Group</DialogTitle>
                        <DialogDescription>
                          Give your group a name and choose its visibility.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                            Group Name{" "}
                            <span className="text-gray-400 font-normal normal-case"></span>
                          </label>
                          <Input
                            placeholder="e.g. Team Falcon"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            maxLength={50}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                            Visibility
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setNewGroupVisibility("public")}
                              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors text-left"
                              style={{
                                borderColor:
                                  newGroupVisibility === "public"
                                    ? "#9B2335"
                                    : "transparent",
                                background:
                                  newGroupVisibility === "public"
                                    ? "rgba(155,35,53,0.05)"
                                    : "#f9fafb",
                              }}
                            >
                              <Globe
                                className="h-5 w-5"
                                style={{ color: "#9B2335" }}
                              />
                              <div>
                                <p className="font-semibold text-sm">Public</p>
                                <p className="text-xs text-gray-500">
                                  Anyone can join instantly
                                </p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewGroupVisibility("private")}
                              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors text-left"
                              style={{
                                borderColor:
                                  newGroupVisibility === "private"
                                    ? "#9B2335"
                                    : "transparent",
                                background:
                                  newGroupVisibility === "private"
                                    ? "rgba(155,35,53,0.05)"
                                    : "#f9fafb",
                              }}
                            >
                              <Lock
                                className="h-5 w-5"
                                style={{ color: "#9B2335" }}
                              />
                              <div>
                                <p className="font-semibold text-sm">Private</p>
                                <p className="text-xs text-gray-500">
                                  You approve each request
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>
                        <Button
                          onClick={handleCreateGroup}
                          disabled={creatingGroup || !newGroupVisibility}
                          className="w-full bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0"
                        >
                          {creatingGroup ? "Creating…" : "Create Group"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p
                      className="text-[11px] font-semibold text-gray-400 uppercase mb-2"
                      style={{ letterSpacing: "0.12em" }}
                    >
                      Have a code?
                    </p>
                    <form onSubmit={handleJoinGroup} className="flex gap-2">
                      <Input
                        placeholder="Enter group code"
                        value={groupCode}
                        onChange={(e) => setGroupCode(e.target.value)}
                        disabled={joiningGroup}
                        className="text-sm h-9"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        disabled={joiningGroup}
                        className="shrink-0"
                      >
                        {joiningGroup ? "..." : "Join"}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background:
                  "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
              }}
            />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p
                  className="text-[10px] font-bold uppercase text-gray-400"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Available Projects
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <FolderOpen
                    className="w-4 h-4"
                    style={{ color: "#9B2335" }}
                  />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-6xl font-bold text-gray-900 tracking-tight leading-none">
                  {projectCount ?? "—"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Projects in the marketplace
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <Link
                  to="/marketplace"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  Browse Projects <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Coordinator Dashboard
───────────────────────────────────────────────────────────── */
const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [totalGroups, setTotalGroups] = useState<number | null>(null);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([projectService.getAllProjects(), groupService.getAllGroups()])
      .then(([projectsRes, groupsRes]) => {
        setTotalProjects(projectsRes.data.pagination.total);
        setTotalGroups(groupsRes.data.length);
        const allProjects: ProjectData[] = projectsRes.data.projects;
        setMatchedCount(
          allProjects.filter((p) => p.assignedGroup !== null).length,
        );
      })
      .catch(() => {});
  }, [user?.id]);

  const stats = [
    { label: "Total Projects", value: totalProjects ?? "—", Icon: FolderOpen },
    { label: "Total Groups", value: totalGroups ?? "—", Icon: Users },
    { label: "Matched Groups", value: matchedCount ?? "—", Icon: BarChart3 },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
                  Course Coordinator
                </p>
                <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                  Coordinator Dashboard
                </h1>
                <p className="text-gray-400 mt-1.5 text-sm">
                  Manage projects and monitor progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          {stats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase text-gray-400 mb-2"
                    style={{ letterSpacing: "0.18em" }}
                  >
                    {label}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 tracking-tight">
                    {value}
                  </p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#9B2335" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Create Project ── */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
            <div
              className="h-[3px]"
              style={{
                background:
                  "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
              }}
            />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <p
                  className="text-[10px] font-bold uppercase text-gray-400"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Create Project
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <FolderOpen
                    className="w-4 h-4"
                    style={{ color: "#9B2335" }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Add a new project to the marketplace.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to="/project/add"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </Link>
              </div>
            </div>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
