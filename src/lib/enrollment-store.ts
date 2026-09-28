import { create } from "zustand";
import { persist } from "zustand/middleware";

import { students as initialStudents, courses as initialCourses } from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  /** Admin เพิ่มรายวิชาใหม่เข้าสู่ระบบ */
  addCourse: (course: { courseCode: string; courseTitle: string; instructors?: string[] }) => void;
  /** Admin ลบผู้สอนออกจากรายวิชาที่เลือก */
  removeInstructorFromCourse: (courseCode: string, instructor: string) => void;
  /** Admin ลงทะเบียนนักศึกษาเข้ารายวิชา (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseId: string) => void;
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
};

const initialEnrollments: Enrollment[] = initialStudents.flatMap((student) =>
  (student.enrolledCourses ?? []).map((courseId) => ({ studentId: student.studentId, courseId })),
);

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,
      enrollments: initialEnrollments,

      addCourse: ({ courseCode, courseTitle, instructors = [] }) =>
        set((state) => ({
          courses: state.courses.some(
            (course) => course.courseCode.toLowerCase() === courseCode.toLowerCase(),
          )
            ? state.courses
            : [
                ...state.courses,
                {
                  courseCode,
                  courseTitle,
                  instructors,
                },
              ],
        })),

      removeInstructorFromCourse: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode !== courseCode
              ? course
              : {
                  ...course,
                  instructors: (course.instructors ?? []).filter((name) => name !== instructor),
                },
          ),
        })),

      enroll: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.some(
            (e) => e.studentId === studentId && e.courseId === courseId,
          )
            ? state.enrollments
            : [...state.enrollments, { studentId, courseId }],
        })),

      drop: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.filter(
            (e) => !(e.studentId === studentId && e.courseId === courseId),
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
          enrollments: state.enrollments.filter((e) => e.studentId !== studentId),
        })),

      removeCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseId),
          enrollments: state.enrollments.filter((e) => e.courseId !== courseId),
        })),
    }),
    {
      name: "enrollment-store",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
        enrollments: state.enrollments,
      }),
    },
  ),
);
