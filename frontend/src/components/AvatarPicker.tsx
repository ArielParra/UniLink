import { useEffect, useState, type ChangeEvent } from 'react';

interface AvatarPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function AvatarPicker({
  file,
  onChange,
  disabled = false,
}: Readonly<AvatarPickerProps>) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);
  };

  return (
    <div className="rounded border border-borde p-3">
      <label htmlFor="signup-foto" className="block text-sm font-medium">
        Foto de perfil (opcional)
      </label>
      <div className="mt-2 flex items-center gap-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa del avatar"
            className="h-16 w-16 rounded-full border border-marca-500 object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-borde bg-superficie-2 text-xs text-texto-suave"
            aria-hidden="true"
          >
            Sin foto
          </div>
        )}
        <div className="flex-1 space-y-1">
          <input
            id="signup-foto"
            aria-label="Seleccionar foto de perfil"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="block w-full text-xs text-texto-suave file:mr-2 file:rounded file:border-0 file:bg-marca-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-marca-700 hover:file:bg-marca-500 hover:file:text-white"
            onChange={handleChange}
          />
          {file && (
            <button
              id="signup-foto-quitar"
              aria-label="Quitar foto seleccionada"
              type="button"
              disabled={disabled}
              className="text-xs text-error underline disabled:opacity-50"
              onClick={() => {
                onChange(null);
              }}
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-texto-suave">JPG, PNG o WebP. Máximo 5 MB.</p>
    </div>
  );
}
