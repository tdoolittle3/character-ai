"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

export default function DialogChat({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000) // Disappear after 5 seconds

    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-black bg-opacity-80 text-green-500 p-4 rounded-md font-mono max-w-md mx-auto"
        >
          <div className="flex items-start">
            <span className="mr-2 mt-1">{">"}</span>
            <p>{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
