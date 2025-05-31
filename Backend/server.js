import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import mongoose from "mongoose";
import {
    google
} from "googleapis";
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
const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
    version: "v3",
    auth
});

async function makeFilePublic(fileId) {
    // Set file permission to 'anyone with the link can view'
    await drive.permissions.create({
        fileId,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    // Get the file's web links
    const result = await drive.files.get({
        fileId,
        fields: "webViewLink, webContentLink",
    });

    // Return the webContentLink (direct download) or webViewLink (opens in Drive)
    return result.data.webViewLink;
}


app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
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
                const fileMetadata = {
                    name: file.originalname,
                    parents: [process.env.DRIVE_FOLDER_ID],
                };

                const media = {
                    mimeType: file.mimetype,
                    body: streamifier.createReadStream(file.buffer),
                };

                const response = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: "id",
                });

                const fileId = response.data.id;
                const publicUrl = await makeFilePublic(fileId);

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
                const fileMetadata = {
                    name: certFile.originalname,
                    parents: [process.env.DRIVE_FOLDER_ID],
                };

                const media = {
                    mimeType: certFile.mimetype,
                    body: streamifier.createReadStream(certFile.buffer),
                };

                const response = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: "id",
                });

                const fileId = response.data.id;
                certUrl = await makeFilePublic(fileId);
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




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});