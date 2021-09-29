import { Request, Response, Router } from 'express';
import { textChangeRangeIsUnchanged } from 'typescript';
import { UserModel } from '../models/cliente-model';
import { User } from '../models/cliente-model';
import { Transacao, TransacaoModel } from '../models/transacao-model';

interface reqRes{
    req: Request, 
    res: Response,
}

export = (app: Router) =>{

    app.get<reqRes>('/', (request, response)=>{
        response.render('../views/pages/index')
    });

    app.get<reqRes>('/teste', (request, response)=>{
        response.send('teste funfou')
    })

    app.get<reqRes>('/teste', (request, response)=>{
        response.send('teste funfou')
    })

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

    app.get<reqRes>('/login', function (request, response) {
        response.render('../views/pages/login');
    });

    app.post<reqRes>('/login', (request, response) => {
        let agencia = request.body.agencia;
        let conta = request.body.conta;
        let senha = request.body.senha;
    
        UserModel.find({ $and: [{ agencia: agencia }, { conta: conta }, { senha: senha }] }, (err, usuarioLogado) => {
            if (err) {
                return response.status(500).send("Erro ao conectar no banco de dados");
    
            } else { 
                response.render("../views/pages/usuario", {usuario:usuarioLogado});
                };
            }
        )}
    )

    app.get<reqRes>('/transferencia/:id', function (request, response) {
        let id = request.body.id;
        UserModel.findById(({ _id: id }), (err:any, usuarioLogado:any) =>{
            console.log(usuarioLogado)
            if (err)
                return response.status(500).send("Erro ao encontrar página");
            
            response.render("../views/pages/transferencia", {usuarioLogado:usuarioLogado})
        })
    });

    app.post<reqRes>('/transferencia', (request, response) => {

        let agenciaDest = request.body.agenciaDest;
        let contaDest = request.body.contaDest;

        let valor = parseFloat(request.body.valor);
        
        // const idOrigem = request.body.id;
        let agenciaOrigem = request.body.agenciaOrigem;
        let contaOrigem = request.body.contaOrigem;

        UserModel.findOne({ $and: [{ agencia: agenciaOrigem }, { conta: contaOrigem }] }, (err:any, usuarioLogado:any) => {
            if(err) 
                return response.status(500).send("Erro ao buscar remetente");

            const idOrigem = usuarioLogado._id;
            // console.log(idOrigem);
            let saldoOrigem = usuarioLogado.saldo;
            // console.log(saldoOrigem);

            if (saldoOrigem < valor) {
                UserModel.findById(({ _id: idOrigem }), (err:any, usuarioLogado:any) =>{
                    if (err)
                        return response.status(500).send("Erro ao encontrar página");
                    
                    return response.render("../views/pages/transferenciaAnulada", {usuarioLogado:usuarioLogado})
                })
                
            } else {
                UserModel.findByIdAndUpdate(idOrigem, {saldo: saldoOrigem - valor}, {new: true}).then((usuarioLogado: User) => {
                        let atributosUsuarioLogado: User[] = [usuarioLogado];
                        return response.render("../views/pages/usuario", {usuario:atributosUsuarioLogado})
                    }
                )
                 
                UserModel.findOne({ $and: [{ agencia: agenciaDest }, { conta: contaDest }] }, (err:any, destinatario:any) => {
                    if(err) {
                        return response.status(500).send("Erro ao transferir");
            
                    } else { 
                        const idDest = destinatario._id;
                        let saldoDest = parseFloat(destinatario.saldo);
        
                        UserModel.findByIdAndUpdate(idDest, {saldo: saldoDest + valor}, {new: true}) 
                                                       
                        }

                        var transferencia = new TransacaoModel ({
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

                            console.log(transferencia);
                            return response.render('../views/pages/index');
                        });
        
                    }                     
                )
        
            }
              
        })       
    })


    app.post<reqRes>('/extratoTransferencias', function (request, response) {
        let agenciaLogado = request.body.agencia;
        let contaLogado = request.body.conta;
        console.log(contaLogado);
        console.log(agenciaLogado);
        let consulta = TransacaoModel.find({$or: [
            {$and: [{ agenciaOrigem: agenciaLogado }, { contaOrigem: contaLogado }]},
            {$and: [{ agenciaDestino: agenciaLogado }, { contaDestino: contaLogado }]}
            ]},
             (err:any, transferencia:any) => {
            // console.log(transferencia);
            if (err)
                return response.status(500).send("Erro ao consultar transferências");
            response.render("../views/pages/extratoTransferencias", {transferencias: transferencia}); 
        })
    })
}





// let consulta = Livro.find(
//     { $or: [
//     {tituloLivro: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     {nomeAutor: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     {editora: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     {genero: {$regex: new RegExp('.*' + termoPesquisado + '.*', 'i')}},
//     // {isbn: termoPesquisado}
// ]}