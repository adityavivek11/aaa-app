import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Dimensions, Platform, RefreshControl } from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from 'react';
import { getCourses, Course } from '@/lib/appwrite-db';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const carouselData: CarouselItem[] = [
  {
    id: '1',
    title: 'Get To Know Ayurveda ??',
    icon: 'leaf-outline',
    color: '#4CAF50',
  },
  {
    id: '2',
    title: 'Learn Meditation',
    icon: 'body-outline',
    color: '#9C27B0',
  },
  {
    id: '3',
    title: 'Yoga Basics',
    icon: 'fitness-outline',
    color: '#FF9800',
  },
];

export default function Index() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.documents);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const renderCarouselItem = ({ item }: { item: CarouselItem }) => (
    <TouchableOpacity 
      style={[styles.carouselItem, { backgroundColor: item.color }]}
      onPress={() => {
        // Handle carousel item press
      }}
    >
      <Ionicons name={item.icon} size={48} color="white" style={styles.carouselIcon} />
      <View style={styles.carouselContent}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#E5FAF5', '#ffffff']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00B894']}
            tintColor="#00B894"
          />
        }
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.username}>{user?.name || 'Student'}</Text>
        </View>

        {/* Carousel Section */}
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={SCREEN_WIDTH - 32}
            height={200}
            autoPlay={true}
            data={carouselData}
            scrollAnimationDuration={1000}
            onSnapToItem={(index) => setActiveCarouselIndex(index)}
            renderItem={renderCarouselItem}
          />
          <View style={styles.pagination}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeCarouselIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Video Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get To Know Ayurveda ??</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.videosContainer}
          >
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={styles.videoCard}
                onPress={() => {
                  // Handle video press
                }}
              >
                <View style={styles.videoThumbnail}>
                  <Ionicons name="play-circle" size={40} color="white" />
                </View>
                <Text style={styles.videoTitle}>Video {item}</Text>
                <Text style={styles.videoDuration}>10:00</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Courses We Offer</Text>
          <View style={styles.coursesGrid}>
            {courses.map(course => (
              <TouchableOpacity 
                key={course.$id} 
                style={styles.courseCard}
                onPress={() => router.push(`/course/${course.$id}`)}
              >
                <View style={styles.courseImageContainer}>
                  <View style={[styles.coursePlaceholder, { backgroundColor: '#E5FAF5' }]}>
                    <Ionicons name="book-outline" size={32} color="#00B894" />
                  </View>
                  {course.isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.badgeText}>Popular</Text>
                    </View>
                  )}
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.courseInstructor}>{course.instructor}</Text>
                  <View style={styles.courseStats}>
                    <Text style={styles.courseDuration}>{course.duration}</Text>
                    <Text style={styles.coursePrice}>${course.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  greetingSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  carouselContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  carouselItem: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  carouselIcon: {
    marginBottom: 16,
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  carouselTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#00B894',
    width: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  videosContainer: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  videoCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    marginHorizontal: 12,
  },
  videoDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  courseCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  courseImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  coursePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00B894',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseDuration: {
    fontSize: 14,
    color: '#666',
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B894',
  },
  bottomSpace: {
    height: 80,
  },
});
