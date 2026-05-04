import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Fallback apenas visual local se o usuário ainda não tiver posto as chaves.
        console.warn("Chaves do Supabase não configuradas, usando preview local.");
        const localUrl = URL.createObjectURL(file);
        onChange(localUrl);
        return;
      }

      // Upload do arquivo pro Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Pega a URL pública
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicData.publicUrl);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload. Verifique se o bucket 'assets' existe no seu Supabase.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      
      {!value ? (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 rounded-xl ${heightClass} flex flex-col items-center justify-center text-gray-500 hover:bg-white hover:border-[#0B3C8C] cursor-pointer transition-all bg-gray-100/50 group relative overflow-hidden`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#0B3C8C] animate-spin mb-2" />
              <span className="text-sm font-medium">Enviando...</span>
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
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="h-10 w-10 text-red-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Arquivo PDF Selecionado</span>
            </div>
          )}
          
          <button 
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm transition-colors"
            title="Remover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
