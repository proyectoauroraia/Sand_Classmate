
export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
      >
        <defs>
          <clipPath id="squircle">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" />
          </clipPath>
        </defs>
        <g clipPath="url(#squircle)">
          {/* Use a gradient for a more modern look */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(217, 91%, 70%)', stopOpacity: 1 }} />
          </linearGradient>
          <rect width="100" height="100" fill="url(#logoGradient)" />
        </g>
      </svg>
      <span
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        className="text-2xl font-medium"
        >
        Sand Classmate
      </span>
    </div>
  );
}
