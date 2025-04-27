"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"

export default function CommandLine({ value, onChange, onSubmit }) {
  const [cursorVisible, setCursorVisible] = useState(true)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const MAX_CHARS = 255

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Handle clicks on the container to focus the input
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle input change with character limit
  const handleChange = (e) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue)
    }
  }

  // Handle key press for Enter
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value)
      onChange("") // Clear the input after submission
    }
  }

  return (
    <div
      ref={containerRef}
      className="bg-black text-green-500 p-2 rounded font-mono text-lg"
      onClick={handleContainerClick}
    >
      <div className="flex items-start">
        <span className="mr-2 flex-shrink-0">$</span>
        <div className="relative flex-1 min-w-0">
          <div className="whitespace-pre-wrap break-all">
            {value}
            <span
              className={`inline-block w-2 h-5 align-middle bg-green-500 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
              style={{ verticalAlign: "middle" }}
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            maxLength={MAX_CHARS}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text"
            aria-label="Command input"
          />
        </div>
      </div>
      <div className="text-right mt-1">
        <span className="text-xs text-green-700">
          {value.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  )
}
