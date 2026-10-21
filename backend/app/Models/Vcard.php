<?php

namespace App\Models;

use Database\Factories\VcardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Digital business card shown at /vcards/{user slug}. Theme 1 is the fixed green
 * design, theme 2 uses the user's own colours (VcardTheme).
 */
#[Fillable([
    'business_name', 'business_title', 'business_email', 'business_address', 'latitude', 'longitude',
    'logo', 'banner', 'theme', 'social_links', 'google_review_url', 'ambassador_url', 'appointment_url',
    'show_business_name', 'show_location', 'show_opening_hours', 'show_review', 'show_business_icon',
    'show_email_icon', 'show_phone_icon', 'show_address_icon', 'is_active',
])]
class Vcard extends Model
{
    /** @use HasFactory<VcardFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'theme' => 'integer',
            'social_links' => 'array',
            'show_business_name' => 'boolean',
            'show_location' => 'boolean',
            'show_opening_hours' => 'boolean',
            'show_review' => 'boolean',
            'show_business_icon' => 'boolean',
            'show_email_icon' => 'boolean',
            'show_phone_icon' => 'boolean',
            'show_address_icon' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public const int THEME_GREEN = 1;

    public const int THEME_CUSTOM = 2;

    public function logoUrl(): ?string
    {
        return self::imageUrl($this->logo, 'vcard-logos/', 'business');
    }

    /**
     * Without an own banner the card shows the old app's default picture.
     */
    public function bannerUrl(): ?string
    {
        return self::imageUrl($this->banner === 'default.jpg' ? null : $this->banner, 'vcard-banners/', 'vcard');
    }

    /**
     * New uploads live on the public disk; older ones are still served by the old app.
     */
    private static function imageUrl(?string $path, string $prefix, string $legacyFolder): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, $prefix)) {
            return Storage::disk('public')->url($path);
        }

        $legacy = config('tiqs.legacy_assets_url');

        return $legacy === '' ? null : $legacy.'/images/'.$legacyFolder.'/'.rawurlencode($path);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
