import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Building2, Landmark, PhoneCall, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [settings, setSettings] = useState({
    pharmacyName: '',
    phone: '',
    address: '',
    taxRate: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('http://localhost:5000/api/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving settings', error);
      alert('You must be an admin to configure global settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-slate-50 dark:bg-[#0f1117]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20 relative">
      
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed top-8 left-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 font-bold pointer-events-none">
            <CheckCircle size={20} />
            Settings Successfully Synced
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage global POS configuration, receipt branding, and local tax algorithms.</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave} className="glass-card overflow-hidden shadow-2xl border border-slate-200 dark:border-[#1e2538]">
        
        <div className="p-8 border-b border-slate-100 dark:border-[#1e2538] bg-slate-50/50 dark:bg-[#151b2b]/50">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3 mb-6">
            <Building2 size={24} className="text-indigo-500" />
            Establishment Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">Pharmacy Master Name</label>
              <input required type="text" name="pharmacyName" value={settings.pharmacyName || ''} onChange={handleChange} className="input-field py-3 text-lg font-bold" placeholder="MediManage Premium" />
              <p className="text-xs text-slate-500 pl-1 mt-1">This prints at the top of all thermal POS receipts.</p>
            </div>
            <div className="space-y-2">
               <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">Contact Terminal</label>
               <div className="relative">
                 <input required type="text" name="phone" value={settings.phone || ''} onChange={handleChange} className="input-field py-3 pl-12 font-medium" placeholder="(555) 123-4567" />
                 <PhoneCall size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-8">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">Registered Address</label>
            <textarea required name="address" value={settings.address || ''} onChange={handleChange} rows="3" className="input-field py-3 resize-none font-medium text-slate-700 dark:text-slate-300" placeholder="123 Health Ave, Medical District, NY 10001"></textarea>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-[#0b0f19]">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3 mb-6">
            <Landmark size={24} className="text-primary-500" />
            Financial Engines
          </h2>

          <div className="max-w-md space-y-2">
             <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">Default Platform Tax Rate (%)</label>
             <div className="flex items-center gap-4">
               <input required type="number" step="0.01" min="0" name="taxRate" value={settings.taxRate || ''} onChange={handleChange} className="input-field py-3 text-xl font-black text-primary-600 dark:text-primary-400 text-center w-32" placeholder="5.0" />
               <span className="text-sm font-medium text-slate-500">Applied dynamically per transaction inside the POS subsystem.</span>
             </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-[#151b2b] border-t border-slate-200 dark:border-[#1e2538] flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto px-10 py-4 text-lg font-extrabold shadow-primary-500/30 flex items-center justify-center gap-3 min-w-[200px] transition-all duration-300">
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
            {saving ? 'Syncing...' : 'Save Global Config'}
          </button>
        </div>

      </motion.form>
    </div>
  );
};

export default Settings;
