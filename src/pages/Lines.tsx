// components/DotPlane.tsx
import React, { useRef, useEffect } from "react";
import Dot from "../components/dot.component";
import { createNoise3D } from "simplex-noise";

const DotPlane: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dots: Dot[] = [];
  let time = 0;

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 800; // canvas width
    const y = Math.random() * 600; // canvas height
    const vx = Math.random() * 2 - 1; // Random velocity between -1 and 1
    const vy = Math.random() * 2 - 1; // Random velocity between -1 and 1
    dots.push(new Dot(x, y, vx, vy));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const simplex = createNoise3D();
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dots) {
        dot.update();
        dot.checkBoundary(canvas.width / 2, canvas.height / 2, 1000); // center and radius

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Check for close dots
        for (const otherDot of dots) {
          const dx = dot.x - otherDot.x;
          const dy = dot.y - otherDot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(otherDot.x, otherDot.y);
            ctx.stroke();
          }
        }
      }
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="overflow-hidden"
    ></canvas>
  );
};

export default DotPlane;
