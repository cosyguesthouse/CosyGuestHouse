export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
}

/** Format bytes to human-readable string */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

/**
 * Aggressively compress any image for maximum storage saving.
 * - Always compresses (even if already small)
 * - Converts to WebP
 * - Resizes to max 1000px width (maintains aspect ratio)
 * - Targets 300KB–700KB final size
 * - Quality range: 0.8 → 0.4
 * - Max allowed final size: 1MB
 */
export const compressImage = async (file: File): Promise<CompressionResult> => {
    const originalSize = file.size;

    // If not an image, return as-is
    if (!file.type.startsWith("image/")) {
        return { file, originalSize, compressedSize: originalSize, savedPercent: 0 };
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;

                // Resize: max width 1000px, maintain aspect ratio
                if (width > 1000) {
                    height = Math.round((height * 1000) / width);
                    width = 1000;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
                }
                ctx.drawImage(img, 0, 0, width, height);

                const TARGET_MAX = 700 * 1024;   // 700KB — ideal upper bound
                const HARD_MAX = 1024 * 1024;     // 1MB — absolute maximum
                const MIN_QUALITY = 0.4;
                const QUALITY_STEP = 0.05;
                let quality = 0.8;

                const attemptCompress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                return resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
                            }

                            // If still above 700KB and we can reduce quality further, try again
                            if (blob.size > TARGET_MAX && quality > MIN_QUALITY) {
                                quality -= QUALITY_STEP;
                                quality = Math.max(quality, MIN_QUALITY);
                                attemptCompress();
                                return;
                            }

                            // Build final file
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            const compressedFile = new File([blob], newFileName, { type: "image/webp" });
                            const compressedSize = compressedFile.size;
                            const savedPercent = originalSize > 0
                                ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
                                : 0;

                            resolve({
                                file: compressedFile,
                                originalSize,
                                compressedSize,
                                savedPercent: Math.max(savedPercent, 0),
                            });
                        },
                        "image/webp",
                        quality
                    );
                };

                attemptCompress();
            };

            img.onerror = () => {
                resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
            };

            img.src = event.target?.result as string;
        };

        reader.onerror = () => {
            resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
        };

        reader.readAsDataURL(file);
    });
};
