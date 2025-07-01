import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech'; // ✅ TTS import
import styles from './VoiceRecognitionStyles';
import useAudioRecorder from './useAudioRecorder';
import { uploadAudio } from './uploadAudio';
import TextToVoice from '../components/TextToVoice'; // ✅ Ensure this exists
import { BACKEND_BASE_URL } from '../constants/Backend';
import { AuthContext } from '../app/_layout';

// Type guard for objects with duration
function hasDuration(obj: any): obj is { duration: number } {
  return obj && typeof obj === 'object' && 'duration' in obj && typeof obj.duration === 'number';
}

export default function VoiceRecognition() {
  const [message, setMessage] = useState('');
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const { user } = useContext(AuthContext);

  const {
    recording,
    recordedUri,
    startRecording,
    stopRecording,
    playRecording,
  } = useAudioRecorder();

  const handleStart = () => startRecording(setMessage);

  const handleStop = async () => {
    const uri = await stopRecording(setMessage);
    if (uri) {
      setLoading(true);
      setMessage('📤 Uploading Audio...');
      try {
        const result = await uploadAudio(uri);
        console.log('✅ Upload Result:', result);

        setMessage('🧠 Transcribing...');
        const text = result.transcription || result.transcript;
        
        // Set audio duration if available (even if transcription failed)
        if (hasDuration(result)) {
          setAudioDuration(result.duration);
        }
        
        if (text) {
          setTranscription(prev => (prev ? `${prev} ${text}` : text));
          setMessage(`✅ Transcription Complete!${hasDuration(result) ? ` (Duration: ${result.duration}s)` : ''}`);
        } else {
          // Show duration even if transcription failed
          if (hasDuration(result)) {
            setMessage(`⚠️ Could not transcribe audio (Duration: ${result.duration}s)`);
        } else {
          setMessage('❌ No Transcription Found');
          }
        }
      } catch (err) {
        console.error(err);
        // Show duration if present in error
        if (hasDuration(err)) {
          setAudioDuration(err.duration);
          setMessage(`❌ Upload/Transcription Error (Duration: ${err.duration}s)`);
        } else {
        setMessage('❌ Upload Error');
        }
      }
      setLoading(false);
    }
  };

  const handleTextToSpeech = () => {
    if (transcription.trim()) {
      setMessage('🔊 Speaking...');
      Speech.speak(transcription, {
        rate: 1.0,
        pitch: 1.0,
        language: 'en-US',
        onDone: () => setMessage('✅ Done Speaking'),
      });
    } else {
      setMessage('⚠️ Nothing to Speak');
    }
  };

  const handleSend = async () => {
    if (!transcription.trim()) {
      setMessage('⚠️ Please Transcribe Something First.');
      return;
    }
    if (!selectedAgent) {
      setMessage('⚠️ Please Select a Target Agent.');
      return;
    }
    
    if (!user || !user.username || !user.password) {
      setMessage('⚠️ User credentials not available. Please login again.');
      return;
    }

    const INSERT_URL = `${BACKEND_BASE_URL}/insert`;

    try {
      setMessage('📤 Sending to Client Agent...');
      const response = await fetch(INSERT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_data: transcription,
          target_agent: selectedAgent,
          target_column: 'COLUMN_Y',
          username: user.username,
          password: user.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.selenium_result) {
        // Show both parsed fields and selenium result
        const displayText = `🔍 PARSED FIELDS:\n${result.parsed_fields || 'No fields extracted'}\n\n🤖 SELENIUM RESULT:\n${result.selenium_result}`;
        setTranscription(displayText);
        setMessage('✅ Text parsed and form filled successfully!');
      } else {
        setMessage(`❌ Insert Failed: ${result.error || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error('❌ Send Error:', error);
      setMessage('❌ Network Error');
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

      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {renderButton(
        recording ? '🔴 Stop Recording' : '🟢 Start Recording',
        recording ? handleStop : handleStart,
        recording ? '#FF3B30' : '#34C759'
      )}

      {recordedUri && renderButton('▶️ Play Recording', () => playRecording(setMessage), '#FF1493')}

      <Text style={styles.transcriptionTitle}>📝 Transcribed Text:</Text>
      <TextInput
        style={styles.transcriptionTextInput}
        value={transcription}
        onChangeText={setTranscription}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        placeholder="Transcribed Text will Appear Here..."
      />

      {audioDuration && (
        <Text style={styles.durationText}>⏱️ Audio Duration: {audioDuration} seconds</Text>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 10 }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#FF8C00', width: 150, height: 50, justifyContent: 'center', alignItems: 'center' }]}
           onPress={() => {
             if (transcription.trim()) {
              // Use expo-speech directly or trigger a handler in the parent
              Speech.speak(transcription, {
                rate: 1.0,
                pitch: 1.0,
              });
            }
          }}>
          <Text style={styles.buttonText}>🔈 Speak</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#800080', width: 150, height: 50, justifyContent: 'center', alignItems: 'center' }]}
          onPress={() => setTranscription('')}
        >
        <Text style={styles.buttonText}>🗑️ Clear</Text>
       </TouchableOpacity>
      </View>

      <Text style={styles.agentTitle}>🎯 Select Target Agent:</Text>
      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={selectedAgent}
          onValueChange={(itemValue: string) => setSelectedAgent(itemValue)}
          style={styles.picker}
          dropdownIconColor="#333"
          mode="dropdown"
        >
          <Picker.Item label="------- Select Agent -------" value="" />
          <Picker.Item label="Agent A" value="Agent A" />
          <Picker.Item label="Agent B" value="Agent B" />
          <Picker.Item label="Agent C" value="Agent C" />
        </Picker>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 10 }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FFD700', width: 150, height: 50, justifyContent: 'center', alignItems: 'center' }]}
          onPress={handleTextToSpeech}
        >
          <Text style={styles.buttonText}>🎧 Listening</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#00BFFF', width: 150, height: 50, justifyContent: 'center', alignItems: 'center' }]}
          onPress={handleSend}
        >
          <Text style={styles.buttonText}>📤 Send</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
