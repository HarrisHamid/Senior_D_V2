import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Settings, Download, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { courseService } from "@/services/course.service";
import { projectService } from "@/services/project.service";
import { groupService } from "@/services/group.service";
import type { CourseData } from "@/services/course.service";
import type { ProjectData } from "@/services/project.service";
import type { GroupData } from "@/services/group.service";

const projectStatus = (p: ProjectData) => {
  if (p.assignedGroup) return "Assigned";
  if (p.isOpen) return "Open";
  return "Closed";
};

const Course = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isCoordinator = user?.role === "course coordinator";

  const [course, setCourse] = useState<CourseData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [noCourse, setNoCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const courseId = searchParams.get("courseId") ?? (user.role === "student" ? user.course : null);

    if (!courseId) {
      setNoCourse(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [courseRes, projectsRes, groupsRes] = await Promise.all([
          courseService.getCourseById(courseId),
          projectService.getProjectsByCourse(courseId),
          groupService.getAllGroupsByCourse(courseId),
        ]);
        setCourse(courseRes.data.course);
        setProjects(projectsRes.data.projects);
        setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      } catch {
        setNoCourse(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, searchParams]);

  const handleCopyCode = () => {
    if (!course) return;
    navigator.clipboard.writeText(course.courseCode);
    toast.success("Course code copied to clipboard");
  };

  const handleExportData = async () => {
    if (!course) return;
    try {
      const blob = await courseService.exportCourseData(course._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${course.courseNumber}-${course.courseSection}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Course data exported");
    } catch {
      toast.error("Failed to export course data");
    }
  };

  const handleToggleCourse = async () => {
    if (!course) return;
    try {
      if (course.closed) {
        await courseService.reopenCourse(course._id);
        setCourse({ ...course, closed: false });
        toast.success("Course reopened");
      } else {
        await courseService.closeCourse(course._id);
        setCourse({ ...course, closed: true });
        toast.success("Course closed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading course…</p>
        </div>
      </div>
    );
  }

  if (noCourse || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
          <p className="text-muted-foreground">
            {user?.role === "student"
              ? "You are not enrolled in a course yet."
              : "No course found."}
          </p>
          {isCoordinator && (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    {course.program}
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  {course.courseNumber} - Section {course.courseSection} •{" "}
                  {course.season} {course.year}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <span className="text-sm font-medium text-muted-foreground">
                      Course Code:
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {course.courseCode}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant={course.closed ? "secondary" : "default"}>
                    {course.closed ? "Closed" : "Open"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Course Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            {isCoordinator && <TabsTrigger value="info">Info</TabsTrigger>}
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Projects ({projects.length})</CardTitle>
                  {isCoordinator && (
                    <Button asChild>
                      <Link to="/project/add">Add Project</Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="space-y-3">
                  {filteredProjects.map((project) => {
                    const status = projectStatus(project);
                    return (
                      <div
                        key={project._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {project.name}
                            </h3>
                            <Badge
                              variant={
                                status === "Open"
                                  ? "default"
                                  : status === "Closed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.majors.map((rm, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {rm.major}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="ml-4"
                        >
                          <Link to={`/project/${project._id}`}>View</Link>
                        </Button>
                      </div>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No projects found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Groups ({groups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-foreground">
                            Group {group.groupNumber}
                          </h3>
                          <Badge
                            variant={group.isOpen ? "default" : "secondary"}
                          >
                            {group.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {group.numberOfMembers ?? group.groupMembers.length} member
                          {(group.numberOfMembers ?? group.groupMembers.length) !== 1 ? "s" : ""} •{" "}
                          {group.interestedProjects.length} interested project
                          {group.interestedProjects.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {user?.role === "student" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/group">View</Link>
                        </Button>
                      )}
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No groups yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info Tab (Coordinator Only) */}
          {isCoordinator && (
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Course Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Course Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Control whether students can join this course
                    </p>
                    <Button variant="outline" onClick={handleToggleCourse}>
                      {course.closed ? "Reopen Course" : "Close Course"}
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">
                      Group Size Settings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Min: {course.minGroupSize} • Max: {course.maxGroupSize}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Export Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download course data including projects, groups, and
                      assignments
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export to CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Course;
