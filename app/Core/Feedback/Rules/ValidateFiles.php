<?php

namespace App\Core\Feedback\Rules;

use Illuminate\Http\UploadedFile;

class ValidateFiles
{
    protected array $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'video/mp4',
        'video/avi',
        'video/mpeg',
    ];
    protected array $allowedExtensions = [
        'jpg',
        'jpeg',
        'png',
        'mp4',
        'avi',
        'mpeg',
    ];

    protected int $maxTotalSize; //max is 50mb
    protected int $maxFiles; //max is 5 files

    public function __construct(
        int $maxTotalSizeMb = 50,
        int $maxFiles = 5,
    ) {
        //convert to bytes
        $this->maxTotalSize = $maxTotalSizeMb * 1048576;
        $this->maxFiles = $maxFiles;
    }

    public function validate(array $files): void
    {
        if (empty($files)) {
            return;
        }

        $this->validateFileCount($files);
        $this->validateTotalFileSize($files);
        foreach ($files as $index => $file) {
            $this->validateFile($file, $index + 1);
        }
    }

    public function validateFileCount(array $files): void
    {
        $fileCount = count($files);
        if ($fileCount > $this->maxFiles) {
            throw new \InvalidArgumentException(
                "Maximum {$this->maxFiles} files allowed. You uploaded " . $fileCount . " files."
            );
        }
    }

    public function validateTotalFileSize(array $files): void
    {
        $totalSize = 0;
        $fileSizes = [];

        foreach ($files as $file) {
            $size = $file->getSize();
            $totalSize += $size;
            $fileSizes[] = [
                'name' => $file->getClientOriginalName(),
                'size' => round($size / 1048576, 2) . 'MB',
            ];

        }

        if ($totalSize > $this->maxTotalSize) {
            $maxSizeMb = $this->maxTotalSize / 1048576;
            $totalSizeMb = round($totalSize / 1048576, 2);

            $fileDetails = array_map(
                fn($file) => "{$file['name']} ({$file['size']})",
                $fileSizes,
            );

            throw new \InvalidArgumentException(
                "Total file size is {$totalSizeMb}MB, which exceeds the maximum allowed size of {$maxSizeMb}MB. " .
                "Files: " . implode(', ', $fileDetails)
            );
        }
    }

    public function validateFile(UploadedFile $file, int $fileNumber): void
    {
        $fileName = $file->getClientOriginalName();

        //check if file is valid
        if (!$file->isValid()) {
            throw new \InvalidArgumentException(
                "File #{$fileNumber} '{$fileName}' is invalid or corrupted"
            );

        }

        //check if file is empty
        if ($file->getSize() === 0) {
            throw new \InvalidArgumentException(
                "File #{$fileNumber} '{$fileName}' is empty"
            );
        }

        //validate mime type
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, $this->allowedMimeTypes)) {

            $allowedTypes = implode(', ', array_unique(array_unique(array_map(
                fn($mime) => explode('/', $mime)[1],
                $this->allowedMimeTypes
            ))));
            throw new \InvalidArgumentException(
                "File #{$fileNumber} '{$fileName}' has an invalid type ({$mimeType}). " .
                "Allowed types: {$allowedTypes}"
            );
        }

        //validate extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $this->allowedExtensions)) {
            $allowedExtensions = implode(', ', $this->allowedExtensions);

            throw new \InvalidArgumentException(
                "File #{$fileNumber} '{$fileName}' has an invalid extension ({$extension}). " .
                "Allowed extensions: {$allowedExtensions}"
            );
        }
    }

    public function getMazTotalSize(): int
    {
        return $this->maxTotalSize;
    }

    public function getMaxTotalSizeMB(): int
    {
        return $this->maxTotalSize / 1048576;
    }
    public function getMaxFiles(): int
    {
        return $this->maxFiles;
    }

    public function getAllowedExtensions(): array
    {
        return $this->allowedExtensions;
    }
}