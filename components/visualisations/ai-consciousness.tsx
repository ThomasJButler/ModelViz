/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description 3D consciousness sphere visualisation with neural pathways and thought particles using Three.js
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/**
 * @constructor
 */
export default function AIConsciousness() {
  const containerRef = useRef<HTMLDivElement>(null);

  /** @constructs */
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Core consciousness sphere
    const coreGeometry = new THREE.IcosahedronGeometry(15, 4);
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          
          // Complex vertex displacement
          vec3 pos = position;
          float displacement = sin(pos.x * 0.5 + time) * 
                             sin(pos.y * 0.5 + time) * 
                             sin(pos.z * 0.5 + time) * 2.0;
          
          pos += normal * displacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        uniform float intensity;
        
        void main() {
          // Create complex color patterns
          vec3 color1 = vec3(0.0, 1.0, 0.0);  // Green
          vec3 color2 = vec3(0.0, 1.0, 1.0);  // Cyan
          vec3 color3 = vec3(1.0, 0.0, 1.0);  // Magenta
          
          float pattern = sin(vPosition.x * 10.0 + time) * 
                         sin(vPosition.y * 10.0 + time) * 
                         sin(vPosition.z * 10.0 + time);
          
          vec3 finalColor = mix(
            mix(color1, color2, pattern),
            color3,
            sin(time * 0.5) * 0.5 + 0.5
          );
          
          // Add rim lighting
          float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
          finalColor += vec3(1.0) * rim;
          
          gl_FragColor = vec4(finalColor * intensity, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Neural pathways
    const pathwayCount = 100;
    const pathways = new THREE.BufferGeometry();
    const pathwayPositions = new Float32Array(pathwayCount * 6); // Two points per line
    const pathwayColors = new Float32Array(pathwayCount * 6);

    for (let i = 0; i < pathwayCount; i++) {
      // Create curved paths around the core
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(Math.random() * 2 - 1);
      const radius1 = 15 + Math.random() * 10;

      const theta2 = theta1 + (Math.random() - 0.5) * Math.PI;
      const phi2 = phi1 + (Math.random() - 0.5) * Math.PI;
      const radius2 = 15 + Math.random() * 10;

      // Start point
      pathwayPositions[i * 6] = radius1 * Math.sin(phi1) * Math.cos(theta1);
      pathwayPositions[i * 6 + 1] = radius1 * Math.sin(phi1) * Math.sin(theta1);
      pathwayPositions[i * 6 + 2] = radius1 * Math.cos(phi1);

      // End point
      pathwayPositions[i * 6 + 3] = radius2 * Math.sin(phi2) * Math.cos(theta2);
      pathwayPositions[i * 6 + 4] = radius2 * Math.sin(phi2) * Math.sin(theta2);
      pathwayPositions[i * 6 + 5] = radius2 * Math.cos(phi2);

      // Colors
      const color = new THREE.Color();
      color.setHSL(Math.random(), 1, 0.5);
      pathwayColors[i * 6] = color.r;
      pathwayColors[i * 6 + 1] = color.g;
      pathwayColors[i * 6 + 2] = color.b;
      pathwayColors[i * 6 + 3] = color.r;
      pathwayColors[i * 6 + 4] = color.g;
      pathwayColors[i * 6 + 5] = color.b;
    }

    pathways.setAttribute('position', new THREE.BufferAttribute(pathwayPositions, 3));
    pathways.setAttribute('color', new THREE.BufferAttribute(pathwayColors, 3));

    const pathwayMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const pathwaySystem = new THREE.LineSegments(pathways, pathwayMaterial);
    scene.add(pathwaySystem);

    // Thought particles
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 20 + Math.random() * 15;

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.2;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      const color = new THREE.Color();
      color.setHSL(Math.random(), 1, 0.5);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        size: { value: 2.0 }
      },
      vertexShader: `
        attribute vec3 velocity;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float size;
        
        void main() {
          vColor = color;
          
          // Complex particle movement
          vec3 pos = position;
          float angle = time * 0.5 + length(position) * 0.1;
          pos.x = position.x * cos(angle) - position.z * sin(angle);
          pos.z = position.x * sin(angle) + position.z * cos(angle);
          pos += velocity * time * 5.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          
          float glow = exp(-r * 5.0);
          gl_FragColor = vec4(vColor, glow);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 60;

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const target = new THREE.Vector2();
    
    containerRef.current.addEventListener('mousemove', (event) => {
      const rect = containerRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // Animation
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      // Update core shader
      coreMaterial.uniforms.time.value = time;
      coreMaterial.uniforms.intensity.value = 1 + Math.sin(time) * 0.2;

      // Update particle shader
      particleMaterial.uniforms.time.value = time;

      // Rotate pathways
      pathwaySystem.rotation.y = time * 0.1;
      pathwaySystem.rotation.z = time * 0.05;

      // Smooth camera movement
      target.lerp(mouse, 0.05);
      camera.position.x = target.x * 20;
      camera.position.y = target.y * 20;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[600px] w-full bg-gradient-to-b from-background to-background/50"
    />
  );
}