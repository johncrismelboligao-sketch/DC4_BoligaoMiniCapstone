export function SoccerBallLogo() {
  return (
    <svg className="soccer-ball-logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="ball-shell" cx="34%" cy="27%" r="75%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".72" stopColor="#f2f2f2" />
          <stop offset="1" stopColor="#aaa" />
        </radialGradient>
        <radialGradient id="ball-shadow" cx="30%" cy="20%" r="80%">
          <stop offset="0" stopColor="#555" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <clipPath id="ball-clip"><circle cx="32" cy="32" r="30" /></clipPath>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#ball-shell)" stroke="#d7d7d7" strokeWidth="1.5" />
      <g clipPath="url(#ball-clip)" stroke="#777" strokeWidth="1.2" strokeLinejoin="round">
        <path d="m25 26 7-5 8 5-3 9h-9z" fill="url(#ball-shadow)" />
        <path d="m25 26-10-3-5 8 6 8 9-3 3-10" fill="#f7f7f7" />
        <path d="m40 26 9-4 7 8-5 9-10-2-4-2" fill="#f7f7f7" />
        <path d="m28 35 9 0 5 9-9 8-10-7z" fill="#f7f7f7" />
        <path d="m25 26 7-5-2-11-9-5-7 6 1 12z" fill="#f7f7f7" />
        <path d="m32 21 8 5 9-4 1-11-8-6-12 5z" fill="#fff" />
        <path d="m15 23-5 8-9-1-3-11 8-8 5 0z" fill="url(#ball-shadow)" />
        <path d="m51 22 5 8 9-1 3-11-8-8-7 0z" fill="url(#ball-shadow)" />
        <path d="m23 45 10 7-1 12-11 5-9-8 2-11z" fill="url(#ball-shadow)" />
        <path d="m42 44 9-3 8 7-2 11-10 8-7-6z" fill="url(#ball-shadow)" />
        <path d="m30 10 2-10 11 0 8 6-1 5-10 4z" fill="url(#ball-shadow)" />
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth=".7" />
    </svg>
  )
}
