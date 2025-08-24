
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
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F0DDBF' }} />
                <stop offset="100%" style={{ stopColor: '#E89B64' }} />
            </linearGradient>
            <clipPath id="squircle">
              <rect x="0" y="0" width="100" height="100" rx="20" ry="20" />
            </clipPath>
        </defs>
        
        <g clipPath="url(#squircle)">
          {/* Base background of the logo */}
          <rect width="100" height="100" fill="url(#sandGradient)" />

          {/* Dune shapes */}
          <path d="M -5,65 
                   C 30,50 70,80 105,60 
                   L 105,105 -5,105 Z" 
                fill="#D9A16B" /> 
          
          <path d="M -5,55 
                   C 25,35 75,65 105,45 
                   L 105,60 
                   C 70,80 30,50 -5,65 Z" 
                fill="#BA7C46" />
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
