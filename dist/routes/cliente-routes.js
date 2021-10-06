"use strict";
var cliente_model_1 = require("../models/cliente-model");
var transferencia_model_1 = require("../models/transferencia-model");
module.exports = function (app) {
    app.get('/', function (request, response) {
        response.render('../views/pages/index');
    });
    app.get('/cadastrarUsuario', function (request, response) {
        response.render('../views/pages/cadastrarUsuario');
    });
    app.post("/cadastrarUsuario", function (request, response) {
        var usuario = new cliente_model_1.UserModel({
            nome: '',
            email: '',
            senha: '',
            cpf: '',
            contato: '',
            agencia: '',
            conta: '',
            saldo: 0
        });
        usuario.nome = request.body.nome;
        usuario.email = request.body.email;
        usuario.senha = request.body.senha;
        usuario.cpf = request.body.cpf;
        usuario.contato = request.body.contato;
        usuario.agencia = request.body.agencia;
        usuario.conta = request.body.conta;
        usuario.saldo = request.body.saldo;
        usuario.save(function (error) {
            if (error)
                return response.status(500).send("Erro ao cadastrar Cliente: " + error);
            return response.render('../views/pages/login', { mensagem: null });
        });
    });
    app.get('/login', function (request, response) {
        response.render('../views/pages/login', { mensagem: null });
    });
    app.post('/login', function (request, response) {
        var agencia = request.body.agencia;
        var conta = request.body.conta;
        var senha = request.body.senha;
        cliente_model_1.UserModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }, { senha: senha }] }, function (err, usuarioLogado) {
            if (err) {
                return response.status(500).send("Erro ao conectar no banco de dados");
            }
            else if (usuarioLogado === null) {
                return response.render("../views/pages/login", { mensagem: "Cliente não encontrado. Certifique-se de ter informado os dados corretos." });
            }
            else {
                response.render("../views/pages/usuario", { usuarioLogado: usuarioLogado });
            }
        });
    });
    app.get('/usuario', function (request, response) {
        var agencia = request.body.agencia;
        var conta = request.body.conta;
        cliente_model_1.UserModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }] }, function (err, usuarioLogado) {
            if (err) {
                return response.status(500).send("Erro ao conectar no banco de dados");
            }
            else if (usuarioLogado === null) {
                return response.render("../views/pages/login", { mensagem: "Cliente não encontrado. Certifique-se de ter informado os dados corretos." });
            }
            else {
                response.render("../views/pages/usuario", { usuarioLogado: usuarioLogado });
            }
        });
    });
    app.get('/usuario/:id', function (request, response) {
        var idLogado = request.params.id;
        cliente_model_1.UserModel.findById(({ _id: idLogado }), function (err, usuarioLogado) {
            if (err)
                return response.status(500).send("Erro ao encontrar cliente.");
            response.render("../views/pages/usuario", { usuarioLogado: usuarioLogado });
        });
    });
    app.get('/transferencia/:id', function (request, response) {
        var id = request.params.id;
        cliente_model_1.UserModel.findById(({ _id: id }), function (err, usuarioLogado) {
            if (err)
                return response.status(500).send("Erro ao encontrar cliente.");
            response.render("../views/pages/transferencia", { usuarioLogado: usuarioLogado, mensagem: null });
        });
    });
    app.post('/transferencia', function (request, response) {
        var agenciaDest = request.body.agenciaDest;
        var contaDest = request.body.contaDest;
        var valor = parseFloat(request.body.valor);
        var agenciaOrigem = request.body.agenciaOrigem;
        var contaOrigem = request.body.contaOrigem;
        cliente_model_1.UserModel.findOne({ $and: [{ agencia: agenciaOrigem }, { conta: contaOrigem }] }, function (err, usuarioLogado) {
            if (err)
                return response.status(500).send("Erro ao buscar cliente da conta de origem");
            if (agenciaDest === "" || agenciaDest === null || contaDest === "" || contaDest === null) {
                return response.render("../views/pages/transferencia", { usuarioLogado: usuarioLogado, mensagem: 'Informações insuficientes. Campos de Agência e Conta de destino não podem ficar vazios.' });
            }
            var idOrigem = usuarioLogado._id;
            var saldoOrigem = usuarioLogado.saldo;
            if (saldoOrigem < valor) {
                return response.render("../views/pages/transferencia", { usuarioLogado: usuarioLogado, mensagem: 'Saldo Insuficiente. Para concluir a transferência, informe um valor menor ou igual ao saldo em conta' });
            }
            else {
                cliente_model_1.UserModel.findByIdAndUpdate(idOrigem, { saldo: saldoOrigem - valor }, { new: true }).then(function (usuarioLogado) {
                    cliente_model_1.UserModel.findOne({ $and: [{ agencia: agenciaDest }, { conta: contaDest }] }, function (err, destinatario) {
                        if (err) {
                            return response.status(500).send("Erro ao encontrar o cliente de destino.");
                        }
                        else {
                            if (destinatario === null) {
                                return response.render("../views/pages/transferencia", { usuarioLogado: usuarioLogado, mensagem: 'Conta/Agência de Destino não encontrados' });
                            }
                            var idDest = destinatario._id;
                            var saldoDest = destinatario.saldo;
                            cliente_model_1.UserModel.findByIdAndUpdate(idDest, { saldo: saldoDest + valor }, { new: true }).then(function (destinatario) {
                                var transferencia = new transferencia_model_1.TransferenciaModel({
                                    tipo: 'transferencia',
                                    agenciaOrigem: agenciaOrigem,
                                    contaOrigem: contaOrigem,
                                    nomeOrigem: usuarioLogado.nome,
                                    agenciaDestino: agenciaDest,
                                    contaDestino: contaDest,
                                    nomeDestino: destinatario.nome,
                                    valor: valor
                                });
                                transferencia.save(function (error) {
                                    if (error)
                                        return response.status(500).send("Erro ao salvar transação: " + error);
                                    return response.render("../views/pages/usuario", { usuarioLogado: usuarioLogado });
                                });
                            });
                        }
                    });
                });
            }
        });
    });
    app.post('/extratoTransferencias/:id', function (request, response) {
        var agenciaLogado = request.body.agencia;
        var contaLogado = request.body.conta;
        var usuarioLogado = request.body.id;
        cliente_model_1.UserModel.findById(({ _id: usuarioLogado }), function (err, usuarioLogado) {
            if (err) {
                return response.status(500).send("Erro ao encontrar cliente e as transferências associadas ao cliente.");
            }
            else {
                transferencia_model_1.TransferenciaModel.find({ $or: [
                        { $and: [{ agenciaOrigem: agenciaLogado }, { contaOrigem: contaLogado }] },
                        { $and: [{ agenciaDestino: agenciaLogado }, { contaDestino: contaLogado }] }
                    ] }, function (err, transferencias) {
                    if (err) {
                        return response.status(500).send("Erro ao consultar transferências");
                    }
                    var transferenciasEnviadas = transferencias.filter(function (transferencia) { if (transferencia.agenciaOrigem === agenciaLogado)
                        return transferencia; });
                    var transferenciasRecebidas = transferencias.filter(function (transferencia) { if (transferencia.agenciaDestino === agenciaLogado)
                        return transferencia; });
                    return response.render("../views/pages/extratoTransferencias", { transferenciasEnviadas: transferenciasEnviadas, transferenciasRecebidas: transferenciasRecebidas, usuarioLogado: usuarioLogado });
                });
            }
        });
    });
};
