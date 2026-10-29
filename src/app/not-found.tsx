import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Film, Home, Mail } from 'lucide-react';

export const metadata = {
  title: '404 — Scene Not Found | Shirin Shila Official Portfolio',
  description: 'The requested scene or page could not be located on Shirin Shila’s official cinematic portfolio.',
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 63, 121, 0.12) 0%, transparent 70%), #09060a',
        color: '#f8f1f5',
        padding: '32px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: '580px',
          width: '100%',
          background: 'rgba(21, 15, 22, 0.85)',
          border: '1px solid rgba(255, 63, 121, 0.3)',
          borderRadius: '20px',
          padding: '48px 36px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 63, 121, 0.15)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'var(--pink)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '12px',
          }}
        >
          Scene Missing • Error 404
        </span>

        <h1
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
            lineHeight: 1,
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #fff 30%, #ff8cad 70%, #ff3f79 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            fontWeight: 500,
            color: '#fff',
            margin: '0 0 14px 0',
          }}
        >
          The Silver Screen Is Silent Here
        </h2>

        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.65,
            color: '#c2b5c0',
            margin: '0 0 32px 0',
          }}
        >
          The page or scene you are looking for has been moved, renamed, or never made the theatrical cut of Shirin Shila’s portfolio.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            className="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #ff3f79, #e02863)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(255, 63, 121, 0.4)',
            }}
          >
            <Home size={15} />
            <span>Return to Main Stage</span>
          </Link>

          <Link
            href="/#filmography"
            className="button-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontWeight: 500,
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            <Film size={15} />
            <span>Notable Works</span>
          </Link>

          <Link
            href="/#contact"
            className="button-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ff8cad',
              fontWeight: 500,
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            <Mail size={15} />
            <span>Contact Desk</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

