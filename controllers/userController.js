import user from "../models/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import speakeasy from 'speakeasy';
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import { JWT_EXPIRATION } from "../authetifi/default.js";
import { JWT_SECRET } from "../authetifi/default.js";
import { decrypt, encrypt } from "../utils/Crypto.js"


/***** class user  */
class Doctor{
  constructor(id,fullName, speciality,email,phone,certificate,assurance,about,address) {
    this.id = id;
    this.fullName = fullName;
    this.speciality = speciality;
    this.email = email;
    this.phone = phone;
    this.certificate=certificate;
    this.assurance=assurance;
    this.about=about;
    this.address=address;
  }
}
/***** end class user */
var token;

//sign up


export async function signUp(req, res) {
  
  if(req.file === undefined){
    console.log('file undefined')
  }
  const verifUser = await user.findOne({ email: req.body.email });
  if (verifUser) {
    console.log("user already exists");
    res.status(403).send({ message: "User already exists !" });
  } else {
    console.log("Success");
    var password=req.body.password;
    console.log('mot de passe : '+password);
    if (!password) {
       return res.status(400).send({ message: "Password is required" });
    }
    var nicknName=req.body.nickName;
    if (!nicknName) {
      return res.status(400).send({ message: "Nickname is required" });
    }
     var  fullName  = req.body.fullName;

    if (!fullName) {
      return res.status(400).send({ message: "fullName is required" });
    }

     var mdpEncrypted = encrypt(password);
     var fullEncrypted = encrypt(fullName);
     var nickEncrypted = encrypt(nicknName);
     var emailEncrypted=encrypt(req.body.email);
     var phoneEncrypted=encrypt(req.body.phone);
     var roleEncrypted=encrypt(req.body.role);//req.body.role
     var specialityEncrypted=encrypt(req.body.speciality);
     var addressEnc=encrypt(' ');
     var aboutEnc=encrypt(' ');
     var assuranceEnc = encrypt(' ');
     if(req.body.speciality != null || req.body.speciality != ''){
      specialityEncrypted=encrypt(req.body.speciality);
     }
     

     

    const newUser = new user({
      fullName: fullEncrypted,
      email: emailEncrypted,
      password: mdpEncrypted,
      phone: phoneEncrypted,
      role: roleEncrypted,
      nicknName: nickEncrypted,
      speciality: specialityEncrypted,
      address: addressEnc,
      about:aboutEnc,
      assurance:assuranceEnc,
      certificate: req.file ? `${req.protocol}://${req.get("host")}/images/diplomes/${req.file.filename}` : "",
    });
    try {
      await newUser.save();
      res.status(201).send({ message: "Success : You Are In", user: newUser });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Error while saving user" });
    }
  }
}

    

//signin

export async function login(req, res) {
  let emailEnc;
  const users=await user.find();
  users.forEach((element)=>{
    
    if(decrypt(element.email) === req.body.email){
      emailEnc=element.email;
    }
  });


  const userInfo = await user.findOne({ email:  emailEnc});
  console.log(userInfo);
  
  if (!userInfo || userInfo.status === 0 || !(decrypt(userInfo.password) === req.body.password)) {
    return res.status(404).json({
      error: 'Invalid credentials',
    })
  }


  if (!userInfo || userInfo.status === 0 || !(decrypt(userInfo.password) === req.body.password)) {
    console.log("hné 404");
      return res.status(404).json({
        error: 'Invalid credentials',
      })
    }

  if (userInfo.is2FAEnabled) {
    const isValid = speakeasy.totp.verify({
      secret: userInfo.secret,
      encoding: 'base32',
      token: req.body.otp,
      window: 1
    })

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid 2FA Token',
      })
    }
  }

  const payload = {
    _id: userInfo._id,
    fullname: decrypt(userInfo.fullName),
    email: decrypt(userInfo.email),
    phone: decrypt(userInfo.phone),
    role: decrypt(userInfo.role),
    address: decrypt(userInfo.address),
    speciality: decrypt(userInfo.speciality),
    certificate: userInfo.certificate,
  }

  const userToSend = {
    _id: userInfo._id,
    email: decrypt(userInfo.email),
    role: decrypt(userInfo.role),
    fullname: decrypt(userInfo.fullName),
  }



  // res.status(200).json({
  //   token: jwt.sign({ payload }, JWT_SECRET, {
  //     expiresIn: JWT_EXPIRATION,
  //   }),
  //   payload,

  // })

  res.status(200).json(userToSend);

  //res.status(200).send(userInfo.role);
}





