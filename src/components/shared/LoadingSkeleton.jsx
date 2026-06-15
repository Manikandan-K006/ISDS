const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const CardSkeleton = () => (
  <div className="theme-card border theme-border rounded-2xl p-6 space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 theme-card border theme-border rounded-xl">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="theme-card border theme-border rounded-2xl p-5 space-y-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-7 w-1/2" />
      </div>
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-32 w-full rounded-2xl" />
    <StatsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="theme-card border theme-border rounded-2xl p-8">
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
    <StatsSkeleton />
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="theme-card border theme-border rounded-xl p-4 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="theme-card border theme-border rounded-2xl p-6">
    <Skeleton className="h-5 w-40 mb-6" />
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

export default Skeleton;
