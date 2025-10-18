'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader2, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { listDocuments, uploadDocument } from '@/lib/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Document = {
  content_type: string;
  filename: string;
  id: string;
  size: number;
  upload_date: string;
  is_embedded: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
};

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || 50);

// Status badge component
const StatusBadge = ({ status, isEmbedded }: { status: Document['processing_status']; isEmbedded: boolean }) => {
  if (status === 'completed' && isEmbedded) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Ready</span>
      </div>
    );
  }
  
  if (status === 'processing') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs font-medium">Processing</span>
      </div>
    );
  }
  
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Pending</span>
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700">
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Failed</span>
      </div>
    );
  }
  
  return null;
};

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const result = await listDocuments();
    setDocuments(result.documents || []);
    setIsLoading(false);
  };

  // --- File Selection & Validation ---
  const validateFiles = (incomingFiles: File[]) => {
    const validFiles: File[] = [];
    incomingFiles.forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        toast.error(
          `${file.name} exceeds ${MAX_FILE_SIZE_MB} MB limit. It will not be uploaded.`
        );
      } else {
        validFiles.push(file);
      }
    });
    return validFiles;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = validateFiles(Array.from(e.target.files));
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // --- Upload Handler ---
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      setUploadProgress((prev) => ({ ...prev, [file.name]: 10 }));

      const result = await uploadDocument(formData);
      if (result.success) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        toast.success(`Uploaded ${file.name} successfully`);
      } else {
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setFiles([]);
    await fetchDocuments();
    setIsUploading(false);
    setUploadProgress({});
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Manage uploaded documents</p>
      </header>

      {/* Main Layout */}
      <main className="flex flex-col md:flex-row flex-1 gap-6 max-w-6xl mx-auto p-6">
        {/* Left: Document List */}
        <Card className="flex-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Uploaded Documents</h2>
            <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>

          <ScrollArea className="h-[70vh]">
            {isLoading && documents.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.filename}</p>
                      <p className="text-xs text-gray-500">{doc.upload_date}</p>
                    </div>
                    <StatusBadge status={doc.processing_status} isEmbedded={doc.is_embedded} />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Right: Upload Section */}
        <Card className="flex-1 p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer',
              files.length > 0 ? 'border-primary/50 bg-primary/5' : 'hover:bg-gray-100'
            )}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop your files here or{' '}
              <label className="text-primary underline cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">
              You can upload multiple files (max {MAX_FILE_SIZE_MB} MB per file)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between border rounded-lg px-3 py-2 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadProgress[file.name] ? (
                      uploadProgress[file.name] > 0 &&
                      uploadProgress[file.name] < 100 ? (
                        <Progress value={uploadProgress[file.name]} className="w-24" />
                      ) : uploadProgress[file.name] === 100 ? (
                        <span className="text-xs text-green-500">Done</span>
                      ) : (
                        <span className="text-xs text-red-500">Error</span>
                      )
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFile(file.name)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}