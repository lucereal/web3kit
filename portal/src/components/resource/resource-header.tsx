"use client"
import { Badge } from "@/components/ui/badge"

interface ResourceHeaderProps {
  name: string
  type: string
  className?: string
}

export function ResourceHeader({ name, type, className }: ResourceHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-2 ${className || ''}`}>
      <h3 className="text-sm font-semibold line-clamp-2 flex-1">
        {name}
      </h3>
      <Badge variant="secondary" className="text-xs shrink-0">
        {type}
      </Badge>
    </div>
  )
}
