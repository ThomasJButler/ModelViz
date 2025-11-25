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
import { CyberpunkOverlay } from '@/components/effects/CyberpunkOverlay';

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
  const [showEffects, setShowEffects] = useState(true);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Epic Background Effects - Very subtle */}
        {showEffects && (
          <>
            <MatrixRain intensity={0.08} speed={0.4} fontSize={10} color="#00ff00" />
            <ParticleField particleCount={40} color="#00ff00" connectionDistance={80} />
            <CyberpunkOverlay intensity={0.2} />
          </>
        )}

        {/* Animated Background - Controlled by effects toggle */}
        {showEffects && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-matrix-primary/3 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-matrix-secondary/3 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-matrix-tertiary/3 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>
        )}

        <div className="relative z-10 flex">
          {/* Sidebar Navigation */}
          <div className="fixed left-0 top-0 h-screen z-20">
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

          {/* Main Content Area */}
          <div className="flex-1 ml-[280px]">
            {children}
          </div>
        </div>

        {/* Effects Toggle Button */}
        <button
          onClick={() => setShowEffects(!showEffects)}
          className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-lg bg-black/80 border border-matrix-primary/20
                     text-matrix-primary text-xs hover:bg-matrix-primary/10 transition-all"
        >
          Effects: {showEffects ? 'ON' : 'OFF'}
        </button>
      </div>
    </ProtectedRoute>
  );
}