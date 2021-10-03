"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transferencia = exports.TransferenciaModel = void 0;
var mongoose_1 = require("mongoose");
var Transferencia = new mongoose_1.Schema({
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
});
exports.Transferencia = Transferencia;
exports.TransferenciaModel = (0, mongoose_1.model)('Transferencia', Transferencia);
