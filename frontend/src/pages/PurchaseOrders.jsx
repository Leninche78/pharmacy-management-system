import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Plus, ShoppingCart } from 'lucide-react';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error('Error fetching POs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-primary-500" /> Purchase Orders
          </h1>
          <p className="text-slate-500 mt-1">Manage stock ordering and receiving</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all">
          <Plus size={20} />
          <span>Create PO</span>
        </button>
      </div>

      {/* Table Placeholder */}
      <div className="bg-white dark:bg-[#151b2b] rounded-2xl shadow-sm border border-slate-200 dark:border-[#1e2538] overflow-hidden">
        <div className="p-8 text-center text-slate-500">
          {loading ? 'Loading records...' : `Purchase Orders module under construction. (${purchaseOrders.length} records found)`}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
