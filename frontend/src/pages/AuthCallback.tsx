import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");

    if (token && refresh) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refresh);

      // Parse name and userId from token payload
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const name = payload.name || "Google User";
        localStorage.setItem("userName", name);
        if (payload.userId) {
          localStorage.setItem("userIdCode", payload.userId);
        }
      } catch (e) {
        localStorage.setItem("userName", "Google User");
      }

      const redirect = searchParams.get("redirect") || localStorage.getItem("loginRedirect");
      if (redirect) {
        localStorage.removeItem("loginRedirect");
        navigate(redirect);
      } else {
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        <p className="text-sm font-semibold text-slate-400">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
