
import React from 'react';

interface SerieFundoBlurProps {
  posterUrl: string;
  children: React.ReactNode;
}

const SerieFundoBlur = ({ posterUrl, children }: SerieFundoBlurProps) => {
  return (
    <div className="relative">
      {/* Background com poster desfocado apenas no header */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: `url(${posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          height: '100%',
          maxHeight: '70vh'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-movieDarkBlue/95 to-black/100 backdrop-blur-sm"></div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SerieFundoBlur;
