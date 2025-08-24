
export function Logo() {
  return (
    <div className="flex items-center justify-center p-2 rounded-lg aspect-square h-full w-auto">
        <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            >
            <defs>
                <linearGradient id="duneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#D2B48C', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#A0522D', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path
                d="M0,100 C20,80 40,70 60,80 C80,90 100,100 100,100 L100,50 C80,60 60,40 40,50 C20,60 0,80 0,80 Z"
                fill="#C2A47C"
            />
            <path
                d="M0,100 C15,85 30,80 50,85 C70,90 85,95 100,100 L100,70 C85,75 70,65 50,70 C30,75 15,85 0,90 Z"
                fill="#D2B48C"
            />
        </svg>
    </div>
  );
}
