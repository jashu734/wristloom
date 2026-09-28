'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/primitives/Button';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-10 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password, phone: data.phone }),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.error ?? 'Registration failed. Please try again.');
      return;
    }

    // Auto sign-in after registration
    await signIn('credentials', { email: data.email, password: data.password, redirect: false });
    router.push('/account');
    router.refresh();
  }

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/account' });
  }

  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6">
      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 border border-[rgba(237,230,214,0.15)] rounded-[2px] py-3 text-sm text-[rgba(237,230,214,0.70)] hover:border-[rgba(176,141,87,0.30)] hover:text-[#EDE6D6] transition-colors mb-5"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="relative flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[rgba(176,141,87,0.10)]" />
        <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.30)]">or</span>
        <div className="flex-1 h-px bg-[rgba(176,141,87,0.10)]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <Field label="Full Name" error={errors.name?.message}>
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
          <input {...register('name')} type="text" autoComplete="name" placeholder="Ravi Desai" className={inputClass} />
        </Field>

        {/* Email */}
        <Field label="Email" error={errors.email?.message}>
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
          <input {...register('email')} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />
        </Field>

        {/* Phone (optional) */}
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
          <input {...register('phone')} type="tel" autoComplete="tel" placeholder="+91 98765 43210" className={inputClass} />
        </Field>

        {/* Password */}
        <Field label="Password" error={errors.password?.message}>
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            className={inputClass}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(176,141,87,0.40)] hover:text-[#B08D57]">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>

        {/* Confirm Password */}
        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
          <input {...register('confirmPassword')} type="password" autoComplete="new-password" placeholder="Repeat password" className={inputClass} />
        </Field>

        {serverError && (
          <div className="bg-red-900/20 border border-red-900/40 rounded-[2px] px-3 py-2 text-xs text-red-400">
            {serverError}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
          Create Account
        </Button>

        <p className="text-[10px] text-center text-[rgba(237,230,214,0.30)] leading-relaxed">
          By creating an account you agree to our{' '}
          <a href="/terms" className="text-[#B08D57] hover:underline">Terms of Service</a> and{' '}
          <a href="/privacy" className="text-[#B08D57] hover:underline">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
        {label}
      </label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
