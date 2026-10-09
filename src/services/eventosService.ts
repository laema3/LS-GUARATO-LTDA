import { supabase } from "../lib/supabase";
import { EventoItem, GanhadorPremio } from "../types/evento";
import { getIdbItem, setIdbItem } from "../lib/idbStorage";

const STORAGE_KEY = "lsguarato_eventos_cache";
let inMemoryEventosCache: EventoItem[] | null = null;

// Verifica se uma string de imagem é uma URL ou dataURL válida e não um placeholder quebrado
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    trimmed === "" ||
    trimmed === "[BASE64]" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed === "[object Object]"
  ) {
    return false;
  }
  return (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

// Limpa qualquer cache corrompido do localStorage antigo que possa ter salvo a string literal "[BASE64]"
function cleanCorruptedLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && (raw.includes("[BASE64]") || raw.includes('"foto_ganhador":"[BASE64]"'))) {
      console.warn("Removendo cache legado corrompido com '[BASE64]'...");
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

cleanCorruptedLocalStorage();

// Função utilitária para ordenar ganhadores e fotos por data do sorteio
export function sortGanhadoresByDate(
  ganhadores: GanhadorPremio[], 
  order: "asc" | "desc" = "asc",
  renumber: boolean = false
): GanhadorPremio[] {
  const sorted = [...ganhadores].sort((a, b) => {
    const timeA = a.data_sorteio ? new Date(a.data_sorteio).getTime() : 0;
    const timeB = b.data_sorteio ? new Date(b.data_sorteio).getTime() : 0;
    
    if (timeA && timeB && timeA !== timeB) {
      return order === "asc" ? timeA - timeB : timeB - timeA;
    }
    if (timeA && !timeB) return -1;
    if (!timeA && timeB) return 1;
    return (a.numero || 0) - (b.numero || 0);
  });

  if (renumber) {
    sorted.forEach((g, idx) => {
      g.numero = idx + 1;
    });
  }

  return sorted;
}

// Exemplo inicial caso não haja nenhum evento cadastrado ainda
export const DEFAULT_EVENTO_42_ANOS: EventoItem = {
  id: "42-anos-confraternizacao",
  titulo: "Confraternização 42 Anos de Aniversário",
  descricao: "Estamos comemorando 42 anos de história e dedicação com você! Como forma de agradecimento, preparamos o sorteio especial de 42 super prêmios. Acompanhe a cada sorteio os ganhadores e suas fotos com os prêmios!",
  imagem_capa: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
  imagens: [],
  data_evento: new Date().toISOString().split("T")[0],
  total_premios: 42,
  ganhadores: [
    {
      id: "premio-1",
      numero: 1,
      nome_ganhador: "Maria de Lourdes Ferreira",
      nome_premio: "TV LG 50 polegadas",
      foto_ganhador: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
      data_sorteio: new Date().toISOString().split("T")[0],
      observacoes: "1º Prêmio sorteado"
    },
    {
      id: "premio-2",
      numero: 2,
      nome_ganhador: "Carlos Eduardo Santos",
      nome_premio: "Fritadeira a Ar MONDIAL",
      foto_ganhador: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
      data_sorteio: new Date().toISOString().split("T")[0],
      observacoes: "2º Prêmio sorteado"
    },
    {
      id: "premio-3",
      numero: 3,
      nome_ganhador: "Juliana Andrade Lima",
      nome_premio: "Smartphone Xiaomi Note 14",
      foto_ganhador: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      data_sorteio: new Date().toISOString().split("T")[0],
      observacoes: "3º Prêmio sorteado"
    },
    {
      id: "premio-4",
      numero: 4,
      nome_ganhador: "Roberto Silva Mendes",
      nome_premio: "Tablet Samsung",
      foto_ganhador: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
      data_sorteio: new Date().toISOString().split("T")[0],
      observacoes: "4º Prêmio sorteado"
    }
  ]
};

// Extrai metadados invisíveis codificados no campo descricao
export function parseEventoData(rawEvento: any): EventoItem {
  let descricao = rawEvento.descricao || "";
  let ganhadores: GanhadorPremio[] = [];
  let imagens: string[] = [];
  let total_premios = 42;

  // 1. Verifica se já veio como coluna json/array
  if (Array.isArray(rawEvento.ganhadores)) {
    ganhadores = rawEvento.ganhadores;
  } else if (typeof rawEvento.ganhadores === "string") {
    try {
      ganhadores = JSON.parse(rawEvento.ganhadores);
    } catch {
      // ignore
    }
  }

  // 2. Extrai de bloco serializado em <!--GANHADORES:...--> se existir
  const ganhadoresMatch = descricao.match(/<!--GANHADORES:([\s\S]*?)-->/);
  if (ganhadoresMatch && ganhadoresMatch[1]) {
    try {
      const parsed = JSON.parse(ganhadoresMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ganhadores = parsed;
      }
    } catch (e) {
      console.warn("Erro ao decodificar ganhadores da descrição:", e);
    }
    descricao = descricao.replace(/<!--GANHADORES:[\s\S]*?-->/g, "").trim();
  }

  // 3. Extrai galeria de imagens de <!--IMAGENS:...--> se existir
  const imagensMatch = descricao.match(/<!--IMAGENS:([\s\S]*?)-->/);
  if (imagensMatch && imagensMatch[1]) {
    try {
      const parsedImagens = JSON.parse(imagensMatch[1]);
      if (Array.isArray(parsedImagens)) {
        imagens = parsedImagens.filter(url => isValidImageUrl(url));
      }
    } catch {
      // ignore
    }
    descricao = descricao.replace(/<!--IMAGENS:[\s\S]*?-->/g, "").trim();
  } else if (Array.isArray(rawEvento.imagens)) {
    imagens = rawEvento.imagens.filter(url => isValidImageUrl(url));
  }

  // 4. Extrai total_premios de <!--TOTAL_PREMIOS:...-->
  const totalMatch = descricao.match(/<!--TOTAL_PREMIOS:(\d+)-->/);
  if (totalMatch && totalMatch[1]) {
    total_premios = parseInt(totalMatch[1], 10) || 42;
    descricao = descricao.replace(/<!--TOTAL_PREMIOS:\d+-->/g, "").trim();
  } else if (rawEvento.total_premios) {
    total_premios = Number(rawEvento.total_premios) || 42;
  }

  // Se o título indicar 42 anos e total_premios for indefinido, garante 42
  if ((rawEvento.titulo || "").includes("42")) {
    total_premios = 42;
  }

  // Sanitiza fotos dos ganhadores: remove strings corrompidas literais "[BASE64]"
  const sanitizedGanhadores = (Array.isArray(ganhadores) ? ganhadores : []).map(g => {
    let foto = g.foto_ganhador || "";
    if (foto === "[BASE64]" || !isValidImageUrl(foto)) {
      foto = "";
    }
    return {
      ...g,
      foto_ganhador: foto
    };
  });

  // Ordena os ganhadores e fotos por data do sorteio
  const sortedGanhadores = sortGanhadoresByDate(sanitizedGanhadores, "asc");

  return {
    id: String(rawEvento.id),
    titulo: rawEvento.titulo || "Evento",
    descricao,
    imagem_capa: isValidImageUrl(rawEvento.imagem_capa) ? rawEvento.imagem_capa : "",
    imagens,
    data_evento: rawEvento.data_evento || "",
    total_premios: total_premios || 42,
    ganhadores: sortedGanhadores,
    created_at: rawEvento.created_at
  };
}

// Codifica os metadados dentro da descricao para compatibilidade com o Supabase sem requerer migrations
export function serializeDescricao(
  descricao: string, 
  ganhadores: GanhadorPremio[], 
  totalPremios: number = 42,
  imagens: string[] = []
): string {
  let cleanDesc = (descricao || "")
    .replace(/<!--GANHADORES:[\s\S]*?-->/g, "")
    .replace(/<!--TOTAL_PREMIOS:\d+-->/g, "")
    .replace(/<!--IMAGENS:[\s\S]*?-->/g, "")
    .trim();

  // Limpa qualquer string corrompida antes de serializar
  const cleanGanhadores = (ganhadores || []).map(g => ({
    ...g,
    foto_ganhador: isValidImageUrl(g.foto_ganhador) ? g.foto_ganhador : ""
  }));

  const cleanImagens = (imagens || []).filter(img => isValidImageUrl(img));

  const totalTag = `<!--TOTAL_PREMIOS:${totalPremios || 42}-->`;
  const ganhadoresTag = `<!--GANHADORES:${JSON.stringify(cleanGanhadores)}-->`;
  const imagensTag = cleanImagens.length > 0 ? `\n<!--IMAGENS:${JSON.stringify(cleanImagens)}-->` : "";

  return `${cleanDesc}\n\n${totalTag}\n${ganhadoresTag}${imagensTag}`.trim();
}

export async function getEventos(): Promise<EventoItem[]> {
  // 1. Se já carregamos em memória nesta sessão, retorna para velocidade instantânea
  if (inMemoryEventosCache && inMemoryEventosCache.length > 0) {
    // Continua para sincronizar em segundo plano se necessário
  }

  // 2. Carrega do IndexedDB (suporta gigabytes, sem limite de 5MB)
  let cachedList: EventoItem[] = [];
  try {
    const idbData = await getIdbItem<EventoItem[]>(STORAGE_KEY);
    if (Array.isArray(idbData) && idbData.length > 0) {
      cachedList = idbData.map(ev => ({
        ...ev,
        ganhadores: sortGanhadoresByDate(ev.ganhadores || [], "asc")
      }));
      inMemoryEventosCache = cachedList;
    }
  } catch (err) {
    console.warn("Aviso ao ler cache IndexedDB:", err);
  }

  // Se não encontrou no IndexedDB, tenta localStorage mas sem placeholders
  if (cachedList.length === 0) {
    try {
      const cachedRaw = localStorage.getItem(STORAGE_KEY);
      if (cachedRaw && !cachedRaw.includes("[BASE64]")) {
        const parsed = JSON.parse(cachedRaw);
        cachedList = (Array.isArray(parsed) ? parsed : [parsed]).map((item: any) => ({
          ...item,
          ganhadores: Array.isArray(item.ganhadores) ? sortGanhadoresByDate(item.ganhadores, "asc") : []
        }));
      }
    } catch {
      // ignore
    }
  }

  // 3. Sincroniza com o Supabase (fonte definitiva)
  try {
    const { data, error } = await supabase.from("eventos").select("*").order("created_at", { ascending: false });
    
    if (!error && data && data.length > 0) {
      const parsedList = data.map(item => {
        const parsed = parseEventoData(item);
        
        // Se o cache local possuir slots extras criados localmente ainda não salvos, mescla apenas os excedentes
        const localCached = cachedList.find(c => String(c.id) === String(parsed.id));
        if (localCached && localCached.ganhadores && localCached.ganhadores.length > parsed.ganhadores.length) {
          const extraSlots = localCached.ganhadores.slice(parsed.ganhadores.length);
          parsed.ganhadores = sortGanhadoresByDate([...parsed.ganhadores, ...extraSlots], "asc");
        }

        return parsed;
      });

      inMemoryEventosCache = parsedList;

      // Salva no IndexedDB de forma assíncrona e segura
      setIdbItem(STORAGE_KEY, parsedList).catch(() => {});

      // Salva versão leve no localStorage apenas se couber sem estourar cota
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedList));
      } catch {
        // Se estourar a cota de 5MB do localStorage, remove do localStorage para não corromper
        // e deixa o IndexedDB como cache principal
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
      }

      return parsedList;
    }
  } catch (err) {
    console.warn("Aviso ao buscar eventos do Supabase, usando cache persistente:", err);
  }

  // 4. Se o Supabase falhou (ou offline), usa o cache existente
  if (cachedList.length > 0) {
    inMemoryEventosCache = cachedList;
    return cachedList;
  }

  // 5. Se não houver nada no banco nem no cache, inicializa com o evento de 42 Anos
  inMemoryEventosCache = [DEFAULT_EVENTO_42_ANOS];
  setIdbItem(STORAGE_KEY, inMemoryEventosCache).catch(() => {});
  return inMemoryEventosCache;
}

