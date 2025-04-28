"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DialogChat({ userInput, onDismiss }) {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState();
  console.log("userInput", userInput);
  console.log("message", message);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userInput) return;

    // Immediately show "Thinking..."
    setMessage("Thinking...");

    // Call the API
    const fetchResponse = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_CHAT_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_input: userInput }),
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        // Assuming the API responds with { response: "..." }
        setMessage(data.response || "No response");

        // Start timer after receiving the response
        const timer = setTimeout(() => {
          onDismiss();
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error fetching chat response:", error);
        setMessage("Error processing request");

        const timer = setTimeout(() => {
          onDismiss();
        }, 5000);

        return () => clearTimeout(timer);
      }
    };

    fetchResponse();
  }, [userInput, onDismiss]);

  if (!mounted) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-black bg-opacity-80 text-green-500 p-4 rounded-md font-mono max-w-md mx-auto w-full pointer-events-auto"
          >
            <div className="flex">
              <span className="mr-2 flex-shrink-0">{">"}</span>
              <p className="break-words whitespace-pre-wrap overflow-hidden">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
