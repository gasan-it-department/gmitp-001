{{-- Section heading bar — bold title left, optional meta string right. --}}
<div class="mb-2 flex items-baseline justify-between border-b border-slate-300 pb-1">
    <h2 class="text-[11pt] font-bold tracking-tight text-slate-900">{{ $title }}</h2>
    @if(!empty($meta))
        <p class="text-[8pt] text-slate-500">{{ $meta }}</p>
    @endif
</div>
