// Basit Express tabanlı login API
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Tek kullanıcı: admin yetkili hesap
const USERS = [
  { username: "levochery", password: "levent4251", role: "admin" },
];

// Giriş endpointi
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Hatalı kullanıcı adı veya şifre." });
  }

  return res.json({
    success: true,
    token: "fake-jwt-token-" + user.username,
    username: user.username,
    isAdmin: user.role === "admin",
    message: "Giriş başarılı!",
  });
});

// Yeni kullanıcı ekleme endpointi
app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;

  if (USERS.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, message: "Bu kullanıcı zaten var." });
  }

  USERS.push({ username, password, role: "user" });
  console.log("✅ Yeni kullanıcı eklendi:", username);
  return res.json({ success: true, message: "Kullanıcı başarıyla eklendi." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
