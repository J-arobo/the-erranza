<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminBookingController;
use App\Http\Controllers\Api\Admin\AdminDisputeController;
use App\Http\Controllers\Api\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\Admin\AdminListingController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminVendorController;
use App\Http\Controllers\Api\Admin\AdminVerificationController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminAdminController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminAuditLogController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminConfigController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminDisputeController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminFinancialController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminPaymentController;
use App\Http\Controllers\Api\SuperAdmin\SuperAdminUserController;
use App\Http\Controllers\Api\Vendor\VendorBookingController;
use App\Http\Controllers\Api\Vendor\VendorListingController;
use App\Http\Controllers\Api\Vendor\VendorMessageController;
use App\Http\Controllers\Api\Vendor\VendorNotificationController;
use App\Http\Controllers\Api\Vendor\VendorProfileController;
use App\Http\Controllers\Api\Vendor\VendorReviewController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Public listing browsing — no auth required.
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);

// Traveller-facing — any authenticated account.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking}/messages', [MessageController::class, 'store']);
    Route::post('/bookings/{booking}/review', [ReviewController::class, 'store']);
});

Route::prefix('vendor')->middleware(['auth:sanctum', 'vendor'])->group(function () {
    Route::get('/me', [VendorProfileController::class, 'show']);

    Route::apiResource('listings', VendorListingController::class);

    Route::get('/bookings', [VendorBookingController::class, 'index']);
    Route::get('/bookings/{booking}', [VendorBookingController::class, 'show']);
    Route::post('/bookings/{booking}/accept', [VendorBookingController::class, 'accept']);
    Route::post('/bookings/{booking}/decline', [VendorBookingController::class, 'decline']);
    Route::post('/bookings/{booking}/propose-dates', [VendorBookingController::class, 'proposeDates']);
    Route::post('/bookings/{booking}/cancel', [VendorBookingController::class, 'cancel']);

    Route::get('/messages', [VendorMessageController::class, 'index']);
    Route::get('/messages/{booking}', [VendorMessageController::class, 'show']);
    Route::post('/messages/{booking}', [VendorMessageController::class, 'store']);

    Route::get('/reviews', [VendorReviewController::class, 'index']);
    Route::post('/reviews/{review}/reply', [VendorReviewController::class, 'reply']);

    Route::get('/notifications', [VendorNotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [VendorNotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [VendorNotificationController::class, 'markAllRead']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/verifications', [AdminVerificationController::class, 'index']);
    Route::post('/verifications/{submission}/approve', [AdminVerificationController::class, 'approve']);
    Route::post('/verifications/{submission}/reject', [AdminVerificationController::class, 'reject']);

    Route::get('/vendors', [AdminVendorController::class, 'index']);
    Route::post('/vendors/{vendor}/suspend', [AdminVendorController::class, 'suspend']);
    Route::post('/vendors/{vendor}/reinstate', [AdminVendorController::class, 'reinstate']);
    Route::get('/vendors/{vendor}/performance', [AdminVendorController::class, 'performance']);

    Route::get('/listings', [AdminListingController::class, 'index']);
    Route::post('/listings/{listing}/suspend', [AdminListingController::class, 'suspend']);
    Route::post('/listings/{listing}/reinstate', [AdminListingController::class, 'reinstate']);

    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::post('/reviews/{review}/remove', [AdminReviewController::class, 'remove']);
    Route::post('/reviews/{review}/restore', [AdminReviewController::class, 'restore']);

    Route::get('/bookings', [AdminBookingController::class, 'index']);

    Route::get('/disputes', [AdminDisputeController::class, 'index']);
    Route::post('/disputes/{dispute}/resolve', [AdminDisputeController::class, 'resolve']);
    Route::post('/disputes/{dispute}/escalate', [AdminDisputeController::class, 'escalate']);

    Route::get('/audit-log', [AdminAuditLogController::class, 'index']);
});

Route::prefix('super-admin')->middleware(['auth:sanctum', 'super_admin'])->group(function () {
    Route::get('/admins', [SuperAdminAdminController::class, 'index']);
    Route::post('/admins', [SuperAdminAdminController::class, 'promote']);
    Route::post('/admins/{user}/promote-super', [SuperAdminAdminController::class, 'promoteSuper']);
    Route::post('/admins/{user}/revoke', [SuperAdminAdminController::class, 'revoke']);

    Route::get('/users', [SuperAdminUserController::class, 'index']);
    Route::post('/users/{user}/suspend', [SuperAdminUserController::class, 'suspend']);
    Route::post('/users/{user}/reinstate', [SuperAdminUserController::class, 'reinstate']);
    Route::delete('/users/{user}', [SuperAdminUserController::class, 'destroy']);

    Route::get('/config', [SuperAdminConfigController::class, 'show']);
    Route::put('/config', [SuperAdminConfigController::class, 'update']);

    Route::get('/payments', [SuperAdminPaymentController::class, 'index']);

    Route::get('/disputes', [SuperAdminDisputeController::class, 'index']);
    Route::post('/disputes/{dispute}/override', [SuperAdminDisputeController::class, 'override']);

    Route::get('/financials', [SuperAdminFinancialController::class, 'index']);

    Route::get('/audit-log', [SuperAdminAuditLogController::class, 'index']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel & React are connected! 🎉',
        'status' => 'success',
    ]);
});
