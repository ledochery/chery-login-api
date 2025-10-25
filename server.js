// Basit Express tabanlı login API (kalıcı kullanıcı kaydı + CRUD)
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(process.cwd(), "users.json");

// Eğer users.json yoksa oluştur ve admin hesabını ekle
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    { username: "levochery", password: "levent4251", role: "admin" },
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  console.log("🆕 users.json oluşturuldu (admin: levochery)");
}

function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("users.json okunamadı, boş liste dönülüyor:", e);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// -------------------------
// Giriş endpoint
// -------------------------
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

  return res.json({
    success: true,
    token: "fake-jwt-token-" + user.username, // demo token
    username: user.username,
    isAdmin: user.role === "admin",
    message: "Giriş başarılı!",
  });
});

// -------------------------
// Kullanıcı listeleme (yönetici paneli için)
// -------------------------
app.get("/users", (req, res) => {
  const users = loadUsers().map((u) => ({
    username: u.username,
    role: u.role,
    // parola, deviceId vb. döndürmüyoruz (gerekirse ekle)
  }));
  res.json(users);
});

// -------------------------
// Yeni kullanıcı ekleme (POST /users)
// -------------------------
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

// -------------------------
// Kullanıcı güncelleme (PUT /users/:username)
// -- payload: { password?: string, isAdmin?: boolean }
// -------------------------
app.put("/users/:username", (req, res) => {
  const target = req.params.username;
  const { password, isAdmin } = req.body;
  const users = loadUsers();

  const idx = users.findIndex((u) => u.username === target);
  if (idx === -1) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  if (password && password.trim().length > 0) {
    users[idx].password = password;
  }
  if (typeof isAdmin === "boolean") {
    users[idx].role = isAdmin ? "admin" : "user";
  }

  saveUsers(users);
  console.log("✅ Kullanıcı güncellendi:", target);
  res.json({ message: "Kullanıcı güncellendi.", success: true });
});

// -------------------------
// Kullanıcı silme (DELETE /users/:username)
// -------------------------
app.delete("/users/:username", (req, res) => {
  const target = req.params.username;
  let users = loadUsers();

  const idx = users.findIndex((u) => u.username === target);
  if (idx === -1) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  // Admin hesabını yanlışlıkla silmeye karşı koru (opsiyonel)
  if (users[idx].role === "admin" && users[idx].username === "levochery") {
    return res.status(403).json({ message: "Bu ana admin silinemez." });
  }

  users.splice(idx, 1);
  saveUsers(users);
  console.log("🗑️ Kullanıcı silindi:", target);
  res.json({ message: "Kullanıcı silindi.", success: true });
});

// -------------------------
// Basit logs endpoint (demo)
// -------------------------
app.get("/logs", (req, res) => {
  // gerçek projede logları ayrı dosyaya veya DB'ye yaz
  res.json([]);
});

// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
