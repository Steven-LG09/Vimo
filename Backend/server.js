import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import mongoose from "mongoose";
import {
    v2 as cloudinary
} from 'cloudinary';
import streamifier from "streamifier";
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

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
        public_id: "prueba-directa"
    })
    .then(result => console.log("✅ Subida directa:", result.secure_url))
    .catch(err => console.error("❌ Error subida directa:", err));

function uploadToCloudinary(buffer, filename) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
                public_id: filename,
                resource_type: 'auto',
                timeout: 60000 // ⏱️ Aumentamos el tiempo a 60 segundos
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
}

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
                error: "Missing required fields today"
            });
        }

        let studiesRaw = req.body.studies;
        let experiencesRaw = req.body.experiences;
        let languagesRaw = req.body.languages;
        let skillsRaw = req.body.skills;

        // Parsear sólo si viene como string
        if (typeof studiesRaw === 'string') {
            try {
                studiesRaw = JSON.parse(studiesRaw);
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid studies format (JSON parse failed)'
                });
            }
        }

        // Convertir a array si no lo es (por si viene como objeto con keys numéricas)
        if (!Array.isArray(studiesRaw)) {
            studiesRaw = Object.values(studiesRaw || {});
        }

        // Validar que haya al menos un estudio
        if (!studiesRaw.length) {
            return res.status(400).json({
                error: 'At least one valid study is required'
            });
        }

        // Parsear sólo si viene como string
        if (typeof experiencesRaw === 'string') {
            try {
                experiencesRaw = JSON.parse(experiencesRaw);
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid experiences format (JSON parse failed)'
                });
            }
        }

        // Convertir a array si no lo es (por si viene como objeto con keys numéricas)
        if (!Array.isArray(experiencesRaw)) {
            experiencesRaw = Object.values(experiencesRaw || {});
        }

        // Validar que haya al menos un estudio
        if (!experiencesRaw.length) {
            return res.status(400).json({
                error: 'At least one valid experience is required'
            });
        }

        // Parsear sólo si viene como string
        if (typeof languagesRaw === 'string') {
            try {
                languagesRaw = JSON.parse(languagesRaw);
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid experiences format (JSON parse failed)'
                });
            }
        }

        // Convertir a array si no lo es (por si viene como objeto con keys numéricas)
        if (!Array.isArray(languagesRaw)) {
            languagesRaw = Object.values(languagesRaw || {});
        }

        // Parsear sólo si viene como string
        if (typeof skillsRaw === 'string') {
            try {
                skillsRaw = JSON.parse(skillsRaw);
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid experiences format (JSON parse failed)'
                });
            }
        }

        // Convertir a array si no lo es (por si viene como objeto con keys numéricas)
        if (!Array.isArray(skillsRaw)) {
            skillsRaw = Object.values(skillsRaw || {});
        }

        const uploadedFiles = {};

        // Procesar archivos generales (excluye los de estudios)
        for (const file of req.files) {
            if (!file.fieldname.startsWith('studies[')) {
                const publicUrl = await uploadToCloudinary(file.buffer, file.originalname);

                if (!uploadedFiles[file.fieldname]) {
                    uploadedFiles[file.fieldname] = [];
                }
                uploadedFiles[file.fieldname].push({
                    originalName: file.originalname,
                    url: publicUrl
                });
            }
        }

        // Procesar estudios y certificados asociados
        const studies = await Promise.all(studiesRaw.map(async (study, index) => {
            const certFile = req.files.find(f => f.fieldname === `studies[${index}][certificate]`);
            let certUrl = null;

            if (certFile) {
                certUrl = await uploadToCloudinary(certFile.buffer, certFile.originalname);
            }

            return {
                title: study.title,
                type: study.type,
                institution: study.institution,
                certificate: certUrl
            };
        }));

        // Guardar en base de datos
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
            studies: studies,
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
        console.error("Upload error:", error);
        res.status(500).json({
            message: "There's a problem"
        });
    }
});

app.get('/employee', async (req, res) => {
    try {
        const employees = await Employees.find({}, {
            name: 1,
            "files.photo": 1,
            _id: 0
        });

        const cleaned = employees.map(emp => {
            // Si emp.files es un Map, usa .get()
            const filesMap = emp.files instanceof Map ? emp.files : new Map(Object.entries(emp.files || {}));
            const photoArray = filesMap.get("photo");
            const rawUrl = photoArray?. [0]?.url || null;

            let photoUrl = null;
            if (rawUrl?.includes("drive.google.com")) {
                const match = rawUrl.match(/\/d\/([^/]+)(?:\/|$)/);
                if (match) {
                    const fileId = match[1];
                    photoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                }
            } else {
                photoUrl = rawUrl;
            }

            return {
                name: emp.name,
                photoUrl
            };
        });


        res.json(cleaned);
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        res.status(500).json({
            error: 'Error al obtener empleados hoy',
            message: error.message
        });
    }
});



app.get("/count", async (req, res) => {
    try {
        const total = await Employees.countDocuments();
        res.json({
            total
        });
    } catch (error) {
        console.error('Error al contar documentos:', error);
        res.status(500).json({
            error: 'Error al contar documentos hoy'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});