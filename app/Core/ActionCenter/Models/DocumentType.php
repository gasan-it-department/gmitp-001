<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    use HasUlids;
    protected $table = 'ac_document_types';
    protected $guarded = [];
}