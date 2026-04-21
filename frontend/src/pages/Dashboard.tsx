import { useAuth } from "@/contexts/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Users,
  FolderOpen,
  Globe,
  Lock,
  ArrowRight,
  BarChart3,
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
import { courseService } from "@/services/course.service";
import { projectService } from "@/services/project.service";
import { groupService } from "@/services/group.service";
import type { CourseData } from "@/services/course.service";
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
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [courseCode, setCourseCode] = useState(
    searchParams.get("courseCode") ?? "",
  );
  const [enrolling, setEnrolling] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const handleCreateGroup = async (isPublic: boolean) => {
    if (!user?.course) return;
    setCreatingGroup(true);
    try {
      await groupService.createNewGroup(user.course, isPublic);
      toast.success("Group created!");
      setCreateDialogOpen(false);
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

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courseCode.trim().length !== 7) {
      toast.error("Please enter a valid 7-character course code");
      return;
    }
    setEnrolling(true);
    try {
      await courseService.joinCourse({
        courseCode: courseCode.trim().toUpperCase(),
      });
      toast.success("Enrolled successfully!");
      await refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    if (!user?.course) return;
    courseService
      .getCourseById(user.course)
      .then((res) => setCourse(res.data.course))
      .catch(() => {});
    projectService
      .getProjectsByCourse(user.course)
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
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
                  Here's everything happening in your course.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-0.5 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
              <p className="text-sm font-semibold text-gray-700">{today}</p>
              <p className="text-xs text-gray-400">
                Stevens Institute of Technology
              </p>
            </div>
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Current Course */}
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
                  Current Course
                </p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <BookOpen className="w-4 h-4" style={{ color: "#9B2335" }} />
                </div>
              </div>

              {course ? (
                <>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-900 leading-snug">
                      {course.program}
                    </p>
                    <p className="text-sm text-gray-500 mt-1.5">
                      {course.courseNumber} — Section {course.courseSection}
                    </p>
                    <p className="text-sm text-gray-400">
                      {course.season} {course.year}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      to="/course"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                    >
                      View Course <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      You haven't enrolled in a course yet.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p
                      className="text-[11px] font-semibold text-gray-400 uppercase mb-2"
                      style={{ letterSpacing: "0.12em" }}
                    >
                      Enrollment Code
                    </p>
                    <form onSubmit={handleEnroll} className="space-y-2">
                      <Input
                        placeholder="7-character code"
                        value={courseCode}
                        onChange={(e) =>
                          setCourseCode(e.target.value.toUpperCase())
                        }
                        maxLength={7}
                        className="uppercase text-sm h-9"
                        disabled={enrolling}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                        style={{ background: "#9B2335" }}
                        disabled={enrolling}
                      >
                        {enrolling ? "Enrolling..." : "Enroll Now"}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>

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
                      Group {group.groupNumber}
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
                      disabled={!course}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "#9B2335" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                          "#ad3248")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                          "#9B2335")
                      }
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
                          Choose how other students can join your group.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          onClick={() => handleCreateGroup(true)}
                          disabled={creatingGroup}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-[#9B2335] hover:bg-[#9B2335]/5 transition-colors text-left disabled:opacity-50"
                        >
                          <Globe className="h-6 w-6 text-[#9B2335]" />
                          <div>
                            <p className="font-semibold text-sm">Public</p>
                            <p className="text-xs text-gray-500">
                              Anyone with the code joins instantly
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleCreateGroup(false)}
                          disabled={creatingGroup}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-[#9B2335] hover:bg-[#9B2335]/5 transition-colors text-left disabled:opacity-50"
                        >
                          <Lock className="h-6 w-6 text-[#9B2335]" />
                          <div>
                            <p className="font-semibold text-sm">Private</p>
                            <p className="text-xs text-gray-500">
                              You approve each join request
                            </p>
                          </div>
                        </button>
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
                        disabled={joiningGroup || !course}
                        className="text-sm h-9"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        disabled={joiningGroup || !course}
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
                  {course
                    ? "Projects in your course"
                    : "Enroll in a course to see projects"}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <Link
                  to="/marketplace"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
                  style={{ background: "#9B2335" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background =
                      "#ad3248")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background =
                      "#9B2335")
                  }
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
  const [managedCourses, setManagedCourses] = useState<CourseData[]>([]);
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [totalGroups, setTotalGroups] = useState<number | null>(null);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);

  useEffect(() => {
    courseService.getMyCourses().then(async (res) => {
      const courses = res.data.courses;
      setManagedCourses(courses);
      if (courses.length > 0) {
        const [projectResults, groupResults] = await Promise.all([
          Promise.all(
            courses.map((c) => projectService.getProjectsByCourse(c._id)),
          ),
          Promise.all(
            courses.map((c) => groupService.getAllGroupsByCourse(c._id)),
          ),
        ]);
        setTotalProjects(
          projectResults.reduce((sum, r) => sum + r.data.count, 0),
        );
        setTotalGroups(
          groupResults.reduce((sum, r) => sum + r.data.length, 0),
        );
        const allProjects = projectResults.flatMap((r) => r.data.projects);
        setMatchedCount(
          allProjects.filter((p) => p.assignedGroup !== null).length,
        );
      } else {
        setTotalProjects(0);
        setTotalGroups(0);
        setMatchedCount(0);
      }
    });
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stats = [
    { label: "Total Courses", value: managedCourses.length, Icon: BookOpen },
    {
      label: "Total Projects",
      value: totalProjects ?? "—",
      Icon: FolderOpen,
    },
    { label: "Total Groups", value: totalGroups ?? "—", Icon: Users },
    {
      label: "Matched Groups",
      value: matchedCount ?? "—",
      Icon: BarChart3,
    },
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
                  Manage your courses and monitor progress.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-0.5 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
              <p className="text-sm font-semibold text-gray-700">{today}</p>
              <p className="text-xs text-gray-400">
                Stevens Institute of Technology
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

        {/* ── Courses ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Your Courses</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Courses you're currently managing
              </p>
            </div>
            <Link
              to="/course/create"
              className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: "#9B2335" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#7d1c2b")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#9B2335")
              }
            >
              + New Course
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {managedCourses.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  No courses yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first course to get started.
                </p>
                <Link
                  to="/course/create"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold transition-colors"
                  style={{ color: "#9B2335" }}
                >
                  Create a course <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {managedCourses.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-[3px] h-10 rounded-full shrink-0"
                    style={{
                      background: course.closed ? "#e5e7eb" : "#9B2335",
                    }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {course.program}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {course.courseNumber} — Section {course.courseSection} ·{" "}
                      {course.season} {course.year}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-[11px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 tracking-wider">
                        {course.courseCode}
                      </code>
                      <span
                        className="text-[11px] font-semibold"
                        style={{
                          color: course.closed ? "#9ca3af" : "#059669",
                        }}
                      >
                        {course.closed ? "Closed" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/course?courseId=${course._id}`}
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors shrink-0 ml-4"
                  style={{ color: "#9B2335" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#7d1c2b")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#9B2335")
                  }
                >
                  Manage <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
