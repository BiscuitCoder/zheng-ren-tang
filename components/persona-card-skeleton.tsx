import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PersonaCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-wrap gap-1 mt-auto">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
