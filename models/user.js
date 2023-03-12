import mongoose from 'mongoose';
import speakeasy from 'speakeasy';

const { Schema, model } = mongoose;
const UserSchema = new Schema({

    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },

    phone: {
        type: String
    },
    nicknName: {
        type: String,
    },
    role: {
        type: String
    },
    //doctor's speciality
    speciality: {
        type: String
    },
    address: {
        type: String
    },
    photo: {
        type: String
    },
    certificate: {
        type: String
    },
    secretKey: {
        type: String
    },
    is2FAEnabled: {
        type: Boolean,
        default: false
    }
  
},
    {
        timestamp: true
    }
);
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.secretKey = speakeasy.generateSecret({length: 20}).base32;
    next();
  });
export default mongoose.model('user', UserSchema);