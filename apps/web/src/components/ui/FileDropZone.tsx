"use client";

import { useState } from "react";
import { FileText, X, CheckCircle2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FileDropZone({ 
  label, 
  required, 
  multiple, 
  onFilesChange 
}: { 
  label: string, 
  required?: boolean, 
  multiple?: boolean,
  onFilesChange?: (files: File[]) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [justDropped, setJustDropped] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const flashSuccess = () => {
    setJustDropped(true);
    setTimeout(() => setJustDropped(false), 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles = multiple ? [...files, ...droppedFiles] : [droppedFiles[0]];
      setFiles(newFiles);
      if (onFilesChange) onFilesChange(newFiles);
      flashSuccess();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onFilesChange) onFilesChange(newFiles);
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = !!multiple;
    input.accept = '.pdf';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const selected = Array.from(target.files);
        const newFiles = multiple ? [...files, ...selected] : [selected[0]];
        setFiles(newFiles);
        if (onFilesChange) onFilesChange(newFiles);
        flashSuccess();
      }
    };
    input.click();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
        {label} {required && <span className="text-[var(--danger)]">*</span>}
      </label>
      
      {(!files.length || multiple) && (
        <motion.div 
          animate={{
            scale: isDragOver ? 1.015 : 1,
            borderColor: isDragOver ? "var(--brand-blue)" : justDropped ? "var(--verified)" : "var(--border-strong)",
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer relative overflow-hidden ${
            isDragOver 
              ? 'bg-[var(--brand-blue-light)]' 
              : justDropped
              ? 'bg-[var(--verified-bg)]'
              : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)]'
          }`}
          style={{ transition: 'background-color 0.2s ease' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {/* Drag-over ripple effect */}
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                key="ripple"
                className="absolute inset-0 bg-[var(--brand-blue)] rounded-xl"
                initial={{ opacity: 0.04 }}
                animate={{ opacity: [0.04, 0.08, 0.04] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {justDropped ? (
              <motion.div
                key="success"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <CheckCircle2 className="mx-auto mb-2 text-[var(--verified)]" size={32} />
                <p className="font-bold text-[var(--verified)]">Added successfully</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  animate={isDragOver ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <UploadCloud className="mx-auto mb-3 text-[var(--brand-blue)]" size={32} />
                </motion.div>
                <p className="font-bold text-[var(--text-primary)]">
                  {isDragOver ? "Release to upload" : "Drop file here"}
                </p>
                <p className="text-sm text-[var(--brand-blue)] font-medium mt-1">or click to browse</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">PDF up to 10MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* File list with enter/exit animations */}
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.div className="mt-3 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[var(--brand-blue-light)] flex items-center justify-center">
                        <FileText size={16} className="text-[var(--brand-blue)]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-[300px]">{file.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <motion.button 
                      onClick={() => removeFile(i)}
                      whileHover={{ scale: 1.15, color: "var(--danger)" }}
                      whileTap={{ scale: 0.9 }}
                      className="text-[var(--text-tertiary)] transition-colors p-1.5 rounded-md hover:bg-[var(--bg-subtle)]"
                      type="button"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
