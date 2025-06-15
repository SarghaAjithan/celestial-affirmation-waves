
import React from "react";

interface AudioGenerationButtonProps {
  isGenerating: boolean;
  disabled?: boolean;
  onClick: () => void;
  showPlayIcon?: boolean;
}

export const AudioGenerationButton: React.FC<AudioGenerationButtonProps> = ({
  isGenerating,
  disabled,
  onClick,
  showPlayIcon = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isGenerating}
      className={`
        group relative w-full flex items-center justify-center
        px-8 py-4 md:py-5 rounded-full border-[3px]
        ${isGenerating || (!disabled && !isGenerating)
          ? "bg-gradient-to-r from-pink-500 via-pink-500 to-purple-500 border-pink-200 shadow-lg"
          : "bg-gradient-to-r from-pink-300 to-purple-300 border-pink-100 opacity-70 cursor-not-allowed"}
        transition-all duration-300
        hover:shadow-2xl hover:scale-105
        focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400
      `}
      style={{
        minHeight: "3.5rem",
      }}
      aria-busy={isGenerating ? "true" : "false"}
      tabIndex={0}
    >
      {isGenerating ? (
        <span className="flex items-center justify-center w-full gap-3">
          <svg
            className="animate-spin h-7 w-7"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="white"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="white"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="font-bold text-white ml-2 text-lg md:text-xl whitespace-nowrap tracking-wide">
            Creating Audio...
          </span>
        </span>
      ) : (
        <span className="flex items-center justify-center w-full gap-3">
          {showPlayIcon && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7 mr-3 -ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V6l8.5 6L9 18Z" stroke="white" fill="none" />
            </svg>
          )}
          <span className="font-bold text-white text-lg md:text-xl tracking-wide select-none">
            Generate Audio
          </span>
        </span>
      )}
    </button>
  );
};

export default AudioGenerationButton;
