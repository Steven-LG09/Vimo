import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import mongoose from "mongoose";
import ImageKit from "imagekit";
import multer from "multer";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const emploSchema = new mongoose.Schema({
    name: String,
    phone: Number,
    age: Number,
    email: String,
    ide: Number,
    genre: String,
    nationality: String,
    linkedin: String,
    area: String,
    studies: [{
        title: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        certificate: {
            type: String,
            default: null
        }
    }],
    experiences: [{
        company: {
            type: String,
            required: true
        },
        sector: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        telephone: {
            type: Number,
            required: true
        },
        time: {
            type: Number,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        contract: {
            type: String,
            required: true
        }
    }],
    languages: [{
        language: {
            type: String,
            required: false
        },
        languageLevel: {
            type: String,
            required: false
        }
    }],
    skills: [{
        skill: {
            type: String,
            required: false
        },
        skillLevel: {
            type: String,
            required: false
        }
    }],
    files: {
        type: Map,
        of: [{
            originalName: String,
            url: String
        }]
    }
});

const Employees = mongoose.models[process.env.COLLECTION_NAME] || mongoose.model(process.env.COLLECTION_NAME, emploSchema);

const upload = multer({
    storage: multer.memoryStorage()
});

const imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    urlEndpoint: process.env.URL_ENDPOINT,
});

async function uploadToImageKit(buffer, fileName) {
    return new Promise((resolve, reject) => {
        imagekit.upload({
                file: buffer, // puede ser Buffer, base64, o URL
                fileName: fileName,
            },
            function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.url); // devolvemos solo la URL
                }
            }
        );
    });
}

export default uploadToImageKit;


app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente ayer');
});

