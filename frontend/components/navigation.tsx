"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, Library, Settings } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const logoText = "ScrewYouIKEA.com"
  const words = logoText.split(/(?=[A-Z])/)

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-[#0051BA]">ScrewYou</span>
                <span className="text-[#FFDA1A] italic">IKEA</span>
                <span className="text-[#0051BA]">.com</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant={pathname === "/" ? "secondary" : "ghost"} size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <Link href="/library">
                <Button variant={pathname === "/library" ? "secondary" : "ghost"} size="sm">
                  <Library className="mr-2 h-4 w-4" />
                  Library
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="secondary">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
