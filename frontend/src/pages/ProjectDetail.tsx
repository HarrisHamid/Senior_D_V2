import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Users, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { projectService } from "@/services/project.service";
import type { ProjectData } from "@/services/project.service";
import { groupService } from "@/services/group.service";

const statusLabel = (project: ProjectData) => {
  if (project.assignedGroup) return "Assigned";
  if (project.isOpen) return "Open";
  return "Closed";
};

const statusClass = (project: ProjectData): string => {
  if (project.assignedGroup) return "bg-gray-100 text-gray-700 border-gray-200";
  if (project.isOpen) return "bg-green-100 text-green-800 border-green-200";
  return "bg-red-100 text-red-800 border-red-200";
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [interestedGroups, setInterestedGroups] = useState<
    { _id: string; groupNumber: number; groupMembers: unknown[] }[]
  >([]);
  const [allGroups, setAllGroups] = useState<
    { _id: string; groupNumber: number; groupMembers: unknown[] }[]
  >([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [alreadyInterested, setAlreadyInterested] = useState(false);
  const [groupAssigned, setGroupAssigned] = useState(false);
  const [interestLimitReached, setInterestLimitReached] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectService
      .getProjectById(id)
      .then(async (res) => {
        const p = res.data.project;
        setProject(p);
        if (user?.role === "course coordinator") {
          const [interestedRes, allGroupsRes] = await Promise.all([
            groupService.getAllInterestedGroups(id),
            groupService.getAllGroupsByCourse(p.courseId),
          ]);
          setInterestedGroups(interestedRes.data ?? []);
          setAllGroups(allGroupsRes.data ?? []);
        } else if (user?.role === "student" && user.groupId) {
          try {
            const groupRes = await groupService.getGroupById(user.groupId);
            const group = groupRes.data.group;
            const interested = group.interestedProjects.some(
              (pid: unknown) =>
                typeof pid === "string"
                  ? pid === id
                  : (pid as { _id: string })?._id === id,
            );
            setAlreadyInterested(interested);
            setGroupAssigned(!!group.assignedProject);
            setInterestLimitReached(group.interestedProjects.length >= 4);
          } catch {
            // non-fatal — button just stays enabled
          }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user?.role, user?.groupId]);

  const handleShowInterest = async () => {
    if (!user?.groupId) {
      toast.error("You need to be in a group to express interest.");
      return;
    }
    try {
      await groupService.addInterestedProject(user.groupId, id!);
      setAlreadyInterested(true);
      toast.success("Interest registered successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to register interest.";
      toast.error(message);
    }
  };

  const handleAssignGroup = async (groupId: string) => {
    if (!groupId) return;
    setAssigning(true);
    try {
      const res = await projectService.assignGroup(id!, { groupId });
      setProject(res.data.project);
      toast.success("Group assigned successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign group.";
      toast.error(message);
    } finally {
      setAssigning(false);
    }
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
                    <Badge className={statusClass(project)}>
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
              <p className="font-medium text-foreground mb-3">
                {project.sponsor}
              </p>
              {project.contacts.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Contacts
                  </p>
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
          {user?.role === "student" &&
            project.isOpen &&
            !project.assignedGroup && (
              <Card>
                <CardHeader>
                  <CardTitle>Show Interest</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupAssigned ? (
                    <p className="text-sm text-muted-foreground">
                      Your group is already assigned to a project and cannot express interest in others.
                    </p>
                  ) : interestLimitReached ? (
                    <p className="text-sm text-muted-foreground">
                      Your group has reached the maximum of 4 interested projects.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Your group can show interest in up to 4 projects. This will
                        notify the course coordinator.
                      </p>
                      <Button
                        onClick={handleShowInterest}
                        className="w-full sm:w-auto"
                        disabled={alreadyInterested}
                      >
                        {alreadyInterested ? "Interest Registered" : "Express Interest"}
                      </Button>
                    </>
                  )}
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
                  <div className="space-y-3">
                    {interestedGroups.map((group) => (
                      <div
                        key={group._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            Group {group.groupNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {group.groupMembers?.length ?? 0} members
                          </p>
                        </div>
                        {!project.assignedGroup && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={assigning}
                            onClick={() => handleAssignGroup(group._id)}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No groups have shown interest yet.
                  </p>
                )}

                {!project.assignedGroup && allGroups.length > 0 && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium mb-2 block">
                      Assign any group
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
                          {allGroups.map((group) => (
                            <SelectItem key={group._id} value={group._id}>
                              Group {group.groupNumber} (
                              {group.groupMembers?.length ?? 0} members)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!selectedGroup || assigning}
                        onClick={() => handleAssignGroup(selectedGroup)}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                )}

                {project.assignedGroup && (
                  <p className="text-sm text-muted-foreground">
                    This project has been assigned to a group.
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
