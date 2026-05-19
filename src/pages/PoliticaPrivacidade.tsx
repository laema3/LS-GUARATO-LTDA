import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Lock, FileText, Share2, Info } from "lucide-react";

export const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-0 max-w-4xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0B3C8C] text-white p-8 md:p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D62828]/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
             
             <Shield className="w-16 h-16 mx-auto mb-6 text-white/90" />
             <h1 className="text-3xl md:text-5xl font-bold font-sans mb-4 tracking-tight">Política de Privacidade</h1>
             <p className="text-blue-100 max-w-2xl mx-auto text-lg">
               Entenda como o Supermercados Guarato coleta, usa, protege e compartilha suas informações pessoais.
             </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 prose prose-lg max-w-none text-gray-700">
            <section className="mb-10 block">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                <Info className="w-6 h-6 text-[#D62828]" />
                1. Introdução
              </h2>
              <p>
                O <strong>Supermercados Guarato</strong> está comprometido em proteger a sua privacidade. Esta Política de Privacidade explica nossas práticas em relação à coleta, uso, divulgação e proteção dos seus dados pessoais quando você acessa nosso site, usa nossos serviços, ou interage conosco de qualquer forma.
              </p>
              <p>
                 Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política, que foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong> e outras regulamentações aplicáveis.
              </p>
            </section>

            <section className="mb-10 block">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                <FileText className="w-6 h-6 text-[#D62828]" />
                2. Informações que Coletamos
              </h2>
              <p>Podemos coletar as seguintes categorias de informações sobre você:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#0B3C8C]">
                <li>
                  <strong className="text-gray-900">Informações de Contato e Cadastro:</strong> Nome completo, e-mail, número de telefone e endereço, coletados quando você preenche formulários em nosso site (como páginas de contato, Sac ou candidaturas).
                </li>
                <li>
                  <strong className="text-gray-900">Informações Profissionais:</strong> Dados contidos no seu currículo, histórico escolar, experiências profissionais e outras informações relevantes quando você se candidata a uma vaga de emprego conosco.
                </li>
                <li>
                  <strong className="text-gray-900">Informações de Navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas, tempo gasto em nosso site e outras estatísticas coletadas automaticamente, frequentemente utilizando cookies ou tecnologias semelhantes.
                </li>
              </ul>
            </section>

            <section className="mb-10 block">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                <Share2 className="w-6 h-6 text-[#D62828]" />
                3. Como Usamos Suas Informações
              </h2>
              <p>As informações coletadas são utilizadas para as seguintes finalidades:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#0B3C8C]">
                 <li>Processar suas candidaturas a vagas de emprego e contatá-lo para oportunidades de carreira.</li>
                 <li>Responder às suas dúvidas, comentários, ou solicitações enviadas através dos nossos canans de atendimento.</li>
                 <li>Melhorar nosso site, personalizando o conteúdo e analisar o tráfego para melhorar a experiência do usuário.</li>
                 <li>Comunicar novidades, ofertas (quando houver consentimento explícito) e informações importantes sobre nossos serviços.</li>
                 <li>Cumprir obrigações legais e regulatórias.</li>
              </ul>
            </section>

            <section className="mb-10 block">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                <Lock className="w-6 h-6 text-[#D62828]" />
                4. Proteção e Segurança de Dados
              </h2>
              <p>
                Adotamos medidas de segurança técnicas e administrativas adequadas para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição acidental ou ilícita. Embora nos esforcemos para proteger suas informações pessoais, a transmissão de dados pela internet não é 100% segura; portanto, não podemos garantir a segurança absoluta das informações transmitidas ao nosso site.
              </p>
            </section>

            <section className="mb-10 block">
              <h2 className="text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                5. Compartilhamento de Informações
              </h2>
              <p>
                Não vendemos ou alugamos suas informações pessoais a terceiros. Podemos compartilhar suas informações em situações restritas, como:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#0B3C8C]">
                <li>Com prestadores de serviços e parceiros de negócios que auxiliam em nossas operações (ex: provedores de hospedagem), sempre sob estritos contratos de confidencialidade.</li>
                <li>Quando exigido por lei, como resposta a ordens judiciais ou para cumprir procedimentos legais.</li>
              </ul>
            </section>
            
             <section className="mb-10 block">
              <h2 className="text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                6. Uso de Cookies
              </h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar a sua experiência no nosso site. Cookies são pequenos arquivos de texto armazenados no seu dispositivo. Eles nos ajudam a entender como você usa nosso site. Você pode controlar ou excluir os cookies nas configurações do seu navegador a qualquer momento.
              </p>
            </section>

            <section className="mb-10 block">
              <h2 className="text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                7. Seus Direitos (LGPD)
              </h2>
              <p>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direitos sobre seus dados pessoais, incluindo:
              </p>
               <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#0B3C8C]">
                <li>Confirmação da existência de tratamento.</li>
                <li>Acesso aos dados.</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.</li>
                <li>Revogação do consentimento, a qualquer momento.</li>
              </ul>
              <p className="mt-4">
                 Para exercer esses direitos, entre em contato conosco através dos nossos canais de atendimento oficiais.
              </p>
            </section>

            <section className="block">
              <h2 className="text-2xl font-bold text-[#0B3C8C] mb-4 border-b pb-2">
                8. Contato e Alterações na Política
              </h2>
              <p>
                Esta política pode ser atualizada periodicamente. Recomendamos que você a revise com frequência. As alterações entrarão em vigor assim que publicadas neste site.
              </p>
              <p className="mt-4 bg-gray-100 p-6 rounded-lg text-gray-800 border border-gray-200">
                Se você tiver dúvidas, comentários ou solicitações sobre esta Política de Privacidade, entre em contato com nosso Encarregado pelo Tratamento de Dados Pessoais (DPO) pelo formulário de <Link to="/contato" className="text-[#0B3C8C] font-bold hover:underline">Contato</Link> ou diretamente em nossa loja.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
