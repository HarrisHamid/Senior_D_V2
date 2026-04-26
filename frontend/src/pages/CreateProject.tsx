import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/project.service";
import { UploadService } from "@/services/upload.service";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paperclip, X } from "lucide-react";

const AVAILABLE_MAJORS = [
  "Artificial Intelligence",
  "Biology",
  "Biomedical Engineering",
  "Chemical Biology",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Cybersecurity",
  "Electrical Engineering",
  "Engineering Management",
  "Environmental Engineering",
  "Mathematics",
  "Mechanical Engineering",
  "Naval Engineering",
  "Physics",
  "Software Engineering",
  "Accounting & Analytics",
  "Business & Technology",
  "Economics",
  "Finance",
  "Information Systems",
  "Management",
  "Marketing Innovation & Analytics",
  "Quantitative Finance",
  "History",
  "Literature",
  "Music & Technology",
  "Philosophy",
  "Science Communication",
  "Social Sciences",
  "Visual Arts & Technology",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactEntry {
  name: string;
  email: string;
}

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "course coordinator") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [internal, setInternal] = useState("false");
  const [sponsor, setSponsor] = useState("");
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [advisors, setAdvisors] = useState<ContactEntry[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Dynamic field helpers ---

  const addContact = () =>
    setContacts((prev) => [...prev, { name: "", email: "" }]);
  const removeContact = (i: number) =>
    setContacts((prev) => prev.filter((_, idx) => idx !== i));
  const updateContact = (i: number, field: "name" | "email", value: string) =>
    setContacts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    );

  const addAdvisor = () =>
    setAdvisors((prev) => [...prev, { name: "", email: "" }]);
  const removeAdvisor = (i: number) =>
    setAdvisors((prev) => prev.filter((_, idx) => idx !== i));
  const updateAdvisor = (i: number, field: "name" | "email", value: string) =>
    setAdvisors((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)),
    );

  const selectedMajors = new Set(majors);
  const addMajor = () => {
    const next = AVAILABLE_MAJORS.find((m) => !selectedMajors.has(m));
    if (next) setMajors((prev) => [...prev, next]);
  };
  const removeMajor = (i: number) =>
    setMajors((prev) => prev.filter((_, idx) => idx !== i));
  const updateMajor = (i: number, value: string) =>
    setMajors((prev) => prev.map((m, idx) => (idx === i ? value : m)));

  const availableForIndex = (i: number) =>
    AVAILABLE_MAJORS.filter((m) => !selectedMajors.has(m) || m === majors[i]);

  // --- File staging helpers ---

  const ACCEPTED =
    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    setPendingFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...selected.filter((f) => !existingNames.has(f.name))];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (name: string) =>
    setPendingFiles((prev) => prev.filter((f) => f.name !== name));

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // --- Validation & submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      setError("Year must be between 2020 and 2100");
      return;
    }
    if (!sponsor.trim()) {
      setError("Sponsor name is required");
      return;
    }

    for (const [idx, c] of contacts.entries()) {
      if (!c.name.trim() || !c.email.trim()) {
        setError(
          `Sponsor contact ${idx + 1}: both name and email are required`,
        );
        return;
      }
      if (!EMAIL_REGEX.test(c.email)) {
        setError(`Sponsor contact ${idx + 1}: invalid email address`);
        return;
      }
    }

    for (const [idx, a] of advisors.entries()) {
      if (!a.name.trim() || !a.email.trim()) {
        setError(`Advisor ${idx + 1}: both name and email are required`);
        return;
      }
      if (!EMAIL_REGEX.test(a.email)) {
        setError(`Advisor ${idx + 1}: invalid email address`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await projectService.createProject({
        name: name.trim(),
        description: description.trim(),
        year: yearNum,
        internal: internal === "true",
        sponsor: sponsor.trim(),
        contacts: contacts.map((c) => ({
          name: c.name.trim(),
          email: c.email.trim(),
        })),
        advisors: advisors.map((a) => ({
          name: a.name.trim(),
          email: a.email.trim(),
        })),
        majors: majors.map((m) => ({ major: m })),
      });

      const newProjectId = res.data.project._id;

      // Upload any staged files sequentially
      if (pendingFiles.length > 0) {
        let failed = 0;
        for (const file of pendingFiles) {
          try {
            await UploadService.uploadFile(newProjectId, file);
          } catch {
            failed++;
          }
        }
        if (failed === 0) {
          toast.success("Project created with files attached!");
        } else {
          toast.warning(
            `Project created, but ${failed} file(s) failed to upload.`,
          );
        }
      } else {
        toast.success("Project created successfully!");
      }

      navigate(`/project/${newProjectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9B2335] rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
              <CardTitle className="text-2xl">Add a Project</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project name */}
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smart Campus Energy Management"
                  maxLength={200}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project goals, scope, and deliverables…"
                  maxLength={5000}
                  rows={4}
                  required
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>

              {/* Year & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2025"
                    min={2020}
                    max={2100}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="internal">Project Type</Label>
                  <Select
                    value={internal}
                    onValueChange={setInternal}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="internal" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">External</SelectItem>
                      <SelectItem value="true">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sponsor */}
              <div>
                <Label htmlFor="sponsor">Sponsor</Label>
                <Input
                  id="sponsor"
                  type="text"
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  maxLength={200}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              {/* Sponsor Contacts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Sponsor Contacts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContact}
                    disabled={isSubmitting}
                  >
                    + Add Contact
                  </Button>
                </div>
                {contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No contacts added.
                  </p>
                )}
                <div className="space-y-3">
                  {contacts.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={c.name}
                          onChange={(e) =>
                            updateContact(i, "name", e.target.value)
                          }
                          placeholder="Name"
                          disabled={isSubmitting}
                        />
                        <Input
                          type="email"
                          value={c.email}
                          onChange={(e) =>
                            updateContact(i, "email", e.target.value)
                          }
                          placeholder="Email"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(i)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-red-500 mt-0.5"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Advisors</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdvisor}
                    disabled={isSubmitting}
                  >
                    + Add Advisor
                  </Button>
                </div>
                {advisors.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No advisors added.
                  </p>
                )}
                <div className="space-y-3">
                  {advisors.map((a, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={a.name}
                          onChange={(e) =>
                            updateAdvisor(i, "name", e.target.value)
                          }
                          placeholder="Name"
                          disabled={isSubmitting}
                        />
                        <Input
                          type="email"
                          value={a.email}
                          onChange={(e) =>
                            updateAdvisor(i, "email", e.target.value)
                          }
                          placeholder="Email"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdvisor(i)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-red-500 mt-0.5"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Majors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Recommended Majors</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMajor}
                    disabled={
                      isSubmitting || majors.length >= AVAILABLE_MAJORS.length
                    }
                  >
                    + Add Major
                  </Button>
                </div>
                {majors.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No majors added.
                  </p>
                )}
                <div className="space-y-2">
                  {majors.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Select
                        value={m}
                        onValueChange={(val) => updateMajor(i, val)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableForIndex(i).map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMajor(i)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Files */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4" />
                    Attach Files
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Add File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                {pendingFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No files selected. PDFs, Office docs, images, and ZIPs up to
                    10 MB each.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingFiles.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between px-3 py-2 border rounded-lg bg-muted/30"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => removePendingFile(file.name)}
                          className="ml-2 shrink-0 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#9B2335] hover:bg-[#7f1d2d] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(155,35,53,0.35)] active:translate-y-0 active:shadow-none text-white transition-all duration-200"
              >
                {isSubmitting
                  ? pendingFiles.length > 0
                    ? "Creating & Uploading…"
                    : "Creating Project…"
                  : "Create Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
