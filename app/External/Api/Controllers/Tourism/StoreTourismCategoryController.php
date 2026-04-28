<?php

namespace App\External\Api\Controllers\Tourism;

use App\Core\Tourism\Dto\StoreCategoryDto;
use App\Core\Tourism\UseCase\Category\StoreCategoryAction;
use App\External\Api\Request\Tourism\StoreTourismCategoryRequest;
use App\Http\Controllers\Controller;

class StoreTourismCategoryController extends Controller
{

    public function __construct(
        private StoreCategoryAction $storeCategoryAction,
    ) {
    }
    public function __invoke(StoreTourismCategoryRequest $request)
    {

        $dto = StoreCategoryDto::fromRequest($request);

        $categoy = $this->storeCategoryAction->execute($dto);

        return redirect()->back()->with('success', 'Category created.');

    }

}