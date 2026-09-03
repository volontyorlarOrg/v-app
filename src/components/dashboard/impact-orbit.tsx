"use client";

import { useEffect, useRef } from "react";

export function ImpactOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.WebGLRenderingContext) return;

    let disposed = false;
    let cleanup = () => {};

    async function mount() {
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      const group = new THREE.Group();
      const nodes = new THREE.Group();
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const parent = canvas.parentElement;
      let frame = 0;
      let visible = true;

      camera.position.set(0, 0, 5.4);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const colors = getComputedStyle(document.documentElement);
      const primary = new THREE.Color(
        colors.getPropertyValue("--color-primary").trim(),
      );
      const accent = new THREE.Color(colors.getPropertyValue("--color-accent").trim());
      const muted = new THREE.Color(
        colors.getPropertyValue("--color-primary-muted").trim(),
      );
      const coreMaterial = new THREE.MeshStandardMaterial({
        color: primary,
        metalness: 0.15,
        roughness: 0.42,
        flatShading: true,
      });
      const primaryMaterial = new THREE.MeshStandardMaterial({
        color: primary,
        metalness: 0.08,
        roughness: 0.5,
      });
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.08,
        roughness: 0.5,
      });
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: muted,
        transparent: true,
        opacity: 0.8,
      });
      const coreGeometry = new THREE.IcosahedronGeometry(0.78, 1);
      const ringGeometry = new THREE.TorusGeometry(1.42, 0.022, 8, 96);
      const nodeGeometry = new THREE.SphereGeometry(0.115, 20, 20);
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      const firstRing = new THREE.Mesh(ringGeometry, ringMaterial);
      const secondRing = new THREE.Mesh(ringGeometry, ringMaterial);

      firstRing.rotation.x = 1.12;
      firstRing.rotation.z = 0.22;
      secondRing.rotation.x = 0.55;
      secondRing.rotation.y = 0.9;
      group.add(core, firstRing, secondRing, nodes);

      const nodePositions = [
        [1.42, 0, 0],
        [-0.7, 1.05, 0.72],
        [-0.9, -0.92, -0.58],
        [0.58, -0.72, 1.05],
      ] as const;

      nodePositions.forEach((position, index) => {
        const node = new THREE.Mesh(
          nodeGeometry,
          index === 1 ? accentMaterial : primaryMaterial,
        );
        node.position.set(position[0], position[1], position[2]);
        nodes.add(node);
      });

      scene.add(group);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x102030, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(2.5, 3.5, 4);
      scene.add(keyLight);

      function resize() {
        if (!parent) return;
        const { width, height } = parent.getBoundingClientRect();
        renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      }

      function render(time = 0) {
        group.rotation.y = media.matches ? 0.32 : time * 0.00016;
        group.rotation.x = -0.18;
        nodes.rotation.z = media.matches ? 0.12 : time * -0.0001;
        renderer.render(scene, camera);
      }

      function animate(time: number) {
        render(time);
        if (visible && !media.matches && !document.hidden) {
          frame = window.requestAnimationFrame(animate);
        }
      }

      function start() {
        window.cancelAnimationFrame(frame);
        if (visible && !media.matches && !document.hidden) {
          frame = window.requestAnimationFrame(animate);
        } else {
          render();
        }
      }

      const resizeObserver = new ResizeObserver(() => {
        resize();
        render();
      });
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false;
        start();
      });
      const themeObserver = new MutationObserver(() => {
        const next = getComputedStyle(document.documentElement);
        coreMaterial.color.set(next.getPropertyValue("--color-primary").trim());
        primaryMaterial.color.set(next.getPropertyValue("--color-primary").trim());
        accentMaterial.color.set(next.getPropertyValue("--color-accent").trim());
        ringMaterial.color.set(next.getPropertyValue("--color-primary-muted").trim());
        render();
      });
      const onVisibility = () => start();

      resizeObserver.observe(parent ?? canvas);
      visibilityObserver.observe(canvas);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      media.addEventListener("change", start);
      document.addEventListener("visibilitychange", onVisibility);
      resize();
      start();

      cleanup = () => {
        window.cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        themeObserver.disconnect();
        media.removeEventListener("change", start);
        document.removeEventListener("visibilitychange", onVisibility);
        coreGeometry.dispose();
        ringGeometry.dispose();
        nodeGeometry.dispose();
        coreMaterial.dispose();
        primaryMaterial.dispose();
        accentMaterial.dispose();
        ringMaterial.dispose();
        renderer.dispose();
      };
    }

    void mount().catch(() => undefined);
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="impact-orbit" aria-hidden="true">
      <span className="impact-orbit-core" />
      <span className="impact-orbit-node impact-orbit-node-a" />
      <span className="impact-orbit-node impact-orbit-node-b" />
      <span className="impact-orbit-node impact-orbit-node-c" />
      <span className="impact-orbit-node impact-orbit-node-d" />
      <canvas ref={canvasRef} />
    </div>
  );
}
