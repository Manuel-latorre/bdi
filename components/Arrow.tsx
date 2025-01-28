import * as React from "react"
const Arrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="#000"
    strokeWidth={0}
    viewBox="0 0 24 24"
    width={30}
    height={30}
  >
    <rect width={12} height={13} x={6} y={3} fill="#fff" rx={3} />
    <path
      fill="#000"
      fillRule="evenodd"
      stroke="none"
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.182-13.146h-8v8h2v-4.586l6.243 6.242 1.414-1.414-6.243-6.242h4.586v-2Z"
      clipRule="evenodd"
    />
  </svg>
)
export default Arrow

