import { createTeacher, createCourse, createLesson } from '../lib/appwrite-db';

async function seedData() {
  try {
    // Create teachers
    const teachers = await Promise.all([
      createTeacher({
        name: "Dr. Sarah Johnson",
        title: "Senior Web Development Instructor",
        bio: "Dr. Sarah Johnson has over 10 years of experience in web development and has taught thousands of students worldwide.",
        avatar: "https://example.com/sarah.jpg"
      }),
      createTeacher({
        name: "Prof. Michael Chen",
        title: "UI/UX Design Expert",
        bio: "Prof. Michael Chen is a renowned UI/UX designer with expertise in creating beautiful and user-friendly interfaces.",
        avatar: "https://example.com/michael.jpg"
      }),
      createTeacher({
        name: "Dr. Emily Chen",
        title: "Data Science Specialist",
        bio: "Dr. Emily Chen is a data science expert with a focus on machine learning and artificial intelligence.",
        avatar: "https://example.com/emily.jpg"
      })
    ]);

    console.log('Teachers created:', teachers);

    // Create courses
    const courses = await Promise.all([
      createCourse({
        title: "Advanced Web Development",
        instructor: "Dr. Sarah Johnson",
        teacherId: teachers[0].$id,
        duration: "25 Hours",
        totalLessons: 25,
        students: 3245,
        price: 49.99,
        isPopular: true,
        isNew: false,
        image: "https://example.com/web-dev.jpg"
      }),
      createCourse({
        title: "Master UI/UX Design",
        instructor: "Prof. Michael Chen",
        teacherId: teachers[1].$id,
        duration: "32 Hours",
        totalLessons: 32,
        students: 2890,
        price: 59.99,
        isPopular: false,
        isNew: true,
        image: "https://example.com/ui-ux.jpg"
      }),
      createCourse({
        title: "Data Science Essentials",
        instructor: "Dr. Emily Chen",
        teacherId: teachers[2].$id,
        duration: "28 Hours",
        totalLessons: 28,
        students: 2150,
        price: 54.99,
        isPopular: true,
        isNew: true,
        image: "https://example.com/data-science.jpg"
      })
    ]);

    console.log('Courses created:', courses);

    // Create lessons for each course
    for (const course of courses) {
      const lessons = await Promise.all([
        createLesson({
          courseId: course.$id,
          title: "Introduction to the Course",
          duration: "15:00",
          type: "Video",
          order: 1,
          section: "Getting Started"
        }),
        createLesson({
          courseId: course.$id,
          title: "Course Overview Quiz",
          duration: "10:00",
          type: "Quiz",
          order: 2,
          section: "Getting Started"
        }),
        createLesson({
          courseId: course.$id,
          title: "Core Concepts",
          duration: "45:00",
          type: "Video",
          order: 3,
          section: "Fundamentals"
        }),
        createLesson({
          courseId: course.$id,
          title: "Practice Exercise",
          duration: "30:00",
          type: "Video",
          order: 4,
          section: "Fundamentals"
        })
      ]);

      console.log(`Lessons created for course ${course.title}:`, lessons);
    }

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
seedData(); 