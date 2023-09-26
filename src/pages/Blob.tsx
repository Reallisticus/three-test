import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
//@ts-ignore
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import alea from "alea";
const prng = alea(600);

const Home = () => {
  const [modal, setModal] = useState(false);

  function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) {
      modal.classList.remove("show");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300); // same as your transition time
    }
  }

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0); // the default
    const simplex = createNoise3D(prng);

    renderer.shadowMap.enabled = true; // Enable Shadow Mapping

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize Simplex noise
    renderer.clear(); // clear depth and color buffer

    // Create a sphere
    const geometry = new THREE.SphereGeometry(6, 96, 96);
    const material = new THREE.MeshStandardMaterial({
      color: 0x212529,
      opacity: 1,
      transparent: false,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.receiveShadow = true; // Enable receiving of shadow
    scene.add(sphere);

    const loader = new FontLoader();

    let textMesh: any;
    let clickPlane: any;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10); // x, y, z position

    const planeGeometry = new THREE.SphereGeometry(2, 12, 12);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x212529, // Set color to black (or any color you like)
      opacity: 1,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    const clickPlaneGeometry = new THREE.PlaneGeometry(2, 0.5); // Adjust size to fit around your text
    const clickPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0, // Make it invisible
      transparent: true,
    });

    const radialGradientMaterial = new THREE.ShaderMaterial({
      vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    void main() {
      vec2 coord = gl_FragCoord.xy / vec2(gl_FragCoord.w, gl_FragCoord.z);
      vec2 center = vec2(1.0, 0.0); // Bottom right corner
      float distanceFromCenter = distance(coord, center);
      vec4 color1 = vec4(0.21, 0.21, 0.21, 1.0); // #363636
      vec4 color2 = vec4(0.1, 0.1, 0.1, 1.0);  // #191919
      float gradient = smoothstep(0.0, 1.0, distanceFromCenter);
      gl_FragColor = mix(color1, color2, gradient);
    }
  `,
      side: THREE.DoubleSide,
    });

    directionalLight.shadow.mapSize.width = 2048; // default is 512
    directionalLight.shadow.mapSize.height = 2048; // default is 512
    directionalLight.shadow.camera.near = 1; // default is 0.5
    directionalLight.shadow.camera.far = 2048; // default is 500

    // This line is very important
    directionalLight.shadow.bias = -0.001;

    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // you have this already

    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;

    const backgroundGeometry = new THREE.SphereGeometry(48, 24, 24); // or PlaneGeometry
    const backgroundMesh = new THREE.Mesh(
      backgroundGeometry,
      radialGradientMaterial,
    );
    scene.add(backgroundMesh);

    clickPlane = new THREE.Mesh(clickPlaneGeometry, clickPlaneMaterial);

    // Position the plane where your text is
    clickPlane.position.set(-1, 0, 2.02); // Slightly in front of the text

    // Add the click plane to the scene
    plane.add(clickPlane);

    plane.position.set(0, 0, 0);
    scene.add(plane);

    scene.add(directionalLight);

    let lerpFactor = 0.1; // The rate of interpolation, smaller value makes it smoother
    let sphereScale = 1; // Current sphere scale
    let targetSphereScale = 1; // Target sphere scale
    let planeScale = 1; // Current plane scale
    let targetPlaneScale = 1; // Target plane scale

    sphere.material.transparent = true;
    sphere.material.opacity = 0.5;

    camera.position.z = 15;

    const originalPositions: any[] = [];
    const positions = sphere.geometry.attributes.position;
    for (let i = 0; i < positions!.count; i++) {
      originalPositions.push({
        x: positions!.getX(i),
        y: positions!.getY(i),
        z: positions!.getZ(i),
      });
    }
    let time = 0;
    loader.load("json/Roboto_Regular.json", function (font) {
      // Step 2: Create text geometry
      const textGeometry = new TextGeometry("PLAY REEL", {
        font: font,
        size: 0.3,
        height: 0.01,
      });

      // Material for the text
      const textMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: false,
      });

      // Create mesh with text geometry and material
      textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Step 3: Position the text
      textMesh.position.set(-2, 0, 2.01); // Slightly in front of the sphere

      // Add text to the plane (or directly to the scene)
      plane.add(textMesh);
    });

    function onMouseClick(event: any) {
      // Convert mouse coordinates to normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the ray with camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Find all objects intersected by the ray
      const intersects = raycaster.intersectObjects([textMesh, plane]); // assuming textMesh is your text

      if (intersects.length > 0) {
        if (
          intersects[0]!.object.uuid === plane.uuid ||
          intersects[0]!.object.uuid === textMesh.uuid
        ) {
          openModal();
          setModal(true);
        }
      }
    }

    // Create a plane to serve as the surface
    const surfaceGeometry = new THREE.PlaneGeometry(90, 90); // Adjust the size as needed

    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x141414, // Set this to match your background color
      transparent: true,
      opacity: 0.2, // Adjust as needed
      side: THREE.DoubleSide,
    });

    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

    // Enable receiving of shadows
    surface.receiveShadow = true;

    // Rotate and position the plane
    surface.rotation.x = Math.PI / 2; // Rotate it to be horizontal
    sphere.position.y = 0;
    surface.position.y = -16;

    plane.position.x = 9;
    sphere.position.x = 8;
    // Add the surface to the scene
    scene.add(surface);

    // Enable casting of shadows for the blob
    sphere.castShadow = true;

    // Enable casting of shadows for the light
    directionalLight.castShadow = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, for softer shadows

    const animate = () => {
      requestAnimationFrame(animate);

      sphereScale += (targetSphereScale - sphereScale) * lerpFactor;
      planeScale += (targetPlaneScale - planeScale) * lerpFactor;

      sphere.scale.set(sphereScale, sphereScale, sphereScale);
      plane.scale.set(planeScale, planeScale, 1);

      const strokeGeometry = new THREE.SphereGeometry(2.02, 24, 24); // Note the slightly larger radius
      const strokeMaterial = new THREE.MeshBasicMaterial({
        color: 0x1dd3b0,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5, // You can
      });
      const strokeSphere = new THREE.Mesh(strokeGeometry, strokeMaterial);
      plane.add(strokeSphere);

      time += 0.01;

      for (let i = 0; i < positions!.count; i++) {
        const original = originalPositions[i];
        const vertex = new THREE.Vector3(original.x, original.y, original.z);

        // Apply varying noise to different dimensions for a more 3D look
        const offsetX = simplex(original.x * 0.1, original.y * 0.1, time);
        const offsetY = simplex(original.x * 0.1, original.z * 0.1, time + 100);
        const offsetZ = simplex(original.y * 0.1, original.z * 0.1, time + 200);

        const scaleX = 1 + 0.3 * offsetX; // Reduced for subtleness
        const scaleY = 1 + 0.3 * offsetY; // Reduced for subtleness
        const scaleZ = 1 + 0.3 * offsetZ; // Reduced for subtleness

        vertex.multiply(new THREE.Vector3(scaleX, scaleY, scaleZ));

        positions!.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      positions!.needsUpdate = true;
      renderer.render(scene, camera);
    };

    plane.renderOrder = 1; // Render this last

    sphere.renderOrder = 0; // Render this first

    sphere.material.depthWrite = false;
    window.addEventListener("click", onMouseClick, false);

    function openModal() {
      const modal = document.getElementById("modal");
      if (modal) {
        modal.style.display = "block";
        setTimeout(() => {
          modal.classList.add("show");
        }, 0);
      }
    }

    // Close the modal if clicked outside
    window.addEventListener("click", function (event) {
      const modal = document.getElementById("modal");
      if (event.target === modal) {
        closeModal();
      }
    });

    animate();
  }, []);

  return (
    <>
      {/* Three.js Canvas and Text Overlay Container */}
      <div className="relative">
        {/* Three.js Canvas Section */}
        <section className="absolute left-0 top-0">
          {/* Your existing Three.js code will go here */}
        </section>

        {/* Header & Paragraph Section */}
        <div className="font-inter absolute left-80 top-72 z-10 text-white ">
          <h1 className="text-6xl font-bold leading-[5rem]">
            Personalized Software <br /> Company
          </h1>
          <p className="leading-10">
            Ideologic crafts software solutions tailored to your ideas.
          </p>
          <p>Discover how we can bring your vision to life.</p>
        </div>
      </div>

      {/* Modal Section */}
      <div id="modal" className="fixed left-0 top-0 z-30 hidden h-full w-full">
        {/* Your existing modal code */}
        <div className="absolute inset-0 bg-black bg-opacity-40 blur-sm"></div>
        <div className="absolute right-96 top-40 flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white pb-1 text-center text-2xl font-medium opacity-50">
          <button
            onClick={() => {
              closeModal();
            }}
          >
            x
          </button>
        </div>
        <div className="absolute left-1/2 top-1/2 z-20 h-[30rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white">
          {/* ... */}
        </div>
      </div>
    </>
  );
};

export default Home;
