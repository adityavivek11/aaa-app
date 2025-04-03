import { createTeacher, createCourse, createLesson } from '../lib/appwrite-db.ts';

async function seedData() {
  try {
    // Create teachers
    const teachers = await Promise.all([
      createTeacher({
        name: "Dr. Arjun Sharma",
        title: "Senior Ayurvedic Practitioner",
        bio: "20+ years of experience in Ayurvedic medicine and wellness practices",
        avatar: "https://example.com/avatar1.jpg"
      }),
      createTeacher({
        name: "Dr. Maya Patel",
        title: "Ayurvedic Diet & Nutrition Expert",
        bio: "Specialist in Ayurvedic nutrition and lifestyle modifications",
        avatar: "https://example.com/avatar2.jpg"
      }),
      createTeacher({
        name: "Dr. Ravi Kumar",
        title: "Ayurvedic Herbs & Medicine Specialist",
        bio: "PhD in Ayurvedic Medicine with focus on herbal remedies",
        avatar: "https://example.com/avatar3.jpg"
      })
    ]);

    console.log('Created teachers:', teachers);

    // Create courses
    const courses = await Promise.all([
      createCourse({
        title: "Fundamentals of Ayurveda",
        instructor: "Dr. Arjun Sharma",
        teacherId: teachers[0].$id,
        duration: "12 weeks",
        totalLessons: 36,
        students: 180,
        price: 59.99,
        isPopular: true,
        isNew: true,
        image: "https://example.com/course1.jpg",
        description: "Learn the basic principles of Ayurveda, including doshas, prakruti, and natural healing methods."
      }),
      createCourse({
        title: "Ayurvedic Nutrition & Cooking",
        instructor: "Dr. Maya Patel",
        teacherId: teachers[1].$id,
        duration: "8 weeks",
        totalLessons: 24,
        students: 150,
        price: 49.99,
        isPopular: true,
        isNew: false,
        image: "https://example.com/course2.jpg",
        description: "Master the art of Ayurvedic cooking and learn about proper nutrition based on your body type."
      }),
      createCourse({
        title: "Herbal Medicine & Remedies",
        instructor: "Dr. Ravi Kumar",
        teacherId: teachers[2].$id,
        duration: "10 weeks",
        totalLessons: 30,
        students: 200,
        price: 54.99,
        isPopular: true,
        isNew: true,
        image: "https://example.com/course3.jpg",
        description: "Discover the healing properties of Ayurvedic herbs and learn to prepare traditional remedies."
      })
    ]);

    console.log('Created courses:', courses);

    // Create lessons for each course
    const lessonTemplates = {
      "Fundamentals of Ayurveda": [
        {
          title: "Introduction to Ayurvedic Principles",
          duration: "45:00",
          type: "Video",
          order: 1,
          section: "Basic Concepts"
        },
        {
          title: "Understanding Your Dosha",
          duration: "60:00",
          type: "Video",
          order: 2,
          section: "Body Constitution"
        },
        {
          title: "Prakruti Assessment",
          duration: "30:00",
          type: "Interactive Quiz",
          order: 3,
          section: "Assessment"
        }
      ],
      "Ayurvedic Nutrition & Cooking": [
        {
          title: "Principles of Ayurvedic Diet",
          duration: "40:00",
          type: "Video",
          order: 1,
          section: "Nutrition Basics"
        },
        {
          title: "Cooking Methods & Spices",
          duration: "55:00",
          type: "Video",
          order: 2,
          section: "Practical Cooking"
        },
        {
          title: "Meal Planning Workshop",
          duration: "45:00",
          type: "Workshop",
          order: 3,
          section: "Practical Application"
        }
      ],
      "Herbal Medicine & Remedies": [
        {
          title: "Common Medicinal Herbs",
          duration: "50:00",
          type: "Video",
          order: 1,
          section: "Herb Basics"
        },
        {
          title: "Preparing Herbal Formulations",
          duration: "65:00",
          type: "Video",
          order: 2,
          section: "Practical"
        },
        {
          title: "Herb Identification Test",
          duration: "30:00",
          type: "Quiz",
          order: 3,
          section: "Assessment"
        }
      ]
    };

    for (const course of courses) {
      const courseTemplate = lessonTemplates[course.title] || [];
      const lessons = await Promise.all(
        courseTemplate.map(lesson => 
          createLesson({
            courseId: course.$id,
            ...lesson
          })
        )
      );

      console.log(`Created lessons for course ${course.title}:`, lessons);
    }

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 