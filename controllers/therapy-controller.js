
import { validationResult } from 'express-validator';
import isEmail from 'validator/lib/isEmail.js';
import therapy from '../models/therapy.js';
import user from '../models/user.js';



export function getAll(req, res) {
    therapy
        .find({})
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });

}
export function addOnce(req, res) {
    const id_user = req.params.idUser;
    console.log("id  ========= ",id_user);
    if (!id_user) {
        return res.status(401).json({ error: "User ID is missing." });
    }
    if (!validationResult(req).isEmpty()) {
        return res.status(402).json({ errors: validationResult(req).array() });
    }
    const capacity = req.body.capacity;
    if (isNaN(capacity)) {
    return res.status(403).json({ error: "Capacity must be a number." });
    }

   // const us=user.findById(id_user);
    
    console.log(req.file)
        therapy
            .create({
                titre: req.body.titre,
                date: req.body.date,
                address: req.body.address,
                capacity: req.body.capacity,
                dispo: req.body.dispo,
                description : req.body.description,
                user : id_user.trim(),
                image: `${req.protocol}://${req.get('host')}/image/${req.file.filename}`
                
            })
            .then(newTherapy => {
                res.status(201).send({ therapy: newTherapy });
            })
            .catch(err => {
                console.error(err);
                console.log(image)
                res.status(500).json({ error: err });
            });
            
//     }).catch(err => res.status(404).json({ error: "user not found!" }))
// }

        }

export function getOnce(req, res) {
    console.log(req.params.idUser)
    therapy
        .findOne({ user: req.params.idUser })
        .then(doc => {
            res.status(200).json([doc]);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}
export function putAll(req, res) {
    therapy
        .updateMany({}, { "dispo": true })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}



export function patchOnce(req, res) {
    therapy
        .findOneAndupdate({ "titre": req.params.name }, { "dispo": false })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

export function deleteOnce(req, res) {
    therapy
        .findById( req.params.id ).deleteOne()
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}
export async function updateT(req, res) {

  
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    }
   {

        therapy
            .create({
                titre: req.body.titre,
                date: req.body.date,
                address: req.body.address,
               
             
              
                
            })
            .then(newTherapy => {
                res.status(201).send({ therapy: newTherapy });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: err });
            });
    }


};