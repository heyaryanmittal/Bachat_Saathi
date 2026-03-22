import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';
import { Wallet, LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pending2FAEmail, setPending2FAEmail] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);
    setOtpError('');
    try {
      const result = await login(data.email, data.password);
      if (result && result.require2FA) {
        setPending2FAEmail(data.email);
        setShowOtpModal(true);
        toast.success('OTP sent to your email.');
        return;
      }
      if (result) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        toast.error('Login failed.');
      }
    } catch (error) {
      setError('Invalid credentials or network issue.');
      toast.error('Login error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp || !pending2FAEmail) return;
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login-2fa', { email: pending2FAEmail, otp });
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      setOtpError('Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden relative">
      <div className="absolute top-8 left-8 z-50 pointer-events-auto">
        <Logo isLight={true} />
      </div>
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      {}
      <div className="hidden lg:flex flex-col items-center justify-center p-20 relative overflow-hidden bg-emerald-950 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 mix-blend-overlay opacity-50 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute top-0 -left-10 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="relative z-10 text-center text-white max-w-md">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
                <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-6 leading-tight">Your Financial Future Starts and Scales Here.</h1>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">Join 10,000+ users who track their wealth with bank-grade security and AI-powered insights.</p>
            <div className="space-y-4">
                {['End-to-end Encryption', 'Instant Expense Tracking', 'Intelligent Budgeting'].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 transition-colors hover:bg-white/10">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold opacity-80">{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      {}
      <div className="flex items-center justify-center p-8 sm:p-12 animate-entrance bg-white dark:bg-gray-950 overflow-y-auto">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-10">
            <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="text-white w-7 h-7" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">Welcome <span className="text-gradient">Back</span></h2>
            <p className="text-muted-foreground font-medium italic">Secure access to your BachatSaathi account.</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              autoComplete="email"
              placeholder="name@company.com"
              {...register('email', { required: 'Email required' })}
              error={errors.email?.message}
            />
            <Input
              label="Password Key"
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', { required: 'Password required' })}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between text-xs font-bold text-primary italic hover:underline cursor-pointer">
                <span>Forgot password?</span>
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
                <div className="relative flex justify-center text-xs uppercase font-black text-muted-foreground/30"><span className="bg-background px-4">OR CONTINUE WITH</span></div>
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              New to our ecosystem? <Link to="/signup" className="text-primary font-bold hover:underline">Create a free account</Link>
            </p>
          </form>
        </div>
      </div>
      {}
      {showOtpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-sm w-full animate-entrance">
                  <h3 className="text-xl font-black mb-4">2-Step Verification</h3>
                  <p className="text-sm text-muted-foreground mb-6">We've sent a 6-digit code to your email for added security.</p>
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                      <Input
                        label="6-Digit OTP"
                        id="login-otp"
                        name="otp"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="000 000"
                        error={otpError}
                      />
                      <div className="grid grid-cols-2 gap-4 pt-4">
                          <Button 
                            variant="secondary" 
                            type="button" 
                            onClick={() => setShowOtpModal(false)}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="btn-saas-primary" 
                            type="submit" 
                            loading={isLoading}
                          >
                            Verify
                          </Button>
                      </div>
                  </form>
              </Card>
          </div>
      )}
    </div>
  );
}
export default Login;
