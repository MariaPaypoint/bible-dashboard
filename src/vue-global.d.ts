// Global Vue types for better IDE support
import type { App, DefineComponent } from 'vue'

// Extend Vue's global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // Add any global properties here if needed
  }
  
  interface GlobalComponents {
    // Add any globally registered components here if needed
  }
}

// Global type declarations
declare global {
  // Window extensions if needed
  interface Window {
    // Add any window extensions here if needed
  }
}

// Ensure this file is treated as a module
export {}
