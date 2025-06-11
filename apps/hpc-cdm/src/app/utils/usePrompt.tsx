import { useCallback, useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router';

function useConfirmExit(confirmExit: () => boolean, when = true) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) {
      return;
    }
    const push = navigator.push;

    navigator.push = (...args: Parameters<typeof push>) => {
      const hasConfirmedExit = confirmExit();
      if (hasConfirmedExit !== false) {
        push(...args);
      }
    };

    return () => {
      navigator.push = push;
    };
  }, [navigator, confirmExit, when]);
}

/**
 * `usePrompt` is a custom hook to display a prompt with a custom
 * message when the conditions are met (default when=true)
 */
export function usePrompt(message: string, when = true) {
  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    if (when) {
      globalThis.addEventListener('beforeunload', beforeUnloadHandler);
    }

    return () => {
      globalThis.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, [message, when]);

  const confirmExit = useCallback(() => {
    const hasConfirmed = globalThis.confirm(message);
    return hasConfirmed;
  }, [message]);

  useConfirmExit(confirmExit, when);
}

export default usePrompt;
