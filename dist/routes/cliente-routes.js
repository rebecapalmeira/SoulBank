"use strict";
var cliente_model_1 = require("../models/cliente-model");
var transacao_model_1 = require("../models/transacao-model");
module.exports = function (app) {
    app.get('/', function (request, response) {
        response.render('../views/pages/index');
    });
    app.get('/teste', function (request, response) {
        response.send('teste funfou');
    });
    app.get('/teste', function (request, response) {
        response.send('teste funfou');
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
        // console.log(request.body);
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
            return response.render('../views/pages/login');
        });
    });
    app.get('/login', function (request, response) {
        response.render('../views/pages/login');
    });
    app.post('/login', function (request, response) {
        var agencia = request.body.agencia;
        var conta = request.body.conta;
        var senha = request.body.senha;
        cliente_model_1.UserModel.find({ $and: [{ agencia: agencia }, { conta: conta }, { senha: senha }] }, function (err, usuarioLogado) {
            if (err) {
                return response.status(500).send("Erro ao conectar no banco de dados");
            }
            else {
                response.render("../views/pages/usuario", { usuario: usuarioLogado });
            }
            ;
        });
    });
    app.get('/transferencia/:id', function (request, response) {
        var id = request.body.id;
        cliente_model_1.UserModel.findById(({ _id: id }), function (err, usuarioLogado) {
            console.log(usuarioLogado);
            if (err)
                return response.status(500).send("Erro ao encontrar página");
            response.render("../views/pages/transferencia", { usuarioLogado: usuarioLogado });
        });
    });
    app.post('/transferencia', function (request, response) {
        var agenciaDest = request.body.agenciaDest;
        var contaDest = request.body.contaDest;
        var valor = parseFloat(request.body.valor);
        // const idOrigem = request.body.id;
        var agenciaOrigem = request.body.agenciaOrigem;
        var contaOrigem = request.body.contaOrigem;
        cliente_model_1.UserModel.findOne({ $and: [{ agencia: agenciaOrigem }, { conta: contaOrigem }] }, function (err, usuarioLogado) {
            if (err)
                return response.status(500).send("Erro ao buscar remetente");
            var idOrigem = usuarioLogado._id;
            // console.log(idOrigem);
            var saldoOrigem = usuarioLogado.saldo;
            // console.log(saldoOrigem);
            if (saldoOrigem < valor) {
                cliente_model_1.UserModel.findById(({ _id: idOrigem }), function (err, usuarioLogado) {
                    if (err)
                        return response.status(500).send("Erro ao encontrar página");
                    return response.render("../views/pages/transferenciaAnulada", { usuarioLogado: usuarioLogado });
                });
            }
            else {
                cliente_model_1.UserModel.findByIdAndUpdate(idOrigem, { saldo: saldoOrigem - valor }, { new: true }).then(function (usuarioLogado) {
                    var atributosUsuarioLogado = [usuarioLogado];
                    return response.render("../views/pages/usuario", { usuario: atributosUsuarioLogado });
                });
                cliente_model_1.UserModel.findOne({ $and: [{ agencia: agenciaDest }, { conta: contaDest }] }, function (err, destinatario) {
                    if (err) {
                        return response.status(500).send("Erro ao transferir");
                    }
                    else {
                        var idDest = destinatario._id;
                        var saldoDest = parseFloat(destinatario.saldo);
                        cliente_model_1.UserModel.findByIdAndUpdate(idDest, { saldo: saldoDest + valor }, { new: true });
                    }
                    var transferencia = new transacao_model_1.TransacaoModel({
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
                        console.log(transferencia);
                        return response.render('../views/pages/index');
                    });
                });
            }
        });
    });
    app.post('/extratoTransferencias', function (request, response) {
        var agenciaLogado = request.body.agencia;
        var contaLogado = request.body.conta;
        console.log(contaLogado);
        console.log(agenciaLogado);
        var consulta = transacao_model_1.TransacaoModel.find({ $or: [
                { $and: [{ agenciaOrigem: agenciaLogado }, { contaOrigem: contaLogado }] },
                { $and: [{ agenciaDestino: agenciaLogado }, { contaDestino: contaLogado }] }
            ] }, function (err, transferencia) {
            // console.log(transferencia);
            if (err)
                return response.status(500).send("Erro ao consultar transferências");
            response.render("../views/pages/extratoTransferencias", { transferencias: transferencia });
        });
    });
};
// let consulta = Livro.find(
//     { $or: [
//     {tituloLivro: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     {nomeAutor: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     {editora: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     {genero: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     // {isbn: termoPesquisado}
// ]}
