import { Skeleton } from "@/components/ui/skeleton";
import { Card } from '../../ui/card';


const SearchedProfileSkeleton = () => {
  return (
    <div className="min-h-screen w-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-4">
      <Card className="p-6 shadow">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="h-32 w-32 rounded-full bg-neutral-300" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 mx-auto bg-neutral-200 rounded" />
            <Skeleton className="h-5 w-32 mx-auto bg-neutral-200 rounded" />
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-28 bg-neutral-200 rounded" />
            <Skeleton className="h-4 w-24 bg-neutral-200 rounded" />
          </div>
        </div>
      </Card>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-muted mb-6 transition-all duration-150 ease-in-out mt-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-200"
          >
            <Skeleton className="h-4 w-4 rounded-full bg-neutral-400" />
            <div className="relative">
              <Skeleton className="h-4 w-16 bg-neutral-300 rounded" />
              <Skeleton className="absolute h-3 w-3 bg-neutral-400 rounded-full top-0 left-13 transform -translate-x-1/2 shadow-sm" />
            </div>
          </div>
        ))}
      </div>
      <Card className="p-6 rounded-3xl border border-muted bg-gradient-to-br from-background via-background/90 to-background/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-shadow duration-300">
        <div className="space-y-5">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-1/3 bg-neutral-300 rounded-md" />
            <Skeleton className="h-5 w-20 bg-neutral-200 rounded-md" />
          </div>
          <Skeleton className="h-4 w-3/4 bg-neutral-300 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Skeleton className="h-4 w-16 bg-neutral-200 rounded-md" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-24 bg-neutral-200 rounded-md" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-20 bg-neutral-200 rounded-md" />
            </div>
          </div>
          <div className="pt-1">
            <Skeleton className="h-10 w-full bg-gray-700 rounded-xl" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SearchedProfileSkeleton;