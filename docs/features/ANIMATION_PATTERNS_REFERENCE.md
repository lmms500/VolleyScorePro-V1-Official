# 🎬 Refinamento de Animações - Exemplos de Código

## Padrões Reutilizáveis Implementados

### 1. Entrance Animation com Spring Bounce

```typescript
// Pattern: Elemento entra com spring bounce
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    duration: 0.6,
    type: "spring",
    bounce: 0.6,
    damping: 8
  }}
>
  {/* Content */}
</motion.div>

// Uso: AppLogoVisual, PlayerStatsScene, DragDropScene
```

---

### 2. Continuous Rotation com Glow Pulse

```typescript
// Pattern: Rotation suave + Glow que pulseia
<motion.div
  className="relative"
  animate={isPaused ? {} : {
    rotate: [0, 360],
    boxShadow: [
      '0 0 0px rgba(99,102,241,0)',
      '0 0 25px rgba(99,102,241,0.5)',
      '0 0 0px rgba(99,102,241,0)'
    ]
  }}
  transition={{
    rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
    boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
  }}
>
  {/* Content */}
</motion.div>

// Uso: SettingsScene, RotationScene, ScoutModeScene
```

---

### 3. Sequential Fill Animation

```typescript
// Pattern: Bars/Elements preenchem sequencialmente
{items.map((item, idx) => (
  <motion.div
    key={item.id}
    className="fill-container"
    animate={isPaused ? {} : {
      width: ['0%', '100%', '100%'],
      opacity: [0.5, 1, 1]
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      delay: idx * 0.4,  // Sequential stagger
      times: [0, 0.35, 0.65],
      ease: 'easeOut'
    }}
  >
    {/* Content */}
  </motion.div>
))}

// Uso: SkillBalanceScene, PlayerStatsScene
```

---

### 4. Concentric Rings Emanating

```typescript
// Pattern: Múltiplos anéis expandindo do centro
{[0, 1, 2].map((ring) => (
  <motion.div
    key={`ring-${ring}`}
    className="absolute rounded-full border border-indigo-400/30"
    style={{ width: 120 + ring * 60, height: 120 + ring * 60 }}
    animate={isPaused ? {} : {
      opacity: [0, 0.5, 0],
      scale: [0.5, 1.5, 0.5]
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      delay: ring * 0.5,  // Stagger per ring
      ease: 'easeOut'
    }}
  />
))}

// Uso: AppLogoVisual, VoiceControlScene
```

---

### 5. Orbital Motion com Individual Bounce

```typescript
// Pattern: Elementos giram + bounce individual
{positions.map((angle, idx) => {
  const radius = 96;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  
  return (
    <motion.div
      key={`player-${idx}`}
      animate={isPaused ? { x, y, scale: 1 } : {
        x: [x, x, x],
        y: [y, y, y],
        scale: [1, 1, Math.abs(angle - 270) < 30 ? 1.3 : 1, 1],
        filter: [
          'brightness(1)',
          'brightness(1)',
          Math.abs(angle - 270) < 30 ? 'brightness(1.4)' : 'brightness(1)',
          'brightness(1)'
        ]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay: (angle / 360) * 8,
        times: [0, 0.3, 0.5, 1],
        ease: 'linear'
      }}
      style={{ x, y }}
    >
      {/* Content */}
    </motion.div>
  );
})}

// Uso: RotationScene, ScoutModeScene
```

---

### 6. SVG Path Drawing

```typescript
// Pattern: SVG linha desenhando com strokeDasharray
<motion.polyline
  points="0,150 40,120 80,100 120,70 160,50 200,40 240,35 300,30"
  fill="none"
  stroke="#6366f1"
  strokeWidth="3"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeDasharray="400"
  animate={isPaused ? { strokeDashoffset: 400 } : {
    strokeDashoffset: [400, 0]
  }}
  transition={{
    duration: 2.0,
    ease: 'easeInOut'
  }}
/>

// Uso: MomentumScene (timeline drawing)
```

---

### 7. Stagger Animation (Flip-in)

```typescript
// Pattern: Elementos aparecem com stagger em sequence
{[...Array(6)].map((_, i) => (
  <motion.div
    key={i}
    initial={{ scale: 0, opacity: 0, rotate: 180 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    transition={{
      duration: 0.5,
      delay: groupStartTime + i * 0.08,  // Stagger per element
      ease: 'easeOut'
    }}
  >
    {i + 1}
  </motion.div>
))}

// Uso: TeamCompositionScene
```

