"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transacao = exports.TransacaoModel = void 0;
var mongoose_1 = require("mongoose");
var Transacao = new mongoose_1.Schema({
    tipo: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    agenciaOrigem: {
        type: String,
        required: true
    },
    contaOrigem: {
        type: String,
        required: true
    },
    cpfOrigem: {
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
    cpfDestino: {
        type: String,
        required: true
    },
    valor: {
        type: Number,
        required: true
    }
});
exports.Transacao = Transacao;
exports.TransacaoModel = (0, mongoose_1.model)('Transacao', Transacao);
