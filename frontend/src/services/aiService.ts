interface AIResponse {
    response: string;
    done: boolean;
}

interface AIGenerateRequest {
    model: string;
    prompt: string;
    stream: boolean;
}

class AIService {
    private baseUrl: string;

    constructor() {
        // Default to localhost:11434 for Ollama, but can be configured
        // In Vite, environment variables must be prefixed with VITE_
        this.baseUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.2:latest',
                    prompt: prompt,
                    stream: false,
                } as AIGenerateRequest),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AIResponse = await response.json();
            return data.response || 'I apologize, but I\'m having trouble responding right now. Please try again!';
        } catch (error) {
            console.error('Error calling AI service:', error);
            throw new Error('Failed to get response from AI service. Please check if Ollama is running.');
        }
    }

    async checkAIServiceHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            return response.ok;
        } catch (error) {
            console.error('AI service health check failed:', error);
            return false;
        }
    }

    buildGenerosityPrompt(userMessage: string): string {
        return `You are Generosity AI, a kind and compassionate assistant helping users learn about generosity, food donation, and kindness in action.

Your purpose is to encourage empathy, social good, and helpfulness. Always respond in a warm, non-judgmental, and respectful tone. Support users in exploring how they can give, share, or volunteer.

If users are unsure how to help, suggest simple ways they can contribute — like donating surplus food, volunteering time, or sharing knowledge about reducing waste.

Avoid controversial, negative, or critical responses. If the user expresses confusion or hesitancy, gently encourage reflection and empathy.

If any message contains harmful, rude, or inappropriate language, respond kindly and steer the conversation back to generosity or helpfulness.

Always keep your tone:
- Address the user by name, handle the message with a warm and friendly informal tone.
- Kind and positive
- Supportive and non-preachy
- Practical, with real-life suggestions
- Influence user to be generous by donating, giving.

User message: ${userMessage}`;
    }
}

export const aiService = new AIService(); 