import { useState } from "react";
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
import { mockProjects, majors } from "@/data/mockData";
import type { Project } from "@/types";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const toggleMajor = (major: string) => {
    setSelectedMajors((prev) =>
      prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major],
    );
  };

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
                    {majors.map((major) => (
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
                  <RadioGroup
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="status-all" />
                      <Label
                        htmlFor="status-all"
                        className="font-normal cursor-pointer"
                      >
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Open" id="status-open" />
                      <Label
                        htmlFor="status-open"
                        className="font-normal cursor-pointer"
                      >
                        Open
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Closed" id="status-closed" />
                      <Label
                        htmlFor="status-closed"
                        className="font-normal cursor-pointer"
                      >
                        Closed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Assigned" id="status-assigned" />
                      <Label
                        htmlFor="status-assigned"
                        className="font-normal cursor-pointer"
                      >
                        Assigned
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Sponsor Type</Label>
                  <RadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="type-all" />
                      <Label
                        htmlFor="type-all"
                        className="font-normal cursor-pointer"
                      >
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Internal" id="type-internal" />
                      <Label
                        htmlFor="type-internal"
                        className="font-normal cursor-pointer"
                      >
                        Internal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="External" id="type-external" />
                      <Label
                        htmlFor="type-external"
                        className="font-normal cursor-pointer"
                      >
                        External
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label>Year</Label>
                  <RadioGroup value={yearFilter} onValueChange={setYearFilter}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="year-all" />
                      <Label
                        htmlFor="year-all"
                        className="font-normal cursor-pointer"
                      >
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2024" id="year-2024" />
                      <Label
                        htmlFor="year-2024"
                        className="font-normal cursor-pointer"
                      >
                        2024
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2025" id="year-2025" />
                      <Label
                        htmlFor="year-2025"
                        className="font-normal cursor-pointer"
                      >
                        2025
                      </Label>
                    </div>
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

const ProjectCard = ({ project }: { project: Project }) => {
  const statusColors = {
    Open: "default",
    Closed: "secondary",
    Assigned: "outline",
  } as const;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={statusColors[project.status]}>{project.status}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Required Majors
          </p>
          <div className="flex flex-wrap gap-1">
            {project.requiredMajors.map((rm, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {rm.major} ({rm.quantity})
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {project.sponsorType}
          </Badge>
          <span>•</span>
          <span>{project.sponsors[0]?.name}</span>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link to={`/project/${project.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Marketplace;
