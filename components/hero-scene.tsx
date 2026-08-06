'use client';

import { useEffect, useRef } from 'react';

/**
 * Ambient isometric diorama for the hero background — a stripped, non-interactive
 * showcase of the survival game's visual language (same node types/colors as
 * public/game/), auto-playing traffic forever. No economy/score/fail-state logic;
 * this is decoration, not the game.
 */
const NODE_TYPES: Record<string, { color: number; geo: 'box' | 'cylinder' | 'sphere'; size: [number, number, number]; wire?: boolean }> = {
    waf: { color: 0xa855f7, geo: 'box', size: [3, 2, 0.5] },
    alb: { color: 0x3b82f6, geo: 'box', size: [3, 1.5, 3] },
    compute: { color: 0xf97316, geo: 'cylinder', size: [1.2, 3, 1.2] },
    cache: { color: 0xdc382d, geo: 'box', size: [2.5, 1.5, 2.5] },
    db: { color: 0xdc2626, geo: 'cylinder', size: [2, 2, 2] },
    cdn: { color: 0x4ade80, geo: 'sphere', size: [1.5, 0, 0], wire: true },
    sqs: { color: 0xff9900, geo: 'box', size: [4, 0.8, 2] },
};

// Preset base: [type, x, z] — already "settled", spread wide with an open
// corridor down the middle (x: -14..14) so hero copy sits over clear ground.
const LAYOUT: Array<[string, number, number]> = [
    // left compound
    ['waf', -52, -20],
    ['alb', -40, -18],
    ['compute', -30, -34],
    ['compute', -30, 0],
    ['cache', -18, -40],
    ['db', -20, 30],
    ['cdn', -44, 36],
    ['sqs', -56, 10],
    ['waf', -50, 44],
    ['compute', -36, -46],
    // right compound
    ['waf', 50, 24],
    ['alb', 38, 22],
    ['compute', 28, 40],
    ['compute', 28, -14],
    ['cache', 18, 46],
    ['db', 20, -32],
    ['cdn', 46, -40],
    ['sqs', 58, -12],
    ['waf', 54, -44],
    ['compute', 40, 48],
    // far background accents
    ['compute', -10, -50],
    ['compute', 12, 52],
    ['cache', -6, 50],
    ['cdn', 6, -52],
];

// Traffic paths as index pairs into LAYOUT (source → dest), pips loop along these.
// A few cross the open middle so motion still reads behind the hero copy.
const PATHS: Array<[number, number]> = [
    // left compound (0-9)
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [1, 6], [1, 7], [7, 8], [2, 9],
    // right compound (10-19)
    [10, 11], [11, 12], [11, 13], [12, 14], [13, 15], [11, 16], [11, 17], [17, 18], [12, 19],
    // far background + cross-middle
    [5, 15], [3, 13], [20, 21], [22, 23], [6, 22], [16, 23],
];

