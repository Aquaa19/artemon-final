import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  BarChart3, 
  AlertTriangle, 
  PackageSearch,
  RefreshCw,
  Info
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AIChatBubble from '../../components/common/AIChatBubble';

export default function AIConsole() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Welcome to the Artemon Joy Intelligence Console. I have global access to sales, inventory, and user data. You can ask me for revenue summaries, low stock alerts, or customer insights.",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  
  // Ensure the region matches your deployed functions (asia-south1)
  const functions = getFunctions(undefined, 'asia-south1');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e, directPrompt = null) => {
    if (e) e.preventDefault();
    const messageText = directPrompt || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (!directPrompt) setInput('');
    setIsLoading(true);

    try {
      const chatWithAI = httpsCallable(functions, 'chatWithAI', { region: 'asia-south1' });
      
      /** * SANITIZATION: Force history into the 'user'/'model' role pattern 
       * required by Gemini 2.0 Flash.
       */
      const chatHistory = messages
        .filter(msg => msg.text && msg.text.trim() !== "")
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const result = await chatWithAI({
        message: messageText,
        chatHistory: chatHistory,
        isAdmin: true // This is the master key for the backend logic we updated
      });

      if (result.data) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: result.data.text || "I have compiled the requested data:",
          data: result.data.data // Contains totalRevenue, lowStockItems, etc.
        }]);
      }
    } catch (error) {
      console.error("Admin AI Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I encountered an error accessing global analytics. This may be due to a temporary service interruption or permission sync issue.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Sales Summary", icon: BarChart3, prompt: "Give me a summary of today's sales and total revenue." },
    { label: "Inventory Check", icon: AlertTriangle, prompt: "Which products have a stock count lower than 10?" },
    { label: "Search Orders", icon: PackageSearch, prompt: "Show me the last 5 orders across the platform." },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" />
            Business Intelligence Console
          </h1>
          <p className="text-sm text-gray-500 font-medium">Global Marketplace Insights powered by Gemini 2.0</p>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-all active:scale-95"
        >
          <RefreshCw size={16} /> Reset Session
        </button>
      </div>

      {/* Main Console Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Chat Stream */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
          >
            {messages.map((msg, index) => (
              <AIChatBubble key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-gray-50">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about revenue, inventory, or customers..."
                className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl px-6 py-4 text-sm font-medium transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 space-y-4 hidden lg:block">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Sparkles size={18} /> Admin Privileges
            </h3>
            <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
              Your console is connected to the **Admin Brain**. This enables cross-collection queries for revenue, global trends, and stock forecasting.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Insights</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSendMessage(null, action.prompt)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-left text-[11px] font-black text-gray-600 transition-all border border-transparent hover:border-indigo-100 active:scale-95"
                >
                  <action.icon size={14} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5">
            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={12} /> Security Notice
            </h4>
            <p className="text-[10px] text-amber-600 font-medium leading-normal">
              Internal data access is logged. Ensure you are on a private connection before requesting sensitive financial summaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}