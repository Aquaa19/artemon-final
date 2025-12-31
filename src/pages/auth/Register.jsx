// Filename: src/pages/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Lock, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Sparkles, Eye, EyeOff 
} from 'lucide-react';
import { ROUTE_MAP } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const { requestOTP, verifyAndRegister, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions to proceed.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestOTP(formData.email);
      setStep(2);
    } catch (err) {
      setError('Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyAndRegister(formData.email, formData.password, formData.otp, formData.name);
      navigate(ROUTE_MAP.SHOP);
    } catch (err) {
      setError('Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions to proceed.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate(ROUTE_MAP.SHOP);
    } catch (err) {
      setError('Could not connect to Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    // Adaptive container ensures keyboard doesn't hide input fields on mobile
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-gray-50 px-4 pt-24 pb-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Join the Joy!</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Create your Artemon Joy account</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 text-xs md:text-sm font-bold rounded-2xl flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form onSubmit={handleRequestOTP} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input required name="name" type="text" placeholder="John Doe" autoFocus
                        className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm md:text-base"
                        value={formData.name} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input required name="email" type="email" inputMode="email" placeholder="hello@example.com" 
                        className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm md:text-base"
                        value={formData.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Set Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input required name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" 
                        className="w-full pl-11 md:pl-12 pr-11 md:pr-12 py-3.5 md:py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm md:text-base"
                        value={formData.password} onChange={handleChange} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 px-1 py-2 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                    <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreedToTerms ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 group-hover:border-indigo-300'}`}>
                      {agreedToTerms && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed font-bold">
                      By joining, I agree to the Artemon Joy <Link to="/privacy" target="_blank" className="text-indigo-600 underline">Privacy Policy</Link> and <Link to="/terms" target="_blank" className="text-indigo-600 underline">Terms of Service</Link>.
                    </p>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.97 }}
                    disabled={loading || googleLoading || !agreedToTerms} 
                    type="submit"
                    className={`w-full py-4 font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${agreedToTerms ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Verify My Email <ArrowRight size={16} /></>}
                  </motion.button>
                </form>

                <div className="relative my-6 md:my-8">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                  <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-gray-400 font-black uppercase tracking-[0.2em]">Or Join With</span></div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={loading || googleLoading || !agreedToTerms}
                  onClick={handleGoogleRegister}
                  className={`w-full py-3.5 md:py-4 border-2 rounded-2xl transition-all flex items-center justify-center gap-3 font-bold text-sm ${agreedToTerms ? 'bg-white border-gray-100 hover:bg-indigo-50/30 text-gray-700' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {googleLoading ? <Loader2 className="animate-spin" size={18} /> : <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className={`w-5 h-5 ${!agreedToTerms && 'grayscale opacity-50'}`} alt="" />Google Sync</>}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Mail size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Check Your Inbox</h3>
                  <p className="text-sm text-gray-500 font-medium px-4 leading-relaxed">We sent a 6-digit verification code to <br/><span className="text-indigo-600 font-bold">{formData.email}</span></p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <input required name="otp" type="text" inputMode="numeric" pattern="[0-9]*" maxLength="6" placeholder="••••••"
                    className="w-full text-center text-3xl tracking-[0.4em] font-black py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    value={formData.otp} onChange={handleChange} autoFocus />

                  <div className="space-y-3">
                    <motion.button 
                      whileTap={{ scale: 0.97 }}
                      disabled={loading} type="submit"
                      className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalize Registration"}
                    </motion.button>
                    
                    <button type="button" onClick={() => setStep(1)} 
                      className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-gray-400 hover:text-indigo-600 font-black uppercase tracking-widest transition-all">
                      <ArrowLeft size={14} /> Back to Details
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-gray-500 text-sm font-medium">
          Already a part of the joy? <Link to={ROUTE_MAP.LOGIN} className="text-indigo-600 font-black hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
}