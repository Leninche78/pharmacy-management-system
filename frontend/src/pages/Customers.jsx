import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Phone, Mail, MapPin, Users, User, ArrowRight, FileBarChart, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const exportToCSV = () => {
    if (filteredCustomers.length === 0) return alert('No data to export');
    const headers = ['ID', 'Patient Name', 'Phone', 'Email', 'Address'];
    const csv = [
      headers.join(','),
      ...filteredCustomers.map(c => [
        c.id, c.name, c.phone || '', c.email || '', c.address || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[0-9]{10}$/;
    if (newCustomer.phone && !phoneRegex.test(newCustomer.phone)) {
      alert('Contact number must be exactly 10 digits.');
      return;
    }
    setSubmitLoading(true);
    try {
      await axios.post('http://localhost:5000/api/customers', newCustomer, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsModalOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer', error);
      alert('Failed to create customer');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCustomer = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to completely erase this patient record? This action cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCustomers();
      if (viewingCustomer && viewingCustomer.id === id) setViewingCustomer(null);
    } catch (error) {
      console.error('Error deleting customer', error);
      alert('Failed to delete customer record.');
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage registered customers and prescription histories.</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2538] dark:hover:bg-[#2a3441] text-slate-800 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm border border-slate-200 dark:border-transparent"
          >
            <Download size={20} /> Export CSV
          </motion.button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 shadow-primary-500/30">
            <Plus size={20} /> New Patient
          </button>
        </div>
      </motion.div>
    
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e2538] flex items-center gap-4 bg-white/50 dark:bg-[#151b2b]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search patients by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-12 py-2.5 bg-slate-50 dark:bg-[#0b0f19] border-transparent dark:border-[#1e2538]" />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
             <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
             </div>
          ) : filteredCustomers.length === 0 ? (
             <div className="py-16 text-center text-slate-500 flex flex-col items-center">
               <div className="bg-slate-100 dark:bg-[#1e2538] p-4 rounded-full mb-4 text-slate-400"><Users size={32} /></div>
               <p className="text-lg font-medium">No patient records found.</p>
             </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map(customer => (
                <motion.div variants={itemVariants} key={customer.id} onClick={() => setViewingCustomer(customer)} className="glass-card hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer transition-all p-0 group overflow-hidden">
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-5 relative">
                       <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 text-primary-600 dark:text-primary-400 font-extrabold text-2xl flex items-center justify-center border border-primary-500/20">
                          {customer.name.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <h3 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pr-6">{customer.name}</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">ID #{customer.id}</p>
                       </div>
                       <button 
                         onClick={(e) => handleDeleteCustomer(customer.id, e)} 
                         className="absolute right-0 top-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                         title="Delete Patient"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 font-medium font-sans">
                      <div className="flex items-center gap-3"><div className="w-8 flex justify-center text-slate-400 group-hover:text-primary-500 transition-colors"><Phone size={16} /></div>{customer.phone || 'No phone'}</div>
                      <div className="flex items-center gap-3"><div className="w-8 flex justify-center text-slate-400 group-hover:text-primary-500 transition-colors"><Mail size={16} /></div>{customer.email || 'No email'}</div>
                      <div className="flex items-start gap-3"><div className="w-8 flex justify-center text-slate-400 group-hover:text-primary-500 transition-colors mt-0.5"><MapPin size={16} /></div><span className="truncate">{customer.address || 'No address'}</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#151b2b] p-4 flex justify-between items-center border-t border-slate-100 dark:border-[#1e2538] group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 transition-colors">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1 bg-white dark:bg-[#0b0f19] rounded-lg shadow-sm">
                      {customer.Prescriptions?.length || 0} Scripts
                    </span>
                    <ArrowRight size={18} className="text-primary-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold" />
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-2xl">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-[#1e2538] flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19]">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">New Patient Profile</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-2xl transition-colors">&times;</button>
              </div>
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Full Name *</label>
                  <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="input-field placeholder:opacity-50" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Mobile (10 Digits) *</label>
                  <input required type="tel" pattern="[0-9]{10}" maxLength="10" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value.replace(/\D/g, '')})} className="input-field font-bold tracking-widest text-primary-600" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Email</label>
                  <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="input-field placeholder:opacity-50" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Home Address</label>
                  <textarea value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="input-field placeholder:opacity-50 resize-none" placeholder="Apt / Street / City" rows="2"></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-[#1e2538] pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary w-full">Cancel</button>
                  <button type="submit" disabled={submitLoading} className="btn-primary w-full shadow-primary-500/30">{submitLoading ? 'Registering...' : 'Register Patient'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Profile Modal */}
      <AnimatePresence>
        {viewingCustomer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-2xl font-extrabold flex items-center gap-4 relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner backdrop-blur-md">
                    {viewingCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  {viewingCustomer.name}
                </h2>
                <button onClick={() => setViewingCustomer(null)} className="text-indigo-200 hover:text-white font-bold text-3xl transition-colors relative z-10">&times;</button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 bg-white dark:bg-[#0b0f19]">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest">Contact Identity</h3>
                    <div className="bg-slate-50 dark:bg-[#151b2b] rounded-2xl p-5 space-y-4 border border-slate-100 dark:border-[#1e2538]">
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300"><div className="p-2.5 bg-white dark:bg-[#0b0f19] rounded-xl shadow-sm text-indigo-500"><Phone size={18} /></div> {viewingCustomer.phone || 'N/A'}</div>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300"><div className="p-2.5 bg-white dark:bg-[#0b0f19] rounded-xl shadow-sm text-indigo-500"><Mail size={18} /></div> {viewingCustomer.email || 'N/A'}</div>
                      <div className="flex items-start gap-4 text-sm font-medium text-slate-700 dark:text-slate-300"><div className="p-2.5 bg-white dark:bg-[#0b0f19] rounded-xl shadow-sm text-indigo-500"><MapPin size={18} /></div> <span className="mt-1">{viewingCustomer.address || 'N/A'}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest">Framework Registry</h3>
                    <div className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-2xl p-5 space-y-4 border border-teal-500/10">
                      <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Record ID</span><span className="font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#151b2b] px-3 py-1 rounded-lg">#{viewingCustomer.id}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Joined On</span><span className="font-bold text-slate-700 dark:text-slate-300">{new Date(viewingCustomer.createdAt).toLocaleDateString()}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Scripts</span><span className="font-extrabold text-teal-600 dark:text-teal-400">{viewingCustomer.Prescriptions?.length || 0}</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Prescription Vault</h3>
                  {viewingCustomer.Prescriptions && viewingCustomer.Prescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {viewingCustomer.Prescriptions.map(pres => (
                        <div key={pres.id} className="p-5 rounded-2xl border border-slate-200 dark:border-[#1e2538] hover:border-indigo-500/30 transition-colors bg-slate-50 dark:bg-[#151b2b]">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">Dr. {pres.doctorName}</h4>
                            <span className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                              {new Date(pres.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm bg-white dark:bg-[#0b0f19] p-4 rounded-xl shadow-inner font-medium leading-relaxed">
                            {pres.medicinesDetails || pres.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-[#151b2b] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <FileBarChart size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No medical prescriptions on record for this patient.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
