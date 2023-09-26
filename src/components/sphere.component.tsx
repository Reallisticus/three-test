import React, { useEffect } from "react";
import * as THREE from "three";
import points from "../../public/points.json";
import mesh from "../../public/mesh.png";
const SphereThree = () => {
  useEffect(() => {
    function latLongToVector3(lat: number, lon: number, radius: number) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new THREE.Vector3(x, y, z);
    }

    const initThreeJS = (data: any) => {
      // Initialize Scene, Camera, Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // Add Light
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1);
      scene.add(light);
      const loader = new THREE.TextureLoader();

      function loadColorTexture(path: string) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      }

      const amientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(amientLight);

      // Create Sphere
      const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        wireframe: true,
        map: loadColorTexture("../../public/mesh.jpg"),
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(sphere);

      // Add Points
      const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
      const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

      data.forEach((point: any) => {
        const { lat, lng } = point;
        const position = latLongToVector3(lat, lng, 5); // 5 is the radius of the sphere
        const pointSphere = new THREE.Mesh(pointGeometry, pointMaterial);
        pointSphere.position.set(position.x, position.y, position.z);
        scene.add(pointSphere);
      });

      // Position the camera
      camera.position.z = 10;

      // Animation Loop
      const animate = () => {
        requestAnimationFrame(animate);
        scene.rotation.y += 0.001;
        renderer.render(scene, camera);
      };

      animate();
    };

    initThreeJS(points);
  }, []);

  return <div></div>;
};

export default SphereThree;
