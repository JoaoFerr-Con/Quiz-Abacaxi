// ============================================================================
// questions.js — banco de perguntas do quiz
// ============================================================================
// Texto de exemplo/placeholder inspirado no Festival do Abacaxi de Barcarena
// (festivaldoabacaxi.com/home). Este arquivo é o FALLBACK: se o Supabase
// estiver configurado (ver js/supabase-config.js), o quiz usa as perguntas
// de lá via `loadQuestionPool()`. Sem Supabase, ou se ele falhar, cai aqui.
//
// `answer: -1` marca uma pergunta "de opinião": não existe certo/errado,
// todo mundo pontua ao responder. É assim que a última rodada funciona.

import { fetchQuestions } from "./supabase.js";
import { RULES } from "./config.js";

export const ROUNDS = [
  {
    id: "historia",
    title: "Raízes do Festival",
    subtitle: "A história por trás da festa",
    icon: "🏛️",
    accent: "leaf",
  },
  {
    id: "cidade",
    title: "Conhece Barcarena?",
    subtitle: "Geografia e curiosidades locais",
    icon: "🗺️",
    accent: "coral",
  },
  {
    id: "festa",
    title: "Dia de Festival",
    subtitle: "Tradições, comidas e cultura",
    icon: "🍍",
    accent: "gold",
  },
  {
    id: "futuro",
    title: "O Futuro do Abacaxi",
    subtitle: "Rodada de opinião — sem errar!",
    icon: "✨",
    accent: "sky",
    freeform: true,
  },
];

