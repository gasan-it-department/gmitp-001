const ROTATABLE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type ImageRotationDirection = 'left' | 'right';

export async function rotateImageFile(file: File, direction: ImageRotationDirection): Promise<File> {
    if (!ROTATABLE_IMAGE_TYPES.has(file.type)) {
        throw new Error('Only JPG, PNG, and WebP images can be rotated.');
    }

    const imageUrl = URL.createObjectURL(file);

    try {
        const image = await loadImage(imageUrl);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Unable to prepare the image for rotation.');
        }

        canvas.width = image.naturalHeight;
        canvas.height = image.naturalWidth;

        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(direction === 'left' ? -Math.PI / 2 : Math.PI / 2);
        context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

        const blob = await canvasToBlob(canvas, file.type);

        return new File([blob], file.name, {
            type: blob.type,
            lastModified: Date.now(),
        });
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Unable to read the selected image.'));
        image.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error('The rotated image could not be created.'));
            },
            mimeType,
            0.92,
        );
    });
}
