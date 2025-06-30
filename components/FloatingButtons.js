import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageCircle, ArrowUp, Mail, Phone } from 'lucide-react';

const FloatingButtons = ({ onTestConnection, showScrollTop, onScrollToTop }) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      {/* Floating Action Buttons */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 flex flex-col gap-4"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        {/* Test Connection Button (Temporary) */}
        <motion.button
          className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTestConnection}
          title="Test Email Connection"
        >
          <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Contact Button */}
        <motion.button
          className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-purple rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowContact(!showContact)}
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Scroll to Top Button */}
        <motion.button
          className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onScrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: showScrollTop ? 1 : 0, 
            scale: showScrollTop ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <ArrowUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>
      </motion.div>

      {/* Contact Popup */}
      <motion.div
        className="fixed bottom-24 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ 
          opacity: showContact ? 1 : 0, 
          scale: showContact ? 1 : 0.8,
          y: showContact ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
      >
        {showContact && (
          <div className="bg-dark-800 border border-white/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm min-w-[280px]">
            <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
            <div className="space-y-3">
              <a 
                href="mailto:hello@thegreenroom.ai" 
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <Mail className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform" />
                <span className="text-white/90 group-hover:text-white">hello@thegreenroom.ai</span>
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <Phone className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform" />
                <span className="text-white/90 group-hover:text-white">+1 (234) 567-890</span>
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default FloatingButtons; 