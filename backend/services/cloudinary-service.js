const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (source, folder = 'argov/products') => {
    try {
        const isUrl = typeof source === 'string' && /^https?:\/\//i.test(source);
        const options = { folder };

        const result = await cloudinary.uploader.upload(source, options);

        console.log(`☁️ Uploaded to Cloudinary: ${result.secure_url}`);

        if (!isUrl && fs.existsSync(source)) {
            fs.unlinkSync(source);
        }

        return result.secure_url;
    } catch (err) {
        console.error('Cloudinary upload failed:', err.message);

        if (source && !/^https?:\/\//i.test(source) && fs.existsSync(source)) {
            try {
                fs.unlinkSync(source);
            } catch (cleanupErr) {
                console.warn('Failed to clean up temp file:', cleanupErr.message);
            }
        }

        throw new Error('Cloudinary upload failed');
    }
};

const uploadBufferToCloudinary = async (buffer, folder = 'argov/products') => {
    try {
        const base64 = buffer.toString('base64');
        const dataUri = `data:image/png;base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, { folder });
        console.log(`☁️ Uploaded directly to Cloudinary: ${result.secure_url}`);
        return result.secure_url;
    } catch (err) {
        console.error('Cloudinary memory upload failed:', err.message);
        throw new Error('Cloudinary upload failed');
    }
};

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // Extract public_id from full URL — supports versioned Cloudinary paths
        const regex = /\/(?:image\/upload\/v\d+\/)?(argov\/products\/[^/.]+)/;
        const match = imageUrl.match(regex);

        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId);
            console.log(`🧹 Deleted from Cloudinary: ${publicId}`);
        } else {
            console.warn('Could not extract public_id from URL:', imageUrl);
        }
    } catch (err) {
        console.warn('Cloudinary deletion failed:', err.message);
    }
};

module.exports = { uploadToCloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
