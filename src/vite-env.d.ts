/// <reference types="vite/client" />

// PWA Registration Module
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }
  
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

// PWA Registration React Hook
declare module 'virtual:pwa-register/react' {
  import type { Ref } from 'react';
  import type { RegisterSWOptions } from 'virtual:pwa-register';

  export interface UseRegisterSWOptions extends RegisterSWOptions {
    onRegistered?: (registration: ServiceWorkerRegistration) => void;
    onRegisterError?: (error: any) => void;
  }

  export function useRegisterSW(options?: UseRegisterSWOptions): {
    needRefresh: Ref<boolean>;
    offlineReady: Ref<boolean>;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

