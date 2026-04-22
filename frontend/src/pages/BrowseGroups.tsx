import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Users, Globe, Lock, ArrowRight, Search } from "lucide-react";
import { toast } from "sonner";
import { groupService } from "@/services/group.service";
import type { GroupData } from "@/services/group.service";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[10px] font-bold uppercase text-gray-400"
    style={{ letterSpacing: "0.18em" }}
  >
    {children}
  </p>
);

const BrowseGroups = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [search, setSearch] = useState("");

  // Private group join dialog
  const [privateDialogGroup, setPrivateDialogGroup] =
    useState<GroupData | null>(null);
  const [privateCode, setPrivateCode] = useState("");
  const [submittingCode, setSubmittingCode] = useState(false);

  useEffect(() => {
    groupService
      .getAllGroups()
      .then((res) => setGroups(res.data))
      .catch(() => toast.error("Failed to load groups."))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinPublic = async (group: GroupData) => {
    if (!group.groupCode) return;
    setJoiningId(group._id);
    try {
      await groupService.joinGroup(group.groupCode);
      toast.success("Joined group!");
      await refreshUser();
      navigate("/group");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join group.");
    } finally {
      setJoiningId(null);
    }
  };

  const handleJoinPrivate = async () => {
    const code = privateCode.trim();
    if (code.length !== 10) {
      toast.error("Group codes are exactly 10 characters.");
      return;
    }
    setSubmittingCode(true);
    try {
      const res = await groupService.joinGroup(code);
      if (res.requestPending) {
        toast.success("Request sent — the group leader will review it.");
        setPrivateDialogGroup(null);
        setPrivateCode("");
      } else {
        toast.success("Joined group!");
        await refreshUser();
        navigate("/group");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid or incorrect code.",
      );
    } finally {
      setSubmittingCode(false);
    }
  };

  const filtered = groups.filter((g) => {
    if (filter === "open" && !g.isOpen) return false;
    if (filter === "closed" && g.isOpen) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const label = (g.name ?? `Group ${g.groupNumber}`).toLowerCase();
      if (!label.includes(q) && !`group ${g.groupNumber}`.includes(q))
        return false;
    }
    return true;
  });

  return (
    <div className="relative min-h-screen bg-gray-50/40 overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="fill-gray-100/60 stroke-gray-200/60"
      />
      <Navbar />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
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
                Student Groups
              </p>
              <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-none">
                Browse Groups
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">
                Find a group to join or see who's looking for teammates.
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search groups by name or number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ ["--tw-ring-color" as string]: "#9B2335" }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {(["all", "open", "closed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 capitalize"
              style={
                filter === tab
                  ? { background: "#9B2335", color: "#fff" }
                  : { color: "#6b7280" }
              }
            >
              {tab === "all"
                ? `All (${groups.length})`
                : tab === "open"
                  ? `Open (${groups.filter((g) => g.isOpen).length})`
                  : `Closed (${groups.filter((g) => !g.isOpen).length})`}
            </button>
          ))}
        </div>

        {/* Groups list */}
        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Loading groups…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">
              No groups found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((group) => {
              const isMyGroup = user?.groupId === group._id;
              const memberCount =
                group.numberOfMembers ?? group.groupMembers.length;

              return (
                <div
                  key={group._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className="h-[3px]"
                    style={{
                      background:
                        "linear-gradient(to right, #9B2335, #c23b52, rgba(155,35,53,0.2))",
                    }}
                  />
                  <div className="p-5">
                    {/* Name + badges */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-base truncate">
                          {group.name ?? `Group ${group.groupNumber}`}
                        </p>
                        {group.name && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Group {group.groupNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={
                            group.isOpen
                              ? { background: "#ecfdf5", color: "#065f46" }
                              : { background: "#f3f4f6", color: "#6b7280" }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: group.isOpen ? "#10b981" : "#9ca3af",
                            }}
                          />
                          {group.isOpen ? "Open" : "Closed"}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {group.isPublic ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          {group.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                    </div>

                    {/* Member count */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <SectionLabel>
                        {group.isPublic
                          ? "Open group"
                          : "Private — enter code to join"}
                      </SectionLabel>

                      {isMyGroup ? (
                        <button
                          onClick={() => navigate("/group")}
                          className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                          style={{ color: "#9B2335" }}
                        >
                          My Group <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : group.isPublic ? (
                        /* Public → direct join */
                        <button
                          onClick={() => handleJoinPublic(group)}
                          disabled={joiningId === group._id || !group.isOpen}
                          className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 bg-[#9B2335] text-white hover:bg-[#7f1d2d] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {joiningId === group._id
                            ? "Joining…"
                            : group.isOpen
                              ? "Join"
                              : "Closed"}
                        </button>
                      ) : (
                        /* Private → open code dialog */
                        <button
                          onClick={() => {
                            setPrivateDialogGroup(group);
                            setPrivateCode("");
                          }}
                          disabled={!group.isOpen}
                          className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 bg-[#9B2335] text-white hover:bg-[#7f1d2d] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {group.isOpen ? "Enter Code" : "Closed"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Private group join dialog */}
      <Dialog
        open={!!privateDialogGroup}
        onOpenChange={(open) => {
          if (!open) {
            setPrivateDialogGroup(null);
            setPrivateCode("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Join{" "}
              {privateDialogGroup?.name ??
                `Group ${privateDialogGroup?.groupNumber}`}
            </DialogTitle>
            <DialogDescription>
              This is a private group. Enter the invite code shared by a group
              member to request access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Enter 10-character group code"
              value={privateCode}
              onChange={(e) => setPrivateCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="font-mono tracking-widest text-center text-base"
              onKeyDown={(e) => e.key === "Enter" && handleJoinPrivate()}
            />
            <Button
              onClick={handleJoinPrivate}
              disabled={submittingCode || privateCode.trim().length !== 10}
              className="w-full"
              style={{ background: "#9B2335" }}
            >
              {submittingCode ? "Sending request…" : "Request to Join"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseGroups;
