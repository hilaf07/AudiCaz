import React from 'react';
import { createRoot } from 'react-dom/client';
import Experience from './Experience.jsx';
import './styles.css';
import './experience.css';
import './beginner.css';
import './assistant.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><Experience /></React.StrictMode>);
