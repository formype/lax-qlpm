
// Helper to generate range
export const range = (start: number, end: number): number[] => {
  const length = Math.abs(end - start) + 1;
  const step = end > start ? 1 : -1;
  return Array.from({ length }, (_, i) => start + (i * step));
};

// --- LAB CONFIGURATION CONSTANTS ---
// Kept for reference if needed elsewhere
export const LAB_1_MACHINE_COUNT = 45;
export const LAB_3_MACHINE_COUNT = 40;

// --- APP VERSION ---
export const APP_VERSION = '1.0.0';
