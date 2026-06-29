const userService = require('../services/userService');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userData = await userService.register({ name, email, password });
    res.status(201).json(userData);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await userService.login({ email, password });
    res.json(userData);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };