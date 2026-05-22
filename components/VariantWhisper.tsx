import Link from 'next/link'

interface Props {
  customOrderPath?: string
}

export default function VariantWhisper({ customOrderPath = '/custom-order' }: Props) {
  return (
    <p className="text-sm text-gray-400 italic mt-2 leading-relaxed">
      Don&apos;t see your color or size?{' '}
      <Link
        href={customOrderPath}
        className="text-gray-400 hover:text-amber-600/80 hover:underline transition-colors duration-200"
      >
        I can make it just for you →
      </Link>
    </p>
  )
}
