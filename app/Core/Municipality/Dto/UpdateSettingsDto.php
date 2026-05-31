<?php

namespace App\Core\Municipality\Dto;

use App\External\Api\Request\Municipality\UpdateSettingsRequest;
use Illuminate\Http\UploadedFile;

readonly class UpdateSettingsDto
{
    public function __construct(
        public string        $municipalId,
        public ?string       $primaryColorHex,
        public ?string       $contactEmail,
        public ?string       $trunklinePhone,
        public ?string       $officeHours,
        public ?string       $facebookUrl,
        public ?UploadedFile $logo = null,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array         $banners = [],
        /** @var array<int, string> */
        public array         $removeBannerIds = [],
    ) {
    }

    public static function fromRequest(UpdateSettingsRequest $request, string $municipalId): self
    {
        return new self(
            municipalId:     $municipalId,
            primaryColorHex: $request->has('primary_color_hex')
                ? ($request->input('primary_color_hex') !== null
                    ? $request->string('primary_color_hex')->toString()
                    : null)
                : null,
            contactEmail:    $request->has('contact_email')
                ? ($request->input('contact_email') !== null
                    ? $request->string('contact_email')->toString()
                    : null)
                : null,
            trunklinePhone:  $request->has('trunkline_phone')
                ? ($request->input('trunkline_phone') !== null
                    ? $request->string('trunkline_phone')->toString()
                    : null)
                : null,
            officeHours:     $request->has('office_hours')
                ? ($request->input('office_hours') !== null
                    ? $request->string('office_hours')->toString()
                    : null)
                : null,
            facebookUrl:     $request->has('facebook_url')
                ? ($request->input('facebook_url') !== null
                    ? $request->string('facebook_url')->toString()
                    : null)
                : null,
            logo:            $request->file('logo'),
            banners:         $request->file('banners', []) ?? [],
            removeBannerIds: $request->input('remove_banner_ids', []) ?? [],
        );
    }
}
