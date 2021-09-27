//importando bibliotecas
import express from 'express';
const consign = require('consign');

const app = express();

//definindo porta / url
const port = 3000;

app.set("view engine", "ejs"); //pesso para usar o motor de visualização do ejs
app.set("views", `${__dirname}/views`);// minhas visualizações 

//permitindo que os dados transitem entre as paginas em formato json
app.use(express.urlencoded()); //ira permitir que os dados passem de uma pagina para outra
app.use(express.json()); //os dados serao enviados em formato json pois ele é mais leve

app.use(express.static("public"));// permissão para acessar a pasta public
//para cadastro de longin

consign().include('connection').include('routes').into(app);

//execução
app.listen(port, ()=>{
    console.log(`funfs na porta ${port}`);
});