<?php

namespace App\Core\Feedback\Actions;

use App\Core\Department\Models\Department;
use App\Core\Feedback\Models\FeedbackSubmission;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ListDepartmentRatingsAction
{
    private const MINIMUM_PUBLIC_FEEDBACK_COUNT = 5;

    public function execute(string $municipalId): array
    {
        $ratings = FeedbackSubmission::query()
            ->select([
                'department_id',
                DB::raw('COUNT(*) as feedback_count'),
                DB::raw('AVG(rating) as average_rating'),
                DB::raw('MAX(created_at) as latest_feedback_at'),
                DB::raw('SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count'),
                DB::raw('SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_count'),
                DB::raw('SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_count'),
                DB::raw('SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_count'),
                DB::raw('SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_count'),
            ])
            ->where('municipal_id', $municipalId)
            ->whereNotNull('department_id')
            ->whereNotNull('rating')
            ->groupBy('department_id');

        $departments = Department::query()
            ->leftJoinSub($ratings, 'ratings', function ($join) {
                $join->on('departments.id', '=', 'ratings.department_id');
            })
            ->where('departments.municipal_id', $municipalId)
            ->where('departments.is_active', true)
            ->orderByRaw('COALESCE(ratings.average_rating, 0) DESC')
            ->orderBy('departments.name')
            ->get([
                'departments.id',
                'departments.name',
                'departments.code',
                'departments.description',
                DB::raw('COALESCE(ratings.feedback_count, 0) as feedback_count'),
                DB::raw('ratings.average_rating as average_rating'),
                DB::raw('ratings.latest_feedback_at as latest_feedback_at'),
                DB::raw('COALESCE(ratings.five_star_count, 0) as five_star_count'),
                DB::raw('COALESCE(ratings.four_star_count, 0) as four_star_count'),
                DB::raw('COALESCE(ratings.three_star_count, 0) as three_star_count'),
                DB::raw('COALESCE(ratings.two_star_count, 0) as two_star_count'),
                DB::raw('COALESCE(ratings.one_star_count, 0) as one_star_count'),
            ])
            ->map(fn ($department) => $this->formatDepartmentRating($department))
            ->values();

        return [
            'departments' => $departments,
            'summary' => $this->buildSummary($departments),
            'minimum_feedback_count' => self::MINIMUM_PUBLIC_FEEDBACK_COUNT,
        ];
    }

    private function formatDepartmentRating(object $department): array
    {
        $feedbackCount = (int) $department->feedback_count;
        $isPublic = $feedbackCount >= self::MINIMUM_PUBLIC_FEEDBACK_COUNT;
        $averageRating = $department->average_rating !== null ? round((float) $department->average_rating, 1) : null;

        return [
            'id' => $department->id,
            'name' => $department->name,
            'code' => $department->code,
            'description' => $department->description,
            'feedback_count' => $feedbackCount,
            'average_rating' => $isPublic ? $averageRating : null,
            'rating_label' => $isPublic && $averageRating !== null ? $this->ratingLabel($averageRating) : 'Not enough feedback yet',
            'latest_feedback_at' => $isPublic ? $department->latest_feedback_at : null,
            'distribution' => $isPublic ? [
                5 => (int) $department->five_star_count,
                4 => (int) $department->four_star_count,
                3 => (int) $department->three_star_count,
                2 => (int) $department->two_star_count,
                1 => (int) $department->one_star_count,
            ] : [
                5 => 0,
                4 => 0,
                3 => 0,
                2 => 0,
                1 => 0,
            ],
            'is_public' => $isPublic,
        ];
    }

    private function buildSummary(Collection $departments): array
    {
        $publicDepartments = $departments->where('is_public', true);
        $totalPublicFeedback = $publicDepartments->sum('feedback_count');

        $weightedAverage = $totalPublicFeedback > 0
            ? $publicDepartments->sum(fn (array $department) => $department['average_rating'] * $department['feedback_count']) / $totalPublicFeedback
            : null;

        return [
            'active_departments' => $departments->count(),
            'rated_departments' => $publicDepartments->count(),
            'total_public_feedback_count' => $totalPublicFeedback,
            'average_rating' => $weightedAverage !== null ? round($weightedAverage, 1) : null,
        ];
    }

    private function ratingLabel(float $rating): string
    {
        return match (true) {
            $rating >= 4.5 => 'Excellent service',
            $rating >= 4.0 => 'Very good service',
            $rating >= 3.0 => 'Good service',
            $rating >= 2.0 => 'Needs improvement',
            default => 'Needs urgent attention',
        };
    }
}
