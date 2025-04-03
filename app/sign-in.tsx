import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { login } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider';
import { Redirect } from 'expo-router';


export default function SignIn() {
  const { refetch, loading, isLogged } = useGlobalContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect to home if already logged in
  if (!loading && isLogged) {
    return <Redirect href="/(root)/(tabs)" />;
  }




  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const result = await login();

      if (result) {
        console.log('Login Success');
        // Refresh user data after successful login
        await refetch({});
      } else {
        Alert.alert("Error", "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          <View style={styles.cardContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <BookSvg />
              </View>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>
                Continue your learning journey
              </Text>
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <>
                  <GoogleSvg />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.signupPrompt}>
              <Text style={styles.signupPromptText}>
                New to our platform?{' '}
                <Text style={styles.signupLink}>Create Account</Text>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// SVG Components
const BookSvg = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#10c469" strokeWidth={2}>
    <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Svg>
);

const GoogleSvg = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
      fill="#4285F4"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#10c469',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  signupPrompt: {
    alignItems: 'center',
    marginTop: 25,
  },
  signupPromptText: {
    fontSize: 14,
    color: '#777',
  },
  signupLink: {
    color: '#10c469',
    fontWeight: '500',
  },
});