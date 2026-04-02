import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { mockProjects, majors } from "@/data/mockData";
import { FilterBar, type FilterConfig } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";

const Marketplace = () => {
  const [searchParams] = useSearchParams();

  const filterConfigs: FilterConfig[] = [
    {
      id: "search",
      label: "Search",
      type: "search",
      placeholder: "Search projects...",
    },
    {
      id: "majors",
      label: "Required Majors",
      type: "checkbox",
      options: majors.map((m) => ({ id: `major-${m}`, label: m, value: m })),
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
      options: [
        { id: "year-2024", label: "2024", value: "2024" },
        { id: "year-2025", label: "2025", value: "2025" },
      ],
    },
  ];

  const searchQuery = searchParams.get("search") || "";
  const selectedMajors = searchParams.getAll("majors");
  const statusFilter = searchParams.get("status") || "all";
  const typeFilter = searchParams.get("type") || "all";
  const yearFilter = searchParams.get("year") || "all";

  const filteredProjects = mockProjects.filter((project) => {
    // Search filter
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Majors filter
    const matchesMajors =
      selectedMajors.length === 0 ||
      project.requiredMajors.some((rm) => selectedMajors.includes(rm.major));

    // Status filter
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    // Type filter
    const matchesType =
      typeFilter === "all" || project.sponsorType === typeFilter;

    // Year filter
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <FilterBar configs={filterConfigs} />
          </aside>

          {/* Projects Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {mockProjects.length}{" "}
              projects
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
