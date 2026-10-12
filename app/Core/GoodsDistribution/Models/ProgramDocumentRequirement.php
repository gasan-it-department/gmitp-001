<?php

namespace App\Core\GoodsDistribution\Models;

final class ProgramDocumentRequirement extends GoodsModel
{
    protected $table = 'gd_program_document_requirements';

    protected $casts = ['is_required' => 'boolean'];
}
