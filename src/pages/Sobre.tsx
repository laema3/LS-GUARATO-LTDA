import { Store, Heart, Users, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { supabase } from "../lib/supabase";

export const Sobre = () => {
  const [historiaTitle, setHistoriaTitle] = useState("Histórico de Confiança");
  const [historiaDescription, setHistoriaDescription] = useState("O LS Guarato nasceu com uma missão simples:\nofererecer produtos de qualidade com preços justos para todas as famílias da nossa região.\nO que começou como uma pequena mercearia, fruto do trabalho árduo e da dedicação inabalável, transformou-se ao longo dos anos em uma rede consolidada, sendo hoje uma referência no setor supermercadista de Uberaba.\nNosso foco sempre foi o cliente. Entendemos que ir ao supermercado não é apenas fazer compras, é abastecer o seu lar, é preparar a festa de aniversário, é garantir a saúde da sua família através de alimentos frescos. Por isso, exigimos rigor no controle de qualidade dos nossos hortifrutis, carnes e padaria.");
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200");
  const [historiaImage, setHistoriaImage] = useState("");
  const [missao, setMissao] = useState("Oferecer produtos de alta qualidade, com variedade e preço justo, garantindo um atendimento de excelência e comodidade aos nossos clientes em um ambiente acolhedor.");
  const [visao, setVisao] = useState("Ser reconhecido como o supermercado referência em qualidade e relacionamento na região de Uberaba, inovando sempre e crescendo junto com a nossa comunidade.");
  const [valores, setValores] = useState("Respeito e Ética\nFoco no Cliente\nValorização das Pessoas\nQualidade Garantida\nResponsabilidade Social");

  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollY } = useScroll({ target: heroRef });
  const yHero = useTransform(heroScrollY, [0, 1], ["0%", "30%"]);
  
  const historiaRef = useRef(null);
  const { scrollYProgress: historiaScrollY } = useScroll({ target: historiaRef });
  const yHistoria = useTransform(historiaScrollY, [0, 1], ["0%", "15%"]);

  useEffect(() => {
    const loadSobre = async () => {
      const { data } = await supabase.from('sobre_settings').select('*').eq('id', 1).single();
      if (data) {
        if (data.banner_image) setBannerImage(data.banner_image);
        if (data.historia_title) setHistoriaTitle(data.historia_title);
        if (data.historia_description) setHistoriaDescription(data.historia_description);
        if (data.historia_image) setHistoriaImage(data.historia_image);
        if (data.missao) setMissao(data.missao);
        if (data.visao) setVisao(data.visao);
        if (data.valores) setValores(data.valores);
      }
    };
    loadSobre();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[400px] w-full bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <motion.img 
          style={{ y: yHero, scale: 1.2 }}
          src={bannerImage} 
          alt="Interior do supermercado"
          className="w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-sans text-white mb-4">Nossa História</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Tradição, qualidade e compromisso com a família de Uberaba.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        
        {/* História */}
        <div ref={historiaRef} className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 mb-6 relative">
              <span className="relative z-10">{historiaTitle}</span>
              <div className="absolute -bottom-2 left-0 w-20 h-1 bg-[#0B3C8C] z-0"></div>
            </h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              {historiaDescription.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4 relative">
             <div className="bg-[#0B3C8C] absolute -inset-4 rounded-3xl opacity-10 blur-xl"></div>
             {historiaImage ? (
               <motion.img style={{ y: yHistoria, scale: 1.1 }} src={historiaImage} alt="Nossa história" className="rounded-xl shadow-md w-full h-64 object-cover col-span-2" />
             ) : (
               <>
                 <motion.img style={{ y: yHistoria, scale: 1.1 }} src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=600" alt="Hortifruti" className="rounded-xl shadow-md w-full h-64 object-cover" />
                 <motion.img style={{ y: yHistoria, scale: 1.1 }} src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=600" alt="Padaria" className="rounded-xl shadow-md w-full h-64 object-cover" />
               </>
             )}
          </div>
        </div>

        {/* Missão Visão Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-[#0B3C8C]" />
            </div>
            <h3 className="text-2xl font-bold font-sans text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              {missao}
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
              <Store className="h-8 w-8 text-[#0B3C8C]" />
            </div>
            <h3 className="text-2xl font-bold font-sans text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              {visao}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
             <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-[#0B3C8C]" />
            </div>
            <h3 className="text-2xl font-bold font-sans text-gray-900 mb-4">Valores</h3>
            <ul className="text-gray-600 space-y-2">
              {valores.split('\n').filter(v => v.trim()).map((valor, index) => (
                <li key={index}>{valor}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0B3C8C] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Users className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-sans mb-6">Venha construir essa história com a gente</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              O LS Guarato valoriza os seus colaboradores. Conheça nossas vagas e faça parte deste grande time!
            </p>
            <Link to="/servicos/vagas" className="inline-block bg-[#0B3C8C] hover:bg-[#082a63] text-white font-bold py-4 px-10 rounded-full text-lg transition-transform hover:scale-105 shadow-lg">
              Trabalhe Conosco
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
