import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, DollarSign, CheckCircle2, AlertCircle, UploadCloud, Send } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const DetalhesVaga = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const { data, error } = await supabase.from('vagas').select('*').eq('id', id).single();
      if (data) {
        // Se a vaga cadastrada existe mas não está ativa, marcamos como não encontrada para o público
        if (data.ativa === false) {
          setJob(null);
        } else {
          setJob(data);
        }
      } else if (error) {
        setJob(null);
      }
    } catch (err) {
      console.error(err);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4 font-sans text-gray-900">Carregando detalhes...</h2>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 font-sans text-gray-900 text-center">Vaga não encontrada ou processo encerrado</h2>
        <Link to="/servicos/vagas" className="bg-[#0B3C8C] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#082a63] transition-colors flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para vagas
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      let fileUrl = "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const uploadName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('curriculos').upload(uploadName, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('curriculos').getPublicUrl(uploadName);
          fileUrl = data.publicUrl;
        }
      }

      await supabase.from('candidatos').insert([{
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        mensagem: formData.mensagem,
        curriculo_url: fileUrl,
        vaga_nome: job.cargo
      }]);

      setEnviadoComSucesso(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar candidatura. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/servicos/vagas" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0B3C8C] transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" /> Voltar para listagem
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-[#D62828] rounded-full uppercase tracking-wide">
                    LS Guarato
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#D62828] font-sans tracking-tight">
                  {job.cargo}
                </h1>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Esquerda: Formulário */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                <h3 className="text-2xl font-bold font-sans text-gray-900 mb-6 border-b border-gray-100 pb-4">
                  Candidate-se agora
                </h3>
                
                {enviadoComSucesso ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Currículo Enviado!</h4>
                    <p className="text-gray-500">Agradecemos seu interesse. Fique de olho no seu e-mail e telefone para os próximos passos da seleção.</p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleApply}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                      <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" placeholder="Digite seu nome completo" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" placeholder="exemplo@email.com" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
                      <input type="tel" required value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" placeholder="(00) 00000-0000" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (Opcional)</label>
                      <textarea rows={3} value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})} className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3C8C] focus:border-transparent transition-all" placeholder="Fale um pouco sobre você e sua experiência..."></textarea>
                    </div>
                    
                    {/* File Upload */}
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Currículo (PDF, DOC) *</label>
                       <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-[#0B3C8C] hover:bg-blue-50 transition-colors cursor-pointer">
                          <input 
                            type="file" 
                            required 
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          <div className="pointer-events-none flex flex-col items-center gap-2">
                            <UploadCloud className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">{fileName ? fileName : "Clique ou arraste seu arquivo aqui"}</span>
                            {!fileName && <span className="text-xs text-gray-400">Tamanho máximo: 5MB</span>}
                          </div>
                       </div>
                    </div>

                    {/* LGPD */}
                    <div className="flex items-start gap-3 pt-4 border-t border-gray-100 mt-6">
                      <input type="checkbox" id="lgpd" required className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B3C8C] focus:ring-[#0B3C8C] shrink-0 cursor-pointer" />
                      <label htmlFor="lgpd" className="text-[11px] leading-relaxed text-gray-600 cursor-pointer select-none">
                        O LS GUARATO, compromete-se com a proteção de dados e informações pessoais compartilhadas pelos usuários. Esta política determina como os dados serão protegidos, os processos de coleta, registro, armazenamento, uso, compartilhamento e eliminação, nos termos da Lei Geral de Proteção de Dados (Lei n. 13.709/ 2018).
                        <br /><br />
                        Ao declarar que concorda com o presente termo, o Titular consente que LS GUARATO, doravante denominada Controladora, tome decisões referentes ao tratamento de seus dados pessoais, bem como realize o tratamento de seus dados pessoais, envolvendo operações como as que se referem a coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.
                      </label>
                    </div>
                    
                    <button type="submit" disabled={enviando} className="w-full bg-[#0B3C8C] hover:bg-[#082a63] disabled:bg-gray-400 text-white font-bold py-4 rounded-md transition-colors flex items-center justify-center gap-2 text-lg shadow-md mt-6">
                      <Send className="h-5 w-5" /> {enviando ? "Enviando..." : "Enviar Currículo"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Direita: Detalhes da Vaga */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
              
              {/* Resumo */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-4 w-4 text-[#D62828]" /> Localização</span>
                  <span className="font-semibold text-gray-900">{job.empresa || "Matriz"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="h-4 w-4 text-[#D62828]" /> Horário</span>
                  <span className="font-semibold text-gray-900">{job.carga_horaria || "Não especificado"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 flex items-center gap-1"><DollarSign className="h-4 w-4 text-[#D62828]" /> Remuneração</span>
                  <span className="font-semibold text-gray-900">{job.remuneracao || "Salário da Categoria"}</span>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-xl font-bold font-sans text-gray-900 mb-4 border-l-4 border-[#0B3C8C] pl-3">
                  Sobre a Vaga ({job.cargo})
                </h3>
                <p className="text-gray-700 leading-relaxed bg-white p-6 rounded-xl border border-gray-100 shadow-sm whitespace-pre-line">
                  {job.observacoes || "Nenhuma descrição detalhada disponível para esta vaga."}
                </p>
              </div>

              {/* Critérios/Requisitos */}
              {job.criterios && job.criterios.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold font-sans text-gray-900 mb-4 border-l-4 border-[#0B3C8C] pl-3">
                    Critérios / Requisitos
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    {job.criterios.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefícios */}
              {job.beneficios && job.beneficios.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold font-sans text-gray-900 mb-4 border-l-4 border-[#D62828] pl-3">
                    Benefícios oferecidos
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    {job.beneficios.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <div className="shrink-0 h-5 w-5 rounded-full bg-[#D62828]/10 text-[#D62828] flex items-center justify-center mt-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Observações */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">Nota Importante</h4>
                  <p className="text-yellow-700 text-sm">O LS Guarato promove a diversidade e incentiva todas as pessoas a se candidatarem às nossas vagas, independentemente de gênero, orientação sexual, raça, etnia ou deficiência.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
