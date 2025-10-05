import React from 'react';

export default function PasswordResetEmail({ resetUrl, name }: { resetUrl: string; name: string }) {
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', color: '#111' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
          <h2>Reset your password</h2>
          <p>Hi {name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <p style={{ textAlign: 'center' }}>
            <a href={resetUrl} style={{ display: 'inline-block', padding: '12px 20px', background: '#2563eb', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Reset password</a>
          </p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <hr />
          <small>NextGen Marketplace</small>
        </div>
      </body>
    </html>
  );
}
