/**
 * Utilitário de otimização e compressão de imagens no navegador.
 * Reduz fotos de 5MB-15MB (câmeras de celular) para ~100KB-200KB sem perda visível de qualidade.
 * Evita o consumo excessivo de banda (Egress) e armazenamento no Supabase e no banco de dados.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<{ file: File; base64: string }> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.82,
    mimeType = "image/jpeg"
  } = options;

  // Se não for imagem (ex: PDF), retorna o original
  if (!file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, base64: reader.result as string });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcula novas dimensões mantendo o aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback caso canvas não funcione
          const originalBase64 = event.target?.result as string;
          resolve({ file, base64: originalBase64 });
          return;
        }

        // Suavização de imagem de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Gera Base64 otimizado
        const compressedBase64 = canvas.toDataURL(mimeType, quality);

        // Gera Blob/File comprimido para upload no Supabase Storage
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const cleanFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], cleanFileName, {
                type: mimeType,
                lastModified: Date.now()
              });
              resolve({ file: compressedFile, base64: compressedBase64 });
            } else {
              resolve({ file, base64: compressedBase64 });
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        const originalBase64 = event.target?.result as string;
        resolve({ file, base64: originalBase64 });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, base64: "" });
    };

    reader.readAsDataURL(file);
  });
}
