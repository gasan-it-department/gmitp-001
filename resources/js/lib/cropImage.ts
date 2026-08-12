export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid CORS issues
        image.src = url;
    });

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const rotatedSize = (width: number, height: number, rotation: number): { width: number; height: number } => {
    const radians = degreesToRadians(rotation);

    return {
        width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
        height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
    };
};

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    fileName: string = 'cropped-id.jpg',
    rotation: number = 0,
): Promise<File> {
    const image = await createImage(imageSrc);
    const rotationCanvas = document.createElement('canvas');
    const rotationContext = rotationCanvas.getContext('2d');

    if (!rotationContext) {
        throw new Error('Unable to prepare the ID image.');
    }

    const bounds = rotatedSize(image.width, image.height, rotation);
    rotationCanvas.width = Math.ceil(bounds.width);
    rotationCanvas.height = Math.ceil(bounds.height);

    rotationContext.translate(rotationCanvas.width / 2, rotationCanvas.height / 2);
    rotationContext.rotate(degreesToRadians(rotation));
    rotationContext.translate(-image.width / 2, -image.height / 2);
    rotationContext.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedContext = croppedCanvas.getContext('2d');

    if (!croppedContext) {
        throw new Error('Unable to crop the ID image.');
    }

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedContext.drawImage(rotationCanvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                resolve(file);
            },
            'image/jpeg',
            0.92,
        );
    });
}
