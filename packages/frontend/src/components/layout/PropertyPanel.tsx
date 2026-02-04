import { useEditorStore } from '@/stores/useEditorStore';

export function PropertyPanel() {
  const { selectedElementIds } = useEditorStore();

  return (
    <aside className="flex w-80 flex-col border-l border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedElementIds.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select an element to edit its properties
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {selectedElementIds.length} element(s) selected
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
