import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Barcode from 'react-barcode';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptData, setReceiptData] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  
  const [substituteModal, setSubstituteModal] = useState({ isOpen: false, originalProduct: null, substitutes: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes, settingsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('http://localhost:5000/api/customers', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('http://localhost:5000/api/settings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        setProducts(productsRes.data);
        setCustomers(customersRes.data);
        setGlobalSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching POS data', error);
      }
    };
    fetchData();
  }, []);

  const addToCart = useCallback((product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) return alert('Cannot exceed available stock');
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice } : item));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, unitPrice: product.price, quantity: 1, subtotal: Number(product.price), gstRate: product.gstRate || 0 }]);
    }
  }, [cart]);

  const handleProductClick = useCallback((product) => {
    if (product.stock > 0) {
      addToCart(product);
    } else {
      if (product.genericName) {
        const subs = products.filter(p => p.genericName?.toLowerCase() === product.genericName?.toLowerCase() && p.id !== product.id && p.stock > 0);
        if (subs.length > 0) {
          setSubstituteModal({ isOpen: true, originalProduct: product, substitutes: subs });
          return;
        }
      }
      alert(`Out of stock and no generic substitutes found.`);
    }
  }, [products, addToCart]);

  useEffect(() => {
    let buffer = '';
    let lastTime = Date.now();
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const currentTime = Date.now();
      if (currentTime - lastTime > 100) buffer = '';
      lastTime = currentTime;
      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          e.preventDefault();
          const p = products.find(prod => prod.sku && prod.sku.toLowerCase() === buffer.toLowerCase());
          if (p) handleProductClick(p);
          buffer = '';
        }
      } else if (e.key.length === 1) buffer += e.key;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cart, handleProductClick]);

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(search.toLowerCase()) || (product.sku && product.sku.toLowerCase().includes(search.toLowerCase())));

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) return item;
        if (newQuantity > product.stock) { alert('Cannot exceed available stock'); return item; }
        return { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => setCart(cart.filter(item => item.productId !== productId));

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = cart.reduce((sum, item) => sum + (item.subtotal * (item.gstRate / 100)), 0);
  const finalAmount = Math.max(0, totalAmount + taxAmount - redeemPoints);
  const selectedCustomerObj = customers.find(c => c.id.toString() === selectedCustomerId);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const payload = await axios.post('http://localhost:5000/api/sales', {
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice })),
        totalAmount, paymentMethod, customerId: selectedCustomerId || null, redeemPoints: Number(redeemPoints) || 0
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      
      const response = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProducts(response.data);

      setReceiptData({
        saleId: payload.data.saleId,
        date: new Date().toLocaleString(),
        items: [...cart], subtotal: totalAmount, taxAmount, discount: Number(redeemPoints) || 0,
        total: finalAmount, paymentMethod, customerName: selectedCustomerObj ? selectedCustomerObj.name : 'Guest',
        earnedPoints: Math.floor(finalAmount / 100)
      });
      
      setCart([]); setSelectedCustomerId(''); setRedeemPoints(0);
      const custResp = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setCustomers(custResp.data);
    } catch (error) {
      console.error('Checkout error', error);
      alert('Error processing sale');
    } finally {
      setLoading(false);
    }
  };

  if (receiptData) {
    return (
      <div className="flex h-[calc(100vh)] items-start justify-center p-8 bg-slate-50 dark:bg-[#0f1117] overflow-y-auto relative">
        <div className="flex gap-8 w-full max-w-4xl flex-col md:flex-row items-start justify-center pt-10 pb-20">
          
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-10 w-full max-w-sm flex flex-col items-center no-print shadow-xl relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Receipt size={36} />
            </div>
            <h2 className="text-2xl font-extrabold dark:text-white mb-2 text-center">Payment Successful</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Sale #{receiptData.saleId} properly recorded.</p>
            <div className="w-full flex flex-col gap-3">
              <button onClick={() => window.print()} className="btn-primary !bg-indigo-600 hover:!bg-indigo-700 shadow-indigo-500/30 flex items-center justify-center gap-2 py-4 text-lg w-full">
                <Receipt size={20}/> Print Receipt
              </button>
              <button onClick={() => setReceiptData(null)} className="btn-secondary w-full py-4 text-lg">New Transaction</button>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white text-slate-900 p-8 w-[350px] mx-auto shadow-2xl shrink-0 print:shadow-none print:w-full print:max-w-xs print:p-2 border border-slate-200" id="print-area">
             <div className="text-center border-b-2 border-dashed border-slate-300 pb-5 mb-5">
               <h1 className="font-black text-3xl uppercase tracking-tighter text-slate-900 leading-none mb-1">{globalSettings?.pharmacyName || 'MediManage'}</h1>
               <p className="text-[11px] font-bold uppercase text-slate-500 tracking-widest leading-relaxed">Premium Pharmacy</p>
               <p className="text-[11px] font-semibold pt-3 text-slate-600">{globalSettings?.address || '123 Health Ave'}</p>
               <p className="text-[11px] font-semibold text-slate-600">Tel: {globalSettings?.phone || '(555) 123-4567'}</p>
             </div>
             
             <div className="text-[11px] mb-5 space-y-1.5 font-mono text-slate-700">
               <div className="flex justify-between"><span>Receipt #:</span><span className="font-bold">{receiptData.saleId}</span></div>
               <div className="flex justify-between"><span>Date:</span><span>{receiptData.date}</span></div>
               <div className="flex justify-between"><span>Counter:</span><span>Admin</span></div>
               <div className="flex justify-between"><span>Patient:</span><span className="font-bold truncate max-w-[120px] text-right">{receiptData.customerName}</span></div>
             </div>

             <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 font-mono text-[11px]">
               <div className="flex justify-between font-bold border-b border-slate-300 pb-1.5 mb-2 text-slate-900 uppercase">
                 <span className="w-1/2">Item</span><span className="w-1/4 text-center">Qty</span><span className="w-1/4 text-right">Total</span>
               </div>
               {receiptData.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between mb-1.5 text-slate-700 font-medium">
                   <span className="w-1/2 truncate pr-2 uppercase">{item.name}</span>
                   <span className="w-1/4 text-center">{item.quantity}</span>
                   <span className="w-1/4 text-right">{item.subtotal.toFixed(2)}</span>
                 </div>
               ))}
             </div>

             <div className="font-mono text-xs space-y-1.5 border-b-2 border-dashed border-slate-300 pb-5 mb-5 text-slate-700">
               <div className="flex justify-between font-semibold"><span>Subtotal:</span><span>{receiptData.subtotal.toFixed(2)}</span></div>
               {receiptData.taxAmount > 0 && (
                 <>
                   <div className="flex justify-between font-semibold"><span>CGST:</span><span>{(receiptData.taxAmount / 2).toFixed(2)}</span></div>
                   <div className="flex justify-between font-semibold"><span>SGST:</span><span>{(receiptData.taxAmount / 2).toFixed(2)}</span></div>
                 </>
               )}
               {receiptData.discount > 0 && <div className="flex justify-between font-bold text-slate-900"><span>Loyalty Discount:</span><span>-{receiptData.discount.toFixed(2)}</span></div>}
               <div className="flex justify-between font-black text-xl mt-3 pt-3 border-t border-slate-300 text-slate-900"><span>TOTAL:</span><span>₹{receiptData.total.toFixed(2)}</span></div>
               <div className="flex justify-between text-[10px] mt-3 uppercase font-bold text-slate-500"><span>Paid via:</span><span>{receiptData.paymentMethod}</span></div>
               {receiptData.earnedPoints > 0 && <div className="flex justify-between text-[10px] mt-1 uppercase font-bold text-emerald-600"><span>Points Earned:</span><span>+{receiptData.earnedPoints}</span></div>}
             </div>

             <div className="flex flex-col items-center justify-center mt-6 -ml-5 scale-90 origin-top">
               <Barcode value={`POS-${receiptData.saleId.toString().padStart(6, '0')}`} width={1.5} height={45} fontSize={12} margin={0} displayValue={true} background="transparent" />
             </div>
             <p className="text-center text-[9px] font-extrabold mt-6 uppercase tracking-widest text-slate-500">Thank you for your business</p>
             <p className="text-center text-[9px] font-medium mt-1 text-slate-400">Please retain receipt for returns</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh)] bg-slate-50 dark:bg-[#0f1117] p-6 gap-6 overflow-hidden">
      
      <div className="flex-1 flex flex-col gap-6">
        {/* Search Header */}
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search catalog by name, brand, or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-[#0b0f19] border border-transparent dark:border-[#1e2538] rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto rounded-2xl p-1 pr-3">
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredProducts.map(product => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} layout
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  className={`glass-card p-4 flex flex-col justify-between transition-all group overflow-hidden relative ${product.stock > 0 ? 'hover:border-primary-500/50 hover:shadow-lg cursor-pointer' : 'opacity-70 grayscale cursor-not-allowed'}`}
                >
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
                  <div>
                    <h3 className={`font-bold text-lg dark:text-white line-clamp-2 leading-tight ${product.stock > 0 ? '' : 'line-through'}`}>{product.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 truncate uppercase tracking-wider font-semibold">{product.genericName || 'Standard'}</p>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Price</span>
                      <span className="font-extrabold text-xl text-primary-600 dark:text-primary-400">₹{Number(product.price).toFixed(2)}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${product.stock > 0 ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-rose-500/10 text-rose-500'}`}>
                      {product.stock} left
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredProducts.length === 0 && <div className="text-center py-20 text-slate-500 text-lg">No products found.</div>}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[420px] glass-card flex flex-col overflow-hidden relative z-10">
        <div className="p-6 border-b border-slate-200 dark:border-[#1e2538] flex items-center justify-between bg-white dark:bg-[#151b2b]">
          <h2 className="font-ex`trabold text-xl dark:text-white flex items-center gap-3">
            <ShoppingCart size={24} className="text-primary-500" /> Current Order
          </h2>
          <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">{cart.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-[#0b0f19]/30">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                 <ShoppingCart size={48} className="opacity-20" />
                 <p className="font-medium text-lg">Scan or select items</p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, scale: 0.9 }} key={item.productId} 
                  className="bg-white dark:bg-[#151b2b] p-4 rounded-2xl border border-slate-200 dark:border-[#1e2538] shadow-sm flex flex-col gap-3 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start pr-8">
                     <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{item.name}</span>
                     <button onClick={() => removeFromCart(item.productId)} className="absolute right-4 top-4 text-slate-400 hover:text-rose-500 bg-rose-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                       <Trash2 size={14} />
                     </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-primary-600 dark:text-primary-400 font-extrabold">₹{item.unitPrice.toFixed(2)}</span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0b0f19] rounded-xl p-1 border border-slate-200 dark:border-[#1e2538]">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 hover:bg-white dark:hover:bg-[#151b2b] rounded-lg text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 hover:bg-white dark:hover:bg-[#151b2b] rounded-lg text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><Plus size={14} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white dark:bg-[#151b2b] border-t border-slate-200 dark:border-[#1e2538] flex flex-col gap-4">
          <div className="space-y-2 mb-2">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
               <span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm font-medium">
                 <span>GST (Calculated)</span><span>₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            {redeemPoints > 0 && (
              <div className="flex justify-between text-emerald-500 text-sm font-bold">
                 <span>Points Discount</span><span>-₹{redeemPoints}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-[#1e2538]">
               <span className="font-bold text-slate-800 dark:text-slate-200">Total</span>
               <span className="font-black text-3xl text-primary-600 dark:text-primary-400">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <select value={selectedCustomerId} onChange={(e) => { setSelectedCustomerId(e.target.value); setRedeemPoints(0); }} className="input-field py-2.5">
             <option value="">Guest Walk-in</option>
             {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
          </select>

          {selectedCustomerObj && (
             <div className="bg-primary-500/10 border border-primary-500/20 p-3 rounded-xl">
               <div className="flex justify-between text-primary-700 dark:text-primary-300 font-bold text-sm mb-2">
                 <span>Available Points:</span><span>{selectedCustomerObj.loyaltyPoints}</span>
               </div>
               <div className="flex items-center gap-3">
                 <input type="number" min="0" max={Math.min(selectedCustomerObj.loyaltyPoints, totalAmount)} value={redeemPoints} onChange={(e) => setRedeemPoints(Math.max(0, Math.min(Number(e.target.value), selectedCustomerObj.loyaltyPoints, totalAmount)))} className="input-field w-24 py-1.5 px-3 text-center" />
                 <span className="text-xs font-semibold text-primary-600/70 dark:text-primary-400/70 uppercase">Redeem (1pt = ₹1)</span>
               </div>
             </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-2">
            <button onClick={() => setPaymentMethod('cash')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'cash' ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-transparent bg-slate-100 dark:bg-[#0b0f19] text-slate-500 hover:bg-slate-200 dark:hover:bg-[#1e2538]'}`}>
              <Banknote size={18} /> Cash
            </button>
            <button onClick={() => setPaymentMethod('card')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-transparent bg-slate-100 dark:bg-[#0b0f19] text-slate-500 hover:bg-slate-200 dark:hover:bg-[#1e2538]'}`}>
              <CreditCard size={18} /> Card
            </button>
            <button onClick={() => setPaymentMethod('upi')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'upi' ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-transparent bg-slate-100 dark:bg-[#0b0f19] text-slate-500 hover:bg-slate-200 dark:hover:bg-[#1e2538]'}`}>
              <Smartphone size={18} /> UPI
            </button>
          </div>

          <button disabled={cart.length === 0 || loading} onClick={handleCheckout} className="btn-primary w-full py-4 text-lg mt-2 shadow-primary-500/30 group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Processing...' : 'Charge ₹' + finalAmount.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {substituteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#151b2b] rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-[#1e2538] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#1e2538] bg-rose-50 dark:bg-rose-500/10 flex justify-between items-center">
              <div>
                <h2 className="font-extrabold text-rose-600 dark:text-rose-400 text-lg">Out of Stock</h2>
                <p className="text-sm text-rose-500/80 dark:text-rose-400/80 font-medium mt-1">"{substituteModal.originalProduct?.name}" is not available.</p>
              </div>
              <button onClick={() => setSubstituteModal({ isOpen: false, originalProduct: null, substitutes: [] })} className="text-rose-400 hover:text-rose-600 bg-white dark:bg-[#0b0f19] p-2 rounded-xl shadow-sm transition-colors cursor-pointer">&times;</button>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Suggested Alternatives</h3>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {substituteModal.substitutes.map(sub => (
                  <div key={sub.id} className="border border-primary-500/20 bg-primary-500/5 rounded-xl p-4 flex items-center justify-between group hover:border-primary-500/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{sub.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{sub.genericName}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm font-bold">
                        <span className="text-primary-600 dark:text-primary-400">₹{Number(sub.price).toFixed(2)}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-500 dark:text-slate-400">{sub.stock} left</span>
                      </div>
                    </div>
                    <button onClick={() => { addToCart(sub); setSubstituteModal({ isOpen: false, originalProduct: null, substitutes: [] }); }} className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-xl shadow-md transition-colors shadow-primary-500/20">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default POS;
