import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BookOpen, HelpCircle, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: true,
      headerShown: false,
      tabBarActiveTintColor: "#00B894",
      tabBarInactiveTintColor: "rgb(94, 94, 94)",
      tabBarStyle: {
        backgroundColor: "white",
        borderTopWidth: 0,
        position: "absolute",
        elevation: 10,
        height: 60,
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 30,
        paddingBottom: 10,
        paddingTop: 5,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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