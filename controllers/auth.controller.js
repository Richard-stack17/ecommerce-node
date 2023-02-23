const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/appError');
const { ref, uploadBytes } = require('firebase/storage'); //ref me ayuda a especificar al firebase donde almacenará mis iamgenes
const { storage } = require('../utils/firebase');

exports.createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role = 'user' } = req.body;

  const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`); //el interpreta que es un direccion orepertorio, el segundo valor despues del eslash es el nombre que le edeso poner como quiero el original pues lo pongo pero puede ser cualquiera, el originalname es el nombre que le posuimos a nuestro rearchivo
  const imgUploaded = await uploadBytes(imgRef, req.file.buffer); //
  //Date.now() lo uso para tener nombre differente para evitar archivos con nombres iguales
  //direccion de donde va a ser subido, eso es el segundo parametro de ref,
  console.log(imgUploaded);

  // //1. crear una instancia de la clase user
  const user = new User({
    username,
    email,
    password,
    role,
    profileImageUrl: imgUploaded.metadata.fullPath,
  });
  //2. encriptar la contraseña
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  //3. guardar en la base de datos con las contraseñas encriptadas
  await user.save();
  //4. generar el jwt
  const token = await generateJWT(user.id);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl, 
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. Check if user exist && password is correct
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
      status: true,
    },
  });

  if (!user) {
    return next(new AppError('The user could not be found', 404));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //2. if everything ok, send token to client
  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

exports.renewToken = catchAsync(async (req, res, next) => {
  const { id } = req.sessionUser; //se desustructura de objeto, tenemos acceso a el por estar antes del protect

  const token = await generateJWT(id); //await porque devuelve un promesa el genereate, se espera que sea resuelta

  const user = await User.findOne({
    where: {
      status: true,
      id,
    },
  });

  return res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
