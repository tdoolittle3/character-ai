import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'

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
      <head><script src="https://cdn.jsdelivr.net/npm/eruda"></script>
        <script>eruda.init();</script></head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
