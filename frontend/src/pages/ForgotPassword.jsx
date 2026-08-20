import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../components/ui';
import { KeyRound, Mail, ShieldCheck, ArrowLeft, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import PasswordStrengthBar, { evaluatePasswordStrength } from '../components/PasswordStrengthBar';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Form hooks for Step 1 (Email)
  const { 
    register: registerEmail, 
    handleSubmit: handleSubmitEmail, 
    formState: { errors: emailErrors } 
  } = useForm();

  // Form hooks for Step 3 (Password Reset)
  const { 
    register: registerReset, 
    handleSubmit: handleSubmitReset, 
    watch, 
    formState: { errors: resetErrors } 
  } = useForm();

  const newPassword = watch('newPassword');

  // Step 1: Request OTP for registered email
  const onRequestOtp = async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const formattedEmail = data.email.toLowerCase().trim();
      const res = await api.post('/auth/forgot-password/request-otp', { email: formattedEmail });
      setEmail(formattedEmail);
      setStep(2);
      toast.success(res.data.message || 'Verification code sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }

    setOtpError('');
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/verify-otp', { email, otp });
      toast.success('Code verified! Now create your new password.');
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/forgot-password/request-otp', { email });
      toast.success('A new verification code has been sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password with Confirm Password
  const onResetPassword = async (data) => {
    setError('');
    
    const strength = evaluatePasswordStrength(data.newPassword);
    if (!strength.isStrong) {
      setError('Password must be Strong to reset your password. Please meet all criteria below (8+ characters, uppercase & lowercase, number, and special symbol).');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/reset-password', {
        email,
        otp,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 pointer-events-auto">
        <Logo isLight={true} />
      </div>
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <ThemeToggle />
      </div>

      {/* Left Visual Hero Banner */}
      <div className="hidden lg:flex flex-col items-center justify-center p-20 relative overflow-hidden bg-emerald-950 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 mix-blend-overlay opacity-50 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-20 -right-10 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-6 leading-tight">Account Recovery & Password Protection.</h1>
          <p className="text-white/70 text-lg mb-12 italic leading-relaxed">
            Securely restore access to your BachatSaathi account using instant email OTP verification.
          </p>

          <div className="grid gap-4">
            {['Strict Registered Email Check', 'End-to-End Encrypted Verification', 'Instant Account Restoration'].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 text-left transition-colors hover:bg-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-bold opacity-80 uppercase tracking-widest leading-none">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex items-center justify-center p-6 sm:p-12 animate-entrance bg-white dark:bg-gray-950 pt-20 sm:pt-12">
        <div className="max-w-md w-full">
          
          {/* Navigation Back */}
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          {/* Step Headers */}
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
              <KeyRound className="text-white w-7 h-7" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">
              {step === 1 && <>Forgot <span className="text-gradient">Password?</span></>}
              {step === 2 && <>Enter <span className="text-gradient">OTP Code</span></>}
              {step === 3 && <>Set New <span className="text-gradient">Password</span></>}
            </h2>
            <p className="text-muted-foreground font-medium text-sm">
              {step === 1 && 'Enter your registered email address to receive a password reset code.'}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && 'Choose a strong new password for your account.'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800 mb-6">
              {error}
            </div>
          )}

          {/* STEP 1: Enter Registered Email */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSubmitEmail(onRequestOtp)}>
              <Input
                label="Registered Email"
                id="reset-email"
                type="email"
                placeholder="name@gmail.com"
                autoComplete="email"
                {...registerEmail('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please enter a valid email format'
                  }
                })}
                error={emailErrors.email?.message}
              />

              <Button
                type="submit"
                size="xl"
                className="w-full btn-saas-primary group"
                loading={isLoading}
                loadingText="VERIFYING EMAIL"
              >
                Send Reset Code
                <Mail className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-black text-muted-foreground/30"><span className="bg-background px-4">OR</span></div>
              </div>

              <p className="text-center text-sm font-medium text-muted-foreground">
                Remember your password? <Link to="/login" className="text-primary font-bold hover:underline">Log in now</Link>
              </p>
            </form>
          )}

          {/* STEP 2: Enter OTP Code */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={onVerifyOtp}>
              <Input
                label="Enter 6-Digit Verification Code"
                id="reset-otp"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="tracking-[0.8em] text-center font-black text-2xl py-6"
                error={otpError}
                autoFocus
              />

              <Button
                type="submit"
                size="xl"
                className="w-full btn-saas-primary"
                loading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify & Continue
              </Button>

              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hover:text-foreground transition-colors"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-primary hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password & Confirm Password */}
          {step === 3 && (
            <form className="space-y-5" onSubmit={handleSubmitReset(onResetPassword)}>
              <div className="relative">
                <Input
                  label="New Password"
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...registerReset('newPassword', { 
                    required: 'New password required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={resetErrors.newPassword?.message}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-[45px] text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <PasswordStrengthBar password={newPassword} />
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...registerReset('confirmPassword', { 
                    required: 'Confirm password required',
                    validate: val => val === newPassword || 'Passwords do not match'
                  })}
                  error={resetErrors.confirmPassword?.message}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 top-[45px] text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                size="xl"
                className="w-full btn-saas-primary group mt-4"
                loading={isLoading}
                loadingText="UPDATING PASSWORD"
              >
                Reset Password & Log In
                <CheckCircle2 className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
