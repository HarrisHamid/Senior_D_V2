import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Settings, Download, Copy } from "lucide-react";
import { mockCourses, mockProjects, mockGroups } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Course = () => {
  const { user } = useAuth();
  const [course] = useState(mockCourses[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const isCoordinator = user?.role === "course coordinator";

  const courseProjects = mockProjects.filter((p) => p.courseId === course.id);
  const courseGroups = mockGroups.filter((g) => g.courseId === course.id);

  const filteredProjects = courseProjects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(course.code);
    toast.success("Course code copied to clipboard");
  };

  const handleExportData = () => {
    toast.success("Course data exported successfully");
  };

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
                    {course.programName}
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  {course.courseNumber} - Section {course.section} •{" "}
                  {course.semester} {course.year}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <span className="text-sm font-medium text-muted-foreground">
                      Course Code:
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {course.code}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant={course.isOpen ? "default" : "secondary"}>
                    {course.isOpen ? "Open" : "Closed"}
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
                  <CardTitle>
                    Course Projects ({courseProjects.length})
                  </CardTitle>
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
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {project.name}
                          </h3>
                          <Badge
                            variant={
                              project.status === "Open"
                                ? "default"
                                : project.status === "Closed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.requiredMajors.map((rm, idx) => (
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
                        <Link to={`/project/${project.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
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
                <CardTitle>Course Groups ({courseGroups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-foreground">
                            Group {group.groupNumber}
                          </h3>
                          <Badge
                            variant={
                              group.status === "Open" ? "default" : "secondary"
                            }
                          >
                            {group.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length} member
                          {group.members.length !== 1 ? "s" : ""} •{" "}
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
                    <Button variant="outline">
                      {course.isOpen ? "Close Course" : "Open Course"}
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">
                      Group Size Settings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {/* Min/Max group size hardcoded or removed as they are not in Course type */}
                      Min: 3 • Max: 5
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
