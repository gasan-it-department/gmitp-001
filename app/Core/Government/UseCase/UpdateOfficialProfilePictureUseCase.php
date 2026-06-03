<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Models\Official;
use Illuminate\Http\UploadedFile;

class UpdateOfficialProfilePictureUseCase
{

    public function execute(string $municipalId, string $officialId, UploadedFile $image)
    {

        $official = Official::where('municipal_id', $municipalId)
            ->findOrFail($officialId);

        $official->addMedia($image)
            ->toMediaCollection('official_portrait');

        return $official;
    }

}
