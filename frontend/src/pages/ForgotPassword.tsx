import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { ShaderBackground } from "../components/ShaderBackground";
import { CustomCursor } from "../components/CustomCursor";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address.")
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const requestResetMutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data.email),
    onSuccess: () => {
      setSuccess(true);
    }
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    requestResetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 text-slate-200">
      <ShaderBackground />
      <CustomCursor />

      {/* Layout Container */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full max-w-[1200px] items-center gap-10">
        
        {/* Left Side: Branding */}
        <div className="flex flex-col justify-center p-6 text-white">
          <div className="space-y-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 animate-reveal stagger-1">
              <span className="material-symbols-outlined text-4xl text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h1 className="text-2xl font-bold tracking-tight">MindVault-AI</h1>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight font-display text-white animate-reveal stagger-2">
                Recover your <span className="text-blue-400">workspace access.</span>
              </h2>
              <p className="text-lg text-white/70 animate-reveal stagger-3 font-light leading-relaxed">
                If you forgot your password, enter your registered email address and we'll send you instructions to safely reset it.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Floating Reset Card */}
        <div className="flex items-center justify-center lg:justify-end animate-reveal stagger-4">
          <div className="w-full max-w-[480px] glass-card rounded-[24px] p-8 md:p-10 shadow-2xl">
            <div className="mb-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs text-blue-400 hover:underline mb-4 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
              <h3 className="text-2xl font-semibold text-white mb-1">Reset password</h3>
              <p className="text-sm text-white/60">Enter your email and we'll send you a password reset link.</p>
            </div>

            {requestResetMutation.isError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {(requestResetMutation.error as any)?.response?.data?.message || "Failed to process request. Please try again."}
              </div>
            )}

            {success ? (
              <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-medium text-white">Instructions Sent</h4>
                <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
                  If that email is registered on MindVault AI, you will receive an email shortly with a link to reset your password.
                </p>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-block w-full py-3.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-blue-400">mail</span>
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 input-glow transition-all" 
                      id="email" 
                      placeholder="name@company.com" 
                      type="email"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 pl-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={requestResetMutation.isPending}
                  className="btn-ripple w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-80 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {requestResetMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Link...
                    </span>
                  ) : "Send Reset Link"}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
