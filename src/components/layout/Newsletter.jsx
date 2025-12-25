import { useState } from 'react';
import { db } from '../../services/firebase'; // Ensure your firebase service is imported
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // Save email to a 'subscribers' collection in Firestore
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("Subscription error:", error);
      setStatus('error');
    }
  };

  return (
    <section className="bg-indigo-950 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg">
          <h2 className="text-3xl lg:text-4xl font-black text-white flex items-center gap-3">
            Join the Fun! 🚀
          </h2>
          <p className="text-indigo-200 font-medium">
            Subscribe to our newsletter for exclusive toy drops, parenting tips, and magical offers.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="w-full max-w-md relative group">
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-2">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-transparent border-none outline-none text-white px-4 py-3 flex-1 placeholder:text-indigo-300 font-bold"
              disabled={status === 'loading' || status === 'success'}
            />
            
            <button
              disabled={status === 'loading' || status === 'success'}
              className={`px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 ${
                status === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : 
               status === 'success' ? <><CheckCircle2 className="w-5 h-5" /> Subscribed</> : 
               <>Subscribe <Send className="w-4 h-4" /></>}
            </button>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs mt-2 font-bold ml-2">
              Something went wrong. Please try again later.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}