'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { PromptImportModal } from './prompt-import-modal';

export function PromptImportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={openModal} className="bg-green-600 hover:bg-green-700 text-white">
        <Upload className="h-4 w-4 mr-2" />
        Import Prompt
      </Button>
      <PromptImportModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
