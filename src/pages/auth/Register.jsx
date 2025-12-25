// Filename: src/pages/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Lock, ShieldCheck, 
  ArrowRight, ArrowLeft, Loader2, Sparkles 
} from 'lucide-react';

export default function Register() {
  const { requestOTP, verifyAndRegister, loginWithGoogle } = useAuth(); // Added loginWithGoogle
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // New loader for Google
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    try {
      await requestOTP(formData.email);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError('Failed to send verification code. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyAndRegister(
        formData.email, 
        formData.password, 
        formData.otp, 
        formData.name
      );
      navigate('/shop');
    } catch (err) {
      console.error(err);
      setError('Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Google Registration Handler ---
  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/shop');
    } catch (err) {
      console.error("Google registration error:", err);
      setError('Could not connect to Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-gray-900">Join the Joy!</h1>
          <p className="text-gray-500 mt-2">Create your Artemon Joy account</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required name="name" type="text" placeholder="John Doe" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                      value={formData.name} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required name="email" type="email" placeholder="hello@example.com" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                      value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Set Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required name="password" type="password" placeholder="••••••••" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50"
                      value={formData.password} onChange={handleChange} />
                  </div>
                </div>

                <button disabled={loading || googleLoading} type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Send Verification Code <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-wider">Or quick join with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                disabled={loading || googleLoading}
                onClick={handleGoogleRegister}
                className="w-full py-4 bg-white border-2 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Sign up with Google
                  </>
                )}
              </button>
            </>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Verify Your Email</h3>
                <p className="text-sm text-gray-500">We've sent a 6-digit code to <br/><b>{formData.email}</b></p>
              </div>

              <input required name="otp" type="text" maxLength="6" placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.5em] font-black py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-indigo-600"
                value={formData.otp} onChange={handleChange} autoFocus />

              <div className="flex flex-col gap-3">
                <button disabled={loading} type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Complete"}
                </button>
                <button type="button" onClick={() => setStep(1)} 
                  className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-indigo-600 font-bold transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Change Email or Info
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}