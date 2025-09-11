<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your CryptoAI Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #ffffff;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #1f2937;
        }

        .header {
            text-align: center;
            padding: 40px 20px 20px;
            background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
        }

        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            margin-bottom: 16px;
        }

        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: white;
        }

        .brand-name {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 0;
        }

        .content {
            padding: 40px 20px;
            background: #374151;
        }

        .mail-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .mail-svg {
            width: 40px;
            height: 40px;
            fill: white;
        }

        .title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin: 0 0 16px;
            color: #ffffff;
        }

        .subtitle {
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
            margin: 0 0 32px;
            color: #d1d5db;
        }

        .greeting {
            font-size: 16px;
            margin: 0 0 20px;
            color: #ffffff;
        }

        .message {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 32px;
            color: #d1d5db;
        }

        .verify-button {
            display: block;
            width: fit-content;
            margin: 0 auto 32px;
            padding: 16px 32px;
            background: linear-gradient(135deg, #0891b2 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.2s;
        }

        .verify-button:hover {
            background: linear-gradient(135deg, #0e7490 0%, #1e40af 100%);
            transform: translateY(-1px);
        }

        .alternative-text {
            font-size: 14px;
            line-height: 1.6;
            color: #9ca3af;
            margin: 32px 0;
            padding: 20px;
            background: #4b5563;
            border-radius: 8px;
            border-left: 4px solid #22d3ee;
        }

        .link-text {
            word-break: break-all;
            color: #22d3ee;
            text-decoration: none;
        }

        .footer {
            padding: 30px 20px;
            background: #111827;
            text-align: center;
            border-top: 1px solid #374151;
        }

        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 16px;
        }

        .footer-links {
            font-size: 14px;
        }

        .footer-links a {
            color: #22d3ee;
            text-decoration: none;
            margin: 0 8px;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        .security-notice {
            margin: 20px 0;
            padding: 16px;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            color: #92400e;
        }

        .security-notice h4 {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 600;
        }

        .security-notice p {
            margin: 0;
            font-size: 14px;
        }

        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }

            .title {
                font-size: 24px;
            }

            .brand-name {
                font-size: 28px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <span class="logo-text">AI</span>
            </div>
            <h1 class="brand-name">CryptoAI</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="mail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-mail-icon lucide-mail">
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
            </div>

            <h2 class="title">Verify Your Email Address</h2>
            <p class="subtitle">Complete your CryptoAI account setup</p>

            <p class="greeting">Hello {{ $user->name ?? 'there' }},</p>

            <p class="message">
                Welcome to CryptoAI! We're excited to have you join our community. To get started with your account and
                ensure the security of your profile, please verify your email address by clicking the button below.
            </p>

            <a href="{!! $verificationUrl !!}" class="verify-button">
                Verify Email Address
            </a>

            <div class="alternative-text">
                <strong>Having trouble with the button?</strong><br>
                Copy and paste this link into your browser:<br>
                <a href="{!! $verificationUrl !!}" class="link-text">{!! $verificationUrl !!}</a>
            </div>

            <div class="security-notice">
                <h4>🔐 Security Notice</h4>
                <p>This verification link will expire in 60 minutes for your security. If you didn't create an account
                    with CryptoAI, please ignore this email.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                This email was sent to {{ $user->email ?? 'your email address' }}
            </p>
            <div class="footer-links">
                <a href="{{ config('app.url') }}">Visit CryptoAI</a>
                <a href="{{ config('app.url') }}/support">Support</a>
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a>
            </div>
            <p class="footer-text" style="margin-top: 20px;">
                © {{ date('Y') }} CryptoAI. All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>
