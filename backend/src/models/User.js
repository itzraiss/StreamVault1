const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { cpf, cnpj } = require('cpf-cnpj-validator');

const profileSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: '/avatars/default.png'
  },
  dataDeNascimento: {
    type: Date
  },
  classificacaoEtaria: {
    type: String,
    enum: ['LIVRE', '10', '12', '14', '16', '18'],
    default: 'LIVRE'
  },
  controleParental: {
    type: Boolean,
    default: false
  },
  historico: [{
    midia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    posicao: {
      type: Number,
      default: 0
    },
    percentualAssistido: {
      type: Number,
      default: 0
    },
    ultimaVisualizacao: {
      type: Date,
      default: Date.now
    }
  }],
  listaDesejos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  avaliacoes: [{
    midia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    nota: {
      type: Number,
      min: 1,
      max: 5
    },
    comentario: String,
    dataAvaliacao: {
      type: Date,
      default: Date.now
    }
  }],
  preferencias: {
    idiomaDublagem: {
      type: String,
      enum: ['pt-BR', 'en-US', 'es-ES', 'ja-JP'],
      default: 'pt-BR'
    },
    idiomaLegenda: {
      type: String,
      enum: ['pt-BR', 'en-US', 'es-ES', 'ja-JP', 'none'],
      default: 'pt-BR'
    },
    qualidadeVideo: {
      type: String,
      enum: ['AUTO', 'SD', 'HD', 'FHD', '4K'],
      default: 'AUTO'
    },
    reproducaoAutomatica: {
      type: Boolean,
      default: true
    },
    volumePadrao: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    }
  }
});

const assinaturaSchema = new mongoose.Schema({
  plano: {
    type: String,
    enum: ['GRATUITO', 'BASICO', 'PADRAO', 'PREMIUM', 'FAMILIA'],
    default: 'GRATUITO'
  },
  status: {
    type: String,
    enum: ['ATIVO', 'INATIVO', 'CANCELADO', 'SUSPENSE', 'TRIAL'],
    default: 'TRIAL'
  },
  dataInicio: {
    type: Date,
    default: Date.now
  },
  dataVencimento: {
    type: Date
  },
  preco: {
    type: Number,
    default: 0
  },
  moeda: {
    type: String,
    default: 'BRL'
  },
  formaPagamento: {
    tipo: {
      type: String,
      enum: ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'MERCADOPAGO']
    },
    ultimosQuatroDigitos: String,
    bandeira: String
  },
  mercadoPago: {
    customerId: String,
    subscriptionId: String,
    preapprovalId: String
  },
  historicoPagamentos: [{
    data: {
      type: Date,
      default: Date.now
    },
    valor: Number,
    metodo: String,
    status: {
      type: String,
      enum: ['APROVADO', 'PENDENTE', 'REJEITADO', 'CANCELADO']
    },
    transacaoId: String,
    mercadoPagoId: String
  }],
  tentativasPagamento: {
    type: Number,
    default: 0
  },
  proximaTentativaPagamento: Date,
  renovacaoAutomatica: {
    type: Boolean,
    default: true
  }
});

