import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen } from "lucide-react";
import type { Group } from "@/types";

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  isJoining?: boolean;
}

export const GroupCard = ({ group, onJoin, isJoining }: GroupCardProps) => {
  const statusColors = {
    Open: "default",
    Closed: "secondary",
  } as const;

  const MAX_MEMBERS = 5;
  const isFull = group.members.length >= MAX_MEMBERS;
  const canJoin = group.status === "Open" && !isFull;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">Group {group.groupNumber}</CardTitle>
          <Badge variant={statusColors[group.status]}>{group.status}</Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
           <BookOpen className="h-4 w-4" />
           Group {group.groupNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.members.length} / {MAX_MEMBERS} Members</span>
          </div>
          {group.assignedProjectId && (
             <Badge variant="outline" className="text-xs">Assigned</Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
           {group.members.map((member, idx) => (
             <Badge key={idx} variant="secondary" className="text-xs font-normal">
               {member.name}
             </Badge>
           ))}
        </div>

        {onJoin && (
          <Button 
            variant={canJoin ? "default" : "secondary"} 
            size="sm" 
            className="w-full mt-4"
            disabled={!canJoin || isJoining}
            onClick={() => onJoin(group.id)}
          >
            {isJoining ? "Joining..." : !canJoin ? "Cannot Join" : "Join Group"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
