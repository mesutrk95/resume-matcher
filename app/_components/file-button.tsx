import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { UploadIcon } from 'lucide-react';
import React, { ChangeEvent, ReactNode, useRef, useState } from 'react';

interface FileButtonProps {
  children?: ReactNode;
  onFileSelected?: (file: File) => void;
  loading?: boolean;
  loadingText?: string;
  accept?: string;
}

export const FileButton = ({
  children,
  onFileSelected,
  loading,
  loadingText,
  accept = '',
}: FileButtonProps) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (onFileSelected && selectedFile) {
        onFileSelected(selectedFile);
      }
    }
  };

  const handleButtonClick = () => {
    // Reset the value of the file input before clicking it
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Trigger the hidden file input when button is clicked
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      // Call the onFileSelected callback if provided
      if (onFileSelected && file) {
        onFileSelected(file);
      }
    } else {
      console.log('No file selected');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        id="dropzone-file"
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
      />
      <div className="flex flex-col gap-2">
        <LoadingButton
          type="button"
          onClick={handleButtonClick}
          loading={loading}
          loadingText={loadingText}
        >
          {children || 'Select File'}
        </LoadingButton>
      </div>
    </form>
  );
};
