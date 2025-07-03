import React from 'react';
import { motion } from 'framer-motion';
import { FloatingElementsProps } from '../types';

const FloatingElements: React.FC<FloatingElementsProps> = ({ mousePosition }) => {
  return (
    <>
      {/* Interactive Background Elements */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.1), transparent 40%)`
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </>
  );
};

export default FloatingElements; 