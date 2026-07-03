<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\Decedent;
use Illuminate\Http\UploadedFile;

trait StoresDecedentAvatar
{
    private function storeAvatar(Decedent $decedent, UploadedFile $avatar): void
    {
        $decedent->addMedia($avatar)
            ->usingFileName($this->avatarFileName($decedent, $avatar))
            ->toMediaCollection('avatar', 'local');
    }

    private function avatarFileName(Decedent $decedent, UploadedFile $avatar): string
    {
        $extension = strtolower($avatar->getClientOriginalExtension() ?: $avatar->guessExtension() ?: 'jpg');

        return 'avatar-'.$decedent->id.'.'.$extension;
    }
}
