import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';
import { Wallet, LogIn, ShieldCheck, Mail, Lock, ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';
import PasswordStrengthBar, { evaluatePasswordStrength } from '../components/PasswordStrengthBar';

function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Steps: 'credentials', 'otp' (2FA), 'forgot_email', 'forgot_otp', 'forgot_reset'
  const [step, setStep] = useState('credentials');
  
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password local state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpError, setForgotOtpError] = useState('');

  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form hooks
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm();
  const { register: registerForgotEmail, handleSubmit: handleSubmitForgotEmail, formState: { errors: forgotEmailErrors } } = useForm();
  const { register: registerResetPass, handleSubmit: handleSubmitResetPass, watch: watchReset, formState: { errors: resetPassErrors } } = useForm();

  const newPasswordValue = watchReset('newPassword');

  // Login Submit
  const handleLoginSubmit = async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result && result.require2FA === true) {
        setPendingEmail(data.email);
        setStep('otp');
      } else if (result && typeof result === 'object' && result.email) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA Verification Submit
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }

    setOtpError('');
    setIsLoading(true);
    try {
      const user = await verify2FA(pendingEmail, otp);
      if (user) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setOtpError('Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 1: Request OTP
  const handleForgotEmailSubmit = async (data) => {
    setError('');
    setIsLoading(true);
    try {
      const emailFormatted = data.email.toLowerCase().trim();
      const res = await api.post('/auth/forgot-password/request-otp', { email: emailFormatted });
      setForgotEmail(emailFormatted);
      setStep('forgot_otp');
      toast.success(res.data.message || 'OTP sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset OTP.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6) {
      setForgotOtpError('Enter a valid 6-digit code');
      return;
    }
    setForgotOtpError('');
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/verify-otp', { email: forgotEmail, otp: forgotOtp });
      toast.success('Code verified! Enter your new password.');
      setStep('forgot_reset');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      setForgotOtpError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Resend OTP
  const handleResendForgotOtp = async () => {
    setIsLoading(true);
    setForgotOtpError('');
    try {
      await api.post('/auth/forgot-password/request-otp', { email: forgotEmail });
      toast.success('New OTP sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 3: Reset & Confirm Password
  const handleResetPassSubmit = async (data) => {
    setError('');
    
    const strength = evaluatePasswordStrength(data.newPassword);
    if (!strength.isStrong) {
      setError('Password must be Strong to reset your password. Please meet all criteria below (8+ characters, uppercase & lowercase, number, and special symbol).');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully! Log in with your new password.');
      setStep('credentials');
      setForgotOtp('');
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setStep('credentials');
    setOtp('');
    setOtpError('');
    setForgotOtp('');
    setForgotOtpError('');
    setError('');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 pointer-events-auto">
        <Logo isLight={true} />
      </div>
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <ThemeToggle />
      </div>

      {/* Left Visual Banner */}
      <div className="hidden lg:flex flex-col items-center justify-center p-20 relative overflow-hidden bg-emerald-950 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 mix-blend-overlay opacity-50 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute top-0 -left-10 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="relative z-10 text-center text-white max-w-md">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
                <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-6 leading-tight">Your Financial Future Starts and Scales Here.</h1>
            <div className="space-y-4">
                {['Security First Approach', 'Intelligent Automation', 'Seamless Experience'].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 transition-colors hover:bg-white/10">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold opacity-80">{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex items-center justify-center p-6 sm:p-12 animate-entrance bg-white dark:bg-gray-950 pt-20 sm:pt-12">
        <div className="max-w-md w-full">

          {/* STEP: CREDENTIALS (STANDARD LOGIN) */}
          {step === 'credentials' && (
            <>
              <div className="text-center lg:text-left mb-10">
                <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Wallet className="text-white w-7 h-7" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Welcome <span className="text-gradient">Back</span></h2>
                <p className="text-muted-foreground font-medium italic">Secure access to your BachatSaathi account.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmitLogin(handleLoginSubmit)}>
                {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800">
                    {error}
                  </div>
                )}
                
                <Input
                  label="Email"
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@gmail.com"
                  {...registerLogin('email', { required: 'Email required' })}
                  error={loginErrors.email?.message}
                />
                
                <div className="relative">
                  <Input
                    label="Password"
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerLogin('password', { required: 'Password required' })}
                    error={loginErrors.password?.message}
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
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setStep('forgot_email');
                    }}
                    className="text-xs font-bold text-primary hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  size="xl"
                  className="w-full btn-saas-primary group"
                  loading={isLoading}
                  loadingText="AUTHENTICATING"
                >
                  Log In Now
                  <LogIn className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                    <div className="relative flex justify-center text-xs uppercase font-black text-muted-foreground/30"><span className="bg-background px-4">OR</span></div>
                </div>

                <p className="text-center text-sm font-medium text-muted-foreground">
                  New to our ecosystem? <Link to="/signup" className="text-primary font-bold hover:underline">Create a free account</Link>
                </p>
              </form>
            </>
          )}

          {/* STEP: 2FA OTP */}
          {step === 'otp' && (
            <div className="animate-entrance">
              <button 
                onClick={resetToLogin}
                className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>

              <div className="text-center lg:text-left mb-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="text-primary w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2 italic">Two-Factor <span className="text-gradient">Auth</span></h2>
                <p className="text-muted-foreground font-medium">We've sent a 6-digit verification code to <span className="font-bold text-foreground underline">{pendingEmail}</span></p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-6">
                <Input
                  label="Enter 6-Digit Code"
                  id="otp-code"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="tracking-[1em] text-center font-black text-2xl py-8"
                  error={otpError}
                  autoFocus
                />

                <Button
                  type="submit"
                  size="xl"
                  className="w-full btn-saas-primary"
                  loading={isLoading}
                  disabled={otp.length < 6}
                >
                  Verify & Log In
                </Button>

                <p className="text-center text-xs font-bold text-muted-foreground italic">
                  Didn't receive the code? <button type="button" onClick={handleLoginSubmit} className="text-primary hover:underline">Resend code</button>
                </p>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD STEP 1: ENTER REGISTERED EMAIL */}
          {step === 'forgot_email' && (
            <div className="animate-entrance">
              <button 
                onClick={resetToLogin}
                className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>

              <div className="text-center lg:text-left mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <KeyRound className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Reset <span className="text-gradient">Password</span></h2>
                <p className="text-muted-foreground font-medium text-sm">Enter your registered email address to receive an OTP verification code.</p>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800 mb-6">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmitForgotEmail(handleForgotEmailSubmit)}>
                <Input
                  label="Registered Email Address"
                  id="forgot-email-input"
                  type="email"
                  placeholder="name@gmail.com"
                  {...registerForgotEmail('email', { 
                    required: 'Registered email required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  error={forgotEmailErrors.email?.message}
                />

                <Button
                  type="submit"
                  size="xl"
                  className="w-full btn-saas-primary group"
                  loading={isLoading}
                  loadingText="SENDING OTP"
                >
                  Send OTP Code
                  <Mail className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD STEP 2: ENTER OTP */}
          {step === 'forgot_otp' && (
            <div className="animate-entrance">
              <button 
                onClick={resetToLogin}
                className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>

              <div className="text-center lg:text-left mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Verify <span className="text-gradient">OTP</span></h2>
                <p className="text-muted-foreground font-medium text-sm">Enter the 6-digit code sent to <span className="font-bold text-foreground underline">{forgotEmail}</span></p>
              </div>

              <form className="space-y-6" onSubmit={handleForgotOtpSubmit}>
                <Input
                  label="Enter 6-Digit OTP Code"
                  id="forgot-otp-input"
                  placeholder="000000"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="tracking-[0.8em] text-center font-black text-2xl py-6"
                  error={forgotOtpError}
                  autoFocus
                />

                <Button
                  type="submit"
                  size="xl"
                  className="w-full btn-saas-primary"
                  loading={isLoading}
                  disabled={forgotOtp.length !== 6}
                >
                  Verify Code
                </Button>

                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('forgot_email')}
                    className="hover:text-foreground transition-colors"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={isLoading}
                    className="text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD STEP 3: SET NEW & CONFIRM PASSWORD */}
          {step === 'forgot_reset' && (
            <div className="animate-entrance">
              <div className="text-center lg:text-left mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <KeyRound className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Set New <span className="text-gradient">Password</span></h2>
                <p className="text-muted-foreground font-medium text-sm">Create a strong new password for your BachatSaathi account.</p>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800 mb-6">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmitResetPass(handleResetPassSubmit)}>
                <div className="relative">
                  <Input
                    label="New Password"
                    id="forgot-new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerResetPass('newPassword', { 
                      required: 'New password required',
                      minLength: { value: 6, message: 'Must be at least 6 characters' }
                    })}
                    error={resetPassErrors.newPassword?.message}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-[45px] text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <PasswordStrengthBar password={newPasswordValue} />
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    id="forgot-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerResetPass('confirmPassword', { 
                      required: 'Confirm password required',
                      validate: val => val === newPasswordValue || 'Passwords do not match'
                    })}
                    error={resetPassErrors.confirmPassword?.message}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-[45px] text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <Button
                  type="submit"
                  size="xl"
                  className="w-full btn-saas-primary group mt-4"
                  loading={isLoading}
                  loadingText="SAVING PASSWORD"
                >
                  Reset Password & Log In
                  <CheckCircle2 className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;
