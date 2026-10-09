import React, { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { compressImageFile } from "../../lib/imageCompress";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  title?: string;
  description?: string;
  accept?: string;
  type?: "image" | "pdf";
  bucket?: string;
  folder?: string;
  heightClass?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const FileUpload = ({ 
  value, 
  onChange, 
  title = "Upload de Arquivo", 
  description, 
  accept = "image/*", 
  type = "image",
  bucket = "assets",
  folder = "uploads",
  heightClass = "h-40"
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasValidValue = !!(
    value && 
    typeof value === "string" && 
    value.trim() !== "" && 
    value !== "[BASE64]" && 
    value !== "undefined" && 
    value !== "null" &&
    !imgError
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setImgError(false);
      let uploadedUrl = "";

      // Tenta upload no Supabase Storage se configurado
      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, { upsert: true });

          if (!error) {
            const { data: publicData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filePath);
            
            if (publicData?.publicUrl) {
              uploadedUrl = publicData.publicUrl;
            }
          } else {
            console.warn("Upload no Supabase Storage falhou, usando fallback otimizado Base64:", error.message);
          }
        } catch (storageErr) {
          console.warn("Erro ao enviar ao Supabase Storage, usando fallback otimizado Base64:", storageErr);
        }
      }

      // Se o upload no Supabase Storage não gerou URL válida, usa Base64 comprimido
      // Comprime a imagem para manter o tamanho leve (~80-120KB) sem estourar quotas
      if (!uploadedUrl) {
        if (type === "image") {
          try {
            uploadedUrl = await compressImageFile(file, 1280, 1280, 0.82);
          } catch {
            uploadedUrl = await fileToBase64(file);
          }
        } else {
          uploadedUrl = await fileToBase64(file);
        }
      }

      onChange(uploadedUrl);
    } catch (error) {
      console.error("Erro no processamento do arquivo:", error);
      alert("Não foi possível processar o arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgError(false);
    onChange("");
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept={accept}
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!hasValidValue ? (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 rounded-xl ${heightClass} flex flex-col items-center justify-center text-gray-500 hover:bg-white hover:border-[#0B3C8C] cursor-pointer transition-all bg-gray-100/50 group relative overflow-hidden`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#0B3C8C] animate-spin mb-2" />
              <span className="text-sm font-medium">Otimizando e enviando...</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:scale-110 transition-transform">
                {type === "pdf" ? <FileText className="h-6 w-6 text-[#0B3C8C]" /> : <Upload className="h-6 w-6 text-[#0B3C8C]" />}
              </div>
              <span className="text-sm font-medium">{title}</span>
              {description && <span className="text-xs text-gray-400 mt-1">{description}</span>}
            </>
          )}
        </div>
      ) : (
        <div className={`relative ${heightClass} border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center`}>
          {type === "image" ? (
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover" 
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="h-10 w-10 text-red-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Arquivo PDF Selecionado</span>
            </div>
          )}
          
          <button 
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm transition-colors z-10"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
