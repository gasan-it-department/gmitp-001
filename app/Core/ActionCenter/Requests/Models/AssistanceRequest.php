<?php

namespace App\Core\ActionCenter\Requests\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\AssistanceRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Core\ActionCenter\Beneficiaries\Models\Beneficiary;

class AssistanceRequest extends Model
{

    use HasFactory;
    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'assistance_requests';

    protected $fillable = [

        'id',

        'transaction_number',

        'assistance_type',

        'description',

        'status',

        'beneficiary_id',

        'user_id',

        'municipal_id',

        'amount',

    ];

    protected $casts = [

        'description' => 'encrypted',

        'amount' => 'encrypted',

    ];

    protected static function newFactory()
    {
        return AssistanceRequestFactory::new();
    }

    public function beneficiary()
    {

        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');

    }

    public function user()
    {

        return $this->belongsTo(User::class, 'user_id');

    }
}