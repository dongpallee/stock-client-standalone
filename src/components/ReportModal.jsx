import React from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';

const ReportModal = ({ isOpen, onClose, reportContent, stockCode, stockName, isLoading }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!reportContent) return;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stockCode}_분석보고서.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">종목 분석 보고서</h2>
              <p className="text-sm text-gray-500">
                {stockName} ({stockCode})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reportContent && (
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">보고서를 불러오는 중...</p>
            </div>
          ) : reportContent ? (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-gray-900" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-700" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                  em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r" {...props} />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
                    ) : (
                      <code className="block bg-gray-100 p-3 rounded my-2 text-sm font-mono overflow-x-auto" {...props} />
                    ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-300" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                  tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200" {...props} />,
                  tr: ({ node, ...props }) => <tr {...props} />,
                  th: ({ node, ...props }) => (
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-3 py-2 text-sm text-gray-700" {...props} />
                  ),
                  hr: ({ node, ...props }) => <hr className="my-6 border-gray-300" {...props} />,
                }}
              >
                {reportContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">보고서가 없습니다</p>
              <p className="text-gray-500 text-sm">
                분석을 먼저 수행하면 보고서가 생성됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
