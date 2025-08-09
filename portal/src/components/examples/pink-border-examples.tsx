// Examples of how to use the new pink accent with border colors

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ShoppingCart } from "lucide-react"

export function PinkBorderExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold">Pink Accent with Border Examples</h2>
      
      {/* Price displays with bordered text */}
      <div className="space-y-2">
        <h3 className="font-medium">Price Displays:</h3>
        <div className="text-lg pink-text-bordered font-bold">1.5 ETH</div>
        <div className="text-2xl pink-text-bordered font-bold">0.025 ETH</div>
      </div>

      {/* Icons with pink border effect */}
      <div className="space-y-2">
        <h3 className="font-medium">Icons with Border Effect:</h3>
        <div className="flex gap-4">
          <Heart className="w-6 h-6 pink-icon-bordered" />
          <Star className="w-6 h-6 pink-icon-bordered" />
          <ShoppingCart className="w-6 h-6 pink-icon-bordered" />
        </div>
      </div>

      {/* Buttons with the new pink gradient + border */}
      <div className="space-y-2">
        <h3 className="font-medium">Buttons:</h3>
        <div className="flex gap-4">
          <Button variant="pink" size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Now
          </Button>
          <Button variant="pink" size="default">
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Badges with border */}
      <div className="space-y-2">
        <h3 className="font-medium">Badges:</h3>
        <div className="flex gap-2">
          <Badge className="bg-pink-accent text-pink-accent-foreground border-pink-accent-border">
            Owned
          </Badge>
          <Badge className="pink-with-border bg-transparent">
            Premium
          </Badge>
        </div>
      </div>

      {/* Text elements */}
      <div className="space-y-2">
        <h3 className="font-medium">Text Styles:</h3>
        <p className="pink-text-bordered font-semibold">Important highlighted text</p>
        <p className="text-pink-accent">Regular pink text</p>
        <p className="pink-with-border inline-block px-3 py-1 rounded bg-transparent">
          Bordered container
        </p>
      </div>
    </div>
  )
}

// Color reference:
// Primary Pink: #DD637C (oklch(0.65 0.15 15))
// Border Color: #63363F (oklch(0.35 0.08 15))
