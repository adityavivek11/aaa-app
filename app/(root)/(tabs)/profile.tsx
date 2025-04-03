import { Text, View, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

const MenuItem = ({ icon, title, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon} size={24} color="#666" />
    </View>
    <Text style={styles.menuText}>{title}</Text>
    <Ionicons name="chevron-forward" size={24} color="#666" />
  </TouchableOpacity>
);

export default function Profile() {
  const { refetch, user } = useGlobalContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();

      if (result) {
        await refetch({});
        Alert.alert("Success", "You have been logged out successfully");
      } else {
        Alert.alert("Error", "Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#666" />
        </View>
        <Text style={styles.userName}>{user?.name || "Alex Johnson"}</Text>
        <Text style={styles.userRole}>Web Development Student</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <MenuItem 
          icon="book-outline" 
          title="My Courses" 
          onPress={() => router.push('/enrolled-courses')} 
        />
        <MenuItem 
          icon="settings-outline" 
          title="Account Settings" 
          onPress={() => {}} 
        />
        <MenuItem 
          icon="bookmark-outline" 
          title="Bookmarks" 
          onPress={() => router.push('/bookmarks')} 
        />
        <MenuItem 
          icon="shield-checkmark-outline" 
          title="Privacy & Security" 
          onPress={() => {}} 
        />
        <MenuItem 
          icon="help-circle-outline" 
          title="Help & Support" 
          onPress={() => {}} 
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F8F5',
  },
  editButtonText: {
    color: '#00B894',
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 32,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});