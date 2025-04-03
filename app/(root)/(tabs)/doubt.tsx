import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getDoubtsByUserId, Doubt, createDoubt, getDoubtReplies, deleteDoubt } from '@/lib/appwrite-db';
import { useGlobalContext } from '@/lib/global-provider';

export default function DoubtForum() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useGlobalContext();

  useEffect(() => {
    loadDoubts();
  }, []);

  const loadDoubts = async () => {
    if (!user?.$id) return;
    try {
      const doubtsResponse = await getDoubtsByUserId(user.$id);
      const doubtsWithReplies = await Promise.all(
        doubtsResponse.documents.map(async (doubt) => {
          const repliesData = await getDoubtReplies(doubt.$id);
          return {
            ...doubt,
            replies: repliesData.documents
          };
        })
      );
      setDoubts(doubtsWithReplies);
    } catch (error) {
      console.error('Error loading doubts:', error);
      Alert.alert('Error', 'Failed to load your doubts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDoubts();
  };

  const handleAskQuestion = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to ask questions');
      return;
    }
    router.push('/new-doubt');
  };

  const handleDoubtPress = (doubtId: string) => {
    router.push(`/doubt/${doubtId}`);
  };

  const handleDelete = async (doubtId: string) => {
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
              await deleteDoubt(doubtId);
              loadDoubts();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Questions</Text>
        <TouchableOpacity 
          style={styles.askButton} 
          onPress={handleAskQuestion}
        >
          <Text style={styles.askButtonText}>Ask Question</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {doubts.map((doubt) => (
          <TouchableOpacity
            key={doubt.$id}
            style={styles.doubtCard}
            onPress={() => handleDoubtPress(doubt.$id)}
          >
            <View style={styles.doubtHeader}>
              <Text style={styles.doubtTitle}>{doubt.title}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(doubt.$id)}
                style={styles.deleteIcon}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <View style={styles.doubtMeta}>
              <Text style={styles.timestamp}>
                {getTimeAgo(new Date(doubt.$createdAt))}
              </Text>
              {doubt.replies && doubt.replies.length > 0 && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Replied</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

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
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  askButton: {
    backgroundColor: '#00B894',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  doubtCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doubtTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 8,
  },
  deleteIcon: {
    padding: 4,
    justifyContent: 'center',
  },
  doubtMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#E0F9F4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#00B894',
    fontSize: 12,
    fontWeight: '500',
  },
});