import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

// Eğer yoksa admin oluştur
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    { username: "levochery", password: "levent4251", role: "admin" },
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  console.log("🆕 users.json oluşturuldu (admin: levochery)");
}

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 🔹 Giriş
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Hatalı kullanıcı adı veya şifre." });
  }

  res.json({
    success: true,
    token: "fake-jwt-token-" + user.username,
    username: user.username,
    isAdmin: user.role === "admin",
  });
});

// 🔹 Kullanıcı listeleme (uygulamadaki yönetici paneli için)
app.get("/users", (req, res) => {
  const users = loadUsers().map((u) => ({
    username: u.username,
    role: u.role,
  }));
  res.json(users);
});

// 🔹 Yeni kullanıcı ekleme (yönetici panelindeki + butonu)
app.post("/users", (req, res) => {
  const { username, password, isAdmin } = req.body;
  const users = loadUsers();

  if (!username || !password) {
    return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli." });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "Bu kullanıcı zaten var." });
  }

  const newUser = {
    username,
    password,
    role: isAdmin ? "admin" : "user",
  };

  users.push(newUser);
  saveUsers(users);
  console.log("✅ Yeni kullanıcı eklendi:", username);

  res.json({ message: "Kullanıcı başarıyla eklendi.", success: true });
});

// 🔹 Log endpoint (isteğe bağlı)
app.get("/logs", (req, res) => {
  res.json([]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
