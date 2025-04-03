import { Client, Databases, Account, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);

// Collection IDs as constants
const COLLECTIONS = {
  COURSES: '67e58e94003546802bb8',
  LESSONS: '67e5942e002d2c10b7b8',
  TEACHERS: '67e5abbf00370f54a9b5',
  BOOKMARKS: '67e5a6b1000e8a362f80',
  ENROLLMENTS: '67e5aa26002f616ef5c0'
};

const config = {
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  coursesCollectionId: COLLECTIONS.COURSES,
  lessonsCollectionId: COLLECTIONS.LESSONS,
  teachersCollectionId: COLLECTIONS.TEACHERS,
  bookmarksCollectionId: COLLECTIONS.BOOKMARKS,
  enrollmentsCollectionId: COLLECTIONS.ENROLLMENTS
};

export { client, databases, account, config, ID }; 