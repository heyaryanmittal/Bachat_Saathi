import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';
import { Wallet, LogIn, ShieldCheck, Mail, Lock, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLoginSubmit = async (data) => {
    console.log('[Login] SUBMIT START:', data.email);
    setError('');
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      console.log('[Login] RESULT RECEIVED:', result);
      
      if (result && result.require2FA === true) {
        console.log('[Login] TRIGGERING OTP STEP');
        setPendingEmail(data.email);
        setStep('otp');
      } else if (result && typeof result === 'object' && result.email) {
        console.log('[Login] TRIGGERING SUCCESS REDIRECT');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        console.warn('[Login] UNKNOWN RESULT STATUS:', result);
      }
    } catch (err) {
      console.error('[Login] SUBMIT CRITICAL ERROR:', err);
      setError('An unexpected error occurred. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };


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

  const resetToLogin = () => {
    setStep('credentials');
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden relative">
      <div className="absolute top-8 left-8 z-50 pointer-events-auto">
        <Logo isLight={true} />
      </div>
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

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

      <div className="flex items-center justify-center p-8 sm:p-12 animate-entrance bg-white dark:bg-gray-950 overflow-y-auto">
        <div className="max-w-md w-full">
          {step === 'credentials' ? (
            <>
              <div className="text-center lg:text-left mb-10">
                <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Wallet className="text-white w-7 h-7" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Welcome <span className="text-gradient">Back</span></h2>
                <p className="text-muted-foreground font-medium italic">Secure access to your BachatSaathi account.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(handleLoginSubmit)}>
                {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800">
                    {error}
                  </div>
                )}
                
                <Input
                  label="Email Workspace"
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', { required: 'Email required' })}
                  error={errors.email?.message}
                />
                
                <Input
                  label="Password Key"
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password required' })}
                  error={errors.password?.message}
                />

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
          ) : (
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
        </div>
      </div>
    </div>
  );
}

export default Login;

