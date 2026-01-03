export interface ICourse {
  _id: string;
  userId: string;
  name: string;
  email: string;
  program: string;
  courseNumber: string;
  courseSection: string;
  season: "Fall" | "Spring" | "Summer" | "Winter";
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
  courseCode: string;
  lastGroupNumber: number;
  closed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDTO {
  program: string;
  courseNumber: string;
  courseSection: string;
  season: "Fall" | "Spring" | "Summer" | "Winter";
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
}

export interface JoinCourseDTO {
  courseCode: string;
}
