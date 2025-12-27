import { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle2, Send, Rocket } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [isFocused, setIsFocused] = useState(false); // Track input focus state

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
      });

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Subscription error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Outer Card with Border Glow:
        - Added `group/card` to control hover effects on the outer container.
        - The glow is created by a pseudo-element (`before:`) with an indigo/purple gradient.
        - `hover:before:opacity-100` makes it glow on hover.
        - `ring-1 ring-white/20` provides a subtle, sharp border edge.
      */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 rounded-[3rem] p-8 lg:px-16 lg:py-10 shadow-2xl ring-1 ring-white/20 group/card before:absolute before:inset-0 before:-z-10 before:rounded-[3rem] before:bg-gradient-to-br before:from-indigo-500/50 before:via-purple-500/50 before:to-pink-500/50 before:blur-2xl before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
        
        {/* Background Decorative Sparkles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left Content */}
          <div className="flex-[1.2] text-center lg:text-left space-y-4">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-5">
              <div className="p-3 bg-white/10 rounded-2xl shadow-inner shrink-0">
                <Rocket className="w-8 h-8 text-yellow-300 animate-bounce-slow" />
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                Join the Fun!
              </h2>
            </div>
            <p className="text-base lg:text-lg text-indigo-100/90 font-medium leading-relaxed max-w-2xl">
              Unlock wonder! Subscribe for <span className="text-white font-bold">exclusive toy drops</span> and <span className="text-white font-bold">magical offers</span> delivered straight to your inbox.
            </p>
          </div>

          {/* Right Form Card */}
          <div className="flex-1 w-full max-w-md relative">
            {/* Inner Input Card with Border Glow:
              - Used conditional classes based on `isFocused` and `email` content.
              - `shadow-[0_0_20px_rgba(99,102,241,0.5)]` creates a persistent glow when focused or filled.
              - `border-indigo-400/50` makes the border itself brighter.
            */}
            <form 
              onSubmit={handleSubscribe} 
              className={`relative bg-white/5 backdrop-blur-md p-1.5 rounded-[2rem] border transition-all duration-300 ${
                isFocused || email 
                  ? 'border-indigo-400/50 shadow-[0_0_25px_rgba(99,102,241,0.4)]' 
                  : 'border-white/10 shadow-xl hover:shadow-indigo-500/20 hover:border-white/20'
              }`}
            >
              <div className="relative flex items-center">
                <div className="absolute left-6 pointer-events-none">
                  <Send className={`w-5 h-5 transition-colors duration-300 ${isFocused || email ? 'text-indigo-300' : 'text-indigo-300/50'}`} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent border-none outline-none text-white pl-14 pr-32 py-3.5 placeholder:text-indigo-300/50 font-bold text-lg focus:ring-0"
                  disabled={status === 'loading' || status === 'success'}
                />
                
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`h-11 px-7 rounded-xl font-black transition-all duration-300 flex items-center gap-2 overflow-hidden shadow-lg ${
                      status === 'success' 
                        ? 'bg-green-500 text-white cursor-default' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 animate-pop-in" />
                    ) : (
                      <span className="text-sm">Subscribe</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
            {status === 'error' && (
              <p className="absolute -bottom-6 left-6 text-red-400 text-[10px] font-bold flex items-center gap-1.5 animate-shake">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Please try again.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}