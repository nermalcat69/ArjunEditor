import React, { useState, useEffect } from 'react';

const EditWidget = ({ slug, contentDir, editorPort = 3456 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-hide after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Show on mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEditClick = () => {
    const editUrl = `http://localhost:${editorPort}/${slug}/_edit`;
    window.open(editUrl, '_blank');
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="dev-md-editor-widget"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 10000,
        transform: `translateY(${isVisible ? '0' : '12px'})`,
        opacity: isVisible ? 1 : 0.7,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '28px',
          boxShadow: isHovered 
            ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: '500',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          userSelect: 'none',
          minHeight: '20px',
          transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
          background: isHovered ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)',
        }}
        onClick={handleEditClick}
        title={`Edit ${slug}.md`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            opacity: 0.9,
          }}
        >
          <path d="m18 2 4 4-14 14H4v-4L18 2z" />
          <path d="m14.5 5.5 4 4" />
        </svg>
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: '500',
            letterSpacing: '0.01em',
          }}
        >
          Edit
        </span>
      </div>
    </div>
  );
};

export default EditWidget; 