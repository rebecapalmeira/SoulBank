import { Request, Response, Router } from 'express';
import { textChangeRangeIsUnchanged } from 'typescript';
import { UserModel } from '../models/cliente-model';
import { User } from '../models/cliente-model';
import { Transferencia, TransferenciaModel } from '../models/transferencia-model';

interface reqRes{
    req: Request, 
    res: Response,
}

export = (app: Router) =>{

    app.get<reqRes>('/', (request, response)=>{
        response.render('../views/pages/index')
    });

    app.get<reqRes>('/cadastrarUsuario', function (request, response) {
        response.render('../views/pages/cadastrarUsuario');
    });

    app.post<reqRes>("/cadastrarUsuario", (request, response) => {
        var usuario = new UserModel({
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
            return response.render('../views/pages/login', {mensagem: null});
        });
    });

    app.get<reqRes>('/login', function (request, response) {
        response.render('../views/pages/login', {mensagem: null});
    });

    app.post<reqRes>('/login', (request, response) => {
        let agencia = request.body.agencia;
        let conta = request.body.conta;
        let senha = request.body.senha;
    
        UserModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }, { senha: senha }] }, (err:any, usuarioLogado:any) => {
            if (err) {
                return response.status(500).send("Erro ao conectar no banco de dados");
    
            } else if (usuarioLogado === null) {
                return response.render("../views/pages/login", {mensagem:"Cliente não encontrado. Certifique-se de ter informado os dados corretos."})

            } else { 
                response.render("../views/pages/usuario", {usuarioLogado:usuarioLogado});
            }
        })
    });

    app.get<reqRes>('/usuario', (request, response) => {
        let agencia = request.body.agencia;
        let conta = request.body.conta;
    
        UserModel.findOne({ $and: [{ agencia: agencia }, { conta: conta }] }, (err:any, usuarioLogado:any) => {
            if (err) {
                return response.status(500).send("Erro ao conectar no banco de dados");
    
            } else if (usuarioLogado === null) {
                return response.render("../views/pages/login", {mensagem:"Cliente não encontrado. Certifique-se de ter informado os dados corretos."})
            } else { 
                response.render("../views/pages/usuario", {usuarioLogado:usuarioLogado});
            }
        })
    });

    app.get<reqRes>('/usuario/:id', (request, response) => {
        let idLogado = request.params.id;

        UserModel.findById(({ _id: idLogado }), (err:any, usuarioLogado:any) =>{
            if (err)
                return response.status(500).send("Erro ao encontrar cliente.");
            
            response.render("../views/pages/usuario", {usuarioLogado:usuarioLogado})
        })
    });

    
    app.get<reqRes>('/transferencia/:id', function (request, response) {
        let id = request.params.id;
        UserModel.findById(({ _id: id }), (err:any, usuarioLogado:any) =>{
            if (err)
                return response.status(500).send("Erro ao encontrar cliente.");
            
            response.render("../views/pages/transferencia", {usuarioLogado:usuarioLogado, mensagem: null})
        })
    });

    app.post<reqRes>('/transferencia', (request, response) => {

        let agenciaDest = request.body.agenciaDest;
        let contaDest = request.body.contaDest;

        let valor = parseFloat(request.body.valor);
        
        let agenciaOrigem = request.body.agenciaOrigem;
        let contaOrigem = request.body.contaOrigem;

        UserModel.findOne({ $and: [{ agencia: agenciaOrigem }, { conta: contaOrigem }] }, (err:any, usuarioLogado:any) => {
            if(err) 
                return response.status(500).send("Erro ao buscar cliente da conta de origem");

            if (agenciaDest === "" || agenciaDest === null || contaDest === "" || contaDest === null) {            
                return response.render("../views/pages/transferencia", {usuarioLogado:usuarioLogado, mensagem:'Informações insuficientes. Campos de Agência e Conta de destino não podem ficar vazios.'})
            }

            const idOrigem = usuarioLogado._id;
            let saldoOrigem = usuarioLogado.saldo;


            if (saldoOrigem < valor) {
                return response.render("../views/pages/transferencia", {usuarioLogado:usuarioLogado, mensagem:'Saldo Insuficiente. Para concluir a transferência, informe um valor menor ou igual ao saldo em conta'})
                
            } else {
                UserModel.findByIdAndUpdate(idOrigem, {saldo: saldoOrigem - valor}, {new: true}).then((usuarioLogado: User) => {
                        
                    UserModel.findOne({ $and: [{ agencia: agenciaDest }, { conta: contaDest }] }, (err:any, destinatario:any) => {
                        if(err) {
                            return response.status(500).send("Erro ao encontrar o cliente de destino.");
                
                        } else { 
                            if (destinatario === null) {            
                                return response.render("../views/pages/transferencia", {usuarioLogado:usuarioLogado, mensagem:'Conta/Agência de Destino não encontrados'})
                            }

                            const idDest = destinatario._id;
                            let saldoDest = destinatario.saldo;
            
                            UserModel.findByIdAndUpdate(idDest, {saldo: saldoDest + valor}, {new: true}).then((destinatario:User) => {
                                var transferencia = new TransferenciaModel ({
                                    tipo: 'transferencia',
                                    agenciaOrigem: agenciaOrigem,
                                    contaOrigem: contaOrigem,
                                    nomeOrigem: usuarioLogado.nome,
                                    agenciaDestino: agenciaDest,
                                    contaDestino: contaDest,
                                    nomeDestino: destinatario.nome,
                                    valor: valor
                                })
                                
                                transferencia.save(function (error) {
                                    if (error)
                                        return response.status(500).send("Erro ao salvar transação: " + error);
        
                                    return response.render("../views/pages/usuario", {usuarioLogado:usuarioLogado})
                                });
                            }) 
                        }            
                    })                   
                })        
            }              
        })       
    })

    app.post<reqRes>('/extratoTransferencias/:id', function (request, response) {
        let agenciaLogado = request.body.agencia;
        let contaLogado = request.body.conta;
        let usuarioLogado = request.body.id;


        UserModel.findById(({ _id: usuarioLogado }), (err:any, usuarioLogado:any) =>{
            if (err) {
                return response.status(500).send("Erro ao encontrar cliente e as transferências associadas ao cliente.");
            } else {
                TransferenciaModel.find({$or: [
                    {$and: [{ agenciaOrigem: agenciaLogado }, { contaOrigem: contaLogado }]},
                    {$and: [{ agenciaDestino: agenciaLogado }, { contaDestino: contaLogado }]}
                    ]} , (err:any, transferencias:any) => { 
                        if (err) {
                            return response.status(500).send("Erro ao consultar transferências");
                        }
                        let transferenciasEnviadas = transferencias.filter(transferencia => { if (transferencia.agenciaOrigem === agenciaLogado) return transferencia});
                        let transferenciasRecebidas = transferencias.filter(transferencia => { if (transferencia.agenciaDestino === agenciaLogado) return transferencia});

                                                                 
                        return response.render("../views/pages/extratoTransferencias", {transferenciasEnviadas: transferenciasEnviadas, transferenciasRecebidas: transferenciasRecebidas, usuarioLogado:usuarioLogado});
                    }                    
                )
            }         
        })
    })
}
