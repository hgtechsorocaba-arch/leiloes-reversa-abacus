export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#2c5282] mb-6">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 13 de Fevereiro de 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introdução</h2>
            <p className="text-gray-700 leading-relaxed">
              A Leilões Reversa está comprometida com a proteção da privacidade e dos dados pessoais de seus 
              usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e 
              demais legislações aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados Coletados</h2>
            <p className="text-gray-700 leading-relaxed">Coletamos os seguintes dados pessoais:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li><strong>Dados de identificação:</strong> Nome completo, CPF, RG;</li>
              <li><strong>Dados de contato:</strong> E-mail, telefone, endereço completo;</li>
              <li><strong>Documentos:</strong> Cópia do documento de identidade (frente e verso) e selfie com documento;</li>
              <li><strong>Dados de navegação:</strong> IP, cookies, histórico de lances;</li>
              <li><strong>Dados financeiros:</strong> Histórico de arrematações e pagamentos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento</h2>
            <p className="text-gray-700 leading-relaxed">Seus dados são utilizados para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Validar sua identidade e aprovar seu cadastro;</li>
              <li>Permitir a participação em leilões;</li>
              <li>Processar arrematações e pagamentos;</li>
              <li>Cumprir obrigações legais e regulatórias;</li>
              <li>Prevenir fraudes e atividades ilícitas;</li>
              <li>Enviar comunicações sobre leilões e sua conta;</li>
              <li>Melhorar nossos serviços e experiência do usuário.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal</h2>
            <p className="text-gray-700 leading-relaxed">
              O tratamento dos dados pessoais é realizado com base nas seguintes hipóteses legais previstas 
              na LGPD:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li><strong>Consentimento:</strong> Para envio de comunicações de marketing;</li>
              <li><strong>Execução de contrato:</strong> Para prestação dos serviços de leilão;</li>
              <li><strong>Cumprimento de obrigação legal:</strong> Para fins fiscais e regulatórios;</li>
              <li><strong>Exercício regular de direitos:</strong> Em processos judiciais ou administrativos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h2>
            <p className="text-gray-700 leading-relaxed">
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Leiloeiros oficiais parceiros;</li>
              <li>Órgãos governamentais, quando exigido por lei;</li>
              <li>Prestadores de serviços (hospedagem, pagamentos);</li>
              <li>Autoridades judiciais, mediante ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Armazenamento e Segurança</h2>
            <p className="text-gray-700 leading-relaxed">
              Os dados são armazenados em servidores seguros com criptografia e controles de acesso. 
              Mantemos os dados pelo período necessário ao cumprimento das finalidades e obrigações legais, 
              podendo ser de até 10 anos para fins fiscais e legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Seus Direitos (LGPD)</h2>
            <p className="text-gray-700 leading-relaxed">
              Você tem direito a:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Confirmar a existência de tratamento;</li>
              <li>Acessar seus dados;</li>
              <li>Corrigir dados incompletos ou desatualizados;</li>
              <li>Solicitar anonimização, bloqueio ou eliminação;</li>
              <li>Portabilidade dos dados;</li>
              <li>Revogar consentimento;</li>
              <li>Informação sobre compartilhamento.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Para exercer seus direitos, entre em contato: privacidade@leiloesreversa.com.br
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Encarregado de Dados (DPO)</h2>
            <p className="text-gray-700 leading-relaxed">
              Para questões relacionadas à proteção de dados, entre em contato com nosso Encarregado 
              através do e-mail: dpo@leiloesreversa.com.br
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Alterações na Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Esta política pode ser atualizada periodicamente. Recomendamos verificar regularmente 
              para estar ciente de quaisquer alterações. A continuidade no uso dos serviços após 
              alterações implica aceitação da nova política.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
