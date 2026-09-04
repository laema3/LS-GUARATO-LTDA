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
