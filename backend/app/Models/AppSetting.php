<?php

namespace App\Models;

use Database\Factories\AppSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Platform-wide settings. The table holds a single row; use AppSetting::current().
 */
#[Fillable([
    'tip_fee_fixed', 'tip_fee_percent', 'business_subscription_required', 'user_subscription_required',
    'support_url', 'support_email', 'terms_and_conditions', 'user_plan_monthly', 'user_plan_yearly',
    'business_plan_monthly', 'business_plan_yearly', 'free_trial_days', 'payout_debtor_name', 'payout_debtor_iban',
    'payout_debtor_bic',
])]
class AppSetting extends Model
{
    /** @use HasFactory<AppSettingFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tip_fee_fixed' => 'decimal:2',
            'tip_fee_percent' => 'decimal:2',
            'business_subscription_required' => 'boolean',
            'user_subscription_required' => 'boolean',
            'user_plan_monthly' => 'decimal:2',
            'user_plan_yearly' => 'decimal:2',
            'business_plan_monthly' => 'decimal:2',
            'business_plan_yearly' => 'decimal:2',
            'free_trial_days' => 'integer',
            'payout_debtor_iban' => 'encrypted',
        ];
    }

    public static function current(): self
    {
        $settings = static::query()->firstOrCreate([]);

        // A row created just now does not hold the column defaults yet.
        return $settings->wasRecentlyCreated ? $settings->refresh() : $settings;
    }
}
