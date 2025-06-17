
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView, trackEvent, trackUserAction } from '@/utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on mount
    initGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname + location.search);
  }, [location]);

  return {
    trackEvent,
    trackUserAction,
    trackPageView,
  };
};
