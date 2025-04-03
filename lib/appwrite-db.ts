import { databases, ID, Query } from "./appwrite";
import { config } from "./appwrite";

// Collection IDs
export const COLLECTIONS = {
  USERS: "users",
  COURSES: "67e58e94003546802bb8",
  LESSONS: "67e5942e002d2c10b7b8",
  BOOKMARKS: "67e5a6b1000e8a362f80",
  ENROLLMENTS: "67e5aa26002f616ef5c0",
  TEACHERS: "67e5abbf00370f54a9b5",
  DOUBTS: "67e5f8bf002522bb1b3a",
  DOUBT_REPLIES: "67e64c40003e69974dcb",
} as const;

// Interfaces
export interface Course {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorName: string;
  duration: string;
  rating: number;
  learningPoints: string[];
  instructor: string;
  teacherId: string;
  totalLessons: number;
  students: number;
  price: number;
  isPopular: boolean;
  isNew: boolean;
  image?: string;
}

export interface Lesson {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  courseId: string;
  title: string;
  duration: string;
  type: "Video" | "Quiz";
  order: number;
  section: string;
  videoUrl?: string;
}

export interface Teacher {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  title: string;
  avatar?: string;
  bio: string;
}

export interface Bookmark {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  courseId: string;
}

export interface Enrollment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  lastAccessed: string;
}

export interface Doubt {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  title: string;
  content: string;
  replies?: DoubtReply[];
}

export interface DoubtReply {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  content: string;
  doubtId: string;
}

// Course Functions
export async function createCourse(course: Omit<Course, "$id" | "$createdAt" | "$updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.COURSES,
    ID.unique(),
    course
  );
}

export async function getCourses() {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.COURSES
  );
  return {
    ...response,
    documents: response.documents as unknown as Course[]
  };
}

export async function getCourseById(id: string) {
  const response = await databases.getDocument(
    config.databaseId!,
    COLLECTIONS.COURSES,
    id
  );
  return response as unknown as Course;
}

// Lesson Functions
export async function createLesson(lesson: Omit<Lesson, "$id" | "$createdAt" | "$updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.LESSONS,
    ID.unique(),
    lesson
  );
}

export async function getLessonsByCourseId(courseId: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.LESSONS,
    [Query.equal("courseId", courseId)]
  );
  return {
    ...response,
    documents: response.documents as unknown as Lesson[]
  };
}

export async function getLessonById(lessonId: string): Promise<Lesson> {
  try {
    const lesson = await databases.getDocument(
      config.databaseId!,
      COLLECTIONS.LESSONS,
      lessonId
    );
    return lesson as unknown as Lesson;
  } catch (error) {
    console.error('Error getting lesson by ID:', error);
    throw error;
  }
}

// Bookmark Functions
export async function createBookmark(bookmark: Omit<Bookmark, "$id" | "$createdAt" | "$updatedAt">) {
  const response = await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.BOOKMARKS,
    ID.unique(),
    bookmark
  );
  return response as unknown as Bookmark;
}

export async function getBookmarksByUserId(userId: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.BOOKMARKS,
    [Query.equal("userId", userId)]
  );
  return {
    ...response,
    documents: response.documents as unknown as Bookmark[]
  };
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
export async function createEnrollment(enrollment: Omit<Enrollment, "$id" | "$createdAt" | "$updatedAt">) {
  const response = await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.ENROLLMENTS,
    ID.unique(),
    enrollment
  );
  return response as unknown as Enrollment;
}

export async function getEnrollmentsByUserId(userId: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.ENROLLMENTS,
    [Query.equal("userId", userId)]
  );
  return {
    ...response,
    documents: response.documents as unknown as Enrollment[]
  };
}

// Teacher Functions
export async function createTeacher(teacher: Omit<Teacher, "$id" | "$createdAt" | "$updatedAt">) {
  return await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.TEACHERS,
    ID.unique(),
    teacher
  );
}

export async function getTeachers() {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.TEACHERS
  );
  return {
    ...response,
    documents: response.documents as unknown as Teacher[]
  };
}

export async function getTeacherById(id: string) {
  const response = await databases.getDocument(
    config.databaseId!,
    COLLECTIONS.TEACHERS,
    id
  );
  return response as unknown as Teacher;
}

// Search Functions
export async function searchCourses(query: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.COURSES,
    [Query.search("title", query)]
  );
  return {
    ...response,
    documents: response.documents as unknown as Course[]
  };
}

export async function searchTeachers(query: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.TEACHERS,
    [Query.search("name", query)]
  );
  return {
    ...response,
    documents: response.documents as unknown as Teacher[]
  };
}

// Doubt Functions
export const getDoubts = async () => {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      COLLECTIONS.DOUBTS,
      [
        Query.orderDesc('$createdAt'),
      ]
    );
    return response;
  } catch (error) {
    console.error('Error fetching doubts:', error);
    throw error;
  }
};

export const createDoubt = async (doubt: Omit<Doubt, '$id' | '$createdAt' | '$updatedAt'>) => {
  try {
    const response = await databases.createDocument(
      config.databaseId!,
      COLLECTIONS.DOUBTS,
      ID.unique(),
      doubt
    );
    return response;
  } catch (error) {
    console.error('Error creating doubt:', error);
    throw error;
  }
};

export async function getDoubtById(doubtId: string) {
  const response = await databases.getDocument(
    config.databaseId!,
    COLLECTIONS.DOUBTS,
    doubtId
  );
  return response as unknown as Doubt;
}

export async function createDoubtReply(reply: Omit<DoubtReply, "$id" | "$createdAt" | "$updatedAt">) {
  const response = await databases.createDocument(
    config.databaseId!,
    COLLECTIONS.DOUBT_REPLIES,
    ID.unique(),
    reply
  );
  return response as unknown as DoubtReply;
}

export async function getDoubtReplies(doubtId: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.DOUBT_REPLIES,
    [Query.equal("doubtId", doubtId)]
  );
  return {
    ...response,
    documents: response.documents as unknown as DoubtReply[]
  };
}

export async function deleteDoubt(doubtId: string) {
  try {
    // First delete all replies associated with this doubt
    const replies = await getDoubtReplies(doubtId);
    for (const reply of replies.documents) {
      await databases.deleteDocument(
        config.databaseId!,
        COLLECTIONS.DOUBT_REPLIES,
        reply.$id
      );
    }
    
    // Then delete the doubt itself
    return await databases.deleteDocument(
      config.databaseId!,
      COLLECTIONS.DOUBTS,
      doubtId
    );
  } catch (error) {
    console.error('Error deleting doubt:', error);
    throw error;
  }
}

export async function getDoubtsByUserId(userId: string) {
  const response = await databases.listDocuments(
    config.databaseId!,
    COLLECTIONS.DOUBTS,
    [Query.equal("userId", userId)]
  );
  return {
    ...response,
    documents: response.documents as unknown as Doubt[]
  };
} 