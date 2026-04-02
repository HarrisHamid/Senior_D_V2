import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/services/project.service";

const projectStatus = (p: ProjectData) => {
  if (p.assignedGroup) return "Assigned";
  if (p.isOpen) return "Open";
  return "Closed";
};

const statusColors = {
  Open: "default",
  Closed: "secondary",
  Assigned: "outline",
} as const;

export const ProjectCard = ({ project }: { project: ProjectData }) => {
  const status = projectStatus(project);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={statusColors[status]}>{status}</Badge>
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
