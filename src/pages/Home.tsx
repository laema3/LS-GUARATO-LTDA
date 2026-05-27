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
    if (words.length <= 1) return <span className="text-[#D62828]">{title}</span>;
    
    // For titles like "Festival de Carnes", "Hortifruti Fresquinho", etc.
    const lastWord = words.pop();
    const firstPart = words.join(' ');
    
    return (
      <>
        <span className="text-[#D62828]">{firstPart} </span>
        <span className="text-white">{lastWord}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner / Slider Section */}
      <section ref={bannerRef} className="relative h-[245px] sm:h-[315px] md:h-[420px] lg:h-[490px] w-full container mx-auto md:rounded-3xl overflow-hidden bg-gray-900 md:mt-8">
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
                <div className="max-w-4xl text-left pl-8 md:pl-16">
                  {/* Badge */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm mb-6"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#D62828] animate-pulse" />
                    <span className="text-white text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                      LÍDER EM QUALIDADE E TRADIÇÃO
                    </span>
                  </motion.div>

                  {/* Heading */}
                  <motion.h1 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    className="text-4xl md:text-6xl font-sans font-bold leading-[1.1] mb-4 tracking-tight"
                  >
                    {renderTitle(slides[currentSlide].title)}
                  </motion.h1>

                  {/* Description */}
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-base md:text-lg text-white/90 mb-6 max-w-xl leading-relaxed font-light"
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
                        className="flex items-center justify-center gap-3 bg-[#0B3C8C] hover:bg-[#082a63] text-white font-bold py-3 px-6 rounded-lg text-base transition-all hover:scale-105 shadow-xl group"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {slides[currentSlide].cta}
                      </Link>
                    )}
                    <Link 
                      to="/servicos/jornal-de-ofertas"
                      className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg border border-white/30 backdrop-blur-md text-base transition-all group"
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

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center mb-16 gap-4">
            <div>
              <span className="text-[#D62828] font-bold text-sm tracking-widest uppercase mb-4 block">Central de Ajuda</span>
              <h2 className="text-4xl md:text-5xl font-bold font-sans text-[#D62828] leading-tight">
                TIRE SUAS <span className="text-gray-400">DÚVIDAS</span>
              </h2>
            </div>
            <p className="text-gray-500 max-w-2xl text-lg font-light leading-relaxed">
              Separamos as perguntas mais frequentes dos nossos clientes para facilitar o seu dia a dia.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Accordion items={mockFAQs} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0B3C8C] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-sans text-[#D62828] leading-tight">Ainda não tem o nosso <br /> <span className="text-white">aplicativo?</span></h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">Baixe agora e tenha acesso a ofertas exclusivas, clube de benefícios e faça suas compras sem sair de casa.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
              <button className="bg-[#0B3C8C] text-white px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-2xl shadow-blue-900/40">
                <Apple className="h-6 w-6" />
                Download App Store
              </button>
              <button className="bg-[#0B3C8C]/80 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-[#0B3C8C]">
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
