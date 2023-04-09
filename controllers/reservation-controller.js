import reservation from '../models/reservation.js'
import user from '../models/user.js'
import therapy from '../models/therapy.js'

export function sendRequest(req, res) {
    const invi = new reservation({
        patient: req.body.patient_id,
        doctor: req.body.doctor_id,
        therapy: req.body.therapy_id,
    })

    invi.save()
        .then((doc) => {
            res.status(201).json(doc)
        })
        .catch((err) => {
            res.status(400).json(err)
        })
}

export function acceptRequest(req, res) {
    const inv = reservation.findOne({ _id: req.body.id }) 
    if (inv) {
        inv.updateOne({ status: 'accepter' })
            .then((doc) => {
                res.status(200).json(doc)
            })
            .catch((err) => {
                res.status(400).json(err)
            })
    } else {
        res.status(404).json({ error: 'reservation not found !' })
    }
}

//if user refuse invi then delete invi
export function refuseRequest(req, res) {
    reservation
        .findOneAndDelete({ _id: req.body.id })
        .then((doc) => {
            res.status(200).json(doc)
        })
        .catch((err) => {
            res.status(400).json(err)
        })
}

/*export async function getInvitationsAttente(req,res){
    const invs =await invitation.find({destinataire:req.params.currentUser, status:"En attente"}).populate({ 
        path: 'destinataire', 
      }).populate({ 
        path: 'expediteur', 
      })
    if(invs){
        res.status(200).json(invs)
    }else{
        res.status(400).json({err:"Probléme !"})
    }
}*/
export async function getAll(req, res) {
    console.log(req)
    return res
        .status(200)
        .json(
            await reservation
                .find({ doctor: req.query.doctor_id })
                .populate('patient')
                .populate('therapy')
        )
}
export function deleteOnce(req, res) {
    reservation
        .findById(req.params.id)
        .deleteOne()
        .then((doc) => {
            res.status(200).json(doc)
        })
        .catch((err) => {
            res.status(500).json({ error: err })
        })
}
