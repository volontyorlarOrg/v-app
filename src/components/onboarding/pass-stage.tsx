"use client";

import { useEffect, useRef } from "react";
import type {
  BufferGeometry,
  Group,
  Material,
  MeshStandardMaterial,
  Shape,
} from "three";

import { ICON_GLYPH, ICON_HEART } from "@/components/brand/logo-paths";
import { PASS_PART_KEYS, type PassParts } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";
import { VolunteerPassBadge } from "@/components/onboarding/volunteer-pass-badge";

type PassScene = {
  setParts: (parts: PassParts, animate: boolean) => void;
};

const SWING_STIFFNESS = 11;
const SWING_DAMPING = 1.35;
const IDLE_SWING = 0.03;
const BASE_YAW = 0.2;
const PART_SPEED = 5.5;
const GLYPH_CENTER = { x: 497.93, y: 556.07 };
const GLYPH_HEIGHT = 555.32;

function easeOut(value: number): number {
  return 1 - (1 - value) ** 3;
}

export function PassStage({
  parts,
  className,
}: {
  parts: PassParts;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PassScene | null>(null);
  const partsRef = useRef(parts);

  useEffect(() => {
    partsRef.current = parts;
  }, [parts]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !window.WebGLRenderingContext) return;

    let disposed = false;
    let cleanup = () => {};

    async function mount() {
      const [THREE, { SVGLoader }] = await Promise.all([
        import("three"),
        import("three/addons/loaders/SVGLoader.js"),
      ]);
      if (disposed || !stage || !canvas) return;

      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const finePointer = window.matchMedia("(pointer: fine)");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });

      camera.position.set(0, 0.05, 8.8);
      camera.lookAt(0, -0.3, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const geometries: BufferGeometry[] = [];
      const materials = new Map<Material, string>();

      const tokenColor = (token: string) =>
        new THREE.Color(
          getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-${token}`)
            .trim(),
        );

      const material = (token: string, roughness = 0.55) => {
        const created = new THREE.MeshStandardMaterial({
          color: tokenColor(token),
          roughness,
          metalness: 0.04,
          transparent: true,
        });
        materials.set(created, token);
        return created;
      };

      const keep = <T extends BufferGeometry>(geometry: T) => {
        geometries.push(geometry);
        return geometry;
      };

      const roundedRect = (width: number, height: number, radius: number) => {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        shape.moveTo(x + radius, y);
        shape.lineTo(x + width - radius, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + radius);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);
        return shape;
      };

      const topRoundedRect = (width: number, height: number, radius: number) => {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        shape.moveTo(x, y);
        shape.lineTo(x + width, y);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y);
        return shape;
      };

      const plate = (shape: Shape, depth: number, originLeft = false, width = 0) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: false,
          curveSegments: 12,
        });
        geometry.translate(originLeft ? width / 2 : 0, 0, -depth / 2);
        return keep(geometry);
      };

      const bar = (width: number, height: number) =>
        plate(roundedRect(width, height, height / 2), 0.02, true, width);

      const mesh = (
        geometry: BufferGeometry,
        surface: Material,
        x: number,
        y: number,
        z: number,
      ) => {
        const created = new THREE.Mesh(geometry, surface);
        created.position.set(x, y, z);
        return created;
      };

      const glyphShapes = (path: string) =>
        new SVGLoader()
          .parse(
            `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${path}"/></svg>`,
          )
          .paths.flatMap((parsed) => SVGLoader.createShapes(parsed));

      const brandGlyph = (height: number, letters: Material, heart: Material) => {
        const group = new THREE.Group();
        const scale = height / GLYPH_HEIGHT;
        const depth = 0.02 / scale;
        for (const [path, surface] of [
          [ICON_GLYPH, letters],
          [ICON_HEART, heart],
        ] as const) {
          const geometry = new THREE.ExtrudeGeometry(glyphShapes(path), {
            depth,
            bevelEnabled: false,
            curveSegments: 8,
          });
          geometry.translate(-GLYPH_CENTER.x, -GLYPH_CENTER.y, -depth / 2);
          geometry.rotateX(Math.PI);
          geometry.scale(scale, scale, scale);
          group.add(new THREE.Mesh(keep(geometry), surface));
        }
        return group;
      };

      const pivot = new THREE.Group();
      const pass = new THREE.Group();
      const card = new THREE.Group();
      pivot.position.set(0, 3.1, 0);
      pass.position.set(0, -3.1, 0);
      pivot.add(pass);
      scene.add(pivot);

      const lanyardMaterial = material("primary", 0.7);
      const clipMaterial = material("primary-deep", 0.4);
      const cardMaterial = material("surface", 0.62);
      const rimMaterial = material("border-control", 0.85);
      const bandMaterial = material("primary", 0.5);
      const knockoutMaterial = material("knockout", 0.6);
      const heartMaterial = material("logo-orange", 0.5);
      const tileMaterial = material("primary-muted", 0.7);
      const silhouetteMaterial = material("primary", 0.6);

      for (const side of [-1, 1] as const) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 1.05, 3.6, -0.06),
          new THREE.Vector3(side * 0.62, 2.55, 0.02),
          new THREE.Vector3(side * 0.05, 1.42, 0.0),
        ]);
        pass.add(
          new THREE.Mesh(
            keep(new THREE.TubeGeometry(curve, 24, 0.045, 10, false)),
            lanyardMaterial,
          ),
        );
      }
      pass.add(
        mesh(keep(new THREE.BoxGeometry(0.3, 0.22, 0.14)), clipMaterial, 0, 1.3, 0),
      );
      const ring = mesh(
        keep(new THREE.TorusGeometry(0.1, 0.028, 10, 30)),
        clipMaterial,
        0,
        1.12,
        0,
      );
      pass.add(ring);

      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 256;
      shadowCanvas.height = 320;
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      shadowTexture.colorSpace = THREE.SRGBColorSpace;
      const shadowMaterial = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      });
      const paintShadow = () => {
        const context = shadowCanvas.getContext("2d");
        if (!context) return;
        const dark = document.documentElement.dataset.theme === "dark";
        const channels = tokenColor("primary-deep").getStyle().slice(4, -1);
        const alpha = (value: number) => `rgba(${channels}, ${value})`;
        const half = shadowCanvas.width / 2;
        context.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
        context.save();
        context.translate(half, shadowCanvas.height / 2);
        context.scale(1, shadowCanvas.height / shadowCanvas.width);
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, half);
        gradient.addColorStop(0, alpha(dark ? 0.12 : 0.2));
        gradient.addColorStop(0.5, alpha(dark ? 0.05 : 0.09));
        gradient.addColorStop(1, alpha(0));
        context.fillStyle = gradient;
        context.fillRect(-half, -half, shadowCanvas.width, shadowCanvas.width);
        context.restore();
        shadowTexture.needsUpdate = true;
      };
      paintShadow();

      card.position.set(0, -0.36, 0);
      pass.add(card);
      card.add(
        mesh(keep(new THREE.PlaneGeometry(2.8, 3.5)), shadowMaterial, 0.12, -0.2, -0.3),
      );
      card.add(
        mesh(plate(roundedRect(2.16, 3.06, 0.2), 0.06), rimMaterial, 0, 0, -0.012),
      );
      card.add(mesh(plate(roundedRect(2.1, 3.0, 0.18), 0.08), cardMaterial, 0, 0, 0));
      const band = mesh(
        plate(topRoundedRect(2.1, 0.66, 0.18), 0.02),
        bandMaterial,
        0,
        1.17,
        0.05,
      );
      card.add(band);
      const glyph = brandGlyph(0.36, knockoutMaterial, heartMaterial);
      glyph.position.set(0, 1.17, 0.075);
      card.add(glyph);

      card.add(
        mesh(
          plate(roundedRect(0.62, 0.62, 0.1), 0.02),
          tileMaterial,
          -0.62,
          0.42,
          0.05,
        ),
      );
      card.add(
        mesh(
          keep(new THREE.SphereGeometry(0.11, 20, 20)),
          silhouetteMaterial,
          -0.62,
          0.5,
          0.085,
        ),
      );
      const shoulders = mesh(
        keep(new THREE.SphereGeometry(0.21, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
        silhouetteMaterial,
        -0.62,
        0.17,
        0.07,
      );
      shoulders.scale.set(1, 0.8, 0.45);
      card.add(shoulders);

      const partGroups = new Map<keyof PassParts, Group>();
      const partMaterials = new Map<keyof PassParts, Material[]>();
      const partKinds = new Map<keyof PassParts, "print" | "pop" | "stamp">();

      const part = (key: keyof PassParts, kind: "print" | "pop" | "stamp") => {
        const group = new THREE.Group();
        card.add(group);
        partGroups.set(key, group);
        partMaterials.set(key, []);
        partKinds.set(key, kind);
        const surface = (token: string, roughness?: number) => {
          const created = material(token, roughness);
          partMaterials.get(key)?.push(created);
          return created;
        };
        return { group, surface };
      };

      {
        const { group, surface } = part("name", "print");
        const ink = surface("ink", 0.7);
        const muted = surface("ink-muted", 0.7);
        group.add(mesh(bar(0.98, 0.13), ink, -0.2, 0.58, 0.06));
        group.add(mesh(bar(0.74, 0.09), muted, -0.2, 0.38, 0.06));
        group.add(mesh(bar(0.52, 0.09), muted, -0.2, 0.22, 0.06));
      }
      {
        const { group, surface } = part("place", "print");
        const pin = surface("primary", 0.5);
        const muted = surface("ink-muted", 0.7);
        const cone = mesh(
          keep(new THREE.ConeGeometry(0.07, 0.16, 16)),
          pin,
          -0.85,
          -0.2,
          0.07,
        );
        cone.rotation.x = Math.PI;
        group.add(cone);
        group.add(
          mesh(keep(new THREE.SphereGeometry(0.07, 16, 16)), pin, -0.85, -0.08, 0.07),
        );
        group.add(mesh(bar(1.34, 0.09), muted, -0.66, -0.14, 0.06));
      }
      {
        const { group, surface } = part("languages", "pop");
        const chip = surface("primary-muted", 0.7);
        const widths = [0.44, 0.36, 0.52] as const;
        let x = -0.94;
        for (const width of widths) {
          group.add(
            mesh(
              plate(roundedRect(width, 0.18, 0.09), 0.02),
              chip,
              x + width / 2,
              -0.5,
              0.06,
            ),
          );
          x += width + 0.09;
        }
      }
      {
        const { group, surface } = part("contact", "print");
        const tone = surface("primary", 0.5);
        const muted = surface("ink-muted", 0.7);
        group.add(
          mesh(
            keep(new THREE.TorusGeometry(0.062, 0.024, 10, 24)),
            tone,
            -0.85,
            -0.86,
            0.07,
          ),
        );
        group.add(mesh(bar(1.12, 0.09), muted, -0.66, -0.86, 0.06));
      }
      {
        const { group, surface } = part("sealed", "stamp");
        const seal = surface("accent", 0.45);
        const knockout = surface("knockout", 0.6);
        const disc = mesh(
          keep(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 48)),
          seal,
          0,
          0,
          0,
        );
        disc.rotation.x = Math.PI / 2;
        group.add(disc);
        group.add(
          mesh(keep(new THREE.TorusGeometry(0.31, 0.02, 10, 48)), knockout, 0, 0, 0.03),
        );
        const sealGlyph = brandGlyph(0.26, knockout, knockout);
        sealGlyph.position.set(0, 0, 0.035);
        group.add(sealGlyph);
        group.position.set(0.56, -1.0, 0.12);
        group.rotation.z = -0.24;
      }

      scene.add(new THREE.HemisphereLight(0xffffff, 0x102030, 2.1));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.set(-2.5, 3.5, 4.5);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
      fillLight.position.set(3, -1, 3);
      scene.add(fillLight);

      const partValue = new Map<keyof PassParts, number>();
      const partTarget = new Map<keyof PassParts, number>();
      const stamped = new Set<keyof PassParts>();
      for (const key of PASS_PART_KEYS) {
        partValue.set(key, 0);
        partTarget.set(key, 0);
      }

      let frame = 0;
      let visible = true;
      let lastTime = 0;
      let swingAngle = 0;
      let swingVelocity = 0;
      let yaw = BASE_YAW;
      let pitch = 0;
      let targetYaw = BASE_YAW;
      let targetPitch = 0;
      const sealBase =
        partGroups.get("sealed")?.position.clone() ?? new THREE.Vector3();

      const applyPart = (key: keyof PassParts, value: number) => {
        const group = partGroups.get(key);
        if (!group) return;
        const eased = easeOut(value);
        group.visible = value > 0.001;
        for (const surface of partMaterials.get(key) ?? []) {
          surface.opacity = Math.min(1, eased * 1.6);
        }
        const kind = partKinds.get(key);
        if (kind === "print") {
          group.scale.set(Math.max(eased, 0.001), 1, 1);
        } else if (kind === "pop") {
          const scale = 0.5 + 0.5 * eased;
          group.scale.set(scale, scale, scale);
        } else if (kind === "stamp") {
          const scale = 1.9 - 0.9 * eased;
          group.scale.set(scale, scale, scale);
          group.position.set(sealBase.x, sealBase.y, sealBase.z + 1.3 * (1 - eased));
          if (eased > 0.88 && !stamped.has(key)) {
            stamped.add(key);
            swingVelocity -= 1.5;
          }
        }
      };

      const tweening = () =>
        PASS_PART_KEYS.some(
          (key) =>
            Math.abs((partTarget.get(key) ?? 0) - (partValue.get(key) ?? 0)) > 0.002,
        );

      function render(time: number) {
        const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
        lastTime = time;
        const reduced = media.matches;

        for (const key of PASS_PART_KEYS) {
          const target = partTarget.get(key) ?? 0;
          const current = partValue.get(key) ?? 0;
          const next = reduced
            ? target
            : current + (target - current) * Math.min(1, delta * PART_SPEED);
          const settled = Math.abs(target - next) < 0.002 ? target : next;
          partValue.set(key, settled);
          applyPart(key, settled);
        }

        if (reduced) {
          pivot.rotation.z = 0;
          pass.rotation.y = BASE_YAW * 0.6;
          pass.rotation.x = 0;
        } else {
          const acceleration =
            -SWING_STIFFNESS * swingAngle - SWING_DAMPING * swingVelocity;
          swingVelocity += acceleration * delta;
          swingAngle += swingVelocity * delta;
          pivot.rotation.z = swingAngle + IDLE_SWING * Math.sin(time * 0.0011);
          yaw += (targetYaw - yaw) * Math.min(1, delta * 4);
          pitch += (targetPitch - pitch) * Math.min(1, delta * 4);
          pass.rotation.y = yaw + 0.05 * Math.sin(time * 0.0007);
          pass.rotation.x = pitch;
        }

        renderer.render(scene, camera);
      }

      const shouldLoop = () =>
        visible && !document.hidden && (!media.matches || tweening());

      function animate(time: number) {
        render(time);
        frame = shouldLoop() ? window.requestAnimationFrame(animate) : 0;
      }

      function start() {
        window.cancelAnimationFrame(frame);
        lastTime = 0;
        if (shouldLoop()) {
          frame = window.requestAnimationFrame(animate);
        } else {
          render(performance.now());
        }
      }

      function resize() {
        if (!stage) return;
        const { width, height } = stage.getBoundingClientRect();
        renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      }

      const onPointerMove = (event: PointerEvent) => {
        if (!finePointer.matches || !stage) return;
        const box = stage.getBoundingClientRect();
        const x = (event.clientX - box.left) / Math.max(box.width, 1) - 0.5;
        const y = (event.clientY - box.top) / Math.max(box.height, 1) - 0.5;
        targetYaw = BASE_YAW + x * 0.5;
        targetPitch = -y * 0.22;
      };
      const onPointerLeave = () => {
        targetYaw = BASE_YAW;
        targetPitch = 0;
      };

      const resizeObserver = new ResizeObserver(() => {
        resize();
        render(performance.now());
      });
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false;
        start();
      });
      const themeObserver = new MutationObserver(() => {
        for (const [surface, token] of materials) {
          if ("color" in surface) {
            (surface as MeshStandardMaterial).color.set(tokenColor(token));
          }
        }
        paintShadow();
        render(performance.now());
      });
      const onVisibility = () => start();

      resizeObserver.observe(stage);
      visibilityObserver.observe(canvas);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      media.addEventListener("change", start);
      document.addEventListener("visibilitychange", onVisibility);
      stage.addEventListener("pointermove", onPointerMove);
      stage.addEventListener("pointerleave", onPointerLeave);

      sceneRef.current = {
        setParts(next, animate) {
          for (const key of PASS_PART_KEYS) {
            const target = next[key] ? 1 : 0;
            const previous = partTarget.get(key) ?? 0;
            partTarget.set(key, target);
            if (!animate || media.matches) {
              partValue.set(key, target);
              if (target === 1 && key === "sealed") stamped.add(key);
              applyPart(key, target);
            } else if (target === 1 && previous === 0 && key !== "sealed") {
              swingVelocity += 0.55;
            }
          }
          start();
        },
      };

      resize();
      sceneRef.current.setParts(partsRef.current, false);
      stage.dataset.webgl = "ready";

      cleanup = () => {
        window.cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        themeObserver.disconnect();
        media.removeEventListener("change", start);
        document.removeEventListener("visibilitychange", onVisibility);
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerleave", onPointerLeave);
        for (const geometry of geometries) geometry.dispose();
        for (const surface of materials.keys()) surface.dispose();
        shadowMaterial.dispose();
        shadowTexture.dispose();
        renderer.dispose();
        delete stage.dataset.webgl;
      };
    }

    void mount().catch(() => undefined);

    return () => {
      disposed = true;
      sceneRef.current = null;
      cleanup();
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setParts(parts, true);
  }, [parts]);

  return (
    <div
      ref={stageRef}
      className={cn("onboarding-stage", className)}
      aria-hidden="true"
    >
      <PassFallback parts={parts} />
      <canvas ref={canvasRef} />
    </div>
  );
}

function PassFallback({ parts }: { parts: PassParts }) {
  return (
    <div className="onboarding-pass-fallback">
      <VolunteerPassBadge parts={parts} />
    </div>
  );
}
