import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Higher Order Component that wraps lazy-loaded components with Suspense
 * This allows individual components to be lazy loaded
 */
export const LazyComponent = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

export default LazyComponent;