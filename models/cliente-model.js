"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
var mongoose_1 = require("mongoose");
var Usuario = new mongoose_1.Schema({
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
});
exports.UserModel = (0, mongoose_1.model)('User', Usuario);
