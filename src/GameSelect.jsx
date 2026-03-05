<div className="maincontentbox">
  <div className="basketballBoard" onClick={setNumber}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 550"
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "96%",
        padding: "2%",
      }}
    >
      <rect x="0" y="0" width="600" height="550" fill="transparent" />
      <g
        fill="none"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="0" y="0" width="600" height="550" rx="20" ry="20" />
        <circle cx="300" cy="545" r="155" />
        <line x1="212" y1="0" x2="212" y2="242" />
        <line x1="388" y1="0" x2="388" y2="242" />
        <line x1="212" y1="240" x2="388" y2="240" />

        <defs>
          <clipPath id="halfClip">
            <rect x="0" y="242" width="600" height="308" />
          </clipPath>
        </defs>

        <circle cx="300" cy="242" r="88" clipPath="url(#halfClip)" />

        <line x1="50" y1="0" x2="50" y2="85" />
        <line x1="550" y1="0" x2="550" y2="85" />

        <clipPath id="halfClip2">
          <rect x="0" y="85" width="600" height="308" />
        </clipPath>

        <circle
          id="myShape"
          cx="300"
          cy="80"
          r="250"
          clipPath="url(#halfClip2)"
          fill="transparent"
          pointerEvents="all"
          onMouseEnter={() => setPaintHovered(true)}
          onMouseLeave={() => setPaintHovered(false)}
        />
        <rect
          id="myShape2"
          x="50"
          y="0"
          width="500"
          height="100"
          fill="transparent"
          stroke="none"
          pointerEvents="all"
          onMouseEnter={() => setPaintHovered(true)}
          onMouseLeave={() => setPaintHovered(false)}
        />
      </g>
    </svg>
    {selectedShots.map((shot) => (
      <div
        key={shot.id}
        className="shot"
        style={{
          left: `${shot.x * 100}%`,
          top: `${shot.y * 100}%`,
          transform: `translate(-50%, -50%)`,
          background: shot.result == "make" ? "#5b2eff" : "grey",
        }}
      >
        {shot.player}
      </div>
    ))}
  </div>
</div>;
