"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//importando bibliotecas
var express_1 = __importDefault(require("express"));
var consign = require('consign');
var app = (0, express_1.default)();
//definindo porta / url
var port = 3000;
app.set("view engine", "ejs"); //pesso para usar o motor de visualização do ejs
app.set("views", __dirname + "/views"); // minhas visualizações 
//permitindo que os dados transitem entre as paginas em formato json
app.use(express_1.default.urlencoded()); //ira permitir que os dados passem de uma pagina para outra
app.use(express_1.default.json()); //os dados serao enviados em formato json pois ele é mais leve
app.use(express_1.default.static("public")); // permissão para acessar a pasta public
//para cadastro de longin
consign().include('connection').include('routes').into(app);
//execução
app.listen(port, function () {
    console.log("funfs na porta " + port);
});
