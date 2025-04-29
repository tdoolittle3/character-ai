import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "3D Model Viewer",
  description: "Interactive 3D model viewer with command line interface",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Analytics/>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
