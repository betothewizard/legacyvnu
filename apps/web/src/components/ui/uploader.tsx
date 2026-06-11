"use client";

import {
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  FileArchive,
} from "lucide-react";
import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { Button } from "~/src/components/ui/button";

const variants = {
  base: "relative rounded-lg p-4 w-full flex justify-center items-center flex-col cursor-pointer border border-dashed border-border transition-colors duration-200 ease-in-out",
  active: "border-2 border-primary",
  disabled:
    "bg-muted border-border cursor-default pointer-events-none bg-opacity-30",
  accept: "border border-primary bg-primary/10",
  reject: "border border-destructive bg-destructive/10",
};

type InputProps = {
  width?: number;
  height?: number;
  className?: string;
  value?: File[];
  onChange?: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, "disabled">;
};

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number) {
    return `File quá lớn. Kích thước tối đa là ${formatFileSize(maxSize)}.`;
  },
  fileInvalidType() {
    return "Định dạng file không hợp lệ.";
  },
  tooManyFiles(maxFiles: number) {
    return `Bạn chỉ có thể thêm ${maxFiles} file.`;
  },
  fileNotSupported() {
    return "File không được hỗ trợ.";
  },
};

const Uploader = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { dropzoneOptions, width, height, value, className, disabled, onChange },
    ref,
  ) => {
    const onDrop = (acceptedFiles: File[]) => {
      if (!acceptedFiles) return;
      const newFiles = value ? [...value, ...acceptedFiles] : acceptedFiles;
      onChange?.(newFiles);
    };

    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject,
      fileRejections,
    } = useDropzone({
      onDrop,
      disabled,
      ...dropzoneOptions,
    });

    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isDragActive && variants.active,
          disabled && variants.disabled,
          isDragAccept && variants.accept,
          isDragReject && variants.reject,
          className,
        ).trim(),
      [isDragActive, isDragAccept, isDragReject, disabled, className],
    );

    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0];
        if (errors[0]?.code === "file-too-large") {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
        } else if (errors[0]?.code === "file-invalid-type") {
          return ERROR_MESSAGES.fileInvalidType();
        } else if (errors[0]?.code === "too-many-files") {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
        } else {
          return ERROR_MESSAGES.fileNotSupported();
        }
      }
      return undefined;
    }, [fileRejections, dropzoneOptions]);

    const removeFile = (file: File) => {
      const newFiles = value?.filter((f) => f !== file);
      onChange?.(newFiles || []);
    };

    const getFileIcon = (file: File) => {
      const type = file.type;
      const name = file.name.toLowerCase();

      if (type.startsWith("image/"))
        return <ImageIcon size={20} className="text-blue-500" />;
      if (type.includes("pdf"))
        return <FileText size={20} className="text-red-500" />;
      if (
        type.includes("zip") ||
        type.includes("compressed") ||
        type.includes("rar") ||
        name.endsWith(".zip") ||
        name.endsWith(".rar") ||
        name.endsWith(".7z")
      ) {
        return <FileArchive size={20} className="text-purple-700" />;
      }
      if (type.includes("sheet") || type.includes("excel"))
        return <FileSpreadsheet size={20} className="text-green-500" />;
      if (type.includes("text") || type.includes("document"))
        return <FileText size={20} className="text-blue-500" />;
      if (
        type.includes("code") ||
        type.includes("json") ||
        type.includes("xml")
      )
        return <FileCode size={20} className="text-purple-500" />;
      return <FileText size={20} className="text-gray-500" />;
    };

    const getFilePreview = (file: File) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    };

    return (
      <div>
        <div
          {...getRootProps({
            className: dropZoneClassName,
            style: {
              width,
              height,
            },
          })}
        >
          <input ref={ref} {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-xs text-muted-foreground">
            <UploadCloud className="mb-2 h-7 w-7" />
            <div className="text-muted-foreground">
              Kéo và thả để tải file lên
            </div>
            {(dropzoneOptions?.maxSize || dropzoneOptions?.accept) && (
              <div className="mt-3 text-center space-y-1">
                {dropzoneOptions?.maxSize && (
                  <div className="text-xs text-muted-foreground">
                    Kích thước tối đa: {formatFileSize(dropzoneOptions.maxSize)}
                  </div>
                )}
                {dropzoneOptions?.accept && (
                  <div className="text-xs text-muted-foreground">
                    Định dạng:{" "}
                    {Object.keys(dropzoneOptions.accept)
                      .map((type) => type.split("/")[1] || type)
                      .join(", ")
                      .toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <div className="mt-3">
              <Button variant="outline" disabled={disabled}>
                Chọn file
              </Button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-1 text-xs text-destructive">{errorMessage}</div>
        )}

        {value && value.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {value.map((file, i) => {
              const preview = getFilePreview(file);
              return (
                <div
                  key={i}
                  className="group relative inline-flex items-center gap-2 px-3 py-1 border rounded-sm bg-background transition-colors max-w-[240px]"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-6 h-6 object-cover rounded-full shrink-0 ring-2 ring-background"
                    />
                  ) : (
                    <div className="shrink-0">{getFileIcon(file)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    className="shrink-0 hover:text-destructive transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

Uploader.displayName = "Uploader";

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "0 Bytes";
  }
  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export { Uploader };
