import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Mail,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Paperclip,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Download,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { projectService } from "@/services/project.service";
import type { ProjectData } from "@/services/project.service";
import { groupService } from "@/services/group.service";
import { UploadService } from "@/services/upload.service";

interface UploadedFileData {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ mimetype }: { mimetype: string }) => {
  const cls = "w-4 h-4 shrink-0";
  if (mimetype.startsWith("image/")) return <FileImage className={cls} />;
  if (mimetype.startsWith("video/")) return <FileVideo className={cls} />;
  if (mimetype.startsWith("audio/")) return <FileAudio className={cls} />;
  if (
    mimetype === "application/pdf" ||
    mimetype.includes("word") ||
    mimetype.includes("text")
  )
    return <FileText className={cls} />;
  return <File className={cls} />;
};

const statusLabel = (project: ProjectData) => {
  if (project.assignedGroup) return "Assigned";
  if (project.isOpen) return "Open";
  return "Closed";
};

const statusStyles: Record<string, React.CSSProperties> = {
  Open: {
    background: "linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)",
    color: "#065f46",
    border: "1px solid #6ee7b7",
  },
  Closed: {
    background: "linear-gradient(180deg, #fee2e2 0%, #fecaca 100%)",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  },
  Assigned: {
    background: "linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)",
    color: "#374151",
    border: "1px solid #d1d5db",
  },
};

const pillStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
  border: "1px solid #e5e7eb",
  color: "#374151",
};

const cardStyle: React.CSSProperties = {
  boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)",
};

const getMailtoHref = (email: string | undefined | null) => {
  if (!email) return null;
  const trimmedEmail = email.trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  return isValidEmail ? `mailto:${encodeURIComponent(trimmedEmail)}` : null;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
    {children}
  </p>
);

