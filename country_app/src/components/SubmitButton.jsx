import React, { memo } from 'react';

const SubmitButton = memo(({ isLoading, onClick, children, className = "submit-button" }) => {
  return (
    <button 
      type="submit" 
      className={className} 
      disabled={isLoading}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
