const { Product } = require('./models');

const categories = ['Analgesics', 'Antibiotics', 'Vitamins', 'Antacids', 'Cardiac', 'Anti-diabetics', 'Cough & Cold', 'First Aid'];

const baseMedicines = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Azithromycin', 'Vitamin C', 'Vitamin D3', 'Pantoprazole', 'Omeprazole', 
  'Amlodipine', 'Telmisartan', 'Metformin', 'Glimepiride', 'Cetirizine', 'Loratadine', 'Aspirin', 'Naproxen',
  'Diclofenac', 'Cough Syrup', 'Cold Rub', 'Multivitamin', 'Calcium', 'Digestive Enzymes', 'Atorvastatin',
  'Fluconazole', 'Levocetirizine', 'Montelukast', 'Rosuvastatin', 'Clopidogrel', 'Losartan', 'Carvedilol'
];

async function seed() {
  let count = 0;
  for (let i = 1; i <= 100; i++) {
    const baseName = baseMedicines[i % baseMedicines.length];
    const variantStr = (i % 3 === 0) ? 'Forte' : (i % 2 === 0 ? 'Plus' : 'Basic');
    const strength = ((i % 10) * 50 + 50) + 'mg';
    
    const med = {
      name: `${baseName} ${strength} ${variantStr}`,
      sku: `MED-${baseName.substring(0, 3).toUpperCase()}-100${i}`,
      genericName: `${baseName} Hydrochloride`,
      category: categories[i % categories.length],
      price: Math.floor(Math.random() * 150) + 10,
      stock: Math.floor(Math.random() * 500) + 10,
      description: `Premium quality ${baseName} formulation.`,
      gstRate: 12
    };

    try {
      const existing = await Product.findOne({ where: { sku: med.sku } });
      if (!existing) {
        await Product.create(med);
        count++;
      }
    } catch(err) {
      console.log('Error inserting', med.name, err);
    }
  }
  console.log(`Inserted ${count} basic medicines.`);
  process.exit(0);
}

seed();
