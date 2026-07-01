'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  connectWallet,
  disconnectWallet,
  subscribeWallet,
  getWalletSnapshot,
  getWalletServerSnapshot,
  setStoredWallet,
} from '@/lib/wallet';
import { SiThreedotjs, SiRedis, SiPostgresql, SiNginx, SiRabbitmq } from 'react-icons/si';
import { PumpIcon, PhantomIcon, NextIcon, VercelIcon } from '@/components/brand-icons';
import { ThemeToggle } from '@/components/theme-toggle';
import './landing.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Home() {
  const [connecting, setConnecting] = useState(false);
  const wallet = useSyncExternalStore(subscribeWallet, getWalletSnapshot, getWalletServerSnapshot);
  const router = useRouter();
  // 3D mascot one-shot trigger (set inside the Three.js effect)
  const soraApiRef = useRef<{ play: (clip: 'hover' | 'agree') => void } | null>(null);
  const playMascot = (clip: 'hover' | 'agree') => soraApiRef.current?.play(clip);

  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      const addr = await connectWallet();
      if (addr) {
        setStoredWallet(addr);
        playMascot('agree'); // mascot reacts; stay on landing so the anim is visible
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setStoredWallet(null);
  };

  const shortAddr = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : null;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal on scroll
    const revealCleanup = (() => {
      const els = [...document.querySelectorAll<HTMLElement>('.sora-landing .reveal')];
      if (reduce) {
        els.forEach((e) => e.classList.add('in'));
        return () => {};
      }
      const io = new IntersectionObserver(
        (ents) => {
          ents.forEach((en) => {
            if (en.isIntersecting) {
              const t = en.target as HTMLElement;
              const sibs = [...t.parentElement!.querySelectorAll('.reveal')];
              t.style.transitionDelay = Math.min(sibs.indexOf(t), 5) * 70 + 'ms';
              t.classList.add('in');
              io.unobserve(t);
            }
          });
        },
        { threshold: 0.16 }
      );
      els.forEach((e) => io.observe(e));
      return () => io.disconnect();
    })();

    // Telemetry ticker
    let tickerId: ReturnType<typeof setInterval> | null = null;
    if (!reduce) {
      const f = (n: number) => n.toLocaleString('en-US');
      let rps = 12480,
        ops = 1204,
        waves = 38902,
        blocked = 11308;
      const $ = (id: string) => document.getElementById(id);
      const tRps = $('tRps'),
        tOps = $('tOps'),
        tWaves = $('tWaves'),
        ovRps = $('ovRps'),
        nBlocked = $('nBlocked');
      tickerId = setInterval(() => {
        rps += Math.round((Math.random() - 0.45) * 420);
        rps = Math.max(8200, Math.min(21000, rps));
        if (Math.random() > 0.7) ops += Math.random() > 0.5 ? 1 : -1;
        if (Math.random() > 0.55) waves++;
        if (Math.random() > 0.6) {
          blocked++;
          if (nBlocked) nBlocked.textContent = f(blocked);
        }
        if (tRps) tRps.textContent = f(rps);
        if (ovRps) ovRps.textContent = f(rps);
        if (tOps) tOps.textContent = f(ops);
        if (tWaves) tWaves.textContent = f(waves);
      }, 1400);
    }

    // Network canvas
    let raf: number | null = null;
    let resizeHandler: (() => void) | null = null;
    let pointerMove: ((e: PointerEvent) => void) | null = null;
    let pointerLeave: (() => void) | null = null;
    const canvas = document.getElementById('net') as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      let W = 0,
        H = 0,
        DPR = 1,
        t = 0;
      let nodes: any[] = [],
        edges: any[] = [],
        packets: any[] = [];
      const mouse = { x: -9999, y: -9999, on: false };
      const COL_NODE = 'rgba(150,165,190,',
        COL_HUB = '#ff5c8a',
        COL_LINE = 'rgba(120,140,175,',
        COL_GOOD = '#43e08a',
        COL_BAD = '#ff5a5f';

      function layout() {
        nodes = [];
        edges = [];
        packets = [];
        const N = Math.round(Math.min(70, Math.max(26, W / 20)));
        for (let i = 0; i < N; i++) {
          nodes.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.16,
            vy: (Math.random() - 0.5) * 0.16,
            hub: Math.random() < 0.16,
            glow: 0,
          });
        }
        const maxd = Math.min(W, H) * 0.22 + 50;
        for (let i = 0; i < nodes.length; i++)
          for (let j = i + 1; j < nodes.length; j++) {
            const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (d < maxd) edges.push({ a: i, b: j });
          }
      }
      function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        const r = canvas!.getBoundingClientRect();
        W = r.width;
        H = r.height;
        canvas!.width = W * DPR;
        canvas!.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        layout();
      }
      function spawn() {
        if (edges.length === 0) return;
        const e = edges[(Math.random() * edges.length) | 0];
        const bad = Math.random() < 0.13;
        packets.push({
          a: e.a,
          b: e.b,
          fwd: Math.random() < 0.5,
          p: Math.random() < 0.5,
          prog: 0,
          sp: 0.004 + Math.random() * 0.008,
          bad,
          flash: 0,
        });
      }
      function frame() {
        t++;
        ctx.clearRect(0, 0, W, H);
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
          n.x = Math.max(0, Math.min(W, n.x));
          n.y = Math.max(0, Math.min(H, n.y));
          const dm = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          n.glow = mouse.on && dm < 160 ? Math.max(n.glow, 1 - dm / 160) : n.glow * 0.92;
        }
        for (const e of edges) {
          const A = nodes[e.a],
            B = nodes[e.b];
          const d = Math.hypot(A.x - B.x, A.y - B.y);
          const a = Math.max(0, 0.18 - d / 2600);
          ctx.strokeStyle = COL_LINE + a.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();
        }
        if (mouse.on) {
          for (const n of nodes) {
            if (n.glow > 0.02) {
              ctx.strokeStyle = 'rgba(255,92,138,' + (n.glow * 0.5).toFixed(3) + ')';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(n.x, n.y);
              ctx.stroke();
            }
          }
        }
        if (t % 5 === 0 && packets.length < 70) spawn();
        for (const pk of packets) {
          pk.prog += pk.sp;
          const A = nodes[pk.fwd ? pk.a : pk.b],
            B = nodes[pk.fwd ? pk.b : pk.a];
          const x = A.x + (B.x - A.x) * pk.prog,
            y = A.y + (B.y - A.y) * pk.prog;
          if (pk.bad && B.hub && pk.prog > 0.86 && pk.flash === 0) pk.flash = 1;
          if (pk.flash > 0) {
            ctx.strokeStyle = 'rgba(255,90,95,' + pk.flash.toFixed(2) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(B.x, B.y, 10 * (1.3 - pk.flash), 0, 6.283);
            ctx.stroke();
            pk.flash -= 0.06;
            if (pk.flash <= 0) pk.prog = 2;
          } else {
            ctx.fillStyle = pk.bad ? COL_BAD : COL_GOOD;
            ctx.shadowBlur = 8;
            ctx.shadowColor = pk.bad ? COL_BAD : COL_GOOD;
            ctx.beginPath();
            ctx.arc(x, y, pk.bad ? 2.4 : 2, 0, 6.283);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        packets = packets.filter((pk) => pk.prog < 1);
        for (const n of nodes) {
          const g = n.glow;
          if (n.hub) {
            ctx.fillStyle = COL_HUB;
            ctx.shadowBlur = 12;
            ctx.shadowColor = COL_HUB;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 3 + g * 1.5, 0, 6.283);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = COL_NODE + (0.45 + g * 0.55).toFixed(2) + ')';
            if (g > 0.05) {
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#ff5c8a';
            }
            ctx.beginPath();
            ctx.arc(n.x, n.y, 1.5 + g * 1.3, 0, 6.283);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        raf = requestAnimationFrame(frame);
      }
      function staticFrame() {
        ctx.clearRect(0, 0, W, H);
        for (const e of edges) {
          const A = nodes[e.a],
            B = nodes[e.b];
          ctx.strokeStyle = COL_LINE + '0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();
        }
        for (const n of nodes) {
          ctx.fillStyle = n.hub ? COL_HUB : COL_NODE + '.5)';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.hub ? 3 : 1.6, 0, 6.283);
          ctx.fill();
        }
      }
      pointerMove = (e: PointerEvent) => {
        const r = canvas!.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.on = true;
      };
      pointerLeave = () => {
        mouse.on = false;
        mouse.x = mouse.y = -9999;
      };
      canvas.addEventListener('pointermove', pointerMove);
      canvas.addEventListener('pointerleave', pointerLeave);
      resizeHandler = () => {
        if (raf) cancelAnimationFrame(raf);
        resize();
        if (reduce) staticFrame();
        else frame();
      };
      window.addEventListener('resize', resizeHandler);
      resize();
      if (reduce) staticFrame();
      else frame();
    }

    return () => {
      revealCleanup();
      if (tickerId) clearInterval(tickerId);
      if (raf) cancelAnimationFrame(raf);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (canvas && pointerMove) canvas.removeEventListener('pointermove', pointerMove);
      if (canvas && pointerLeave) canvas.removeEventListener('pointerleave', pointerLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('hero-3d') as HTMLCanvasElement | null;
    if (!canvas || typeof window === 'undefined') return;

    // §8 perf gate — desktop only; mobile / reduced-motion keep the 2D portrait, never load 3D
    const lowEnd =
      window.innerWidth < 880 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lowEnd) {
      canvas.style.display = 'none';
      // let the fallback <img> flow so the panel keeps its height
      const fallback = document.getElementById('hero-fallback') as HTMLImageElement | null;
      if (fallback) { fallback.style.position = 'relative'; fallback.style.height = 'auto'; }
      return;
    }

    let raf: number | null = null;
    let onResize: (() => void) | null = null;
    let renderer: any = null;
    let controlsRef: any = null;
    let io: IntersectionObserver | null = null;
    let onVis: (() => void) | null = null;
    let disposed = false;
    let inView = true;
    let tabVisible = true;
    let pollId: ReturnType<typeof setInterval> | null = null;
    const isVisible = () => inView && tabVisible;

    const setup = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !THREE.GLTFLoader) return false;

      const scene = new THREE.Scene();
      // transparent canvas → CSS NOC backdrop behind her shows through (P1: fill the void)

      const w = canvas.clientWidth || 400;
      const h = canvas.clientHeight || 400;
      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 1000);
      camera.position.set(0, 0, 3.0);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
      if (THREE.ACESFilmicToneMapping !== undefined) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
      }

      // §6 lighting — key + pink rim from behind (brand + separates her from dark panel) + hemi fill
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(1.5, 2, 2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xff5c8a, 2.2);
      rim.position.set(-2, 1.2, -2);
      scene.add(rim);
      const fill = new THREE.HemisphereLight(0x8da0c0, 0x16181f, 0.7);
      scene.add(fill);

      const pivot = new THREE.Group();
      scene.add(pivot);

      // OrbitControls — drag to rotate, wheel to zoom (manual control kept)
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = 1.5;
      controls.maxDistance = 6;
      controls.target.set(0, 0, 0);
      controlsRef = controls;

      let model: any = null;
      let mixer: any = null;

      const loader = new THREE.GLTFLoader();
      loader.load(
        '/model-animation/idle-animation.glb',
        (gltf: any) => {
          if (disposed) return;
          model = gltf.scene;

          // Normalize: scale + center at origin
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale = 2.6 / maxDim;
          model.scale.setScalar(scale);
          model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

          pivot.add(model);

          // Three-quarter framing: head → ~thigh fills the panel (brief §6)
          const sH = size.y * scale;                  // scaled height, centered at origin
          const focusY = sH * 0.18;                   // aim a bit above center (chest/upper)
          const visible = sH * 0.62;                  // show ~62% of height (head→thigh)
          const fov = (camera.fov * Math.PI) / 180;
          const dist = (visible / 2) / Math.tan(fov / 2) * 1.06;
          camera.position.set(0, focusY, dist);
          controls.target.set(0, focusY, 0);
          controls.minDistance = dist * 0.55;         // allow zoom to bust
          controls.maxDistance = dist * 1.8;          // and out to full body
          controls.update();

          // Animation state machine: idle (loop) · hover (loop while engaged) · agree (one-shot)
          if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            const idleAction = mixer.clipAction(gltf.animations[0]);
            idleAction.setLoop(THREE.LoopRepeat, Infinity);
            idleAction.play();
            console.log('✓ idle clip playing');

            let hoverAction: any = null;     // lazy
            let agreeAction: any = null;     // lazy
            let activeLoop: any = idleAction; // current looping action (idle | hover)
            let agreePlaying = false;
            let pointerOver = false;
            let dragging = false;
            let finishHandler: ((e: any) => void) | null = null;

            const crossFade = (from: any, to: any, dur = 0.3) => {
              if (!to || from === to) return;
              to.reset();
              to.enabled = true;
              to.setEffectiveTimeScale(1);
              to.setEffectiveWeight(1);
              to.play();
              from.crossFadeTo(to, dur, false);
            };

            const ensureClip = async (name: 'hover' | 'agree') => {
              const url = name === 'hover'
                ? '/model-animation/hover-animation.glb'
                : '/model-animation/agree-animation.glb';
              try {
                const g = await loader.loadAsync(url);
                const clip = g.animations?.[0];
                if (!clip) { console.warn(`${name} GLB has no clip`); return null; }
                return mixer.clipAction(clip);
              } catch (err) {
                console.error(`failed to load ${name} clip`, err);
                return null;
              }
            };

            // engaged = cursor over the model OR dragging it → hover loop; else idle
            const syncEngage = async () => {
              if (disposed || !mixer || agreePlaying) return; // agree has priority
              const wantHover = pointerOver || dragging;
              if (wantHover) {
                if (!hoverAction) {
                  hoverAction = await ensureClip('hover');
                  if (!hoverAction) return;
                  hoverAction.setLoop(THREE.LoopRepeat, Infinity);
                }
                if (disposed || agreePlaying) return;
                if (activeLoop !== hoverAction) { crossFade(activeLoop, hoverAction, 0.25); activeLoop = hoverAction; }
              } else {
                if (activeLoop !== idleAction) { crossFade(activeLoop, idleAction, 0.3); activeLoop = idleAction; }
              }
            };

            const playAgree = async () => {
              if (disposed || !mixer) return;
              if (!agreeAction) {
                agreeAction = await ensureClip('agree');
                if (!agreeAction) return;
              }
              if (disposed || !mixer) return;
              agreeAction.reset();
              agreeAction.setLoop(THREE.LoopOnce, 1);
              agreeAction.clampWhenFinished = true;
              agreeAction.setEffectiveWeight(1);
              agreeAction.play();
              activeLoop.crossFadeTo(agreeAction, 0.25, false);
              agreePlaying = true;

              if (finishHandler) mixer.removeEventListener('finished', finishHandler);
              finishHandler = (e: any) => {
                if (e.action !== agreeAction) return;
                mixer.removeEventListener('finished', finishHandler!);
                finishHandler = null;
                agreePlaying = false;
                // return to whatever state we're in now (hover if still engaged, else idle)
                const back = (pointerOver || dragging) && hoverAction ? hoverAction : idleAction;
                back.reset(); back.enabled = true; back.setEffectiveWeight(1); back.play();
                agreeAction.crossFadeTo(back, 0.3, false);
                activeLoop = back;
              };
              mixer.addEventListener('finished', finishHandler);
            };

            // hover engage hooks — canvas hover/move + orbit drag
            const markOver = () => { if (!pointerOver) { pointerOver = true; syncEngage(); } };
            canvas.addEventListener('pointerenter', markOver);
            canvas.addEventListener('pointerover', markOver);
            canvas.addEventListener('pointermove', markOver); // covers cursor already inside on load
            canvas.addEventListener('pointerdown', markOver);
            canvas.addEventListener('pointerleave', () => { pointerOver = false; syncEngage(); });
            controls.addEventListener('start', () => { dragging = true; syncEngage(); });
            controls.addEventListener('end', () => { dragging = false; syncEngage(); });

            soraApiRef.current = { play: (clip) => { if (clip === 'agree') playAgree(); else syncEngage(); } };
          } else {
            console.warn('GLB has no animation clips');
          }

          const fallback = document.getElementById('hero-fallback') as HTMLImageElement | null;
          if (fallback) fallback.style.display = 'none';
          console.log('✓ 3D model loaded');
        },
        (xhr: any) => {
          if (xhr.total) console.log(`model ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
        },
        (error: any) => {
          console.error('✗ Failed to load 3D model:', error);
        }
      );

      const clock = new THREE.Clock();
      const animate = () => {
        raf = requestAnimationFrame(animate);
        if (!isVisible()) return; // pause when off-screen / tab hidden
        const dt = Math.min(clock.getDelta(), 0.1); // clamp to avoid jump after pause
        if (mixer) mixer.update(dt); // drive baked idle animation
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Pause loop when hero scrolls off-screen
      io = new IntersectionObserver(
        (ents) => { inView = ents[0]?.isIntersecting ?? true; },
        { threshold: 0.05 }
      );
      io.observe(canvas);

      // Pause when tab hidden, resume when shown
      onVis = () => { tabVisible = !document.hidden; };
      document.addEventListener('visibilitychange', onVis);

      onResize = () => {
        const nw = canvas.clientWidth || 400;
        const nh = canvas.clientHeight || 400;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      return true;
    };

    // Poll until CDN libs ready (scripts load async)
    if (!setup()) {
      pollId = setInterval(() => {
        if (setup()) {
          if (pollId) clearInterval(pollId);
          pollId = null;
        }
      }, 200);
      // give up after 10s
      setTimeout(() => { if (pollId) { clearInterval(pollId); pollId = null; } }, 10000);
    }

    return () => {
      disposed = true;
      soraApiRef.current = null;
      if (pollId) clearInterval(pollId);
      if (raf) cancelAnimationFrame(raf);
      if (onResize) window.removeEventListener('resize', onResize);
      if (onVis) document.removeEventListener('visibilitychange', onVis);
      if (io) io.disconnect();
      if (controlsRef) controlsRef.dispose();
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className="sora-landing">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <g id="mark">
            <path
              d="M7 21h13.5a5.2 5.2 0 0 0 .8-10.34A6.6 6.6 0 0 0 8.4 9.2 4.8 4.8 0 0 0 7 21Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M5 16.2h3l1.6-3.4 2.3 6 1.7-3.1 1.3 1.5H21"
              fill="none"
              stroke="#ff5c8a"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </defs>
      </svg>

      <header>
        <div className="wrap bar">
          <a className="brand" href="#top">
            <svg width="26" height="26" viewBox="0 0 26 26" style={{ color: '#fff' }}>
              <use href="#mark" />
            </svg>{' '}
            SORA
          </a>
          <nav className="nav">
            <a href="#play">PLAY</a>
            <a href="#network">NETWORK</a>
            <a href="#how">HOW IT WORKS</a>
            <Link href="/leaderboard">LEADERBOARD</Link>
            <a href="#token">$SORA</a>
          </nav>
          <div className="spacer"></div>
          <div className="status-chip">
            <span className="dot"></span> ALL SYSTEMS OPERATIONAL
          </div>
          <ThemeToggle />
          {wallet ? (
            <button className="btn btn-pink" type="button" onClick={handleDisconnect} title="Click to disconnect">
              {shortAddr}
            </button>
          ) : (
            <button className="btn btn-pink" type="button" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect wallet'}
            </button>
          )}
        </div>
      </header>

      <a id="top"></a>
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="eyebrow load-in d1">
              <span className="dot"></span> Uptime: 99.99% · 0 critical
            </span>
            <h1 className="load-in d2">
              Keep the
              <br />
              servers <span className="hl">alive.</span>
            </h1>
            <p className="lede load-in d3">
              <b>$SORA</b> is an on-chain survival game about the infrastructure that actually runs
              the internet. Route the traffic. Block the DDoS. Scale before the wave hits — and
              climb the global leaderboard.
            </p>
            <div className="cta-row load-in d4">
              <button
                className="btn btn-pink btn-lg"
                type="button"
                onClick={wallet ? () => router.push('/play') : handleConnect}
                disabled={connecting}
              >
                ▶ {connecting ? 'Connecting…' : wallet ? 'Launch console' : 'Connect & play'}
              </button>
              <a className="btn btn-ghost btn-lg" href="#token">
                View on pump.fun
              </a>
            </div>
            <p className="ticker-note load-in d4">
              ticker <span>$SORA</span> · solana · fair launch on pump.fun
            </p>
            <div className="trust-strip load-in d4">
              <span><span className="dot" style={{ width: 6, height: 6 }}></span> Fair launch</span>
              <span className="sep">·</span>
              <span>No presale</span>
              <span className="sep">·</span>
              <span>No team allocation</span>
              <span className="sep">·</span>
              <span>MIT open-source</span>
            </div>
          </div>
          <div className="console load-in d3" id="play">
            <div className="console-top">
              <span className="tdot"></span>
              <span className="tdot"></span>
              <span className="tdot"></span>
              <span className="tlabel">sora://noc/live-feed</span>
            </div>
            <div className="console-body">
              <canvas id="hero-3d" style={{ width: '100%', aspectRatio: '1 / 1', display: 'block' }}></canvas>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="hero-fallback"
                src="/sora-hero.jpg"
                alt="Sora, the NOC operator, at her datacenter ops desk with her server-unit companion"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="ov ov-up">
                <div className="big">99.99%</div>
                <div className="cap">uptime</div>
              </div>
              <div className="ov ov-rps">
                <div className="big">
                  <span id="ovRps">12,480</span>/s
                </div>
                <div className="cap">requests handled</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap">
        <div className="telemetry-cap reveal">
          <span className="dot amber"></span> SIMULATED NOC FEED · in-game telemetry, not live user metrics
        </div>
        <div className="telemetry reveal">
          <div className="tcell">
            <div className="num c-green">99.99%</div>
            <div className="lbl">Uptime</div>
          </div>
          <div className="tcell">
            <div className="num c-pink" id="tRps">
              12,480
            </div>
            <div className="lbl">Requests / sec</div>
          </div>
          <div className="tcell">
            <div className="num" id="tOps">
              1,204
            </div>
            <div className="lbl">Operators (sim)</div>
          </div>
          <div className="tcell">
            <div className="num c-amber" id="tWaves">
              38,902
            </div>
            <div className="lbl">DDoS waves blocked</div>
          </div>
        </div>
      </div>

      <div className="marquee-band">
        <div className="marquee-label">
          <span className="dotp"></span>RUNNING ON REAL INFRASTRUCTURE
        </div>
        <div className="marquee-viewport">
          <div className="marquee-track rev" style={{ animationDuration: '18s' }}>
            <div className="marquee-group">
              <div className="mq-brand">
                <PumpIcon size={24} style={{ flexShrink: 0 }} />
                <span>pump.fun</span>
              </div>
              <div className="mq-brand">
                <PhantomIcon size={24} style={{ flexShrink: 0 }} />
                <span>Phantom</span>
              </div>
              <div className="mq-brand">
                <NextIcon size={24} style={{ flexShrink: 0 }} />
                <span>Next.js</span>
              </div>
              <div className="mq-brand">
                <SiThreedotjs size={24} style={{ flexShrink: 0 }} />
                <span>Three.js</span>
              </div>
              <div className="mq-brand">
                <VercelIcon size={24} style={{ flexShrink: 0 }} />
                <span>Vercel</span>
              </div>
            </div>
            <div className="marquee-group">
              <div className="mq-brand">
                <PumpIcon size={24} style={{ flexShrink: 0 }} />
                <span>pump.fun</span>
              </div>
              <div className="mq-brand">
                <PhantomIcon size={24} style={{ flexShrink: 0 }} />
                <span>Phantom</span>
              </div>
              <div className="mq-brand">
                <NextIcon size={24} style={{ flexShrink: 0 }} />
                <span>Next.js</span>
              </div>
              <div className="mq-brand">
                <SiThreedotjs size={24} style={{ flexShrink: 0 }} />
                <span>Three.js</span>
              </div>
              <div className="mq-brand">
                <VercelIcon size={24} style={{ flexShrink: 0 }} />
                <span>Vercel</span>
              </div>
            </div>
            <div className="marquee-group">
              <div className="mq-brand">
                <PumpIcon size={24} style={{ flexShrink: 0 }} />
                <span>pump.fun</span>
              </div>
              <div className="mq-brand">
                <PhantomIcon size={24} style={{ flexShrink: 0 }} />
                <span>Phantom</span>
              </div>
              <div className="mq-brand">
                <NextIcon size={24} style={{ flexShrink: 0 }} />
                <span>Next.js</span>
              </div>
              <div className="mq-brand">
                <SiThreedotjs size={24} style={{ flexShrink: 0 }} />
                <span>Three.js</span>
              </div>
              <div className="mq-brand">
                <VercelIcon size={24} style={{ flexShrink: 0 }} />
                <span>Vercel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <section id="network" style={{ paddingBottom: 36 }}>
          <span className="sec-eyebrow reveal">The mesh</span>
          <h2 className="reveal">
            Every operator is a node.
            <br />
            Move your cursor through it.
          </h2>
          <p className="sec-sub reveal">
            This is the live operator network — nodes routing traffic to each other in real time.
            Green packets are good requests. Red ones are attacks, snapped at the hubs before they
            land. Drag your mouse across it.
          </p>
          <div className="network reveal">
            <canvas id="net"></canvas>
            <div className="net-overlay">
              <div className="net-stats">
                <div className="net-stat">
                  <div className="n c-green" id="nNodes">
                    512
                  </div>
                  <div className="l">Nodes online</div>
                </div>
                <div className="net-stat">
                  <div className="n c-pink">2.4M</div>
                  <div className="l">Packets routed</div>
                </div>
                <div className="net-stat">
                  <div className="n c-amber" id="nBlocked">
                    11,308
                  </div>
                  <div className="l">Attacks blocked</div>
                </div>
              </div>
              <div className="net-hint">◖ move cursor — nodes connect to you</div>
            </div>
          </div>
          <div className="net-legend reveal">
            <span>
              <span className="lg g"></span> good traffic
            </span>
            <span>
              <span className="lg p"></span> hub / your link
            </span>
            <span>
              <span className="lg r"></span> blocked attack
            </span>
          </div>
        </section>
      </div>

      <div className="marquee-band">
        <div className="marquee-label">
          <span className="dotp"></span>13 SERVICES
          <span className="mq-sep">·</span>ENDLESS TRAFFIC
        </div>
        <div className="marquee-viewport">
          <div className="marquee-track rev" style={{ animationDuration: '16s' }}>
            <div className="marquee-group">
              <div className="mq-svc">
                <SiRedis size={24} style={{ flexShrink: 0 }} />
                <span>Storage</span>
              </div>
              <div className="mq-svc">
                <SiPostgresql size={24} style={{ flexShrink: 0 }} />
                <span>Search</span>
              </div>
              <div className="mq-svc">
                <SiPostgresql size={24} style={{ flexShrink: 0 }} />
                <span>Read Replica</span>
              </div>
              <div className="mq-svc">
                <SiNginx size={24} style={{ flexShrink: 0 }} />
                <span>API Gateway</span>
              </div>
              <div className="mq-svc">
                <SiRabbitmq size={24} style={{ flexShrink: 0 }} />
                <span>Queue</span>
              </div>
            </div>
            <div className="marquee-group">
              <div className="mq-svc">
                <SiRedis size={24} style={{ flexShrink: 0 }} />
                <span>Storage</span>
              </div>
              <div className="mq-svc">
                <SiPostgresql size={24} style={{ flexShrink: 0 }} />
                <span>Search</span>
              </div>
              <div className="mq-svc">
                <SiPostgresql size={24} style={{ flexShrink: 0 }} />
                <span>Read Replica</span>
              </div>
              <div className="mq-svc">
                <SiNginx size={24} style={{ flexShrink: 0 }} />
                <span>API Gateway</span>
              </div>
              <div className="mq-svc">
                <SiRabbitmq size={24} style={{ flexShrink: 0 }} />
                <span>Queue</span>
              </div>
            </div>
            <div className="marquee-group">
              <div className="mq-svc">
                <SiRedis size={24} style={{ flexShrink: 0 }} />
                <span>Storage</span>
              </div>
              <div className="mq-svc">
                <SiPostgresql size={24} style={{ flexShrink: 0 }} />
                <span>Search</span>
              </div>
              <div className="mq-svc">
                <SiPostgresql size={24} style={{ flexShrink: 0 }} />
                <span>Read Replica</span>
              </div>
              <div className="mq-svc">
                <SiNginx size={24} style={{ flexShrink: 0 }} />
                <span>API Gateway</span>
              </div>
              <div className="mq-svc">
                <SiRabbitmq size={24} style={{ flexShrink: 0 }} />
                <span>Queue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <section id="how">
          <span className="sec-eyebrow reveal">The loop</span>
          <h2 className="reveal">
            Four moves between you
            <br />
            and a 500 error.
          </h2>
          <p className="sec-sub reveal">
            Every run is the same job a real ops team does at 3am — just faster, and with your score
            on-chain. The pressure only goes one direction: up.
          </p>
          <div className="steps">
            <div className="step reveal">
              <div className="idx">01</div>
              <h3>Traffic floods in</h3>
              <p>
                Reads, writes, uploads, searches — and red packets hiding among them. The rate
                climbs every minute.
              </p>
              <span className="tag">escalating RPS surges</span>
            </div>
            <div className="step reveal">
              <div className="idx">02</div>
              <h3>Build your stack</h3>
              <p>
                Place firewalls, load balancers, caches, CDNs, databases and serverless. Spend smart
                — upkeep can bankrupt you.
              </p>
              <span className="tag">13 services</span>
            </div>
            <div className="step reveal">
              <div className="idx">03</div>
              <h3>Survive the wave</h3>
              <p>
                DDoS spikes, cost shocks, capacity drops. Repair, reroute, throttle. Stay green or
                watch reputation bleed out.
              </p>
              <span className="tag">−1.0 rep / failure</span>
            </div>
            <div className="step reveal">
              <div className="idx">04</div>
              <h3>Climb the board</h3>
              <p>
                Your survival score is signed by your wallet and ranked globally. Seasons reset.
                Legends persist.
              </p>
              <span className="tag">wallet-signed</span>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap">
        <section id="token">
          <span className="sec-eyebrow reveal">The token</span>
          <h2 className="reveal">
            $SORA earns its place
            <br />
            on the stack.
          </h2>
          <p className="sec-sub reveal">
            No fake utility. The token does specific jobs inside the game — and nothing it can&apos;t
            actually back.
          </p>
          <div className="token-grid">
            <div className="util">
              <div className="ucard reveal">
                <div className="h">
                  <span className="ic"></span> Tournament entry
                </div>
                <p>Buy into ranked seasons and timed events. Bigger pools, harder waves.</p>
              </div>
              <div className="ucard reveal">
                <div className="h">
                  <span className="ic"></span> Season pass
                </div>
                <p>Unlock ranked play, stat tracking, and a permanent operator profile.</p>
              </div>
              <div className="ucard reveal">
                <div className="h">
                  <span className="ic"></span> Cosmetics
                </div>
                <p>Skins for Sora, your server-unit companion, and your console theme.</p>
              </div>
              <div className="ucard reveal">
                <div className="h">
                  <span className="ic"></span> Governance
                </div>
                <p>Vote on which service, mode, or map ships next. Operators steer the roadmap.</p>
              </div>
            </div>
            <div className="token-side reveal">
              <div className="tk">
                <span className="d">$</span>SORA
              </div>
              <p className="desc">
                Fair launch on pump.fun. No presale, no team allocation games — just the console,
                the board, and the community running it.
              </p>
              <div className="ca">
                <span className="lbl">CONTRACT</span>
                <span className="val">pump.fun — TBA at launch</span>
              </div>
              <button
                className="btn btn-pink"
                onClick={() => window.open('https://pump.fun', '_blank')}
              >
                Launch on pump.fun →
              </button>
              <p className="note">
                Cosmetic and access utility only. $SORA is a community token with no expectation of
                profit or yield. Nothing here is financial advice — do your own research.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap">
        <section id="about" style={{ paddingTop: 20 }}>
          <span className="sec-eyebrow reveal">Built in the open</span>
          <h2 className="reveal">
            We didn&apos;t hide the source.
            <br />
            We&apos;re proud of it.
          </h2>
          <div className="about reveal">
            <svg
              className="mark"
              width="54"
              height="54"
              viewBox="0 0 26 26"
              style={{ color: '#fff' }}
            >
              <use href="#mark" />
            </svg>
            <p>
              Sora&apos;s gameplay is built on <b>Server Survival</b>, the open-source
              cloud-architecture game by <b>pshenok</b>, used and extended under its{' '}
              <b>MIT license</b>. We forked it openly, kept the attribution, and wrapped it in an
              on-chain leaderboard, a season system, and a face. Respect to the original — go star
              it:{' '}
              <a
                className="src"
                href="https://github.com/pshenok/server-survival"
                target="_blank"
                rel="noreferrer"
              >
                github.com/pshenok/server-survival
              </a>
              .
            </p>
          </div>
        </section>
      </div>

      <footer>
        <div className="wrap foot">
          <div className="l">
            <svg width="22" height="22" viewBox="0 0 26 26" style={{ color: '#fff' }}>
              <use href="#mark" />
            </svg>{' '}
            SORA
          </div>
          <div className="links">
            <a href="/play">Play</a>
            <a href="#network">Network</a>
            <a href="#token">$SORA</a>
            <a href="https://pump.fun" target="_blank" rel="noreferrer">
              pump.fun
            </a>
            <a href="https://github.com/pshenok/server-survival" target="_blank" rel="noreferrer">
              Source
            </a>
          </div>
          <div className="fine">● stay online</div>
        </div>
      </footer>
    </div>
  );
}
