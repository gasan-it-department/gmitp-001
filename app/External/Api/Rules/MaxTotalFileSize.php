<?php

namespace App\External\Api\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class MaxTotalFileSize implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */

    public function __construct(protected int $maxMegabytes = 100)
    {
    }
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $totalFileSize = 0;

        if (is_array($value)) {
            foreach ($value as $item) {
                if (isset($item['file']) && $item['file'] instanceof UploadedFile) {
                    $totalFileSize += $item['file']->getSize();
                }
            }
        }

        $maxBytes = $this->maxMegabytes * 1024 * 1024;
        if ($totalFileSize > $maxBytes) {
            $fail("The total size of all {$attribute} must not exceed {$this->maxMegabytes}MB.");
        }

    }
}
