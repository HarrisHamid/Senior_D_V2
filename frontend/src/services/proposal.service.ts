import api from "./api";
import type { ProjectData } from "./project.service";

export type ProposalRole = "student" | "faculty";
export type ProposalStatus =
  | "Pending Review"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Matched";

export interface ProposalData {
  _id: string;
  proposalId: string;
  role: ProposalRole;
  status: ProposalStatus;
  fullName: string;
  email: string;
  department: string;
  title: string;
  description: string;
  problemStatement?: string;
  desiredSkills?: string;
  preferredFacultyAdvisor?: string;
  industryPartner?: string;
  requiredSkills?: string;
  expectedDeliverables?: string;
  availableResources?: string;
  attachments: {
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  }[];
  internalNotes: string;
  matchedProposal?: Pick<ProposalData, "_id" | "proposalId" | "title" | "role" | "status"> | string | null;
  createdProject?: Pick<ProjectData, "_id" | "name" | "courseId"> | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalListQuery {
  role?: ProposalRole | "all";
  status?: ProposalStatus | "all";
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProposalListResponse {
  success: boolean;
  data: {
    proposals: ProposalData[];
    count: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProposalResponse {
  success: boolean;
  data: { proposal: ProposalData };
  message?: string;
}

export interface ConvertProposalResponse {
  success: boolean;
  data: { proposal: ProposalData; project: ProjectData };
  message?: string;
}

export const proposalService = {
  async submitProposal(
    role: ProposalRole,
    data: Record<string, string>,
    attachments: File[],
  ): Promise<ProposalResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    attachments.forEach((file) => formData.append("attachments", file));

    const response = await api.post<ProposalResponse>(
      `/proposals/${role}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  async listProposals(query?: ProposalListQuery): Promise<ProposalListResponse> {
    const params = {
      ...query,
      role: query?.role === "all" ? undefined : query?.role,
      status: query?.status === "all" ? undefined : query?.status,
    };
    const response = await api.get<ProposalListResponse>("/proposals", {
      params,
    });
    return response.data;
  },

  async updateProposal(
    id: string,
    data: { status?: ProposalStatus; internalNotes?: string },
  ): Promise<ProposalResponse> {
    const response = await api.patch<ProposalResponse>(`/proposals/${id}`, data);
    return response.data;
  },

  async matchProposal(
    id: string,
    matchedProposalId: string,
  ): Promise<{ success: boolean; data: { proposal: ProposalData; matchedProposal: ProposalData } }> {
    const response = await api.post(`/proposals/${id}/match`, {
      matchedProposalId,
    });
    return response.data;
  },

  async convertToProject(
    id: string,
    courseId: string,
  ): Promise<ConvertProposalResponse> {
    const response = await api.post<ConvertProposalResponse>(
      `/proposals/${id}/convert-to-project`,
      { courseId },
    );
    return response.data;
  },

  exportCsvUrl(query?: ProposalListQuery): string {
    const baseUrl = api.defaults.baseURL ?? "";
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, String(value));
    });
    return `${baseUrl}/proposals/export${params.toString() ? `?${params}` : ""}`;
  },
};