export const QUESTIONS = [

  // ── Rodada 1 — Raízes do Festival ──
  { round: "historia", text: "O Festival do Abacaxi nasceu para celebrar principalmente qual atividade de Barcarena?", options: ["A pesca artesanal", "A produção agrícola local", "O comércio portuário", "O turismo de praia"], answer: 1, fact: "O festival surgiu para dar visibilidade ao trabalho de quem planta e colhe — o abacaxi virou símbolo dessa força produtiva." },
  { round: "historia", text: "Qual título é disputado todos os anos como um dos símbolos da festa?", options: ["Rainha do Abacaxi", "Prefeito Mirim", "Capitão do Festival", "Embaixador Cultural"], answer: 0, fact: "A eleição da Rainha do Abacaxi é uma das tradições mais esperadas da programação." },
  { round: "historia", text: "Além da homenagem ao fruto, o festival também é uma vitrine para qual área?", options: ["Tecnologia industrial", "Cultura e economia locais", "Esportes olímpicos", "Moda internacional"], answer: 1, fact: "Música, dança, gastronomia e empreendedorismo local dividem o palco com o abacaxi." },
  { round: "historia", text: "Como começou a ocupação do território que hoje é Barcarena?", options: ["Com pequenos povoados às margens dos rios e igarapés", "Com a construção de rodovias federais", "Com a chegada de colonos europeus por via aérea", "Com a instalação de fábricas no século XIX"], answer: 0, fact: "A ocupação começou com pequenos povoados às margens dos rios e igarapés, que eram as principais \"estradas\" da região amazônica." },
  { round: "historia", text: "A história de Barcarena está ligada a qual tipo de instituição, que ajudou a organizar os primeiros núcleos de povoamento?", options: ["Missões religiosas", "Bases militares", "Companhias de mineração", "Universidades"], answer: 0, fact: "A presença de religiosos ajudou a organizar núcleos de povoamento, consolidando comunidades e estruturas básicas de sociabilidade e comércio." },
  { round: "historia", text: "Quando Barcarena se consolidou como município com estrutura administrativa própria?", options: ["No século XX", "No século XVI, com a chegada dos portugueses", "No século XVIII, durante o período colonial", "Apenas no século XXI"], answer: 0, fact: "Embora a área seja habitada há muito tempo, o reconhecimento de Barcarena como município com estrutura própria se consolidou apenas no século XX." },
  { round: "historia", text: "Antes das rodovias, qual era o principal meio de transporte de pessoas e mercadorias em Barcarena?", options: ["Os rios", "As ferrovias", "As trilhas terrestres a cavalo", "O transporte aéreo"], answer: 0, fact: "Os rios eram o principal meio de transporte de pessoas, mercadorias, alimentos e notícias, conectando Barcarena a Belém e a outros municípios." },
  { round: "historia", text: "O que colocou Barcarena no mapa econômico nacional a partir da segunda metade do século XX?", options: ["A instalação de grandes projetos industriais ligados à mineração e metalurgia", "A descoberta de petróleo na região", "A criação de um polo de turismo internacional", "A construção de um aeroporto internacional"], answer: 0, fact: "A partir da segunda metade do século XX, grandes empreendimentos ligados à mineração e metalurgia colocaram Barcarena no mapa econômico do Brasil." },
  { round: "historia", text: "O que a chegada da indústria provocou na dinâmica demográfica de Barcarena?", options: ["Atraiu migrantes e aumentou a população", "Reduziu a população local", "Não teve nenhum efeito populacional", "Fez a população se mudar para outros municípios"], answer: 0, fact: "O surgimento de postos de trabalho atraiu migrantes, aumentando a população e mudando o perfil urbano e social de Barcarena." },
  { round: "historia", text: "O que caracteriza a história de Barcarena em termos de convivência de diferentes realidades?", options: ["A convivência entre a Amazônia tradicional e a Amazônia industrializada", "A ausência total de indústrias no município", "O isolamento completo das comunidades ribeirinhas", "A predominância exclusiva da vida urbana"], answer: 0, fact: "No mesmo território, convivem comunidades tradicionais, modos de vida ribeirinhos e grandes plantas industriais de alta tecnologia." },
  { round: "historia", text: "O que ainda preserva traços da história cotidiana de Barcarena, especialmente nas comunidades mais afastadas?", options: ["A navegação fluvial", "O transporte rodoviário", "O uso exclusivo de aplicativos de transporte", "O transporte ferroviário"], answer: 0, fact: "Muitos trajetos, costumes e rotinas atuais guardam semelhanças com práticas que existem há décadas, especialmente nas comunidades mais afastadas da área urbana." },

  // ── Rodada 2 — Conhece Barcarena? ──
  { round: "cidade", text: "Barcarena fica em qual estado brasileiro?", options: ["Pará", "Amazonas", "Maranhão", "Amapá"], answer: 0, fact: "Barcarena está na região metropolitana de Belém, no estado do Pará." },
  { round: "cidade", text: "Barcarena é conhecida por abrigar um importante complexo econômico ligado a qual atividade?", options: ["Mineração e portos", "Vinícolas", "Estaleiros navais de luxo", "Estações de esqui"], answer: 0, fact: "O município reúne um dos maiores complexos portuários e industriais do Norte do país." },
  { round: "cidade", text: "Qual desses elementos faz parte da identidade visual amazônica de Barcarena?", options: ["Os rios e igarapés", "Os vulcões ativos", "As dunas de areia", "As geleiras"], answer: 0, fact: "A relação da cidade com os rios molda o transporte, a economia e a cultura local." },
  { round: "cidade", text: "De qual região metropolitana Barcarena faz parte?", options: ["Região metropolitana de Belém", "Região metropolitana de Manaus", "Região metropolitana de São Luís", "Região metropolitana de Macapá"], answer: 0, fact: "Sua proximidade com a capital paraense e sua posição estratégica reforçam seu papel na logística regional." },
  { round: "cidade", text: "O que Barcarena abriga que é um dos principais do estado do Pará?", options: ["Um dos principais complexos portuários do Pará", "O maior aeroporto do estado", "A maior universidade do estado", "O maior hospital do estado"], answer: 0, fact: "A infraestrutura portuária permite o embarque e desembarque de cargas diversas, com alcance nacional e internacional." },
  { round: "cidade", text: "O que o crescimento industrial provocou na área urbana de Barcarena?", options: ["Acelerou a urbanização, com novos bairros e mais demanda por serviços", "Reduziu a área urbana do município", "Não teve nenhum impacto na cidade", "Fez a cidade se tornar exclusivamente rural"], answer: 0, fact: "Novos bairros surgiram, a área urbana se expandiu e aumentou a demanda por habitação, transporte, educação, saúde e saneamento." },
  { round: "cidade", text: "Mesmo com estradas, o que ainda é essencial para muitas comunidades de Barcarena?", options: ["O transporte fluvial (barcos)", "O transporte de trem", "O transporte aéreo particular", "As bicicletas elétricas"], answer: 0, fact: "Muitas comunidades ainda dependem de barcos para acessar serviços, trabalhar, estudar e realizar atividades cotidianas." },
  { round: "cidade", text: "O que o porto de Barcarena influencia diretamente no município?", options: ["A infraestrutura viária, pela circulação de caminhões e cargas", "Apenas o calendário de festas locais", "Somente a rede escolar", "O clima da região"], answer: 0, fact: "A circulação de caminhões e cargas exige vias de acesso, manutenção de estradas e organização logística." },
  { round: "cidade", text: "O acesso à infraestrutura em Barcarena é igual em todas as áreas do município?", options: ["Não — varia entre a área urbana e as comunidades mais afastadas", "Sim, é idêntico em todo o município", "Só existe infraestrutura na área rural", "A infraestrutura é decidida por sorteio anual"], answer: 0, fact: "Áreas centrais tendem a ter mais serviços; comunidades ribeirinhas e rurais ainda enfrentam desafios de acesso a energia, internet e saneamento." },
  { round: "cidade", text: "Que tipo de desafio Barcarena enfrenta por ser uma cidade em crescimento acelerado?", options: ["Ocupações irregulares, pressão por moradia e mobilidade urbana", "Excesso de espaço e nenhuma demanda por moradia", "Falta total de crescimento populacional", "Ausência de qualquer planejamento necessário"], answer: 0, fact: "Ocupações irregulares, pressão por moradia, mobilidade urbana e ampliação de equipamentos públicos estão no cotidiano do município." },
  { round: "cidade", text: "O que a proximidade entre zona industrial e zona residencial exige em Barcarena?", options: ["Planejamento urbano cuidadoso, com regras e fiscalização", "Nenhum tipo de cuidado especial", "A remoção total da população residencial", "O fechamento das indústrias"], answer: 0, fact: "A proximidade entre áreas de moradia e operações industriais demanda regras, fiscalização e monitoramento." },
  { round: "cidade", text: "Barcarena é um polo de que tipo no estado do Pará?", options: ["Um polo industrial de grande relevância", "Um polo exclusivamente turístico", "Um polo financeiro internacional", "Um polo apenas agrícola de pequena escala"], answer: 0, fact: "A presença de grandes empresas, ligadas à mineração e metalurgia, faz do município um importante centro de produção e exportação." },
  { round: "cidade", text: "O que impulsiona fortemente o PIB de Barcarena?", options: ["O setor industrial", "O turismo internacional", "A produção de petróleo", "O setor financeiro"], answer: 0, fact: "A arrecadação de impostos, o comércio e a geração de empregos são fortemente influenciados pelas atividades industriais e portuárias." },
  { round: "cidade", text: "A economia de Barcarena gira apenas em torno da indústria?", options: ["Não — agricultura familiar, pesca, comércio e serviços também são importantes", "Sim, é 100% dependente da indústria", "Não existe nenhuma outra atividade econômica", "A economia depende só do turismo"], answer: 0, fact: "Agricultura familiar, pesca, comércio local, serviços e pequenas empresas também têm papel fundamental na renda de muitas famílias." },
  { round: "cidade", text: "Como a pesca contribui para a economia de comunidades de Barcarena?", options: ["Complementa a alimentação e gera renda pela venda em feiras e mercados", "É proibida no município", "Só é praticada por empresas estrangeiras", "Não tem nenhuma relevância econômica"], answer: 0, fact: "A captura de peixes e outros recursos aquáticos complementa a alimentação e gera renda por meio da venda em feiras e mercados." },
  { round: "cidade", text: "O que a agricultura familiar contribui para Barcarena?", options: ["Para a segurança alimentar, produzindo mandioca, frutas e hortaliças", "Apenas para a exportação internacional de grãos", "Não tem relevância para o consumo local", "É voltada só para pecuária de larga escala"], answer: 0, fact: "Pequenos agricultores produzem mandioca, frutas, hortaliças e outros alimentos que abastecem o consumo local." },
  { round: "cidade", text: "Como o comércio local de Barcarena se desenvolveu?", options: ["Cresceu acompanhando a expansão urbana e o aumento da população", "Diminuiu com o passar dos anos", "Sempre foi do mesmo tamanho, sem mudanças", "Foi substituído inteiramente pelo comércio online"], answer: 0, fact: "Lojas, feiras, mercados e serviços foram se multiplicando conforme aumentava a população e a circulação de renda." },
  { round: "cidade", text: "Por que o porto de Barcarena é estratégico para o Pará?", options: ["Porque parte significativa da produção mineral da região passa por ele, rumo à exportação", "Porque é o único porto de pesca esportiva do estado", "Porque só recebe cargas de alimentos", "Porque é usado exclusivamente para turismo de cruzeiros"], answer: 0, fact: "Parte significativa da produção de minérios da região Norte passa por Barcarena, conectando o município a rotas de exportação." },
  { round: "cidade", text: "O desenvolvimento econômico de Barcarena traz junto que tipo de desafio?", options: ["Desafios sociais, como desigualdade e necessidade de políticas públicas", "Nenhum desafio, apenas benefícios", "Apenas desafios ambientais, sem relação social", "A eliminação completa da pobreza"], answer: 0, fact: "A geração de riqueza convive com desigualdade, vulnerabilidade de parte da população e debates sobre distribuição de benefícios." },
  { round: "cidade", text: "A qual bioma Barcarena pertence?", options: ["Bioma amazônico", "Bioma da caatinga", "Bioma do cerrado", "Bioma da mata atlântica"], answer: 0, fact: "O município está inserido em uma região de grande importância ecológica, com florestas, rios, igarapés e rica biodiversidade." },
  { round: "cidade", text: "Além do transporte e da pesca, que outro papel os rios têm para as comunidades de Barcarena?", options: ["Um papel simbólico e espiritual, além de espaço de lazer", "Nenhum outro papel além do transporte", "Apenas função industrial", "Servem só para fins comerciais"], answer: 0, fact: "Os rios são espaços de lazer, de espiritualidade e de identidade para muitas comunidades." },
  { round: "cidade", text: "O que o avanço da atividade industrial em Barcarena exige em termos ambientais?", options: ["Forte atenção ambiental — monitoramento, legislação e participação social", "Nenhuma atenção especial", "Apenas fiscalização internacional", "Somente ações voluntárias das empresas, sem legislação"], answer: 0, fact: "O uso de recursos naturais, o descarte de resíduos e possíveis acidentes ambientais demandam monitoramento e legislação." },
  { round: "cidade", text: "Sobre o que comunidades e organizações locais debatem constantemente em Barcarena?", options: ["Impactos ambientais, como qualidade da água e uso do solo", "Apenas sobre o calendário esportivo", "Sobre moda e tendências", "Sobre culinária internacional"], answer: 0, fact: "Há debates sobre qualidade da água, contaminação, uso do solo, reparações e medidas de prevenção." },
  { round: "cidade", text: "Que tipo de turismo Barcarena tem potencial para desenvolver?", options: ["Turismo de natureza e de base comunitária", "Turismo de neve", "Turismo espacial", "Turismo de grandes parques temáticos"], answer: 0, fact: "Rios, praias de água doce, paisagens amazônicas e modos de vida tradicionais podem ser base para um turismo que valoriza cultura e ambiente." },
  { round: "cidade", text: "Por que a educação ambiental é considerada fundamental para o futuro de Barcarena?", options: ["Porque ajuda a formar cidadãos mais conscientes e engajados na defesa do território", "Porque é exigida apenas por lei internacional", "Porque não tem nenhum efeito prático", "Porque substitui a necessidade de fiscalização"], answer: 0, fact: "Escolas, associações e projetos sociais que tratam de meio ambiente contribuem para formar cidadãos mais conscientes." },

  // ── Rodada 3 — Dia de Festival ──
  { round: "festa", text: "Além do abacaxi in natura, o que costuma aparecer com destaque nas barracas do festival?", options: ["Doces e pratos com abacaxi", "Frutos do mar congelados", "Comida importada", "Apenas bebidas"], answer: 0, fact: "Doces, sucos e pratos criativos com abacaxi são parada obrigatória no festival." },
  { round: "festa", text: "O que normalmente NÃO costuma faltar na programação cultural do festival?", options: ["Apresentações musicais e de dança", "Corrida de Fórmula 1", "Desfile de moda em Paris", "Competição de surfe"], answer: 0, fact: "Shows, quadrilhas e apresentações regionais dão o tom da festa." },
  { round: "festa", text: "Qual é uma boa prática para curtir o festival com segurança e consciência?", options: ["Descartar o lixo corretamente e cuidar do espaço público", "Levar o próprio abacaxi de casa", "Evitar conversar com outros participantes", "Chegar sem consultar a programação"], answer: 0, fact: "Cuidar do espaço da festa é também cuidar de Barcarena." },
  { round: "festa", text: "Quais influências se misturam na cultura de Barcarena?", options: ["Influências indígenas, caboclas e religiosas", "Apenas influências europeias", "Apenas influências industriais modernas", "Influências exclusivamente urbanas"], answer: 0, fact: "Essa combinação aparece na fala, na culinária, nas festas, nas crenças e na organização comunitária." },
  { round: "festa", text: "O que mobiliza moradores de diferentes bairros e comunidades ribeirinhas em Barcarena?", options: ["As festas religiosas, como festas de santos padroeiros e procissões", "Apenas eventos esportivos", "Apenas feiras de tecnologia", "Apenas eventos corporativos"], answer: 0, fact: "Festas de santos padroeiros, procissões, missas campais e eventos comunitários mobilizam moradores de vários bairros." },
  { round: "festa", text: "O que anima os festejos religiosos e festas de rua em Barcarena?", options: ["A música popular — aparelhagens, bandas e grupos locais", "Apenas música importada de outros países", "O silêncio, por tradição", "Apenas apresentações de orquestra clássica"], answer: 0, fact: "Sons regionais, grupos locais, aparelhagens e bandas animam festejos religiosos, festas de rua e eventos comunitários." },
  { round: "festa", text: "Quais ingredientes marcam a culinária amazônica de Barcarena?", options: ["Peixes de rio, mandioca, açaí e frutas regionais", "Frutos do mar importados e queijos europeus", "Apenas produtos industrializados", "Trigo e centeio"], answer: 0, fact: "Peixes de rio, mandioca (farinha e tucupi), açaí, frutas regionais e ervas tradicionais fazem parte da mesa barcarenense." },
  { round: "festa", text: "Quais pratos típicos paraenses estão muito presentes no dia a dia de Barcarena?", options: ["Preparos com peixe, maniçoba e tucupi", "Massas italianas tradicionais", "Churrasco no estilo gaúcho", "Comida japonesa"], answer: 0, fact: "Preparos com peixe, caldos regionais e comidas à base de maniçoba e tucupi são comuns nas casas e nas festas." },
  { round: "festa", text: "Que tipo de saberes tradicionais ainda são valorizados em comunidades de Barcarena?", options: ["Técnicas de pesca, manejo da terra e uso de plantas medicinais", "Apenas conhecimentos de informática avançada", "Técnicas de mineração industrial", "Apenas idiomas estrangeiros"], answer: 0, fact: "Técnicas de pesca, manejo da terra, uso de plantas medicinais e práticas de cura fazem parte do patrimônio cultural imaterial do município." },
  { round: "festa", text: "Como a cultura de Barcarena é transmitida entre gerações, de forma marcante?", options: ["Pela oralidade — histórias, causos e lendas contados de geração em geração", "Apenas por livros didáticos oficiais", "Apenas por redes sociais", "Não há transmissão entre gerações"], answer: 0, fact: "Histórias, causos, lendas e memórias familiares são transmitidos de geração em geração, reforçando a identidade local." },
  { round: "festa", text: "O que molda o modo de vida das comunidades ribeirinhas de Barcarena?", options: ["A relação com o rio — cheia, vazante, cultivo, pesca e convivência comunitária", "A vida em prédios altos", "O uso exclusivo de tecnologia digital", "O isolamento total de outras comunidades"], answer: 0, fact: "A relação com o rio, os tempos de cheia e vazante, o cultivo, a pesca e a convivência moldam uma cultura própria, com grande riqueza simbólica." },
  { round: "festa", text: "Onde a fé popular se expressa em Barcarena, além das igrejas?", options: ["Também nas casas e nas margens dos rios, com promessas e procissões fluviais", "Apenas em templos oficiais registrados", "A fé popular não tem expressão pública", "Somente em datas comemorativas nacionais"], answer: 0, fact: "Promessas, orações, velas, pequenos altares domésticos e procissões fluviais fazem parte do cotidiano de muitos moradores." },
  { round: "festa", text: "Como a juventude de Barcarena tem contribuído para a cultura local?", options: ["Criando novas formas de expressão, como grupos de dança e produções audiovisuais", "Abandonando completamente as tradições locais", "Apenas reproduzindo cultura de outros países sem adaptação", "Não participa da vida cultural do município"], answer: 0, fact: "Grupos de dança, produções audiovisuais, movimentos juvenis e manifestações artísticas urbanas se somam às tradições mais antigas." },
  { round: "festa", text: "Por que a população de Barcarena é marcada pela migração interna?", options: ["Porque muitas pessoas vieram de outras regiões em busca de trabalho, principalmente com os projetos industriais", "Porque o município proíbe a saída de moradores", "Porque toda a população nasceu no mesmo bairro", "Porque não há histórico de migração"], answer: 0, fact: "Muitas pessoas vieram de outras regiões do Pará e de estados vizinhos em busca de trabalho, especialmente com os grandes projetos industriais." },
  { round: "festa", text: "Quais grupos convivem no mesmo município de Barcarena, com experiências de vida variadas?", options: ["Ribeirinhos, agricultores, trabalhadores industriais, comerciantes e profissionais de serviços", "Apenas trabalhadores industriais", "Apenas turistas estrangeiros", "Apenas funcionários públicos"], answer: 0, fact: "Ribeirinhos, agricultores familiares, trabalhadores industriais, comerciantes e profissionais de serviços convivem no mesmo município." },
  { round: "festa", text: "Qual o papel dos movimentos sociais e associações comunitárias em Barcarena?", options: ["Ajudar a articular demandas por direitos, infraestrutura e melhorias em políticas públicas", "Não têm nenhuma atuação relevante", "Apenas organizar eventos esportivos", "Servem só para fins comerciais"], answer: 0, fact: "Organizações locais ajudam a articular demandas por direitos, infraestrutura, meio ambiente, educação e saúde." },
  { round: "festa", text: "Quais desafios e oportunidades a juventude de Barcarena enfrenta?", options: ["Busca por emprego, formação técnica e acesso à universidade, além de desigualdade em algumas áreas", "Nenhum desafio, apenas oportunidades ilimitadas", "Falta total de acesso a qualquer atividade cultural", "Obrigatoriedade de deixar o município ao completar 18 anos"], answer: 0, fact: "Há busca por emprego, formação técnica e acesso à universidade, ao mesmo tempo em que persistem desigualdade e falta de oportunidades em algumas áreas." },
  { round: "festa", text: "Por que a educação é considerada um ponto-chave para o desenvolvimento de Barcarena?", options: ["Porque prepara a população para lidar com as transformações econômicas, sociais e ambientais", "Porque é opcional para o desenvolvimento do município", "Porque não tem relação com o crescimento industrial", "Porque serve apenas para fins burocráticos"], answer: 0, fact: "Escolas, programas de formação e capacitação profissional são essenciais para preparar a população para as transformações do município." },
  { round: "festa", text: "O que a saúde pública de Barcarena precisa acompanhar?", options: ["O crescimento populacional e industrial do município", "Apenas o calendário de festas religiosas", "A quantidade de turistas estrangeiros", "O número de embarcações no porto"], answer: 0, fact: "A ampliação de unidades de saúde, profissionais, equipamentos e ações de prevenção é fundamental para a qualidade de vida da população." },
  { round: "festa", text: "Por que a participação em conselhos e audiências públicas é estratégica em Barcarena?", options: ["Porque permite que moradores opinem e acompanhem decisões sobre obras, licenças e políticas sociais", "Porque é uma exigência sem nenhum efeito prático", "Porque substitui as eleições municipais", "Porque é restrita apenas a empresários"], answer: 0, fact: "Esses espaços permitem que moradores opinem, cobrem, proponham e acompanhem decisões relativas a obras, licenças e planos urbanos." },
  { round: "festa", text: "Barcarena é considerada um retrato de quê, no contexto amazônico?", options: ["Das contradições da Amazônia contemporânea", "De uma Amazônia sem nenhum desafio", "De uma região isolada do resto do Brasil", "De uma cidade sem nenhuma atividade econômica"], answer: 0, fact: "No município, convivem riqueza gerada por grandes empreendimentos, comunidades tradicionais e desafios sociais e ambientais." },
  { round: "festa", text: "De que depende o futuro de Barcarena, segundo os saberes locais?", options: ["Do equilíbrio entre economia, meio ambiente e direitos sociais", "Apenas do crescimento industrial, sem outras variáveis", "Somente de investimentos estrangeiros", "De nenhum fator em especial"], answer: 0, fact: "Planejamento, fiscalização, transparência, diálogo e participação social são fundamentais para um desenvolvimento que beneficie a maioria da população." },
  { round: "festa", text: "O que contar a história de Barcarena também ajuda a discutir?", options: ["O futuro da Amazônia como um todo", "Apenas assuntos internos e sem relação externa", "Somente questões do século passado", "Nada além do próprio município"], answer: 0, fact: "O que acontece em Barcarena, em termos de uso do território, investimentos e resistência, ajuda a entender os caminhos que a Amazônia pode seguir." },

  // ── Rodada 4 — O Futuro do Abacaxi (opinião, sem certo/errado) ──
  { round: "futuro", text: "O que mais te deixaria animado(a) para o próximo Festival do Abacaxi?", options: ["Mais atrações musicais", "Mais espaço para produtores locais", "Mais atividades para crianças", "Mais opções de gastronomia"], answer: -1, fact: "" },
  { round: "futuro", text: "Na sua opinião, o que Barcarena mais precisa investir nos próximos anos?", options: ["Infraestrutura urbana", "Educação e cultura", "Meio ambiente e rios", "Turismo e eventos"], answer: -1, fact: "" },
  { round: "futuro", text: "Se você pudesse dar um conselho para o festival do ano que vem, qual seria o tema?", options: ["Sustentabilidade", "Valorização dos produtores", "Mais tecnologia no evento", "Mais espaço para novos talentos"], answer: -1, fact: "" },
];

