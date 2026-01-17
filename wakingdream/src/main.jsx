import React from 'react';
import { createRoot } from 'react-dom/client';
import WakingDreamPalace from './waking-dream-palace.jsx';
import './styles.css'; // optional: create for global styles if desired

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<WakingDreamPalace />);