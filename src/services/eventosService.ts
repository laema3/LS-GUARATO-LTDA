import { supabase } from "../lib/supabase";
import { EventoItem, GanhadorPremio } from "../types/evento";

const STORAGE_KEY = "lsguarato_eventos_cache";

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

  // 3. Extrai total_premios de <!--TOTAL_PREMIOS:...-->
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

  return {
    id: String(rawEvento.id),
    titulo: rawEvento.titulo || "Evento",
    descricao,
    imagem_capa: rawEvento.imagem_capa || "",
    imagens: Array.isArray(rawEvento.imagens) ? rawEvento.imagens : [],
    data_evento: rawEvento.data_evento || "",
    total_premios: total_premios || 42,
    ganhadores: Array.isArray(ganhadores) ? ganhadores : [],
    created_at: rawEvento.created_at
  };
}

// Codifica os metadados dentro da descricao para compatibilidade com o Supabase sem requerer migrations
export function serializeDescricao(descricao: string, ganhadores: GanhadorPremio[], totalPremios: number = 42): string {
  let cleanDesc = (descricao || "")
    .replace(/<!--GANHADORES:[\s\S]*?-->/g, "")
    .replace(/<!--TOTAL_PREMIOS:\d+-->/g, "")
    .trim();

  const totalTag = `<!--TOTAL_PREMIOS:${totalPremios || 42}-->`;
  const ganhadoresTag = `<!--GANHADORES:${JSON.stringify(ganhadores || [])}-->`;

  return `${cleanDesc}\n\n${totalTag}\n${ganhadoresTag}`.trim();
}

export async function getEventos(): Promise<EventoItem[]> {
  // 1. Carrega do localStorage primeiro (cache offline/rápido)
  let cachedList: EventoItem[] = [];
  const cachedRaw = localStorage.getItem(STORAGE_KEY);
  if (cachedRaw) {
    try {
      cachedList = JSON.parse(cachedRaw);
    } catch {
      // ignore
    }
  }

  // 2. Tenta sincronizar com o Supabase
  try {
    const { data, error } = await supabase.from("eventos").select("*").order("created_at", { ascending: false });
    
    if (!error && data && data.length > 0) {
      const parsedList = data.map(item => {
        const parsed = parseEventoData(item);
        // Se no Supabase não tiver ganhadores mas tiver no cache local com o mesmo ID, mescla
        const localCached = cachedList.find(c => String(c.id) === String(parsed.id));
        if (localCached && localCached.ganhadores && localCached.ganhadores.length > parsed.ganhadores.length) {
          parsed.ganhadores = localCached.ganhadores;
          if (localCached.total_premios) parsed.total_premios = localCached.total_premios;
        }
        return parsed;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedList));
      return parsedList;
    }
  } catch (err) {
    console.warn("Aviso ao buscar eventos do Supabase, usando cache local:", err);
  }

  // 3. Se não houver nada no banco nem no cache, inicializa com o evento de 42 Anos
  if (cachedList.length === 0) {
    cachedList = [DEFAULT_EVENTO_42_ANOS];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedList));
  }

  return cachedList;
}

export async function getEventoById(id: string): Promise<EventoItem | null> {
  const all = await getEventos();
  const found = all.find(e => String(e.id) === String(id));
  if (found) return found;

  // Busca específica no Supabase
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
  const all = await getEventos();
  const serializedDescricao = serializeDescricao(evento.descricao, evento.ganhadores, evento.total_premios || 42);

  const payload: any = {
    titulo: evento.titulo,
    descricao: serializedDescricao,
    imagem_capa: evento.imagem_capa || "",
    imagens: evento.imagens || [],
    data_evento: evento.data_evento || null
  };

  let savedId = evento.id;

  try {
    if (typeof evento.id === "string" && !evento.id.startsWith("temp-") && evento.id !== "42-anos-confraternizacao") {
      const { data, error } = await supabase.from("eventos").update(payload).eq("id", evento.id).select().maybeSingle();
      if (!error && data) {
        savedId = String(data.id);
      }
    } else {
      // Inserção de novo evento
      const { data, error } = await supabase.from("eventos").insert([payload]).select().maybeSingle();
      if (!error && data) {
        savedId = String(data.id);
      }
    }
  } catch (err) {
    console.warn("Supabase save warning (salvo localmente):", err);
  }

  const updatedEvento: EventoItem = {
    ...evento,
    id: savedId
  };

  // Atualiza cache local
  const index = all.findIndex(e => String(e.id) === String(evento.id));
  let updatedList: EventoItem[];
  if (index >= 0) {
    updatedList = [...all];
    updatedList[index] = updatedEvento;
  } else {
    updatedList = [updatedEvento, ...all];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

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

  const all = await getEventos();
  const filtered = all.filter(e => String(e.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  window.dispatchEvent(new Event("eventos_updated"));
}
