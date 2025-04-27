"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei"
import dynamic from "next/dynamic"

// Import components with dynamic imports to prevent hydration mismatch
const CommandLine = dynamic(() => import("./command-line"), { ssr: false })
const DialogChat = dynamic(() => import("./dialog-chat"), { ssr: false })

export default function ModelViewer() {
  const [command, setCommand] = useState("")
  const [dialogMessage, setDialogMessage] = useState("")
  const [bottomPosition, setBottomPosition] = useState(64) // 8rem default

  // Handle keyboard visibility using VisualViewport API or resize events
  useEffect(() => {
    const handleResize = () => {
      // Check if we're on mobile by screen width
      const isMobile = window.innerWidth <= 768

      if (!isMobile) return

      // Get the visual viewport height (accounts for keyboard)
      const viewportHeight = window.visualViewport?.height || window.innerHeight

      // If the visual viewport is significantly smaller than the window, keyboard is likely open
      const isKeyboardOpen = viewportHeight < window.innerHeight * 0.8

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

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
        window.visualViewport.removeEventListener("scroll", handleResize)
      } else {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  const handleCommandSubmit = (cmd) => {
    setDialogMessage(cmd)
  }

  const dismissDialog = () => {
    setDialogMessage("")
  }

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 0, 50], fov: 80 }} gl={{ antialias: true }} shadows>
        <color attach="background" args={["#000000"]} />
        <Scene command={command} />
      </Canvas>

      <DialogChat message={dialogMessage} onDismiss={dismissDialog} />

      {/* Command line at the bottom - with dynamic positioning */}
      <div className="fixed left-0 right-0 z-50 flex justify-center px-4" style={{ bottom: `${bottomPosition * 2}px` }}>
        <div className="w-full max-w-md">
          <CommandLine value={command} onChange={setCommand} onSubmit={handleCommandSubmit} />
        </div>
      </div>
    </div>
  )
}

function Scene({ command }) {
  const modelRef = useRef()
  const characterUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL}${process.env.NEXT_PUBLIC_CHARACTER_FILE}`;
  const { scene, animations } = useGLTF(characterUrl)
  const { actions: baseActions } = useAnimations(animations, scene)

  // Load external animations
  const animationSources = [
    { name: "bboyDance", path: `${process.env.NEXT_PUBLIC_STORAGE_URL}${process.env.NEXT_PUBLIC_ANIMATION_FILES}` },

    // Add more here
  ]

  const animationRefs = animationSources.map(source => {
    const { animations } = useGLTF(source.path)
    return useAnimations(animations, scene) // bind to main scene
  })

  // Play a named animation then return to idle
  const playAnimation = (name) => {
    const animRef = animationRefs.find(ref => ref.actions[name])
    if (!animRef) {
      console.warn(`Animation ${name} not found`)
      return
    }

    const action = animRef.actions[name]
    const idle = baseActions["Armature|mixamo.com|Layer0"]

    idle?.fadeOut(0.5)
    action?.reset().fadeIn(0.5).play()

    setTimeout(() => {
      action?.fadeOut(0.5)
      idle?.reset().fadeIn(0.5).play()
    }, action.getClip().duration * 1000)
  }

  useEffect(() => {
    const idle = baseActions["Armature|mixamo.com|Layer0"]
    if (idle) {
      idle.reset().fadeIn(0.5).play()
    }
  }, [baseActions])

  // Optional: trigger on click or external command
  const handleModelClick = () => {
    playAnimation("bboyDance")
  }


  return (
    <>
      {/* Camera controls with restricted movement */}
      <OrbitControls
        target={[0, 40, 0]}
        enableDamping
        dampingFactor={0.05}

        enableZoom={true}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        enableRotate={false}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
      {/* Directional light positioned above and pointing at the center */}
      <directionalLight
        //ref={directionalLightRef}
        position={[1, 3, 2]}
        intensity={4.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Ambient light for better visibility */}
      <ambientLight intensity={0.5} />

      {/* The 3D model */}
      <primitive
        ref={modelRef}
        object={scene}
        position={[3, 15, 1.5]}
        scale={1}
        onClick={handleModelClick}
        castShadow
        receiveShadow
      />

      {/* Ground plane to receive shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </>
  )
}
