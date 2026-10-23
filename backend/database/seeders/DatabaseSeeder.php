<?php

namespace Database\Seeders;

use App\Models\Drill;
use App\Models\Registration;
use App\Models\Team;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $teams = collect([
            ['name' => 'U10', 'division' => 'Under 10'],
            ['name' => 'U12', 'division' => 'Under 12'],
            ['name' => 'U15', 'division' => 'Under 15'],
            ['name' => 'U18', 'division' => 'Under 18'],
        ])->map(fn (array $team) => Team::factory()->create($team));

        $venues = collect([
            ['name' => 'Rizal Memorial Training Ground', 'address' => 'P. Ocampo Street, Malate, Manila', 'capacity' => 90],
            ['name' => 'Makati Sports Club Pitch', 'address' => 'Makati Avenue, Makati City', 'capacity' => 70],
            ['name' => 'Quezon City Football Field', 'address' => 'Commonwealth Avenue, Quezon City', 'capacity' => 110],
        ])->map(fn (array $venue) => Venue::factory()->create($venue));

        $admin = User::factory()->create([
            'name' => 'John Crismel J. Boligao',
            'email' => 'admin@gmail.com',
            'password' => 'password',
            'role' => 'admin',
            'team_id' => null,
        ]);

        $coaches = collect([
            User::factory()->create(['name' => 'Miguel Santos', 'email' => 'miguel.coach@gmail.com', 'password' => 'password', 'role' => 'coach', 'team_id' => $teams[0]->id]),
            User::factory()->create(['name' => 'Liza Bautista', 'email' => 'liza.coach@gmail.com', 'password' => 'password', 'role' => 'coach', 'team_id' => $teams[2]->id]),
        ]);

        $players = collect([User::factory()->create([
            'name' => 'Klint Joseph Taylaran',
            'email' => 'player@gmail.com',
            'password' => 'password',
            'role' => 'player',
            'team_id' => $teams[0]->id,
        ])]);

        $drillData = [
            ['name' => 'Triangle Passing', 'category' => 'passing'],
            ['name' => 'One-Touch Rondo', 'category' => 'passing'],
            ['name' => 'Switch the Play', 'category' => 'passing'],
            ['name' => 'Cone Weave', 'category' => 'dribbling'],
            ['name' => '1v1 Change of Direction', 'category' => 'dribbling'],
            ['name' => 'Close-Control Gates', 'category' => 'dribbling'],
            ['name' => 'First-Time Finishing', 'category' => 'shooting'],
            ['name' => 'Shooting from the Edge', 'category' => 'shooting'],
            ['name' => 'Cross and Finish', 'category' => 'shooting'],
            ['name' => 'Repeated Sprint Relay', 'category' => 'fitness'],
            ['name' => 'Agility Ladder Circuit', 'category' => 'fitness'],
            ['name' => 'Four-Corner Movement', 'category' => 'fitness'],
            ['name' => '1v1 Channel Defending', 'category' => 'defending'],
            ['name' => 'Recover and Delay', 'category' => 'defending'],
            ['name' => 'Defensive Line Shift', 'category' => 'defending'],
        ];
        $drills = collect($drillData)->map(fn (array $drill, int $index) => Drill::factory()->create([
            ...$drill,
            'description' => 'A coached '.strtolower($drill['category']).' exercise focused on decision-making and technique.',
            'default_minutes' => 10 + ($index % 4) * 5,
        ]));

        $sessions = collect();
        $sessionTitlesByAgeGroup = [
            ['U10 Ball Mastery', 'U10 Dribbling and Control', 'U10 Passing Basics'],
            ['U12 Passing Patterns', 'U12 First Touch and Movement', 'U12 Small-Sided Games'],
            ['U15 Finishing and Movement', 'U15 Combination Play', 'U15 Speed and Agility'],
            ['U18 Defensive Shape', 'U18 Pressing and Transition', 'U18 Match Preparation'],
        ];
        for ($index = 0; $index < 25; $index++) {
            $team = $teams[$index % 4];
            // Rotate coaches by age-group block so each team has sessions with both coaches.
            $coach = $coaches[intdiv($index, 4) % 2];
            $teamTitles = $sessionTitlesByAgeGroup[$index % 4];
            $sessionDate = $index < 8
                ? Carbon::today()->subDays(8 - $index)
                : ($index === 8 ? Carbon::today() : Carbon::today()->addDays($index - 8));
            $status = match (true) {
                $index < 8 => 'completed',
                $index === 8 => 'ongoing',
                $index === 17 => 'cancelled',
                default => 'scheduled',
            };

            $session = TrainingSession::factory()->create([
                'title' => $teamTitles[intdiv($index, 4) % count($teamTitles)],
                'description' => 'Age-appropriate technical and tactical training with coached small-sided play.',
                'session_date' => $sessionDate,
                'status' => $status,
                'coach_id' => $coach->id,
                'team_id' => $team->id,
                'venue_id' => $venues[$index % 3]->id,
                'max_players' => 18,
            ]);
            $sessions->push($session);

            $drillSelection = collect([$index % 15, ($index + 5) % 15, ($index + 10) % 15])->unique();
            foreach ($drillSelection->values() as $order => $drillIndex) {
                $session->drills()->attach($drills[$drillIndex]->id, [
                    'sort_order' => $order + 1,
                    'minutes' => $drills[$drillIndex]->default_minutes,
                ]);
            }

            $teamPlayers = $players->where('team_id', $team->id)->values();
            foreach ($teamPlayers as $playerIndex => $player) {
                $registrationStatus = ['pending', 'approved', 'rejected', 'approved', 'cancelled'][($index + $playerIndex) % 5];
                Registration::factory()->create([
                    'user_id' => $player->id,
                    'training_session_id' => $session->id,
                    'status' => $registrationStatus,
                    'attended' => $status === 'completed' && $registrationStatus === 'approved'
                        ? (bool) ($playerIndex % 2)
                        : null,
                ]);
            }
        }
    }
}
