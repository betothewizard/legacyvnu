export const Logo = ({
  size = 64,
  ...rest
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <style>{`
        .btn { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .btn-top, .btn-body { transition: all 0.05s ease; }

        /* Mặt trên lún xuống 40px */
        .btn:active .btn-top { transform: translateY(40px); }

        /* Thân ép dẹp lại mượt mà, khớp hoàn hảo với 4 điểm mới */
        .btn:active .btn-body {
          d: path("M70 200 v20 L200 310 l130 -90 v-20 L200 290 z");
        }
      `}</style>
      <g className="btn" strokeWidth={60} strokeLinejoin="round">
        <path
          className="btn-body"
          fill="oklch(.48 .12 65)"
          stroke="oklch(.48 .12 65)"
          d="M70 160 v60 L200 310 l130 -90 v-60 L200 250 z"
        />

        <path
          className="btn-top"
          fill="oklch(.60 .14 65)"
          stroke="oklch(.60 .14 65)"
          d="M200 70 l130 90 l-130 90 l-130 -90 z"
        />
      </g>
    </svg>
  );
};
