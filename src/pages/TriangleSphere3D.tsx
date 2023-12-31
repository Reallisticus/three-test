import Head from "next/head";
import { useEffect } from "react";
import * as THREE from "three";
import { createNoise4D } from "simplex-noise";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SphereThree from "../components/sphere.component";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";

export default function Test() {
  useEffect(() => {
    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("three-canvas")?.appendChild(renderer.domElement);
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new BloomPass(1.5); // You can adjust the strength here
    composer.addPass(bloomPass);
    const createGradientMaterial = () => {
      const uniforms = {
        color1: { value: new THREE.Color(0x354f52) },
        color2: { value: new THREE.Color(0x52796f) },
        time: { value: 1.0 },
      };

      return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
      varying vec3 vUv; 
      
      void main() {
        vUv = position; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`,
        fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float time;
      
      varying vec3 vUv;
      
      void main() {
        float factor = sin(vUv.z * time);
        gl_FragColor = vec4(mix(color1, color2, factor), 1.0);
      }`,
      });
    };

    const simplex = createNoise4D();
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const smallSpheres: any[] = [];

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create a large 3D sphere
    const largeSphereGeometry = new THREE.SphereGeometry(3, 48, 48);
    const largeSphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x212529,
      visible: false,
    });
    const largeSphere = new THREE.Mesh(
      largeSphereGeometry,
      largeSphereMaterial,
    );
    scene.add(largeSphere);

    const smallSphereMaterial = createGradientMaterial();
    const positions = largeSphereGeometry.attributes.position!.array;
    const originalPositions: any[] = [];

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const smallSphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
      const smallSphere = new THREE.Mesh(
        smallSphereGeometry,
        smallSphereMaterial,
      );

      smallSphere.position.set(x!, y!, z!);
      largeSphere.add(smallSphere);
      smallSpheres.push(smallSphere);
      originalPositions.push(new THREE.Vector3(x, y, z));
    }

    // Set camera position
    camera.position.z = 8;
    let time = 0;

    // Animation logic
    const animate = () => {
      requestAnimationFrame(animate);

      let noise;

      smallSpheres.forEach((sphere, index) => {
        const originalPosition = originalPositions[index];

        noise = simplex(
          sphere.position.x * 0.15,
          sphere.position.y * 0.15,
          sphere.position.z * 0.15,
          time,
        );
        const distanceFactor = 1 + 0.2 * Math.sin(noise);
        const newPosition = originalPosition
          .clone()
          .multiplyScalar(distanceFactor);

        sphere.position.copy(newPosition);
      });

      time += 0.01; // Increment time
      smallSphereMaterial.uniforms.time!.value = time;

      largeSphere.rotation.z = 0.02;
      largeSphere.rotation.x = 0.02;
      renderer.render(scene, camera);
      composer.render();
    };

    animate();
  }, []);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="three-canvas m-0" id="three-canvas">
        {/* <SphereThree /> */}
      </main>
    </>
  );
}
