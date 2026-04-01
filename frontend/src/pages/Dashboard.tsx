import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
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
import { BookOpen, Users, FolderOpen, Plus, BarChart3 } from "lucide-react";
import { mockCourses, mockProjects, mockGroups } from "@/data/mockData";
import Navbar from "@/components/Navbar";
import { courseService } from "@/services/course.service";
import type { CourseData } from "@/services/course.service";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "course coordinator") {
    return <CoordinatorDashboard />;
  }

  return <StudentDashboard />;
};

const StudentDashboard = () => {
  const currentCourse = mockCourses[0];
  const myGroup = mockGroups[0];

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
              <div>
                <p className="font-semibold text-foreground">
                  {currentCourse.programName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentCourse.courseNumber} - Section {currentCourse.section}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentCourse.semester} {currentCourse.year}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/course">View Course</Link>
              </Button>
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
              <div>
                <p className="font-semibold text-foreground">
                  Group {myGroup.groupNumber}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {myGroup.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {myGroup.members.length} members
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/group">View Group</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
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
                  {mockProjects.filter((p) => p.status === "Open").length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Available projects
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

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Your group showed interest in AI Healthcare project
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    New project added: Smart Campus Energy Management
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    You joined the course CS 492 - Section A
                  </p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CoordinatorDashboard = () => {
  const [managedCourses, setManagedCourses] = useState<CourseData[]>([]);
  const totalProjects = mockProjects.length;
  const totalGroups = mockGroups.length;
  const matchedProjects = mockProjects.filter(
    (p) => p.status === "Assigned",
  ).length;

  useEffect(() => {
    courseService.getMyCourses().then((res) => {
      setManagedCourses(res.data.courses);
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
                    {totalProjects}
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
                    {totalGroups}
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
                    {matchedProjects}
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
                <p className="text-sm text-muted-foreground">No courses yet. Create one to get started.</p>
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
                    <Link to="/course">Manage</Link>
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
