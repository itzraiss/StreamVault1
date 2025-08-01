const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const User = require('../models/User');
const { autenticar } = require('../middleware/auth');
const { validarCPF, validarCartao } = require('../utils/validacoes');
const crypto = require('crypto');

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  sandbox: process.env.NODE_ENV !== 'production'
});

// 🏦 PLANOS E PREÇOS
const PLANOS = {
  GRATUITO: { preco: 0, telas: 1, qualidade: 'SD', anuncios: true },
  BASICO: { preco: 14.90, telas: 1, qualidade: 'HD', anuncios: false },
  PADRAO: { preco: 22.90, telas: 2, qualidade: 'FHD', anuncios: false },
  PREMIUM: { preco: 29.90, telas: 4, qualidade: '4K', anuncios: false },
  FAMILIA: { preco: 39.90, telas: 5, qualidade: '4K', anuncios: false, perfis: 5 }
};

// 💳 CRIAR PAGAMENTO PIX
router.post('/pix', autenticar, async (req, res) => {
  try {
    const { plano, meses = 1 } = req.body;
    const usuario = await User.findById(req.userId);
    
    if (!PLANOS[plano]) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Plano inválido'
      });
    }

    const valorTotal = PLANOS[plano].preco * meses;
    
    if (valorTotal === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Plano gratuito não requer pagamento'
      });
    }

    // Criar preferência de pagamento PIX
    const preference = {
      items: [{
        title: `StreamFlix Brasil - Plano ${plano}`,
        description: `Assinatura ${plano.toLowerCase()} por ${meses} mês(es)`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: parseFloat(valorTotal.toFixed(2))
      }],
      payer: {
        name: usuario.nome,
        surname: usuario.sobrenome,
        email: usuario.email,
        phone: {
          number: usuario.telefone?.replace(/\D/g, '')
        },
        identification: {
          type: 'CPF',
          number: usuario.cpf?.replace(/\D/g, '')
        }
      },
      payment_methods: {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' }
        ],
        installments: 1
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
        pending: `${process.env.FRONTEND_URL}/pagamento/pendente`
      },
      auto_return: 'approved',
      external_reference: `${usuario._id}_${plano}_${Date.now()}`,
      notification_url: `${process.env.BACKEND_URL}/api/pagamentos/webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    };

    const response = await mercadopago.preferences.create(preference);

    // Salvar informações do pagamento pendente
    usuario.assinatura.mercadoPago.preapprovalId = response.body.id;
    await usuario.save();

    res.json({
      sucesso: true,
      dados: {
        pagamentoId: response.body.id,
        qrCode: response.body.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: response.body.point_of_interaction?.transaction_data?.qr_code_base64,
        pixCopiaECola: response.body.point_of_interaction?.transaction_data?.qr_code,
        linkPagamento: response.body.init_point,
        expiraEm: preference.expiration_date_to,
        valor: valorTotal,
        plano,
        meses
      }
    });

  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor',
      erro: error.message
    });
  }
});

// 💳 CRIAR PAGAMENTO CARTÃO
router.post('/cartao', autenticar, async (req, res) => {
  try {
    const { 
      plano, 
      meses = 1,
      cartao: {
        numero,
        cvv,
        mesVencimento,
        anoVencimento,
        nomePortador
      },
      parcelas = 1
    } = req.body;

    const usuario = await User.findById(req.userId);
    
    if (!PLANOS[plano]) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Plano inválido'
      });
    }

    const valorTotal = PLANOS[plano].preco * meses;

    // Validar dados do cartão
    if (!validarCartao(numero, cvv, mesVencimento, anoVencimento)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados do cartão inválidos'
      });
    }

    // Criar token do cartão
    const cardToken = await mercadopago.card_token.create({
      card_number: numero.replace(/\s/g, ''),
      security_code: cvv,
      expiration_month: parseInt(mesVencimento),
      expiration_year: parseInt(anoVencimento),
      cardholder: {
        name: nomePortador,
        identification: {
          type: 'CPF',
          number: usuario.cpf?.replace(/\D/g, '')
        }
      }
    });

    // Criar pagamento
    const payment = {
      transaction_amount: parseFloat(valorTotal.toFixed(2)),
      token: cardToken.body.id,
      description: `StreamFlix Brasil - Plano ${plano}`,
      installments: parseInt(parcelas),
      payment_method_id: cardToken.body.payment_method_id,
      issuer_id: cardToken.body.issuer_id,
      payer: {
        email: usuario.email,
        identification: {
          type: 'CPF',
          number: usuario.cpf?.replace(/\D/g, '')
        }
      },
      external_reference: `${usuario._id}_${plano}_${Date.now()}`,
      notification_url: `${process.env.BACKEND_URL}/api/pagamentos/webhook`,
      metadata: {
        usuario_id: usuario._id.toString(),
        plano,
        meses
      }
    };

    const paymentResponse = await mercadopago.payment.create(payment);
    
    // Salvar informações do pagamento
    usuario.assinatura.historicoPagamentos.push({
      valor: valorTotal,
      metodo: 'CARTAO_CREDITO',
      status: paymentResponse.body.status === 'approved' ? 'APROVADO' : 'PENDENTE',
      transacaoId: paymentResponse.body.id,
      mercadoPagoId: paymentResponse.body.id
    });

    // Se aprovado, ativar assinatura
    if (paymentResponse.body.status === 'approved') {
      usuario.assinatura.plano = plano;
      usuario.assinatura.status = 'ATIVO';
      usuario.assinatura.dataVencimento = new Date(Date.now() + (meses * 30 * 24 * 60 * 60 * 1000));
      usuario.assinatura.preco = PLANOS[plano].preco;
      usuario.assinatura.formaPagamento = {
        tipo: 'CARTAO_CREDITO',
        ultimosQuatroDigitos: numero.slice(-4),
        bandeira: cardToken.body.payment_method_id
      };
      usuario.limitePerfis = PLANOS[plano].perfis || 1;
      usuario.limiteDispositivos = PLANOS[plano].telas;
    }

    await usuario.save();

    res.json({
      sucesso: true,
      dados: {
        pagamentoId: paymentResponse.body.id,
        status: paymentResponse.body.status,
        statusDetail: paymentResponse.body.status_detail,
        aprovado: paymentResponse.body.status === 'approved',
        valor: valorTotal,
        parcelas,
        plano,
        meses
      }
    });

  } catch (error) {
    console.error('Erro ao processar pagamento cartão:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar pagamento',
      erro: error.message
    });
  }
});

// 🎫 GERAR BOLETO
router.post('/boleto', autenticar, async (req, res) => {
  try {
    const { plano, meses = 1 } = req.body;
    const usuario = await User.findById(req.userId);
    
    if (!PLANOS[plano]) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Plano inválido'
      });
    }

    const valorTotal = PLANOS[plano].preco * meses;

    // Boleto só para planos anuais (desconto de 15%)
    if (meses < 12) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Boleto disponível apenas para planos anuais'
      });
    }

    const valorComDesconto = valorTotal * 0.85; // 15% desconto

    const payment = {
      transaction_amount: parseFloat(valorComDesconto.toFixed(2)),
      description: `StreamFlix Brasil - Plano ${plano} Anual`,
      payment_method_id: 'bolbradesco',
      payer: {
        email: usuario.email,
        first_name: usuario.nome,
        last_name: usuario.sobrenome,
        identification: {
          type: 'CPF',
          number: usuario.cpf?.replace(/\D/g, '')
        },
        address: {
          zip_code: usuario.endereco?.cep?.replace(/\D/g, ''),
          street_name: usuario.endereco?.logradouro,
          street_number: usuario.endereco?.numero,
          neighborhood: usuario.endereco?.bairro,
          city: usuario.endereco?.cidade,
          federal_unit: usuario.endereco?.estado
        }
      },
      external_reference: `${usuario._id}_${plano}_${Date.now()}`,
      notification_url: `${process.env.BACKEND_URL}/api/pagamentos/webhook`,
      date_of_expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
      metadata: {
        usuario_id: usuario._id.toString(),
        plano,
        meses
      }
    };

    const paymentResponse = await mercadopago.payment.create(payment);
    
    // Salvar informações do pagamento
    usuario.assinatura.historicoPagamentos.push({
      valor: valorComDesconto,
      metodo: 'BOLETO',
      status: 'PENDENTE',
      transacaoId: paymentResponse.body.id,
      mercadoPagoId: paymentResponse.body.id
    });

    await usuario.save();

    res.json({
      sucesso: true,
      dados: {
        pagamentoId: paymentResponse.body.id,
        linkBoleto: paymentResponse.body.transaction_details?.external_resource_url,
        codigoBarras: paymentResponse.body.barcode?.content,
        dataVencimento: payment.date_of_expiration,
        valor: valorComDesconto,
        desconto: valorTotal - valorComDesconto,
        plano,
        meses
      }
    });

  } catch (error) {
    console.error('Erro ao gerar boleto:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao gerar boleto',
      erro: error.message
    });
  }
});

// 🔄 WEBHOOK MERCADO PAGO
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const payment = await mercadopago.payment.get(data.id);
      const paymentData = payment.body;
      
      if (paymentData.external_reference) {
        const [usuarioId, plano] = paymentData.external_reference.split('_');
        const usuario = await User.findById(usuarioId);
        
        if (usuario) {
          // Atualizar histórico de pagamento
          const pagamento = usuario.assinatura.historicoPagamentos.find(
            p => p.mercadoPagoId === paymentData.id.toString()
          );
          
          if (pagamento) {
            pagamento.status = paymentData.status === 'approved' ? 'APROVADO' : 
                              paymentData.status === 'rejected' ? 'REJEITADO' : 'PENDENTE';
          }

          // Se pagamento aprovado, ativar assinatura
          if (paymentData.status === 'approved') {
            const meses = parseInt(paymentData.metadata?.meses || 1);
            
            usuario.assinatura.plano = plano;
            usuario.assinatura.status = 'ATIVO';
            usuario.assinatura.dataVencimento = new Date(Date.now() + (meses * 30 * 24 * 60 * 60 * 1000));
            usuario.assinatura.preco = PLANOS[plano]?.preco || 0;
            usuario.limitePerfis = PLANOS[plano]?.perfis || 1;
            usuario.limiteDispositivos = PLANOS[plano]?.telas || 1;
            
            // Enviar email de confirmação
            // await enviarEmailConfirmacao(usuario);
          }

          await usuario.save();
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro interno');
  }
});

// 📊 CONSULTAR STATUS PAGAMENTO
router.get('/status/:pagamentoId', autenticar, async (req, res) => {
  try {
    const { pagamentoId } = req.params;
    
    const payment = await mercadopago.payment.get(pagamentoId);
    const paymentData = payment.body;
    
    res.json({
      sucesso: true,
      dados: {
        id: paymentData.id,
        status: paymentData.status,
        statusDetail: paymentData.status_detail,
        valor: paymentData.transaction_amount,
        metodoPagamento: paymentData.payment_method_id,
        dataProcessamento: paymentData.date_approved || paymentData.date_created,
        aprovado: paymentData.status === 'approved'
      }
    });
    
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao consultar pagamento'
    });
  }
});

// 🎯 LISTAR PLANOS DISPONÍVEIS
router.get('/planos', (req, res) => {
  res.json({
    sucesso: true,
    dados: PLANOS
  });
});

// 💰 CALCULAR PREÇO COM DESCONTO
router.post('/calcular-preco', (req, res) => {
  try {
    const { plano, meses = 1, cupom } = req.body;
    
    if (!PLANOS[plano]) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Plano inválido'
      });
    }

    let valorTotal = PLANOS[plano].preco * meses;
    let desconto = 0;
    
    // Desconto para planos anuais
    if (meses === 12) {
      desconto = valorTotal * 0.15; // 15% desconto anual
      valorTotal = valorTotal - desconto;
    }
    
    // Aplicar cupom (se válido)
    if (cupom) {
      const cupomDesconto = validarCupom(cupom);
      if (cupomDesconto) {
        const descontoCupom = valorTotal * (cupomDesconto / 100);
        desconto += descontoCupom;
        valorTotal -= descontoCupom;
      }
    }

    res.json({
      sucesso: true,
      dados: {
        plano,
        meses,
        precoOriginal: PLANOS[plano].preco * meses,
        desconto,
        valorFinal: parseFloat(valorTotal.toFixed(2)),
        recursos: PLANOS[plano]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao calcular preço'
    });
  }
});

// ❌ CANCELAR ASSINATURA
router.post('/cancelar', autenticar, async (req, res) => {
  try {
    const { motivo } = req.body;
    const usuario = await User.findById(req.userId);
    
    if (!usuario.assinaturaAtiva) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nenhuma assinatura ativa encontrada'
      });
    }

    // Cancelar assinatura no Mercado Pago se houver
    if (usuario.assinatura.mercadoPago.subscriptionId) {
      await mercadopago.preapproval.update({
        id: usuario.assinatura.mercadoPago.subscriptionId,
        status: 'cancelled'
      });
    }

    // Manter acesso até o fim do período pago
    usuario.assinatura.status = 'CANCELADO';
    usuario.assinatura.renovacaoAutomatica = false;
    
    // Log do cancelamento
    usuario.assinatura.historicoPagamentos.push({
      data: new Date(),
      valor: 0,
      metodo: 'CANCELAMENTO',
      status: 'APROVADO',
      transacaoId: `cancel_${Date.now()}`
    });

    await usuario.save();

    res.json({
      sucesso: true,
      mensagem: 'Assinatura cancelada com sucesso',
      dados: {
        acessoAte: usuario.assinatura.dataVencimento,
        motivo
      }
    });
    
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao cancelar assinatura'
    });
  }
});

// 🔄 REATIVAR ASSINATURA
router.post('/reativar', autenticar, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    
    if (usuario.assinatura.status !== 'CANCELADO') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Assinatura não está cancelada'
      });
    }

    // Reativar apenas se ainda estiver no período pago
    if (usuario.assinatura.dataVencimento > new Date()) {
      usuario.assinatura.status = 'ATIVO';
      usuario.assinatura.renovacaoAutomatica = true;
      await usuario.save();

      res.json({
        sucesso: true,
        mensagem: 'Assinatura reativada com sucesso'
      });
    } else {
      res.status(400).json({
        sucesso: false,
        mensagem: 'Período de assinatura expirado. Faça um novo pagamento.'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao reativar assinatura'
    });
  }
});

// 📄 HISTÓRICO DE PAGAMENTOS
router.get('/historico', autenticar, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    
    res.json({
      sucesso: true,
      dados: {
        assinaturaAtual: {
          plano: usuario.assinatura.plano,
          status: usuario.assinatura.status,
          dataVencimento: usuario.assinatura.dataVencimento,
          preco: usuario.assinatura.preco,
          renovacaoAutomatica: usuario.assinatura.renovacaoAutomatica
        },
        historicoPagamentos: usuario.assinatura.historicoPagamentos.sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        )
      }
    });
    
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar histórico'
    });
  }
});

// Função auxiliar para validar cupom
function validarCupom(codigo) {
  const cupons = {
    'STREAMFLIX20': 20,
    'PRIMEIROUSER': 50,
    'VOLTEBRASIL': 30
  };
  
  return cupons[codigo.toUpperCase()] || null;
}

module.exports = router;