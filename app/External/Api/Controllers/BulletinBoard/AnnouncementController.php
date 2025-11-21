<?php

namespace App\External\Api\Controllers\BulletinBoard;

use App\Core\BulletinBoard\Announcement\Dto\UpdateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\UseCase\CreateAnnouncementUseCase;
use App\Core\BulletinBoard\Announcement\UseCase\DeleteAnnouncementUseCase;
use App\Core\BulletinBoard\Announcement\UseCase\GetAnnouncementUseCase;
use App\Core\BulletinBoard\Announcement\UseCase\GetPublishedAnnouncementsUseCase;
use App\Core\BulletinBoard\Announcement\UseCase\UpdateAnnouncementUseCase;
use Illuminate\Http\Request;
use App\External\Api\Request\BulletinBoard\AnnouncementRequest;
use App\Core\BulletinBoard\Announcement\Dto\AnnouncementQueryDto;
use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\External\Api\Resources\BulletinBoard\AnnouncementResource;
use App\Core\BulletinBoard\Announcement\Services\PublishAnnouncementService;

class AnnouncementController
{
    public function __construct(
        protected CreateAnnouncementUseCase $announcementService,
        protected PublishAnnouncementService $publishService,
        protected UpdateAnnouncementUseCase $updateUseCase,
        protected GetAnnouncementUseCase $getAnnouncementService,
        protected GetPublishedAnnouncementsUseCase $getPublishedAnnouncements,
        protected DeleteAnnouncementUseCase $deleteAnnouncement,
    ) {
    }

    public function store(AnnouncementRequest $request)
    {
        try {

            $validated = $request->validated();

            $userId = $request->user()->id;

            $dto = new CreateAnnouncementDto(
                title: $validated['title'],
                message: $validated['message'],
                userId: $userId,
                isPublish: true,
            );

            $announcement = $this->announcementService->execute($dto);

            return response()->json([
                'success' => true,
                'data' => $announcement,
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);

        }
    }

    public function fetch(Request $request)
    {
        try {

            $municipalId = app('municipal_id');

            $dto = new AnnouncementQueryDto(
                perPage: $request->input('per_page', 10),
                orderBy: $request->input('order_by', 'created_at'),
                direction: $request->input('direction', 'desc'),
                isPublished: $request->input('is_published', true),
            );

            $announcements = $this->getAnnouncementService->execute($dto, $municipalId);

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }

    public function getPublished(Request $request)
    {
        $municipalId = app('municipal_id');

        $dto = new AnnouncementQueryDto(
            perPage: $request->input('per_page', 10),
            orderBy: $request->input('order_by', 'created_at'),
            direction: $request->input('direction', 'desc'),
        );

        $announcements = $this->getPublishedAnnouncements->execute($municipalId, $dto);

        return AnnouncementResource::collection($announcements)
            ->additional([
                'success' => true,
            ]);
    }

    public function show($id)
    {
        //show announcement per id
    }

    public function update(AnnouncementRequest $request, $id)
    {
        try {

            $validated = $request->validated();

            $userId = auth()->id();

            $dto = new UpdateAnnouncementDto(
                title: $validated['title'],
                message: $validated['message'],
                userId: $userId,
            );

            $announcement = $this->updateUseCase->execute($id, $dto);

            return response()->json([
                'success' => true,
                'data' => $announcement,
            ]);

        } catch (\DomainException $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Announcement not found.',
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }

    public function destroy(string $id)
    {
        try {

            $this->deleteAnnouncement->execute($id);

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully.',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Announcement not found.',
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);

        }
    }

}