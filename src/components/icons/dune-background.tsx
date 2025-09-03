export function DuneBackground() {
  return (
    <div 
      className="absolute inset-0 grid overflow-hidden -z-10"
      style={{
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
      }}
    >
      <svg
        className="col-start-1 row-start-1 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 800"
      >
        <defs>
          <linearGradient id="dune1" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--sand-dune-1-start)" />
            <stop offset="100%" stopColor="var(--sand-dune-1-end)" />
          </linearGradient>
          <linearGradient id="dune2" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--sand-dune-2-start)" />
            <stop offset="100%" stopColor="var(--sand-dune-2-end)" />
          </linearGradient>
          <linearGradient id="dune3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--sand-dune-3-start)" />
            <stop offset="100%" stopColor="var(--sand-dune-3-end)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="800" fill="var(--sand-bg)" />
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
        <path
          d="M -100,450 
             C 350,300 650,550 1000,400 
             S 1350,350 1540,480
             L 1540,800 -100,800 Z"
          fill="url(#dune1)"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
