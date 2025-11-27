import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = (pathname) => {
      switch (pathname) {
        case '/':
        case '/text-extractor':
          return 'Text Extractor - Integrator Tools';
        case '/forms-normalizer':
          return 'Forms Normalizer - Integrator Tools';
        default:
          return 'Integrator Tools';
      }
    };

    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);
};

export default usePageTitle;
