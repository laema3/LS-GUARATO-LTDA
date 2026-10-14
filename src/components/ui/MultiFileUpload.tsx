import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";

import { compressImage } from "../../lib/imageOptimizer";

interface MultiFileUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
}

export const MultiFileUpload = ({ 
  value = [], 
  onChange, 
  bucket = "assets",
  folder = "setores"
}: MultiFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const newUrls = [...value];
      
      for (let i = 0; i < files.length; i++) {
        if (newUrls.length >= 10) break;
        const rawFile = files[i];
        
        // Comprime para evitar uploads pesados e estouro de consumo
        const { file, base64 } = await compressImage(rawFile, {
          maxWidth: 1400,
          maxHeight: 1400,
          quality: 0.82
        });

        const fileExt = file.name.split('.').pop() || "jpg";
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        try {
          const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, { upsert: true, contentType: file.type });

          if (!error) {
            const { data: publicData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filePath);

            if (publicData?.publicUrl) {
              newUrls.push(publicData.publicUrl);
              continue;
            }
          }
        } catch (storageErr) {
          console.warn("Storage upload falhou, usando Base64 otimizado:", storageErr);
        }

        // Se o storage falhar, usa o Base64 comprimido
        if (base64) {
          newUrls.push(base64);
        }
      }
      onChange(newUrls);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-4">
      <input 
        type="file" 
        accept="image/*"
        multiple
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border">
            <img src={url} alt="Setor" className="w-full h-full object-cover" />
            <button 
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center text-gray-400 hover:border-[#0B3C8C] hover:text-[#0B3C8C] cursor-pointer transition-all"
          >
            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
            <span className="text-xs mt-2">Adicionar</span>
          </div>
        )}
      </div>
    </div>
  );
};
