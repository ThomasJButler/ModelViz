/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Epic layout wrapper for playground with sidebar and visual effects
 */
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { PlaygroundSidebar } from '@/components/playground/playground-sidebar';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { ParticleField } from '@/components/effects/ParticleField';
import { useEffectsEnabled } from '@/hooks/use-media-query';

/**
 * Playground layout component
 * @constructor
 */
export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSection, setCurrentSection] = useState('playground');
  const [userEffectsPreference, setUserEffectsPreference] = useState(true);

  // Check if effects should be enabled (disabled on mobile or reduced motion)
  const effectsEnabled = useEffectsEnabled();
  const showEffects = effectsEnabled && userEffectsPreference;

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Epic Background Effects - Very subtle */}
        {showEffects && (
          <>
            <MatrixRain intensity={0.08} speed={0.4} fontSize={10} color="#00ff00" />
            <ParticleField particleCount={40} color="#00ff00" connectionDistance={80} />
          </>
        )}

        <div className="relative z-10 flex items-start">
          {/* Sidebar Navigation - Hidden on mobile, shown on desktop */}
          <div className="fixed left-0 top-0 h-screen z-20 hidden lg:block">
            <PlaygroundSidebar
              onNavigate={setCurrentSection}
              currentSection={currentSection}
              metrics={{
                totalTests: 42,
                savedTemplates: 15,
                activeExperiments: 3
              }}
            />
          </div>

          {/* Main Content Area - Responsive margin */}
          <div className="flex-1 lg:ml-[280px]">
            {children}
          </div>
        </div>

        {/* Effects Toggle Button - Hidden on mobile since effects are auto-disabled */}
        <button
          onClick={() => setUserEffectsPreference(!userEffectsPreference)}
          className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-lg bg-black/80 border border-matrix-primary/20
                     text-matrix-primary text-xs hover:bg-matrix-primary/10 transition-all hidden lg:block"
        >
          Effects: {showEffects ? 'ON' : 'OFF'}
        </button>
      </div>
    </ProtectedRoute>
  );
}