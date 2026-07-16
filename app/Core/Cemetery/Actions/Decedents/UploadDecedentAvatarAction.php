<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\Decedent;
use Illuminate\Http\UploadedFile;

class UploadDecedentAvatarAction
{
    use StoresDecedentAvatar;

    public function execute(string $decedentId, string $municipalId, UploadedFile $avatar): Decedent
    {
        $decedent = Decedent::query()
            ->where('municipal_id', $municipalId)
            ->findOrFail($decedentId);

        $this->storeAvatar($decedent, $avatar);

        $logger = activity('cemetery_decedent')
            ->performedOn($decedent)
            ->withProperties([
                'decedent_id' => $decedent->id,
                'collection' => 'avatar',
                'file_name' => $this->avatarFileName($decedent, $avatar),
            ])
            ->event('avatar_updated');

        if (auth()->user()) {
            $logger->causedBy(auth()->user());
        }

        $logger->log('Updated decedent profile photo');

        return $decedent->fresh('media');
    }
}
