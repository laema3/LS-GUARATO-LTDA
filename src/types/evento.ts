export const PREMIOS_FIXOS = [
  "Tablet Samsung",
  "TV LG 50 polegadas",
  "Smartphone Xiaomi Note 14",
  "Fritadeira a Ar MONDIAL"
] as const;

export type PremioFixo = typeof PREMIOS_FIXOS[number];

export interface GanhadorPremio {
  id: string;
  numero: number;
  nome_ganhador: string;
  nome_premio: string;
  foto_ganhador: string;
  data_sorteio?: string;
  observacoes?: string;
}

export interface EventoItem {
  id: string;
  titulo: string;
  descricao: string;
  imagem_capa?: string;
  imagens?: string[];
  data_evento?: string;
  total_premios?: number;
  ganhadores: GanhadorPremio[];
  created_at?: string;
}
