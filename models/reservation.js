import mongoose from 'mongoose'
const { Schema, model } = mongoose

export default model(
    'reservation',
    new Schema(
        {
            patient: { type: Schema.Types.ObjectId, ref: 'user' },

            therapy: { type: Schema.Types.ObjectId, ref: 'therapy' },

            status: {
                type: String,
                default: 'En attente',
            },
            date: {
                type: Date,
                default: Date.now(),
            },
        },
        {
            timestamp: true,
        }
    )
)
