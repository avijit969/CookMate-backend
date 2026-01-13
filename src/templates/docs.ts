export const docsHtml = (markdownContent: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CookMate API Documentation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
        
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            font-family: 'Outfit', sans-serif !important;
        }

        .markdown-body {
            font-family: 'Outfit', sans-serif !important;
        }

        @media (max-width: 767px) {
            body {
                padding: 15px;
            }
        }
        
        /* Custom tweaks */
        h1, h2, h3 {
             background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            width: fit-content;
        }
        
        code {
            color: #d63384;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
</head>
<body class="markdown-body">
    <div id="content"></div>
    <script>
        const markdown = ${JSON.stringify(markdownContent)};
        document.getElementById('content').innerHTML = marked.parse(markdown);
        hljs.highlightAll();
    </script>
</body>
</html>
`;
