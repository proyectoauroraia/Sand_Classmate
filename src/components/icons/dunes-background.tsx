
export function DunesBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full object-cover -z-10"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      viewBox="0 0 1440 800"
    >
      <defs>
        <linearGradient id="dune1" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FDEBCF" />
          <stop offset="100%" stopColor="#F8D7A8" />
        </linearGradient>
        <linearGradient id="dune2" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FDDDA4" />
          <stop offset="100%" stopColor="#F7C98A" />
        </linearGradient>
         <linearGradient id="dune3" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#F7C98A" />
          <stop offset="100%" stopColor="#EFA96B" />
        </linearGradient>
      </defs>
      <rect width="1440" height="800" fill="url(#dune1)" />
      <path
        d="M -100,500 
           C 200,300 600,650 900,450 
           S 1300,300 1540,550 
           L 1540,800 -100,800 Z"
        fill="url(#dune2)"
        opacity="0.6"
      />
      <path
        d="M -100,600 
           C 300,500 700,750 1100,600 
           S 1300,500 1540,650 
           L 1540,800 -100,800 Z"
        fill="url(#dune3)"
        opacity="0.5"
      />
    </svg>
  );
}
