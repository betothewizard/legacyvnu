export const Logo = ({
  size = 64,
  ...rest
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <defs>
        <mask id="bars">
          <rect width="100%" height="100%" fill="white" />
          <rect x="10" y="120" width="180" height="10" fill="black" />
          <rect x="60" y="10" width="10" height="180" fill="black" />
        </mask>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="90"
        fill="oklch(0.71 0.097 111.7)"
        mask="url(#bars)"
      />
    </svg>
  );
};
