/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Model builder page providing an interface for defining, testing, and visualising custom AI models
 */
"use client";

import { ModelBuilderLayout } from '@/components/model-builder/layout';
import { ModelDefinitionPanel } from '@/components/model-builder/definition-panel';
import { ModelTestingPanel } from '@/components/model-builder/testing-panel';
import { ModelVisualisationPanel } from '@/components/model-builder/visualisation-panel';

/**
 * @constructor
 */
export default function ModelBuilderPage() {
  return (
    <ModelBuilderLayout
      leftPanel={<ModelDefinitionPanel />}
      centerPanel={<ModelTestingPanel />}
      rightPanel={<ModelVisualisationPanel />}
    />
  );
}
