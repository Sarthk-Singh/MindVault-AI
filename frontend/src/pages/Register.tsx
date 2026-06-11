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

const registerSchema = z.object({
  name: z.string().min(1, "Full Name is required."),
  email: z.string().email("Please enter a valid work email."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  role: z.enum(["ADMIN", "WORKSPACE_MANAGER", "MEETING_OWNER", "TEAM_MEMBER"]).default("TEAM_MEMBER")
});

type RegisterInput = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "TEAM_MEMBER"
    }
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userName", variables.name || "Alex Rivera");
      navigate("/");
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_, variables) => {
      // Automatically log in after registration
      loginMutation.mutate({
        email: variables.email,
        password: variables.password,
        name: variables.name
      });
    }
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  useEffect(() => {
    // 3D Card Tilt Effect
    const onMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const xRotation = (e.clientY - window.innerHeight / 2) / 60;
      const yRotation = (e.clientX - window.innerWidth / 2) / 60;
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
        className="w-full max-w-[460px] glass-card rounded-[32px] p-10 relative z-10"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02)"
        }}
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-[#a855f7] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <BrainCircuit className="text-3xl text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2 font-display">Create Account</h1>
          <p className="text-slate-400 text-sm font-light">Set up your profile to start tracking meetings</p>
        </div>

        {registerMutation.isError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-error text-xs rounded-xl">
            {(registerMutation.error as any)?.response?.data?.message || "Failed to create account. Please try again."}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="input-group relative">
            <input
              type="text"
              id="name"
              placeholder=" "
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm"
              {...register("name")}
            />
            <label htmlFor="name" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
              Full Name
            </label>
            {errors.name && (
              <p className="text-error text-xs mt-1 pl-1">
                {errors.name.message}
              </p>
            )}
          </div>

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
              Work Email
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

          {/* Role selector dropdown */}
          <div className="input-group relative">
            <select
              id="role"
              required
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none input-glow transition-all duration-300 peer text-sm appearance-none cursor-pointer"
              {...register("role")}
            >
              <option value="TEAM_MEMBER" className="bg-slate-900 text-slate-200">TEAM_MEMBER</option>
              <option value="WORKSPACE_MANAGER" className="bg-slate-900 text-slate-200">WORKSPACE_MANAGER</option>
              <option value="MEETING_OWNER" className="bg-slate-900 text-slate-200">MEETING_OWNER</option>
              <option value="ADMIN" className="bg-slate-900 text-slate-200">ADMIN</option>
            </select>
            <label htmlFor="role" className="floating-label absolute left-4 top-3.5 text-slate-500 text-sm">
              Organization Role
            </label>
            <div className="absolute right-4 top-3.5 text-slate-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit Button */}
          <button
            ref={submitBtnRef}
            type="submit"
            disabled={registerMutation.isPending || loginMutation.isPending}
            className="pulse-btn magnetic-target group relative w-full py-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white font-semibold text-sm shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {registerMutation.isPending || loginMutation.isPending ? "Creating account..." : "Register"}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-xs">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
