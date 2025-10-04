import { ViewerLayout } from "@/components/viewer-layout"

export default function ViewerPage({ params }: { params: { id: string } }) {
  return <ViewerLayout manualId={params.id} />
}