const Panel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-xl p-6 ${className}`} style={cardStyle}>
    {children}
  </div>
);

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [interestedGroups, setInterestedGroups] = useState<
    {
      _id: string;
      groupNumber: number;
      name?: string;
      groupMembers: {
        _id: string;
        name: string;
        email: string;
        major?: string;
      }[];
    }[]
  >([]);
  const [allGroups, setAllGroups] = useState<
    { _id: string; groupNumber: number; groupMembers: unknown[] }[]
  >([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [alreadyInterested, setAlreadyInterested] = useState(false);
  const [groupAssigned, setGroupAssigned] = useState(false);
  const [interestLimitReached, setInterestLimitReached] = useState(false);

  const [files, setFiles] = useState<UploadedFileData[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSeeFiles = () => !!user;

  const loadFiles = async (projectId: string) => {
    setFilesLoading(true);
    try {
      const res = await UploadService.listFiles(projectId);
      setFiles(res.data?.files ?? []);
    } catch {
      // non-fatal: user may not have access
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    projectService
      .getProjectById(id)
      .then(async (res) => {
        const p = res.data.project;
        setProject(p);
        if (canSeeFiles()) loadFiles(id);
        if (user?.role === "course coordinator") {
          const [interestedRes, allGroupsRes] = await Promise.all([
            groupService.getAllInterestedGroups(id),
            groupService.getAllGroups(),
          ]);
          setInterestedGroups(
            (interestedRes.data ?? []) as unknown as typeof interestedGroups,
          );
          setAllGroups(allGroupsRes.data ?? []);
        } else if (user?.role === "student" && user.groupId) {
          try {
            const groupRes = await groupService.getGroupById(user.groupId);
            const group = groupRes.data;
            const interested = group.interestedProjects.some((pid: unknown) =>
              typeof pid === "string"
                ? pid === id
                : (pid as { _id: string })?._id === id,
            );
            setAlreadyInterested(interested);
            setGroupAssigned(!!group.assignedProject);
            setInterestLimitReached(group.interestedProjects.length >= 4);
          } catch {
            // non-fatal
          }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !id) return;
    const file = fileList[0];
    setUploading(true);
    try {
      const res = await UploadService.uploadFile(id, file);
      setFiles((prev) => [res.data.file, ...prev]);
      toast.success(`"${file.name}" uploaded successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (file: UploadedFileData) => {
    if (!id) return;
    try {
      const blob = await UploadService.downloadFile(id, file._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file.");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!id) return;
    setDeletingFileId(fileId);
    try {
      await UploadService.deleteFile(id, fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      toast.success("File deleted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      toast.error(message);
    } finally {
      setDeletingFileId(null);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-white overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />
        <Navbar />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          <p className="text-muted-foreground">Loading project…</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="relative min-h-screen bg-white overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />
        <Navbar />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-[#0d0d0d] mb-4">
            Project not found
          </h1>
          <button
            onClick={() => navigate("/marketplace")}
            className="text-sm text-muted-foreground hover:text-[#9B2335] transition-colors flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const status = statusLabel(project);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#9B2335] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={statusStyles[status]}
            >
              {status}
            </span>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={pillStyle}
            >
              {project.internal ? "Internal" : "External"}
            </span>
            <span className="text-sm text-muted-foreground">
              {project.year}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0d0d0d]">
            {project.name}
          </h1>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Panel>
              <SectionLabel>Description</SectionLabel>
              <p className="text-[#0d0d0d] leading-relaxed">
                {project.description}
              </p>
            </Panel>

            {/* Recommended Majors */}
            {project.majors.length > 0 && (
              <Panel>
                <SectionLabel>Recommended Majors</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {project.majors.map((rm, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                      style={pillStyle}
                    >
                      <GraduationCap className="w-3 h-3 mr-1.5 opacity-60" />
                      {rm.major}
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            {/* Files */}
            {project && canSeeFiles() && (
              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Files
                    </p>
                  </div>
                  {user?.role === "course coordinator" && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? "Uploading…" : "Upload"}
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />

                {/* Drop zone (coordinator only) */}
                {user?.role === "course coordinator" && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      handleUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 py-5 cursor-pointer transition-colors"
                    style={{
                      borderColor: isDragOver ? "#9B2335" : "#e5e7eb",
                      background: isDragOver
                        ? "rgba(155,35,53,0.04)"
                        : "transparent",
                    }}
                  >
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isDragOver
                        ? "Drop to upload"
                        : "Drag & drop a file, or click to browse"}
                    </span>
                  </div>
                )}

                {/* File list */}
                {filesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading files…
                  </p>
                ) : files.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No files uploaded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file._id}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div className="text-muted-foreground shrink-0">
                          <FileIcon mimetype={file.mimetype} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0d0d0d] truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                            {file.createdAt && (
                              <>
                                {" "}
                                ·{" "}
                                {new Date(file.createdAt).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#9B2335] hover:bg-white transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === "course coordinator" && (
                            <button
                              onClick={() => handleDeleteFile(file._id)}
                              disabled={deletingFileId === file._id}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-white transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}

            {/* Student: Show Interest */}
            {user?.role === "student" &&
              project.isOpen &&
              !project.assignedGroup && (
                <Panel>
                  <SectionLabel>Express Interest</SectionLabel>
                  {groupAssigned ? (
                    <p className="text-sm text-muted-foreground">
                      Your group is already assigned to a project.
                    </p>
                  ) : interestLimitReached ? (
                    <p className="text-sm text-muted-foreground">
                      Your group has reached the maximum of 4 interested
                      projects.
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <p className="text-sm text-muted-foreground flex-1">
                        Your group can show interest in up to 4 projects. This
                        will notify the course coordinator.
                      </p>
                      <button
                        onClick={handleShowInterest}
                        disabled={alreadyInterested}
                        className={`shrink-0 inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                          alreadyInterested
                            ? "bg-gray-100 text-gray-600 border border-gray-200"
                            : "text-white bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none"
                        }`}
                      >
                        {alreadyInterested
                          ? "Interest Registered"
                          : "Express Interest"}
                      </button>
                    </div>
                  )}
                </Panel>
              )}

            {/* Coordinator: Interested Groups + Assign */}
            {user?.role === "course coordinator" && (
              <Panel>
                <SectionLabel>Interested Groups</SectionLabel>
                {interestedGroups.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {interestedGroups.map((group) => {
                      const isExpanded = expandedGroups.has(group._id);
                      return (
                        <div
                          key={group._id}
                          className="rounded-xl overflow-hidden"
                          style={{
                            boxShadow:
                              "0 0 0 1px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div className="flex items-center justify-between p-3.5 bg-white">
                            <button
                              className="flex items-center gap-2 text-left flex-1"
                              onClick={() =>
                                setExpandedGroups((prev) => {
                                  const next = new Set(prev);
                                  if (isExpanded) {
                                    next.delete(group._id);
                                  } else {
                                    next.add(group._id);
                                  }
                                  return next;
                                })
                              }
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg, hsl(351,63%,90%), hsl(0,80%,92%))",
                                }}
                              >
                                <Users
                                  className="w-4 h-4"
                                  style={{ color: "hsl(351,63%,32%)" }}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#0d0d0d]">
                                  {group.name ?? `Group ${group.groupNumber}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {group.groupMembers?.length ?? 0} member
                                  {group.groupMembers?.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
                              )}
                            </button>
                            {!project.assignedGroup && (
                              <button
                                disabled={assigning}
                                onClick={() => handleAssignGroup(group._id)}
                                className="ml-3 shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Assign
                              </button>
                            )}
                          </div>
                          {isExpanded && group.groupMembers?.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 space-y-2">
                              {group.groupMembers.map((member) => (
                                <div
                                  key={member._id}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-sm font-medium text-[#0d0d0d]">
                                    {member.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {member.major && (
                                      <span className="text-xs text-muted-foreground">
                                        {member.major}
                                      </span>
                                    )}
                                    <a
                                      href={`mailto:${member.email}`}
                                      className="text-xs text-muted-foreground hover:text-[#9B2335] flex items-center gap-1 transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                      {member.email}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-6">
                    No groups have shown interest yet.
                  </p>
                )}

                {!project.assignedGroup && allGroups.length > 0 && (
                  <div className="pt-5 border-t border-gray-100">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
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
                        className="shrink-0 bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0"
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
              </Panel>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sponsor */}
            <Panel>
              <SectionLabel>Sponsor</SectionLabel>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(351,63%,90%), hsl(0,80%,92%))",
                  }}
                >
                  <Building2
                    className="w-4 h-4"
                    style={{ color: "hsl(351,63%,32%)" }}
                  />
                </div>
                <p className="font-semibold text-[#0d0d0d]">
                  {project.sponsor}
                </p>
              </div>

              {project.contacts.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Contacts
                  </p>
                  <div className="space-y-2">
                    {project.contacts.map((contact, idx) => {
                      const mailtoHref = getMailtoHref(contact.email);
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            background:
                              "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <p className="text-sm font-medium text-[#0d0d0d]">
                            {contact.name}
                          </p>
                          {mailtoHref ? (
                            <a
                              href={mailtoHref}
                              className="text-xs text-muted-foreground hover:text-[#9B2335] flex items-center gap-1 mt-0.5 transition-colors"
                            >
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Panel>

            {/* Advisors */}
            {project.advisors.length > 0 && (
              <Panel>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(351,63%,90%), hsl(0,80%,92%))",
                    }}
                  >
                    <Users
                      className="w-4 h-4"
                      style={{ color: "hsl(351,63%,32%)" }}
                    />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Advisors
                  </p>
                </div>
                <div className="space-y-2">
                  {project.advisors.map((advisor, idx) => {
                    const mailtoHref = getMailtoHref(advisor.email);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <p className="text-sm font-medium text-[#0d0d0d]">
                          {advisor.name}
                        </p>
                        {mailtoHref ? (
                          <a
                            href={mailtoHref}
                            className="text-xs text-muted-foreground hover:text-[#9B2335] flex items-center gap-1 mt-0.5 transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            {advisor.email}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {advisor.email}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
