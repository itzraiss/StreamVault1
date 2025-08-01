const { cpf, cnpj } = require('cpf-cnpj-validator');

// 🇧🇷 VALIDAÇÃO DE CPF
const validarCPF = (cpfString) => {
  if (!cpfString) return false;
  
  // Remove caracteres não numéricos
  const cpfLimpo = cpfString.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Usa a biblioteca para validação completa
  return cpf.isValid(cpfLimpo);
};

// 📱 VALIDAÇÃO DE TELEFONE BRASILEIRO
const validarTelefone = (telefoneString) => {
  if (!telefoneString) return false;
  
  // Remove caracteres não numéricos
  const telefoneLimpo = telefoneString.replace(/\D/g, '');
  
  // Formatos aceitos:
  // 11999999999 (celular SP)
  // 1199999999 (fixo SP)
  // 5511999999999 (com código país)
  
  // Verifica se tem 10, 11 ou 13 dígitos
  if (![10, 11, 13].includes(telefoneLimpo.length)) return false;
  
  // Se tem 13 dígitos, deve começar com 55 (código do Brasil)
  if (telefoneLimpo.length === 13 && !telefoneLimpo.startsWith('55')) {
    return false;
  }
  
  // Se tem 11 dígitos, o terceiro deve ser 9 (celular) ou 2-5 (fixo)
  if (telefoneLimpo.length === 11) {
    const terceiroDigito = telefoneLimpo[2];
    if (!['2', '3', '4', '5', '9'].includes(terceiroDigito)) {
      return false;
    }
  }
  
  // Validar códigos de área válidos (11-99)
  let codigoArea;
  if (telefoneLimpo.length === 13) {
    codigoArea = telefoneLimpo.substring(2, 4);
  } else {
    codigoArea = telefoneLimpo.substring(0, 2);
  }
  
  const codigosValidos = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];
  
  return codigosValidos.includes(codigoArea);
};

// 💳 VALIDAÇÃO DE CARTÃO DE CRÉDITO
const validarCartao = (numero, cvv, mesVencimento, anoVencimento) => {
  if (!numero || !cvv || !mesVencimento || !anoVencimento) {
    return false;
  }
  
  // Remove espaços e caracteres não numéricos do número
  const numeroLimpo = numero.replace(/\D/g, '');
  
  // Verifica se tem 13-19 dígitos (padrão de cartões)
  if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
    return false;
  }
  
  // Algoritmo de Luhn para validar número do cartão
  if (!algoritmoLuhn(numeroLimpo)) {
    return false;
  }
  
  // Validar CVV (3 ou 4 dígitos)
  const cvvLimpo = cvv.replace(/\D/g, '');
  if (cvvLimpo.length < 3 || cvvLimpo.length > 4) {
    return false;
  }
  
  // Validar data de vencimento
  const mes = parseInt(mesVencimento);
  const ano = parseInt(anoVencimento);
  
  if (mes < 1 || mes > 12) {
    return false;
  }
  
  // Ano deve ser pelo menos o atual
  const anoAtual = new Date().getFullYear();
  const anoCompleto = ano < 100 ? 2000 + ano : ano;
  
  if (anoCompleto < anoAtual) {
    return false;
  }
  
  // Se é o ano atual, o mês deve ser maior ou igual ao atual
  if (anoCompleto === anoAtual) {
    const mesAtual = new Date().getMonth() + 1;
    if (mes < mesAtual) {
      return false;
    }
  }
  
  return true;
};

// 🔍 ALGORITMO DE LUHN
const algoritmoLuhn = (numero) => {
  let soma = 0;
  let alternar = false;
  
  // Percorre da direita para esquerda
  for (let i = numero.length - 1; i >= 0; i--) {
    let n = parseInt(numero[i]);
    
    if (alternar) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    
    soma += n;
    alternar = !alternar;
  }
  
  return (soma % 10) === 0;
};

// 🏦 IDENTIFICAR BANDEIRA DO CARTÃO
const identificarBandeira = (numero) => {
  const numeroLimpo = numero.replace(/\D/g, '');
  
  // Visa: 4
  if (/^4/.test(numeroLimpo)) {
    return 'visa';
  }
  
  // Mastercard: 5 ou 2221-2720
  if (/^5[1-5]/.test(numeroLimpo) || /^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[0-1]\d|720)/.test(numeroLimpo)) {
    return 'mastercard';
  }
  
  // American Express: 34 ou 37
  if (/^3[47]/.test(numeroLimpo)) {
    return 'amex';
  }
  
  // Dinners Club: 30, 36, 38
  if (/^3[068]/.test(numeroLimpo)) {
    return 'dinners';
  }
  
  // Discover: 6011, 622126-622925, 644-649, 65
  if (/^(6011|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5])|64[4-9]|65)/.test(numeroLimpo)) {
    return 'discover';
  }
  
  // Elo (bandeira brasileira): 4011, 4312, 4389, 4514, 4573, 6362, 6363
  if (/^(4011|4312|4389|4514|4573|6362|6363)/.test(numeroLimpo)) {
    return 'elo';
  }
  
  // Hipercard (bandeira brasileira): 6062
  if (/^6062/.test(numeroLimpo)) {
    return 'hipercard';
  }
  
  return 'desconhecida';
};

