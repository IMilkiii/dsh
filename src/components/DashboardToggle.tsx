import React from 'react';

interface DashboardToggleProps {
  hasProjects: boolean;
  onToggle: (hasProjects: boolean) => void;
}

const DashboardToggle: React.FC<DashboardToggleProps> = ({ hasProjects, onToggle }) => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 1000,
      background: 'white',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '14px', color: '#666' }}>Режим:</span>
      <button
        className={`btn ${!hasProjects ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onToggle(false)}
        style={{ padding: '6px 12px', fontSize: '12px' }}
      >
        Пустой
      </button>
      <button
        className={`btn ${hasProjects ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onToggle(true)}
        style={{ padding: '6px 12px', fontSize: '12px' }}
      >
        С проектами
      </button>
    </div>
  );
};

export default DashboardToggle;
