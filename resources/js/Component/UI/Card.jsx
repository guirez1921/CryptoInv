import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 ${hover ? 'hover:border-cyan-500/30 transition-colors' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;