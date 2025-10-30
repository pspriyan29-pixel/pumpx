'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/tokens', label: 'Tokens' },
  { href: '/create', label: 'Create' },
  { href: '/launch', label: 'Launch' },
  { href: '/status', label: 'Status' },
  { href: '/about', label: 'About' },
  { href: '/profile', label: 'Profile' },
]

export default function Nav() {
  const pathname = usePathname() || '/'
  return (
    <nav className="flex items-center gap-3 text-sm">
      {links.map((l) => {
        const active = pathname === l.href
        return (
          <Link key={l.href} href={l.href}
                className={`rounded-md px-2 py-1 hover:bg-white/10 ${active ? 'bg-white/10 text-accent' : 'text-zinc-300'}`}>
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}


