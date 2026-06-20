import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { Eye, EyeOff } from "lucide-react";
import { ShaderBackground } from "../components/ShaderBackground";
import { CustomCursor } from "../components/CustomCursor";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

type LoginInput = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const name = data.user?.name || "Alex Rivera";
      sessionStorage.setItem("userName", name);
      
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    },
    onError: () => {
      setValue("password", "");
    }
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
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
                Elevate your workspace with <span className="text-blue-400">prescient intelligence.</span>
              </h2>
              <p className="text-lg text-white/70 animate-reveal stagger-3 font-light leading-relaxed">
                Join the next generation of enterprise management. MindVault-AI transforms meetings into actionable intelligence automatically.
              </p>
            </div>
            
            <div className="flex items-center gap-4 animate-reveal stagger-4 pt-4">
              <div className="flex -space-x-2">
                <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA0jcen4mehnxDnEC3M-XTFwRMj5mZRm82S62lZKeQFlAFqUr9-cG42ZW-KknfSolbhpQSJTFAFewgiMTknq0ZtvLinwg_U8jcEsGngl6WKP2txyItFMsVq0pI0sCVu7q1-tHnWwFWgQZe8XVu9fCXNJIMQtorJWXUVmAmSYldBZLJCe7qD-plSLnDR5NuM7XY9AWHxkwe-gCMqEdBxvcY0sjP_edcZQPtnps8l3OJCmvTju0CmOsJInreXP_X9HKvz53D8Zn7qKc" alt="user 1"/>
                <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9pFVzr0onpjIFRFOF_ueR2CcQm01Nog364JQQj5n1zJSobs27b_l5YRUfW8ePxifEJare5ICxRy4UlHCz5nlQ05tU0beMz6UN1jfImHN8Bn4_wYKr-4-qJ7fZfIhtJtl9-qBPuq1KBbj3KDqDB6HETUc5wDV035KXoSchj_HuarU-Q43z5Q3JCTkdzpcw8Dv50YMWeFrVAf0uhF-F7ekg7rohxhZfFTBynlKF0ecvcPctMJSXjVVHGl6-DTJyrL4IwxH6IGogwSU" alt="user 2"/>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white animate-pulse">12K+</div>
              </div>
              <p className="text-sm text-white/50 italic font-light">Trusted by industry leaders worldwide.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Floating Login Card */}
        <div className="flex items-center justify-center lg:justify-end animate-reveal stagger-5">
          <div className="w-full max-w-[480px] glass-card rounded-[24px] p-8 md:p-10 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-1">Welcome back</h3>
              <p className="text-sm text-white/60">Enter your credentials to access your account.</p>
            </div>

            {loginMutation.isError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {(loginMutation.error as any)?.response?.data?.message || "Invalid email or password"}
              </div>
            )}

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

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white/80 block" htmlFor="password">Password</label>
                  <a href="#" className="text-[11px] text-blue-400 hover:underline">Forgot password?</a>
                </div>
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

              {/* Sign In Button */}
              <button 
                type="submit"
                disabled={loginMutation.isPending}
                className="btn-ripple w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-80 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <div className="mt-8 text-center space-y-6">
              <p className="text-sm text-white/60">
                Don't have an account? 
                <Link className="text-blue-400 font-semibold hover:underline ml-1" to="/register">Register</Link>
              </p>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-xs text-white/30 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  const redirect = params.get("redirect");
                  if (redirect) {
                    sessionStorage.setItem("loginRedirect", redirect);
                  }

                  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
                  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
                  window.location.href = `${baseUrl}/api/auth/google`;
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS-_58s_7rMMZtAmcSoD-pQSx7RBC4txWHtwDiHR82Hre9iYVeXSUNXOeiryFDNfQSCW6JlY4Eu0_3M2Dj9dEFvLEa4M4_DfHMkgdc2hfVzejjmE_gZ8e3SCerZ4nKkjd0PJ-PbegZJamHkE9uGfL_tHIUpZa1lOTB76A2q9om4CFsHZnifxMGf4ZGTJYrU7g9C-ACGIjvPxwqrXCD2rmCr8g8gMaBph1ODNwHaiwMyz-Azq93_OWFn7hF-5GvvTI43kGvQiJUcDM"/>
                <span>Continue with Google</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
