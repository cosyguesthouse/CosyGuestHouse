export const compressImage = async (file: File): Promise<File> => {
    // If not an image or if smaller than 2MB, return original
    if (!file.type.startsWith('image/') || file.size <= 2 * 1024 * 1024) return file;

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                
                // Maintain aspect ratio, max width: 1200px
                if (width > 1200) {
                    height = Math.round((height * 1200) / width);
                    width = 1200;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                const attemptCompress = () => {
                    canvas.toBlob((blob) => {
                        if (!blob) return resolve(file); // Fallback
                        
                        // Reduce quality until <= 2MB, but don't go below 10% quality
                        if (blob.size > 2 * 1024 * 1024 && quality > 0.1) {
                            quality -= 0.1;
                            attemptCompress();
                        } else {
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            resolve(new File([blob], newFileName, { type: "image/webp" }));
                        }
                    }, "image/webp", quality);
                };
                attemptCompress();
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};
