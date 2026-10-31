import type { SVGProps } from "react";

export function AlignRightIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path strokeDasharray="16" d="M20 5h-13">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.3s"
            values="16;0"
          />
        </path>
        <path
          strokeDasharray="12"
          strokeDashoffset="12"
          d="M20 10h-10"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.3s"
            dur="0.2s"
            to="0"
          />
        </path>
        <path
          strokeDasharray="18"
          strokeDashoffset="18"
          d="M20 15h-16"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.5s"
            dur="0.3s"
            to="0"
          />
        </path>
        <path
          strokeDasharray="16"
          strokeDashoffset="16"
          d="M20 20h-13"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.8s"
            dur="0.3s"
            to="0"
          />
        </path>
      </g>
    </svg>
  );
}

export default AlignRightIcon;

