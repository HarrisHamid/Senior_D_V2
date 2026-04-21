import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/project.service";
import { courseService } from "@/services/course.service";
import type { ProjectData } from "@/services/project.service";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";
import { GridPattern } from "@/components/ui/grid-pattern";

const SCHOOLS: { label: string; majors: string[] }[] = [
  {
    label: "School of Engineering and Science",
    majors: [
      "Biology",
      "Biomedical Engineering",
      "Chemical Biology",
      "Chemical Engineering",
      "Chemistry",
      "Civil Engineering",
      "Computer Engineering",
      "Electrical Engineering",
      "Engineering Management",
      "Environmental Engineering",
      "Mathematics",
      "Mechanical Engineering",
      "Naval Engineering",
      "Physics",
      "Software Engineering",
    ],
  },
  {
    label: "School of Business",
    majors: [
      "Accounting & Analytics",
      "Business & Technology",
      "Economics",
      "Finance",
      "Information Systems",
      "Management",
      "Marketing Innovation & Analytics",
      "Quantitative Finance",
    ],
  },
  {
    label: "School of Humanities, Arts and Social Sciences",
    majors: [
      "History",
      "Literature",
      "Music & Technology",
      "Philosophy",
      "Science Communication",
      "Social Sciences",
      "Visual Arts & Technology",
    ],
  },
  {
    label: "School of Computing",
    majors: ["Artificial Intelligence", "Computer Science", "Cybersecurity"],
  },
];

const ALL_MAJORS = SCHOOLS.flatMap((s) => s.majors);

const projectStatus = (p: ProjectData) => {
  if (p.assignedGroup) return "Assigned";
  if (p.isOpen) return "Open";
  return "Closed";
};

const Marketplace = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [noCourse, setNoCourse] = useState(false);

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
        // leave projects empty — shown via empty state
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const availableYears = [...new Set(projects.map((p) => p.year))].sort(
    (a, b) => b - a,
  );

  const schoolFilter = searchParams.get("school") || "all";
  const selectedSchool = SCHOOLS.find((s) => s.label === schoolFilter);
  const visibleMajors = selectedSchool ? selectedSchool.majors : ALL_MAJORS;

  const filterConfigs: FilterConfig[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search projects...",
    },
    {
      id: "school",
      label: "School",
      type: "select",
      placeholder: "All Schools",
      options: SCHOOLS.map((s) => ({ id: `school-${s.label}`, label: s.label, value: s.label })),
    },
    {
      id: "majors",
      label: "Required Majors",
      type: "checkbox",
      options: visibleMajors.map((m) => ({ id: `major-${m}`, label: m, value: m })),
    },
    {
      id: "status",
      label: "Status",
      type: "radio",
      options: [
        { id: "status-open", label: "Open", value: "Open" },
        { id: "status-closed", label: "Closed", value: "Closed" },
        { id: "status-assigned", label: "Assigned", value: "Assigned" },
      ],
    },
    {
      id: "type",
      label: "Sponsor Type",
      type: "radio",
      options: [
        { id: "type-internal", label: "Internal", value: "Internal" },
        { id: "type-external", label: "External", value: "External" },
      ],
    },
    {
      id: "year",
      label: "Year",
      type: "radio",
      options: availableYears.map((y) => ({
        id: `year-${y}`,
        label: String(y),
        value: String(y),
      })),
    },
  ];

  const searchQuery = searchParams.get("search") || "";
  const selectedMajors = searchParams.getAll("majors");
  const statusFilter = searchParams.get("status") || "all";
  const typeFilter = searchParams.get("type") || "all";
  const yearFilter = searchParams.get("year") || "all";

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.sponsor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool =
      schoolFilter === "all" ||
      project.majors.some((rm) => selectedSchool?.majors.includes(rm.major));

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

    return matchesSearch && matchesSchool && matchesMajors && matchesStatus && matchesType && matchesYear;
  });

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <p className="text-sm text-muted-foreground tracking-wide mb-1">
            Explore available senior design projects
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0d0d0d]">
            Project{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, hsl(351, 63%, 32%), hsl(0, 80%, 52%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Marketplace
            </span>
          </h1>
        </div>

        {noCourse ? (
          <Card
            className="border border-border/60"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
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
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-80 space-y-6">
              <FilterBar configs={filterConfigs} />
            </aside>

            <div className="flex-1">
              {loading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Loading projects…
                </p>
              ) : (
                <>
                  <div className="mb-5 text-sm text-muted-foreground">
                    Showing {filteredProjects.length} of {projects.length} projects
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                  {filteredProjects.length === 0 && (
                    <Card
                      className="border border-border/60"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    >
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

export default Marketplace;
