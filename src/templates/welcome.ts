export const welcomeHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CookMate API</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');

        :root {
            --primary: #FF6B6B;
            --secondary: #4ECDC4;
            --dark: #2C3E50;
            --light: #F7F9FC;
            --glass: rgba(255, 255, 255, 0.95);
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--dark);
        }

        .container {
            background: var(--glass);
            padding: 3rem;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 480px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            transform: translateY(0);
            transition: transform 0.3s ease;
        }

        .container:hover {
            transform: translateY(-5px);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(45deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 600;
        }

        p {
            color: #666;
            margin-bottom: 2rem;
            font-size: 1.1rem;
            line-height: 1.6;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(46, 204, 113, 0.1);
            color: #27ae60;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #27ae60;
            border-radius: 50%;
            margin-right: 8px;
            box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); }
            100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
        }

        .api-link {
            display: inline-block;
            margin-top: 2rem;
            text-decoration: none;
            color: var(--primary);
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .api-link:hover {
            color: var(--secondary);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CookMate API</h1>
        <p>Welcome to the backend service for CookMate. The API is running and ready to serve delicious data.</p>
        
        <div class="status-badge">
            <span class="status-dot"></span>
            System Operational
        </div>

        <br>
        <a href="/api/health" class="api-link">Check Health Status &rarr;</a>
    </div>
</body>
</html>
`;
