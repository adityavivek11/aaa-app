import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BookOpen, HelpCircle, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: true,
      headerShown: false,
      tabBarActiveTintColor:"#00B894",  // Default active color (except notification)
      tabBarInactiveTintColor: "rgb(94, 94, 94)",   // Inactive color for all
      tabBarStyle: {
        backgroundColor: "white",
        borderTopWidth: 0,
        position: "absolute",
        elevation: 0,
        height: 50,
        paddingBottom: 20,
      },
    }}
  >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="courses" 
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="doubt" 
        options={{
          title: 'Doubt',
          tabBarIcon: ({ color, focused }) => (
            <HelpCircle color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={24} />
          ),
        }} 
      />
    </Tabs>
  );
}