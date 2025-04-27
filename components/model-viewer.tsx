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
      
      {/* Dialog chat at the top */}
      <div className="absolute top-8 left-0 right-0 flex justify-center">
        <DialogChat message={dialogMessage} onDismiss={dismissDialog} />
      </div>

      {/* Command line at the bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      <CommandLine value={command} onChange={setCommand} onSubmit={handleCommandSubmit} />      </div>
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
