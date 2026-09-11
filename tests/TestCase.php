<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use LogicException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");
        $database = (string) config("database.connections.{$connection}.database");
        $isInMemorySqlite = $driver === 'sqlite' && $database === ':memory:';
        $isClearlyNamedTestDatabase = str_contains(strtolower($database), 'test');

        if (! $isInMemorySqlite && ! $isClearlyNamedTestDatabase) {
            throw new LogicException(
                "Refusing to run tests against non-test database [{$database}]. Clear Laravel's config cache or select a dedicated test database.",
            );
        }
    }
}
