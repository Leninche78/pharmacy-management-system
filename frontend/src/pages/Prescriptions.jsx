import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, FileText, User, Calendar, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({ customerId: '', doctorName: '', issueDate: '', validUntil: '', notes: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [presRes, custRes] = await Promise.all([
        axios.get('http://localhost:5000/api/prescriptions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/customers', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setPrescriptions(presRes.data);
      setCustomers(custRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await axios.post('http://localhost:5000/api/prescriptions', newPrescription, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsModalOpen(false);
      setNewPrescription({ customerId: '', doctorName: '', issueDate: '', validUntil: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating prescription', error);
      alert(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.doctorName.toLowerCase().includes(search.toLowerCase()) || 
    (p.Customer && p.Customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Prescription Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Centralize and manage medical authorities.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 shadow-primary-500/30">
          <Plus size={20} /> Add Record
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e2538] flex items-center gap-4 bg-white/50 dark:bg-[#151b2b]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search by physician or patient..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-12 py-2.5 bg-slate-50 dark:bg-[#0b0f19] border-transparent dark:border-[#1e2538]" />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
             <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
             </div>
          ) : filteredPrescriptions.length === 0 ? (
             <div className="py-16 text-center text-slate-500 flex flex-col items-center">
               <div className="bg-slate-100 dark:bg-[#1e2538] p-4 rounded-full mb-4 text-slate-400"><FileText size={32} /></div>
               <p className="text-lg font-medium">No prescription logs match criteria.</p>
             </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrescriptions.map(pres => (
                <motion.div variants={itemVariants} key={pres.id} className="glass-card bg-gradient-to-br hover:from-slate-50 dark:hover:from-[#151b2b] hover:border-emerald-500/30 transition-all p-6 group">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">Dr. {pres.doctorName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider">RX #{pres.id}</p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#151b2b] p-3 rounded-xl border border-slate-100 dark:border-[#1e2538]">
                      <div className="text-primary-500"><User size={16} /></div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{pres.Customer ? pres.Customer.name : 'Unknown Patient'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {new Date(pres.issueDate).toLocaleDateString()}</div>
                      {pres.validUntil && <div className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-md font-bold">Expires: {new Date(pres.validUntil).toLocaleDateString()}</div>}
                    </div>

                    {pres.notes && (
                      <div className="mt-4 p-4 bg-primary-500/5 dark:bg-primary-900/10 rounded-xl border border-primary-500/10 text-sm italic font-medium text-slate-700 dark:text-slate-300 shadow-inner">
                        <span className="text-primary-500 block text-xs font-bold uppercase tracking-wider not-italic mb-1">Directives</span>
                        {pres.notes}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-lg overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-[#1e2538] flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19]">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2"><FileText size={20} className="text-primary-500" /> Log Prescription</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-2xl transition-colors">&times;</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="pres-form" onSubmit={handleCreatePrescription} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Target Patient *</label>
                    <div className="relative">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                       <select required value={newPrescription.customerId} onChange={e => setNewPrescription({...newPrescription, customerId: e.target.value})} className="input-field pl-10 appearance-none bg-white dark:bg-[#0b0f19]">
                         <option value="">-- Select Registry Patient --</option>
                         {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</option>)}
                       </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Physician Name *</label>
                    <input required type="text" value={newPrescription.doctorName} onChange={e => setNewPrescription({...newPrescription, doctorName: e.target.value})} className="input-field" placeholder="Dr. Gregory House" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Issue Date *</label>
                      <input required type="date" value={newPrescription.issueDate} onChange={e => setNewPrescription({...newPrescription, issueDate: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Expiry (Optional)</label>
                      <input type="date" value={newPrescription.validUntil} onChange={e => setNewPrescription({...newPrescription, validUntil: e.target.value})} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Medical Directives / Notes</label>
                    <textarea value={newPrescription.notes} onChange={e => setNewPrescription({...newPrescription, notes: e.target.value})} className="input-field resize-none" placeholder="10mg Amoxicillin daily for 7 days" rows="3"></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-5 border-t border-slate-100 dark:border-[#1e2538] bg-slate-50 dark:bg-[#0b0f19] flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary w-full md:w-auto">Discard</button>
                <button type="submit" form="pres-form" disabled={submitLoading} className="btn-primary w-full md:w-auto shadow-primary-500/30 min-w-[150px]">
                  {submitLoading ? 'Finalizing...' : 'Authorize'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Prescriptions;
