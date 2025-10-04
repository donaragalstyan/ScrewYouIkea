import { Navigation } from "@/components/navigation"
import { UploadSection } from "@/components/upload-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <main>
        <UploadSection />
      </main>
    </div>
  )
}
