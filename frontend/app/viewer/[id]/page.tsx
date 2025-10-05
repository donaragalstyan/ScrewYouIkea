import { ViewerLayout } from "@/components/viewer-layout"

export default async function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ViewerLayout manualId={id} />
}
