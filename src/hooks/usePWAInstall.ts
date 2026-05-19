import { useState, useEffect, useCallback } from 'react';

/**
 * Extensão da interface Event para o evento beforeinstallprompt do PWA.
 * A API é experimental mas bem suportada em Chrome/Android.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  /** true quando o browser pode instalar e o prompt ainda não foi dispensado */
  isInstallable: boolean;
  /** true quando o app já está rodando em modo standalone (instalado) */
  isInstalled: boolean;
  /** Dispara o prompt nativo de instalação. Retorna true se o usuário aceitou. */
  install: () => Promise<boolean>;
  /** Descarta o prompt sem instalar (o usuário pode ver novamente depois) */
  dismiss: () => void;
}

/**
 * Hook para instalar o Somus como PWA.
 *
 * Fluxo:
 * 1. Browser dispara `beforeinstallprompt` → armazenamos o evento diferido.
 * 2. `isInstallable` se torna true → UI mostra banner/botão de instalação.
 * 3. Usuário clica → `install()` chama `deferredPrompt.prompt()`.
 * 4. Após aceitar: `isInstalled=true`, prompt limpo.
 * 5. Após `appinstalled`: mesmo resultado (instalação via menu do browser).
 *
 * Nota: `(display-mode: standalone)` detecta app já instalado para não
 * exibir o banner novamente.
 */
export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as standalone (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDeferredPrompt(null);
  }, []);

  return {
    isInstallable: deferredPrompt !== null && !isInstalled,
    isInstalled,
    install,
    dismiss,
  };
}
