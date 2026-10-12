<?php

namespace App\Core\GoodsDistribution\Models;

final class DistributionDocumentCheck extends GoodsModel
{
    protected $table = 'gd_distribution_document_checks';

    protected $casts = ['is_required' => 'boolean', 'checked_at' => 'datetime'];
}
