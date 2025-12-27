import { motion } from 'framer-motion';
import { Star, User, ShoppingBag, Package, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIChatBubble({ message }) {
  const isAI = message.role === 'model';
  // Standardize data access from the backend response
  const data = message.data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[95%] sm:max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar Section */}
        <div className={`flex-shrink-0 mt-1 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm 
            ${isAI ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {isAI ? <Sparkles size={16} fill="white" /> : <User size={16} />}
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-col space-y-3 overflow-hidden">
          {/* Main Message Bubble */}
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm overflow-x-auto
            ${isAI 
              ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
              : 'bg-primary text-white rounded-tr-none'}`}>
            
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm max-w-none 
                prose-p:leading-relaxed prose-p:my-1
                prose-table:my-4 prose-table:w-full prose-table:border-collapse
                prose-th:bg-gray-50 prose-th:text-gray-600 prose-th:font-black prose-th:uppercase prose-th:text-[10px] prose-th:tracking-wider prose-th:p-2 prose-th:border prose-th:border-gray-100
                prose-td:p-2 prose-td:text-[11px] prose-td:border prose-td:border-gray-100 prose-td:text-gray-600
                prose-strong:text-indigo-600 prose-strong:font-black"
              components={{
                // Custom table wrapper for horizontal scrolling on mobile
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-3 rounded-xl border border-gray-100 shadow-inner bg-gray-50/30">
                    <table className="min-w-full divide-y divide-gray-200" {...props} />
                  </div>
                ),
                // Ensure links in text don't break layout
                a: ({node, ...props}) => <a className="text-indigo-600 hover:underline font-bold" {...props} />
              }}
            >
              {/* Added a safeguard to handle potential spacing issues from raw AI text */}
              {message.text?.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </div>

          {/* AI Specialized Data Rendering (Visual Cards) */}
          {isAI && data && (
            <div className="pt-1 flex flex-wrap gap-3">
              
              {/* ADMIN: Total Revenue Visual Card */}
              {(data.isAdmin || data.isAdminConsole) && data.totalRevenue !== undefined && (
                <div className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Platform Analytics</span>
                    <TrendingUp size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase opacity-70">Total Revenue</span>
                    <h3 className="text-2xl font-black">₹{data.totalRevenue.toLocaleString()}</h3>
                  </div>
                </div>
              )}

              {/* ADMIN/SHARED: Low Stock Alerts */}
              {data.lowStockItems && data.lowStockItems.length > 0 && (
                <div className="w-full bg-orange-50 border border-orange-100 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-xs font-black text-orange-700 mb-3 flex items-center gap-2 uppercase tracking-tight">
                    <AlertCircle size={14} /> Inventory Shortage Alerts
                  </h4>
                  <div className="space-y-2">
                    {data.lowStockItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-orange-50 shadow-sm">
                        <span className="text-[11px] font-bold text-gray-800">{item.name}</span>
                        <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCT CARDS: (Automatic Suggestions) */}
              {Array.isArray(data) && data.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/product/ai-suggestion/${item.id}`} 
                  className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col w-40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                   <div className="h-24 w-full bg-gray-50 rounded-xl overflow-hidden mb-2">
                    <img 
                      src={item.image || '/artemon_joy_logo.webp'} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <h4 className="text-[11px] font-black text-gray-900 truncate leading-tight">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-indigo-600 font-black">₹{item.price?.toLocaleString()}</p>
                    <ShoppingBag size={12} className="text-gray-300 group-hover:text-indigo-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}