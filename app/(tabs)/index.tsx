import React, { useContext } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import VoiceRecognition from '../../components/VoiceRecognition';
import { AuthContext } from '../_layout';

const App = () => {
  const { logout } = useContext(AuthContext);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <VoiceRecognition />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0a2342',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0a2342',
  },
  logoutText: {
    color: '#0a2342',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
