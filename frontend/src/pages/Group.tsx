import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Users, X, Lock, Unlock } from "lucide-react";
import { mockGroups, mockProjects } from "@/data/mockData";
import { toast } from "sonner";

const Group = () => {
  const [myGroup] = useState(mockGroups[0]);
  const [groupStatus, setGroupStatus] = useState(myGroup.status);

  const interestedProjects = mockProjects.filter((p) =>
    myGroup.interestedProjects.includes(p.id),
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myGroup.code);
    toast.success("Group code copied to clipboard");
  };

  const handleToggleStatus = () => {
    const newStatus = groupStatus === "Open" ? "Closed" : "Open";
    setGroupStatus(newStatus);
    toast.success(`Group status changed to ${newStatus}`);
  };

  const handleLeaveGroup = () => {
    toast.success("You have left the group");
  };

  const handleRemoveInterest = () => {
    toast.success("Interest removed from project");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Group</h1>
          <p className="text-muted-foreground mt-1">
            Manage your group and project interests
          </p>
        </div>

        <div className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group {myGroup.groupNumber}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={groupStatus === "Open" ? "default" : "secondary"}
                  >
                    {groupStatus}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    className="gap-2"
                  >
                    {groupStatus === "Open" ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Close Group
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        Open Group
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Group Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {myGroup.code}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with other students to invite them to your group
              </p>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Members ({myGroup.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myGroup.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interested Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Interested Projects ({interestedProjects.length}/4)
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/marketplace">Browse Projects</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {interestedProjects.length > 0 ? (
                <div className="space-y-3">
                  {interestedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                                : "secondary"
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
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
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/project/${project.id}`}>View</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInterest()}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No projects added yet
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/marketplace">Browse Projects</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Group Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Leave Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Leave Group?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to leave this group? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={handleLeaveGroup}>
                      Leave Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Group;
