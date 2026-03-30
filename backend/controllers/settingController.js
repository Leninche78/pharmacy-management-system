const { Setting } = require('../models');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const config = {};
    settings.forEach(s => config[s.key] = s.value);
    
    // Provide smart defaults for out-of-box operation
    if (Object.keys(config).length === 0) {
      config.pharmacyName = 'MediManage';
      config.phone = '(555) 123-4567';
      config.address = '123 Health Ave, Medical District';
      config.taxRate = '5';
    }
    
    res.json(config);
  } catch (error) {
    console.error('Settings GET error:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { value: String(value) }
      });
      if (!created) {
        setting.value = String(value);
        await setting.save();
      }
    }
    res.json({ message: 'Global Settings updated successfully' });
  } catch (error) {
    console.error('Settings PUT error:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};
