import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BACKEND_BASE_URL } from '../constants/Backend';

const LOGO = require('../assets/images/logo2.png'); // Use the new logo
const DARK_BLUE = '#0a2342'; // Modern dark blue

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess?: (user: { username: string; password: string; empid?: number }) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', { username: username.trim(), password: password.trim() });
      console.log('Backend URL:', `${BACKEND_BASE_URL}/login`);
      
      const response = await fetch(`${BACKEND_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok && result.success) {
        console.log('Login successful');
        console.log('🔍 User data from server:', result.user);
        console.log('🔍 EMPID from server:', result.user?.EMPID || result.user?.empid);
        
        if (onLoginSuccess) onLoginSuccess({ 
          username: username.trim(), 
          password: password.trim(),
          empid: result.user?.EMPID || result.user?.empid
        });
        else router.replace('/(tabs)');
      } else {
        console.log('Login failed:', result.error);
        Alert.alert('Login Failed', result.error || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoBlock}>
        <View style={styles.logoCircle}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Business Automation Login</Text>
      </View>
      <View style={styles.inputBlock}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#b0b8c1"
          autoCapitalize="none"
          keyboardType="email-address"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#b0b8c1"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(10, 34, 66, 0.15)', // subtle dark blue overlay
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0a2342',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputBlock: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1e335a',
  },
  button: {
    backgroundColor: '#1e335a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 