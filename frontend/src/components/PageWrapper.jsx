import React from 'react';

const PageWrapper = ({ title, children }) => {
  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto rounded-2xl p-6" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 className="text-3xl font-extrabold mb-6" style={{ color: '#f0f0f5', letterSpacing: '-0.4px' }}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
