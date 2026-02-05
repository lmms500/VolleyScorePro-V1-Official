/**
 * VolleyScore Pro v2 - Design System Spacing
 * Optimized for Mobile-First Layout
 *
 * Base unit: 4px (seguindo Material Design)
 * Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
 */

// Espaçamentos base em pixels
export const spacing = {
  // === BASE SCALE ===
  none: 0,
  xs: 4,      // 1 unit  - Micro gaps
  sm: 8,      // 2 units - Tight spacing
  md: 12,     // 3 units - Default spacing
  lg: 16,     // 4 units - Comfortable spacing
  xl: 20,     // 5 units - Section gaps
  '2xl': 24,  // 6 units - Large gaps
  '3xl': 32,  // 8 units - Major sections
  '4xl': 40,  // 10 units - Screen padding
  '5xl': 48,  // 12 units - Hero spacing
  '6xl': 64,  // 16 units - Max spacing

  // === MODAL ESPECÍFICOS (OTIMIZADOS) ===
  modal: {
    // Header - Próximo do topo, mínimo necessário
    headerTop: 4,           // Gap após safe area (era ~60px, agora 4px)
    headerPaddingX: 16,     // Padding horizontal do header
    headerPaddingY: 12,     // Padding vertical do header
    headerHeight: 56,       // Altura base do header (sem safe area)

    // Transição header → conteúdo (CRÍTICO - reduzido)
    headerToContent: 8,     // Gap header → conteúdo (era ~40px, agora 8px)

    // Conteúdo
    contentPaddingX: 16,    // Padding horizontal do conteúdo
    contentPaddingY: 12,    // Padding vertical interno
    contentGap: 12,         // Gap entre seções no conteúdo

    // Seções dentro do modal
    sectionGap: 16,         // Gap entre seções maiores
    sectionTitleGap: 8,     // Gap título → conteúdo da seção

    // Itens e listas
    itemGap: 8,             // Gap entre itens de lista
    itemPadding: 12,        // Padding interno de itens

    // Botões
    buttonGap: 12,          // Gap entre botões
    buttonPaddingX: 16,     // Padding horizontal de botões
    buttonPaddingY: 12,     // Padding vertical de botões

    // Footer
    footerPadding: 16,      // Padding do footer
    footerGap: 12,          // Gap entre elementos do footer
  },

  // === COMPONENTES ===
  component: {
    // Cards
    cardPadding: 16,
    cardGap: 12,
    cardBorderRadius: 12,

    // Inputs
    inputPaddingX: 12,
    inputPaddingY: 10,
    inputGap: 8,

    // Buttons
    buttonPaddingX: 16,
    buttonPaddingY: 12,
    buttonGap: 8,

    // Lists
    listItemPadding: 12,
    listItemGap: 4,

    // Icons
    iconSize: {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
    },
    iconGap: 8,
  },

  // === TOUCH TARGETS (Mobile Critical) ===
  touch: {
    minSize: 44,            // Mínimo para acessibilidade (Apple HIG)
    recommended: 48,        // Recomendado (Material Design)
    comfortable: 56,        // Confortável para dedos grandes
  },

  // === SAFE AREAS (CSS Variables) ===
  safeArea: {
    top: 'var(--sat, 0px)',
    right: 'var(--sar, 0px)',
    bottom: 'var(--sab, 0px)',
    left: 'var(--sal, 0px)',
  },
} as const;

// === HELPERS ===

/**
 * Converte valor de spacing para string CSS
 */
export const px = (value: number): string => `${value}px`;

/**
 * Gera padding com safe area
 */
export const withSafeArea = (
  direction: 'top' | 'bottom' | 'left' | 'right',
  additionalPx: number = 0
): string => {
  const safeVar = spacing.safeArea[direction];
  if (additionalPx === 0) return safeVar;
  return `calc(${safeVar} + ${additionalPx}px)`;
};

/**
 * Tailwind-compatible class strings
 */
export const modalSpacingClasses = {
  // Header otimizado
  header: 'pt-1 pb-3 px-4',
  headerWithSafe: 'pt-safe-top pb-3 px-4',

  // Conteúdo com gap mínimo do header
  content: 'pt-2 px-4 pb-4',
  contentWithSafe: 'pt-2 px-4 pb-safe-bottom',

  // Seções
  section: 'mb-4',
  sectionTitle: 'mb-2',

  // Items
  itemList: 'gap-2',
  item: 'p-3',
} as const;

export type SpacingKey = keyof typeof spacing;
export type ModalSpacingKey = keyof typeof spacing.modal;
