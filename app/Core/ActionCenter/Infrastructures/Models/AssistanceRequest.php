<?php

namespace App\Core\ActionCenter\Infrastructures\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Core\Users\Infrastructure\Models\User;
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
    ];

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}