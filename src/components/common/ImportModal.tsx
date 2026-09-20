import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Database, Trash2, ArrowRight } from 'lucide-react';
import { parseCSV, parseJSON, type ParseResult } from '../../data/dataAdapter';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { CategoryBadge } from './CategoryBadge';

export const ImportModal: React.FC = () => {
  const { isImportModalOpen, setIsImportModalOpen, loadImportedData, resetToDemoData, datasetSource } =
    useLifeThreads();

  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImportModalOpen) {
        setIsImportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImportModalOpen, setIsImportModalOpen]);

  if (!isImportModalOpen) return null;

  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    setParsing(true);
    setParseResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      try {
        let result: ParseResult;
        if (file.name.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
          result = parseJSON(text);
        } else {
          result = parseCSV(text);
        }
        setParseResult(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to process file contents.';
        setParseResult({
          receipts: [],
          errors: [msg],
          totalRows: 0,
          categoriesFound: [],
        });
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setParseResult({
        receipts: [],
        errors: ['File reading failed.'],
        totalRows: 0,
        categoriesFound: [],
      });
      setParsing(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.receipts.length > 0) {
      loadImportedData(parseResult.receipts);
      setIsImportModalOpen(false);
      setParseResult(null);
    }
  };

  return (
    <div
      id="import-data-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsImportModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/80 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400" aria-hidden="true">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-lg font-semibold font-display text-white">
                Import Organizer Dataset
              </h2>
              <p className="text-xs text-zinc-400">Load hackathon CSV or JSON receipts directly into memory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(false)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <span>Active Dataset:</span>
            <span className="font-semibold text-white uppercase tracking-wider">
              {datasetSource === 'imported' ? 'User Imported Dataset' : 'Curated Demo Dataset (112 moments)'}
            </span>
          </div>
          {datasetSource === 'imported' && (
            <button
              type="button"
              onClick={() => {
                resetToDemoData();
                setIsImportModalOpen(false);
              }}
              className="flex items-center gap-1.5 rounded text-xs text-rose-400 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Reset to Demo
            </button>
          )}
        </div>

        {/* Upload dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload dataset dropzone: Click or drag and drop CSV or JSON files"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
            dragOver
              ? 'border-cyan-500 bg-cyan-950/20'
              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            className="hidden"
            aria-label="Select CSV or JSON file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />
          <FileText className="h-10 w-10 text-zinc-500 mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-zinc-200">
            {fileName ? fileName : 'Drop your CSV or JSON file here, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Accepts fields: category, title, timestamp, location, description, tags, metadata
          </p>
        </div>

        {/* Parsing state or Results preview */}
        {parsing && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300" role="status">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" aria-hidden="true" />
            Normalizing and analyzing receipts...
          </div>
        )}

        {parseResult && (
          <div className="mt-4 space-y-3">
            {parseResult.errors.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300" role="alert">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Notices during parsing ({parseResult.errors.length}):</span>
                </div>
                <ul className="mt-1.5 list-disc pl-5 space-y-0.5 text-amber-400/90 max-h-24 overflow-y-auto">
                  {parseResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {parseResult.receipts.length > 0 ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4" role="status">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>Validation Successful: {parseResult.receipts.length} receipts ready</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-zinc-400 mr-1">Categories detected:</span>
                  {parseResult.categoriesFound.map((cat) => (
                    <CategoryBadge key={cat} category={cat} size="sm" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300" role="alert">
                No valid receipts could be constructed from this file. Please ensure timestamp and title or category columns exist.
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-4">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(false)}
            className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parseResult || parseResult.receipts.length === 0}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-zinc-950 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors shadow-lg shadow-cyan-500/20"
          >
            Load Into Life Threads
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