export async function verif(req, res) {
  const { code, email } = req.body;
  const userInfo = await user.findOne({ email: req.body.email });

  if (!userInfo) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  if (!userInfo.secret) {
    return res.status(400).json({
      error: "2FA not enabled for this user",
    });
  }

  const verified = speakeasy.totp.verify({
    secret: userInfo.secret,
    encoding: "base32",
    token: code,
  });

  if (verified) {
    const payload = {
      _id: userInfo._id,
      fullname: userInfo.fullName,
      email: userInfo.email,
      phone: userInfo.phone,
      role: userInfo.role,
      address: userInfo.address,
      speciality: userInfo.speciality,
      certificate: userInfo.certificat,
    };

    res.status(200).json({
      // @ts-ignore
      token: jwt.sign({ payload }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      }),
      userInfo,
    });
  } else {
    res.status(400).json({
      error: "Invalid code",
    });
  }
}

export async function enable(req, res) {
  try {

    // Find the user
    const userInfo = await user.findOne({_id: req.body._id });

    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userInfo.is2FAEnabled) {
      return res.status(400).json({ error: '2FA already enabled for this user' });
    }

    // Generate a secret key for the user
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthURL = speakeasy.otpauthURL({
      secret: secret.base32,
      label: userInfo.email,
    });

    // Save the secret key to the user's document
    userInfo.secretKey = secret.base32;
    userInfo.is2FAEnabled = true;
    await userInfo.save();

    // Generate a QR code for the user to scan
    const qrCode = await qrcode.toDataURL(otpauthURL);

    res.status(200).json({
      qrCode,
      secret: secret.base32,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enable 2FA for this user' });
  }
}



//login google
export async function loginGoogle(req, res) {
  const { email, role, fullName, nickName} = req.body


  if (email == "") {
      res.status(403).send({ message: "error please provide an email" })
  } else {
      const userGoogle = await user.findOne({ email })
      if (userGoogle) {

          res.status(200).json({ userGoogle })
      } else {
          console.log("user does not exists, creating an account")

          const userGoogle = new user();
          userGoogle.fullName = fullName;
          userGoogle.nicknName = nickName;
          userGoogle.email = email;
          userGoogle.certificate = "";
          userGoogle.role = "";

          userGoogle.save()

          console.log("user logged in by Google", userGoogle)

          // token creation
          res.status(200).json({
              // @ts-ignore
              token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
                  expiresIn: JWT_EXPIRATION,
              }),
              userGoogle

          })
      }
  }
}



//edit login google
export async function editLoginGoogleUser(req, res) {

  const userGoogle = await user.findOneAndUpdate({ email: req.params.email },
      {
          nicknName : req.body.nickName,
          role: req.body.role
      }

  );

  // token creation
  res.status(200).json({
      // @ts-ignore
      token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
          expiresIn: JWT_EXPIRATION,
      }),
      userGoogle

  })
}

//get all users
export async function getAllUsers(req, res) {
  var users=[];
  const usr=await user.find();

  usr.forEach((element)=>{
    if(decrypt(element.role) === 'doctor'){
      users.push(new Doctor(element._id,decrypt(element.fullName), decrypt(element.speciality),decrypt(element.email),decrypt(element.phone),element.certificate));
    }
  });


  if (users) {
    console.log('users ============= '+JSON.stringify(users));
    res.status(200).json(users);
  } else {
    console.log('fera4 fera4 fera4');
    res.status(403).send({ message: "Fail : No Users" });
  }
}



export async function getUsersBySpeciality(req, res) {
  const speciality  = req.params.speciality.trim();
  console.log(`speciality: ${speciality}`);
  const users = await user.find({ role: "doctor", speciality });
  console.log(`users: ${users}`);
  if (users.length > 0) {
    res.status(200).json(users);
    
  } else {
    res
      .status(404)
      .send({ message: `No doctors found with speciality '${speciality}'` });
  }
}




