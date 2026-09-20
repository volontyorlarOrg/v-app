"use client";

import { ImagePlus, Move, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonClass } from "@/components/ui/button";
import { removeAvatarAction, uploadAvatarAction } from "@/lib/account/actions";
import { cn } from "@/lib/utils";

const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024;
const MAX_PIXELS = 20_000_000;
const MIN_SIDE = 128;
const OUTPUT_SIDE = 512;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type AvatarEditorLabels = {
  title: string;
  description: string;
  choose: string;
  replace: string;
  remove: string;
  removing: string;
  zoom: string;
  position: string;
  upload: string;
  uploading: string;
  saved: string;
  removed: string;
  errors: Record<string, string>;
};

type ImageSize = { width: number; height: number };
type Point = { x: number; y: number };

export function AvatarEditor({
  currentUrl,
  initials,
  labels,
}: {
  currentUrl?: string;
  initials: string;
  labels: AvatarEditorLabels;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Point | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [size, setSize] = useState<ImageSize | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [cropSide, setCropSide] = useState(256);
  const [status, setStatus] = useState<"idle" | "saved" | "removed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const message = (key: string) => labels.errors[key] ?? labels.errors.unknown ?? "";

  useEffect(
    () => () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    },
    [sourceUrl],
  );

  useEffect(() => {
    const crop = cropRef.current;
    if (!crop) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setCropSide(entry.contentRect.width);
    });
    observer.observe(crop);
    return () => observer.disconnect();
  }, [sourceUrl]);

  function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setStatus("idle");
    setError(null);
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError(message("avatarFormatUnsupported"));
      return;
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setError(message("avatarTooLarge"));
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const nextUrl = URL.createObjectURL(file);
    setSourceUrl(nextUrl);
    setSize(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    const probe = new window.Image();
    probe.onload = () => {
      const next = { width: probe.naturalWidth, height: probe.naturalHeight };
      if (
        next.width < MIN_SIDE ||
        next.height < MIN_SIDE ||
        next.width * next.height > MAX_PIXELS
      ) {
        URL.revokeObjectURL(nextUrl);
        setError(message("avatarDimensions"));
        setSourceUrl((current) => (current === nextUrl ? null : current));
        return;
      }
      setSize(next);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      setError(message("avatarInvalid"));
      setSourceUrl((current) => (current === nextUrl ? null : current));
    };
    probe.src = nextUrl;
  }

  function limits(nextZoom = zoom, side = cropSide) {
    if (!size) return { x: 0, y: 0, side, scale: 1 };
    const scale = Math.max(side / size.width, side / size.height) * nextZoom;
    return {
      x: Math.max(0, (size.width * scale - side) / 2),
      y: Math.max(0, (size.height * scale - side) / 2),
      side,
      scale,
    };
  }

  function clamp(point: Point, nextZoom = zoom): Point {
    const limit = limits(nextZoom);
    return {
      x: Math.max(-limit.x, Math.min(limit.x, point.x)),
      y: Math.max(-limit.y, Math.min(limit.y, point.y)),
    };
  }

  function moveBy(x: number, y: number) {
    setPan((current) => clamp({ x: current.x + x, y: current.y + y }));
  }

  function keyMove(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 20 : 6;
    const deltas: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    moveBy(delta.x, delta.y);
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const last = dragRef.current;
    if (!last) return;
    moveBy(event.clientX - last.x, event.clientY - last.y);
    dragRef.current = { x: event.clientX, y: event.clientY };
  }

  async function upload() {
    if (!sourceUrl || !size || !cropRef.current) return;
    setError(null);
    const image = cropRef.current.querySelector("img");
    if (!image) return;
    let file: File;
    try {
      const side = cropRef.current.getBoundingClientRect().width;
      file = await croppedFile(image, size, limits(zoom, side), pan);
    } catch {
      setError(message("avatarInvalid"));
      return;
    }
    startTransition(async () => {
      const body = new FormData();
      body.set("avatar", file);
      const result = await uploadAvatarAction(body);
      if (result.status === "ok") {
        URL.revokeObjectURL(sourceUrl);
        setSourceUrl(null);
        setSize(null);
        setStatus("saved");
        return;
      }
      setError(result.status === "error" ? message(result.code) : message("unknown"));
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await removeAvatarAction();
      if (result.status === "ok") {
        setSourceUrl(null);
        setSize(null);
        setStatus("removed");
        return;
      }
      setError(result.status === "error" ? message(result.code) : message("unknown"));
    });
  }

  const limit = limits();
  const previewStyle = size
    ? {
        width: size.width * limit.scale,
        height: size.height * limit.scale,
        transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
      }
    : undefined;

  return (
    <section
      aria-labelledby="avatar-editor-title"
      className="panel-surface enter-rise rounded-xl border border-border bg-surface p-5 sm:p-7"
    >
      <div className="max-w-prose">
        <h2
          id="avatar-editor-title"
          className="font-sans text-base font-semibold text-ink"
        >
          {labels.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {labels.description}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={select}
      />

      {sourceUrl ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:items-center">
          <div
            ref={cropRef}
            role="application"
            tabIndex={0}
            aria-label={labels.position}
            onKeyDown={keyMove}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={() => (dragRef.current = null)}
            onPointerCancel={() => (dragRef.current = null)}
            className="focus-visible:ring-focus relative aspect-square w-full max-w-64 cursor-move touch-none overflow-hidden rounded-xl bg-surface-sunk ring-offset-2 outline-none focus-visible:ring-2"
          >
            <Image
              src={sourceUrl}
              alt=""
              width={size?.width ?? OUTPUT_SIDE}
              height={size?.height ?? OUTPUT_SIDE}
              unoptimized
              draggable={false}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
              style={previewStyle}
            />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-[999px] ring-surface/70" />
          </div>

          <div className="min-w-0">
            <label className="text-sm font-semibold text-ink" htmlFor="avatar-zoom">
              {labels.zoom}
            </label>
            <input
              id="avatar-zoom"
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => {
                const next = Number(event.target.value);
                setZoom(next);
                setPan((current) => clamp(current, next));
              }}
              className="mt-3 w-full accent-action"
            />
            <p className="mt-2 flex items-start gap-2 text-sm text-ink-muted">
              <Move aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {labels.position}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" disabled={pending || !size} onClick={upload}>
                {pending ? labels.uploading : labels.upload}
              </Button>
              <button
                type="button"
                disabled={pending}
                onClick={() => inputRef.current?.click()}
                className={buttonClass({ variant: "outline" })}
              >
                {labels.replace}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar aria-hidden="true" className="size-24 shrink-0 ring-2 ring-accent/70">
            {currentUrl ? <AvatarImage src={currentUrl} alt="" /> : null}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
              className={buttonClass()}
            >
              <ImagePlus aria-hidden="true" className="size-4" />
              {currentUrl ? labels.replace : labels.choose}
            </button>
            {currentUrl ? (
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className={buttonClass({ variant: "outline" })}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                {pending ? labels.removing : labels.remove}
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div
        className={cn("mt-4", !error && status === "idle" && "hidden")}
        aria-live="polite"
      >
        {error ? <ActionStatus tone="error">{error}</ActionStatus> : null}
        {status === "saved" ? (
          <ActionStatus tone="done">{labels.saved}</ActionStatus>
        ) : null}
        {status === "removed" ? (
          <ActionStatus tone="done">{labels.removed}</ActionStatus>
        ) : null}
      </div>
    </section>
  );
}

async function croppedFile(
  image: HTMLImageElement,
  size: ImageSize,
  crop: { side: number; scale: number },
  pan: Point,
) {
  const sourceSide = crop.side / crop.scale;
  const sourceX = (size.width - sourceSide) / 2 - pan.x / crop.scale;
  const sourceY = (size.height - sourceSide) / 2 - pan.y / crop.scale;
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIDE;
  canvas.height = OUTPUT_SIDE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvasUnavailable");
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSide,
    sourceSide,
    0,
    0,
    OUTPUT_SIDE,
    OUTPUT_SIDE,
  );
  for (const quality of [0.86, 0.76, 0.66]) {
    const blob = await canvasBlob(canvas, quality);
    if (blob.size <= 1_048_576) {
      return new File([blob], "avatar.webp", { type: blob.type });
    }
  }
  throw new Error("avatarTooLarge");
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("avatarInvalid"))),
      "image/webp",
      quality,
    );
  });
}
