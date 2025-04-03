import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { getBookmarksByUserId, getCourseById, Course, Bookmark } from '@/lib/appwrite-db';
import { useGlobalContext } from '@/lib/global-provider';

const LoadingSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.listContainer}>
      {[1, 2, 3].map((index) => (
        <Animated.View 
          key={index} 
          style={[
            styles.skeletonCard,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
            <View style={styles.skeletonMeta}>
              <View style={styles.skeletonMetaItem} />
              <View style={styles.skeletonMetaItem} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

export default function BookmarksScreen() {
  const router = useRouter();
  const { user } = useGlobalContext();
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookmarkedCourses = async () => {
    if (!user?.$id) return;
    try {
      const bookmarksResponse = await getBookmarksByUserId(user.$id);
      const bookmarks = bookmarksResponse.documents;

      // Fetch course details for each bookmark
      const coursePromises = bookmarks.map(async (bookmark: Bookmark) => {
        const course = await getCourseById(bookmark.courseId);
        return course;
      });

      const courses = await Promise.all(coursePromises);
      setBookmarkedCourses(courses);
    } catch (error) {
      console.error('Error loading bookmarked courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookmarkedCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookmarkedCourses();
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => router.push(`/course/${item.$id}`)}
    >
      <View style={styles.courseImageContainer}>
        <Ionicons name="book-outline" size={40} color="#00B894" />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.instructorText}>{item.instructor}</Text>
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.totalLessons} Lessons</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookmarks</Text>
        </View>
        <LoadingSkeleton />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your bookmarks</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookmarks</Text>
      </View>

      {bookmarkedCourses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No bookmarked courses yet</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarkedCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00B894']}
              tintColor="#00B894"
            />
          }
        />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F9F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  // Skeleton loader styles
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
    width: '60%',
  },
  skeletonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonMetaItem: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: 80,
    marginRight: 16,
  },
}); 