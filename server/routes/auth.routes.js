const { Router } = require('express')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../model/User')
const router = Router()

router.post(
  '/register',
  [
    check('email', 'Incorrect mail').isEmail(),
    check('password', 'Minimum password must be 8 characters').isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    };

    const { email, password } = req.body;
    const person = await User.findOne({ email });

    if(person) {
      return res.status(400).json({
        message: 'This user already exists.'
      })
    };

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword });

    await user.save()

    res.status(201).json('User created');
  }
)

router.post(
  '/login',
  [
    check('email', 'Incorrect mail').normalizeEmail().isEmail(),
    check('password', 'Enter password').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    };

    const { email, password } = req.body;

    const user = User.findOne({ email })
    if(!user) {
      return res.status(400).json({
        message: "User not found"
      })
    }

    const token = jwt.sign(
      { userId: user.id },
      config.get('jwtSecret'),
      { expiresIn: '1h' }
    );

    res.json({
      token,
      userId: user.id
    })
  }
)

module.exports = router;

