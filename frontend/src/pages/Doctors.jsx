import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Plus, Stethoscope } from 'lucide-react';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="text-primary-500" /> Doctors Registry
          </h1>
          <p className="text-slate-500 mt-1">Manage prescribers, clinics, and performance</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-primary-500/30">
          <Plus size={20} />
          <span>Add Doctor</span>
        </button>
      </div>
      
      {/* Table Placeholder */}
      <div className="bg-white dark:bg-[#151b2b] rounded-2xl shadow-sm border border-slate-200 dark:border-[#1e2538] overflow-hidden">
        <div className="p-8 text-center text-slate-500">
          {loading ? 'Loading records...' : `Doctors module under construction. (${doctors.length} records found)`}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
