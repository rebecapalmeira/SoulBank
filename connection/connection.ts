import mongoose from 'mongoose';

export = ()=>{ 
    mongoose.Promise = global.Promise;

    mongoose.connect('mongodb+srv://rebeca@cluster0.9jadt.mongodb.net/bancoSoul?retryWrites=true&w=majority').then(()=>{
        console.log('Teu banco conectou, mané');
    }).catch((error: Error)=>{
        console.log(`Deu ruim, neguin: ${error}`);
    });
};