export async function getEventoById(id: string): Promise<EventoItem | null> {
  const all = await getEventos();
  
  // 1. Busca exata por ID
  let found = all.find(e => String(e.id) === String(id));
  if (found) return found;

  // 2. Se o ID for o alias padrão de 42 anos, mapeia para o evento oficial de 42 Anos
  if (id === "42-anos-confraternizacao") {
    found = all.find(e => e.titulo.toLowerCase().includes("42"));
    if (found) return found;
  }

  // 3. Busca específica no Supabase caso não esteja na listagem
  try {
    const { data, error } = await supabase.from("eventos").select("*").eq("id", id).maybeSingle();
    if (!error && data) {
      return parseEventoData(data);
    }
  } catch {
    // ignore
  }

  return all[0] || null;
}

export async function saveEvento(evento: EventoItem): Promise<EventoItem> {
  const serializedDescricao = serializeDescricao(
    evento.descricao, 
    evento.ganhadores, 
    evento.total_premios || 42,
    evento.imagens || []
  );

  const payload: any = {
    titulo: evento.titulo,
    descricao: serializedDescricao,
    imagem_capa: isValidImageUrl(evento.imagem_capa) ? evento.imagem_capa : "",
    imagens: (evento.imagens || []).filter(img => isValidImageUrl(img)),
    data_evento: evento.data_evento || null
  };

  let savedId = evento.id;

  try {
    if (typeof evento.id === "string" && !evento.id.startsWith("temp-") && evento.id !== "42-anos-confraternizacao") {
      const { data, error } = await supabase.from("eventos").update(payload).eq("id", evento.id).select().maybeSingle();
      if (!error && data) {
        savedId = String(data.id);
      } else if (error) {
        console.warn("Aviso ao atualizar evento no Supabase:", error.message);
      }
    } else {
      // Inserção de novo evento
      const { data, error } = await supabase.from("eventos").insert([payload]).select().maybeSingle();
      if (!error && data) {
        savedId = String(data.id);
      } else if (error) {
        console.warn("Aviso ao inserir evento no Supabase:", error.message);
      }
    }
  } catch (err) {
    console.warn("Supabase save warning (salvo localmente):", err);
  }

  const updatedEvento: EventoItem = {
    ...evento,
    id: savedId,
    ganhadores: sortGanhadoresByDate(evento.ganhadores || [], "asc")
  };

  // Atualiza cache em memória
  const all = inMemoryEventosCache || (await getEventos());
  const index = all.findIndex(e => String(e.id) === String(evento.id) || String(e.id) === String(savedId));
  let updatedList: EventoItem[];
  if (index >= 0) {
    updatedList = [...all];
    updatedList[index] = updatedEvento;
  } else {
    updatedList = [updatedEvento, ...all];
  }

  inMemoryEventosCache = updatedList;

  // Atualiza IndexedDB (sem limite de 5MB)
  await setIdbItem(STORAGE_KEY, updatedList);

  // Tenta salvar no localStorage de forma segura
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  // Notifica componentes em tempo real (como o Menu/Header)
  window.dispatchEvent(new Event("eventos_updated"));

  return updatedEvento;
}

export async function deleteEvento(id: string): Promise<void> {
  try {
    if (!id.startsWith("temp-") && id !== "42-anos-confraternizacao") {
      await supabase.from("eventos").delete().eq("id", id);
    }
  } catch (err) {
    console.warn("Erro ao deletar do Supabase:", err);
  }

  const all = inMemoryEventosCache || (await getEventos());
  const filtered = all.filter(e => String(e.id) !== String(id));
  inMemoryEventosCache = filtered;

  await setIdbItem(STORAGE_KEY, filtered);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  window.dispatchEvent(new Event("eventos_updated"));
}
