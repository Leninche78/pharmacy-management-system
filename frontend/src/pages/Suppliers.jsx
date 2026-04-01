import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Plus, Truck } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="text-primary-500" /> Suppliers
          </h1>
          <p className="text-slate-500 mt-1">Manage your pharmaceutical suppliers</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all">
          <Plus size={20} />
          <span>Add Supplier</span>
        </button>
      </div>
      
      {/* Table Placeholder */}
      <div className="bg-white dark:bg-[#151b2b] rounded-2xl shadow-sm border border-slate-200 dark:border-[#1e2538] overflow-hidden">
        <div className="p-8 text-center text-slate-500">
           {loading ? 'Loading records...' : `Suppliers module under construction. (${suppliers.length} records found)`}
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
