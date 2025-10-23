/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description 3D particle universe with multiple particle systems and dynamic motion effects
 */

"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/**
 * @constructor
 */
export default function ParticleUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);

  /** @constructs */
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Particle systems
    const particleSystems: THREE.Points[] = [];
    const particleCount = 10000;
    const createParticleSystem = (baseColor: THREE.Color, size: number, speed: number) => {
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        // Position in a sphere
        const radius = Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Velocity
        velocities[i * 3] = (Math.random() - 0.5) * speed;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;

        // Color variation
        particleColors[i * 3] = baseColor.r + (Math.random() - 0.5) * 0.2;
        particleColors[i * 3 + 1] = baseColor.g + (Math.random() - 0.5) * 0.2;
        particleColors[i * 3 + 2] = baseColor.b + (Math.random() - 0.5) * 0.2;

        // Size variation
        sizes[i] = size * (0.5 + Math.random());
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
      particles.setAttribute('particleColor', new THREE.BufferAttribute(particleColors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute vec3 velocity;
          attribute vec3 particleColor;
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = particleColor;
            
            // Complex motion
            vec3 pos = position;
            float angle = time * 0.2 + length(position) * 0.05;
            pos.x = position.x * cos(angle) - position.z * sin(angle);
            pos.z = position.x * sin(angle) + position.z * cos(angle);
            pos += velocity * time;
            
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
            
            float alpha = exp(-r * 5.0);
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
      });

      return new THREE.Points(particles, material);
    };
    const system1 = createParticleSystem(new THREE.Color(0x00ff00), 3, 0.1);
    const system2 = createParticleSystem(new THREE.Color(0x00ffff), 2, 0.15);
    const system3 = createParticleSystem(new THREE.Color(0xff00ff), 1.5, 0.2);

    scene.add(system1, system2, system3);
    particleSystems.push(system1, system2, system3);

    camera.position.z = 100;
    const mouse = new THREE.Vector2();
    const target = new THREE.Vector2();
    
    containerRef.current.addEventListener('mousemove', (event) => {
      const rect = containerRef.current!.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      target.lerp(mouse, 0.05);
      camera.position.x = target.x * 20;
      camera.position.y = target.y * 20;
      camera.lookAt(scene.position);
      particleSystems.forEach((system, index) => {
        const material = system.material as THREE.ShaderMaterial;
        material.uniforms.time.value = time * (1 + index * 0.2);
      });

      renderer.render(scene, camera);
    };

    animate();
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