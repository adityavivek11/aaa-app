import { databases, ID, Query } from "./appwrite";
import { config } from "./appwrite";

// Collection IDs
export const COLLECTIONS = {
  COURSES: "67e58e94003546802bb8",
  CURRICULUM: "curriculum",
  LESSONS: "67e5942e002d2c10b7b8",
  BOOKMARKS: "67e5a6b1000e8a362f80",
  ENROLLMENTS: "67e5aa26002f616ef5c0",
  TEACHERS: "67e5abbf00370f54a9b5",
  DOUBTS: "67e5f8bf002522bb1b3a",
  DOUBT_REPLIES: "67e64c40003e69974dcb",
} as const;

// Course Collection
export interface Course {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  instructor: string;
  teacherId: string;
  duration: string;
  totalLessons: number;
  students: number;
  price: number;
  isPopular: boolean;
  isNew: boolean;
  image?: string;
  description?: string;
}

// Curriculum Collection
export interface Curriculum {
  $id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Lesson Collection
export interface Lesson {
  $id: string;
  curriculumId: string;
  title: string;
  duration: string;
  type: "Video" | "Quiz";
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Bookmark Collection
export interface Bookmark {
  $id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Collection
export interface Enrollment {
  $id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
}

// Teacher Collection
export interface Teacher {
  $id: string;
  name: string;
  title: string;
  avatar?: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

// Course Functions
export async function createCourse(course: Omit<Course, "$id" | "createdAt" | "updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.COURSES,
    ID.unique(),
    course
  );
}

export async function getCourses() {
  return await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.COURSES
  );
}

export async function getCourseById(id: string) {
  return await databases.getDocument(
    config.databaseId!,
    COLLECTIONS.COURSES,
    id
  );
}

// Curriculum Functions
export async function createCurriculum(curriculum: Omit<Curriculum, "$id" | "createdAt" | "updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.CURRICULUM,
    ID.unique(),
    curriculum
  );
}

export async function getCurriculumByCourseId(courseId: string) {
  return await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.CURRICULUM,
    [Query.equal("courseId", courseId)]
  );
}

// Lesson Functions
export async function createLesson(lesson: Omit<Lesson, "$id" | "createdAt" | "updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.LESSONS,
    ID.unique(),
    lesson
  );
}

export async function getLessonsByCurriculumId(curriculumId: string) {
  return await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.LESSONS,
    [Query.equal("curriculumId", curriculumId)]
  );
}

// Bookmark Functions
export async function createBookmark(bookmark: Omit<Bookmark, "$id" | "createdAt" | "updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.BOOKMARKS,
    ID.unique(),
    bookmark
  );
}

export async function getBookmarksByUserId(userId: string) {
  return await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.BOOKMARKS,
    [Query.equal("userId", userId)]
  );
}

export async function deleteBookmark(bookmarkId: string) {
  return await databases.deleteDocument(
    config.databaseId!,
    COLLECTIONS.BOOKMARKS,
    bookmarkId
  );
}

export async function isCourseBookmarked(userId: string, courseId: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.BOOKMARKS,
    [
      Query.equal("userId", userId),
      Query.equal("courseId", courseId)
    ]
  );
  return response.documents.length > 0;
}

// Enrollment Functions
export async function createEnrollment(enrollment: Omit<Enrollment, "$id" | "enrolledAt" | "lastAccessed">) {
  const now = new Date().toISOString();
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.ENROLLMENTS,
    ID.unique(),
    {
      ...enrollment,
      enrolledAt: now,
      lastAccessed: now,
    }
  );
}

export async function getEnrollmentsByUserId(userId: string) {
  return await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.ENROLLMENTS,
    [Query.equal("userId", userId)]
  );
}

// Teacher Functions
export async function createTeacher(teacher: Omit<Teacher, "$id" | "createdAt" | "updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.TEACHERS,
    ID.unique(),
    teacher
  );
}

export async function getTeachers() {
  return await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.TEACHERS
  );
}

export async function getTeacherById(id: string) {
  return await databases.getDocument(
    config.databaseId!,
    COLLECTIONS.TEACHERS,
    id
  );
} 