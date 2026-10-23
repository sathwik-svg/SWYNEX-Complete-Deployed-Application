import { useState } from 'react';
import Modal from './Modal';
import { Copy, Check, Share2, GitBranch, ShieldCheck, Globe } from 'lucide-react';

interface SubmissionKitModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubmissionKitModal({ open, onClose }: SubmissionKitModalProps) {
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [copiedLiveUrl, setCopiedLiveUrl] = useState(false);

  const livePagesUrl = 'https://sathwik-svg.github.io/SWYNEX-Complete-Deployed-Application/';
  const liveCloudUrl = 'https://ais-pre-3nfdxddofvfuejhv6bvpdl-981864576343.asia-east1.run.app';
  const repoUrl = 'https://github.com/sathwik-svg/SWYNEX-Complete-Deployed-Application';

  const linkedinPostText = `🚀 Thrilled to announce the completion of Task 4: Complete Deployed Application for my internship with @SWYNEX Technologies!

Key accomplishments across this full-stack project:
🔹 Shipped a complete, production-grade cloud task management application (SWYNEX TaskFlow)
🔹 Fully integrated REST API architecture with real-time Express backend endpoints (/api/projects, /api/tasks, /api/health)
🔹 Developed comprehensive Loading States (shimmer skeletons, async button states) and resilient Error Boundaries (field-level 400 validation, 500 error fallback, and optimistic rollbacks)
🔹 Built an interactive 3-column Kanban board, analytics metrics dashboard, and JSON data export/import suite
🔹 Live deployed on GitHub Pages and Cloud Run with public access and comprehensive setup documentation

🌐 Live Application: ${livePagesUrl}
📁 GitHub Repository: ${repoUrl}

A huge thank you to the team and mentors at @SWYNEX Technologies for this incredible hands-on internship experience!

#SWYNEX #Internship #CompleteDeployedApplication #FullStack #React #TypeScript #WebDevelopment #DevOps #SoftwareEngineering`;

  const gitCommands = `# 1. Add remote and push to SWYNEX-Complete-Deployed-Application
git remote add origin https://github.com/sathwik-svg/SWYNEX-Complete-Deployed-Application.git
git branch -M main
git push -u origin main

# 2. Deploy to GitHub Pages (gh-pages branch)
npm run build
cd dist
git init -b gh-pages
git add -A
git commit -m "Deploy live application to GitHub Pages"
git push -f origin gh-pages`;

  const handleCopyPost = () => {
    navigator.clipboard.writeText(linkedinPostText);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2500);
  };

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2500);
  };

  const handleCopyLive = () => {
    navigator.clipboard.writeText(livePagesUrl);
    setCopiedLiveUrl(true);
    setTimeout(() => setCopiedLiveUrl(false), 2500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Task 4 Submission & Deployment Kit"
      description="Everything required to submit Task 4: Complete Deployed Application to the SWYNEX reviewer."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs text-slate-600">
        {/* Verification Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
            <ShieldCheck size={16} className="text-emerald-600" />
            Task 4 Submission Verification Checklist
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 text-emerald-800">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Complete Full-Stack Application</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Live Deployed & Verified (GitHub Pages)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>README with Setup & Screenshots</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Incognito / Public Access Tested</span>
            </div>
          </div>
        </div>

        {/* Live Deployment URLs */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-blue-950 text-sm">
              <Globe size={16} className="text-blue-600" />
              <span>Live Deployment Links</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLive}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition-colors"
            >
              {copiedLiveUrl ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedLiveUrl ? 'Copied URL' : 'Copy Live URL'}</span>
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 font-sans text-xs">Primary Live URL (GitHub Pages): </span>
              <a
                href={livePagesUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline font-semibold hover:text-blue-900 break-all"
              >
                {livePagesUrl}
              </a>
            </div>
            <div>
              <span className="text-slate-500 font-sans text-xs">Full-Stack Cloud Run Applet: </span>
              <a
                href={liveCloudUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline font-semibold hover:text-blue-900 break-all"
              >
                {liveCloudUrl}
              </a>
            </div>
          </div>
        </div>

        {/* GitHub Repository Push Commands */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <GitBranch size={15} className="text-blue-600" />
              <span>Repository URL: SWYNEX-Complete-Deployed-Application</span>
            </div>
            <button
              type="button"
              onClick={handleCopyGit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {copiedGit ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedGit ? 'Copied Commands' : 'Copy Commands'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
            {gitCommands}
          </pre>
        </div>

        {/* LinkedIn Post Copy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Share2 size={15} className="text-blue-600" />
              <span>Ready-to-Post LinkedIn Caption</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPost}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
            >
              {copiedPost ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedPost ? 'Copied Caption' : 'Copy Caption'}</span>
            </button>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white leading-relaxed font-sans text-slate-700 whitespace-pre-wrap max-h-44 overflow-y-auto">
            {linkedinPostText}
          </div>
        </div>

        {/* Private Window Reminder */}
        <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
          <p className="font-semibold mb-1">Pre-Submission Verification Tip:</p>
          <p>
            Before clicking "Submit task", open both the GitHub repository link and the live application URL in a
            private/incognito browser window to make sure both open without asking for login or permissions.
          </p>
        </div>
      </div>
    </Modal>
  );
}
