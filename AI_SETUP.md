# Generosity AI Setup Guide

## Overview
The Generosity AI feature allows users to chat with an AI assistant that promotes generosity, food donation, and kindness. The AI is powered by Ollama running the Llama 3.2 model.

## Prerequisites
- Ollama installed on your system
- Llama 3.2 model downloaded

## Setup Instructions

### 1. Install Ollama
Visit [ollama.ai](https://ollama.ai) and follow the installation instructions for your operating system.

### 2. Download the Llama 3.2 Model
Run the following command in your terminal:
```bash
ollama pull llama3.2:latest
```

### 3. Start Ollama
Start the Ollama service:
```bash
ollama serve
```

### 4. Verify Installation
Test that Ollama is running correctly:
```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with available models.

### 5. Test the AI
You can test the AI directly:
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:latest",
    "prompt": "Hello, how can I help others today?",
    "stream": false
  }'
```

## Configuration

### Environment Variables
You can configure the AI service URL by setting the `VITE_OLLAMA_URL` environment variable:

```bash
# .env file
VITE_OLLAMA_URL=http://localhost:11434
```

### Default Configuration
- **URL**: `http://localhost:11434`
- **Model**: `llama3.2:latest`
- **API Endpoint**: `/api/generate`

## Features

### Generosity AI Chat
- **Location**: Available in the dashboard sidebar
- **Purpose**: Encourages users to learn about generosity and kindness
- **Tone**: Warm, supportive, and non-judgmental
- **Topics**: Food donation, volunteering, community service, acts of kindness

### AI Personality
The AI is programmed with the Generosity AI prompt that:
- Encourages empathy and social good
- Provides practical suggestions for helping others
- Avoids controversial or negative responses
- Promotes food donation and community service
- Maintains a kind and positive tone

## Troubleshooting

### Common Issues

1. **"AI service is not available"**
   - Make sure Ollama is running: `ollama serve`
   - Check if the model is downloaded: `ollama list`
   - Verify the API is accessible: `curl http://localhost:11434/api/tags`

2. **"Failed to get response from AI"**
   - Check Ollama logs for errors
   - Ensure the model is properly downloaded
   - Verify network connectivity

3. **Slow responses**
   - The first response may be slower as the model loads
   - Consider using a more powerful machine for better performance

### Health Check
The application automatically checks if the AI service is available when the chat is opened. If the service is offline, users will see a warning message with a "Retry" button.

## Security Considerations

- The AI service runs locally on your machine
- No data is sent to external servers
- All conversations are processed locally
- The AI is programmed to avoid harmful or inappropriate content

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Ollama is running and accessible
3. Ensure the Llama 3.2 model is downloaded
4. Check the network connectivity to localhost:11434

## Future Enhancements

Potential improvements:
- Conversation history persistence
- Multiple AI personalities
- Integration with donation tracking
- Personalized generosity suggestions
- Community impact metrics 