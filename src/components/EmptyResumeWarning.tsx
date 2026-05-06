interface EmptyResumeWarningProps {
  onUploadClick: () => void;
}

export function EmptyResumeWarning({ onUploadClick }: EmptyResumeWarningProps) {
  return (
    <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <p>
        You need to upload at least one resume before analyzing.{' '}
        <button
          onClick={onUploadClick}
          className="font-medium underline underline-offset-2"
        >
          Upload one now
        </button>
      </p>
    </div>
  );
}
