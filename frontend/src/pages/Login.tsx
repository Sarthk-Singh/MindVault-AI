import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { BrainCircuit, Eye, EyeOff } from "lucide-react";
import { gsap } from "gsap";
import { NeuralCanvas } from "../components/NeuralCanvas";
import { CustomCursor } from "../components/CustomCursor";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

type LoginInput = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      const emailName = localStorage.getItem("registeredName") || "Alex Rivera";
      localStorage.setItem("userName", emailName);
      navigate("/");
    }
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  useEffect(() => {
    // 3D Card Tilt Effect
    const onMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const xRotation = (e.clientY - window.innerHeight / 2) / 40;
      const yRotation = (e.clientX - window.innerWidth / 2) / 40;
      gsap.to(cardRef.current, {
        rotationX: -xRotation,
        rotationY: yRotation,
        transformPerspective: 1000,
        duration: 0.5,
        ease: "power1.out"
      });
    };

    window.addEventListener("mousemove", onMouseMove);

    // Magnetic Button Effect
    const btn = submitBtnRef.current;
    if (btn) {
      const onBtnMouseMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      const onBtnMouseLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)"
        });
      };

      btn.addEventListener("mousemove", onBtnMouseMove);
      btn.addEventListener("mouseleave", onBtnMouseLeave);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        btn.removeEventListener("mousemove", onBtnMouseMove);
        btn.removeEventListener("mouseleave", onBtnMouseLeave);
      };
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background text-slate-200">
      <div className="mesh-gradient" />
      <NeuralCanvas opacity={0.4} particleCount={60} />
      <CustomCursor />

      <div
        ref={cardRef}
        className="w-full max-w-[420px] glass-card rounded-[32px] p-10 relative z-10"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02)"
        }}
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-[#a855f7] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <BrainCircuit className="text-3xl text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2 font-display">MindVault AI</h1>
          <p className="text-slate-400 text-sm font-light">Access your organizational memory</p>
        </div>

        {loginMutation.isError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-error text-xs rounded-xl">
            {(loginMutation.error as any)?.response?.data?.message || "Invalid email or password"}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div className="input-group relative">
            <input
              type="email"
              id="email"
              placeholder=" "
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
              {...register("email")}
            />
            <label htmlFor="email" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
              Email Address
            </label>
            {errors.email && (
              <p className="text-error text-xs mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="input-group relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 pr-12 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
              {...register("password")}
            />
            <label htmlFor="password" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && (
              <p className="text-error text-xs mt-1 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            ref={submitBtnRef}
            type="submit"
            disabled={loginMutation.isPending}
            className="pulse-btn magnetic-target group relative w-full py-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white font-semibold text-sm shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loginMutation.isPending ? "Connecting..." : "Sign In"}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="px-4 text-[10px] uppercase tracking-widest text-slate-600 font-semibold font-display">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => navigate("/search")} // Simulates passing auth
            className="group w-full py-3.5 rounded-xl border border-slate-800 bg-transparent hover:bg-slate-800/50 text-slate-300 font-medium text-sm flex items-center justify-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.99 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.85 2.99c.9-2.7 3.42-4.45 6.65-4.45z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.67 2.84c2.15-1.98 3.38-4.9 3.38-8.5z"
              />
              <path
                fill="#FBBC05"
                d="M5.35 14.95c-.23-.7-.36-1.45-.36-2.22s.13-1.52.36-2.22L1.5 7.5C.54 9.41 0 11.59 0 13.9s.54 4.49 1.5 6.4l3.85-2.99c-.23-.7-.36-1.45-.36-2.22z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.67-2.84c-1.02.68-2.33 1.09-4.29 1.09-3.23 0-5.75-1.75-6.65-4.45L1.5 16.88C3.39 20.73 7.35 23 12 23z"
              />
            </svg>
            Google Account
          </button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-xs">
          Don't have an account?{" "}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium ml-1">
            Create Workspace
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
