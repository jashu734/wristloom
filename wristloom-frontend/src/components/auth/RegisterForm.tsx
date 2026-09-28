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

  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6">
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
