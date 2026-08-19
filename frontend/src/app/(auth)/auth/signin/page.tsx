'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { FullPageSpinner } from '@/components/shared/LoadingSpinner'

export default function SignInPage() {
  const router = useRouter()
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace('/team')
    }
  }, [loading, user, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verification') === 'sent') {
      toast.success('Verification email sent. Verify your email, then sign in.')
    }
  }, [])

  if (loading) return <FullPageSpinner />

  const onSubmit = async (data: LoginInput) => {
    try {
      await signInWithEmail(data.email, data.password)
      toast.success('Signed in successfully')
      router.replace('/team')
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('email-not-verified')) {
        toast.error('Please verify your email before signing in.')
      } else {
        toast.error('Invalid email or password')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.replace('/team')
    } catch {
      toast.error('Google sign-in failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
        <p className="text-sm text-white/70">Enter your credentials to continue</p>
      </div>

      <div className="bg-surface-card space-y-5 rounded-2xl p-7 shadow-lg">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="border-ink/10 bg-surface text-ink hover:bg-ink/5 flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-ink/10 w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-card text-ink-faint px-2">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-ink-muted text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="border-ink/10 bg-surface text-ink placeholder:text-ink-faint focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none aria-invalid:border-red-500"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-ink-muted text-sm font-medium">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="border-ink/10 bg-surface text-ink placeholder:text-ink-faint focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none aria-invalid:border-red-500"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ink text-surface hover:bg-brand-600 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-white/70">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-white hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
