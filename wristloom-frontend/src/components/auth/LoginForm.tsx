'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/primitives/Button';
import { Eye, EyeOff, Mail, Lock, UserCheck, Wrench, ShieldAlert } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;
type RoleType = 'CUSTOMER' | 'TECHNICIAN';

const inputClass =
  'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-10 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/customer/dashboard';

  const [selectedRole, setSelectedRole] = React.useState<RoleType>('CUSTOMER');
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'OAuthAccountNotLinked') {
      setServerError('An account with this email already exists using a different sign-in method.');
    } else if (errorParam === 'SessionRequired' || errorParam === 'unauthenticated') {
      setServerError('Your session has expired. Please sign in again.');
    } else if (errorParam === 'CredentialsSignin') {
      setServerError('Invalid email or password.');
    } else if (errorParam) {
      setServerError('Sign-in failed. Please try again.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);

    try {
      // Step 1: Query backend verification authority
      const verifyRes = await fetch('/api/auth/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          intendedRole: selectedRole,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setServerError(verifyData.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Step 2: Establish NextAuth JWT session
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        intendedRole: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        setServerError('Invalid email or password.');
        return;
      }

      // Step 3: Determine authoritative destination with safe callbackUrl resolution
      const rawCallback = searchParams.get('callbackUrl');
      let destination: string;

      // Check if callbackUrl is a safe internal relative path
      const isInternalCallback =
        rawCallback &&
        rawCallback.startsWith('/') &&
        !rawCallback.startsWith('//') &&
        !rawCallback.startsWith('/login') &&
        !rawCallback.startsWith('/register');

      const userRole = verifyData.role;

      if (isInternalCallback) {
        if (userRole === 'ADMIN') {
          destination = rawCallback;
        } else if (userRole === 'TECHNICIAN') {
          destination = rawCallback.startsWith('/admin') ? '/technician/dashboard' : rawCallback;
        } else {
          destination =
            rawCallback.startsWith('/admin') || rawCallback.startsWith('/technician')
              ? '/customer/dashboard'
              : rawCallback;
        }
      } else {
        if (userRole === 'ADMIN') {
          destination = '/admin/dashboard';
        } else if (userRole === 'TECHNICIAN') {
          destination = '/technician/dashboard';
        } else {
          destination = '/customer/dashboard';
        }
      }

      // Full navigation ensures set-cookie headers are committed before page load
      window.location.href = destination;
    } catch (err: any) {
      console.error('[Login Submission Error]', err);
      setServerError('A network error occurred. Please check your connection and try again.');
    }
  }

  async function handleGoogleSignIn() {
    setServerError(null);
    try {
      await signIn('google', { callbackUrl: '/login/redirect' });
    } catch {
      setServerError('Google sign-in failed. Please try again.');
    }
  }

  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 shadow-xl shadow-black/40">
      {/* Role Selection: Who are you? */}
      <div className="mb-6">
        <label className="block text-center font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-3">
          Who are you?
        </label>
        <div className="grid grid-cols-2 gap-3 p-1 bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px]">
          <button
            type="button"
            id="role-select-customer"
            onClick={() => {
              setSelectedRole('CUSTOMER');
              setServerError(null);
            }}
            className={`py-2.5 px-4 text-xs font-mono tracking-wider uppercase rounded-[2px] transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedRole === 'CUSTOMER'
                ? 'bg-[#B08D57] text-[#14110F] font-semibold shadow-md shadow-[#B08D57]/20'
                : 'text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] hover:bg-[rgba(176,141,87,0.08)]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            id="role-select-technician"
            onClick={() => {
              setSelectedRole('TECHNICIAN');
              setServerError(null);
            }}
            className={`py-2.5 px-4 text-xs font-mono tracking-wider uppercase rounded-[2px] transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedRole === 'TECHNICIAN'
                ? 'bg-[#B08D57] text-[#14110F] font-semibold shadow-md shadow-[#B08D57]/20'
                : 'text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] hover:bg-[rgba(176,141,87,0.08)]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Technician</span>
          </button>
        </div>
      </div>

      {/* Role specific hint */}
      {selectedRole === 'TECHNICIAN' && (
        <div className="mb-5 p-2.5 bg-[rgba(176,141,87,0.06)] border border-[rgba(176,141,87,0.20)] rounded-[2px] text-center">
          <p className="text-[11px] font-mono text-[#B08D57] tracking-wider uppercase">
            Certified Horologist & Atelier Portal
          </p>
          <p className="text-[10px] text-[rgba(237,230,214,0.45)] mt-0.5">
            Use your administrative atelier credentials to access the service bay
          </p>
        </div>
      )}

      {/* Google Sign-In (Available for Customer sign-in) */}
      {selectedRole === 'CUSTOMER' && (
        <>
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
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder={selectedRole === 'TECHNICIAN' ? 'technician@wristloom.com' : 'you@example.com'}
              className={inputClass}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" aria-hidden />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(176,141,87,0.40)] hover:text-[#B08D57] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-[2px] p-3 text-xs text-red-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={isSubmitting}>
          {selectedRole === 'TECHNICIAN' ? 'Sign In as Technician' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}

