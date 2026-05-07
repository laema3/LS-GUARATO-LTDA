import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag, Truck, CreditCard, Clock, Apple, Play } from "lucide-react";
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner / Slider Section */}
      <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-blue-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
              <div className="max-w-3xl">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-sans font-bold text-white mb-4 shadow-sm"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-md bg-transparent"
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {slides[currentSlide].cta ? (
                    <Link 
                      to={slides[currentSlide].link || "/"}
                      className="inline-block bg-[#0B3C8C] hover:bg-[#082a63] text-white font-bold py-4 px-8 rounded-full text-lg transition-transform hover:scale-105 shadow-lg"
                    >
                      {slides[currentSlide].cta}
                    </Link>
                  ) : null}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </section>

      {/* Features bar */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-3">
                <div className="bg-[#0B3C8C]/10 p-4 rounded-full text-[#0B3C8C]">
                  <feat.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-sans">{feat.title}</h3>
                  <p className="text-sm text-gray-500">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nós Section (Re-usable Layout Pattern) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-block px-3 py-1 bg-[#0B3C8C]/10 text-[#0B3C8C] font-bold text-sm rounded-full mb-2 border border-[#0B3C8C]/20">
                Tradição e Qualidade
              </div>
              <h2 className="text-4xl font-bold font-sans text-gray-900 leading-tight">
                {sobreTitle} <span className="text-[#0B3C8C]">{sobreHighlight}</span>
              </h2>
              {sobreDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="pt-4">
                <Link to="/sobre" className="inline-flex items-center gap-2 text-[#0B3C8C] font-bold hover:text-[#082a63] transition-colors border-b-2 border-transparent hover:border-[#0B3C8C] pb-1">
                  Conheça mais da nossa história <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={sobreImage} 
                  alt="Fachada Supermercado" 
                  className="rounded-2xl shadow-xl relative z-10 w-full object-cover h-[400px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 mb-4">
              TIRE SUAS DÚVIDAS
            </h2>
            <div className="w-24 h-1 bg-[#0B3C8C] mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Separamos as perguntas mais frequentes dos nossos clientes para facilitar o seu dia a dia.
            </p>
          </div>
          
          <Accordion items={mockFAQs} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0B3C8C] py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-sans mb-6">Ainda não tem o nosso aplicativo?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">Baixe agora e tenha acesso a ofertas exclusivas, clube de benefícios e faça suas compras sem sair de casa.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-[#0B3C8C] hover:bg-[#082a63] text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
              <Apple className="h-5 w-5 text-[#D62828]" />
              Baixar na App Store
            </button>
            <button className="bg-[#0B3C8C] hover:bg-[#082a63] text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
              <Play className="h-5 w-5 text-[#D62828]" />
              Baixar no Google Play
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
