export default function CustomBadge() {
  return (
    <span
      aria-label="Custom colors available"
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        background: 'rgba(0,0,0,0.52)',
        color: 'white',
        fontSize: 10,
        borderRadius: 20,
        padding: '2px 8px',
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '.04em',
        zIndex: 2,
      }}
    >
      ✦ Custom colors available
    </span>
  )
}
