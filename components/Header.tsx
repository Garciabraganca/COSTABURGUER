"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-title">
        <Link href="/" className="brand-link">
          <div className="logo">
            <Image src="/logo-kraft.svg" alt="Costa-Burger Artesanal" width={52} height={52} />
          </div>
          <div>
            <h1>Costa-Burger</h1>
            <p>Hambúrguer artesanal do litoral • Monte em camadas</p>
          </div>
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
}
