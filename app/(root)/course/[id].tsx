import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { getCourseById, getLessonsByCourseId, Course, Lesson, createBookmark, deleteBookmark, isCourseBookmarked, getBookmarksByUserId, Bookmark, getEnrollmentsByUserId, Enrollment, createEnrollment } from '@/lib/appwrite-db';
import { useGlobalContext } from '@/lib/global-provider';
import Animated, { 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';

export default function CourseDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useGlobalContext();
  const [activeTab, setActiveTab] = useState('Curriculum');
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollViewType>(null);
  const [bookmarkId, setBookmarkId] = useState('');
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const bookmarkScale = useSharedValue(1);

  const loadCourseData = async () => {
      try {
        const courseData = await getCourseById(id as string);
        const lessonsData = await getLessonsByCourseId(id as string);
        setCourse(courseData);
        setLessons(lessonsData.documents);
      
      if (user?.$id) {
        await checkBookmarkStatus();
        await loadEnrollmentStatus();
      }
      } catch (error) {
        console.error('Error fetching course data:', error);
      Alert.alert('Error', 'Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      setRefreshing(false);
    }
  };

  const loadEnrollmentStatus = async () => {
    if (!user?.$id) return;
    try {
      const enrollmentsResponse = await getEnrollmentsByUserId(user.$id);
      const isUserEnrolled = enrollmentsResponse.documents.some(
        enrollment => enrollment.courseId === id
      );
      setIsEnrolled(isUserEnrolled);
    } catch (error) {
      console.error('Error loading enrollment status:', error);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [id, user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourseData();
  };

  const checkBookmarkStatus = async () => {
    if (!user?.$id || !course?.$id) return;
    
    try {
      const bookmarks = await getBookmarksByUserId(user.$id);
      const existingBookmark = bookmarks.documents.find(
        bookmark => bookmark.courseId === course.$id
      );
      
      setIsBookmarked(!!existingBookmark);
      setBookmarkId(existingBookmark?.$id || '');
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      setIsBookmarked(false);
      setBookmarkId('');
    }
  };

  const handleBookmark = async () => {
    if (!user?.$id || !course?.$id) {
      Alert.alert('Login Required', 'Please log in to bookmark courses');
      return;
    }

    if (isBookmarkLoading) return; // Prevent multiple rapid clicks

    setIsBookmarkLoading(true);

    // Quick animation on press
    bookmarkScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      if (isBookmarked && bookmarkId) {
        // Delete bookmark
        await deleteBookmark(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId('');
      } else {
        // Create bookmark
        const newBookmark = await createBookmark({
          userId: user.$id,
          courseId: course.$id,
        });
        setIsBookmarked(true);
        setBookmarkId(newBookmark.$id);
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      // If there's an error, refresh the bookmark status
      await checkBookmarkStatus();
      Alert.alert('Error', 'Failed to update bookmark. Please try again.');
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }]
  }));

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    const tabIndex = ['Curriculum', 'Information'].indexOf(tab);
    scrollViewRef.current?.scrollTo({
      x: tabIndex * Dimensions.get('window').width,
      animated: true
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const tabIndex = Math.round(offsetX / Dimensions.get('window').width);
    const tabs = ['Curriculum', 'Information'];
    setActiveTab(tabs[tabIndex]);
  };

  const handleEnroll = async () => {
    if (!user?.$id) {
      Alert.alert(
        "Not Logged In",
        "Please log in to enroll in courses.",
        [
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      return;
    }

    try {
      const now = new Date().toISOString();
      await createEnrollment({
        userId: user.$id,
        courseId: id as string,
        enrolledAt: now,
        lastAccessed: now,
        progress: 0
      });
      
      // Update local state
      setIsEnrolled(true);
      
      // Find the first lesson
      const firstLesson = lessons[0];
      
      Alert.alert(
        "Success",
        "You have been enrolled in this course!",
        [
          {
            text: "Continue Learning",
            onPress: () => {
              if (firstLesson) {
                router.push(`/lesson/${firstLesson.$id}`);
              } else {
                router.push(`/course/${id}/learn`);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error enrolling in course:', error);
      Alert.alert(
        "Error",
        "Failed to enroll in the course. Please try again."
      );
    }
  };

  const handleContinueLearning = () => {
    // Navigate to the first lesson or last accessed lesson
    router.push(`/course/${id}/learn`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <Text>Course not found</Text>
      </View>
    );
  }

  // Group lessons by section
  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.section]) {
      acc[lesson.section] = [];
    }
    acc[lesson.section].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <View style={styles.container}>
      {/* Header with back button and bookmark */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        <TouchableOpacity 
          style={[styles.bookmarkButton, isBookmarkLoading && styles.bookmarkButtonDisabled]}
          onPress={handleBookmark}
          activeOpacity={0.7}
          disabled={isBookmarkLoading}
        >
          <Animated.View style={bookmarkAnimatedStyle}>
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isBookmarked ? "#00B894" : "#666"} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00B894']}
            tintColor="#00B894"
          />
        }
      >
        {/* Course Banner */}
        <View style={styles.banner}>
          <Ionicons name="book-outline" size={48} color="#fff" />
        </View>

        {/* Course Info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={styles.instructorRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.instructorText}>Instructor: {course.instructor}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>{course.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.statText}>{course.totalLessons} Lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.statText}>{course.students} Students</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {isEnrolled ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.continueButton]}
              onPress={handleContinueLearning}
            >
              <Ionicons name="play-circle-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.enrollButton]}
              onPress={handleEnroll}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Get Enrolled</Text>
        </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Curriculum' && styles.activeTab]}
            onPress={() => handleTabPress('Curriculum')}
          >
            <Text style={[styles.tabText, activeTab === 'Curriculum' && styles.activeTabText]}>
              Curriculum
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Information' && styles.activeTab]}
            onPress={() => handleTabPress('Information')}
          >
            <Text style={[styles.tabText, activeTab === 'Information' && styles.activeTabText]}>
              Information
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.tabScrollView}
        >
          {/* Curriculum Tab */}
          <View style={[styles.tabContent, { width: Dimensions.get('window').width }]}>
          <View style={styles.curriculumContainer}>
            {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
                <View key={section} style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="folder-outline" size={20} color="#00B894" />
                <Text style={styles.sectionTitle}>{section}</Text>
                    <Text style={styles.lessonCount}>{sectionLessons.length} lessons</Text>
                  </View>
                {sectionLessons.map((lesson) => (
                    <TouchableOpacity 
                      key={lesson.$id} 
                      style={styles.lessonItem}
                      onPress={() => isEnrolled ? router.push(`/lesson/${lesson.$id}`) : null}
                    >
                    <View style={styles.lessonIcon}>
                      <Ionicons 
                        name={lesson.type === 'Video' ? 'play-circle-outline' : 'document-text-outline'} 
                        size={24} 
                        color="#00B894" 
                      />
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <View style={styles.lessonMetaContainer}>
                          <View style={styles.lessonMeta}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.lessonMetaText}>{lesson.duration}</Text>
                          </View>
                          <View style={styles.lessonMeta}>
                            <Ionicons 
                              name={lesson.type === 'Video' ? 'videocam-outline' : 'document-text-outline'} 
                              size={14} 
                              color="#666" 
                            />
                            <Text style={styles.lessonMetaText}>{lesson.type}</Text>
                          </View>
                        </View>
                    </View>
                      {!isEnrolled ? (
                        <Ionicons name="lock-closed-outline" size={20} color="#666" />
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                      )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          </View>

          {/* Information Tab */}
          <View style={[styles.tabContent, { width: Dimensions.get('window').width }]}>
          <View style={styles.informationContainer}>
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>About This Course</Text>
                <Text style={styles.infoText}>{course.description}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>What You'll Learn</Text>
                <View style={styles.learningPoints}>
                  {course.learningPoints?.map((point: string, index: number) => (
                    <View key={index} style={styles.learningPoint}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#00B894" />
                      <Text style={styles.learningPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Course Requirements</Text>
                <View style={styles.requirementsList}>
                  <Text style={styles.requirementText}>• Basic computer skills</Text>
                  <Text style={styles.requirementText}>• No prior experience required</Text>
                  <Text style={styles.requirementText}>• Dedication to learn and practice</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
  bookmarkButtonDisabled: {
    opacity: 0.5,
  },
  banner: {
    height: 200,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructorText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  actionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButton: {
    backgroundColor: '#00B894',
  },
  enrollButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00B894',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#00B894',
    fontWeight: '600',
  },
  tabScrollView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  curriculumContainer: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  lessonCount: {
    fontSize: 14,
    color: '#666',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  lessonIcon: {
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  lessonMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  lessonMetaText: {
    fontSize: 14,
    color: '#666',
  },
  informationContainer: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  learningPoints: {
    gap: 12,
  },
  learningPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learningPointText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  requirementsList: {
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
  },
}); 