app.post('/login', async (req, res) => {
    try {
        const {
            user,
            password
        } = req.body;

        if (!user || !password) {
            return res.status(400).json({
                success: false,
                message: "Información requerida",
            });
        }

        if (user == "admin" && password == "test2025") {
            res.json({
                message: "Upload successful",
                success: true,
                redirectUrl: process.env.MAINPRI
            });
        } else if (user == "employee1" && password == "test2025") {
            res.json({
                message: "Upload successful",
                success: true,
                redirectUrl: process.env.CREATE
            });
        } else if (user == "employee2" && password == "test2025") {
            res.json({
                message: "Upload successful",
                success: true,
                redirectUrl: process.env.RESUME
            });
        } else {
            res.json({
                message: "Credenciales incorrectas",
                success: false
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Credenciales invalidas"
        });
    }
});

app.post('/create', upload.any(), async (req, res) => {
    try {
        const {
            name,
            phone,
            age,
            email,
            ide,
            genre,
            nationality,
            linkedin,
            area
        } = req.body;

        if (!name || !phone || !age || !email || !ide || !genre || !nationality || !area) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        let studiesRaw = req.body.studies;
        let experiencesRaw = req.body.experiences;
        let languagesRaw = req.body.languages;
        let skillsRaw = req.body.skills;

        if (typeof studiesRaw === 'string') studiesRaw = JSON.parse(studiesRaw);
        if (!Array.isArray(studiesRaw)) studiesRaw = Object.values(studiesRaw || {});
        if (!studiesRaw.length) return res.status(400).json({
            error: 'At least one valid study is required'
        });

        if (typeof experiencesRaw === 'string') experiencesRaw = JSON.parse(experiencesRaw);
        if (!Array.isArray(experiencesRaw)) experiencesRaw = Object.values(experiencesRaw || {});
        if (!experiencesRaw.length) return res.status(400).json({
            error: 'At least one valid experience is required'
        });

        if (typeof languagesRaw === 'string') languagesRaw = JSON.parse(languagesRaw);
        if (!Array.isArray(languagesRaw)) languagesRaw = Object.values(languagesRaw || {});

        if (typeof skillsRaw === 'string') skillsRaw = JSON.parse(skillsRaw);
        if (!Array.isArray(skillsRaw)) skillsRaw = Object.values(skillsRaw || {});

        const uploadedFiles = {};

        // Subir archivos generales (no estudios)
        for (const file of req.files) {
            if (!file.fieldname.startsWith('studies[')) {

                const cloudUrl = await uploadToImageKit(file.buffer, file.originalname);
                if (!uploadedFiles[file.fieldname]) uploadedFiles[file.fieldname] = [];
                uploadedFiles[file.fieldname].push({
                    originalName: file.originalname,
                    url: cloudUrl,
                });

            }
        }

        // Subir certificados de estudios
        const studies = await Promise.all(studiesRaw.map(async (study, index) => {
            const certFile = req.files.find(f => f.fieldname === `studies[${index}][certificate]`);
            let certUrl = null;

            if (certFile) {
                certUrl = await uploadToImageKit(certFile.buffer, certFile.originalname);

            }

            return {
                title: study.title,
                type: study.type,
                institution: study.institution,
                certificate: certUrl,
            };
        }));

        const newEmployee = new Employees({
            name,
            phone,
            age,
            email,
            ide,
            genre,
            nationality,
            linkedin,
            area,
            files: uploadedFiles,
            studies,
            experiences: experiencesRaw,
            languages: languagesRaw,
            skills: skillsRaw
        });

        await newEmployee.save();

        res.json({
            message: "Upload Successful",
            success: true,
            redirectUrl: process.env.THANKS
        });

    } catch (error) {
        console.error("❌ Upload error:", error);
        res.status(500).json({
            message: "There's a problem"
        });
    }
});

app.get('/employee', async (req, res) => {
    try {
        const {
            area
        } = req.query;

        // Aplica el filtro si se envía un area específico
        const filter = area && area !== "Todos los Empleados" ? {
            area
        } : {};

        const employees = await Employees.find(filter, {
            name: 1,
            "files.photo": 1,
            _id: 0
        });

        const cleaned = employees.map(emp => {
            const photoArray = emp.files?.get('photo');
            const photoUrl = photoArray?. [0]?.url || null;

            return {
                name: emp.name,
                photoUrl
            };
        });

        if (cleaned.length === 0) {
            return res.status(404).json({
                message: "No employees found"
            });
        }

        res.json(cleaned);
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        res.status(500).json({
            error: 'Error al obtener empleados',
            message: error.message
        });
    }
});

app.get("/count", async (req, res) => {
    try {
        const {
            area
        } = req.query;
        const filter = area && area !== "Todos los Empleados" ? {
            area
        } : {};

        const total = await Employees.countDocuments(filter);
        res.json({
            total
        });
    } catch (error) {
        console.error("Error al contar empleados:", error);
        res.status(500).json({
            error: "Error al contar empleados"
        });
    }
});

app.get('/info', async (req, res) => {
    try {
        const name = req.query.name;

        // Buscar en la primera colección
        let documento = await Employees.findOne({
            name
        });

        // Si aún no se encuentra, devolver 404
        if (!documento) {
            return res.status(404).json({
                error: 'No encontrado en ninguna colección'
            });
        }

        // Si se encuentra en alguna, devolverlo
        res.json(documento);

    } catch (err) {
        console.error('Error en búsqueda:', err);
        res.status(500).json({
            error: 'Error en la búsqueda'
        });
    }
});

app.get('/stats/:tipo', async (req, res) => {
    const {
        tipo
    } = req.params;

    try {
        const usuarios = await Employees.find({});

        let resultados = [];

        if (tipo.includes('.')) {
            const [arrayField, subField] = tipo.split('.');

            for (const usuario of usuarios) {
                const array = usuario[arrayField];

                if (Array.isArray(array)) {
                    for (const item of array) {
                        if (item && item[subField]) {
                            resultados.push({
                                [subField]: item[subField]
                            });
                        } else {
                            console.log(`⚠️ Subcampo '${subField}' no encontrado en item.`);
                        }
                    }
                } else {
                    console.log(`❌ El campo '${arrayField}' no es un array en el usuario ${usuario.nombre}`);
                }
            }

        } else {
            for (const usuario of usuarios) {
                if (usuario[tipo]) {
                    resultados.push({
                        [tipo]: usuario[tipo]
                    });
                } else {
                    console.log(`⚠️ El campo '${tipo}' no existe en el usuario ${usuario.nombre}`);
                }
            }
        }

        res.json(resultados);
    } catch (error) {
        console.error('❌ Error en la solicitud:', error);
        res.status(500).json({
            error: 'Error al obtener los datos'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});