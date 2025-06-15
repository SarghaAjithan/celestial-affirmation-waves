
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
        w-full text-base
        transition-all duration-300
        ${
          isGenerating
            ? "bg-gradient-to-r from-pink-200 to-purple-200 text-white font-semibold rounded-full border-0 shadow-none pointer-events-none"
            : !disabled && !isGenerating
              ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 ring-2 ring-pink-300 font-semibold shadow-lg scale-[1.03] text-white"
              : "bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-full opacity-60 cursor-default"
        }
        ${isGenerating ? "h-16 md:h-16 flex items-center justify-center text-xl p-0" : ""}
      `}
      style={
        isGenerating
          ? {
              borderRadius: "48px",
              fontSize: "1.60rem",
              minHeight: "4rem",
              minWidth: "100%",
              paddingLeft: 0,
              paddingRight: 0,
              marginTop: 0,
            }
          : { }
      }
      aria-busy={isGenerating ? "true" : "false"}
    >
      {isGenerating ? (
        <span className="flex items-center justify-center w-full gap-4 text-white animate-fade-in">
          <svg
            className="animate-spin h-7 w-7 mr-2"
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
          <span className="font-semibold text-white" style={{ fontSize: "1.45rem", letterSpacing: "0.02em" }}>
            Creating Audio...
          </span>
        </span>
      ) : (
        <>
          {showPlayIcon ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V6l8.5 6L9 18Z" stroke="white" />
            </svg>
          ) : null}
          Generate Audio
        </>
      )}
    </button>
  );
};

export default AudioGenerationButton;
