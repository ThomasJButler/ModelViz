/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Layout wrapper for playground with sidebar
 */
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { PlaygroundSidebar } from '@/components/playground/playground-sidebar';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="relative z-10 flex items-start">
          {/* Sidebar Navigation - Hidden on mobile, shown on desktop */}
          <div className="fixed left-0 top-16 h-[calc(100vh-64px)] z-20 hidden lg:block">
            <PlaygroundSidebar
              onNavigate={setCurrentSection}
              currentSection={currentSection}
              onCollapseChange={setSidebarCollapsed}
              metrics={{
                totalTests: 42,
                savedTemplates: 15,
                activeExperiments: 3
              }}
            />
          </div>

          {/* Main Content Area - Responsive margin based on sidebar state */}
          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
