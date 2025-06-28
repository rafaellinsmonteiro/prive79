
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Diamond, Globe, Target, Flame, Eye, Check } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/a935e9c2-2b1f-481f-a98d-a750da629b13.png" 
                alt="Prive Logo" 
                className="h-10 w-auto"
              />
            </div>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-zinc-700 text-zinc-100 hover:bg-zinc-800">
                  Acessar minha conta
                </Button>
              </Link>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90">
                  <Eye className="h-4 w-4 mr-2" />
                  Espiar como Convidado
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Bem-vindo à <span className="text-primary">Prive City</span>
          </h1>
          <p className="text-2xl text-zinc-400 mb-12">
            A cidade secreta dos encontros inesquecíveis
          </p>
          <p className="text-xl text-zinc-300 max-w-4xl mx-auto leading-relaxed">
            Em um mundo onde o luxo encontra o desejo, PriveCity conecta clientes selecionados 
            a modelos de alto padrão. Uma comunidade exclusiva para quem valoriza experiências 
            autênticas, seguras e com total privacidade.
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto">
          <Tabs defaultValue="clientes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto mb-12 bg-zinc-800 p-1">
              <TabsTrigger 
                value="clientes" 
                className="text-zinc-300 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Para Clientes Exigentes
              </TabsTrigger>
              <TabsTrigger 
                value="modelos" 
                className="text-zinc-300 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Para Modelos de Alto Padrão
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clientes">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Conecte-se com perfis verificados e exclusivos
                          </h3>
                          <p className="text-zinc-400">
                            Modelos, acompanhantes e sugar babies selecionadas com alto critério — beleza, presença e discrição acima de tudo.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Explore sem compromissos
                          </h3>
                          <p className="text-zinc-400">
                            Você visualiza, escolhe, conversa e agenda com liberdade. Sem mensalidades obrigatórias e com pagamento direto à profissional.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Privacidade como prioridade
                          </h3>
                          <p className="text-zinc-400">
                            Ambiente seguro e encriptado. Seu nome, imagem e preferências jamais serão expostos.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Ferramentas avançadas de busca
                          </h3>
                          <p className="text-zinc-400">
                            Filtros inteligentes por localização, tipo de experiência, disponibilidade e preferências pessoais.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modelos">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Visibilidade sob seu controle total
                          </h3>
                          <p className="text-zinc-400">
                            Você escolhe quem pode ver seu perfil. Esconda-se de certas cidades, estados, países ou perfis indesejados. Na Privê79, você aparece apenas para quem realmente interessa.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Sem censura. Sem limitações.
                          </h3>
                          <p className="text-zinc-400">
                            Aqui, seu conteúdo pode ser sensual, provocante ou discreto — você define os limites.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Ganhos diretos, sem intermediários
                          </h3>
                          <p className="text-zinc-400">
                            Receba diretamente pelos serviços prestados. Sem porcentagens abusivas, sem exploração.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Perfil premium, mesmo sendo iniciante
                          </h3>
                          <p className="text-zinc-400">
                            Você não precisa já ser famosa para ter destaque. Se tiver qualidade e postura, seu lugar é aqui.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            Proteção e suporte humanizado
                          </h3>
                          <p className="text-zinc-400">
                            Equipe dedicada à sua segurança e bem-estar, com suporte 24h e políticas reais de proteção.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* CTA for Models */}
          <div className="text-center mt-12">
            <Link to="/onboarding-modelo">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                🌟 Quero fazer parte como Modelo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Feature 1 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">🔒 Discrição é nossa essência</h3>
                <p className="text-zinc-400 text-lg">
                  Ambiente blindado e 100% privado. Aqui, sua identidade e seus desejos são tratados 
                  com respeito e sigilo absoluto.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Diamond className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">💎 Modelos verificados e selecionados</h3>
                <p className="text-zinc-400 text-lg">
                  Apenas perfis verificados e cuidadosamente escolhidos para oferecer a você o melhor 
                  da beleza, elegância e presença.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">🌐 Conexões reais. Experiências únicas.</h3>
                <p className="text-zinc-400 text-lg">
                  Agende encontros, negocie experiências exclusivas ou viva fantasias com total 
                  liberdade — sem intermediários, sem burocracia.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">🎯 Você no controle</h3>
                <p className="text-zinc-400 text-lg">
                  Filtros inteligentes, chats seguros e recursos personalizados para você encontrar 
                  a companhia perfeita, de acordo com seu estilo de vida.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Flame className="h-12 w-12 text-primary mr-4" />
              <h2 className="text-4xl font-bold">🔥 Entre. Explore. Viva.</h2>
            </div>
            
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
              Prive City não é para todos — é para quem sabe o que quer.<br />
              Seu acesso à elite do entretenimento adulto começa agora.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                  👉 Acessar minha conta
                </Button>
              </Link>
              
              <Link to="/">
                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-100 hover:bg-zinc-800 text-lg px-8 py-4">
                  <Eye className="h-5 w-5 mr-2" />
                  Espiar como Convidado
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500">
            © 2024 Prive City. Experiências exclusivas para maiores de 18 anos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
