<?php

namespace App\External\Api\Controllers\BulletinBoard;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Services\CreateAnnouncementService;
use App\External\Api\Request\BulletinBoard\AnnouncementRequest;
use App\Core\BulletinBoard\Announcement\Services\PublishAnnouncementService;

class AnnouncementController
{
    public function __construct(
        protected CreateAnnouncementService $announcementService,
        protected PublishAnnouncementService $publishService,
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
        //return all announcement data
        //paginate
        //search

    }

    public function show()
    {
        //show announcement per id
    }

    public function update()
    {

    }

    public function destroy()
    {

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