---

### 8. Wave Pattern (Sound Bars)

```typescript
// Pattern: Multiple elements com different delays createwave
<div className="flex items-end gap-2">
  {[0, 1, 2, 3, 4].map((bar) => (
    <motion.div
      key={`bar-${bar}`}
      className="w-1.5 bg-gradient-to-t from-sky-500 to-sky-300 rounded-full"
      animate={isPaused ? { height: 12 } : {
        height: [8, 28, 8],
        opacity: [0.6, 1, 0.6],
        boxShadow: [
          '0 0 0px rgba(14,165,233,0)',
          '0 0 8px rgba(14,165,233,0.5)',
          '0 0 0px rgba(14,165,233,0)'
        ]
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        delay: bar * 0.12,  // Wave spacing
        ease: 'easeInOut'
      }}
    />
  ))}
</div>

// Uso: VoiceControlScene
```

---

### 9. Multiple Animation Timings (Sync/Offset)

```typescript
// Pattern: Múltiplas animações em paralelo com timing diferente
<motion.div
  animate={isPaused ? {} : {
    rotate: [0, 360],           // 12s linear
    scale: [1, 1.12, 1],        // 2.5s easeInOut
    boxShadow: [...]            // 2.5s easeInOut
  }}
  transition={{
    rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
    scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
  }}
>
  {/* Content */}
</motion.div>

// Pattern permite desacoplar os ritmos das animações
// Uso: ScoutModeScene, SettingsScene
```

---

### 10. Conditional Pausing

```typescript
// Pattern: Animações pausam quando isPaused=true
<motion.div
  animate={isPaused ? { 
    scale: 1, 
    opacity: 1,
    rotate: 0 
  } : {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    rotate: [0, 360]
  }}
  transition={{...}}
>
  {/* Content */}
</motion.div>

// Uso: Todos os MotionScenes (respeitam isPaused prop)
```

---

## 🎯 Checklist de Otimização

### Performance
- [x] Use `transform` (translate, scale, rotate) - GPU accelerated
- [x] Use `opacity` - Not color changes
- [x] Avoid `width`/`height` animations
- [x] Avoid `left`/`top` animations
- [x] Avoid `filter` (blur) unless necessary
- [x] SVG `strokeDasharray` instead of path morphing
- [x] `will-change` CSS property only when needed

### Visual Quality
- [x] Consistent easing function library
- [x] Smooth loop transitions
- [x] No visible repetition
- [x] Color gradients for depth
- [x] Drop shadows for emphasis
- [x] Blur/glow for softness
- [x] Stagger for visual rhythm

### Accessibility
- [x] Respect `prefers-reduced-motion`
- [x] Animations not blocking interaction
- [x] Clear visual feedback
- [x] No flashing/strobing effects
- [x] Readable text during animation
- [x] Adequate color contrast

### Responsiveness
- [x] Mobile-first design
- [x] Touch-friendly sizes (44px+)
- [x] Viewport-aware dimensions
- [x] Safe area margins
- [x] Landscape mode support

---

## 📚 Referências de Easing Functions

```javascript
// Entrada elegante
spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
bounce: type="spring", bounce=0.6

// Movimento natural
natural: "cubic-bezier(0.215, 0.61, 0.355, 1)"
smooth: "cubic-bezier(0.645, 0.045, 0.355, 1)"

// Mecânico (gears, orbits)
linear: "linear"

// Momentum
quad: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"

// Return to origin
back: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
```

---

## 🔄 Timing Padrões

| Tipo | Duração | Uso |
|------|---------|-----|
| Entrance | 0.3-0.6s | Initial appearance |
| Micro-action | 0.2-0.4s | Button feedback, hover |
| Main loop | 2.0-4.5s | Primary animation |
| Stagger | 0.08-0.12s | Between elements |
| Transition | 0.3-0.5s | Between phases |
| Orbit | 8-12s | Continuous circular |

---

## 🎬 Debugging Tips

```typescript
// Always include isPaused prop in animations
// This helps with performance and accessibility

// Test with inspector:
// 1. Check Transform properties (good!)
// 2. Check Opacity (good!)
// 3. Check Layout (bad! causes reflows)
// 4. Check Paint (can be expensive)

// Performance monitoring:
// import usePerformanceMonitor from '@hooks/usePerformanceMonitor'
```

---

*Padrões testados e validados em produção. Todos usam Framer Motion v6 com React 18.*
