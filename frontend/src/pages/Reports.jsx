import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { TrendingUp, ShoppingBag, CreditCard, Calendar as CalendarIcon, FileBarChart } from 'lucide-react';


const Reports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/sales', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  const totalTransactions = sales.length;
  const averageValue = totalTransactions ? totalRevenue / totalTransactions : 0;

  const productSales = {};
  sales.forEach(sale => {
    sale.SaleItems?.forEach(item => {
      const pName = item.Product?.name || 'Unknown Product';
      if (!productSales[pName]) productSales[pName] = { quantity: 0, revenue: 0 };
      productSales[pName].quantity += item.quantity;
      productSales[pName].revenue += parseFloat(item.subtotal);
    });
  });

  const bestSellingProducts = Object.entries(productSales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  const maxQuantity = Math.max(...bestSellingProducts.map(p => p[1].quantity), 1);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sales & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Detailed transactional data and performance.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-primary-500/30">
          <FileBarChart size={20} />
          Export Report
        </button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="glass-card p-6 flex items-center gap-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl relative z-10"><TrendingUp size={28} /></div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">₹{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 flex items-center gap-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-500/0 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl relative z-10"><ShoppingBag size={28} /></div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transactions</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{totalTransactions.toLocaleString()}</h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 flex items-center gap-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-500/0 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors"></div>
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl relative z-10"><CreditCard size={28} /></div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Order Value</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">₹{averageValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="glass-card p-8">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                <ShoppingBag size={24} className="text-primary-500" />
                Best Selling Items
              </h2>
              {bestSellingProducts.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 italic py-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">No sales data available.</div>
              ) : (
                <div className="space-y-6">
                  {bestSellingProducts.map(([name, data]) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{name}</span>
                        <span className="font-medium text-slate-500 dark:text-slate-400"><span className="text-primary-600 dark:text-primary-400">{data.quantity} units</span> (₹{data.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#0b0f19] rounded-full h-3 overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.quantity / maxQuantity) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.3)]"
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col h-full">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                <CalendarIcon size={24} className="text-primary-500" />
                Transaction Log
              </h2>
              <div className="overflow-auto flex-1 h-[300px] pr-2 scrollbar-thin">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white/90 dark:bg-[#151b2b]/95 backdrop-blur-md z-10">
                    <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#1e2538]">
                      <th className="py-3 px-2">Timestamp</th>
                      <th className="py-3 px-2">Volume</th>
                      <th className="py-3 px-2 text-right">Gross</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1e2538]">
                    {sales.map((sale, i) => (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={sale.id} className="hover:bg-slate-50 dark:hover:bg-[#1e2538]/30 transition-colors group">
                        <td className="py-4 px-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {new Date(sale.createdAt).toLocaleDateString()} <span className="text-slate-400 dark:text-slate-500 ml-1">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="py-4 px-2 text-sm">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#0b0f19] text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-[#1e2538] font-bold">
                            {sale.SaleItems?.reduce((sum, item) => sum + item.quantity, 0)} items
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="font-extrabold text-primary-600 dark:text-primary-400">₹{parseFloat(sale.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                      </motion.tr>
                    ))}
                    {sales.length === 0 && (
                      <tr><td colSpan="3" className="py-12 text-center text-slate-500 italic">No historical transactions logged</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
