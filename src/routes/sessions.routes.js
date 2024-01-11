import { Router } from "express";
import userModel from "../dao/models/user.model.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;
  console.log("Registrando usuario:");
  console.log(req.body);

  //Validamos si el user existe en la DB
  const exist = await userModel.findOne({ email });
  if (exist) {
    return res
      .status(400)
      .send({ status: "error", message: "Usuario ya existe!" });
  }

  const user = {
    first_name,
    last_name,
    email,
    age,
    password, //se encriptara despues...
  };

  const result = await userModel.create(user);
  res.send({
    status: "success",
    message: "Usuario creado con extito con ID: " + result.id,
  });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, password }); //Ya que el password no está hasheado, podemos buscarlo directamente
  if (!user)
    return res
      .status(401)
      .send({ status: "error", error: "Incorrect credentials" });

  if (email != "adminCoder@coder.com" || password !== "adminCod3r123") {
    (req.session.rol = "user"),
      (req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        rol: req.session.rol,
        age: user.age,
      });
  } else {
    (req.session.rol = "admin"),
      (req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        rol: req.session.rol,
        age: user.age,
      });
  }

  res.send({
    status: "success",
    payload: req.session.user,
    message: "¡Primer logueo realizado! :)",
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res
        .status(500)
        .send({ status: "error", msg: "Internal Server Error" });
    }
    res.redirect("/users/login");
  });
});

export default router;
