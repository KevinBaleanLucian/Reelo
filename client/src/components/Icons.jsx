function Svg({children, size=20, ...props}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export function SearchIcons (props) {
    return (
        <Svg {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5"/>
        </Svg>
    );
}

export function BookmarkIcons(props) {
    return (
        <Svg {...props}>
            <path d="M6 3h12v18l-6-4-6 4V3Z" />
        </Svg>
    );
}

export function InstagramIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </Svg>
  );
}

export function YouTubeIcon(props) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
    </Svg>
  );
}