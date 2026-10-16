<?php

namespace App\Core\GoodsDistribution\Models;

final class DistributionDocumentCheck extends GoodsModel
{
    protected $table = 'gd_distribution_document_checks';

    protected $attributes = ['is_active' => true];

    protected $casts = ['is_required' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer', 'checked_at' => 'datetime'];
}
