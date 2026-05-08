import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      agent: 'system',
      content: "Hello! I'm your Smart Retail Assistant. How can I help you analyze your data today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await api.askAgent(userMessage.content);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        agent: response.agent || 'assistant',
        content: response.response || 'No response provided.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message || 'Failed to communicate with the AI agent.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Retail Intelligence</h2>
          <p className="text-sm text-surface-500">Ask questions about sales, forecasts, or anomalies</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-surface-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-surface-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand-600" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                {msg.role === 'assistant' && msg.agent && (
                  <span className="text-xs font-medium text-surface-400 mb-1 ml-1 capitalize">
                    {msg.agent.replace('_', ' ')}
                  </span>
                )}
                
                <div 
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-surface-200 text-surface-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                
                <span className={`text-[10px] text-surface-400 mt-1 ${msg.role === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                </div>
              </div>
              <div className="bg-white border border-surface-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-white border-t border-surface-200">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea 
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your sales data..." 
              className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none overflow-hidden text-surface-900 pr-12 min-h-[48px]"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
              !inputValue.trim() || isLoading 
                ? 'bg-surface-100 text-surface-400 cursor-not-allowed' 
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
            }`}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-surface-400">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
