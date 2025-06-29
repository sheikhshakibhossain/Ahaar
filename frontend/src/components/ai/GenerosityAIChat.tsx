import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Divider,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as AIIcon,
    Person as PersonIcon,
    Close as CloseIcon,
    Psychology as PsychologyIcon,
    WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface GenerosityAIChatProps {
    open: boolean;
    onClose: () => void;
}

export const GenerosityAIChat: React.FC<GenerosityAIChatProps> = ({ open, onClose }) => {
    const theme = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm Generosity AI, your compassionate assistant for learning about generosity, food donation, and kindness in action. How can I help you today? 💝",
            isUser: false,
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAIServiceAvailable, setIsAIServiceAvailable] = useState<boolean | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check AI service health when dialog opens
    useEffect(() => {
        if (open) {
            checkAIServiceHealth();
        }
    }, [open]);

    const checkAIServiceHealth = async () => {
        try {
            const isHealthy = await aiService.checkAIServiceHealth();
            setIsAIServiceAvailable(isHealthy);
            if (!isHealthy) {
                setError('AI service is not available. Please make sure Ollama is running with the llama3.2:latest model.');
            } else {
                setError(null);
            }
        } catch (err) {
            setIsAIServiceAvailable(false);
            setError('Unable to connect to AI service. Please check if Ollama is running.');
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        setError(null);

        try {
            const prompt = aiService.buildGenerosityPrompt(inputText.trim());
            const aiResponse = await aiService.generateResponse(prompt);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Sorry, I\'m having trouble connecting right now. Please try again later.');
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, but I'm having trouble connecting right now. Please check your internet connection and try again. In the meantime, remember that even small acts of kindness can make a big difference! 🌟",
                isUser: false,
                timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleRetryConnection = () => {
        checkAIServiceHealth();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    height: '80vh',
                    maxHeight: '80vh',
                    borderRadius: 3,
                }
            }}
        >
            <DialogTitle sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <PsychologyIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Generosity AI 💝
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Your compassionate assistant for kindness and giving
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ 
                        color: 'white',
                        ml: 'auto',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Messages Area */}
                <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: 2,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    minHeight: '400px'
                }}>
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                                mb: 2,
                            }}
                        >
                            <Card
                                sx={{
                                    maxWidth: '70%',
                                    background: message.isUser 
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'white',
                                    color: message.isUser ? 'white' : 'text.primary',
                                    borderRadius: 3,
                                    boxShadow: 2,
                                }}
                            >
                                <CardContent sx={{ p: 2, pb: 1 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Avatar 
                                            sx={{ 
                                                width: 24, 
                                                height: 24,
                                                bgcolor: message.isUser 
                                                    ? 'rgba(255,255,255,0.2)' 
                                                    : theme.palette.primary.main
                                            }}
                                        >
                                            {message.isUser ? <PersonIcon sx={{ fontSize: 16 }} /> : <AIIcon sx={{ fontSize: 16 }} />}
                                        </Avatar>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            {message.isUser ? 'You' : 'Generosity AI'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, ml: 'auto' }}>
                                            {formatTime(message.timestamp)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {message.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                    
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                            <Card sx={{ background: 'white', borderRadius: 3, boxShadow: 2 }}>
                                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2" color="text.secondary">
                                        Generosity AI is thinking...
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                    
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, background: 'white', borderTop: 1, borderColor: 'divider' }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 2 }}
                            action={
                                <Button 
                                    color="inherit" 
                                    size="small" 
                                    onClick={handleRetryConnection}
                                    startIcon={<WifiOffIcon />}
                                >
                                    Retry
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}
                    
                    {isAIServiceAvailable === false && !error && (
                        <Alert 
                            severity="warning" 
                            sx={{ mb: 2 }}
                            action={
                                <Button 
                                    color="inherit" 
                                    size="small" 
                                    onClick={handleRetryConnection}
                                >
                                    Check Connection
                                </Button>
                            }
                        >
                            AI service appears to be offline. Please make sure Ollama is running.
                        </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me about generosity, food donation, or how you can help others..."
                            variant="outlined"
                            size="small"
                            disabled={isLoading || isAIServiceAvailable === false}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                }
                            }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isLoading || isAIServiceAvailable === false}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                '&:disabled': { bgcolor: 'grey.300' }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Press Enter to send, Shift+Enter for new line
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}; 