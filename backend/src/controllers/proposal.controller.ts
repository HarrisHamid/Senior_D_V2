import { Request, Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../types";
import Course from "../models/Course.model";
import { Project } from "../models/Project.model";
import { Proposal, ProposalRole } from "../models/Proposal.model";
import { sendProposalConfirmationEmail } from "../services/email.service";

const generateProposalId = (role: ProposalRole): string => {
  const prefix = role === "student" ? "STU" : "FAC";
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
};

const attachmentPayload = (req: Request) => {
  const files = (req.files ?? []) as Express.Multer.File[];
  return files.map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  }));
};

const createProposal = async (
  req: Request,
  res: Response,
  role: ProposalRole,
): Promise<void> => {
  try {
    const proposal = new Proposal({
      ...req.body,
      role,
      proposalId: generateProposalId(role),
      status: "Pending Review",
      attachments: attachmentPayload(req),
    });
    await proposal.save();

    sendProposalConfirmationEmail(
      proposal.email,
      proposal.fullName,
      proposal.proposalId,
      proposal.title,
    ).catch(console.error);

    res.status(201).json({
      success: true,
      data: { proposal },
      message: "Proposal submitted successfully",
    });
  } catch (error) {
    console.error("Create proposal error:", error);
    res.status(500).json({ success: false, error: "Failed to submit proposal" });
  }
};

export const createStudentProposal = async (
  req: Request,
  res: Response,
): Promise<void> => createProposal(req, res, "student");

export const createFacultyProposal = async (
  req: Request,
  res: Response,
): Promise<void> => createProposal(req, res, "faculty");

const buildProposalFilter = (query: Request["query"]) => {
  const filter: Record<string, unknown> = {};

  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.department && typeof query.department === "string") {
    filter.department = new RegExp(
      query.department.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
  }
  if (query.search && typeof query.search === "string") {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { proposalId: regex },
      { title: regex },
      { description: regex },
      { fullName: regex },
      { email: regex },
    ];
  }
  if (query.startDate || query.endDate) {
    const createdAt: Record<string, Date> = {};
    if (typeof query.startDate === "string") {
      createdAt.$gte = new Date(query.startDate);
    }
    if (typeof query.endDate === "string") {
      createdAt.$lte = new Date(query.endDate);
    }
    filter.createdAt = createdAt;
  }

  return filter;
};

export const listProposals = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const filter = buildProposalFilter(req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const skip = (page - 1) * limit;

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("matchedProposal", "proposalId title role status")
        .populate("createdProject", "name"),
      Proposal.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        proposals,
        count: proposals.length,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("List proposals error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve proposals" });
  }
};

export const getProposalById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("matchedProposal", "proposalId title role status")
      .populate("createdProject", "name courseId");

    if (!proposal) {
      res.status(404).json({ success: false, error: "Proposal not found" });
      return;
    }

    res.status(200).json({ success: true, data: { proposal } });
  } catch (error) {
    console.error("Get proposal error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve proposal" });
  }
};

export const updateProposal = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!proposal) {
      res.status(404).json({ success: false, error: "Proposal not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { proposal },
      message: "Proposal updated successfully",
    });
  } catch (error) {
    console.error("Update proposal error:", error);
    res.status(500).json({ success: false, error: "Failed to update proposal" });
  }
};

export const matchProposal = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    const matched = await Proposal.findById(req.body.matchedProposalId);

    if (!proposal || !matched) {
      res.status(404).json({ success: false, error: "Proposal not found" });
      return;
    }
    if (proposal._id.toString() === matched._id.toString()) {
      res.status(400).json({ success: false, error: "Cannot match a proposal to itself" });
      return;
    }

    proposal.status = "Matched";
    proposal.matchedProposal = new Types.ObjectId(String(matched._id));
    matched.status = "Matched";
    matched.matchedProposal = new Types.ObjectId(String(proposal._id));

    await Promise.all([proposal.save(), matched.save()]);

    res.status(200).json({
      success: true,
      data: { proposal, matchedProposal: matched },
      message: "Proposals matched successfully",
    });
  } catch (error) {
    console.error("Match proposal error:", error);
    res.status(500).json({ success: false, error: "Failed to match proposals" });
  }
};

export const convertProposalToProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      res.status(404).json({ success: false, error: "Proposal not found" });
      return;
    }
    if (!["Approved", "Matched"].includes(proposal.status)) {
      res.status(400).json({
        success: false,
        error: "Only Approved or Matched proposals can seed a project",
      });
      return;
    }
    if (proposal.createdProject) {
      res.status(400).json({
        success: false,
        error: "Proposal already has a created project",
      });
      return;
    }

    const course = await Course.findById(req.body.courseId);
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }
    if (course.userId !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only seed projects for your own courses",
      });
      return;
    }

    const advisorName =
      proposal.role === "faculty"
        ? proposal.fullName
        : proposal.preferredFacultyAdvisor || "";
    const advisors = advisorName
      ? [
          proposal.role === "faculty"
            ? { name: advisorName, email: proposal.email }
            : { name: advisorName },
        ]
      : [];
    const project = await Project.create({
      courseId: course._id.toString(),
      userId: user._id,
      name: proposal.title,
      description: proposal.description,
      advisors,
      sponsor:
        proposal.role === "faculty"
          ? proposal.industryPartner || "Stevens Institute of Technology"
          : "Student Proposed",
      contacts: [{ name: proposal.fullName, email: proposal.email }],
      majors: [{ major: proposal.department }],
      year: req.body.year ?? course.year,
      internal: !proposal.industryPartner,
      assignedGroup: null,
      isOpen: true,
      sourceProposal: proposal._id,
    });

    proposal.createdProject = new Types.ObjectId(String(project._id));
    if (proposal.status === "Pending Review" || proposal.status === "Under Review") {
      proposal.status = "Approved";
    }
    await proposal.save();

    res.status(201).json({
      success: true,
      data: { proposal, project },
      message: "Project created from proposal",
    });
  } catch (error) {
    console.error("Convert proposal error:", error);
    res.status(500).json({ success: false, error: "Failed to convert proposal" });
  }
};

const csvValue = (value: unknown): string => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportProposalsCsv = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const proposals = await Proposal.find(buildProposalFilter(req.query)).sort({
      createdAt: -1,
    });
    const headers = [
      "Proposal ID",
      "Role",
      "Status",
      "Full Name",
      "Email",
      "Department",
      "Title",
      "Created At",
    ];
    const rows = proposals.map((proposal) =>
      [
        proposal.proposalId,
        proposal.role,
        proposal.status,
        proposal.fullName,
        proposal.email,
        proposal.department,
        proposal.title,
        proposal.createdAt.toISOString(),
      ]
        .map(csvValue)
        .join(","),
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="proposals.csv"');
    res.status(200).send([headers.map(csvValue).join(","), ...rows].join("\n"));
  } catch (error) {
    console.error("Export proposals error:", error);
    res.status(500).json({ success: false, error: "Failed to export proposals" });
  }
};
