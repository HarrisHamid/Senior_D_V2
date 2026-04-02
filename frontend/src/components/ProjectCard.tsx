import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

export const ProjectCard = ({ project }: { project: Project }) => {
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
