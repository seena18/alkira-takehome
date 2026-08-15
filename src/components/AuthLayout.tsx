import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * The auth shell (spec §8–§9): blue brand panel + white form panel on desktop,
 * form-only with a compact wordmark below 768px. Login, MFA, and sign-up all
 * render inside it so the three screens read as one product.
 */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-full">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-brand p-14 text-white md:flex">
        <div>
          <p className="text-2xl font-semibold tracking-tight">alkira</p>
          <p className="mt-1 text-xs text-white/70">A Lumen Connect Solution</p>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-[28px] leading-9 font-semibold">
            Secure cloud networking,
            <br />
            without the complexity.
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Connect and manage distributed cloud infrastructure through one secure control plane.
          </p>
        </div>

        {/* Topology motif (spec §8): thin lines and nodes, ~10% opacity. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <g stroke="white" strokeWidth="1" fill="none">
            <path d="M40 520 L140 430 L260 470 L350 380" />
            <path d="M140 430 L120 300 L230 220" />
            <path d="M260 470 L230 220 L360 150" />
            <path d="M120 300 L40 200" />
          </g>
          <g fill="white">
            <circle cx="40" cy="520" r="4" />
            <circle cx="140" cy="430" r="4" />
            <circle cx="260" cy="470" r="4" />
            <circle cx="350" cy="380" r="4" />
            <circle cx="120" cy="300" r="4" />
            <circle cx="230" cy="220" r="4" />
            <circle cx="360" cy="150" r="4" />
            <circle cx="40" cy="200" r="4" />
          </g>
        </svg>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 md:hidden">
            <p className="text-xl font-semibold tracking-tight text-ink-strong">alkira</p>
            <p className="mt-0.5 text-xs text-muted">A Lumen Connect Solution</p>
          </div>

          <header className="mb-6">
            <h1 className="text-[32px] leading-10 font-semibold text-ink-strong">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          </header>

          {children}

          {footer && <footer className="mt-6 text-sm text-muted">{footer}</footer>}
        </div>
      </div>
    </main>
  )
}
