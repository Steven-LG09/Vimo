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
    files: {
        ide: [{
            originalName: String,
            url: String
        }],
        photo: [{
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


// Accept multiple file fields with different names
const uploadFields = upload.fields([{
        name: 'ide',
        maxCount: 1
    },
    {
        name: 'photo',
        maxCount: 1
    }
]);

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

app.post('/create', uploadFields, async (req, res) => {
    try {
        const {
            name,
            phone,
            age,
            email,
            ide,
            genre,
            nationality,
            linkedin
        } = req.body;

        const files = req.files;

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({
                error: "No files uploaded"
            });
        }
        if (!name || !phone || !age || !email || !ide || !genre || !nationality) return res.status(400).json({
            error: "Missing required fields"
        });

        const uploadedFiles = {};

        // Loop through each file field (e.g., profilePic, cvFile, etc.)
        for (const fieldName in files) {
            const fileArray = files[fieldName]; // Always an array
            for (const file of fileArray) {
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

                // Store using fieldName as the key
                if (!uploadedFiles[fieldName]) {
                    uploadedFiles[fieldName] = [];
                }
                uploadedFiles[fieldName].push({
                    originalName: file.originalname,
                    url: publicUrl
                });
            }
        }

        const newProduct = new Employees({
            name: name,
            phone: phone,
            age: age,
            email: email,
            ide: ide,
            genre: genre,
            nationality: nationality,
            linkedin: linkedin,
            files: uploadedFiles
        });
        await newProduct.save();

        res.json({
            message: "Upload Succesful",
            success: true,
            redirectUrl: process.env.THANKS
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            message: "There's a problem",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});