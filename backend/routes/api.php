<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


//To test if the API is working, you can create a simple route that returns a JSON response. Add the following code to your `routes/api.php` file:
    Route::get('/test', function () {
        return response()->json([
            'message' => 'Laravel & React are connected! 🎉',
            'status' => 'success'
        ]);
    });
