import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { workspacesApi } from "../lib/api/workspaces";
import { XCircle, Loader2, FolderPlus } from "lucide-react";
import { CustomCursor } from "../components/CustomCursor";

export const JoinWorkspace: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [workspaceName, setWorkspaceName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const join = async () => {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        // Redirect to login, saving the redirect path
        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`, { replace: true });
        return;
      }

      if (!token) {
        setStatus("error");
        setErrorMessage("Invitation token is missing.");
        return;
      }

      try {
        const result = await workspacesApi.joinWorkspace(token);
        setWorkspaceName(result.workspaceName);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(
          err?.response?.data?.message || "Invalid or expired invite link. Please contact the administrator."
        );
      }
    };

    join();
  }, [token, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative">
      <CustomCursor />
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative glass-panel border border-slate-800 bg-slate-900/40 rounded-[32px] p-10 max-w-md w-full shadow-2xl text-center space-y-6 animate-reveal">
        {status === "loading" && (
          <div className="space-y-4 py-8 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
            <h3 className="text-lg font-bold text-white font-display">Processing Invitation</h3>
            <p className="text-xs text-slate-400">Please wait while we add you to the workspace...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/15">
              <FolderPlus className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">Workspace Joined!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have successfully joined <span className="font-semibold text-sky-400">{workspaceName}</span> as a team member.
              </p>
            </div>

            <div className="pt-2 w-full">
              <button
                onClick={() => navigate(`/`)}
                className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:scale-[1.02] active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                Go to Workspace
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/15">
              <XCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">Invitation Failed</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 w-full">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white py-3.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinWorkspace;
