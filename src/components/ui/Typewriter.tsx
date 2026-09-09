"use client";

import React, { useState, useEffect } from "react";

interface TypewriterProps {
  words: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
  cursorChar?: string;
}

export function Typewriter({
  words,
  speed = 65,
  deleteSpeed = 35,
  pauseTime = 2200,
  loop = true,
  className = "",
  cursorClassName = "bg-emerald-400",
  cursorChar,
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[currentWordIndex % words.length] || "";

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        const nextCharCount = currentText.length + 1;
        setCurrentText(currentWord.substring(0, nextCharCount));

        if (nextCharCount >= currentWord.length) {
          if (!loop && currentWordIndex === words.length - 1) {
            return; // Finished all words
          }
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting backward
        const prevCharCount = currentText.length - 1;
        setCurrentText(currentWord.substring(0, Math.max(0, prevCharCount)));

        if (prevCharCount <= 0) {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    // Slight natural jitter for human-like typing feel
    const delay = isDeleting ? deleteSpeed : speed + (Math.random() * 20 - 10);
    const timer = setTimeout(handleTyping, Math.max(20, delay));
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, speed, deleteSpeed, pauseTime, loop]);

  return (
    <span className={`inline-flex items-center select-none ${className}`} aria-live="polite">
      <span>{currentText}</span>
      {cursorChar ? (
        <span
          className={`inline-block ml-0.5 animate-[cursorBlink_1s_steps(2,start)_infinite] text-emerald-400 font-mono`}
          style={{ textShadow: "0 0 8px rgba(52,211,153,0.8)" }}
        >
          {cursorChar}
        </span>
      ) : (
        <span
          className={`inline-block w-[2.5px] ml-1 rounded-sm animate-[cursorBlink_1s_steps(2,start)_infinite] align-middle ${
            cursorClassName.includes("h-") ? cursorClassName : `h-[1.15em] ${cursorClassName}`
          }`}
          style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)" }}
        />
      )}
      <style jsx>{`
        @keyframes cursorBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}

