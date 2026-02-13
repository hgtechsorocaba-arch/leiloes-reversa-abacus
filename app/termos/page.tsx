export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#2c5282] mb-6">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 13 de Fevereiro de 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 leading-relaxed">
              Ao acessar e utilizar a plataforma Leilões Reversa, você declara ter lido, compreendido e aceito 
              integralmente estes Termos de Uso. Caso não concorde com qualquer disposição aqui estabelecida, 
              você não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Cadastro e Responsabilidades</h2>
            <p className="text-gray-700 leading-relaxed">
              Para participar dos leilões, é obrigatório o cadastro completo com documentos válidos (CPF/RG e selfie). 
              O usuário é integralmente responsável pela veracidade das informações fornecidas, respondendo civil e 
              criminalmente por qualquer falsidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Regras dos Leilões</h2>
            <p className="text-gray-700 leading-relaxed">
              Os lances são irrevogáveis e irretratáveis após confirmação. O participante que ofertar o maior lance 
              válido será declarado vencedor. Todos os lances registrados no sistema são considerados propostas 
              firmes de compra.
            </p>
          </section>

          <section className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h2 className="text-xl font-semibold text-red-800 mb-3">4. PENALIDADES POR DESISTÊNCIA OU INADIMPLÊNCIA</h2>
            <p className="text-red-700 leading-relaxed font-medium">
              <strong>ATENÇÃO:</strong> O arrematante que desistir do lance vencedor ou não efetuar o pagamento no 
              prazo estabelecido estará sujeito às seguintes penalidades, conforme previsto no Art. 903 do Código 
              Civil Brasileiro e legislação aplicável:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-red-700">
              <li><strong>Multa de 20% (vinte por cento)</strong> sobre o valor total do lance vencedor;</li>
              <li><strong>Pagamento integral das taxas</strong> (5% de comissão do leiloeiro + 2% de taxa administrativa);</li>
              <li><strong>Inclusão em cadastro de inadimplentes</strong> da plataforma, ficando impedido de participar de futuros leilões;</li>
              <li><strong>Responsabilização por perdas e danos</strong> causados ao vendedor e à plataforma;</li>
              <li><strong>Cobrança judicial</strong> dos valores devidos, acrescidos de juros, correção monetária e honorários advocatícios;</li>
              <li><strong>Possibilidade de processo criminal</strong> por estelionato ou fraude, conforme Art. 171 do Código Penal.</li>
            </ul>
            <p className="text-red-700 mt-4">
              Ao dar um lance, você declara estar ciente e de acordo com todas as penalidades acima descritas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Taxas e Comissões</h2>
            <p className="text-gray-700 leading-relaxed">
              O arrematante deverá pagar, além do valor do lance vencedor:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li><strong>5% (cinco por cento)</strong> de comissão do leiloeiro oficial;</li>
              <li><strong>2% (dois por cento)</strong> de taxa administrativa da plataforma.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Estas taxas são calculadas sobre o valor do lance vencedor e são de responsabilidade exclusiva do arrematante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Pagamento</h2>
            <p className="text-gray-700 leading-relaxed">
              O pagamento deverá ser efetuado em até 48 (quarenta e oito) horas após o encerramento do leilão, 
              sob pena de aplicação das penalidades previstas no item 4. A forma de pagamento será informada 
              após a arrematação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retirada dos Produtos</h2>
            <p className="text-gray-700 leading-relaxed">
              A retirada dos lotes arrematados deverá ser realizada em até 5 (cinco) dias úteis após a confirmação 
              do pagamento, no local indicado pela plataforma. Após este prazo, poderão ser cobradas taxas de 
              armazenagem.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disposições Gerais</h2>
            <p className="text-gray-700 leading-relaxed">
              A Leilões Reversa reserva-se o direito de suspender ou cancelar leilões, bem como recusar cadastros 
              ou lances, a seu exclusivo critério. Os casos omissos serão resolvidos pela administração da plataforma. 
              Fica eleito o Foro da Comarca de Sorocaba/SP para dirimir quaisquer questões oriundas destes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contato</h2>
            <p className="text-gray-700 leading-relaxed">
              Para dúvidas ou esclarecimentos, entre em contato através do email: contato@leiloesreversa.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
