'use client';

import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      console.error('Arquivos rejeitados:', rejectedFiles);
    }
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles,
    maxSize
  });

  const removeFile = (fileToRemove: File) => {
    const newFiles = acceptedFiles.filter(file => file !== fileToRemove);
    onFileSelect(newFiles);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-red-400 bg-red-50',
          isDragAccept && 'border-green-400 bg-green-50',
          isDragReject && 'border-red-400 bg-red-50',
          !isDragActive && 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={cn(
              'w-12 h-12',
              isDragActive ? 'text-red-500' : 'text-gray-400'
            )} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? 'Solte o arquivo aqui'
                : 'Arraste o memorial descritivo ou clique para selecionar'
              }
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Suporte para PDF, DOCX e DOC (máximo {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
        </div>
      </div>

      {/* Arquivos Aceitos */}
      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Arquivos selecionados:</h4>
          {acceptedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Arquivos Rejeitados */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-900">Arquivos rejeitados:</h4>
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <ul className="text-xs text-red-600">
                    {errors.map((error) => (
                      <li key={error.code}>
                        {error.code === 'file-too-large' && 'Arquivo muito grande'}
                        {error.code === 'file-invalid-type' && 'Tipo de arquivo não suportado'}
                        {error.code === 'too-many-files' && 'Muitos arquivos selecionados'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}