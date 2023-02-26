import express from 'express';
import mongoose from 'mongoose';



const app = express();
const port = process.env.PORT || 9090;
const databaseName = 'dearSelf';

//mongoose.set('debug', true);
mongoose.Promise = global.Promise;



//DATABASE
mongoose
  .connect(`mongodb://localhost:27017/${databaseName}`)
  .then(() => { // then ; une fois connecté afficher un msg de réussite sur la console
    console.log(`Connected to ${databaseName}`);
  })
  .catch(err => { // si erreur , affiche erreur sur console
    console.log(err);
  });


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });