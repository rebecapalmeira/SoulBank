import { Schema, model } from 'mongoose';

interface User{
    nome: string,   
    email: string,
    senha: string,
    cpf: string,
    contato: string,
    agencia: string,
    conta: string,
    saldo: number
}

const Usuario = new Schema<User>({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    cpf: {
        type: String,
        required: true
    },
    contato: {
        type: String,
        required: true
    },
    agencia: {
        type: String,
        required: true
    },
    conta: {
        type: String,
        required: true
    },
    saldo: {
        type: Number,
        required: true
    }
})

export const UserModel = model<User>('User', Usuario);
export {User};