const userSchema = new mongoose.Schema({
  // Informações Básicas
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  sobrenome: {
    type: String,
    required: [true, 'Sobrenome é obrigatório'],
    trim: true,
    maxlength: [100, 'Sobrenome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  telefone: {
    type: String,
    trim: true,
    match: [/^\+55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone brasileiro inválido']
  },
  cpf: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(value) {
        return !value || cpf.isValid(value);
      },
      message: 'CPF inválido'
    }
  },
  dataNascimento: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value < new Date();
      },
      message: 'Data de nascimento deve ser anterior à data atual'
    }
  },
  genero: {
    type: String,
    enum: ['MASCULINO', 'FEMININO', 'NAO_BINARIO', 'PREFIRO_NAO_DIZER']
  },
  
  // Endereço Brasileiro
  endereco: {
    cep: {
      type: String,
      match: [/^\d{5}-?\d{3}$/, 'CEP inválido']
    },
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: {
      type: String,
      enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
    },
    pais: {
      type: String,
      default: 'Brasil'
    }
  },

  // Autenticação
  senha: {
    type: String,
    minlength: [8, 'Senha deve ter no mínimo 8 caracteres']
  },
  senhaResetToken: String,
  senhaResetExpira: Date,
  emailVerificado: {
    type: Boolean,
    default: false
  },
  telefoneVerificado: {
    type: Boolean,
    default: false
  },
  emailVerificacaoToken: String,
  telefoneVerificacaoToken: String,

  // OAuth
  googleId: String,
  facebookId: String,
  provedorAutenticacao: [{
    tipo: {
      type: String,
      enum: ['EMAIL', 'GOOGLE', 'FACEBOOK', 'TELEFONE']
    },
    verificado: {
      type: Boolean,
      default: false
    }
  }],

  // Perfis da Conta
  perfis: [profileSchema],
  perfilAtivo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  limitePerfis: {
    type: Number,
    default: 1
  },

  // Assinatura
  assinatura: assinaturaSchema,

  // Configurações da Conta
  configuracoes: {
    notificacoes: {
      email: {
        novosConteudos: { type: Boolean, default: true },
        promocoes: { type: Boolean, default: true },
        cobranças: { type: Boolean, default: true },
        sistema: { type: Boolean, default: true }
      },
      push: {
        novosEpisodios: { type: Boolean, default: true },
        recomendacoes: { type: Boolean, default: true },
        lembretes: { type: Boolean, default: true }
      },
      sms: {
        cobrancas: { type: Boolean, default: false },
        seguranca: { type: Boolean, default: true }
      }
    },
    privacidade: {
      perfilPublico: { type: Boolean, default: false },
      compartilharHistorico: { type: Boolean, default: false },
      analiseDados: { type: Boolean, default: true },
      cookiesPersonalizacao: { type: Boolean, default: true }
    },
    idioma: {
      type: String,
      default: 'pt-BR'
    },
    fusoHorario: {
      type: String,
      default: 'America/Sao_Paulo'
    }
  },

  // Controle de Dispositivos
  dispositivos: [{
    nome: String,
    tipo: {
      type: String,
      enum: ['WEB', 'ANDROID', 'ANDROID_TV', 'ROKU', 'IOS', 'SMART_TV']
    },
    ultimoAcesso: Date,
    ip: String,
    localizacao: String,
    ativo: {
      type: Boolean,
      default: true
    },
    deviceId: String
  }],
  limiteDispositivos: {
    type: Number,
    default: 2
  },

  // Segurança e LGPD
  lgpd: {
    consentimentoColetaDados: {
      type: Boolean,
      default: false
    },
    consentimentoMarketing: {
      type: Boolean,
      default: false
    },
    dataConsentimento: Date,
    ipConsentimento: String,
    solicitacaoExclusao: {
      solicitado: { type: Boolean, default: false },
      dataSolicitacao: Date,
      dataExecucao: Date
    },
    exportacaoDados: [{
      dataSolicitacao: Date,
      dataExecucao: Date,
      arquivoUrl: String
    }]
  },

  // Métricas e Analytics
  analytics: {
    primeiroAcesso: {
      type: Date,
      default: Date.now
    },
    ultimoAcesso: Date,
    totalTempoAssistido: {
      type: Number,
      default: 0
    },
    episodiosAssistidos: {
      type: Number,
      default: 0
    },
    filmesAssistidos: {
      type: Number,
      default: 0
    },
    categoriasPreferidas: [String],
    dispositivoMaisUsado: String,
    horarioPicoUso: String
  },

  // Sistema
  status: {
    type: String,
    enum: ['ATIVO', 'INATIVO', 'SUSPENSO', 'BANIDO'],
    default: 'ATIVO'
  },
  motivoSuspensao: String,
  tentativasLogin: {
    type: Number,
    default: 0
  },
  contaBloqueadaAte: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance
userSchema.index({ email: 1 });
userSchema.index({ cpf: 1 });
userSchema.index({ telefone: 1 });
userSchema.index({ 'assinatura.status': 1 });
userSchema.index({ 'assinatura.dataVencimento': 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'analytics.ultimoAcesso': 1 });

// Virtual para nome completo
userSchema.virtual('nomeCompleto').get(function() {
  return `${this.nome} ${this.sobrenome}`;
});

// Virtual para idade
userSchema.virtual('idade').get(function() {
  if (!this.dataNascimento) return null;
  const hoje = new Date();
  const nascimento = new Date(this.dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
});

// Virtual para status da assinatura
userSchema.virtual('assinaturaAtiva').get(function() {
  return this.assinatura && this.assinatura.status === 'ATIVO' && 
         this.assinatura.dataVencimento > new Date();
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  this.senha = await bcrypt.hash(this.senha, 12);
  next();
});

// Método para comparar senhas
userSchema.methods.compararSenha = async function(senhaCandidata) {
  return await bcrypt.compare(senhaCandidata, this.senha);
};

// Método para criar token de reset de senha
userSchema.methods.criarTokenResetSenha = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.senhaResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.senhaResetExpira = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  return resetToken;
};

// Método para verificar se pode criar novo perfil
userSchema.methods.podeAdicionarPerfil = function() {
  return this.perfis.length < this.limitePerfis;
};

// Método para calcular preço baseado no plano
userSchema.methods.calcularPrecoPlano = function(plano) {
  const precos = {
    GRATUITO: 0,
    BASICO: 14.90,
    PADRAO: 22.90,
    PREMIUM: 29.90,
    FAMILIA: 39.90
  };
  return precos[plano] || 0;
};

// Método para formatar CPF
userSchema.methods.cpfFormatado = function() {
  if (!this.cpf) return null;
  return this.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Método para formatar telefone
userSchema.methods.telefoneFormatado = function() {
  if (!this.telefone) return null;
  const cleaned = this.telefone.replace(/\D/g, '');
  if (cleaned.length === 13) { // +55XXXXXXXXXXX
    return cleaned.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
  }
  return this.telefone;
};

// Middleware para atualizar último acesso
userSchema.pre('findOneAndUpdate', function() {
  this.set({ 'analytics.ultimoAcesso': new Date() });
});

module.exports = mongoose.model('User', userSchema);