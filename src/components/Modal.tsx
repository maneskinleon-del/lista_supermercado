/**
 * Modal — accessible dialog wrapper.
 *
 * Features:
 *  - role="dialog" + aria-modal="true"
 *  - aria-labelledby linked to the title
 *  - Closes on Esc key
 *  - Closes on backdrop click
 *  - Focus trap inside the dialog
 *  - Returns focus to the previously focused element on close
 *  - Scroll lock on body while open
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleClassName?: string;
  /** Optional override; defaults to 60. */
  zIndex?: number;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  titleClassName = "",
  zIndex = 60,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Save the previously focused element and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  // Auto-focus the first focusable element inside the dialog on open.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const first = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Focus trap + Esc handling.
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open) return null;

  return (
    // The backdrop is intentionally a div (not a button) because the modal
    // dialog inside is the actual interactive element. Click-to-close is a
    // convenience; keyboard users have Escape via the dialog keydown handler.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#bfcaba] shadow-2xl relative space-y-4"
      >
        <h3
          id={titleId}
          className={`font-sans text-lg font-extrabold border-b border-[#bfcaba] pb-2 text-center ${titleClassName}`}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
