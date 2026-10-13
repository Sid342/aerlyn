import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Where Tab must jump to keep focus inside `items`, or null to let the browser move it.
export function wrapTarget(items, active, backwards) {
  if (!items.length) return null;
  const first = items[0];
  const last = items[items.length - 1];
  if (!items.includes(active)) return backwards ? last : first;
  if (backwards && active === first) return last;
  if (!backwards && active === last) return first;
  return null;
}

// Modal behaviour for a dialog element: put the returned ref on it (with tabIndex={-1}).
// While `open`: focus moves in, Tab stays inside, Escape calls onClose; on close focus
// returns to whatever opened it.
export function useDialog(open, onClose) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const dialog = ref.current;
    const opener = document.activeElement;
    const items = () => [...dialog.querySelectorAll(FOCUSABLE)];
    (items()[0] || dialog).focus();

    function onKey(e) {
      if (e.key === 'Escape') {
        close.current();
      } else if (e.key === 'Tab') {
        const all = items();
        const target = wrapTarget(all, document.activeElement, e.shiftKey);
        if (target || !all.length) e.preventDefault();
        target?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [open]);

  return ref;
}
