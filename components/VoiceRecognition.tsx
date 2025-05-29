import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import { uploadAudio } from './uploadAudio'; 
import styles from './VoiceRecognitionStyles'; 

export default function VoiceRecognition() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const startRecording = async () => {
    try {
      setMessage('🎙️ Requesting Microphone Permissions...');
      console.log('🟢 Recording Start...');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('🎧 Permission Denied', 'Please enable Microphone Access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setMessage('🟢 Recording Start...');
    } catch (error) {
      console.error('❌ Error Start Recording:', error);
      setMessage('❌ Failed to Start Recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setMessage('⏹️ Recording Stop...');
      console.log('🔴 Recording Stop...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        setRecordedUri(uri);
        setMessage('📤 Upload Audio...');
        setLoading(true);

        const result = await uploadAudio(uri);
        console.log('✅ Upload Complete:', result);
        setMessage('✅ Upload Successfully!');

        setMessage('🧠 Transcribing...');
        if (result?.transcription) {
          setTranscription(prev => (prev ? `${prev} ${result.transcription}` : result.transcription));
          setMessage('✅ Transcription Complete!');
        } else {
          setMessage('❌ Transcription failed.');
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error during Stop/Upload:', error);
      setMessage('❌ An error Occurred');
      setLoading(false);
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      soundRef.current = sound;
      await sound.playAsync();
      setMessage('▶️ Recording Play...');
    } catch (error) {
      console.error('❌ Playback error:', error);
      setMessage('❌ Could not Play Audio');
    }
  };

  const renderButton = (label: string, onPress: () => void, color: string) => (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎙️ Voice Recognition System</Text>
      <Text style={styles.status}>{message}</Text>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 20 }} />}

      {renderButton(
        recording ? '🔕 Stop Recording' : '🔊 Start Recording',
        recording ? stopRecording : startRecording,
        recording ? '#FF3B30' : '#328538'
      )}

      {recordedUri && renderButton('▶️ Play Recording', playRecording, '#007AFF')}

      {transcription !== '' && (
  <>
    <Text style={styles.transcriptionTitle}>📝 Transcription Text (Editable):</Text>
    <View style={styles.transcriptionContainer}>
      <TextInput
        style={styles.transcriptionTextInput}
        value={transcription}
        onChangeText={setTranscription}
        multiline
        numberOfLines={6}
        placeholder="Edit transcription here..."
        textAlignVertical="top"
      />
    </View>
  </>
)}

    </ScrollView>
  );
}
