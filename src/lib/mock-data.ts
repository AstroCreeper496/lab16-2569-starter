import type { Student, Course } from "@/lib/types";

export const students: Student[] = [
  { studentId: "650610001", firstName: "Matt", lastName: "Damon", program: "CPE", status:"Inactive", },
  { studentId: "650610002", firstName: "Cillian", lastName: "Murphy", program: "CPE", status:"Inactive", enrolledCourses: ["CPE301", "CPE302"],},
  { studentId: "650610003", firstName: "Emily", lastName: "Blunt", program: "ISNE", status:"Inactive", enrolledCourses: ["ISNE101", "CPE302"],},
];

export const courses: Course[] = [
  { courseCode: "CPE301", courseTitle: "Basic Computer Engineering Lab", instructors: ["Dome", "Chanadda"],},
  { courseCode: "CPE302", courseTitle: "Full Stack Development", instructors: ["Dome", "Nirand", "Chanadda"],},
  { courseCode: "ISNE101", courseTitle: "Introduction to Information Systems and Network Engineering", instructors: ["KENNETH COSH"],},
];

export const CURRENT_STUDENT_ID = "650610002";
export const currentStudent = students.find( (s) => s.studentId === CURRENT_STUDENT_ID )!;
