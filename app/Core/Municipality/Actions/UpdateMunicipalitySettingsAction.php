<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Dto\UpdateSettingsDto;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Models\MunicipalitySettings;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UpdateMunicipalitySettingsAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(UpdateSettingsDto $dto): Municipality
    {
        return DB::transaction(function () use ($dto) {
            $municipality = Municipality::query()
                ->whereKey($dto->municipalId)
                ->firstOrFail();

            $settings = MunicipalitySettings::query()
                ->where('municipal_id', $municipality->id)
                ->first();

            if (! $settings) {
                $settings = MunicipalitySettings::create([
                    'id'           => $this->idGenerator->generate(),
                    'municipal_id' => $municipality->id,
                ]);
            }

            $textPayload = array_filter([
                'primary_color_hex' => $dto->primaryColorHex,
                'contact_email'     => $dto->contactEmail,
                'trunkline_phone'   => $dto->trunklinePhone,
                'office_hours'      => $dto->officeHours,
                'facebook_url'      => $dto->facebookUrl,
            ], fn ($v) => ! is_null($v));

            if (! empty($textPayload)) {
                $settings->update($textPayload);
            }

            if ($dto->logo instanceof UploadedFile) {
                $municipality->clearMediaCollection('logo');

                $municipality
                    ->addMedia($dto->logo)
                    ->usingFileName($dto->logo->getClientOriginalName())
                    ->toMediaCollection('logo');
            }

            if (! empty($dto->removeBannerIds)) {
                $municipality->getMedia('banners')
                    ->whereIn('id', $dto->removeBannerIds)
                    ->each(fn ($media) => $media->delete());
            }

            foreach ($dto->banners as $file) {
                if (! $file instanceof UploadedFile) {
                    continue;
                }

                $municipality
                    ->addMedia($file)
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection('banners');
            }

            return $municipality->fresh(['settings', 'media']);
        }, attempts: 3);
    }
}
