<?php

namespace App\Services;

use App\Models\Listing;
use Carbon\Carbon;

class ListingPricingService
{
    /**
     * Computes a booking's total. Every booking-creation entry point
     * (self-serve, M-Pesa STK, card verify) must call this instead of
     * inlining `price * guests * nights` — that duplication is what let
     * duration options, seasonal rates and group pricing silently do
     * nothing at checkout despite being configurable in the vendor editor.
     *
     * @param array{
     *   guests: int,
     *   nights?: int,
     *   check_in?: string|null,
     *   duration_option_id?: int|null,
     *   pricing_mode?: 'individual'|'group',
     *   group_tier_id?: int|null,
     * } $params
     * @return array{total: float, breakdown: array<string, mixed>}
     */
    public static function calculate(Listing $listing, array $params): array
    {
        $guests = max(1, (int) ($params['guests'] ?? 1));
        $nights = max(1, (int) ($params['nights'] ?? 1));
        $mode = $params['pricing_mode'] ?? 'individual';

        if ($mode === 'group') {
            abort_unless(!empty($params['group_tier_id']), 422, 'Please select a group pricing option.');

            $tier = $listing->groupPricingTiers()->find($params['group_tier_id']);
            abort_unless($tier, 422, 'Invalid group pricing option selected.');
            abort_unless(
                (int) $guests === (int) $tier->people_count,
                422,
                "This group price is for exactly {$tier->people_count} people — you selected {$guests}."
            );

            $total = round((float) $tier->total_price * $nights, 2);

            return [
                'total' => $total,
                'breakdown' => [
                    'mode' => 'group',
                    'group_tier_id' => $tier->id,
                    'people_count' => $tier->people_count,
                    'price_per_group' => (float) $tier->total_price,
                    'nights' => $nights,
                ],
            ];
        }

        $basePrice = (float) $listing->price;
        $durationOption = null;

        if (!empty($params['duration_option_id'])) {
            $durationOption = $listing->durationOptions()->find($params['duration_option_id']);
            if ($durationOption && $durationOption->price !== null) {
                $basePrice = (float) $durationOption->price;
            }
        }

        $seasonalRate = null;
        if (!empty($params['check_in'])) {
            $checkIn = Carbon::parse($params['check_in']);
            $seasonalRate = $listing->seasonalRates()
                ->whereDate('start_date', '<=', $checkIn)
                ->whereDate('end_date', '>=', $checkIn)
                ->first();
            if ($seasonalRate) {
                $basePrice = (float) $seasonalRate->price;
            }
        }

        $extraGuestPrice = $listing->extra_guest_price !== null
            ? (float) $listing->extra_guest_price
            : $basePrice;

        $perNight = $basePrice + ($guests > 1 ? ($guests - 1) * $extraGuestPrice : 0);
        $total = round($perNight * $nights, 2);

        return [
            'total' => $total,
            'breakdown' => [
                'mode' => 'individual',
                'base_price' => $basePrice,
                'extra_guest_price' => $extraGuestPrice,
                'guests' => $guests,
                'nights' => $nights,
                'duration_option_id' => $durationOption?->id,
                'seasonal_rate_id' => $seasonalRate?->id,
            ],
        ];
    }
}
