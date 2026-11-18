import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export default function TechCanvas() {
  const mountRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const current = mountRef.current;
    if (!current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    current.appendChild(renderer.domElement);

    const isDark = theme === 'dark';

    const particleCount = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // In light theme, use deep rich emerald, teal and bronze/amber so particles are clearly visible against cream background
    const c1 = new THREE.Color(isDark ? '#10b981' : '#047857');
    const c2 = new THREE.Color(isDark ? '#06b6d4' : '#0e7490');
    const c3 = new THREE.Color(isDark ? '#14b8a6' : '#92400e');

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const r = 14 + Math.random() * 8;
      positions[i * 3] = r * Math.sin(u) * Math.cos(v);
      positions[i * 3 + 1] = r * Math.sin(u) * Math.sin(v);
      positions[i * 3 + 2] = r * Math.cos(u);
      const mixed = Math.random() > 0.4 ? c1 : (Math.random() > 0.5 ? c2 : c3);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const coreGeo = new THREE.IcosahedronGeometry(7, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x10b981 : 0x047857,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    };
    window.addEventListener('mousemove', onMove);
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let reqId;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      particles.rotation.y = t * 0.06 + targetX * 2;
      particles.rotation.x = t * 0.03 + targetY * 2;
      coreMesh.rotation.y = -t * 0.08 - targetX;
      coreMesh.rotation.x = t * 0.05 - targetY;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(reqId);
      if (current && renderer.domElement) current.removeChild(renderer.domElement);
      geometry.dispose(); material.dispose(); coreGeo.dispose(); coreMat.dispose(); renderer.dispose();
    };
  }, [theme]);

  return (
    <>
      {theme === 'light' && (
        <div className="light-atmosphere fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <span className="light-atmosphere__orb light-atmosphere__orb--one" />
        <span className="light-atmosphere__orb light-atmosphere__orb--two" />
        <span className="light-atmosphere__ribbon light-atmosphere__ribbon--one" />
        <span className="light-atmosphere__ribbon light-atmosphere__ribbon--two" />
        <span className="light-atmosphere__line light-atmosphere__line--one" />
        <span className="light-atmosphere__line light-atmosphere__line--two" />
        </div>
      )}
      <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: theme === 'light' ? 0.2 : 0.55, filter: theme === 'light' ? 'saturate(1.15)' : 'contrast(1.1)' }} />
    </>
  );
}
