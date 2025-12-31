// Filename: src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Loader2, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ROUTE_MAP } from '../../App';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || ROUTE_MAP.SHOP;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Account temporarily locked. Try later.');
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError('Could not connect to Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    // FIXED: Changed items-center to a flexible padding-top to ensure content 
    // is scrollable and visible when the mobile keyboard is open.
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-gray-50 px-4 pt-24 pb-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          {/* Responsive Typography: 3xl on mobile, 4xl on desktop */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Welcome Back!</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Log in to your Artemon Joy account</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 text-xs md:text-sm font-bold rounded-2xl flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input 
                  required 
                  type="email" 
                  inputMode="email"
                  placeholder="hello@example.com" 
                  className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm md:text-base text-gray-700"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-tighter hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full pl-11 md:pl-12 pr-11 md:pr-12 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm md:text-base text-gray-700"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              disabled={loading || googleLoading} 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>Sign In <LogIn className="w-4 h-4 md:w-5 md:h-5" /></>
              )}
            </motion.button>
          </form>

          <div className="relative my-6 md:my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-400 font-black uppercase tracking-[0.2em]">Or</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3.5 md:py-4 bg-white border-2 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 md:w-5 md:h-5" alt="Google" />
                <span className="text-xs md:text-sm">Sign in with Google</span>
              </>
            )}
          </motion.button>
        </div>

        <p className="text-center mt-8 text-[10px] md:text-xs text-gray-400 font-bold px-4 leading-relaxed uppercase tracking-tighter">
          By signing in, you agree to Artemon Joy's <br />
          <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>.
        </p>

        <p className="text-center mt-4 text-gray-500 text-sm font-medium">
          Don't have an account? <Link to={ROUTE_MAP.REGISTER} className="text-indigo-600 font-black hover:underline">Join the Joy</Link>
        </p>
      </motion.div>
    </div>
  );
}