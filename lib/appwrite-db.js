import { ID, Query } from 'node-appwrite';
import { databases, config } from './appwrite';

// Collection IDs
const COLLECTIONS = {
  USERS: "users",
  COURSES: "67e58e94003546802bb8",
  LESSONS: "67e5942e002d2c10b7b8",
  BOOKMARKS: "67e5a6b1000e8a362f80",
  ENROLLMENTS: "67e5aa26002f616ef5c0",
  TEACHERS: "67e5abbf00370f54a9b5",
};

// Course functions
export const createCourse = async (courseData) => {
    try {
        return await databases.createDocument(
            config.databaseId,
            COLLECTIONS.COURSES,
            ID.unique(),
            courseData
        );
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

export const getCourses = async () => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.COURSES
        );
    } catch (error) {
        console.error('Error getting courses:', error);
        throw error;
    }
};

export const getCourseById = async (courseId) => {
    try {
        return await databases.getDocument(
            config.databaseId,
            COLLECTIONS.COURSES,
            courseId
        );
    } catch (error) {
        console.error('Error getting course:', error);
        throw error;
    }
};

// Lesson functions
export const createLesson = async (lessonData) => {
    try {
        return await databases.createDocument(
            config.databaseId,
            COLLECTIONS.LESSONS,
            ID.unique(),
            lessonData
        );
    } catch (error) {
        console.error('Error creating lesson:', error);
        throw error;
    }
};

export const getLessonsByCourseId = async (courseId) => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.LESSONS,
            [Query.equal('courseId', courseId)]
        );
    } catch (error) {
        console.error('Error getting lessons:', error);
        throw error;
    }
};

// Bookmark functions
export const createBookmark = async (bookmarkData) => {
    try {
        return await databases.createDocument(
            config.databaseId,
            COLLECTIONS.BOOKMARKS,
            ID.unique(),
            bookmarkData
        );
    } catch (error) {
        console.error('Error creating bookmark:', error);
        throw error;
    }
};

export const getBookmarksByUserId = async (userId) => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.BOOKMARKS,
            [Query.equal('userId', userId)]
        );
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const deleteBookmark = async (bookmarkId) => {
    try {
        return await databases.deleteDocument(
            config.databaseId,
            COLLECTIONS.BOOKMARKS,
            bookmarkId
        );
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        throw error;
    }
};

export const isCourseBookmarked = async (userId, courseId) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.BOOKMARKS,
            [
                Query.equal('userId', userId),
                Query.equal('courseId', courseId)
            ]
        );
        return response.documents.length > 0;
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        throw error;
    }
};

// Enrollment functions
export const createEnrollment = async (enrollmentData) => {
    try {
        return await databases.createDocument(
            config.databaseId,
            COLLECTIONS.ENROLLMENTS,
            ID.unique(),
            enrollmentData
        );
    } catch (error) {
        console.error('Error creating enrollment:', error);
        throw error;
    }
};

export const getEnrollmentsByUserId = async (userId) => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.ENROLLMENTS,
            [Query.equal('userId', userId)]
        );
    } catch (error) {
        console.error('Error getting enrollments:', error);
        throw error;
    }
};

// Teacher functions
export const createTeacher = async (teacherData) => {
    try {
        return await databases.createDocument(
            config.databaseId,
            COLLECTIONS.TEACHERS,
            ID.unique(),
            teacherData
        );
    } catch (error) {
        console.error('Error creating teacher:', error);
        throw error;
    }
};

export const getTeachers = async () => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.TEACHERS
        );
    } catch (error) {
        console.error('Error getting teachers:', error);
        throw error;
    }
};

export const getTeacherById = async (teacherId) => {
    try {
        return await databases.getDocument(
            config.databaseId,
            COLLECTIONS.TEACHERS,
            teacherId
        );
    } catch (error) {
        console.error('Error getting teacher:', error);
        throw error;
    }
};

// Search functions
export const searchCourses = async (query) => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.COURSES,
            [Query.search('title', query)]
        );
    } catch (error) {
        console.error('Error searching courses:', error);
        throw error;
    }
};

export const searchTeachers = async (query) => {
    try {
        return await databases.listDocuments(
            config.databaseId,
            COLLECTIONS.TEACHERS,
            [Query.search('name', query)]
        );
    } catch (error) {
        console.error('Error searching teachers:', error);
        throw error;
    }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  createLesson,
  getLessonsByCourseId,
  createBookmark,
  getBookmarksByUserId,
  deleteBookmark,
  isCourseBookmarked,
  createEnrollment,
  getEnrollmentsByUserId,
  createTeacher,
  getTeachers,
  getTeacherById,
  searchCourses,
  searchTeachers,
}; 