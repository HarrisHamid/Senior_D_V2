import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Copy,
  Users,
  X,
  Lock,
  Unlock,
  Globe,
  Check,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { groupService } from "@/services/group.service";
import type { JoinRequest } from "@/services/group.service";
import { useAuth } from "@/contexts/AuthContext";

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
}

interface PopulatedProject {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  assignedGroup: string | null;
  majors: { major: string }[];
}

interface PopulatedGroup {
  _id: string;
  groupNumber: number;
  groupCode?: string;
  isOpen: boolean;
  isPublic: boolean;
  groupMembers: PopulatedMember[];
  interestedProjects: PopulatedProject[];
  assignedProject: string | null;
  joinRequests: JoinRequest[];
}

const Group = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myGroup, setMyGroup] = useState<PopulatedGroup | null>(null);
  const [loading, setLoading] = useState(() => !!user?.groupId);

  useEffect(() => {
    if (!user?.groupId) return;
    groupService
      .getGroupById(user.groupId)
      .then((res) => setMyGroup(res.data as unknown as PopulatedGroup))
      .catch(() => toast.error("Failed to load group."))
      .finally(() => setLoading(false));
  }, [user?.groupId]);

  const handleCopyCode = () => {
    if (!myGroup?.groupCode) return;
    navigator.clipboard.writeText(myGroup.groupCode);
    toast.success("Group code copied to clipboard");
  };

  const handleToggleStatus = async () => {
    if (!myGroup) return;
    try {
      const res = await groupService.toggleStatus(myGroup._id);
      setMyGroup(res.data as unknown as PopulatedGroup);
      const newStatus = (res.data as unknown as PopulatedGroup).isOpen
        ? "Open"
        : "Closed";
      toast.success(`Group status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to update group status.");
    }
  };

  const handleToggleVisibility = async () => {
    if (!myGroup) return;
    try {
      const res = await groupService.toggleVisibility(myGroup._id);
      setMyGroup(res.data as unknown as PopulatedGroup);
      toast.success(res.message);
    } catch {
      toast.error("Failed to update group visibility.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!myGroup) return;
    try {
      await groupService.leaveGroup(myGroup._id);
      toast.success("You have left the group");
      navigate("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to leave group.";
      toast.error(message);
    }
  };

  const handleRemoveInterest = async (projectId: string) => {
    if (!myGroup) return;
    try {
      const res = await groupService.removeInterestedProject(
        myGroup._id,
        projectId,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      toast.success("Interest removed from project");
    } catch {
      toast.error("Failed to remove interest.");
    }
  };

  const handleRespondToRequest = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    if (!myGroup) return;
    try {
      const res = await groupService.respondToJoinRequest(
        myGroup._id,
        requestId,
        status,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      toast.success(res.message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to respond to request.";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading group…</p>
        </div>
      </div>
    );
  }

  if (!myGroup) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">You're not in a group</h1>
          <p className="text-muted-foreground mb-6">
            Create a new group or join one with a group code from the dashboard.
          </p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const interestedProjects = myGroup.interestedProjects ?? [];
  const members = myGroup.groupMembers ?? [];
  const pendingRequests = (myGroup.joinRequests ?? []).filter(
    (r) => r.status === "pending",
  );

  // Group leader is the first member (creator)
  const isLeader = members.length > 0 && members[0]._id === user?.id;

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
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant={myGroup.isOpen ? "default" : "secondary"}>
                    {myGroup.isOpen ? "Open" : "Closed"}
                  </Badge>
                  <Badge
                    variant={
                      myGroup.isPublic !== false ? "outline" : "secondary"
                    }
                    className="flex items-center gap-1"
                  >
                    {myGroup.isPublic !== false ? (
                      <>
                        <Globe className="h-3 w-3" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Private
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    className="gap-2"
                  >
                    {myGroup.isOpen ? (
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
                  {isLeader && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleVisibility}
                      className="gap-2"
                    >
                      {myGroup.isPublic !== false ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </Button>
                  )}
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
                    {myGroup.groupCode}
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
                {myGroup.isPublic !== false
                  ? "Share this code with other students to invite them to your group"
                  : "Share this code — students will need to request to join and you'll approve them"}
              </p>
            </CardContent>
          </Card>

          {/* Join Requests — only visible to group leader on private groups */}
          {isLeader && myGroup.isPublic === false && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Join Requests
                  {pendingRequests.length > 0 && (
                    <Badge className="ml-1">{pendingRequests.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No pending join requests
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {req.userId.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {req.userId.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              handleRespondToRequest(req._id, "approved")
                            }
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleRespondToRequest(req._id, "rejected")
                            }
                          >
                            <X className="h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member: PopulatedMember, idx: number) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        {member.name}
                        {idx === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Leader
                          </Badge>
                        )}
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
                  {interestedProjects.map((project: PopulatedProject) => (
                    <div
                      key={project._id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {project.name}
                          </h3>
                          <Badge
                            variant={project.isOpen ? "default" : "secondary"}
                          >
                            {project.assignedGroup
                              ? "Assigned"
                              : project.isOpen
                                ? "Open"
                                : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(project.majors ?? []).map(
                            (rm: { major: string }, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {rm.major}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/project/${project._id}`}>View</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInterest(project._id)}
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
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
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
