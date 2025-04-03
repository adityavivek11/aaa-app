import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState, useEffect } from 'react';
import { getCourses, getTeachers, Course, Teacher } from '@/lib/appwrite-db';

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: 'My Courses' | 'Teachers' | 'Bookmarks' | 'Feedback';
  onPress: () => void;
}

const QuickActionButton = ({ icon, title, onPress }: QuickActionButtonProps) => (
  <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: getIconBackground(title) }]}>
      <Ionicons name={icon} size={24} color="#333" />
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

const getIconBackground = (title: QuickActionButtonProps['title']) => {
  const colors = {
    'My Courses': '#E8F3FF',
    'Teachers': '#FFE8F3',
    'Bookmarks': '#F3FFE8',
    'Feedback': '#FFE8E8'
  } as const;
  return colors[title];
};

export default function Index() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, teachersResponse] = await Promise.all([
          getCourses(),
          getTeachers()
        ]);
        setCourses(coursesResponse.documents);
        setTeachers(teachersResponse.documents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Student'}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor="#666"
        />
      </View>

      {/* Featured Courses */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Courses</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#333" />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coursesGrid}>
        {courses.slice(0, 2).map(course => (
          <TouchableOpacity 
            key={course.$id} 
            style={styles.courseCard}
            onPress={() => router.push(`/course/${course.$id}`)}
          >
            <View style={styles.courseImagePlaceholder}>
              <Ionicons name="book" size={24} color="#666" />
              {course.isPopular && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Popular</Text>
                </View>
              )}
              {course.isNew && (
                <View style={[styles.badge, styles.newBadge]}>
                  <Text style={styles.badgeText}>New</Text>
                </View>
              )}
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.instructorName}>{course.instructor}</Text>
              <View style={styles.courseStats}>
                <Text style={styles.lessonCount}>{course.totalLessons} lessons</Text>
                <Text style={styles.duration}>{course.duration}</Text>
              </View>
              <Text style={styles.price}>${course.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* All Courses Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Courses</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#333" />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.allCoursesList}>
        {courses.slice(2).map(course => (
          <TouchableOpacity 
            key={course.$id} 
            style={styles.listCourseCard}
            onPress={() => router.push(`/course/${course.$id}`)}
          >
            <View style={styles.listCourseImage}>
              <Ionicons name="book" size={24} color="#666" />
            </View>
            <View style={styles.listCourseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.instructorName}>{course.instructor}</Text>
              <View style={styles.courseStats}>
                <Text style={styles.lessonCount}>{course.totalLessons} lessons</Text>
                <Text style={styles.duration}>{course.duration}</Text>
              </View>
              <Text style={styles.price}>${course.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Teachers Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Teachers</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teachersScroll}>
        {teachers.map(teacher => (
          <TouchableOpacity key={teacher.$id} style={styles.teacherCard}>
            <View style={styles.teacherAvatar}>
              <Ionicons name="person" size={30} color="#666" />
            </View>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Text style={styles.teacherTitle}>{teacher.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    width: '23%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '500',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  courseCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  courseImagePlaceholder: {
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadge: {
    backgroundColor: '#00B894',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  courseInfo: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  instructorName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lessonCount: {
    fontSize: 12,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B894',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  allCoursesList: {
    marginBottom: 24,
  },
  listCourseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listCourseImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listCourseInfo: {
    flex: 1,
  },
  teachersScroll: {
    marginBottom: 24,
  },
  teacherCard: {
    alignItems: 'center',
    marginRight: 24,
  },
  teacherAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  teacherTitle: {
    fontSize: 12,
    color: '#666',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
