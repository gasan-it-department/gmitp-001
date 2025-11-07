<?php

namespace App\External\Api\Controllers\BulletinBoard;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Services\CreateAnnouncementService;
use App\External\Api\Request\BulletinBoard\AnnouncementRequest;
use App\Core\BulletinBoard\Announcement\Services\PublishAnnouncementService;
use App\Core\BulletinBoard\Announcement\Services\UpdateAnnouncementService;
use App\Core\BulletinBoard\Announcement\Models\Announcement;

class AnnouncementController
{
    public function __construct(
        protected CreateAnnouncementService $announcementService,
        protected PublishAnnouncementService $publishService,
        protected UpdateAnnouncementService $updateService,
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
                userId: $userId
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

    public function index()
    {
        try {
            $announcements = Announcement::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function show()
    {
        //show announcement per id
    }

    public function update(AnnouncementRequest $request, string $id)
    {
        try {
            $validated = $request->validated();

            $announcement = $this->updateService->execute($id, [
                'title' => $validated['title'] ?? null,
                'message' => $validated['message'] ?? null,
                'is_published' => $validated['is_published'] ?? false,
            ]);

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
            ], 500);
        }
    }


    public function destroy(string $id)
    {
        try {
            $announcement = Announcement::findOrFail($id);
            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully.',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function approve()
    {

    }

    public function reject()
    {

    }

    public function publish($id)
    {
        // try {
        //     $this->publishService->execute($id);
        // } catch (\Exception $e) {
        // }
    }
}