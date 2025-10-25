// Basit Express tabanlı login API (kalıcı kullanıcı kaydı destekli)
import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Kullanıcı verileri dosyası
const USERS_FILE = "./users.json";

// Dosya yoksa oluştur ve admin hesabını ekle
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    { username: "levochery", password: "levent4251", role: "admin" },
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  console.log("🆕 users.json oluşturuldu (admin: levochery)");
}

// Kullanıcıları dosyadan oku
function loadUsers() {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
}

// Kullanıcıları dosyaya kaydet
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 🔹 Giriş endpointi
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(
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

// 🔹 Yeni kullanıcı kaydı (sadece admin için)
app.post("/api/auth/register", (req, res) => {
  const { username, password, role } = req.body;
  const users = loadUsers();

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, message: "Bu kullanıcı zaten var." });
  }

  const newUser = { username, password, role: role || "user" };
  users.push(newUser);
  saveUsers(users);

  console.log("✅ Yeni kullanıcı eklendi:", username);
  return res.json({ success: true, message: "Kullanıcı başarıyla eklendi." });
});

// 🔹 Tüm kullanıcıları listele (admin için)
app.get("/api/auth/users", (req, res) => {
  const users = loadUsers().map((u) => ({
    username: u.username,
    role: u.role,
  }));
  res.json(users);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
