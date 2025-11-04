<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel;

return new class extends Kernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('statistics:update')
            ->everyFiveMinutes();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/../app/Console/Commands');

        require base_path('routes/console.php');
    }
};

