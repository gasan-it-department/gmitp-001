<?php

namespace App\Core\ActionCenter\Beneficiaries\Models;

use Illuminate\Database\Eloquent\Model;
use Database\Factories\BeneficiaryFactory;
use Laravel\Scout\Searchable; // 1. Import Scout
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Core\ActionCenter\Requests\Models\AssistanceRequest;

class Beneficiary extends Model
{
    use HasFactory, Searchable; // 2. Add Trait
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'assistance_beneficiaries';

    protected $fillable = [

        'id',

        'municipality_id',

        'first_name',

        'middle_name',

        'last_name',

        'suffix',

        'birth_date',

        'province',

        'municipality',

        'barangay',

    ];

    protected $casts = [

        'first_name' => 'encrypted',

        'last_name' => 'encrypted',

        'middle_name' => 'encrypted',

        'suffix' => 'encrypted',

    ];

    protected static function newFactory()
    {
        return BeneficiaryFactory::new();
    }

    public function toSearchableArray()
    {

        return [
            'id' => $this->id,
            'first_name' => $this->first_name, // Sends "Harvey" (Plain Text) to index
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'contact_number' => $this->contact_number,
            'municipality_id' => $this->municipality_id,
        ];
    }


    public function scopeSearchBeneficiary($query, string $lowerSearchTerm)
    {

        return $query->where(function ($q) use ($lowerSearchTerm) {
            $q->whereRaw('LOWER(first_name) LIKE ?', [$lowerSearchTerm])
                ->orWhereRaw('LOWER(last_name) LIKE ?', [$lowerSearchTerm])
                ->orWhereRaw('LOWER(middle_name) LIKE ?', [$lowerSearchTerm])
                ->orWhereRaw('LOWER(contact_number) LIKE ?', [$lowerSearchTerm]);
        });

    }

    public function assistanceRequests()
    {

        return $this->hasMany(AssistanceRequest::class, 'beneficiary_id');

    }
}