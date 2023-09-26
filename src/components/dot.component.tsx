// Dot.ts
export default class Dot {
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
  ) {}

  // Update position based on velocity
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  checkBoundary(centerX: number, centerY: number, radius: number) {
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      // Change velocity to bring dot back towards the center
      this.vx = -this.vx;
      this.vy = -this.vy;
    }
  }
}
