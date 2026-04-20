import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';

import { motion } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setStatus({ type: 'success', message: response.data.message });
      setEmail(''); // clear email field on success
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to request password reset. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex relative overflow-hidden items-center justify-center p-4 transition-colors">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Sign In
        </Link>
        
        <div className="text-center mb-8">
          <motion.div 
             initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}
             className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/30 mb-6"
          >
            <KeyRound size={32} />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <div className="glass-card p-8 sm:p-10">
          {status.type === 'success' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex justify-center items-center">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check Your Email</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {status.message}
                </p>
                <div className="mt-6 p-4 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl text-xs font-medium border border-amber-500/20">
                  <span className="font-bold">Development Note:</span> The app doesn't have real SMTP wired up. The reset link is printed in the backend terminal logs!
                </div>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status.type === 'error' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm text-center font-bold">
                  {status.message}
                </motion.div>
              )}
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 py-3.5"
                    placeholder="admin@pharmacy.com"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base mt-2 shadow-primary-500/30"
              >
                {loading ? 'Sending Request...' : 'Reset Password'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
