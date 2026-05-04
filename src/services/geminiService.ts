import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is missing');
    }
    ai = new GoogleGenAI({ apiKey: key || '' });
  }
  return ai;
}

export const suggestText = async (context: string, prompt: string, maxLength: string = "50 palavras"): Promise<string> => {
  try {
    const client = getGemini();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Atue como um especialista em marketing e comunicação institucional do supermercado "LS Guarato".
      O usuário quer ajuda para escrever: "${context}".
      
      Detalhes/Dicas fornecidas pelo usuário ou contexto: "${prompt}"
      
      Crie um texto profissional, focado no cliente e na qualidade do supermercado, com no máximo ${maxLength}.
      Responda apenas com o texto final, sem introduções ou aspas.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Erro ao gerar texto com IA:", error);
    return "Erro ao gerar sugestão. Tente novamente.";
  }
};
export const suggestSlideDescription = async (title: string): Promise<string> => {
  if (!title) return "Por favor, insira um título primeiro.";
  
  try {
    const client = getGemini();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Atue como um especialista em marketing do supermercado "LS Guarato".
      Crie uma frase curta, atrativa e vendedora (máximo 15 palavras) para o banner do site, baseada no título: "${title}".
      Responda apenas com a frase, sem aspas, formatação ou explicações.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Erro ao gerar descrição com IA:", error);
    return "Erro ao gerar sugestão. Tente novamente.";
  }
};
