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
            return response.render('cadastrarUsuario');
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
        let id = request.params;
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

            const idOrigem = usuarioLogado[0]._id;
            // console.log(idOrigem);
            let saldoOrigem = usuarioLogado[0].saldo;
            // console.log(saldoOrigem);

            if (saldoOrigem < valor) {
                UserModel.findById(({ _id: idOrigem }), (err:any, usuarioLogado:any) =>{
                    if (err)
                        return response.status(500).send("Erro ao encontrar página");
                    
                    return response.render("../views/pages/transferenciaAnulada", {usuarioLogado:usuarioLogado})
                })
                
            } else {
                UserModel.findByIdAndUpdate(idOrigem, {saldo: saldoOrigem - valor}, {new: true}).then((usuarioLogado: User) => {
                        let listaUsuarioLogado: User[] = [usuarioLogado];
                        return response.render("../views/pages/usuario", {usuario:listaUsuarioLogado})
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
                    }                     
                )

                // let transacao = {tipo: 'transferencia',
                //                 data: now(),
                //                 agenciaOrigem = agenciaOrigem,
                //                 contaOrigem = contaOrigem,
                //                 cpfOrigem = usuarioLogado[0].cpf,
                //                 agenciaDestino = agenciaDest,
                //                 contaDestino = contaDest,
                //                 cpfDestino = destinatario.cpf,
                //                 valor = valor
                // }

                
                // TransacaoModel.save({
                //     transacao
                // })
        
            }
              
        })       
    })
}

    