<?php
// WILWIN contact form handler — sends submissions to info@wilwininitiative.org via PHP mail().
// Edit $to_address below if you want submissions delivered somewhere else.

header('Content-Type: application/json');

$to_address = 'info@wilwininitiative.org';

function respond($success, $error = '') {
    echo json_encode(['success' => $success, 'error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'method_not_allowed');
}

// Honeypot: real visitors never fill this hidden field, bots often do.
if (!empty($_POST['website'])) {
    respond(true); // pretend success so bots don't retry
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$role    = trim($_POST['role'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    respond(false, 'missing_fields');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'invalid_email');
}

// Strip line breaks from header-bound fields to block header injection.
$name  = str_replace(["\r", "\n"], '', $name);
$email = str_replace(["\r", "\n"], '', $email);

$domain = preg_replace('/^www\./', '', $_SERVER['SERVER_NAME'] ?? 'wilwininitiative.org');
$from_address = 'noreply@' . $domain;

$subject = 'New WILWIN website enquiry from ' . $name;

$body  = "You have a new message from the WILWIN website contact form.\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "I am a: " . ($role !== '' ? $role : 'Not specified') . "\n\n";
$body .= "Message:\n{$message}\n";

$headers  = "From: WILWIN Website <{$from_address}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($to_address, $subject, $body, $headers);

if ($sent) {
    respond(true);
} else {
    respond(false, 'mail_failed');
}
