import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useBackendUrl } from '../../components/BackendUrlContext';

export default function SettingsScreen() {
  const { backendUrl, setBackendUrl } = useBackendUrl();
  const [url, setUrl] = useState(backendUrl);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Backend URL:</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="http://your-backend-url:5000"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        title="Save"
        onPress={() => {
          setBackendUrl(url);
          Alert.alert('Saved', 'Backend URL updated!');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20 },
}); 