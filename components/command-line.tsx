"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"

export default function CommandLine({ value, onChange, onSubmit }) {
  const [cursorVisible, setCursorVisible] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [bottomPosition, setBottomPosition] = useState(32) // 8rem default
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const MAX_CHARS = 255

  // Only render the component after it has mounted on the client
  useEffect(() => {
    setMounted(true)

    // Add meta viewport tag to prevent zooming on focus
    const viewportMeta = document.createElement("meta")
    viewportMeta.name = "viewport"
    viewportMeta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    document.head.appendChild(viewportMeta)

    return () => {
      if (document.head.contains(viewportMeta)) {
        document.head.removeChild(viewportMeta)
      }
    }
  }, [])

  // Handle keyboard visibility using VisualViewport API or resize events
  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      // Check if we're on mobile by screen width
      const isMobile = window.innerWidth <= 768

      if (!isMobile) return

      // Get the visual viewport height (accounts for keyboard)
      const viewportHeight = window.visualViewport?.height || window.innerHeight

      // If the visual viewport is significantly smaller than the window, keyboard is likely open
      const isKeyboardOpen = viewportHeight < window.innerHeight * 0.8

      setKeyboardOpen(isKeyboardOpen)

      // Adjust position based on keyboard state
      if (isKeyboardOpen) {
        // Position the command line just above the keyboard
        setBottomPosition(16) // 4rem when keyboard is open
      } else {
        setBottomPosition(32) // 8rem when keyboard is closed
      }
    }

    // Use VisualViewport API if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      window.visualViewport.addEventListener("scroll", handleResize)
    } else {
      // Fallback to window resize
      window.addEventListener("resize", handleResize)
    }

    // Initial check
    handleResize()

    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
        window.visualViewport.removeEventListener("scroll", handleResize)
      } else {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [mounted])

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
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent default behavior (new line)

      if (value.trim()) {
        //onSubmit(value)
        onChange("") // Clear the input after submission

        // Reset textarea height if needed
        if (inputRef.current) {
          inputRef.current.style.height = "auto"
        }
      }
    }
  }

  // Handle focus to detect keyboard opening
  const handleFocus = () => {
    // On iOS, we need a small delay to detect keyboard
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="bg-black text-green-500 p-2 rounded font-mono text-lg">
        <div className="flex items-start">
          <span className="mr-2 flex-shrink-0">$</span>
          <div className="flex-1 min-w-0">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="bg-black text-green-500 p-2 rounded font-mono text-lg shadow-lg"
      onClick={handleContainerClick}
      style={{
        position: "relative",
        zIndex: 50,
      }}
    >
      <div className="flex items-start">
        <span className="mr-2 flex-shrink-0">$</span>
        <div className="relative flex-1 min-w-0">
          <div className="whitespace-pre-wrap break-all min-h-[1.5rem]">
            {value}
            <span
              className={`inline-block w-2 h-5 align-middle bg-green-500 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
              style={{ verticalAlign: "middle" }}
            />
          </div>
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            maxLength={MAX_CHARS}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text resize-none overflow-hidden"
            aria-label="Command input"
            rows={1}
            style={{ height: "100%" }}
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
