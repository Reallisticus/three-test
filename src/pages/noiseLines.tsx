import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import useAnimationFrame from "../components/useAnimationFrame";

const AnimatedWave: React.FC = () => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const linesRef = useRef<THREE.Line[]>([]);

  useEffect(() => {
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    rendererRef.current = new THREE.WebGLRenderer();

    cameraRef.current.position.z = 5;
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    document
      .getElementById("three-container")
      ?.appendChild(rendererRef.current.domElement);

    // Initialize lines
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-5, i * 0.2 - 5, 0),
        new THREE.Vector3(-5, i * 0.2 - 5, 0),
      ]);
      const line = new THREE.Line(geometry, material);
      linesRef.current.push(line);
      sceneRef.current.add(line);
    }
  }, []);

  useAnimationFrame((deltaTime: any) => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Animation and update logic
    linesRef.current.forEach((line, index) => {
      const geometry = line.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position!.array as Float32Array;

      // Update the x coordinates to move the line towards the center and then towards the right
      for (let i = 0; i < positions.length; i += 3) {
        if (positions[i]! < 0) {
          positions[i] += 0.02 * ((index % 5) + 1);
        } else if (positions[i]! >= 0 && positions[i]! < 5) {
          positions[i] += 0.02 * ((index % 5) + 1);
        }
      }

      // Reset line position when it moves off-screen
      if (positions[0]! >= 5) {
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = -5;
        }
      }

      geometry.attributes.position!.needsUpdate = true;
    });

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  });

  return <div id="three-container"></div>;
};

export default AnimatedWave;
