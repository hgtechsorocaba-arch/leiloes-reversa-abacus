export default function PoliticaCookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#2c5282] mb-6">Política de Cookies</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 13 de Fevereiro de 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. O que são Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, tablet, 
              smartphone) quando você visita nosso site. Eles permitem que o site reconheça seu dispositivo 
              e memorize informações sobre sua visita.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Tipos de Cookies Utilizados</h2>
            
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Cookies Essenciais</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Necessários para o funcionamento básico do site. Incluem cookies de sessão para manter 
                  você logado e cookies de segurança. Não podem ser desativados.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Cookies de Desempenho</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Coletam informações sobre como você usa o site, como páginas visitadas e erros encontrados. 
                  Ajudam a melhorar o funcionamento do site.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Cookies de Funcionalidade</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Permitem que o site lembre suas preferências, como idioma, região e configurações de exibição.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Cookies de Análise</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Utilizados para entender como os visitantes interagem com o site, através de ferramentas 
                  como Google Analytics. Coletam dados de forma anônima.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies que Utilizamos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 mt-2">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">Cookie</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">Finalidade</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b">Duração</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  <tr>
                    <td className="px-4 py-2 border-b">next-auth.session-token</td>
                    <td className="px-4 py-2 border-b">Autenticação do usuário</td>
                    <td className="px-4 py-2 border-b">Sessão</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">termos_aceitos</td>
                    <td className="px-4 py-2 border-b">Registro de aceite dos termos</td>
                    <td className="px-4 py-2 border-b">1 ano</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">cookies_consent</td>
                    <td className="px-4 py-2 border-b">Preferências de cookies</td>
                    <td className="px-4 py-2 border-b">1 ano</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Como Gerenciar Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Você pode gerenciar ou desativar cookies através das configurações do seu navegador. 
              No entanto, desativar cookies essenciais pode afetar o funcionamento do site e impedir 
              a participação em leilões.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Para mais informações sobre como gerenciar cookies em diferentes navegadores:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Chrome: Configurações → Privacidade e segurança → Cookies</li>
              <li>Firefox: Opções → Privacidade e Segurança</li>
              <li>Safari: Preferências → Privacidade</li>
              <li>Edge: Configurações → Cookies e permissões do site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies de Terceiros</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos utilizar serviços de terceiros que também utilizam cookies, como:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Google Analytics (análise de tráfego)</li>
              <li>Serviços de pagamento</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Estes terceiros têm suas próprias políticas de privacidade e cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Atualizações</h2>
            <p className="text-gray-700 leading-relaxed">
              Esta política de cookies pode ser atualizada periodicamente. Alterações significativas 
              serão comunicadas através do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contato</h2>
            <p className="text-gray-700 leading-relaxed">
              Para dúvidas sobre nossa política de cookies: contato@leiloesreversa.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
