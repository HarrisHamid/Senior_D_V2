import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Paperclip, Send, X } from "lucide-react";
import { proposalService, type ProposalRole } from "@/services/proposal.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProposalFormProps {
  role: ProposalRole;
}

const emptyForm = {
  fullName: "",
  email: "",
  department: "",
  title: "",
  description: "",
  problemStatement: "",
  desiredSkills: "",
  preferredFacultyAdvisor: "",
  industryPartner: "",
  requiredSkills: "",
  expectedDeliverables: "",
  availableResources: "",
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ProposalForm({ role }: ProposalFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [proposalId, setProposalId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isStudent = role === "student";

  const update = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const rejected = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (rejected.length > 0) {
      toast.error("Attachments must be 10MB or smaller.");
    }
    setAttachments((prev) => [
      ...prev,
      ...files.filter((file) => file.size <= 10 * 1024 * 1024),
    ]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.description.trim().length < 100) {
      toast.error("Project description must be at least 100 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = isStudent
        ? {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            department: form.department.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            problemStatement: form.problemStatement.trim(),
            desiredSkills: form.desiredSkills.trim(),
            preferredFacultyAdvisor: form.preferredFacultyAdvisor.trim(),
          }
        : {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            department: form.department.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            industryPartner: form.industryPartner.trim(),
            requiredSkills: form.requiredSkills.trim(),
            expectedDeliverables: form.expectedDeliverables.trim(),
            availableResources: form.availableResources.trim(),
          };

      const res = await proposalService.submitProposal(role, payload, attachments);
      setProposalId(res.data.proposal.proposalId);
      toast.success("Proposal submitted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (proposalId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <FileText className="h-6 w-6 text-[#9B2335]" />
                Proposal received
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-sm text-muted-foreground">Proposal ID</p>
                <p className="mt-1 font-mono text-xl font-bold text-gray-900">
                  {proposalId}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                A confirmation email is on its way. Keep this ID for your records while the Senior Design team reviews the submission.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    setForm(emptyForm);
                    setAttachments([]);
                    setProposalId("");
                  }}
                  className="bg-[#9B2335] text-white hover:bg-[#7a1c2a]"
                >
                  Submit another
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Return home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.jpg" alt="Senior Design Marketplace" className="h-12 w-12 rounded object-cover" />
          <div>
            <p className="text-sm font-semibold uppercase text-[#9B2335]">
              Stevens Senior Design
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {isStudent ? "Student Project Proposal" : "Faculty Project Proposal"}
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit an early-stage project idea</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">{isStudent ? "Student ID / Email" : "Faculty ID / Email"}</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="department">{isStudent ? "Department / Major" : "Department"}</Label>
                <Input id="department" value={form.department} onChange={(e) => update("department", e.target.value)} required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="title">Proposed Project Title</Label>
                <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required maxLength={200} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  required
                  minLength={100}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.description.length}/100 characters minimum
                </p>
              </div>

              {isStudent ? (
                <>
                  <div>
                    <Label htmlFor="problemStatement">Problem Statement</Label>
                    <textarea id="problemStatement" value={form.problemStatement} onChange={(e) => update("problemStatement", e.target.value)} required rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="desiredSkills">Desired Skills / Team Composition</Label>
                    <textarea id="desiredSkills" value={form.desiredSkills} onChange={(e) => update("desiredSkills", e.target.value)} required rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="preferredFacultyAdvisor">Preferred Faculty Advisor</Label>
                    <Input id="preferredFacultyAdvisor" value={form.preferredFacultyAdvisor} onChange={(e) => update("preferredFacultyAdvisor", e.target.value)} className="mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="industryPartner">Industry Partner or Sponsor</Label>
                    <Input id="industryPartner" value={form.industryPartner} onChange={(e) => update("industryPartner", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="requiredSkills">Required Student Skills / Background</Label>
                    <textarea id="requiredSkills" value={form.requiredSkills} onChange={(e) => update("requiredSkills", e.target.value)} required rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="expectedDeliverables">Expected Deliverables</Label>
                    <textarea id="expectedDeliverables" value={form.expectedDeliverables} onChange={(e) => update("expectedDeliverables", e.target.value)} required rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="availableResources">Available Resources or Budget</Label>
                    <textarea id="availableResources" value={form.availableResources} onChange={(e) => update("availableResources", e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                </>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    File Attachments
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    Add File
                  </Button>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={selectFiles} />
                </div>
                {attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Optional PDF, DOC, or DOCX files up to 10MB each.</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#9B2335] text-white hover:bg-[#7a1c2a]">
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
