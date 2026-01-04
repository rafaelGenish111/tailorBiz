import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ROICalculator = () => {
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [hourlyWage, setHourlyWage] = useState(100);

  // Calculate monthly waste
  const monthlyWaste = useMemo(() => {
    return Math.round(weeklyHours * hourlyWage * 4.3);
  }, [weeklyHours, hourlyWage]);

  // Determine if result is high (warning threshold)
  const isHighWaste = monthlyWaste > 5000;

  // Format number with Hebrew locale
  const formatNumber = (num) => {
    return new Intl.NumberFormat('he-IL').format(num);
  };

  return (
    <>
      {/* Custom Slider Styles */}
      <style>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 9999px;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 2px #0071E3;
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3), 0 0 0 2px #0071E3;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0071E3;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
          transform: scale(1.1);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 2px #0071E3;
        }
        
        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto"
        dir="rtl"
      >
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-text-heading mb-8 text-center font-heading">
          מחשבון עלות חוסר יעילות
        </h2>

        {/* Input A: Weekly Manual Hours */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-text-heading mb-4 font-heading">
            כמה שעות שבועיות הצוות משקיע במשימות ידניות?
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="40"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #0071E3 0%, #0071E3 ${(weeklyHours / 40) * 100}%, #E5E7EB ${(weeklyHours / 40) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <div className="flex justify-between mt-2 text-sm text-text-body">
              <span>0</span>
              <span className="font-semibold text-primary">{weeklyHours} שעות</span>
              <span>40</span>
            </div>
          </div>
        </div>

        {/* Input B: Hourly Wage */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-text-heading mb-4 font-heading">
            מה העלות המעביד לשעה לעובד הזה? (בש״ח)
          </label>
          <div className="relative">
            <input
              type="range"
              min="30"
              max="300"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #0071E3 0%, #0071E3 ${((hourlyWage - 30) / 270) * 100}%, #E5E7EB ${((hourlyWage - 30) / 270) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <div className="flex justify-between mt-2 text-sm text-text-body">
              <span>30</span>
              <span className="font-semibold text-primary">{hourlyWage} ש״ח</span>
              <span>300</span>
            </div>
          </div>
        </div>

        {/* Result Display */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-off-white rounded-2xl p-6 md:p-8 mb-6 text-center"
        >
          <p className="text-text-body mb-2 font-body">חיסכון חודשי פוטנציאלי</p>
          <motion.p
            key={monthlyWaste}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-4xl md:text-5xl font-bold font-heading ${
              isHighWaste ? 'text-orange-600' : 'text-text-heading'
            }`}
          >
            {formatNumber(monthlyWaste)} ש״ח
          </motion.p>
          {isHighWaste && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-orange-600 mt-2 font-body"
            >
              ⚠️ זהו סכום משמעותי שניתן לחסוך!
            </motion.p>
          )}
        </motion.div>

        {/* CTA Button */}
        {monthlyWaste > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/contact"
              className="block w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-heading"
            >
              תחסכו את הכסף הזה - קבעו אפיון
            </Link>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default ROICalculator;



