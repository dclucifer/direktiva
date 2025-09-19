import React from 'react';

// fix: Update CardProps to extend div attributes to allow passing props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-component-background rounded-xl border border-border-color shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;