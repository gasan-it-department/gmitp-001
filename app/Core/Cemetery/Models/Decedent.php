<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\DecedentTypes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Decedent extends Model
{
    use SoftDeletes;

    protected $table = 'cemetery_decedents';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'memorial_name',
        'date_of_birth',
        'date_of_death',
        'date_of_registration',
        'decedent_type',
        'reference_document_type',
        'reference_document_number',
        'place_of_death',
        'gender',
        'cause_of_death',
        'death_certificate_no',
        'notes',
        'municipal_id',
        'address_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'date_of_registration' => 'date',
        'decedent_type' => DecedentTypes::class,
    ];

    /**
     * A decedent has at most one active interment lifecycle record. We treat
     * the latest interment row as the "current" one — exhumation/transfer
     * creates a new row via the lifecycle use cases.
     */
    public function currentInterment(): HasOne
    {
        return $this->hasOne(Interment::class, 'decedent_id')->latestOfMany();
    }

    public function interments(): HasMany
    {
        return $this->hasMany(Interment::class, 'decedent_id');
    }

    /**
     * Derived age at death — null when either date is missing.
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: function (): ?int {
                if (! $this->date_of_birth || ! $this->date_of_death) {
                    return null;
                }

                return (int) Carbon::parse($this->date_of_birth)
                    ->diffInYears(Carbon::parse($this->date_of_death));
            }
        );
    }
}
