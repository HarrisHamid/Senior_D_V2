import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, Users, Building2 } from "lucide-react";
import { mockProjects, mockGroups } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === id);
  const [selectedGroup, setSelectedGroup] = useState("");

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Button className="mt-4" asChild>
            <Link to="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const interestedGroups = mockGroups.filter((g) =>
    g.interestedProjects.includes(project.id),
  );

  const handleShowInterest = () => {
    toast.success("Interest registered successfully!");
  };

  const handleAssignGroup = () => {
    if (selectedGroup) {
      toast.success("Group assigned to project successfully!");
    }
  };

  const statusColors = {
    Open: "default",
    Closed: "secondary",
    Assigned: "outline",
  } as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {project.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline">{project.sponsorType}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {project.year}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Advisors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Advisors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.advisors.map((advisor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {advisor.name}
                      </p>
                      <a
                        href={`mailto:${advisor.email}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {advisor.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sponsors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sponsors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.sponsors.map((sponsor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {sponsor.name}
                      </p>
                      <a
                        href={`mailto:${sponsor.email}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {sponsor.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Majors */}
          <Card>
            <CardHeader>
              <CardTitle>Required Majors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.requiredMajors.map((rm, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {rm.major} ({rm.quantity} student
                    {rm.quantity !== 1 ? "s" : ""})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* For Students */}
          {user?.role === "student" && project.status === "Open" && (
            <Card>
              <CardHeader>
                <CardTitle>Show Interest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your group can show interest in up to 4 projects. This will
                  notify the course coordinator.
                </p>
                <Button
                  onClick={handleShowInterest}
                  className="w-full sm:w-auto"
                >
                  Express Interest
                </Button>
              </CardContent>
            </Card>
          )}

          {/* For Coordinators */}
          {user?.role === "course coordinator" && (
            <Card>
              <CardHeader>
                <CardTitle>Interested Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {interestedGroups.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {interestedGroups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              Group {group.groupNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {group.members.length} members
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedGroup(group.id);
                              handleAssignGroup();
                            }}
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-medium mb-2 block">
                        Or assign any group
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedGroup}
                          onValueChange={setSelectedGroup}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                Group {group.groupNumber} (
                                {group.members.length} members)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAssignGroup}>Assign</Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No groups have shown interest yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
