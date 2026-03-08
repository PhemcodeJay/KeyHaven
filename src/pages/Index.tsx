import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

// Define the props interface
interface IndexProps {
  listings?: any[];
  isLoading?: boolean;
  error?: string | null;
}

const Index: React.FC<IndexProps> = ({ listings, isLoading, error }) => {
  return (
    <AppProvider>
      <AppLayout listings={listings} isLoading={isLoading} error={error} />
    </AppProvider>
  );
};

export default Index;