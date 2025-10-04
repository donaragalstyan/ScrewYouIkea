import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Layers, Play, Shield } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Parsing",
    description: "Advanced computer vision extracts parts, steps, and instructions from any manual format.",
  },
  {
    icon: Layers,
    title: "3D Part Recognition",
    description: "Automatically identifies and creates 3D representations of all assembly components.",
  },
  {
    icon: Play,
    title: "Animated Instructions",
    description: "Watch each assembly step come to life with smooth, choreographed 3D animations.",
  },
  {
    icon: Shield,
    title: "Sandboxed Execution",
    description: "Secure, isolated rendering environment ensures safe visualization of all manuals.",
  },
]

export function FeaturesGrid() {
  return (
    <section className="border-t border-border bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground">Powered by cutting-edge AI and 3D rendering technology</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
