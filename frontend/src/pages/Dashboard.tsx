import { useAuth } from "@/contexts/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Users,
  FolderOpen,
  Plus,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
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

  if (user.role === "course coordinator") {
    return <CoordinatorDashboard />;
  }

  return <StudentDashboard />;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { refreshUser } = useAuth();
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
      .then((res) => {
        setCourse(res.data.course);
      })
      .catch(() => {});

    projectService
      .getProjectsByCourse(user.course)
      .then((res) => {
        setProjectCount(res.data.pagination.total);
      })
      .catch(() => {});

    if (user.groupId) {
      groupService
        .getGroupById(user.groupId)
        .then((res) => {
          setGroup(res.data as unknown as GroupData);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Current Course Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Current Course
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course ? (
                <>
                  <div>
                    <p className="font-semibold text-foreground">
                      {course.program}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.courseNumber} - Section {course.courseSection}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.season} {course.year}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link to="/course">View Course</Link>
                  </Button>
                </>
              ) : (
                <form onSubmit={handleEnroll} className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Not enrolled in a course yet.
                  </p>
                  <Input
                    placeholder="Enter 7-character code"
                    value={courseCode}
                    onChange={(e) =>
                      setCourseCode(e.target.value.toUpperCase())
                    }
                    maxLength={7}
                    className="uppercase"
                    disabled={enrolling}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={enrolling}
                  >
                    {enrolling ? "Enrolling…" : "Enroll"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* My Group Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                My Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group ? (
                <>
                  <div>
                    <p className="font-semibold text-foreground">
                      Group {group.groupNumber}
                    </p>
                    <Badge
                      variant={group.isOpen ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {group.isOpen ? "Open" : "Closed"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {group.numberOfMembers ?? group.groupMembers.length}{" "}
                      members
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link to="/group">View Group</Link>
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Not in a group yet.
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setCreateDialogOpen(true)}
                    disabled={!course}
                  >
                    Create Group
                  </Button>
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
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                        >
                          <Globe className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-semibold text-sm">Public</p>
                            <p className="text-xs text-muted-foreground">
                              Anyone with the code joins instantly
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleCreateGroup(false)}
                          disabled={creatingGroup}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                        >
                          <Lock className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-semibold text-sm">Private</p>
                            <p className="text-xs text-muted-foreground">
                              You approve each join request
                            </p>
                          </div>
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <form onSubmit={handleJoinGroup} className="space-y-2">
                    <Input
                      placeholder="Enter group code"
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value)}
                      disabled={joiningGroup || !course}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={joiningGroup || !course}
                    >
                      {joiningGroup ? "Joining…" : "Join Group"}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Projects */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5 text-primary" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {projectCount ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Projects in your course
                </p>
              </div>
              <Button size="sm" asChild className="w-full">
                <Link to="/marketplace">Browse Projects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" asChild>
              <Link
                to="/marketplace"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <FolderOpen className="h-6 w-6" />
                Browse Projects
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/group" className="h-auto py-4 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                Manage Group
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/course" className="h-auto py-4 flex flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                View Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
        setTotalGroups(groupResults.reduce((sum, r) => sum + r.data.length, 0));
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Coordinator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your courses and projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {managedCourses.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalProjects ?? "—"}
                  </p>
                </div>
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Groups
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalGroups ?? "—"}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Matched
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {matchedCount ?? "—"}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild>
              <Link
                to="/course/create"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Plus className="h-6 w-6" />
                Create Course
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                to="/project/add"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Plus className="h-6 w-6" />
                Add Project
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                to="/marketplace"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <FolderOpen className="h-6 w-6" />
                View Projects
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/course" className="h-auto py-4 flex flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                Export Data
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Managed Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Courses you're managing this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {managedCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No courses yet. Create one to get started.
                </p>
              )}
              {managedCourses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {course.program}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.courseNumber} - Section {course.courseSection} •{" "}
                      {course.season} {course.year}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={course.closed ? "secondary" : "default"}>
                        {course.closed ? "Closed" : "Open"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Code: {course.courseCode}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/course?courseId=${course._id}`}>Manage</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
