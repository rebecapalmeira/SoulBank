import { Schema, model } from 'mongoose';

interface Transferencia {
    tipo: string,   
    // data: Date,
    agenciaOrigem: string,
    contaOrigem: string,
    nomeOrigem: string,
    agenciaDestino: string,
    contaDestino: string,
    nomeDestino: string,
    valor: number
}

const Transferencia = new Schema<Transferencia>({
    tipo: {
        type: String,
        required: true
    },
    // data: {
    //     type: Date,
    //     required: true
    // },
    agenciaOrigem: {
        type: String,
        required: true
    },
    contaOrigem: {
        type: String,
        required: true
    },
    nomeOrigem: {
        type: String,
        required: true
    },
    agenciaDestino: {
        type: String,
        required: true
    },
    contaDestino: {
        type: String,
        required: true
    },
    nomeDestino: {
        type: String,
        required: true
    },
    valor: {
        type: Number,
        required: true
    }
})

export const TransferenciaModel = model<Transferencia>('Transferencia', Transferencia);
export {Transferencia};

