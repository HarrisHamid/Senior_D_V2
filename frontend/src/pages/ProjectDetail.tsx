import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Users, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { projectService } from "@/services/project.service";
import type { ProjectData } from "@/services/project.service";

const statusLabel = (project: ProjectData) => {
  if (project.assignedGroup) return "Assigned";
  if (project.isOpen) return "Open";
  return "Closed";
};

const statusVariant = (project: ProjectData): "default" | "secondary" | "outline" => {
  if (project.assignedGroup) return "outline";
  if (project.isOpen) return "default";
  return "secondary";
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectService
      .getProjectById(id)
      .then((res) => setProject(res.data.project))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShowInterest = () => {
    toast.success("Interest registered successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading project…</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
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
                    <Badge variant={statusVariant(project)}>
                      {statusLabel(project)}
                    </Badge>
                    <Badge variant="outline">
                      {project.internal ? "Internal" : "External"}
                    </Badge>
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
          {project.advisors.length > 0 && (
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
          )}

          {/* Sponsor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sponsor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground mb-3">{project.sponsor}</p>
              {project.contacts.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                  {project.contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {contact.name}
                        </p>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Majors */}
          {project.majors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Majors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.majors.map((rm, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {rm.major}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* For Students */}
          {user?.role === "student" && project.isOpen && !project.assignedGroup && (
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
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No groups have shown interest yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
