import api from "./api";

export interface CreateCourseRequest {
  program: string;
  courseNumber: string;
  courseSection: string;
  season: string;
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
}

export interface JoinCourseRequest {
  courseCode: string;
}

export interface CourseData {
  _id: string;
  userId: string;
  name: string;
  email: string;
  program: string;
  courseNumber: string;
  courseSection: string;
  season: string;
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
  courseCode: string;
  lastGroupNumber: number;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  success: boolean;
  data: { course: CourseData };
  message?: string;
}

export interface CoursesResponse {
  success: boolean;
  data: { courses: CourseData[]; count: number };
}

export interface CourseStatsResponse {
  success: boolean;
  data: {
    course: {
      _id: string;
      name: string;
      courseNumber: string;
      courseSection: string;
      season: string;
      year: number;
      closed: boolean;
    };
    stats: {
      totalStudents: number;
      totalGroups: number;
      studentsInGroups: number;
      studentsWithoutGroups: number;
    };
  };
}

export const courseService = {
  async createCourse(data: CreateCourseRequest): Promise<CourseResponse> {
    const response = await api.post<CourseResponse>("/courses", data);
    return response.data;
  },

  async getMyCourses(): Promise<CoursesResponse> {
    const response = await api.get<CoursesResponse>("/courses/my-courses");
    return response.data;
  },

  async getCourseById(id: string): Promise<CourseResponse> {
    const response = await api.get<CourseResponse>(`/courses/${id}`);
    return response.data;
  },

  async joinCourse(data: JoinCourseRequest): Promise<CourseResponse> {
    const response = await api.post<CourseResponse>("/courses/join", data);
    return response.data;
  },

  async closeCourse(id: string): Promise<CourseResponse> {
    const response = await api.patch<CourseResponse>(`/courses/${id}/close`);
    return response.data;
  },

  async reopenCourse(id: string): Promise<CourseResponse> {
    const response = await api.patch<CourseResponse>(`/courses/${id}/open`);
    return response.data;
  },

  async getCourseStats(id: string): Promise<CourseStatsResponse> {
    const response = await api.get<CourseStatsResponse>(`/courses/${id}/stats`);
    return response.data;
  },

  async exportCourseData(id: string): Promise<Blob> {
    const response = await api.get(`/courses/${id}/export`, {
      responseType: "blob",
    });
    return response.data;
  },
};