export function HeroScene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let raf: number | null = null;
        let renderer: any = null;
        let io: IntersectionObserver | null = null;
        let onVis: (() => void) | null = null;
        let onResize: (() => void) | null = null;
        let pollId: ReturnType<typeof setInterval> | null = null;
        let disposed = false;
        let inView = true;
        let tabVisible = true;
        const isVisible = () => inView && tabVisible;

        const setup = () => {
            const THREE = (window as any).THREE;
            if (!THREE) return false;

            const scene = new THREE.Scene();
            scene.background = null;
            scene.fog = new THREE.FogExp2(0x0a0c10, 0.0035);

            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            const aspect = w / h;
            const d = 50;
            const target = new THREE.Vector3(0, 0, 0);
            const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
            camera.position.set(target.x + 72, 50, target.z + 72);
            camera.lookAt(target);

            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

            scene.add(new THREE.AmbientLight(0xffffff, 0.75));
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
            dirLight.position.set(30, 60, 30);
            scene.add(dirLight);
            const rim = new THREE.DirectionalLight(0xff5c8a, 0.6);
            rim.position.set(-30, 20, -30);
            scene.add(rim);

            // Solid floor so the scene reads as ground, not floating dots
            const floorGeo = new THREE.PlaneGeometry(420, 420);
            const floorMat = new THREE.MeshStandardMaterial({ color: 0x0d1016, roughness: 0.9 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = -0.05;
            scene.add(floor);

            const grid = new THREE.GridHelper(420, 84, 0x1c2029, 0x161a20);
            scene.add(grid);

            const SCALE = 2.1;
            const nodePositions: any[] = [];
            for (const [type, x, z] of LAYOUT) {
                const def = NODE_TYPES[type];
                let geo;
                if (def.geo === 'box') geo = new THREE.BoxGeometry(def.size[0] * SCALE, def.size[1] * SCALE, def.size[2] * SCALE);
                else if (def.geo === 'cylinder') geo = new THREE.CylinderGeometry(def.size[0] * SCALE, def.size[0] * SCALE, def.size[1] * SCALE, 16);
                else geo = new THREE.SphereGeometry(def.size[0] * SCALE, 16, 16);
                const mat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.25, wireframe: !!def.wire });
                const mesh = new THREE.Mesh(geo, mat);
                const h2 = (def.size[1] || def.size[0]) * SCALE;
                mesh.position.set(x, h2 / 2, z);
                scene.add(mesh);
                nodePositions.push(mesh.position);
            }

            // Filler props — small dim server-rack blocks scattered wide, keeps the
            // ground from reading as empty (stand-in for Kintara's trees/rocks).
            // Avoids the center corridor (hero copy) and the immediate node clusters.
            const fillerGeo = new THREE.BoxGeometry(1, 1.4, 1);
            const fillerMat = new THREE.MeshStandardMaterial({ color: 0x232833, roughness: 0.8 });
            let seed = 7;
            const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
            for (let i = 0; i < 70; i++) {
                const x = (rand() - 0.5) * 200;
                const z = (rand() - 0.5) * 160;
                if (Math.abs(x) < 20 && Math.abs(z) < 24) continue; // clear corridor for copy
                const mesh = new THREE.Mesh(fillerGeo, fillerMat);
                const s = 0.6 + rand() * 0.8;
                mesh.scale.set(s, s * (0.7 + rand() * 0.6), s);
                mesh.position.set(x, (1.4 * mesh.scale.y) / 2, z);
                mesh.rotation.y = rand() * Math.PI;
                scene.add(mesh);
            }

            const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff85, transparent: true, opacity: 0.25 });
            for (const [a, b] of PATHS) {
                const geo = new THREE.BufferGeometry().setFromPoints([nodePositions[a], nodePositions[b]]);
                scene.add(new THREE.Line(geo, lineMat));
            }

            // Traffic pips — small glowing spheres looping along each path forever
            const pipGeo = new THREE.SphereGeometry(0.4, 8, 8);
            const pips = PATHS.map(([a, b], i) => {
                const mat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 0.8 });
                const pip = new THREE.Mesh(pipGeo, mat);
                pip.userData = { a: nodePositions[a], b: nodePositions[b], t: (i / PATHS.length), speed: 0.15 + Math.random() * 0.1 };
                scene.add(pip);
                return pip;
            });

            let angle = Math.atan2(camera.position.z - target.z, camera.position.x - target.x);
            const radius = Math.hypot(camera.position.x - target.x, camera.position.z - target.z);

            const clock = new THREE.Clock();
            const animate = () => {
                raf = requestAnimationFrame(animate);
                if (!isVisible()) return;
                const dt = Math.min(clock.getDelta(), 0.1);

                // slow orbit, never stops
                angle += dt * 0.04;
                camera.position.x = target.x + Math.cos(angle) * radius;
                camera.position.z = target.z + Math.sin(angle) * radius;
                camera.lookAt(target);

                for (const pip of pips) {
                    pip.userData.t = (pip.userData.t + dt * pip.userData.speed) % 1;
                    pip.position.lerpVectors(pip.userData.a, pip.userData.b, pip.userData.t);
                    pip.position.y += 0.8;
                }

                renderer.render(scene, camera);
            };
            animate();

            io = new IntersectionObserver((ents) => { inView = ents[0]?.isIntersecting ?? true; }, { threshold: 0.05 });
            io.observe(canvas);
            onVis = () => { tabVisible = !document.hidden; };
            document.addEventListener('visibilitychange', onVis);

            onResize = () => {
                const nw = canvas.clientWidth || window.innerWidth;
                const nh = canvas.clientHeight || window.innerHeight;
                const na = nw / nh;
                camera.left = -d * na; camera.right = d * na; camera.top = d; camera.bottom = -d;
                camera.updateProjectionMatrix();
                renderer.setSize(nw, nh);
            };
            window.addEventListener('resize', onResize);

            return true;
        };

        if (!setup()) {
            pollId = setInterval(() => {
                if (setup()) { if (pollId) clearInterval(pollId); pollId = null; }
            }, 200);
            setTimeout(() => { if (pollId) { clearInterval(pollId); pollId = null; } }, 10000);
        }

        return () => {
            disposed = true;
            if (pollId) clearInterval(pollId);
            if (raf) cancelAnimationFrame(raf);
            if (onResize) window.removeEventListener('resize', onResize);
            if (onVis) document.removeEventListener('visibilitychange', onVis);
            if (io) io.disconnect();
            if (renderer) renderer.dispose();
            void disposed;
        };
    }, []);

    return <canvas ref={canvasRef} className="hero-scene-canvas" aria-hidden="true" />;
}
