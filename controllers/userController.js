import user from "../models/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import speakeasy from 'speakeasy';
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import { JWT_EXPIRATION } from "../authetifi/default.js";
import { JWT_SECRET } from "../authetifi/default.js";

var token;

//sign up


export async function signUp(req, res) {
  const verifUser = await user.findOne({ email: req.body.email });
  if (verifUser) {
    console.log("user already exists");
    res.status(403).send({ message: "User already exists !" });
  } else {
    console.log("Success");
    const { password } = req.body;

    if (!password) {
       return res.status(400).send({ message: "Password is required" });
    }
    // const { nicknName } = req.body;

    // if (!nicknName) {
    //   return res.status(400).send({ message: "Nickname is required" });
    // }
    // const { fullName } = req.body;

    // if (!fullName) {
    //   return res.status(400).send({ message: "fullName is required" });
    // }


     const salt = await bcrypt.genSalt(10);
     const mdpEncrypted = await bcrypt.hash(req.body.password, salt);
    // const fullEncrypted = await bcrypt.hash(req.body.fullName, salt);
    // const nickEncrypted = await bcrypt.hash(req.body.nicknName, salt);



    const newUser = new user({
      fullName: req.body.fullName,
      email: req.body.email,
      password: mdpEncrypted,
      phone: req.body.phone,
      role: req.body.role,
      nicknName: req.body.nicknName,
      speciality: req.body.speciality,
      address: req.body.address,
      certificate: req.file
        ? `${req.protocol}://${req.get("host")}/image/${req.file.filename}`
        : "",
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
  const userInfo = await user.findOne({ email: req.body.email })

  if (!userInfo || userInfo.status === 0 || !bcrypt.compareSync(req.body.password, userInfo.password)) {
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

    // if (!isValid) {
    //   return res.status(400).json({
    //     error: 'Invalid 2FA Token',
    //   })
    // }
  }

  const payload = {
    _id: userInfo._id,
    fullname: userInfo.fullName,
    email: userInfo.email,
    phone: userInfo.phone,
    role: userInfo.role,
    address: userInfo.address,
    speciality: userInfo.speciality,
    certificate: userInfo.certificat,
  }

  res.status(200).json({
    token: jwt.sign({ payload }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    }),
    userInfo: userInfo,
  })
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
  const { email, role, fullName } = req.body;

  if (email == "") {
    res.status(403).send({ message: "error please provide an email" });
  } else {
    const userGoogle = await user.findOne({ email });
    if (userGoogle) {
      res.status(200).json({ userGoogle });
    } else {
      console.log("user does not exists, creating an account");

      const userGoogle = new user();
      userGoogle.fullName = fullName;
      userGoogle.email = email;
      userGoogle.certificate = "";
      userGoogle.role = role;

      userGoogle.save();

      console.log("userhere", userGoogle);

      // token creation
      res.status(200).json({
        // @ts-ignore
        token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
          expiresIn: JWT_EXPIRATION,
        }),
        userGoogle,
      });
    }
  }
}
//edit login google
export async function editLoginGoogle(req, res) {
  const userGoogle = await user.findOneAndUpdate(
    { _id: req.params.id },
    {
      fullName: req.body.fullName,
      email: req.body.email,
      role: req.body.role,
      certificate: `${req.protocol}://${req.get("host")}/image/${
        req.file.filename
      }`,
    }
  );

  // token creation
  res.status(200).json({
    // @ts-ignore
    token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    }),
    userGoogle,
  });
}

//get all users
export async function getAllUsers(req, res) {
  const users = await user.find({ role: "doctor" });

  if (users) {
    //res.status(200).send({ users, message: "Success: All Users" });

    res.status(200).json(users);
  } else {
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
