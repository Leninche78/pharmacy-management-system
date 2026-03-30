const { Product } = require('./models');

const basicMedicines = [
  // Analgesics & Pain Relief
  { name: 'Paracetamol 500mg', sku: 'MED-PCM-500', genericName: 'Acetaminophen', category: 'Analgesics', price: 20.00, stock: 500, description: 'Fever and pain relief' },
  { name: 'Ibuprofen 400mg', sku: 'MED-IBU-400', genericName: 'Ibuprofen', category: 'Analgesics', price: 25.00, stock: 400, description: 'Anti-inflammatory pain relief' },
  { name: 'Diclofenac Gel 30g', sku: 'MED-DIC-GEL', genericName: 'Diclofenac Sodium', category: 'Topical Analgesics', price: 85.00, stock: 120, description: 'Muscle and joint pain relief topical gel' },
  { name: 'Aspirin 81mg', sku: 'MED-ASP-81', genericName: 'Acetylsalicylic acid', category: 'Analgesics', price: 15.00, stock: 350, description: 'Low dose aspirin for heart health' },
  { name: 'Naproxen 250mg', sku: 'MED-NAP-250', genericName: 'Naproxen Sodium', category: 'Analgesics', price: 45.00, stock: 200, description: 'Long-lasting pain relief' },
  
  // Antihistamines & Cold
  { name: 'Cetirizine 10mg', sku: 'MED-CET-10', genericName: 'Cetirizine Hydrochloride', category: 'Antihistamines', price: 18.50, stock: 300, description: 'Allergy relief' },
  { name: 'Loratadine 10mg', sku: 'MED-LOR-10', genericName: 'Loratadine', category: 'Antihistamines', price: 22.00, stock: 280, description: 'Non-drowsy allergy relief' },
  { name: 'Cough Syrup 100ml', sku: 'MED-COUGH-100', genericName: 'Dextromethorphan', category: 'Cough & Cold', price: 95.00, stock: 180, description: 'Relief for dry and wet cough' },
  { name: 'Cold Rub 50g', sku: 'MED-VAP-50', genericName: 'Camphor, Menthol', category: 'Cough & Cold', price: 55.00, stock: 150, description: 'Fast relief from nasal congestion' },

  // Antacids & Digestion
  { name: 'Pantoprazole 40mg', sku: 'MED-PAN-40', genericName: 'Pantoprazole Sodium', category: 'Antacids', price: 45.00, stock: 250, description: 'Acidity and heartburn relief' },
  { name: 'Omeprazole 20mg', sku: 'MED-OME-20', genericName: 'Omeprazole', category: 'Antacids', price: 38.00, stock: 190, description: 'Acid reflux treatment' },
  { name: 'Domperidone 10mg', sku: 'MED-DOM-10', genericName: 'Domperidone', category: 'Antacids', price: 12.00, stock: 400, description: 'Anti-nausea medication' },
  { name: 'Digestive Enzymes', sku: 'MED-DIG-SYP', genericName: 'Fungal Diastase, Pepsin', category: 'Supplements', price: 110.00, stock: 8, description: 'Improves digestion and appetite (Low Stock!)' },

  // Antibiotics
  { name: 'Amoxicillin 500mg', sku: 'MED-AMX-500', genericName: 'Amoxicillin', category: 'Antibiotics', price: 65.00, stock: 150, description: 'Bacterial infection treatment' },
  { name: 'Azithromycin 500mg', sku: 'MED-AZI-500', genericName: 'Azithromycin', category: 'Antibiotics', price: 110.00, stock: 100, description: 'Macrolide antibiotic' },
  { name: 'Ciprofloxacin 500mg', sku: 'MED-CIP-500', genericName: 'Ciprofloxacin', category: 'Antibiotics', price: 80.00, stock: 90, description: 'Broad-spectrum antibiotic' },
  { name: 'Doxycycline 100mg', sku: 'MED-DOX-100', genericName: 'Doxycycline', category: 'Antibiotics', price: 45.00, stock: 220, description: 'Tetracycline antibiotic' },

  // Anti-diabetics
  { name: 'Metformin 500mg', sku: 'MED-MET-500', genericName: 'Metformin Hydrochloride', category: 'Anti-diabetics', price: 40.00, stock: 350, description: 'Type 2 diabetes management' },
  { name: 'Glimepiride 1mg', sku: 'MED-GLI-1', genericName: 'Glimepiride', category: 'Anti-diabetics', price: 28.00, stock: 180, description: 'Blood sugar control' },
  { name: 'Sitagliptin 50mg', sku: 'MED-SIT-50', genericName: 'Sitagliptin', category: 'Anti-diabetics', price: 210.00, stock: 65, description: 'DPP-4 inhibitor for diabetes' },

  // Anti-hypertensives & Cardiac
  { name: 'Amlodipine 5mg', sku: 'MED-AML-5', genericName: 'Amlodipine Besylate', category: 'Anti-hypertensives', price: 30.00, stock: 300, description: 'Blood pressure management' },
  { name: 'Telmisartan 40mg', sku: 'MED-TEL-40', genericName: 'Telmisartan', category: 'Anti-hypertensives', price: 55.00, stock: 250, description: 'Hypertension treatment' },
  { name: 'Atorvastatin 10mg', sku: 'MED-ATO-10', genericName: 'Atorvastatin', category: 'Cardiac', price: 85.00, stock: 210, description: 'Cholesterol lowering medication' },
  { name: 'Rosuvastatin 10mg', sku: 'MED-ROS-10', genericName: 'Rosuvastatin', category: 'Cardiac', price: 120.00, stock: 150, description: 'High cholesterol treatment' },

  // Vitamins & Supplements
  { name: 'Vitamin C 500mg (Chewable)', sku: 'MED-VITC-500', genericName: 'Ascorbic Acid', category: 'Vitamins', price: 35.00, stock: 600, description: 'Immunity booster' },
  { name: 'Multivitamin Capsules', sku: 'MED-MVIT-CAP', genericName: 'Multivitamins & Minerals', category: 'Vitamins', price: 150.00, stock: 200, description: 'Daily essential vitamins and minerals' },
  { name: 'Vitamin D3 60K IU', sku: 'MED-VITD-60K', genericName: 'Cholecalciferol', category: 'Vitamins', price: 250.00, stock: 120, description: 'Bone health weekly supplement' },
  { name: 'Calcium + Vit D3', sku: 'MED-CAL-D3', genericName: 'Calcium Carbonate', category: 'Vitamins', price: 90.00, stock: 320, description: 'Calcium supplement for bones' },

  // Other Essentials
  { name: 'First Aid Kit (Basic)', sku: 'MED-FA-KIT', genericName: 'Equipments', category: 'First Aid', price: 450.00, stock: 50, description: 'Essential first aid supplies' },
  { name: 'Digital Thermometer', sku: 'MED-THERM-DIG', genericName: 'Equipments', category: 'Devices', price: 200.00, stock: 5, description: 'Fast reading digital thermometer (Critical Stock!)' },
  { name: 'Pulse Oximeter', sku: 'MED-OXI-1', genericName: 'Equipments', category: 'Devices', price: 1200.00, stock: 12, description: 'SpO2 monitoring device' },
  { name: 'Surgical Masks (Box of 50)', sku: 'MED-MASK-50', genericName: 'Consumables', category: 'Hygiene', price: 150.00, stock: 80, description: '3-ply surgical masks' },
];

const seedDB = async () => {
  try {
    console.log('Clearing old test medicines (optional)...');
    
    // Using findOrCreate to ensure idempotency. 
    // Since we added `genericName`, existing records might not have it.
    // For a robust seed, we can just upsert.
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const med of basicMedicines) {
      try {
        const product = await Product.findOne({ where: { sku: med.sku } });
        if (product) {
          await product.update(med);
          updatedCount++;
        } else {
          await Product.create(med);
          addedCount++;
        }
      } catch (err) {
        console.error(`Failed to process ${med.name}:`, err.message);
      }
    }
    
    console.log(`Successfully added ${addedCount} and updated ${updatedCount} medicines!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
