const Tarea = require("../models/Tarea");
const Proyecto = require("../models/Proyecto");
const { validationResult } = require("express-validator");

//Crea una nueva tarea
exports.crearTarea = async (req, res) => {
  //Revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    //Extraer el proyectoID  y comprobrar si existe
    const { proyecto } = req.body;
    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      return res.status(400).json({ msg: "Proyecto no encontrado" });
    }

    //Revisar si el proyecto actual pertenece al usuario autenticado
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //Crear la tarea
    const tarea = new Tarea(req.body);
    await tarea.save();
    res.json({ tarea });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

//Obtiene las tareas por proyecto
exports.obtenerTareas = async (req, res) => {
  try {
    //Extraer el proyectoID  y comprobrar si existe
    const { proyecto } = req.query;
    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      return res.status(400).json({ msg: "Tareas no encontradas" });
    }

    //Revisar si el proyecto actual pertenece al usuario autenticado
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //Obtener las tareas por proyecto, las tareas mas reciente se muestran primero
    const tareas = await Tarea.find({ proyecto }).sort({ creado: -1 });
    res.json({ tareas });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

//Actualizar una tarea via id
exports.actualizarTarea = async (req, res) => {
  try {
    //Extraer el proyectoId, estado y nombre de la tarea  y comprobrar si existe
    const { proyecto, nombre, estado } = req.body;

    //Revisar si la tarea existe
    let tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(400).json({ msg: "Tarea no encontrada" });
    }

    //Revisar si el proyecto actual pertenece al usuario autenticado
    const existeProyecto = await Proyecto.findById(proyecto);
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //Crea un objeto con la nueva informacion
    const nuevaTarea = {};
    nuevaTarea.nombre = nombre;
    nuevaTarea.estado = estado;

    //Guardar nueva tarea
    tarea = await Tarea.findOneAndUpdate({ _id: req.params.id }, nuevaTarea, {
      new: true,
    });

    res.json({ tarea });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};

//Eliminar una tarea via id
exports.eliminarTarea = async (req, res) => {
  try {
    //Extraer el proyectoId de la tarea  y comprobrar si existe
    const { proyecto } = req.query;

    //Revisar si la tarea existe
    let tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(400).json({ msg: "Tarea no encontrada" });
    }

    //Revisar si el proyecto actual pertenece al usuario autenticado
    const existeProyecto = await Proyecto.findById(proyecto);
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //Eliminar tarea
    await Tarea.findByIdAndRemove({ _id: req.params.id });
    res.json({ msg: "Tarea eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error");
  }
};
