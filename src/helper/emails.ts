export const getWelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #ff6b6b; margin: 0; }
    .content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .button { display: inline-block; padding: 12px 24px; background-color: #ff6b6b; color: white !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to CookMate! 🍳</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>We're thrilled to have you join our community of food lovers! CookMate is your new companion for discovering, creating, and sharing amazing recipes.</p>
      <p>Get ready to explore a world of flavors and culinary inspiration.</p>
      <div style="text-align: center;">
        <a href="#" class="button">Explore Recipes</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CookMate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getVerificationEmailTemplate = (name: string, code: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4ecdc4; margin: 0; }
    .content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .code-box { 
      background-color: #f0f0f0; 
      padding: 15px; 
      text-align: center; 
      font-size: 24px; 
      letter-spacing: 5px; 
      font-weight: bold; 
      color: #333; 
      border-radius: 4px; 
      margin: 20px 0; 
      border: 1px dashed #ccc;
    }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email ✉️</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thanks for signing up for CookMate! Please use the verification code below to complete your registration.</p>
      <div class="code-box">
        ${code}
      </div>
      <p style="margin-top: 20px; font-size: 14px; text-align: center;">Enter this code in the app to verify your account.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CookMate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
