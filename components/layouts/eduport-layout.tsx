import React from 'react';
import { EduportHeader } from '@/components/header';

interface EduportLayoutProps {
  children: React.ReactNode;
}

export const EduportLayout: React.FC<EduportLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <EduportHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};
