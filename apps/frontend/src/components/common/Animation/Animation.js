'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

/**
 * Reusable Animation component that loads Lottie JSON files from /public/animations/
 * @param {string} type - 'error', 'success', or 'loading'
 * @param {boolean} loop - Whether the animation should loop
 * @param {object} style - Inline styles for the animation container
 */
export default function Animation({ type = 'loading', loop = true, style = { height: 300 } }) {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(`/animations/${type}.json`);
        if (!response.ok) throw new Error('Failed to load animation');
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error('Error loading Lottie animation:', err);
        setError(true);
      }
    };

    fetchAnimation();
  }, [type]);

  if (error) {
    return <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Failed to load animation</p>
    </div>;
  }

  if (!animationData) {
    return <div style={{ ...style }} />;
  }

  return (
    <div style={style}>
      <Lottie 
        animationData={animationData} 
        loop={loop}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
