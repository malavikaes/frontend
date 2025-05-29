export const uploadAudio = async (uri) => {
  try {
    const formData = new FormData();
    const file = {
      uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    };

    formData.append('audio', file);

    const response = await fetch('http://192.168.1.3:3000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};