export async function getUserByTherapy(req, res) {
  user
    .findOne({ therapy: req.params.id })
    .then((doc) => {
      res.status(200).json([doc]);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//delete one
export async function deleteOne(req, res) {
  const verifUser = await user.findById(req.body.id).remove();
  res.status(200).send({ verifUser, message: "Success: User Deleted" });
}

//delete all
export async function deleteAll(req, res, err) {
  user.deleteMany(function (err, user) {
    if (err) {
      return handleError(res, err);
    }

    return res.status(204).send({ message: "Fail : No element" });
  });
}
export async function forgotpassword(req, res) {
  const resetCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit reset code
  const email = req.body.email;

  try {
    const newuser = await user.findOne({ email });

    if (newuser) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      });
      sendPasswordResetEmail(email, token, resetCode);

      res.status(200).send({
        message: `Reset email has been sent to ${email}`,
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
}

export async function editPassword(req, res) {
  const { email, newPassword } = req.body;

  //salt = 10 random string to made the hash different 2^10
  const mdpEncrypted = await bcrypt.hash(req.body.password, 10);

  let newuser = await user.findOneAndUpdate(
    { email: email },
    {
      $set: {
        password: mdpEncrypted,
      },
    }
  );

  res.send({ newuser });
}

async function sendPasswordResetEmail(email, token, resetCode) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "testforprojet66@gmail.com",
      pass: "lkcilfntxuqzeiat",
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
      console.log("Server not ready");
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: "testforprojet66@gmail.com",
    to: email,
    subject: "Reset your password",
    html: `<h2>Use this as your reset code: ${resetCode}</h2><p>Enter this code in the app to reset your password.</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}





export async function changeUserPhoto(req, res) {
  
  const found = await user.findOne({ _email: req.params.email })
  if (!found) return res.status(404).json({ error: 'Account not found !' })

  const filename = found?.image

  if (filename) {
      await deletImage(filename, async (err) => {
          if (err) {
              console.error(err)
              return res
                  .status(500)
                  .json({ error: 'Error updating your photo.' })
          }
      })
  }
  return updatePhoto(req, res)
}





export async function updatePhoto(req, res) {
  console.log(req.file)
  const updateResult = await user.updateOne(
      { _id: req.params.id },
      {
          photo: `${req.file.filename}`,
      },
      { upsert: false }
  )
  if (updateResult.modifiedCount === 0)
      return res.status(400).json({ error: 'Error updating your photo.' })
  res.status(200).json({ message: 'Photo updated successfully.' })
}


//edit doctor details
export async function editDoctorDetails(req, res) {
  console.log('email id edit doctor === '+req.params.email);
  const userdoctor = await user.findOneAndUpdate({ _id: req.params.email },
      {
          speciality : encrypt( req.body.speciality),
          address: encrypt( req.body.address),
          about: encrypt( req.body.about),
          assurance: encrypt( req.body.assurance),
              },
      { upsert: false }

  );
  res.status(200).send({ message: "Details success", userdoctor: userdoctor });

  
}

//edit login google doctor
export async function editLoginGoogleDoctor(req, res) {

  const userGoogle = await user.findOneAndUpdate({ email: req.params.email },
      {
          role: req.body.role,
          certificate: `${req.protocol}://${req.get('host')}/image/${req.file.filename}`

      }

  );

  // token creation
  res.status(200).json({
      // @ts-ignore
      token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
          expiresIn: JWT_EXPIRATION,
      }),
      userGoogle

  })
}



export async function getUser(req,res){
  console.log('get user userController = '+ req.params.id );
  var idUser=req.params.id.trim();
  const element = await user.findOne({  _id : idUser});

  const usr = new Doctor(element._id,decrypt(element.fullName), decrypt(element.speciality),decrypt(element.email),decrypt(element.phone),element.certificate,decrypt(element.assurance),decrypt(element.about),decrypt(element.address))

  console.log('getUser 9:57   =  '+JSON.stringify(usr));
  if (usr) {
      res.status(200).json(usr);
  } else {
      res.status(403).send({ message: "fail" });
  }
}


