import { useEffect, useState } from 'react';
import { Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '@/services/api';
import { useWebSocket } from '@/services/websocket';

interface ExportJob {
  id: string;
  presentationId: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filePath?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface ExportProgressProps {
  jobId: string;
  onClose?: () => void;
  onDownload?: (jobId: string) => void;
}

export function ExportProgress({ jobId, onClose, onDownload }: ExportProgressProps) {
  const [job, setJob] = useState<ExportJob | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const socket = useWebSocket();

  useEffect(() => {
    fetchJobStatus();

    const interval = setInterval(() => {
      if (job?.status !== 'completed' && job?.status !== 'failed') {
        fetchJobStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (!socket) return;

    const handleProgress = (updatedJob: ExportJob) => {
      if (updatedJob.id === jobId) {
        setJob(updatedJob);
      }
    };

    socket.on('export:progress', handleProgress);

    return () => {
      socket.off('export:progress', handleProgress);
    };
  }, [socket, jobId]);

  const fetchJobStatus = async () => {
    try {
      const status = await api.getExportStatus(jobId);
      setJob(status);
    } catch (error) {
      console.error('Failed to fetch export status:', error);
    }
  };

  const handleDownload = async () => {
    if (!job || job.status !== 'completed') return;

    setIsDownloading(true);
    try {
      const blob = await api.downloadExport(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation.${job.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      if (onDownload) {
        onDownload(jobId);
      }
    } catch (error) {
      console.error('Failed to download export:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!job) {
    return (
      <div className="bg-panel p-4 rounded-lg shadow-lg border border-foreground/10">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm">Loading export status...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (job.status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return 'Pending...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Export complete';
      case 'failed':
        return 'Export failed';
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'pending':
        return 'text-blue-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
    }
  };

  return (
    <div className="bg-panel p-4 rounded-lg shadow-lg border border-foreground/10">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getStatusIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">
              Exporting to {job.format.toUpperCase()}
            </h4>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className={`text-sm ${getStatusColor()} mb-3`}>{getStatusText()}</p>

          {(job.status === 'pending' || job.status === 'processing') && (
            <div className="space-y-2">
              <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="text-xs text-foreground/60">{job.progress}% complete</p>
            </div>
          )}

          {job.status === 'completed' && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="sm"
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          )}

          {job.status === 'failed' && job.error && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
              {job.error}
            </div>
          )}

          <p className="text-xs text-foreground/50 mt-2">
            Started {new Date(job.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ExportProgressListProps {
  jobs: ExportJob[];
  onClose?: (jobId: string) => void;
  onDownload?: (jobId: string) => void;
}

export function ExportProgressList({ jobs, onClose, onDownload }: ExportProgressListProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm w-full">
      {jobs.map((job) => (
        <ExportProgress
          key={job.id}
          jobId={job.id}
          onClose={onClose ? () => onClose(job.id) : undefined}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
