import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/project.service";
import { courseService } from "@/services/course.service";
import type { ProjectData } from "@/services/project.service";

const MAJORS = [
  "Computer Science",
  "Computer Engineering",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Biomedical Engineering",
  "Cybersecurity",
  "Data Science",
  "Psychology",
];

const projectStatus = (p: ProjectData) => {
  if (p.assignedGroup) return "Assigned";
  if (p.isOpen) return "Open";
  return "Closed";
};

const Marketplace = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [noCourse, setNoCourse] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        if (user.role === "student") {
          if (!user.course) {
            setNoCourse(true);
            setLoading(false);
            return;
          }
          const res = await projectService.getProjectsByCourse(user.course);
          setProjects(res.data.projects);
        } else {
          // coordinator — fetch all managed courses then their projects
          const coursesRes = await courseService.getMyCourses();
          const courses = coursesRes.data.courses;
          if (courses.length === 0) {
            setNoCourse(true);
            setLoading(false);
            return;
          }
          const results = await Promise.all(
            courses.map((c) => projectService.getProjectsByCourse(c._id)),
          );
          setProjects(results.flatMap((r) => r.data.projects));
        }
      } catch {
        // leave projects empty — error shown implicitly via empty state
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const toggleMajor = (major: string) => {
    setSelectedMajors((prev) =>
      prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major],
    );
  };

  const availableYears = [...new Set(projects.map((p) => p.year))].sort(
    (a, b) => b - a,
  );

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.sponsor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMajors =
      selectedMajors.length === 0 ||
      project.majors.some((rm) => selectedMajors.includes(rm.major));

    const status = projectStatus(project);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "Internal" && project.internal) ||
      (typeFilter === "External" && !project.internal);

    const matchesYear =
      yearFilter === "all" || project.year.toString() === yearFilter;

    return (
      matchesSearch &&
      matchesMajors &&
      matchesStatus &&
      matchesType &&
      matchesYear
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Project Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore available senior design projects
          </p>
        </div>

        {noCourse && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {user?.role === "student"
                  ? "You are not enrolled in a course yet."
                  : "You have no courses yet. "}
                {user?.role === "course coordinator" && (
                  <Link to="/course/create" className="text-primary underline">
                    Create a course
                  </Link>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {!noCourse && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Majors */}
                  <div className="space-y-2">
                    <Label>Required Majors</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {MAJORS.map((major) => (
                        <div key={major} className="flex items-center space-x-2">
                          <Checkbox
                            id={major}
                            checked={selectedMajors.includes(major)}
                            onCheckedChange={() => toggleMajor(major)}
                          />
                          <Label
                            htmlFor={major}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {major}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <RadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                      {["all", "Open", "Closed", "Assigned"].map((v) => (
                        <div key={v} className="flex items-center space-x-2">
                          <RadioGroupItem value={v} id={`status-${v}`} />
                          <Label
                            htmlFor={`status-${v}`}
                            className="font-normal cursor-pointer"
                          >
                            {v === "all" ? "All" : v}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label>Sponsor Type</Label>
                    <RadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                      {["all", "Internal", "External"].map((v) => (
                        <div key={v} className="flex items-center space-x-2">
                          <RadioGroupItem value={v} id={`type-${v}`} />
                          <Label
                            htmlFor={`type-${v}`}
                            className="font-normal cursor-pointer"
                          >
                            {v === "all" ? "All" : v}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <RadioGroup value={yearFilter} onValueChange={setYearFilter}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="year-all" />
                        <Label htmlFor="year-all" className="font-normal cursor-pointer">
                          All
                        </Label>
                      </div>
                      {availableYears.map((y) => (
                        <div key={y} className="flex items-center space-x-2">
                          <RadioGroupItem value={y.toString()} id={`year-${y}`} />
                          <Label
                            htmlFor={`year-${y}`}
                            className="font-normal cursor-pointer"
                          >
                            {y}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedMajors([]);
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setYearFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Projects Grid */}
            <div className="flex-1">
              {loading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Loading projects…
                </p>
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {filteredProjects.length} of {projects.length} projects
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                  {filteredProjects.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                          No projects match your filters
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const statusVariant = (
  status: string,
): "default" | "secondary" | "outline" => {
  if (status === "Open") return "default";
  if (status === "Closed") return "secondary";
  return "outline";
};

const ProjectCard = ({ project }: { project: ProjectData }) => {
  const status = projectStatus(project);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={statusVariant(status)}>{status}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.majors.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Required Majors
            </p>
            <div className="flex flex-wrap gap-1">
              {project.majors.map((rm, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {rm.major}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {project.internal ? "Internal" : "External"}
          </Badge>
          <span>•</span>
          <span>{project.sponsor}</span>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link to={`/project/${project._id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Marketplace;
