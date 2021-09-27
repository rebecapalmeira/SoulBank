"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var mongoose_1 = __importDefault(require("mongoose"));
module.exports = function () {
    mongoose_1.default.Promise = global.Promise;
    mongoose_1.default.connect('mongodb+srv://rebeca_palmeira:rebeca_palmeira@cluster0.9jadt.mongodb.net/bancoSoul?retryWrites=true&w=majority').then(function () {
        console.log('Conexao com o MongoDb realizada com sucesso');
    }).catch(function (error) {
        console.log("Conex\u00E3o com o MongoDB falhou: " + error);
    });
};
