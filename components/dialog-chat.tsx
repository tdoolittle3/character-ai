"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

export default function DialogChat({ message, onDismiss }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onDismiss()
    }, 5000) // Disappear after 5 seconds

    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-black bg-opacity-80 text-green-500 p-4 rounded-md font-mono max-w-md mx-auto w-full"
        >
          <div className="flex">
            <span className="mr-2 flex-shrink-0">{">"}</span>
            <p className="break-words whitespace-pre-wrap overflow-hidden">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
