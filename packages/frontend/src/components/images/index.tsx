interface ImageLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

export function ImageLibrary({ isOpen, onClose, onImageSelect }: ImageLibraryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Image Library</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Image library feature coming soon...
        </p>
        <button
          onClick={onClose}
          className="mt-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
