import user from '../models/user.js'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { JWT_EXPIRATION } from '../authetifi/default.js'
import { JWT_SECRET } from '../authetifi/default.js'

var token

//sign up
export async function signUp(req, res) {
    const verifUser = await user.findOne({ email: req.body.email })
    if (verifUser) {
        console.log('user already exists')
        res.status(403).send({ message: 'User already exists !' })
    } else {
        console.log('Success')

        //salt = 10 random string to made the hash different 2^10
        const mdpEncrypted = await bcrypt.hash(req.body.password, 10)
        const newUser = new user()

        newUser.fullName = req.body.fullName
        newUser.email = req.body.email
        newUser.password = mdpEncrypted
        newUser.phone = req.body.phone
        newUser.role = req.body.role
        newUser.nicknName = req.body.nicknName

        newUser.speciality = req.body.speciality
        newUser.address = req.body.address
        if (req.file) {
            newUser.certificate = `${req.protocol}://${req.get('host')}/image/${
                req.file.filename
            }`
        } else {
            newUser.certificate = ''
        }
        newUser.save()

        res.status(201).send({ message: 'Success : You Are In', user: newUser })
    }
}

//signin

export async function login(req, res) {
    const userInfo = await user.findOne({ email: req.body.email })

    if (
        !userInfo ||
        userInfo.status === 0 ||
        !bcrypt.compareSync(req.body.password, userInfo.password)
    )
        return res.status(404).json({
            error: 'Invalid incredentials',
        })

    const payload = {
        _id: user._id,
        fullname: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        speciality: user.speciality,
        certificate: user.certificat,
    }

    res.status(200).json({
        // @ts-ignore
        token: jwt.sign({ payload }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION,
        }),
        userInfo,
    })
}
//login google
export async function loginGoogle(req, res) {
    const { email, role, fullName } = req.body

    if (email == '') {
        res.status(403).send({ message: 'error please provide an email' })
    } else {
        const userGoogle = await user.findOne({ email })
        if (userGoogle) {
            res.status(200).json({ userGoogle })
        } else {
            console.log('user does not exists, creating an account')

            const userGoogle = new user()
            userGoogle.fullName = fullName
            userGoogle.email = email
            userGoogle.certificate = ''
            userGoogle.role = role

            userGoogle.save()

            console.log('userhere', userGoogle)

            // token creation
            res.status(200).json({
                // @ts-ignore
                token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
                    expiresIn: JWT_EXPIRATION,
                }),
                userGoogle,
            })
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
            certificate: `${req.protocol}://${req.get('host')}/image/${
                req.file.filename
            }`,
        }
    )

    // token creation
    res.status(200).json({
        // @ts-ignore
        token: jwt.sign({ userGoogle: userGoogle }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION,
        }),
        userGoogle,
    })
}

//get all users
export async function getAllUsers(req, res) {
    const users = await user.find()

    if (users) {
        res.status(200).send({ users, message: 'Success: All Users' })
    } else {
        res.status(403).send({ message: 'Fail : No Users' })
    }
}
export async function getUserByTherapy(req, res) {
    user.findOne({ therapy: req.params.id })
        .then((doc) => {
            res.status(200).json([doc])
        })
        .catch((err) => {
            res.status(500).json({ error: err })
        })
}

//delete one
export async function deleteOne(req, res) {
    const verifUser = await user.findById(req.body.id).remove()
    res.status(200).send({ verifUser, message: 'Success: User Deleted' })
}

//delete all
export async function deleteAll(req, res, err) {
    user.deleteMany(function (err, user) {
        if (err) {
            return handleError(res, err)
        }

        return res.status(204).send({ message: 'Fail : No element' })
    })
}
export async function forgotPassword(req, res) {
    const resetCode = req.body.resetCode
    const newuser = await user.findOne({ email: req.body.email })

    if (newuser) {
        token = jwt.sign({ id: newuser._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION,
        })
        sendPasswordResetEmail(req.body.email, token, resetCode)

        res.status(200).send({
            message: 'Reset email has been sent to ' + newuser.email,
        })
    } else {
        res.status(404).send({ message: 'User not found' })
    }
}

async function sendPasswordResetEmail(email, token, resetCode) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'testforprojet66@gmail.com',
            pass: 'lkcilfntxuqzeiat',
        },
    })

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error)
            console.log('Server not ready')
        } else {
            console.log('Server is ready to take our messages')
        }
    })

    const mailOptions = {
        from: 'testforprojet66@gmail.com',
        to: email,
        subject: 'Reset your password',
        html: '<h2>Use this as your reset code : ' + resetCode + '</h2>',
    }
    console.log('redsss', resetCode)

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}

export async function editPassword(req, res) {
    const { email, newPassword } = req.body

    //salt = 10 random string to made the hash different 2^10
    const mdpEncrypted = await bcrypt.hash(req.body.password, 10)

    let newuser = await user.findOneAndUpdate(
        { email: email },
        {
            $set: {
                password: mdpEncrypted,
            },
        }
    )

    res.send({ newuser })
}
export async function resendConfirmation(req, res) {
    const newuser = await user.findOne({ email: req.body.email })

    if (newuser) {
        // token creation

        const token = jwt.sign({ id: newuser._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION,
        })
        sendConfirmationEmail(req.body.email, token)
        console.log('toeeee', token)

        res.status(200).send({
            message: 'Confirmation email has been sent to ' + newuser.email,
        })
    } else {
        res.status(404).send({ message: 'User not found' })
    }
}

async function sendConfirmationEmail(email, token) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'testforprojet66@gmail.com',
            pass: 'lkcilfntxuqzeiat',
        },
    })

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error)
            console.log('Server not ready')
        } else {
            console.log('Server is ready to take our messages')
        }
    })

    const urlDeConfirmation = 'http://localhost:7001/user/confirmation/' + token

    const mailOptions = {
        from: 'testforprojet66@gmail.com',
        to: email,
        subject: 'Confirm your email',
        html:
            "<h3>Please confirm your email using this link : </h3><a href='" +
            urlDeConfirmation +
            "'>Confirmation</a>",
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}

export function confirmation(req, res) {
    const resetCode = req.body.resetCode

    try {
        var tokenv

        tokenv = jwt.decode(req.params.token, process.env.JWT_SECRET)
        console.log('t', tokenv)
    } catch (e) {
        return res
            .status(400)
            .send({
                message: 'The confirmation link expired, please reverify.',
            })
    }

    user.findById(tokenv.id, function (err, user) {
        if (!user) {
            return res
                .status(401)
                .send({ message: 'User not found, please sign up.' })
        } else if (user.isVerified) {
            return res
                .status(200)
                .send({
                    message:
                        'This mail has already been verified, please log in',
                })
        } else {
            user.isVerified = true
            user.save(function (err) {
                if (err) {
                    return res.status(500).send({ message: err.message })
                } else {
                    sendPasswordResetEmail(req.body.email, tokenv, resetCode)
                    return res
                        .status(200)
                        .send({
                            message:
                                'Your account has been verified' + resetCode,
                        })
                }
            })
        }
    })
}

