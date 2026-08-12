<?php

namespace App\External\Web\Controllers\Public;

use App\Core\Announcement\Models\Announcement;
use App\Core\Event\Models\Event;
use App\Core\Municipality\Models\Municipality;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class SitemapController extends Controller
{
    /** @var list<string> */
    private const MUNICIPAL_ROUTE_NAMES = [
        'home',
        'privacy',
        'contact',
        'travel',
        'executiveOrders',
        'wedding',
        'government.roster',
        'transparency.index',
        'announcement.index',
        'event.index',
    ];

    public function __invoke(): Response
    {
        $municipalities = Municipality::query()
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->get(['id', 'slug', 'updated_at']);

        $urls = collect([$this->entry(route('landing'))]);

        $municipalities->each(function (Municipality $municipality) use ($urls): void {
            foreach (self::MUNICIPAL_ROUTE_NAMES as $routeName) {
                $urls->push($this->entry(
                    route($routeName, ['municipality' => $municipality->slug]),
                    $municipality->updated_at?->toDateString(),
                ));
            }
        });

        $this->appendAnnouncements($urls, $municipalities);
        $this->appendEvents($urls, $municipalities);

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    /**
     * @param  Collection<int, array{loc: string, lastmod: string|null}>  $urls
     * @param  Collection<int, Municipality>  $municipalities
     */
    private function appendAnnouncements(Collection $urls, Collection $municipalities): void
    {
        $slugByMunicipality = $municipalities->pluck('slug', 'id');

        Announcement::query()
            ->whereIn('municipal_id', $slugByMunicipality->keys())
            ->where('is_published', true)
            ->orderBy('id')
            ->get(['id', 'municipal_id', 'updated_at'])
            ->each(function (Announcement $announcement) use ($urls, $slugByMunicipality): void {
                $slug = $slugByMunicipality->get($announcement->municipal_id);

                if (! $slug) {
                    return;
                }

                $urls->push($this->entry(
                    route('announcement.show', [
                        'municipality' => $slug,
                        'announcement' => $announcement->id,
                    ]),
                    $announcement->updated_at?->toDateString(),
                ));
            });
    }

    /**
     * @param  Collection<int, array{loc: string, lastmod: string|null}>  $urls
     * @param  Collection<int, Municipality>  $municipalities
     */
    private function appendEvents(Collection $urls, Collection $municipalities): void
    {
        $slugByMunicipality = $municipalities->pluck('slug', 'id');

        Event::query()
            ->whereIn('municipal_id', $slugByMunicipality->keys())
            ->where('is_published', true)
            ->orderBy('id')
            ->get(['id', 'municipal_id', 'updated_at'])
            ->each(function (Event $event) use ($urls, $slugByMunicipality): void {
                $slug = $slugByMunicipality->get($event->municipal_id);

                if (! $slug) {
                    return;
                }

                $urls->push($this->entry(
                    route('event.show', [
                        'municipality' => $slug,
                        'event' => $event->id,
                    ]),
                    $event->updated_at?->toDateString(),
                ));
            });
    }

    /** @return array{loc: string, lastmod: string|null} */
    private function entry(string $location, ?string $lastModified = null): array
    {
        return ['loc' => $location, 'lastmod' => $lastModified];
    }
}
