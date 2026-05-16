import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Button } from "@/components/ui/button";
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
  FolderOpen,
  ArrowRight,
  Crown,
  Pencil,
  ChevronDown,
  ChevronUp,
  Mail,
  Building2,
  Paperclip,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { groupService } from "@/services/group.service";
import type { JoinRequest } from "@/services/group.service";
import { UploadService } from "@/services/upload.service";
import { useAuth } from "@/contexts/AuthContext";

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
  major?: string;
}

interface PopulatedProject {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  assignedGroup: string | null;
  majors: { major: string }[];
  sponsor?: string;
  contacts?: { name: string; email: string }[];
  advisors?: { name: string; email: string }[];
  year?: number;
  internal?: boolean;
}

interface UploadedFileData {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt?: string;
}

const PREVIEWABLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileTypeIcon = ({ mimetype }: { mimetype: string }) => {
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

interface PopulatedGroup {
  _id: string;
  groupNumber: number;
  name?: string;
  groupCode?: string;
  isOpen: boolean;
  isPublic: boolean;
  groupMembers: PopulatedMember[];
  interestedProjects: PopulatedProject[];
  assignedProject: PopulatedProject | null;
  joinRequests: JoinRequest[];
}

/* ── shared card chrome ─────────────────────────────────── */
const CardShell = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
  >
    <div
      className="h-[3px]"
      style={{
        background:
          "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
      }}
    />
    <div className="p-6">{children}</div>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[10px] font-bold uppercase text-gray-400"
    style={{ letterSpacing: "0.18em" }}
  >
    {children}
  </p>
);

const IconBadge = ({ icon: Icon }: { icon: React.ElementType }) => (
  <div
    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
    style={{ background: "rgba(155,35,53,0.08)" }}
  >
    <Icon className="w-4 h-4" style={{ color: "#9B2335" }} />
  </div>
);

/* ── per-project expandable card ───────────────────────── */
const projectStatusStyle = (project: PopulatedProject) => {
  if (project.assignedGroup)
    return { label: "Assigned", bg: "#f5f3ff", color: "#6d28d9" };
  if (project.isOpen) return { label: "Open", bg: "#ecfdf5", color: "#065f46" };
  return { label: "Closed", bg: "#f3f4f6", color: "#6b7280" };
};

interface ProjectCardProps {
  project: PopulatedProject;
  expanded: boolean;
  onToggle: () => void;
  files: UploadedFileData[] | undefined;
  filesLoading: boolean;
  onDownload: (file: UploadedFileData, projectId: string) => void;
  onPreview: (file: UploadedFileData, projectId: string) => void;
  variant: "assigned" | "interested";
  onRemove?: () => void;
}

