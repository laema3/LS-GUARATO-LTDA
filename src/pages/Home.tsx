import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag, Truck, CreditCard, Clock, Apple, Play, MessageCircle, ArrowRight } from "lucide-react";
import { mockFAQs, mockSlides } from "../data/mockData";
import { Accordion } from "../components/ui/Accordion";
import { supabase } from "../lib/supabase";

export const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>(mockSlides);
  const [sobreTitle, setSobreTitle] = useState("A sua família merece o padrão");
  const [sobreHighlight, setSobreHighlight] = useState(" LS Guarato");
  const [sobreDescription, setSobreDescription] = useState("Há muitos anos fazendo parte do dia a dia da família uberabense, o LS Guarato se destaca pelo atendimento humanizado, produtos sempre frescos e preços que cabem no seu bolso.\nNosso compromisso é entregar a melhor experiência de compra, seja nas nossas lojas físicas amplas e confortáveis ou através do nosso aplicativo de delivery.");
  const [sobreImage, setSobreImage] = useState("https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800");

  const sobreRef = useRef(null);
  const { scrollYProgress: sobreScrollY } = useScroll({ target: sobreRef, offset: ["start end", "end start"] });
  const ySobre = useTransform(sobreScrollY, [0, 1], ["0%", "20%"]);

  const bannerRef = useRef(null);
  const { scrollYProgress: bannerScrollY } = useScroll({ target: bannerRef });
  const yBanner = useTransform(bannerScrollY, [0, 1], ["0%", "10%"]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase.from('home_settings').select('*').eq('id', 1).single();
      
      if (data) {
        if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          const validSlides = data.slides.filter((s:any) => s && s.image && s.title);
          if (validSlides.length > 0) setSlides(validSlides);
        }
        if (data.sobre_title && typeof data.sobre_title === 'string') {
          const words = data.sobre_title.split(' ');
          if (words.length > 1) {
            const lastTwo = words.splice(-2).join(' ');
            setSobreTitle(words.join(' '));
            setSobreHighlight(' ' + lastTwo);
          } else {
            setSobreTitle(data.sobre_title);
            setSobreHighlight('');
          }
        }
        if (data.sobre_description) setSobreDescription(data.sobre_description);
        if (data.sobre_image) setSobreImage(data.sobre_image);
      }
    } catch (err) {
      // Silently fail to fallback to mocks
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const features = [
    { icon: ShoppingBag, title: "Variedade", desc: "Mix completo de produtos" },
    { icon: CreditCard, title: "Facilidade", desc: "Diversas formas de pagamento" },
    { icon: Truck, title: "Delivery", desc: "Entrega rápida e segura" },
    { icon: Clock, title: "Comodidade", desc: "Aberto todos os dias" },
  ];

  // Helper to split title for coloring
  const renderTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length <= 1) return <span className="text-white">{title}</span>;
    
    // For titles like "Festival de Carnes", "Hortifruti Fresquinho", etc.
    // Try to highlight the last word/part
    const lastWord = words.pop();
    const firstPart = words.join(' ');
    
    return (
      <>
        <span className="text-white">{firstPart} </span>
        <span className="text-[#D62828]">{lastWord}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner / Slider Section */}
      <section ref={bannerRef} className="relative h-[550px] md:h-[700px] w-full overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <motion.img 
              style={{ y: yBanner, scale: 1.4 }}
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center px-4 md:px-0">
              <div className="container mx-auto">
                <div className="max-w-4xl text-left">
                  {/* Badge */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm mb-8"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#D62828] animate-pulse" />
                    <span className="text-white text-[10px] md:text-xs font-bold tracking-widest uppercase">
                      LÍDER EM QUALIDADE E TRADIÇÃO
                    </span>
                  </motion.div>

                  {/* Heading */}
                  <motion.h1 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    className="text-5xl md:text-8xl font-sans font-bold leading-[1.1] mb-6 tracking-tight"
                  >
                    {renderTitle(slides[currentSlide].title)}
                  </motion.h1>

                  {/* Description */}
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed font-light"
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  {/* Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {slides[currentSlide].cta && (
                      <Link 
                        to={slides[currentSlide].link || "/"}
                        className="flex items-center justify-center gap-3 bg-[#D62828] hover:bg-[#b02222] text-white font-bold py-4 px-8 rounded-lg text-lg transition-all hover:scale-105 shadow-xl group"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {slides[currentSlide].cta}
                      </Link>
                    )}
                    <Link 
                      to="/servicos/jornal-de-ofertas"
                      className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg border border-white/30 backdrop-blur-md text-lg transition-all group"
                    >
                      Ver Ofertas
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        <div className="absolute bottom-10 right-10 z-30 flex gap-4">
          <button 
            onClick={prevSlide}
            className="bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-white border-b border-gray-100 py-10 relative z-20 -mt-8 md:-mt-12 container mx-auto px-4 rounded-xl shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-default">
              <div className="bg-[#0B3C8C] text-white p-3 rounded-xl transition-transform group-hover:scale-110">
                <feat.icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 font-sans group-hover:text-[#0B3C8C] transition-colors">{feat.title}</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre Nós Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0B3C8C]/5 text-[#0B3C8C] font-black text-[10px] tracking-[0.2em] rounded-md uppercase border border-[#0B3C8C]/10">
                <div className="w-4 h-[1px] bg-[#0B3C8C]" />
                Tradição e Qualidade
              </div>
              <h2 className="text-5xl font-bold font-sans text-gray-900 leading-tight tracking-tight">
                {sobreTitle} <span className="text-[#0B3C8C]">{sobreHighlight}</span>
              </h2>
              <div className="space-y-4">
                {sobreDescription.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-500 text-lg leading-[1.8] font-light">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="pt-6">
                <Link to="/sobre" className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-lg font-bold hover:bg-[#0B3C8C] transition-all hover:translate-x-2">
                  Nossa História <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div ref={sobreRef} className="lg:w-1/2 relative overflow-hidden rounded-3xl">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#0B3C8C]/5 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -z-10" />
              <motion.img 
                style={{ y: ySobre, scale: 1.2 }}
                src={sobreImage} 
                alt="Fachada Supermercado" 
                className="relative z-10 w-full object-cover h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-left">
              <span className="text-[#0B3C8C] font-bold text-sm tracking-widest uppercase mb-4 block">Central de Ajuda</span>
              <h2 className="text-4xl md:text-5xl font-bold font-sans text-gray-900 leading-tight">
                TIRE SUAS <br /> <span className="text-gray-400">DÚVIDAS</span>
              </h2>
            </div>
            <p className="text-gray-500 max-w-md text-lg font-light leading-relaxed">
              Separamos as perguntas mais frequentes dos nossos clientes para facilitar o seu dia a dia.
            </p>
          </div>
          
          <div className="max-w-4xl">
            <Accordion items={mockFAQs} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0B3C8C] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-sans text-white leading-tight">Ainda não tem o nosso <br /> <span className="text-red-400">aplicativo?</span></h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">Baixe agora e tenha acesso a ofertas exclusivas, clube de benefícios e faça suas compras sem sair de casa.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
              <button className="bg-white text-black px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-2xl shadow-blue-900/40">
                <Apple className="h-6 w-6" />
                Download App Store
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/20">
                <Play className="h-6 w-6" />
                Download Google Play
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
