'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface MobileNavLink {
    href: string;
    label: string;
    external?: boolean;
}

export function MobileNav({ links }: { links: MobileNavLink[] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="mobile-nav">
            <button
                className="mobile-nav-toggle"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                {open ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                )}
            </button>

            {open && (
                <div className="mobile-nav-panel">
                    {links.map((link) =>
                        link.external ? (
                            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                                {link.label}
                            </a>
                        ) : (
                            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                                {link.label}
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
