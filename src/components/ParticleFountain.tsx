import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleFountain = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Particle system
    const particleCount = 5000;
    const particles = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particles[i3] = (Math.random() - 0.5) * 10;
      particles[i3 + 1] = Math.random() * 10;
      particles[i3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Red color variations
      const brightness = Math.random() * 0.5 + 0.5;
      colors[i3] = brightness; // Red
      colors[i3 + 1] = brightness * 0.2; // Less green for a deeper red
      colors[i3 + 2] = brightness * 0.2; // Less blue for a deeper red

      sizes[i] = Math.random() * 2 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mousePosition: { value: new THREE.Vector3() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform vec3 mousePosition;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Add wave effect
          pos.y += sin(time * 2.0 + position.x) * 0.1;
          pos.x += cos(time * 2.0 + position.z) * 0.1;
          
          // Mouse interaction
          float dist = distance(pos, mousePosition);
          if (dist < 2.0) {
            pos += normalize(pos - mousePosition) * (2.0 - dist) * 0.5;
          }
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / length(mvPosition.xyz));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          
          vec3 glow = vColor * (1.0 - r * 2.0);
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    camera.position.z = 15;

    // Mouse interaction
    const onMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      time += 0.005;
      material.uniforms.time.value = time;

      // Update mouse position in shader
      const vector = new THREE.Vector3(mousePosition.current.x, mousePosition.current.y, 0);
      vector.unproject(camera);
      material.uniforms.mousePosition.value.copy(vector);

      // Rotate particle system
      particleSystem.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-5" />;
};

export default ParticleFountain;
