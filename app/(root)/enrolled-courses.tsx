import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getEnrollmentsByUserId, getCourseById, Enrollment, Course } from '@/lib/appwrite-db';
import { useGlobalContext } from '@/lib/global-provider';

interface EnrolledCourse extends Course {
  enrollmentDate: string;
  lastAccessed: string;
  progress: number;
}

export default function EnrolledCourses() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEnrolledCourses = async () => {
    if (!user?.$id) return;
    try {
      const enrollmentsResponse = await getEnrollmentsByUserId(user.$id);
      const enrollments = enrollmentsResponse.documents;

      // Fetch course details for each enrollment
      const coursePromises = enrollments.map(async (enrollment: Enrollment) => {
        const course = await getCourseById(enrollment.courseId);
        return {
          ...course,
          enrollmentDate: enrollment.enrolledAt,
          lastAccessed: enrollment.lastAccessed,
          progress: enrollment.progress
        };
      });

      const courses = await Promise.all(coursePromises);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      Alert.alert('Error', 'Failed to load your enrolled courses. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEnrolledCourses();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your enrolled courses</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Enrolled Courses</Text>
      </View>

      {enrolledCourses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>You haven't enrolled in any courses yet</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00B894']}
              tintColor="#00B894"
            />
          }
        >
          {enrolledCourses.map((course) => (
            <TouchableOpacity 
              key={course.$id}
              style={styles.courseCard}
              onPress={() => router.push(`/course/${course.$id}`)}
            >
              <View style={styles.courseHeader}>
                <View style={styles.courseImage}>
                  <Ionicons name="book-outline" size={40} color="#00B894" />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.instructorText}>{course.instructor}</Text>
                </View>
              </View>

              <View style={styles.courseDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${course.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{course.progress}% Complete</Text>
                </View>

                <View style={styles.courseMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>{course.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="document-text-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>{course.totalLessons} Lessons</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructorText: {
    fontSize: 14,
    color: '#666',
  },
  courseDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B894',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
}); 