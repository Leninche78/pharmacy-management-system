import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Users, Receipt, AlertCircle, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentSales: [],
    salesData: []
  });
  const [loading, setLoading] = useState(true);
  const [drillDownModal, setDrillDownModal] = useState({ isOpen: false, title: '', type: '', data: [], loading: false });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if(res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = async (type, title) => {
    setDrillDownModal({ ...drillDownModal, isOpen: true, title, type, loading: true, data: [] });
    try {
      let data = [];
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      if (type === 'products' || type === 'low-stock' || type === 'expiring') {
        const res = await axios.get('http://localhost:5000/api/products', { headers });
        if (type === 'low-stock') {
          data = res.data.filter(p => p.stock > 0 && p.stock < 20);
        } else if (type === 'expiring') {
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          data = res.data.filter(p => p.expiryDate && new Date(p.expiryDate) <= thirtyDays && p.stock > 0);
        } else {
          data = res.data;
        } 
      } else if (type === 'customers') {
        const res = await axios.get('http://localhost:5000/api/customers', { headers });
        data = res.data;
      } else if (type === 'orders' || type === 'revenue') {
        const res = await axios.get('http://localhost:5000/api/sales', { headers });
        data = res.data;
      }
      setDrillDownModal({ isOpen: true, title, type, data, loading: false });
    } catch (error) {
      console.error('Error fetching drill-down data:', error);
      setDrillDownModal(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} className="text-blue-500" />, bg: 'bg-blue-500/10', type: 'revenue' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <Receipt size={24} className="text-emerald-500" />, bg: 'bg-emerald-500/10', type: 'orders' },
    { title: 'Active Products', value: stats.totalProducts, icon: <Package size={24} className="text-purple-500" />, bg: 'bg-purple-500/10', type: 'products' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: <Users size={24} className="text-indigo-500" />, bg: 'bg-indigo-500/10', type: 'customers' },
    { title: 'Low Stock Alerts', value: stats.lowStockProducts, icon: <AlertCircle size={24} className="text-rose-500" />, bg: 'bg-rose-500/10', type: 'low-stock' },
    { title: 'Expiry Alerts (< 30d)', value: stats.expiringProducts || 0, icon: <AlertCircle size={24} className="text-amber-500" />, bg: 'bg-amber-500/10', type: 'expiring' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#0f1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Your pharmacy at a glance today.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => handleCardClick(stat.type, stat.title)}
            className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-primary-500/50 hover:shadow-lg transition-all shadow-sm"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors duration-500"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} backdrop-blur-md`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="text-emerald-500">+12%</span> from last month
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Revenue Trends</h2>
            <select className="bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 py-2 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 flex flex-col"
        >
           <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Transactions</h2>
           <div className="flex-1 overflow-y-auto pr-2 space-y-4">
             {stats.recentSales.length > 0 ? (
               stats.recentSales.map((sale, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1) }}
                    key={sale.id} 
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"
                  >
                   <div className="flex items-center gap-4">
                     <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
                       <Receipt size={18} />
                     </div>
                     <div>
                       <p className="font-bold text-slate-800 dark:text-slate-200">Order #{sale.id}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{new Date(sale.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-slate-800 dark:text-white">₹{Number(sale.totalAmount).toLocaleString()}</p>
                     <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold uppercase tracking-wider">
                       {sale.paymentMethod}
                     </span>
                   </div>
                 </motion.div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                 <Receipt size={32} className="opacity-20" />
                 <p>No recent activity</p>
               </div>
             )}
           </div>
           
           <button onClick={() => window.location.href = '/reports'} className="w-full mt-4 py-3 text-sm font-semibold text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
             View All Transactions →
           </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {drillDownModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-2xl flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1e2538] flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19]">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                  {drillDownModal.title} Metrics View
                </h2>
                <button onClick={() => setDrillDownModal({ ...drillDownModal, isOpen: false })} className="text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-[#151b2b] p-2 rounded-xl border border-slate-200 dark:border-[#1e2538]"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto bg-white dark:bg-[#0b0f19] flex-1">
                {drillDownModal.loading ? (
                  <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div></div>
                ) : drillDownModal.data.length === 0 ? (
                  <div className="text-center py-20 text-slate-500"><p className="text-lg font-medium">No records found for {drillDownModal.title.toLowerCase()}.</p></div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#1e2538]">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#151b2b] border-b border-slate-200 dark:border-[#1e2538] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                          {['products', 'low-stock', 'expiring'].includes(drillDownModal.type) && (
                            <><th className="py-4 px-6 font-bold">Medicine</th><th className="py-4 px-6 font-bold">Category</th><th className="py-4 px-6 font-bold text-center">Stock Level</th><th className="py-4 px-6 font-bold text-right">{drillDownModal.type === 'expiring' ? 'Expiry Date' : 'Price'}</th></>
                          )}
                          {(drillDownModal.type === 'customers') && (
                            <><th className="py-4 px-6 font-bold">Patient Name</th><th className="py-4 px-6 font-bold">Contact Number</th><th className="py-4 px-6 font-bold">Email Address</th><th className="py-4 px-6 font-bold text-center">Total Scripts</th></>
                          )}
                          {(drillDownModal.type === 'orders' || drillDownModal.type === 'revenue') && (
                            <><th className="py-4 px-6 font-bold">Order ID</th><th className="py-4 px-6 font-bold">Date & Time</th><th className="py-4 px-6 font-bold">Payment Method</th><th className="py-4 px-6 font-bold text-right">Total Amount</th></>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1e2538]">
                        {drillDownModal.data.map((row, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-[#1e2538]/30 transition-colors">
                             {['products', 'low-stock', 'expiring'].includes(drillDownModal.type) && (
                               <><td className="py-4 px-6 font-bold text-slate-800 dark:text-white">{row.name} <span className="text-xs text-slate-400 block font-normal">{row.sku}</span></td><td className="py-4 px-6 text-sm">{row.category || 'General'}</td><td className="py-4 px-6 text-center"><span className={`font-extrabold px-3 py-1 rounded-full text-xs ${row.stock < 20 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'}`}>{row.stock} Units</span></td><td className={`py-4 px-6 text-right font-bold ${drillDownModal.type === 'expiring' ? 'text-amber-600' : 'text-primary-600'}`}>{drillDownModal.type === 'expiring' ? (row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A') : `₹${Number(row.price).toFixed(2)}`}</td></>
                             )}
                             {(drillDownModal.type === 'customers') && (
                               <><td className="py-4 px-6 font-bold text-slate-800 dark:text-white">{row.name} <span className="text-xs text-slate-400 block font-normal">ID #{row.id}</span></td><td className="py-4 px-6 text-sm tracking-wider">{row.phone || 'N/A'}</td><td className="py-4 px-6 text-sm">{row.email || 'N/A'}</td><td className="py-4 px-6 text-center"><span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-bold">{row.Prescriptions?.length || 0}</span></td></>
                             )}
                             {(drillDownModal.type === 'orders' || drillDownModal.type === 'revenue') && (
                               <><td className="py-4 px-6 font-bold text-slate-800 dark:text-white">ORD-{row.id}</td><td className="py-4 px-6 text-sm">{new Date(row.createdAt).toLocaleString()}</td><td className="py-4 px-6 text-sm"><span className="uppercase text-xs font-bold tracking-wider">{row.paymentMethod}</span></td><td className="py-4 px-6 text-right font-extrabold text-emerald-600 dark:text-emerald-400">₹{Number(row.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td></>
                             )}
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
