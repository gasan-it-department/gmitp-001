<?php

namespace App\Core\GoodsDistribution\Models;

use App\Shared\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

abstract class GoodsModel extends Model
{
    use BelongsToMunicipality, HasUlids;

    protected $guarded = ['id'];
}
