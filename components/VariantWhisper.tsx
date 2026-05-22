import Link from 'next/link'

interface Props {
  customOrderPath?: string
}

export default function VariantWhisper({ customOrderPath = '/custom' }: Props) {
  return (
    <p style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic', marginTop: 6, lineHeight: 1.6 }}>
      Don&apos;t see your color or size?{' '}
      <Link
        href={customOrderPath}
        style={{ color: 'var(--text-light)', textDecoration: 'none', transition: 'color .2s' }}
        onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = 'var(--accent)'; (e.target as HTMLAnchorElement).style.textDecoration = 'underline' }}
        onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = 'var(--text-light)'; (e.target as HTMLAnchorElement).style.textDecoration = 'none' }}
      >
        I can make it just for you →
      </Link>
    </p>
  )
}
