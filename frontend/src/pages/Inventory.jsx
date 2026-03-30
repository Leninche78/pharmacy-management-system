import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, PackageSearch, Barcode as BarcodeIcon, Printer, BrainCircuit, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Barcode from 'react-barcode';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterParam = queryParams.get('filter');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({ name: '', genericName: '', sku: '', category: '', price: '', stock: '', expiryDate: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeBarcodeProduct, setActiveBarcodeProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [addStockAmount, setAddStockAmount] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{"role":"admin"}');
  const isAdmin = currentUser.role === 'admin';
  const canModify = currentUser.role === 'admin' || currentUser.role === 'pharmacist';

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // In a real scenario we use the token, here we allow it without token fallback for demo
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get('http://localhost:5000/api/products', { headers });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product', error);
        alert(error.response?.data?.message || 'Failed to delete medicine');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      genericName: product.genericName || '',
      sku: product.sku || '',
      category: product.category || '',
      price: product.price,
      stock: product.stock,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const openBarcodeModal = (product) => {
    setActiveBarcodeProduct(product);
    setIsBarcodeModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        ...newProduct,
        sku: (newProduct.sku || '').trim() || `SKU-${Date.now()}`,
        expiryDate: newProduct.expiryDate || null,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10)
      };

      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/products', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product', error);
      alert(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!addStockAmount || isNaN(addStockAmount) || Number(addStockAmount) <= 0) return;
    setSubmitLoading(true);
    try {
      const payload = {
        ...stockProduct,
        stock: stockProduct.stock + parseInt(addStockAmount, 10)
      };
      await axios.put(`http://localhost:5000/api/products/${stockProduct.id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsStockModalOpen(false);
      setAddStockAmount('');
      fetchProducts();
    } catch (error) {
      console.error('Error adding stock', error);
      alert('Failed to add stock');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(search.toLowerCase())) ||
    (product.genericName && product.genericName.toLowerCase().includes(search.toLowerCase()));

    if (filterParam === 'low-stock') {
      return matchesSearch && product.stock > 0 && product.stock < 20;
    }
    return matchesSearch;
  });

  const exportToCSV = () => {
    if (filteredProducts.length === 0) return alert('No data to export');
    const headers = ['ID', 'Medicine Name', 'SKU', 'Generic Name', 'Category', 'Manufacturer', 'Price (INR)', 'Stock Level', 'Expiry Date'];
    const csv = [
      headers.join(','),
      ...filteredProducts.map(p => [
        p.id, p.name, p.sku, p.genericName || '', p.category, p.manufacturer, p.price, p.stock, p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // AI Insights logic
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const criticalItems = products.filter(p => p.stock < 10);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20 overflow-x-hidden">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {filterParam === 'low-stock' ? 'Low Stock Alerts' : 'Inventory Catalog'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {filterParam === 'low-stock' ? 'These medicines need to be restocked soon.' : 'Manage medicines, pricing, and view barcode tags.'}
          </p>
        </div>
        {canModify && (
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2538] dark:hover:bg-[#2a3441] text-slate-800 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm border border-slate-200 dark:border-transparent"
            >
              <Download size={20} /> Export CSV
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({ name: '', genericName: '', sku: '', category: '', price: '', stock: '', expiryDate: '' });
                setIsEditModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 shadow-primary-500/30"
            >
              <Plus size={20} />
              Add Medicine
            </motion.button>
          </div>
        )}
      </motion.div>



      {/* Search & Table Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e2538] flex items-center gap-4 bg-white/50 dark:bg-[#151b2b]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, generic, or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12 py-2.5 bg-slate-50 dark:bg-[#0b0f19] border-transparent dark:border-[#1e2538]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0b0f19] border-b border-slate-200 dark:border-[#1e2538] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Product Details</th>
                <th className="py-4 px-6 font-bold">Category</th>
                <th className="py-4 px-6 font-bold">Pricing</th>
                <th className="py-4 px-6 font-bold">Stock Status</th>
                <th className="py-4 px-6 font-bold text-center">Barcode</th>
                {isAdmin && <th className="py-4 px-6 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e2538]">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center text-slate-500 font-medium">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-slate-100 dark:bg-[#1e2538] p-4 rounded-full text-slate-400"><PackageSearch size={32} /></div>
                      <p className="text-lg font-medium">No products match your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <motion.tr layout key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1e2538]/30 transition-colors group">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 dark:text-white text-base">{product.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate max-w-[200px]">{product.genericName || 'Standard'}</p>
                    </td>
                    <td className="py-4 px-6">
                       <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#1e2538] text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700">{product.category || 'General'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-primary-600 dark:text-primary-400">₹{Number(product.price).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 20 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        <span className={`font-bold ${product.stock > 20 ? 'text-slate-700 dark:text-slate-300' : product.stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {product.stock} Units
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => openBarcodeModal(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-xl transition-all shadow-sm">
                        <BarcodeIcon size={20} />
                      </button>
                    </td>
                    {canModify && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => { setStockProduct(product); setAddStockAmount(''); setIsStockModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 rounded-xl transition-all" title="Add Stock">
                          <Plus size={18} />
                        </button>
                        <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 rounded-xl transition-all" title="Edit Medicine">
                          <Edit2 size={18} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-lg overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1e2538] flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19]">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">{editingProduct ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-2xl transition-colors">&times;</button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Brand Name *</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="input-field" placeholder="e.g. Crocin Advance" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Generic Name</label>
                  <input type="text" value={newProduct.genericName} onChange={e => setNewProduct({...newProduct, genericName: e.target.value})} className="input-field" placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">SKU</label>
                    <input type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="input-field" placeholder="Auto-generated if empty" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Category</label>
                    <input type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="input-field" placeholder="Analgesics" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Price (₹) *</label>
                    <input required type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="input-field font-bold text-primary-600" placeholder="99.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Stock Quantity *</label>
                    <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="input-field font-bold" placeholder="100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Expiry Date</label>
                  <input type="date" value={newProduct.expiryDate} onChange={e => setNewProduct({...newProduct, expiryDate: e.target.value})} className="input-field" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-[#1e2538] mt-6 pt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary w-full">Cancel</button>
                  <button type="submit" disabled={submitLoading} className="btn-primary w-full shadow-primary-500/30">
                    {submitLoading ? 'Saving...' : (editingProduct ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Print Modal */}
      <AnimatePresence>
        {isBarcodeModalOpen && activeBarcodeProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-sm overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-2xl flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1e2538] flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19] no-print">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Product Barcode</h2>
                <button onClick={() => setIsBarcodeModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-2xl transition-colors">&times;</button>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center bg-white" id="print-area">
                 {/* Printable Tag Area */}
                 <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl flex flex-col items-center bg-white text-black text-center w-full relative">
                   <h3 className="font-extrabold text-lg uppercase tracking-wider leading-tight w-full truncate mb-1">{activeBarcodeProduct.name}</h3>
                   <p className="text-xs text-slate-500 uppercase font-semibold mb-4">{activeBarcodeProduct.genericName || 'Standard'}</p>
                   
                   <div className="w-full flex justify-center py-2 bg-white scale-125 my-2">
                     <Barcode value={activeBarcodeProduct.sku || activeBarcodeProduct.id.toString()} width={1.8} height={50} fontSize={14} background="#ffffff" lineColor="#000000" margin={0} />
                   </div>
                   
                   <div className="mt-4 flex justify-between w-full border-t border-slate-200 pt-3">
                     <span className="text-xs font-bold text-slate-500">Retail Price</span>
                     <span className="font-extrabold text-lg">₹{Number(activeBarcodeProduct.price).toFixed(2)}</span>
                   </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#0b0f19] flex gap-3 no-print">
                <button onClick={() => window.print()} className="btn-primary flex-1 shadow-indigo-500/30 !bg-indigo-600 hover:!bg-indigo-700 flex items-center justify-center gap-2">
                  <Printer size={18} /> Print Label
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add Stock Modal */}
      <AnimatePresence>
        {isStockModalOpen && stockProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-sm overflow-hidden border border-slate-200 dark:border-[#1e2538] shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1e2538] flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19]">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Quick Add Stock</h2>
                <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-2xl transition-colors">&times;</button>
              </div>
              <form onSubmit={handleAddStock} className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="truncate mr-2 border-r border-slate-200 dark:border-slate-700 pr-2">{stockProduct.name}</span>
                    <span className="whitespace-nowrap text-primary-500">Current: {stockProduct.stock}</span>
                  </p>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 mb-1">Stock Amount to Add *</label>
                  <input required autoFocus type="number" min="1" value={addStockAmount} onChange={e => setAddStockAmount(e.target.value)} className="input-field font-extrabold text-lg text-emerald-600" placeholder="e.g. 50" />
                </div>
                <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-[#1e2538] mt-6 pt-6">
                  <button type="button" onClick={() => setIsStockModalOpen(false)} className="btn-secondary w-full">Cancel</button>
                  <button type="submit" disabled={submitLoading} className="btn-primary w-full shadow-emerald-500/30 !bg-emerald-600 hover:!bg-emerald-700">
                    {submitLoading ? 'Updating Options...' : 'Add Stock'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Inventory;
