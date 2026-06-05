/**
 * @file upload-zone.tsx
 * @package apps/web
 * @purpose Renders a styled, responsive file upload drag-and-drop target.
 * @dependencies react, lucide-react
 * @security Check file type extensions and sizes on drag before updating state.
 * @future_implementation Wire client uploads to UploadThing APIs and return progress percentage states.
 */

"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, FileText } from "lucide-react";

interface UploadZoneProps {
  label: string;
  accept: string;
  onUploadComplete: (url: string) => void;
}

export function UploadZone({ label, accept, onUploadComplete }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setProgress(10);
    
    // Simulate upload progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onUploadComplete(`https://uploadthing.com/f/uploaded-${file.name}`);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
        isDragActive
          ? "border-emerald-500 bg-emerald-500/5"
          : fileName
          ? "border-slate-800 bg-slate-900/40"
          : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/10"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {fileName ? (
        <div className="w-full flex items-center justify-between text-left px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[200px]">{fileName}</p>
              <p className="text-xs text-slate-400">{progress === 100 ? "Ready" : `Uploading: ${progress}%`}</p>
            </div>
          </div>
          {progress === 100 && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
        </div>
      ) : (
        <>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">{label}</p>
            <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browser</p>
          </div>
        </>
      )}

      {fileName && progress < 100 && (
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
