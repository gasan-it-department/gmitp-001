<?php


namespace App\External\Web\Controllers\Tourism\Admin;

use App\Core\Tourism\Enums\CategoryType;
use App\Core\Tourism\UseCase\Category\GetFilteredCategories;
use App\External\Api\Resources\Tourism\CategoryListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CreateCategoryController extends Controller
{

    public function __construct(
        private GetFilteredCategories $getFilteredCategories
    ) {
    }

    public function __invoke()
    {

        return Inertia::render(
            'Tourism/Admin/Category/CategoriesIndex',
            [
                'typeOption' => CategoryType::getDropdownOptions(),
                'categories' => CategoryListResource::collection($this->getFilteredCategories->execute(app('municipal_id'))),
            ]
        );

    }

}