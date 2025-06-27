import React from 'react';

export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
      }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* LMS Logo with Fade and Scale Animation */}
        <div
          className="text-4xl font-bold animate-glow-pulse"
          style={{ color: 'var(--text-color)' }}
        >
          ADMIN
        </div>

        {/* Central Ball with Orbiting Particles */}
        <div className="relative w-24 h-24">
          {/* Pulsing Central Ball with Glow */}
          <div className="absolute inset-0 w-16 h-16 mx-auto my-auto bg-cyan-500 rounded-full animate-pulse-ball shadow-[0_0_20px_rgba(6,182,212,0.7)]"></div>

          {/* Orbiting Particles */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 bg-cyan-300 rounded-full animate-orbit-${i}`}
              style={{
                transformOrigin: 'center',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-30px)`,
              }}
            ></div>
          ))}
        </div>

        {/* Loading Text with Animated Dots */}
        <p
          className="text-lg font-medium animate-dots"
          style={{ color: 'var(--text-color)' }}
        >
          Loading
        </p>
      </div>
    </div>
  );
}
