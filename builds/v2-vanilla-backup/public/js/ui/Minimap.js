/**
 * AI Academy - Minimap
 * Canvas-based minimap showing terrain, mentors, and portals
 */

class Minimap {
    constructor() {
        this.canvas = document.getElementById('minimap');
        this.ctx = this.canvas?.getContext('2d');
        this.size = 150;
        this._frameCount = 0;
        this._terrainCache = null;
        this._lastPlayerX = null;
        this._lastPlayerZ = null;
    }

    update(playerPosition, playerRotation, chunkManager, mentors, portal) {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const size = this.size;
        const scale = size / 200;

        this._frameCount++;

        // Only recalculate terrain every 5th frame or on significant movement
        const moved = this._lastPlayerX === null ||
            Math.abs(playerPosition.x - this._lastPlayerX) > 2 ||
            Math.abs(playerPosition.z - this._lastPlayerZ) > 2;

        if (moved && this._frameCount % 5 === 0) {
            this._terrainCache = ctx.createImageData(size, size);
            for (let x = 0; x < size; x += 10) {
                for (let y = 0; y < size; y += 10) {
                    const worldX = playerPosition.x + (x - size / 2) / scale;
                    const worldZ = playerPosition.z + (y - size / 2) / scale;
                    const height = chunkManager.getHeightAt(worldX, worldZ);
                    const brightness = Math.min(255, 40 + height * 5);
                    const r = Math.floor(brightness * 0.3);
                    const g = Math.floor(brightness * 0.4);
                    const b = Math.floor(brightness * 0.5);
                    for (let dx = 0; dx < 10 && x + dx < size; dx++) {
                        for (let dy = 0; dy < 10 && y + dy < size; dy++) {
                            const idx = ((y + dy) * size + (x + dx)) * 4;
                            this._terrainCache.data[idx] = r;
                            this._terrainCache.data[idx + 1] = g;
                            this._terrainCache.data[idx + 2] = b;
                            this._terrainCache.data[idx + 3] = 255;
                        }
                    }
                }
            }
            this._lastPlayerX = playerPosition.x;
            this._lastPlayerZ = playerPosition.z;
        }

        // Draw cached terrain
        if (this._terrainCache) {
            ctx.putImageData(this._terrainCache, 0, 0);
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, size, size);
        }

        // Mentors (green dots)
        if (mentors) {
            for (const mentor of mentors) {
                const relX = (mentor.position.x - playerPosition.x) * scale + size / 2;
                const relZ = (mentor.position.z - playerPosition.z) * scale + size / 2;

                if (relX >= 0 && relX < size && relZ >= 0 && relZ < size) {
                    ctx.fillStyle = '#00ffaa';
                    ctx.beginPath();
                    ctx.arc(relX, relZ, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Portal (blue diamond)
        if (portal?.portal) {
            const relX = (portal.portalPosition.x - playerPosition.x) * scale + size / 2;
            const relZ = (portal.portalPosition.z - playerPosition.z) * scale + size / 2;

            if (relX >= 0 && relX < size && relZ >= 0 && relZ < size) {
                ctx.fillStyle = portal.active ? '#44aaff' : '#555555';
                ctx.save();
                ctx.translate(relX, relZ);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-4, -4, 8, 8);
                ctx.restore();
            }
        }

        // Player (blue dot with direction)
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2);
        ctx.lineTo(
            size / 2 - Math.sin(playerRotation) * 10,
            size / 2 - Math.cos(playerRotation) * 10
        );
        ctx.stroke();
    }
}

window.Minimap = Minimap;
export { Minimap };
