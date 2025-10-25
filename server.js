// Basit Express tabanlı login API
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const USERS = [
  { username: "admin", password: "1234" },
  { username: "teknisyen", password: "abcd" },
];

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Hatalı giriş." });
  }

  return res.json({
    success: true,
    token: "fake-jwt-token-" + user.username,
    username: user.username,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
