import { useState, useCallback, useRef, type WheelEvent, type MouseEvent } from 'react';

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function useSvgPanZoom(initialWidth: number, initialHeight: number) {
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    w: initialWidth,
    h: initialHeight,
  });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
      setViewBox((vb) => {
        const newW = vb.w * scaleFactor;
        const newH = vb.h * scaleFactor;
        const dx = (vb.w - newW) / 2;
        const dy = (vb.h - newH) / 2;
        return { x: vb.x + dx, y: vb.y + dy, w: newW, h: newH };
      });
    },
    [],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!isPanning.current) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      const dx = (e.clientX - panStart.current.x) * scaleX;
      const dy = (e.clientY - panStart.current.y) * scaleY;
      panStart.current = { x: e.clientX, y: e.clientY };
      setViewBox((vb) => ({ ...vb, x: vb.x - dx, y: vb.y - dy }));
    },
    [viewBox.w, viewBox.h],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: initialWidth, h: initialHeight });
  }, [initialWidth, initialHeight]);

  const viewBoxStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;

  return {
    viewBoxStr,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    setViewBox,
  };
}
