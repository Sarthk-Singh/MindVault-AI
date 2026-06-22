import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { ShaderBackground } from "../components/ShaderBackground";
import { CustomCursor } from "../components/CustomCursor";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => {
      if (!token) throw new Error("No token provided");
      return authApi.resetPassword(token, data.password);
    },
    onSuccess: () => {
      setSuccess(true);
    }
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 text-slate-200">
        <ShaderBackground />
        <CustomCursor />
        <div className="relative z-10 w-full max-w-[480px] glass-card rounded-[24px] p-8 md:p-10 shadow-2xl text-center space-y-4">
          <h3 className="text-xl font-bold text-red-400">Invalid Link</h3>
          <p className="text-sm text-white/60">
            This password reset link is missing a token. Please request a new link from the forgot password page.
          </p>
          <div className="pt-4">
            <Link to="/forgot-password" className="text-blue-400 font-semibold hover:underline">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                Set a <span className="text-blue-400">new password.</span>
              </h2>
              <p className="text-lg text-white/70 animate-reveal stagger-3 font-light leading-relaxed">
                Choose a strong, secure password containing at least 8 characters to finalize recovery of your account.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Floating Reset Card */}
        <div className="flex items-center justify-center lg:justify-end animate-reveal stagger-4">
          <div className="w-full max-w-[480px] glass-card rounded-[24px] p-8 md:p-10 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-1">Choose new password</h3>
              <p className="text-sm text-white/60">Enter your new password below to reset it.</p>
            </div>

            {resetMutation.isError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {(resetMutation.error as any)?.response?.data?.message || "Invalid or expired reset token. Please request another one."}
              </div>
            )}

            {success ? (
              <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-medium text-white">Password Reset Successful</h4>
                <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
                  Your password has been reset successfully. You can now use your new credentials to sign in.
                </p>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-block w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all text-center"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block" htmlFor="password">New Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-blue-400">lock</span>
                    <input 
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 input-glow transition-all" 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1 pl-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80 block" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-blue-400">lock_reset</span>
                    <input 
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 input-glow transition-all" 
                      id="confirmPassword" 
                      placeholder="••••••••" 
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1 pl-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="btn-ripple w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-80 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {resetMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </span>
                  ) : "Reset Password"}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
