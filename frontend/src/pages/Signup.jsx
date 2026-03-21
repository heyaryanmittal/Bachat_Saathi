import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/ui';
import { Wallet, UserPlus, ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/Logo';
function Signup() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');
  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      await api.post('/auth/signup/request-otp', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      setFormData(data);
      setStep(2);
      toast.success('Verification code sent!');
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError('Enter a 6-digit code');
      return;
    }
    try {
      setIsVerifyingOtp(true);
      setOtpError('');
      const response = await api.post('/auth/signup/verify-otp', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otp
      });
      const { token, user } = response.data.data;
      setAuthData(user, token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      setOtpError('Invalid code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background overflow-hidden relative">
      <div className="absolute top-8 left-8 z-50 pointer-events-auto">
        <Logo isLight={true} />
      </div>
      {}
      <div className="hidden lg:flex flex-col items-center justify-center p-20 relative overflow-hidden bg-emerald-950 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 mix-blend-overlay opacity-50 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="relative z-10 text-center text-white max-w-md">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
                <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-6 leading-tight transition-all">Start Your Wealth Multiplication Journey.</h1>
            <p className="text-white/70 text-lg mb-12 italic leading-relaxed">Join thousands who are transforming their financial habits with BachatSaathi's premium toolset.</p>
            <div className="grid gap-4">
                {['Zero Setup Fees', 'AI Budgeting Agents', 'Multi-Device Sync', 'Priority Support'].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 text-left transition-colors hover:bg-white/10">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm font-bold opacity-80 uppercase tracking-widest leading-none">{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      {}
      <div className="flex items-center justify-center p-8 sm:p-12 animate-entrance bg-white dark:bg-gray-950 overflow-y-auto">
        <div className="max-w-md w-full focus-within:scale-[1.01] transition-transform duration-500">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="text-white w-7 h-7" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">
              {step === 1 ? <>Global <span className="text-gradient">Signup</span></> : <>Verify <span className="text-gradient">Email</span></>}
            </h2>
            <p className="text-muted-foreground font-medium text-sm">
              {step === 1 ? 'Start your premium financial experience.' : `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>
          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800">
                  {error}
                </div>
              )}
              <Input
                label="Identity Display Name"
                placeholder="Aryan Mittal"
                {...register('name', { required: 'Name required', minLength: 2 })}
                error={errors.name?.message}
              />
              <Input
                label="Secure Email Workspace"
                type="email"
                placeholder="aryan@wealth.com"
                {...register('email', { required: 'Email required' })}
                error={errors.email?.message}
              />
              <Input
                label="Master Access Key"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password required', minLength: 6 })}
                error={errors.password?.message}
              />
              <Input
                label="Confirm Access Key"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', { 
                    required: 'Confirmation required',
                    validate: v => v === password || 'Keys must match'
                })}
                error={errors.confirmPassword?.message}
              />
              <Button
                type="submit"
                size="xl"
                className="w-full btn-saas-primary group mt-4 shadow-2xl"
                loading={isLoading}
                loadingText="PREPARING ACCOUNT"
              >
                Join the Ecosystem
                <UserPlus className="ml-2 w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
              <p className="text-center text-sm font-medium text-muted-foreground mt-6">
                Already member? <Link to="/login" className="text-primary font-bold hover:underline">Log in securely</Link>
              </p>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpVerification}>
                <Input
                    label="Verification Code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-3xl font-black tracking-[0.5em]"
                    placeholder="000000"
                    error={otpError}
                />
                <Button 
                    type="submit" 
                    size="xl" 
                    className="w-full btn-saas-primary" 
                    loading={isVerifyingOtp}
                    loadingText="VERIFYING"
                >
                    Finalize Connection
                </Button>
                <Button 
                    variant="ghost" 
                    type="button" 
                    className="w-full font-bold text-xs uppercase tracking-widest text-muted-foreground"
                    onClick={() => setStep(1)}
                >
                    Back to Registration
                </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default Signup;
