'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContatoPage() {
  const whatsappNumber = '5515996480072';
  const message = encodeURIComponent('Olá! Gostaria de mais informações sobre os leilões.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-[#2c5282] mb-2 text-center">Entre em Contato</h1>
          <p className="text-gray-600 text-center mb-8">
            Estamos aqui para ajudar! Entre em contato conosco por qualquer um dos canais abaixo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#25D366]">
                  <div className="p-2 bg-[#25D366]/10 rounded-full">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Atendimento rápido pelo WhatsApp
                </p>
                <p className="text-lg font-semibold mb-4">(15) 99648-0072</p>
                <Button
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Iniciar Conversa
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Telefone */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#2c5282]">
                  <div className="p-2 bg-[#2c5282]/10 rounded-full">
                    <Phone className="w-6 h-6" />
                  </div>
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Ligue para nós
                </p>
                <p className="text-lg font-semibold mb-4">(15) 99648-0072</p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#2c5282] text-[#2c5282] hover:bg-[#2c5282] hover:text-white"
                >
                  <a href="tel:+5515996480072">
                    Ligar Agora
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#E4405F]">
                  <div className="p-2 bg-[#E4405F]/10 rounded-full">
                    <Instagram className="w-6 h-6" />
                  </div>
                  Instagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Siga-nos no Instagram
                </p>
                <p className="text-lg font-semibold mb-4">@reversaleiloes</p>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#FCAF45] hover:opacity-90 text-white"
                >
                  <a href="https://www.instagram.com/reversaleiloes/" target="_blank" rel="noopener noreferrer">
                    Seguir no Instagram
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Facebook */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#1877F2]">
                  <div className="p-2 bg-[#1877F2]/10 rounded-full">
                    <Facebook className="w-6 h-6" />
                  </div>
                  Facebook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Curta nossa página no Facebook
                </p>
                <p className="text-lg font-semibold mb-4">Reversa Leilões</p>
                <Button
                  asChild
                  className="w-full bg-[#1877F2] hover:bg-[#0d5fc4] text-white"
                >
                  <a href="https://www.facebook.com/profile.php?id=61587626248910" target="_blank" rel="noopener noreferrer">
                    Curtir no Facebook
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Localização */}
          <Card className="mt-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#2c5282]">
                <div className="p-2 bg-[#2c5282]/10 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">
                Sorocaba - SP e Região
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Atendimento: Segunda a Sexta, 9h às 18h</span>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais Footer */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Siga-nos nas Redes Sociais</h3>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.instagram.com/reversaleiloes/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#FCAF45] rounded-full text-white hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61587626248910"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#1877F2] rounded-full text-white hover:bg-[#0d5fc4] transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#25D366] rounded-full text-white hover:bg-[#128C7E] transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}