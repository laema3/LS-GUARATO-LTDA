import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateSectorDescription = async (sectorTitle: string): Promise<string> => {
  if (!sectorTitle) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `Você é um redator especializado em varejo e supermercados. 
      Crie uma descrição curta, atraente e profissional para o setor de "${sectorTitle}" de um supermercado de excelência. 
      A descrição deve destacar a qualidade, o frescor e a variedade dos produtos.
      Máximo de 30 palavras. Responda apenas com o texto da descrição.` }] }]
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return "";
  }
};

export const suggestText = async (type: string, context: string, limit: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `Aja como um redator publicitário de supermercados de luxo/conveniência.
      Gere um(a) ${type} para o seguinte contexto: "${context}".
      Limite: ${limit}.
      Responda apenas com o texto sugerido, sem aspas ou explicações.` }] }]
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao sugerir texto:", error);
    return "";
  }
};

export const suggestSlideDescription = async (title: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `Crie uma frase curta e impactante de marketing para um slide de destaque de um supermercado com o tema: "${title}".
      Máximo 15 palavras. Responda apenas o texto.` }] }]
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao sugerir descrição de slide:", error);
    return "";
  }
};

export const generateEventDescription = async (eventTitle: string): Promise<string> => {
  if (!eventTitle) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `Você é um redator de eventos para um supermercado premium. 
      Crie uma descrição curta, emocionante e convidativa para o evento "${eventTitle}". 
      Destaque a experiência memorável, ofertas especiais e o clima festivo na loja.
      Máximo de 40 palavras. Responda apenas com o texto da descrição.` }] }]
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao gerar descrição de evento com Gemini:", error);
    return "";
  }
};
