import React, { createContext, useContext, useState, useRef } from "react";

interface FileUploadContextType {
  uploadedFiles: any[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeFile: (index: number) => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
}

const FileUploadContext = createContext<FileUploadContextType | null>(null);

export const FileUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const acceptedFileTypes = [
      "application/json",
      "text/plain",
      "text/csv",
      "application/pdf",
      "text/markdown",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    const newFiles = await Promise.all(
      files
        .filter((file) => acceptedFileTypes.includes(file.type))
        .map(async (file) => {
          const content = await readFileContent(file);
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            url: URL.createObjectURL(file),
            content: content,
          };
        })
    );

    setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const readFileContent = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <FileUploadContext.Provider
      value={{
        uploadedFiles,
        setUploadedFiles,
        handleFileUpload,
        removeFile,
        fileInputRef,
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
};

// Hook with null check to prevent usage outside provider
export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
};
