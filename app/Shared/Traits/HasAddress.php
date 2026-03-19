<?php

namespace App\Shared\Traits;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

trait HasAddress
{

    public function createAddressSnapshot(string $psgcBarangayId, string $streetName = null, IdGeneratorInterface $idGenerator): string
    {


        $barangay = DB::table('psgc_barangays as bar')
            ->join('psgc_municipalities  as mun', 'bar.municipality_id', '=', 'mun.id')
            ->join('psgc_provinces as prov', 'mun.province_id', '=', 'prov.id')
            ->join('psgc_regions as reg', 'prov.region_id', '=', 'reg.id')
            ->where('bar.id', $psgcBarangayId)
            ->select([
                'bar.id as barangay_id',
                'bar.name as barangay_name',
                'bar.psgc_code',
                'mun.id as municipality_id',
                'mun.name as municipality_name',
                'prov.id as province_id',
                'prov.name as province_name',
                'reg.id as region_id',
                'reg.name as region_name',
            ])->first();

        $snapshot = [
            'region' => $barangay->region_name,
            'province' => $barangay->province_name,
            'municipality' => $barangay->municipality_name,
            'barangay' => $barangay->barangay_name,
            'street' => $streetName ? trim(strtoupper($streetName)) : null,
        ];

        $addressId = $idGenerator->generate();

        $address = DB::table('addresses')->insert([
            'id' => $addressId,
            'psgc_region_id' => $barangay->region_id,
            'psgc_province_id' => $barangay->province_id,
            'psgc_municipality_id' => $barangay->municipality_id,
            'psgc_barangay_id' => $barangay->barangay_id,
            'address_snapshot' => json_encode($snapshot),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $addressId;
    }

}