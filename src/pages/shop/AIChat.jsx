import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import AIChatBubble from '../../components/common/AIChatBubble';
import { ROUTE_MAP } from '../../App';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I'm your Artemon Joy assistant. I can help you find toys, check your recent orders, or suggest gifts. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Explicitly set the region to match your deployment
  const functions = getFunctions(undefined, 'asia-south1');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    const currentInput = input; // Capture input before clearing
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatWithAI = httpsCallable(functions, 'chatWithAI');
      
      /** * SANITIZATION: We ensure we only send 'user' and 'model' roles.
       * We also ensure 'parts' is an array with a 'text' property,
       * as expected by Gemini 1.5.
       */
      const chatHistory = messages
        .filter(msg => msg.text && msg.text.trim() !== "") // Remove empty messages
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const result = await chatWithAI({
        message: currentInput,
        chatHistory: chatHistory
      });

      if (result.data) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: result.data.text || "I found some information for you:",
          data: result.data.data 
        }]);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I encountered an error while thinking. This usually happens if the AI service is overloaded. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear your conversation history?")) {
      setMessages([{
        role: 'model',
        text: "Conversation cleared. How else can I assist you?",
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-14 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-sm font-black text-gray-900 flex items-center gap-1">
              <Sparkles size={14} className="text-secondary fill-secondary" />
              ARTEMON JOY IQ
            </h1>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">AI Online</p>
          </div>
          <button onClick={clearChat} className="p-2 hover:bg-red-50 rounded-full transition-colors group">
            <Trash2 size={18} className="text-gray-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <AIChatBubble key={index} message={msg} />
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-6">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your orders or find toys..."
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-secondary/20 transition-all outline-none pr-14"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 p-3 rounded-xl transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
            <Info size={10} /> Powered by Vertex AI. Results are personalized for you.
          </p>
        </div>
      </div>
    </div>
  );
}