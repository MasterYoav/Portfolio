import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
  /** A word inside `text` whose characters get `wordClassName`. */
  word?: string;
  wordClassName?: string;
};

const DEFAULT_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?';

const randomCharacter = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length));

// Deterministic first frame so the server render and hydration agree.
const seeded = (text: string, charset: string) =>
  Array.from(text, (character, i) => (character === ' ' ? ' ' : charset.charAt((character.charCodeAt(0) * 31 + i * 7) % charset.length)));

const gibberish = (text: string, charset: string) =>
  Array.from(text, (character) => (character === ' ' ? ' ' : randomCharacter(charset))).join('');

export function EncryptedText({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
  word,
  wordClassName,
}: EncryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [revealCount, setRevealCount] = useState(0);
  const scrambleCharacters = useRef(text ? seeded(text, charset) : []);

  useEffect(() => {
    if (!isInView) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealCount(text.length);
      return;
    }

    scrambleCharacters.current = gibberish(text, charset).split('');
    const startedAt = performance.now();
    let lastFlipAt = startedAt;
    let frame = 0;

    const update = (now: number) => {
      const revealed = Math.min(text.length, Math.floor((now - startedAt) / Math.max(1, revealDelayMs)));
      setRevealCount(revealed);
      if (revealed >= text.length) return;

      if (now - lastFlipAt >= Math.max(0, flipDelayMs)) {
        scrambleCharacters.current = Array.from(text, (character, index) =>
          index < revealed || character === ' ' ? character : randomCharacter(charset),
        );
        lastFlipAt = now;
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isInView, text, revealDelayMs, charset, flipDelayMs]);

  if (!text) return null;
  const wordStart = word ? text.indexOf(word) : -1;

  return (
    <motion.span ref={ref} className={className} aria-label={text} role="text">
      {text.split('').map((character, index) => {
        const revealed = index < revealCount;
        return (
          <span
            key={index}
            className={[revealed ? revealedClassName : encryptedClassName, wordStart >= 0 && index >= wordStart && index < wordStart + word!.length ? wordClassName : '']
              .filter(Boolean)
              .join(' ') || undefined}
            aria-hidden="true"
          >
            {revealed || character === ' ' ? character : scrambleCharacters.current[index]}
          </span>
        );
      })}
    </motion.span>
  );
}
