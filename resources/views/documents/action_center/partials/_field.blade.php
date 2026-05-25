{{-- A single label/value pair used in two-column or three-column grids. --}}
<div>
    <p class="text-[8pt] font-bold tracking-widest text-slate-500 uppercase">{{ $label }}</p>
    <p class="mt-0.5 text-[10pt] font-medium text-slate-900">{{ $value !== null && $value !== '' ? $value : '—' }}</p>
</div>
