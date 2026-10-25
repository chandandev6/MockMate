import multer from "multer";

// resume ko memory me rakho — parse karke text DB me save karenge, disk pe file nahi chahiye
// (multiple servers pe local disk share nahi hoti)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            const error = new Error("Only PDF resumes are allowed");
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    },
});

export default upload;

// mic ki recording (Firefox = ogg, Chrome/Brave = webm, Safari = mp4). 10MB ≈ 20+ min opus audio — answer se kaafi zyada
export const audioUpload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith("audio/")) {
            const error = new Error("Only audio recordings are allowed");
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    },
});
