import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { getLessonById, Lesson } from '@/lib/appwrite-db';
import * as ScreenCapture from 'expo-screen-capture';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Prevent screen capture when entering the lesson
    const preventScreenCapture = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        console.error('Error preventing screen capture:', error);
      }
    };

    preventScreenCapture();

    // Cleanup function to allow screen capture when leaving the lesson
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(error => {
        console.error('Error allowing screen capture:', error);
      });
    };
  }, []);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      const lessonData = await getLessonById(id as string);
      setLesson(lessonData);
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: lesson.videoUrl || 'https://example.com/sample-video.mp4' }}
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
        />
      </View>

      {/* Lesson Info */}
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{lesson.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.metaText}>Section: {lesson.section}</Text>
          </View>
        </View>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
  },
  videoContainer: {
    width: width,
    height: width * (9/16),
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  lessonInfo: {
    padding: 16,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
}); 