import express from 'express';
import mongoose from 'mongoose';
import { notFoundError, errorHandler } from './middelwares/error-handler.js';
import morgan from 'morgan';
import cors from 'cors';

import userRoute from './routes/userRoute.js';


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
app.use(cors());
app.use(morgan("dev"));






app.use((req, res, next) => {
  console.log("middleware just run !");
  next();
});
app.use("/gse", (req, res, next) => {
  console.log("Middleware just ran on a gse route !");
  next();
});


app.use('/user', userRoute);


app.use('/image', express.static('public/images'));
app.use(notFoundError);
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });