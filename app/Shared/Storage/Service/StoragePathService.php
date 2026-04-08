<?php

namespace App\Shared\Storage\Service;

use App\Shared\Storage\Enums\StorageModules;
use Illuminate\Support\Str;

class StoragePathService
{
    public function __construct(
        protected int|string $municipalityId
    ) {
    }

    public function base(): string
    {
        return "gmitp-001/{$this->municipalityId}";
    }

    public function module(StorageModules $module): string
    {
        return "{$this->base()}/{$module->value}";
    }

    public function resolve(StorageModules $module, string $fileName, ?string $subPath = null): string
    {
        $path = "{$this->module($module)}/";

        if ($subPath) {
            $path .= "{$subPath}/";
        }

        $path .= $fileName;

        return $this->cleanPath($path);
    }

    public function resolveResource(StorageModules $module, string $resourceId, string $subfolder, string $filename): string
    {
        return $this->resolve($module, $filename, "{$resourceId}/{$subfolder}");
    }

    //security purpose
    public function ownsPath(string $pathToVerify): bool
    {
        return Str::startsWith($pathToVerify, $this->base() . '/');
    }

    protected function cleanPath(string $path): string
    {
        return preg_replace('#/+#', '/', $path);
    }
}