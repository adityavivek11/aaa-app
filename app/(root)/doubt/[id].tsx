import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDoubtById, Doubt, createDoubtReply, getDoubtReplies, deleteDoubt } from '@/lib/appwrite-db';
import { useGlobalContext } from '@/lib/global-provider';

export default function DoubtDetails() {
  const { id } = useLocalSearchParams();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useGlobalContext();

  useEffect(() => {
    loadDoubtDetails();
  }, [id]);

  const loadDoubtDetails = async () => {
    if (!id) return;
    try {
      const doubtData = await getDoubtById(id as string);
      const repliesData = await getDoubtReplies(id as string);
      setDoubt(doubtData);
      setReplies(repliesData.documents);
    } catch (error) {
      console.error('Error loading doubt details:', error);
      Alert.alert('Error', 'Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!user || !replyContent.trim() || !doubt) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    try {
      await createDoubtReply({
        userId: user.$id,
        doubtId: doubt.$id,
        content: replyContent.trim(),
      });

      setReplyContent('');
      loadDoubtDetails();
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post your reply');
    }
  };

  const handleDelete = async () => {
    if (!doubt) return;

    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoubt(doubt.$id);
              router.back();
            } catch (error) {
              console.error('Error deleting doubt:', error);
              Alert.alert('Error', 'Failed to delete the question');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!doubt) {
    return (
      <View style={styles.container}>
        <Text>Question not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question Details</Text>
        {doubt.userId === user?.$id && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.doubtCard}>
          <View style={styles.doubtHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color="#666" />
              </View>
              <View>
                <Text style={styles.userName}>You</Text>
                <Text style={styles.timestamp}>
                  {new Date(doubt.$createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.doubtTitle}>{doubt.title}</Text>
          <Text style={styles.doubtContent}>{doubt.content}</Text>
        </View>

        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>Replies</Text>
          {replies.map((reply) => (
            <View key={reply.$id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <View style={styles.replyUserInfo}>
                  <View style={[
                    styles.replyAvatar,
                    { backgroundColor: reply.isTeacherReply ? '#E8F5E9' : '#F5F5F5' }
                  ]}>
                    <Ionicons 
                      name={reply.isTeacherReply ? "school" : "person"} 
                      size={20} 
                      color={reply.isTeacherReply ? '#00B894' : '#666'} 
                    />
                  </View>
                  <View>
                    <Text style={styles.replyUserName}>
                      {reply.isTeacherReply ? 'Teacher' : 'Student'}
                    </Text>
                    <Text style={styles.replyTimestamp}>
                      {new Date(reply.$createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
            </View>
          ))}
          {/* Add extra padding at the bottom for keyboard */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.replyInput}>
        <TextInput
          style={styles.replyTextInput}
          placeholder="Write a reply..."
          value={replyContent}
          onChangeText={setReplyContent}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={styles.replyButton}
          onPress={handleReply}
        >
          <Ionicons name="send" size={24} color="#00B894" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  deleteButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  doubtCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  teacherAvatar: {
    backgroundColor: '#E0F9F4',
  },
  studentAvatar: {
    backgroundColor: '#F0F0F0',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  doubtTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  doubtContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  repliesSection: {
    padding: 16,
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  replyCard: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  replyContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  replyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  replyTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  replyButton: {
    padding: 8,
  },
}); 