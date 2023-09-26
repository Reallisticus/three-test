import React, { useEffect } from "react";
import * as THREE from "three";

type LineInfo = {
  mesh: THREE.Line;
  startVertex: THREE.Vector3;
  endVertex: THREE.Vector3;
};

const Octohedron = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("three-canvas")?.appendChild(renderer.domElement);
    // Create an octagon shape
    const shape = new THREE.Shape();
    const numSides = 8; // For octagon
    const radius = 150;
    const angle = (Math.PI * 2) / numSides;
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // yellow outline
    const outlineVertices = [];

    const outlineMat2 = new THREE.LineBasicMaterial({ color: 0xffffff }); // black outline
    const outlineVertices2 = [];

    shape.moveTo(radius, 0);
    for (let i = 1; i <= numSides; i++) {
      shape.lineTo(radius * Math.cos(angle * i), radius * Math.sin(angle * i));
    }
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
    }); // white lines
    const outlineRadius = radius * 1.8; // 1.2 times larger than the inner radius

    // Add mesh to the scene
    // Create geometry and material for dots
    const dotGeometry = new THREE.CircleGeometry(12, 32); // radius of 2, 32 segments
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // green color
    const vertices: any[] = [];
    const outlineGeometry = new THREE.BufferGeometry();
    const outlineGeo2 = new THREE.BufferGeometry();
    for (let i = 0; i <= numSides; i++) {
      const x = outlineRadius * Math.cos(angle * i);
      const y = outlineRadius * Math.sin(angle * i);
      outlineVertices.push(x, y, 0);
      const x1 = outlineRadius * Math.cos(angle * i);
      const y1 = outlineRadius * Math.sin(angle * i);
      outlineVertices2.push(x1, y1, 0);
    }

    outlineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(outlineVertices, 3),
    );

    outlineGeo2.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(outlineVertices2, 3),
    );
    const outline = new THREE.Line(outlineGeometry, outlineMaterial);
    const outline2 = new THREE.Line(outlineGeo2, outlineMat2);

    outline2.rotation.z = 0.5;

    // Add the outline to the scene
    scene.add(outline);
    scene.add(outline2);
    const yourLineInfos: LineInfo[] = [];
    const yourDotMeshes: THREE.Mesh[] = [];

    let dotMesh;
    // Create and position the dots
    for (let i = 0; i < numSides; i++) {
      const x = radius * Math.cos(angle * i);
      const y = radius * Math.sin(angle * i);

      dotMesh = new THREE.Mesh(dotGeometry, dotMaterial);
      dotMesh.position.set(
        radius * Math.cos(angle * i),
        radius * Math.sin(angle * i),
        0, // z-coordinate
      );
      scene.add(dotMesh);
      vertices.push(new THREE.Vector3(x, y, 0));
      yourDotMeshes.push(dotMesh); // Add to the array
    }

    // Create lines from each dot to every other dot except adjacent ones
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 2; j < vertices.length; j++) {
        if (
          vertices[i] &&
          vertices[j] &&
          j !== i + 1 &&
          j !== (i - 1 + vertices.length) % vertices.length
        ) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            vertices[i]!,
            vertices[j]!,
          ]);
          const line = new THREE.Line(geometry, lineMaterial);
          scene.add(line);
          yourLineInfos.push({
            mesh: line,
            startVertex: vertices[i]!,
            endVertex: vertices[j]!,
          });
        }
      }
    }

    // Create geometry from the shape
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      visible: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add mesh to the scene

    // Adjust camera position
    camera.position.z = 10;
    scene.rotation.z = 13;

    function createPlusShape(
      scene: THREE.Scene,
      position: THREE.Vector3,
      size: number,
      thickness: number,
    ) {
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // red color

      const verticalGeometry = new THREE.BoxGeometry(
        thickness,
        size,
        thickness,
      );
      const horizontalGeometry = new THREE.BoxGeometry(
        size,
        thickness,
        thickness,
      );

      const verticalMesh = new THREE.Mesh(verticalGeometry, material);
      const horizontalMesh = new THREE.Mesh(horizontalGeometry, material);

      verticalMesh.position.set(position.x, position.y, position.z);
      horizontalMesh.position.set(position.x, position.y, position.z);

      // Add to the scene
      scene.add(verticalMesh);
      scene.add(horizontalMesh);
      return [verticalMesh, horizontalMesh];
    }

    const plusShapes: { mesh: THREE.Mesh; lifetime: number }[] = [];
    let time = 0;
    let nextShapeTime = 0;
    let lineDrawProgress = 0;
    let sphereMoveProgress = 0;

    const animate = () => {
      time += 0.01;

      requestAnimationFrame(animate);

      if (time >= nextShapeTime) {
        // Generate a new time for the next shape
        nextShapeTime = time + Math.random() * 2;

        // Place "+" shape using sinusoidal function
        const angle = Math.sin(time) * Math.PI * 2;
        const x = outlineRadius * Math.cos(angle);
        const y = outlineRadius * Math.sin(angle);

        // Create the "+" shape
        const newShapes = createPlusShape(
          scene,
          new THREE.Vector3(x, y, 0),
          20,
          1,
        );

        // Set initial opacity and add to list
        newShapes.forEach((shape) => {
          shape.material.transparent = true;
          shape.material.opacity = 0;
          plusShapes.push({ mesh: shape, lifetime: 0 });
        });
      }

      // Update and remove "+" shapes
      for (let i = plusShapes.length - 1; i >= 0; i--) {
        const shape = plusShapes[i];

        // Update lifetime
        if (shape) {
          shape.lifetime += 0.01;

          // Update opacity for a smooth fade in and fade out
          if (shape.lifetime < 1) {
            shape.mesh.material.opacity = shape.lifetime;
          } else if (shape.lifetime > 4) {
            shape.mesh.material.opacity = 5 - shape.lifetime;
          }

          // Remove the shape if its lifetime exceeds 5
          if (shape.lifetime > 5) {
            scene.remove(shape.mesh);
            shape.mesh.geometry.dispose();
            plusShapes.splice(i, 1);
          }
        }
      }

      if (lineDrawProgress < 1) {
        lineDrawProgress += 0.003; // adjust as needed
        yourLineInfos.forEach(({ mesh, startVertex, endVertex }) => {
          const interpolatedVertex = new THREE.Vector3().lerpVectors(
            startVertex,
            endVertex,
            lineDrawProgress,
          );

          // Update the line's geometry
          const geometry = new THREE.BufferGeometry().setFromPoints([
            startVertex,
            interpolatedVertex,
          ]);
          mesh.geometry.dispose();
          mesh.geometry = geometry;
        });
      }

      outline.rotation.z += 0.001;
      outline2.rotation.z -= 0.001;
      plusShapes.forEach((shape) => {
        shape.mesh.rotation.z += 0.01;
      });
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return <div id="three-canvas"></div>;
};

export default Octohedron;