/** Agrupa, embaralha e SORTEIA um subconjunto por rodada (é isso que dá a
 *  rotação/diversidade entre partidas: com um banco de dezenas de perguntas
 *  por rodada, cada jogo mostra uma combinação diferente).
 *  `pool` pode vir do Supabase (ver loadQuestionPool) ou do banco local acima. */
export function buildGameSet(pool = QUESTIONS) {
  return ROUNDS.map((round) => {
    const shuffled = shuffle(pool.filter((q) => q.round === round.id));
    const picked = shuffled.slice(0, RULES.questionsPerRound);
    return { round, questions: picked.map(shuffleOptions) };
  });
}

/**
 * Busca as perguntas no Supabase; se não estiver configurado, offline, ou a
 * consulta vier vazia/incompleta (faltando alguma rodada), cai de volta para
 * o banco local acima — o quiz nunca fica sem perguntas por causa do banco.
 */
export async function loadQuestionPool() {
  const remote = await fetchQuestions();
  if (!remote) return QUESTIONS;

  const mapped = remote.map((row) => ({
    round: row.round_id,
    text: row.text,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    answer: row.correct_index,
    fact: row.fact || "",
  }));

  const coversAllRounds = ROUNDS.every((r) => mapped.some((q) => q.round === r.id));
  return coversAllRounds ? mapped : QUESTIONS;
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Embaralha as alternativas de UMA pergunta sem perder a referência da certa. */
function shuffleOptions(q) {
  if (q.answer < 0) return { ...q, options: shuffle(q.options) };
  const tagged = q.options.map((text, i) => ({ text, correct: i === q.answer }));
  const shuffled = shuffle(tagged);
  return {
    ...q,
    options: shuffled.map((o) => o.text),
    answer: shuffled.findIndex((o) => o.correct),
  };
}