const ProjectCard = ({
  project,
  expanded,
  onToggle,
  files,
  filesLoading,
  onDownload,
  onPreview,
  variant,
  onRemove,
}: ProjectCardProps) => {
  const { label, bg, color } = projectStatusStyle(project);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors"
      style={{
        borderColor:
          variant === "assigned" ? "rgba(155,35,53,0.15)" : "#f3f4f6",
        background:
          variant === "assigned" ? "rgba(155,35,53,0.03)" : "transparent",
      }}
    >
      {/* ── header row ── */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {project.name}
            </h3>
            <span
              className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: bg, color }}
            >
              {label}
            </span>
          </div>
          <p
            className={`text-xs text-gray-400 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
          >
            {project.description}
          </p>
          {!expanded && (project.majors ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(project.majors ?? []).slice(0, 3).map((rm, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {rm.major}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#9B2335] hover:bg-[rgba(155,35,53,0.06)] transition-colors"
            title={expanded ? "Collapse" : "Expand details"}
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {variant === "interested" && onRemove && (
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── expanded details ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
          {/* Majors */}
          {(project.majors ?? []).length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase text-gray-400 mb-1.5"
                style={{ letterSpacing: "0.14em" }}
              >
                Recommended Majors
              </p>
              <div className="flex flex-wrap gap-1">
                {(project.majors ?? []).map((rm, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {rm.major}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sponsor + contacts */}
          {project.sponsor && (
            <div>
              <p
                className="text-[10px] font-bold uppercase text-gray-400 mb-1.5"
                style={{ letterSpacing: "0.14em" }}
              >
                Sponsor
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(155,35,53,0.08)" }}
                >
                  <Building2
                    className="w-3.5 h-3.5"
                    style={{ color: "#9B2335" }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {project.sponsor}
                </span>
              </div>
              {(project.contacts ?? []).length > 0 && (
                <div className="space-y-1.5">
                  {(project.contacts ?? []).map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <span className="text-xs font-medium text-gray-700">
                        {c.name}
                      </span>
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#9B2335] transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        {c.email}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advisors */}
          {(project.advisors ?? []).length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase text-gray-400 mb-1.5"
                style={{ letterSpacing: "0.14em" }}
              >
                Advisors
              </p>
              <div className="space-y-1.5">
                {(project.advisors ?? []).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {a.name}
                    </span>
                    <a
                      href={`mailto:${a.email}`}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#9B2335] transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      {a.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Paperclip className="w-3.5 h-3.5 text-gray-400" />
              <p
                className="text-[10px] font-bold uppercase text-gray-400"
                style={{ letterSpacing: "0.14em" }}
              >
                Attachments
              </p>
            </div>
            {filesLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading files…
              </div>
            ) : !files || files.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">No attachments.</p>
            ) : (
              <div className="space-y-1.5">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="text-gray-400 shrink-0">
                      <FileTypeIcon mimetype={file.mimetype} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {PREVIEWABLE_TYPES.has(file.mimetype) && (
                        <button
                          onClick={() => onPreview(file, project._id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#9B2335] hover:bg-white transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDownload(file, project._id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-[#9B2335] hover:bg-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── component ──────────────────────────────────────────── */
const Group = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [myGroup, setMyGroup] = useState<PopulatedGroup | null>(null);
  const [loading, setLoading] = useState(() => !!user?.groupId);
  const [memberToRemove, setMemberToRemove] = useState<PopulatedMember | null>(
    null,
  );
  const [memberToPromote, setMemberToPromote] =
    useState<PopulatedMember | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [projectFiles, setProjectFiles] = useState<
    Record<string, UploadedFileData[]>
  >({});
  const [filesLoading, setFilesLoading] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<{
    file: UploadedFileData;
    projectId: string;
  } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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
      const res = await groupService.leaveGroup(myGroup._id);
      if (res.leadershipTransferred && res.newLeader) {
        toast.success(`${res.newLeader.name} is now the group leader`);
      } else {
        toast.success("You have left the group");
      }
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to leave group.",
      );
    }
  };

  const handlePromoteLeader = async () => {
    if (!myGroup || !memberToPromote) return;
    try {
      const res = await groupService.promoteLeader(
        myGroup._id,
        memberToPromote._id,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      setMemberToPromote(null);
      toast.success(`${memberToPromote.name} is now the group leader`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to promote member",
      );
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

  const handleRemoveMember = async () => {
    if (!myGroup || !memberToRemove) return;
    try {
      const res = await groupService.removeMember(
        myGroup._id,
        memberToRemove._id,
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      setMemberToRemove(null);
      toast.success(`${memberToRemove.name} has been removed from the group`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member",
      );
    }
  };

  const handleUpdateGroupName = async () => {
    if (!myGroup || !editNameValue.trim()) return;
    try {
      const res = await groupService.updateGroupName(
        myGroup._id,
        editNameValue.trim(),
      );
      setMyGroup(res.data as unknown as PopulatedGroup);
      setIsEditingName(false);
      toast.success("Group name updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update group name.",
      );
      setEditNameValue(myGroup.name ?? `Group ${myGroup.groupNumber}`);
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
      toast.error(
        err instanceof Error ? err.message : "Failed to respond to request.",
      );
    }
  };

  /* ── project expand / file fetch helpers ─── */
  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        if (!(projectId in projectFiles)) fetchFiles(projectId);
      }
      return next;
    });
  };

  const fetchFiles = async (projectId: string) => {
    setFilesLoading((prev) => new Set(prev).add(projectId));
    try {
      const res = await UploadService.listFiles(projectId);
      setProjectFiles((prev) => ({
        ...prev,
        [projectId]: res.data?.files ?? [],
      }));
    } catch {
      setProjectFiles((prev) => ({ ...prev, [projectId]: [] }));
    } finally {
      setFilesLoading((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const openPreview = async (file: UploadedFileData, projectId: string) => {
    setPreviewFile({ file, projectId });
    setPreviewBlobUrl(null);
    setPreviewText(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const blob = await UploadService.downloadFile(projectId, file._id);
      if (file.mimetype === "text/plain") {
        setPreviewText(await blob.text());
      } else {
        setPreviewBlobUrl(URL.createObjectURL(blob));
      }
    } catch {
      setPreviewError("This file could not be loaded.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewFile(null);
    setPreviewBlobUrl(null);
    setPreviewText(null);
    setPreviewError(null);
    setPreviewLoading(false);
  };

  const downloadFile = async (file: UploadedFileData, projectId: string) => {
    try {
      const blob = await UploadService.downloadFile(projectId, file._id);
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

  /* ── loading / empty states ─── */
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="mb-10 flex items-start gap-4">
            <Skeleton className="w-[3px] h-14 rounded-full" />
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          {/* Two-column layout */}
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            {/* Left column */}
            <div className="flex flex-col gap-5">
              {/* Members card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-[3px] bg-gray-200" />
                <div className="p-6">
                  <Skeleton className="h-3 w-28 mb-6" />
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 py-3.5 px-3"
                    >
                      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Interested projects card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-[3px] bg-gray-200" />
                <div className="p-6">
                  <Skeleton className="h-3 w-36 mb-1" />
                  <Skeleton className="h-3 w-20 mb-5" />
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-xl border border-gray-100 mb-2.5"
                    >
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-[3px] bg-gray-200" />
                <div className="p-6 space-y-2">
                  <Skeleton className="h-3 w-16 mb-3" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!myGroup) {
    return (
      <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
        <GridPattern
          width={40}
          height={40}
          className="fill-gray-100/60 stroke-gray-200/60"
        />
        <Navbar />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're not in a group
          </h1>
          <p className="text-gray-400 mb-6 text-sm">
            Create a new group or join one from the dashboard.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none transition-all duration-200"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const interestedProjects = myGroup.interestedProjects ?? [];
  const members = myGroup.groupMembers ?? [];
  const pendingRequests = (myGroup.joinRequests ?? []).filter(
    (r) => r.status === "pending",
  );
  const isLeader = members.length > 0 && members[0]._id === user?.id;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 w-[3px] rounded-full"
                style={{
                  height: "3.5rem",
                  background:
                    "linear-gradient(to bottom, #9B2335, rgba(155,35,53,0.15))",
                }}
              />
              <div>
                <p
                  className="text-[11px] font-bold uppercase mb-1.5"
                  style={{ letterSpacing: "0.18em", color: "#9B2335" }}
                >
                  My Group
                </p>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      autoFocus
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateGroupName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      maxLength={50}
                      className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-none border-b-2 border-[#9B2335] bg-transparent outline-none w-64"
                    />
                    <button
                      onClick={handleUpdateGroupName}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(155,35,53,0.08)] text-[#9B2335] hover:bg-[rgba(155,35,53,0.15)] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                      {myGroup.name ?? `Group ${myGroup.groupNumber}`}
                    </h1>
                    {isLeader && (
                      <button
                        onClick={() => {
                          setEditNameValue(
                            myGroup.name ?? `Group ${myGroup.groupNumber}`,
                          );
                          setIsEditingName(true);
                        }}
                        title="Rename group"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[#9B2335] hover:bg-[rgba(155,35,53,0.08)] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-gray-400 mt-1.5 text-sm">
                  Manage your team and track project interests.
                </p>
              </div>
            </div>

            {/* Status pills */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: myGroup.isOpen ? "#10b981" : "#d1d5db",
                  }}
                />
                {myGroup.isOpen ? "Open" : "Closed"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-gray-600">
                {myGroup.isPublic !== false ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                {myGroup.isPublic !== false ? "Public" : "Private"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">
            {/* Members */}
            <CardShell>
              <div className="flex items-center justify-between mb-6">
                <SectionLabel>Members ({members.length})</SectionLabel>
                <IconBadge icon={Users} />
              </div>

              <div className="space-y-2">
                {members.map((member: PopulatedMember, idx: number) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: "rgba(155,35,53,0.1)",
                          color: "#9B2335",
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{member.name}</span>
                          {idx === 0 && (
                            <span
                              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md shrink-0"
                              style={{
                                background: "rgba(155,35,53,0.08)",
                                color: "#9B2335",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Leader
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {member.email}
                        </p>
                        {member.major && (
                          <p className="text-xs text-gray-400 truncate">
                            {member.major}
                          </p>
                        )}
                      </div>
                    </div>
                    {isLeader && idx !== 0 && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => setMemberToPromote(member)}
                          title="Promote to leader"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMemberToRemove(member)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardShell>

            {/* Assigned Project / Interested Projects */}
            <div className="flex-1">
              {myGroup.assignedProject ? (
                <CardShell className="h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <SectionLabel>Assigned Project</SectionLabel>
                    </div>
                    <IconBadge icon={FolderOpen} />
                  </div>

                  <ProjectCard
                    project={myGroup.assignedProject}
                    expanded={expandedProjects.has(myGroup.assignedProject._id)}
                    onToggle={() => toggleExpand(myGroup.assignedProject!._id)}
                    files={projectFiles[myGroup.assignedProject._id]}
                    filesLoading={filesLoading.has(myGroup.assignedProject._id)}
                    onDownload={downloadFile}
                    onPreview={openPreview}
                    variant="assigned"
                  />
                </CardShell>
              ) : (
                <CardShell className="h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <SectionLabel>Interested Projects</SectionLabel>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {interestedProjects.length} of 4 selected
                      </p>
                    </div>
                    <Link
                      to="/marketplace"
                      className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      style={{ color: "#9B2335" }}
                    >
                      Browse <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {interestedProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <FolderOpen className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        No projects selected yet
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Browse the marketplace to add up to 4 interests.
                      </p>
                      <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold transition-colors"
                        style={{ color: "#9B2335" }}
                      >
                        Browse Projects <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {interestedProjects.map((project: PopulatedProject) => (
                        <ProjectCard
                          key={project._id}
                          project={project}
                          expanded={expandedProjects.has(project._id)}
                          onToggle={() => toggleExpand(project._id)}
                          files={projectFiles[project._id]}
                          filesLoading={filesLoading.has(project._id)}
                          onDownload={downloadFile}
                          onPreview={openPreview}
                          variant="interested"
                          onRemove={() => handleRemoveInterest(project._id)}
                        />
                      ))}
                    </div>
                  )}
                </CardShell>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Group Overview / Invite Code */}
            <CardShell>
              {myGroup.isPublic === false && (
                <>
                  <div className="mb-4">
                    <SectionLabel>Invite Code</SectionLabel>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100 mb-2">
                    <p className="text-lg font-mono font-bold text-gray-900 tracking-[0.12em]">
                      {myGroup.groupCode ?? "—"}
                    </p>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 text-sm font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-[rgba(155,35,53,0.08)] active:scale-95"
                      style={{ color: "#9B2335" }}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    Share to let students join instantly
                  </p>
                </>
              )}

              <div
                className={
                  myGroup.isPublic === false
                    ? "pt-4 border-t border-gray-100"
                    : ""
                }
              >
                <SectionLabel>Controls</SectionLabel>
                <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={handleToggleStatus}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                  >
                    {myGroup.isOpen ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Close Group
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Open Group
                      </>
                    )}
                  </button>
                  {isLeader && (
                    <button
                      onClick={handleToggleVisibility}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#9B2335] hover:text-[#9B2335] transition-colors"
                    >
                      {myGroup.isPublic !== false ? (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" /> Make Public
                        </>
                      )}
                    </button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors active:scale-95">
                        Leave Group
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Leave Group?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to leave Group{" "}
                          {myGroup.groupNumber}? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <DialogTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogTrigger>
                        <Button
                          variant="destructive"
                          onClick={handleLeaveGroup}
                        >
                          Leave Group
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardShell>

            {/* Join Requests — leader + private only */}
            {isLeader && myGroup.isPublic === false && (
              <CardShell>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SectionLabel>Join Requests</SectionLabel>
                    {pendingRequests.length > 0 && (
                      <span
                        className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full"
                        style={{ background: "#9B2335" }}
                      >
                        {pendingRequests.length}
                      </span>
                    )}
                  </div>
                  <IconBadge icon={UserPlus} />
                </div>

                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {req.userId.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {req.userId.email}
                          </p>
                          {req.userId.major && (
                            <p className="text-xs text-gray-400 truncate">
                              {req.userId.major}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-2">
                          <button
                            onClick={() =>
                              handleRespondToRequest(req._id, "approved")
                            }
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleRespondToRequest(req._id, "rejected")
                            }
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardShell>
            )}
          </div>
        </div>

        {/* Remove Member Confirmation */}
        <Dialog
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Member?</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-foreground">
                  {memberToRemove?.name}
                </span>{" "}
                from the group? They will need to rejoin using the group code.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setMemberToRemove(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveMember}>
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Promote to Leader Confirmation */}
        <Dialog
          open={!!memberToPromote}
          onOpenChange={(open) => !open && setMemberToPromote(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote to Group Leader?</DialogTitle>
              <DialogDescription>
                Promote{" "}
                <span className="font-semibold text-foreground">
                  {memberToPromote?.name}
                </span>{" "}
                to group leader? You will no longer be the leader.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setMemberToPromote(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePromoteLeader}
                className="bg-[#9B2335] hover:bg-[#7f1d2d] text-white border-0"
              >
                Promote
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* File Preview Dialog */}
        <Dialog
          open={!!previewFile}
          onOpenChange={(open) => !open && closePreview()}
        >
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle className="truncate pr-8">
                {previewFile?.file.originalName ?? "Preview"}
              </DialogTitle>
              <DialogDescription>
                {previewFile && formatFileSize(previewFile.file.size)}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto">
              {previewLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
              {!previewLoading && previewError && (
                <p className="text-sm text-gray-400 text-center py-12">
                  {previewError}
                </p>
              )}
              {!previewLoading &&
                previewBlobUrl &&
                previewFile?.file.mimetype.startsWith("image/") && (
                  <img
                    src={previewBlobUrl}
                    alt={previewFile.file.originalName}
                    className="max-w-full h-auto mx-auto rounded"
                  />
                )}
              {!previewLoading &&
                previewBlobUrl &&
                previewFile?.file.mimetype === "application/pdf" && (
                  <iframe
                    src={previewBlobUrl}
                    title={previewFile.file.originalName}
                    className="w-full rounded border-0"
                    style={{ height: "70vh" }}
                  />
                )}
              {!previewLoading && previewText !== null && (
                <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-gray-50 rounded p-4 max-h-[60vh] overflow-y-auto">
                  {previewText}
                </pre>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={() =>
                  previewFile &&
                  downloadFile(previewFile.file, previewFile.projectId)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#9B2335] hover:bg-[#7f1d2d] transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Group;
