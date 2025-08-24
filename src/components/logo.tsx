
export function Logo() {
  return (
    <div className="flex items-center justify-center bg-primary/20 text-primary p-2 rounded-lg aspect-square h-full w-auto">
        <svg
            width="24"
            height="24"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            >
            <path
                d="M-1.5 73.5C22.5 71 42 56 52 40.5C62 25 81.5 -1.5 101.5 1.5V101.5H-1.5V73.5Z"
                fill="currentColor"
                fillOpacity="0.6"
            />
            <path
                d="M-1.5 83C21.5 79.8333 45.3 80.5 54 90C62.7 99.5 86.5 102.5 101.5 101.5V1.5C81.5 -1.5 62 25 52 40.5C42 56 22.5 71 -1.5 73.5V83Z"
                fill="currentColor"
            />
        </svg>
    </div>
  );
}
