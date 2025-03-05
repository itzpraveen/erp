import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './app/store';
import './index.css';
import './assets/styles/custom.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';

// Import Bootstrap and Font Awesome
import 'bootstrap/dist/css/bootstrap.min.css';
// Note: custom.css overrides Bootstrap styles
import '@fortawesome/fontawesome-free/css/all.min.css';

// Create the root and render the app
try {
  console.log('Initializing React application...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  );
  console.log('React application rendered successfully');
} catch (error) {
  console.error('Failed to initialize React application:', error);
  // Show a visible error on the page
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>The application failed to initialize. Please check the console for more details.</p>
      <pre>${error.message}</pre>
    </div>
  `;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