// 📮 VALIDAÇÃO DE CEP
const validarCEP = (cep) => {
  if (!cep) return false;
  
  // Remove caracteres não numéricos
  const cepLimpo = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (cepLimpo.length !== 8) return false;
  
  // Verifica se não são todos zeros
  if (cepLimpo === '00000000') return false;
  
  return true;
};

// 📧 VALIDAÇÃO DE EMAIL
const validarEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.toLowerCase());
};

// 🔒 VALIDAÇÃO DE SENHA FORTE
const validarSenhaForte = (senha) => {
  if (!senha) return { valida: false, erros: ['Senha é obrigatória'] };
  
  const erros = [];
  
  // Mínimo 8 caracteres
  if (senha.length < 8) {
    erros.push('Senha deve ter no mínimo 8 caracteres');
  }
  
  // Pelo menos uma letra minúscula
  if (!/[a-z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  // Pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  // Pelo menos um número
  if (!/\d/.test(senha)) {
    erros.push('Senha deve conter pelo menos um número');
  }
  
  // Pelo menos um caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    erros.push('Senha deve conter pelo menos um caractere especial');
  }
  
  // Não pode ter sequências simples
  const sequenciasComuns = ['123456', 'abcdef', 'qwerty', 'password', '123abc'];
  if (sequenciasComuns.some(seq => senha.toLowerCase().includes(seq))) {
    erros.push('Senha não pode conter sequências comuns');
  }
  
  return {
    valida: erros.length === 0,
    erros
  };
};

// 🏠 VALIDAÇÃO DE ENDEREÇO BRASILEIRO
const validarEndereco = (endereco) => {
  const erros = [];
  
  if (!endereco.cep || !validarCEP(endereco.cep)) {
    erros.push('CEP inválido');
  }
  
  if (!endereco.logradouro || endereco.logradouro.length < 5) {
    erros.push('Logradouro deve ter pelo menos 5 caracteres');
  }
  
  if (!endereco.numero) {
    erros.push('Número é obrigatório');
  }
  
  if (!endereco.bairro || endereco.bairro.length < 2) {
    erros.push('Bairro deve ter pelo menos 2 caracteres');
  }
  
  if (!endereco.cidade || endereco.cidade.length < 2) {
    erros.push('Cidade deve ter pelo menos 2 caracteres');
  }
  
  const estadosValidos = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  if (!endereco.estado || !estadosValidos.includes(endereco.estado.toUpperCase())) {
    erros.push('Estado inválido');
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};

// 🔢 FORMATAÇÃO DE VALORES BRASILEIROS
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarCPF = (cpf) => {
  if (!cpf) return '';
  const cpfLimpo = cpf.replace(/\D/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};

const formatarCEP = (cep) => {
  if (!cep) return '';
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// 🎯 VALIDAÇÃO COMPLETA DE USUÁRIO BRASILEIRO
const validarUsuarioBrasileiro = (dados) => {
  const erros = [];
  
  // Nome e sobrenome
  if (!dados.nome || dados.nome.length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!dados.sobrenome || dados.sobrenome.length < 2) {
    erros.push('Sobrenome deve ter pelo menos 2 caracteres');
  }
  
  // Email
  if (!validarEmail(dados.email)) {
    erros.push('Email inválido');
  }
  
  // CPF
  if (dados.cpf && !validarCPF(dados.cpf)) {
    erros.push('CPF inválido');
  }
  
  // Telefone
  if (dados.telefone && !validarTelefone(dados.telefone)) {
    erros.push('Telefone inválido');
  }
  
  // Data de nascimento
  if (dados.dataNascimento) {
    const nascimento = new Date(dados.dataNascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    
    if (idade < 13) {
      erros.push('Usuário deve ter pelo menos 13 anos');
    }
    
    if (nascimento >= hoje) {
      erros.push('Data de nascimento deve ser anterior à data atual');
    }
  }
  
  // Senha
  if (dados.senha) {
    const validacaoSenha = validarSenhaForte(dados.senha);
    if (!validacaoSenha.valida) {
      erros.push(...validacaoSenha.erros);
    }
  }
  
  // Endereço (se fornecido)
  if (dados.endereco) {
    const validacaoEndereco = validarEndereco(dados.endereco);
    if (!validacaoEndereco.valido) {
      erros.push(...validacaoEndereco.erros);
    }
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};

module.exports = {
  validarCPF,
  validarTelefone,
  validarCartao,
  validarCEP,
  validarEmail,
  validarSenhaForte,
  validarEndereco,
  validarUsuarioBrasileiro,
  identificarBandeira,
  algoritmoLuhn,
  formatarMoeda,
  formatarCPF,
  formatarTelefone,
  formatarCEP
};