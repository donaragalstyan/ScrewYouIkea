import { Navigation } from "@/components/navigation"
import { ProcessingStatus } from "@/components/processing-status"

export default function ProcessingPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <ProcessingStatus manualId={params.id} />
      </main>
    </div>
  )
}
