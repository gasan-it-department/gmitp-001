<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AssistanceRequestFormFieldDefinition
{
    public function __construct(
        public string $key,
        public string $label,
        public string $type,
        public bool $required,
        public bool $adminOnly,
    ) {}

    /** @return array{key: string, label: string, type: string, required: bool, admin_only: bool} */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'type' => $this->type,
            'required' => $this->required,
            'admin_only' => $this->adminOnly,
        ];
    }
}
