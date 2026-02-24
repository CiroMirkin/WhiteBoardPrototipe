# Refactoring WhiteBoardPrototipe

## Objetivo

Separar funcionalidad en módulos cohesivos usando **Screaming Architecture**: cada carpeta debe gritar qué hace.

## Estructura Antes

```
src/
├── Canvas.tsx           (359 líneas - monolítico)
├── components/
│   ├── ArrowItem.tsx
│   └── ...
├── hooks/
│   └── useArrowDrawing.ts
├── styles/
│   └── arrows.css
└── types.ts             (Arrow + CanvasImage juntos)
```

## Estructura Después

```
src/
├── components/
│   ├── Arrow/
│   │   ├── ArrowItem.tsx       (SVG de flecha)
│   │   ├── arrows.css          (estilos)
│   │   ├── useArrowDrawing.ts (hook para crear flechas)
│   │   ├── types.ts            (Arrow interface)
│   │   └── index.ts           (barrel export)
│   │
│   └── Canvas/
│       ├── CanvasViewport.tsx  (viewport con eventos de mouse)
│       ├── CanvasContent.tsx   (canvas interior con transform)
│       ├── ArrowsLayer.tsx     (capa SVG de flechas)
│       ├── useCanvasState.ts   (estado y callbacks)
│       └── index.ts            (barrel export)
```

## Cambios por Módulo

### Arrow

| Antes | Después |
|-------|---------|
| `src/components/ArrowItem.tsx` | `src/components/Arrow/ArrowItem.tsx` |
| `src/hooks/useArrowDrawing.ts` | `src/components/Arrow/useArrowDrawing.ts` |
| `src/styles/arrows.css` | `src/components/Arrow/arrows.css` |
| `Arrow` interface en `types.ts` | `src/components/Arrow/types.ts` |

### Canvas

| Antes | Después |
|-------|---------|
| Viewport (líneas 268-277) | `CanvasViewport.tsx` |
| Canvas interior (líneas 279-341) | `CanvasContent.tsx` |
| SVG arrows (líneas 287-327) | `ArrowsLayer.tsx` |
| Estado + hooks (líneas 24-90) | `useCanvasState.ts` |

## Imports a Actualizar

```typescript
// Antes
import { ArrowItem } from './components/ArrowItem'
import { useArrowDrawing } from './hooks/useArrowDrawing'
import type { Arrow } from './types'

// Después
import { ArrowItem, useArrowDrawing } from './components/Arrow'
import type { Arrow } from './components/Arrow/types'
```

## API Pública (sin cambios)

```typescript
// Canvas mantiene su API
import { Canvas } from './components/Canvas'

<Canvas 
  activeTool="select" 
  onToolChange={(tool) => {...}} 
/>
```
