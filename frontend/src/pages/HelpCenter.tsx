import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles, MessageCircleQuestion } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export const HelpCenter: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "How do I upload a new meeting recording?",
      answer: "Navigate to any active workspace from your dashboard, and click the 'Upload recording' button. You can drag and drop audio or video files directly. MindVault will automatically upload the file, add a job to the processing queue, and notify you as soon as the transcript, summary, and action items are ready."
    },
    {
      question: "How does the Semantic Search work?",
      answer: "Traditional search looks for exact keyword matches. MindVault's Semantic Search uses vector embeddings (via Google Gemini's models). This allows it to search for meaning and concepts. For example, searching for 'database speed issues' will find transcripts discussing 'indexing problems' or 'postgres query latency', even if the word 'speed' is never explicitly spoken."
    },
    {
      question: "What insights does the AI extract from my meetings?",
      answer: "Our pipeline processes transcripts to extract: 1) A concise high-level summary. 2) Key points list. 3) Action items, complete with tasks and assigned owners. 4) Major decisions. In addition, when you upload screenshots or slides, the OCR engine extracts text, summaries, and core concepts shown visually."
    },
    {
      question: "How do I invite team members to my workspace?",
      answer: "Inside your workspace dashboard, click on 'Invite Team Members'. Enter the email address of the team member you wish to invite and select a role (Admin, Workspace Manager, Meeting Owner, or Team Member). Once invited, they will be linked to the workspace immediately."
    },
    {
      question: "What file formats are supported for uploads?",
      answer: "For audio and video, we support standard formats including MP3, WAV, M4A, AAC, MP4, MOV, and WebM. For visual uploads and slides, we support JPEG and PNG images. Recommended maximum file size is 100MB per upload."
    },
    {
      question: "How long does meeting analysis take?",
      answer: "Transcription and summaries are usually generated within 2 to 5 minutes after upload. You can check the status on the dashboard or inside the workspace view; meetings will transition from 'Processing' to 'Done' automatically."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex-grow flex flex-col h-full max-w-4xl mx-auto space-y-8 animate-reveal">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-display mb-1 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          Help Center
        </h1>
        <p className="text-slate-400 text-sm">
          Frequently asked questions and guides to help you navigate and master MindVault-AI's features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Accordions */}
        <div className="md:col-span-8 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isOpen ? "border-primary/40 bg-slate-900/20" : "border-slate-800/80 bg-slate-900/10 hover:border-slate-700/60"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex justify-between items-center p-6 text-left cursor-pointer text-slate-200 hover:text-white"
                >
                  <span className="font-semibold text-sm font-display leading-snug pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ${
                      isOpen ? "transform rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] border-t border-slate-800/50" : "max-h-0"
                  } overflow-hidden`}
                >
                  <div className="p-6 text-xs text-slate-400 leading-relaxed font-body">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact info widget */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-slate-900/60 to-sky-950/20 border border-slate-800">
            <MessageCircleQuestion className="w-8 h-8 text-sky-400 mb-4" />
            <h3 className="text-base font-semibold text-white font-display mb-2">Still Need Help?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-body">
              Our engineering team is active. Reach out to get help with custom integrations, API keys, or enterprise migrations.
            </p>
            <a
              href="mailto:support@mindvault.ai"
              className="block text-center w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700/50"
            >
              Contact Support
            </a>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-gradient-to-tr from-purple-900/20 to-sky-900/20 border-purple-500/20">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="w-6 h-6 text-purple-400 mb-3" />
              <h4 className="text-white font-semibold text-xs mb-1 font-display">Pro Tips</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-body">
                Try querying search using descriptive goals like "database sync plans" instead of single words to get highly relevant contextual matches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
