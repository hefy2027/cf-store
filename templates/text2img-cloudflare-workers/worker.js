// .tmp/text2img-cloudflare-workers/src/index.html
var index_default = `<!DOCTYPE html>\r
<html lang="zh" class="light">\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>\u57FA\u4E8E CloudFlare \u7684\u5728\u7EBF\u6587\u751F\u56FE\u670D\u52A1</title>\r
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" crossorigin="anonymous">\r
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">\r
    <link rel="icon" type="image/x-icon" href="https://cdn.jsdelivr.net/gh/huarzone/Text2img-Cloudflare-Workers@main/public/favicon.ico">\r
    <style>\r
        :root {\r
            --primary: #5046e5;\r
            --primary-light: #6e67eb;\r
            --primary-dark: #4338ca;\r
            --secondary: #f0f4f8;\r
            --text: #1a202c;\r
            --text-light: #4a5568;\r
            --background: #ffffff;\r
            --card-bg: #f7fafc;\r
            --border: #e2e8f0;\r
            --success: #10b981;\r
            --error: #ef4444;\r
            --warning: #f59e0b;\r
            --info: #3b82f6;\r
        }\r
        \r
        .dark {\r
            --primary: #6e67eb;\r
            --primary-light: #8a84ee;\r
            --primary-dark: #5046e5;\r
            --secondary: #2d3748;\r
            --text: #f7fafc;\r
            --text-light: #cbd5e0;\r
            --background: #111827;\r
            --card-bg: #1f2937;\r
            --border: #374151;\r
            --success: #10b981;\r
            --error: #ef4444;\r
            --warning: #f59e0b;\r
            --info: #3b82f6;\r
        }\r
        \r
        body {\r
            background-color: var(--background);\r
            color: var(--text);\r
            transition: background-color 0.3s ease, color 0.3s ease;\r
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\r
        }\r
        \r
        .btn {\r
            padding: 1rem 1.5rem;\r
            border-radius: 0.375rem;\r
            transition: all 0.3s;\r
        }\r
\r
        .btn:focus {\r
            outline: none;\r
        }\r
        \r
        .btn-primary {\r
            background-color: var(--primary);\r
            color: white;\r
        }\r
        \r
        .btn-primary:hover {\r
            background-color: var(--primary-light);\r
            transform: translateY(-1px);\r
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\r
        }\r
        \r
        .btn-primary:active {\r
            background-color: var(--primary-dark);\r
            transform: translateY(0);\r
        }\r
        \r
        .btn-secondary {\r
            background-color: var(--secondary);\r
            color: var(--text);\r
            border: 1px solid var(--border);\r
        }\r
        \r
        .btn-secondary:hover {\r
            background-color: var(--border);\r
            transform: translateY(-1px);\r
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\r
        }\r
        \r
        .btn-secondary:active {\r
            transform: translateY(0);\r
        }\r
        \r
        .card {\r
            background-color: var(--card-bg);\r
            border: 1px solid var(--border);\r
            border-radius: 0.5rem;\r
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\r
            transition: all 0.3s ease;\r
        }\r
        \r
        .card:hover {\r
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);\r
        }\r
        \r
        input, select, textarea {\r
            background-color: var(--background);\r
            color: var(--text);\r
            border: 1px solid var(--border);\r
            border-radius: 0.375rem;\r
            padding: 0.5rem 0.75rem;\r
            transition: all 0.3s ease;\r
            width: 100%;\r
        }\r
        \r
        input:focus, select:focus, textarea:focus {\r
            outline: none;\r
            border-color: var(--primary);\r
            box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.1);\r
        }\r
        \r
        .slider {\r
            -webkit-appearance: none;\r
            appearance: none;\r
            width: 100%;\r
            height: 6px;\r
            border-radius: 5px;\r
            background: var(--border);\r
            outline: none;\r
            margin: 10px 0;\r
        }\r
        \r
        .slider::-webkit-slider-thumb {\r
            -webkit-appearance: none;\r
            appearance: none;\r
            width: 18px;\r
            height: 18px;\r
            border-radius: 50%;\r
            background: var(--primary);\r
            cursor: pointer;\r
            transition: all 0.2s ease;\r
        }\r
        \r
        .slider::-webkit-slider-thumb:hover {\r
            transform: scale(1.2);\r
            box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.2);\r
        }\r
        \r
        .slider::-moz-range-thumb {\r
            width: 18px;\r
            height: 18px;\r
            border-radius: 50%;\r
            background: var(--primary);\r
            cursor: pointer;\r
            transition: all 0.2s ease;\r
            border: none;\r
        }\r
        \r
        .slider::-moz-range-thumb:hover {\r
            transform: scale(1.2);\r
            box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.2);\r
        }\r
\r
        .animate-pulse {\r
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\r
        }\r
\r
        @keyframes pulse {\r
            0%, 100% {\r
                opacity: 1;\r
            }\r
            50% {\r
                opacity: .5;\r
            }\r
        }\r
        \r
        .loading-mask {\r
            position: absolute;\r
            top: 0;\r
            left: 0;\r
            right: 0;\r
            bottom: 0;\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            background-color: rgba(0,0,0,0.6);\r
            border-radius: 0.5rem;\r
            z-index: 10;\r
            backdrop-filter: blur(4px);\r
        }\r
        \r
        .image-container {\r
            aspect-ratio: 1 / 1;\r
            overflow: hidden;\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            background-color: var(--card-bg);\r
            position: relative;\r
            border-radius: 0.5rem;\r
            max-height: 400px; /* \u6DFB\u52A0\u6700\u5927\u9AD8\u5EA6\u9650\u5236 */\r
            margin: 0 auto; /* \u5C45\u4E2D\u663E\u793A */\r
            width: 100%; /* \u4FDD\u6301\u5BBD\u5EA6\u54CD\u5E94\u5F0F */\r
        }\r
        \r
        #imageStatus {\r
            position: absolute;\r
            bottom: 1rem;\r
            left: 1rem;\r
            z-index: 20;\r
            padding: 0.25rem 0.75rem;\r
            border-radius: 9999px;\r
            font-size: 0.75rem;\r
            font-weight: 500;\r
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\r
            transition: all 0.3s ease;\r
        }\r
        \r
        .param-badge {\r
            background-color: var(--secondary);\r
            color: var(--text);\r
            padding: 0.25rem 0.5rem;\r
            border-radius: 0.25rem;\r
            font-size: 0.75rem;\r
            margin-right: 0.5rem;\r
            margin-bottom: 0.5rem;\r
            display: inline-block;\r
            border: 1px solid var(--border);\r
        }\r
        \r
        .fade-in {\r
            animation: fadeIn 0.5s ease-in-out;\r
        }\r
        \r
        @keyframes fadeIn {\r
            from { opacity: 0; }\r
            to { opacity: 1; }\r
        }\r
        \r
        .tooltip {\r
            position: relative;\r
            display: inline-block;\r
        }\r
        \r
        .tooltip .tooltiptext {\r
            visibility: hidden;\r
            width: 200px;\r
            background-color: var(--card-bg);\r
            color: var(--text);\r
            text-align: center;\r
            border-radius: 6px;\r
            padding: 8px;\r
            position: absolute;\r
            z-index: 1;\r
            bottom: 125%;\r
            left: 50%;\r
            margin-left: -100px;\r
            opacity: 0;\r
            transition: opacity 0.3s;\r
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\r
            border: 1px solid var(--border);\r
            font-size: 0.75rem;\r
        }\r
        \r
        .tooltip:hover .tooltiptext {\r
            visibility: visible;\r
            opacity: 1;\r
        }\r
\r
        .hidden {\r
            display: none !important;\r
        }\r
\r
        @media (max-width: 768px) {\r
            .mobile-flex-col {\r
                flex-direction: column;\r
            }\r
            \r
            .container {\r
                padding-left: 1rem;\r
                padding-right: 1rem;\r
            }\r
            \r
            .image-container {\r
                max-height: 400px; /* \u79FB\u52A8\u7AEF\u9002\u5F53\u51CF\u5C0F\u6700\u5927\u9AD8\u5EA6 */\r
            }\r
        }\r
        \r
        @media (min-width: 1024px) {\r
            .container {\r
                max-width: 1200px;\r
            }\r
        }\r
    </style>\r
</head>\r
<body class="min-h-screen py-4">\r
    <div class="container mx-auto px-4 py-4 max-w-6xl">\r
        <div class="flex items-center justify-between mb-6">\r
            <h1 class="text-2xl md:text-3xl font-bold flex items-center">\r
                \u{1F433}&nbsp;\u5728\u7EBF\u6587\u751F\u56FE\u670D\u52A1\r
            </h1>\r
            <div class="flex items-center space-x-2">\r
                <button id="themeToggle" class="btn btn-secondary p-2 h-10 w-10 flex items-center justify-center" aria-label="\u5207\u6362\u6697\u8272\u4E3B\u9898">\r
                    <i class="fa-solid fa-moon"></i>\r
                </button>\r
                <button id="github" class="btn btn-secondary p-2 h-10 w-10 flex items-center justify-center" aria-label="\u9879\u76EE\u5730\u5740" onclick="window.open('https://github.com/huarzone/Text2img-Cloudflare-Workers', '_blank')">\r
                    <i class="fa-brands fa-github"></i>\r
                </button>\r
            </div>\r
        </div>\r
\r
        <div class="flex flex-col lg:flex-row gap-6 mobile-flex-col">\r
            <!-- \u5DE6\u4FA7\u63A7\u5236\u9762\u677F -->\r
            <div class="w-full lg:w-2/5 space-y-4">\r
                <div class="card p-4 space-y-4 fade-in">\r
                    <div class="flex justify-between items-center">\r
                        <h2 class="text-lg font-semibold flex items-center">\r
                            <i class="fa-solid fa-sliders mr-2 text-primary"></i>\r
                            \u57FA\u672C\u8BBE\u7F6E\r
                        </h2>\r
                        <button id="randomButton" class="btn btn-secondary text-sm py-1 px-3 flex items-center">\r
                            <i class="fa-solid fa-dice mr-1"></i> \u968F\u673A\u63D0\u793A\u8BCD\r
                        </button>\r
                    </div>\r
                    \r
                    <div>\r
                        <label for="password" class="block text-sm font-medium mb-1 flex items-center">\r
                            <i class="fa-solid fa-key mr-1 text-xs"></i> \u8BBF\u95EE\u5BC6\u7801\r
                        </label>\r
                        <input type="password" id="password" placeholder="\u8BF7\u8F93\u5165\u8BBF\u95EE\u5BC6\u7801" class="w-full">\r
                    </div>\r
                    \r
                    <div>\r
                        <label for="prompt" class="block text-sm font-medium mb-1 flex items-center">\r
                            <i class="fa-solid fa-wand-magic-sparkles mr-1 text-xs"></i> \u6B63\u5411\u63D0\u793A\u8BCD\r
                        </label>\r
                        <textarea id="prompt" rows="3" placeholder="\u63CF\u8FF0\u60A8\u60F3\u8981\u751F\u6210\u7684\u56FE\u50CF\u5185\u5BB9\u53CA\u6837\u5F0F..." class="w-full">cyberpunk cat</textarea>\r
                    </div>\r
                    \r
                    <div>\r
                        <label for="negative_prompt" class="block text-sm font-medium mb-1 flex items-center">\r
                            <i class="fa-solid fa-ban mr-1 text-xs"></i> \u53CD\u5411\u63D0\u793A\u8BCD\r
                        </label>\r
                        <textarea id="negative_prompt" rows="2" placeholder="\u63CF\u8FF0\u5728\u751F\u6210\u7684\u56FE\u50CF\u4E2D\u8981\u907F\u514D\u7684\u5143\u7D20\u6587\u672C..." class="w-full"></textarea>\r
                    </div>\r
                    \r
                    <div>\r
                        <label for="model" class="block text-sm font-medium mb-1 flex items-center">\r
                            <i class="fa-solid fa-robot mr-1 text-xs"></i> \u6587\u751F\u56FE\u6A21\u578B\r
                        </label>\r
                        <select id="model" class="w-full">\r
                            <option value="loading" disabled selected>\u52A0\u8F7D\u4E2D...</option>\r
                        </select>\r
                    </div>\r
                </div>\r
                \r
                <div class="card p-4 space-y-4 fade-in">\r
                    <div class="flex justify-between items-center">\r
                        <h2 class="text-lg font-semibold flex items-center">\r
                            <i class="fa-solid fa-gear mr-2 text-primary"></i>\r
                            \u9AD8\u7EA7\u9009\u9879\r
                        </h2>\r
                        <button id="toggleAdvanced" class="text-xs btn btn-secondary py-1 px-3 flex items-center">\r
                            <i class="fa-solid fa-chevron-down mr-1" id="advancedIcon"></i> \u663E\u793A/\u9690\u85CF\r
                        </button>\r
                    </div>\r
                    \r
                    <div id="advancedOptions" class="space-y-3 hidden">\r
                        <div>\r
                            <div class="flex justify-between items-center">\r
                                <label for="width" class="block text-sm font-medium flex items-center">\r
                                    <i class="fa-solid fa-arrows-left-right mr-1 text-xs"></i> \u56FE\u50CF\u5BBD\u5EA6\r
                                </label>\r
                                <span id="widthValue" class="text-sm font-mono">1024px</span>\r
                            </div>\r
                            <input type="range" id="width" min="256" max="2048" step="64" value="1024" class="slider w-full">\r
                        </div>\r
                        \r
                        <div>\r
                            <div class="flex justify-between items-center">\r
                                <label for="height" class="block text-sm font-medium flex items-center">\r
                                    <i class="fa-solid fa-arrows-up-down mr-1 text-xs"></i> \u56FE\u50CF\u9AD8\u5EA6\r
                                </label>\r
                                <span id="heightValue" class="text-sm font-mono">1024px</span>\r
                            </div>\r
                            <input type="range" id="height" min="256" max="2048" step="64" value="1024" class="slider w-full">\r
                        </div>\r
                        \r
                        <div>\r
                            <div class="flex justify-between items-center">\r
                                <label for="num_steps" class="block text-sm font-medium flex items-center tooltip">\r
                                    <i class="fa-solid fa-shoe-prints mr-1 text-xs"></i> \u8FED\u4EE3\u6B65\u6570\r
                                    <span class="tooltiptext">\u66F4\u9AD8\u7684\u6B65\u6570\u901A\u5E38\u4F1A\u4EA7\u751F\u66F4\u7CBE\u7EC6\u7684\u7EC6\u8282\uFF0C\u4F46\u9700\u8981\u66F4\u957F\u7684\u5904\u7406\u65F6\u95F4</span>\r
                                </label>\r
                                <span id="num_stepsValue" class="text-sm font-mono">20</span>\r
                            </div>\r
                            <input type="range" id="num_steps" min="1" max="20" step="1" value="20" class="slider w-full">\r
                        </div>\r
                        \r
                        <div>\r
                            <div class="flex justify-between items-center">\r
                                <label for="guidance" class="block text-sm font-medium flex items-center tooltip">\r
                                    <i class="fa-solid fa-compass mr-1 text-xs"></i> \u5F15\u5BFC\u7CFB\u6570\r
                                    <span class="tooltiptext">\u63A7\u5236\u751F\u6210\u56FE\u50CF\u4E0E\u63D0\u793A\u8BCD\u7684\u5339\u914D\u7A0B\u5EA6\uFF0C\u8F83\u9AD8\u7684\u503C\u4F1A\u66F4\u4E25\u683C\u9075\u5FAA\u63D0\u793A\u8BCD</span>\r
                                </label>\r
                                <span id="guidanceValue" class="text-sm font-mono">7.5</span>\r
                            </div>\r
                            <input type="range" id="guidance" min="0" max="30" step="0.5" value="7.5" class="slider w-full">\r
                        </div>\r
                        \r
                        <div>\r
                            <label for="seed" class="block text-sm font-medium mb-1 flex items-center tooltip">\r
                                <i class="fa-solid fa-seedling mr-1 text-xs"></i> \u968F\u673A\u79CD\u5B50\r
                                <span class="tooltiptext">\u4F7F\u7528\u76F8\u540C\u7684\u79CD\u5B50\u503C\u53EF\u4EE5\u5728\u5176\u4ED6\u53C2\u6570\u76F8\u540C\u7684\u60C5\u51B5\u4E0B\u751F\u6210\u76F8\u4F3C\u7684\u56FE\u50CF</span>\r
                            </label>\r
                            <div class="flex gap-2">\r
                                <input type="number" id="seed" placeholder="\u968F\u673A\u79CD\u5B50\u503C" class="w-full">\r
                                <button id="randomSeed" class="btn btn-secondary text-sm py-1 px-3">\r
                                    <i class="fa-solid fa-random"></i>\r
                                </button>\r
                            </div>\r
                            <p class="text-xs text-gray-500 mt-1">\u7559\u7A7A\u5219\u968F\u673A\u751F\u6210</p>\r
                        </div>\r
                    </div>\r
                </div>\r
                \r
                <button id="submitButton" class="btn btn-primary w-full py-3 flex items-center justify-center">\r
                    <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> \u751F\u6210\u56FE\u50CF\r
                </button>\r
            </div>\r
            \r
            <!-- \u53F3\u4FA7\u56FE\u50CF\u5C55\u793A -->\r
            <div class="w-full lg:w-3/5">\r
                <div class="card h-full p-4 space-y-4 fade-in">\r
                    <div class="flex justify-between items-center">\r
                        <h2 class="text-lg font-semibold flex items-center">\r
                            <i class="fa-solid fa-image mr-2 text-primary"></i>\r
                            \u751F\u6210\u7ED3\u679C\r
                        </h2>\r
                        <div class="flex space-x-2">\r
                            <button id="copyParamsButton" class="btn btn-secondary text-sm py-1 px-3 hidden">\r
                                <i class="fa-solid fa-copy mr-1"></i> \u590D\u5236\u53C2\u6570\r
                            </button>\r
                            <button id="downloadButton" class="btn btn-secondary text-sm py-1 px-3 hidden">\r
                                <i class="fa-solid fa-download mr-1"></i> \u4E0B\u8F7D\u56FE\u50CF\r
                            </button>\r
                        </div>\r
                    </div>\r
                    \r
                    <div class="image-container card">\r
                        <div id="loadingOverlay" class="loading-mask hidden">\r
                            <div class="text-center">\r
                                <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>\r
                                <p class="text-white mt-3 font-medium">\u751F\u6210\u4E2D\uFF0C\u8BF7\u7A0D\u5019...</p>\r
                                <p class="text-white text-sm mt-1">\u8FD9\u53EF\u80FD\u9700\u8981\u51E0\u79D2\u5230\u51E0\u5341\u79D2\u4E0D\u7B49</p>\r
                            </div>\r
                        </div>\r
                        <div id="initialPrompt" class="text-center text-gray-400 dark:text-gray-600">\r
                            <i class="fa-solid fa-image-portrait text-4xl mb-2"></i>\r
                            <p>\u70B9\u51FB\u751F\u6210\u6309\u94AE\u5F00\u59CB\u521B\u5EFA\u56FE\u50CF</p>\r
                        </div>\r
                        <span id="imageStatus" class="bg-gray-300 text-gray-700 hidden">\u72B6\u6001</span>\r
                        <img id="aiImage" class="max-h-full max-w-full rounded hidden" alt="\u751F\u6210\u7684\u56FE\u50CF">\r
                    </div>\r
                    \r
                    <div id="imageInfo" class="space-y-3 mt-2">\r
                        <div class="grid grid-cols-2 gap-3">\r
                            <div class="text-sm flex items-center">\r
                                <span class="font-medium flex items-center">\r
                                    <i class="fa-regular fa-clock mr-1 text-xs"></i> \u751F\u6210\u65F6\u95F4\uFF1A\r
                                </span>\r
                                <span id="generationTime" class="ml-1">-</span>\r
                            </div>\r
                            <div class="text-sm flex items-center">\r
                                <span class="font-medium flex items-center">\r
                                    <i class="fa-solid fa-microchip mr-1 text-xs"></i> \u4F7F\u7528\u6A21\u578B\uFF1A\r
                                </span>\r
                                <span id="usedModel" class="ml-1">-</span>\r
                            </div>\r
                        </div>\r
                        \r
                        <div id="allParamsContainer" class="hidden mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">\r
                            <h3 class="text-sm font-medium mb-2 flex items-center">\r
                                <i class="fa-solid fa-list-check mr-1"></i> \u6240\u6709\u53C2\u6570\r
                            </h3>\r
                            <div id="allParams" class="flex flex-wrap"></div>\r
                        </div>\r
                    </div>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <script>\r
        document.addEventListener('DOMContentLoaded', function () {\r
            // \u521D\u59CB\u5316\u6A21\u578B\u5217\u8868\r
            let availableModels = [];\r
            let randomPromptsList = [];\r
            let currentImageParams = {};\r
            \r
            // \u52A0\u8F7D\u6A21\u578B\u5217\u8868\r
            async function loadModels() {\r
                try {\r
                    const response = await fetch('/api/models');\r
                    if (!response.ok) {\r
                        throw new Error('\u52A0\u8F7D\u6A21\u578B\u5217\u8868\u5931\u8D25');\r
                    }\r
                    \r
                    availableModels = await response.json();\r
                    const modelSelect = document.getElementById('model');\r
                    \r
                    // \u6E05\u7A7A\u5F53\u524D\u9009\u9879\r
                    modelSelect.innerHTML = '';\r
                    \r
                    // \u6DFB\u52A0\u65B0\u9009\u9879\r
                    availableModels.forEach(model => {\r
                        const option = document.createElement('option');\r
                        option.value = model.id;\r
                        option.textContent = \`\${model.name} - \${model.description}\`;\r
                        modelSelect.appendChild(option);\r
                    });\r
                    \r
                    // \u9ED8\u8BA4\u9009\u62E9\u7B2C\u4E8C\u4E2A\u6A21\u578B\uFF08\u901A\u5E38\u662F\u66F4\u597D\u7684\u6A21\u578B\uFF09\r
                    if (availableModels.length > 1) {\r
                        modelSelect.value = availableModels[1].id;\r
                    }\r
                } catch (error) {\r
                    console.error('\u52A0\u8F7D\u6A21\u578B\u5217\u8868\u9519\u8BEF:', error);\r
                    showStatus('\u52A0\u8F7D\u6A21\u578B\u5217\u8868\u5931\u8D25', 'error');\r
                }\r
            }\r
            \r
            // \u52A0\u8F7D\u968F\u673A\u63D0\u793A\u8BCD\r
            async function loadRandomPrompts() {\r
                try {\r
                    const response = await fetch('/api/prompts');\r
                    if (!response.ok) {\r
                        throw new Error('\u52A0\u8F7D\u63D0\u793A\u8BCD\u5931\u8D25');\r
                    }\r
                    \r
                    randomPromptsList = await response.json();\r
                } catch (error) {\r
                    console.error('\u52A0\u8F7D\u63D0\u793A\u8BCD\u9519\u8BEF:', error);\r
                    randomPromptsList = ['\u672A\u80FD\u52A0\u8F7D\u63D0\u793A\u8BCD\u5217\u8868\uFF0C\u8BF7\u91CD\u8BD5\u6216\u624B\u52A8\u8F93\u5165'];\r
                }\r
            }\r
            \r
            // \u521D\u59CB\u5316\u52A0\u8F7D\u8D44\u6E90\r
            loadModels();\r
            loadRandomPrompts();\r
            \r
            // \u4E3B\u9898\u5207\u6362\u529F\u80FD\u76F8\u5173\u4EE3\u7801\r
            const themeToggle = document.getElementById('themeToggle');\r
            const html = document.documentElement;\r
            const moonIcon = \`<i class="fa-solid fa-moon"></i>\`;\r
            const sunIcon = \`<i class="fa-solid fa-sun"></i>\`;\r
            \r
            // \u68C0\u67E5\u7CFB\u7EDF\u4E3B\u9898\u6216\u5B58\u50A8\u7684\u4E3B\u9898\u5E76\u8BBE\u7F6E\u521D\u59CB\u72B6\u6001\r
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {\r
                html.classList.add('dark');\r
                themeToggle.innerHTML = sunIcon;\r
                themeToggle.setAttribute('aria-label', '\u5207\u6362\u4EAE\u8272\u4E3B\u9898');\r
            } else {\r
                html.classList.remove('dark');\r
                themeToggle.innerHTML = moonIcon;\r
                themeToggle.setAttribute('aria-label', '\u5207\u6362\u6697\u8272\u4E3B\u9898');\r
            }\r
            \r
            themeToggle.addEventListener('click', function() {\r
                if (html.classList.contains('dark')) {\r
                    html.classList.remove('dark');\r
                    localStorage.theme = 'light';\r
                    themeToggle.innerHTML = moonIcon;\r
                    themeToggle.setAttribute('aria-label', '\u5207\u6362\u6697\u8272\u4E3B\u9898');\r
                } else {\r
                    html.classList.add('dark');\r
                    localStorage.theme = 'dark';\r
                    themeToggle.innerHTML = sunIcon;\r
                    themeToggle.setAttribute('aria-label', '\u5207\u6362\u4EAE\u8272\u4E3B\u9898');\r
                }\r
            });\r
            \r
            // \u9AD8\u7EA7\u9009\u9879\u5207\u6362\r
            const toggleAdvanced = document.getElementById('toggleAdvanced');\r
            const advancedOptions = document.getElementById('advancedOptions');\r
            const advancedIcon = document.getElementById('advancedIcon');\r
            \r
            toggleAdvanced.addEventListener('click', function() {\r
                if (advancedOptions.classList.contains('hidden')) {\r
                    advancedOptions.classList.remove('hidden');\r
                    advancedIcon.classList.remove('fa-chevron-down');\r
                    advancedIcon.classList.add('fa-chevron-up');\r
                } else {\r
                    advancedOptions.classList.add('hidden');\r
                    advancedIcon.classList.remove('fa-chevron-up');\r
                    advancedIcon.classList.add('fa-chevron-down');\r
                }\r
            });\r
            \r
            // \u6ED1\u5757\u503C\u663E\u793A\r
            const sliders = ['width', 'height', 'num_steps', 'guidance'];\r
            sliders.forEach(id => {\r
                const slider = document.getElementById(id);\r
                const valueDisplay = document.getElementById(\`\${id}Value\`);\r
                \r
                slider.addEventListener('input', function() {\r
                    if (id === 'width' || id === 'height') {\r
                        valueDisplay.textContent = \`\${this.value}px\`;\r
                    } else if (id === 'guidance') {\r
                        valueDisplay.textContent = parseFloat(this.value).toFixed(2);\r
                    } else {\r
                        valueDisplay.textContent = this.value;\r
                    }\r
                });\r
            });\r
            \r
            // \u968F\u673A\u79CD\u5B50\r
            document.getElementById('randomSeed').addEventListener('click', function() {\r
                const randomSeed = Math.floor(Math.random() * 4294967295);\r
                document.getElementById('seed').value = randomSeed;\r
            });\r
            \r
            // \u968F\u673A\u63D0\u793A\u8BCD\r
            document.getElementById('randomButton').addEventListener('click', function() {\r
                if (randomPromptsList.length > 0) {\r
                    const randomIndex = Math.floor(Math.random() * randomPromptsList.length);\r
                    document.getElementById('prompt').value = randomPromptsList[randomIndex];\r
                } else {\r
                    showStatus('\u63D0\u793A\u8BCD\u5217\u8868\u672A\u52A0\u8F7D\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5', 'error');\r
                }\r
            });\r
            \r
            // \u590D\u5236\u53C2\u6570\r
            document.getElementById('copyParamsButton').addEventListener('click', function() {\r
                if (!currentImageParams) return;\r
                \r
                // \u521B\u5EFA\u53C2\u6570\u6587\u672C\r
                let paramsText = '--- AI\u7ED8\u56FE\u521B\u4F5C\u751F\u6210\u53C2\u6570 ---\\n';\r
                for (const [key, value] of Object.entries(currentImageParams)) {\r
                    if (key === 'password') continue; // \u4E0D\u590D\u5236\u5BC6\u7801\r
                    paramsText += \`\${formatParamName(key)}: \${value}\\n\`;\r
                }\r
                \r
                // \u590D\u5236\u5230\u526A\u8D34\u677F\r
                navigator.clipboard.writeText(paramsText)\r
                    .then(() => {\r
                        showStatus('\u53C2\u6570\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F', 'success');\r
                    })\r
                    .catch(err => {\r
                        console.error('\u590D\u5236\u5931\u8D25:', err);\r
                        showStatus('\u590D\u5236\u53C2\u6570\u5931\u8D25', 'error');\r
                    });\r
            });\r
            \r
            // \u683C\u5F0F\u5316\u53C2\u6570\u540D\u79F0\r
            function formatParamName(name) {\r
                const nameMap = {\r
                    'prompt': '\u6B63\u5411\u63D0\u793A\u8BCD',\r
                    'negative_prompt': '\u53CD\u5411\u63D0\u793A\u8BCD',\r
                    'model': '\u6587\u751F\u56FE\u6A21\u578B',\r
                    'width': '\u56FE\u50CF\u5BBD\u5EA6',\r
                    'height': '\u56FE\u50CF\u9AD8\u5EA6',\r
                    'num_steps': '\u8FED\u4EE3\u6B65\u6570',\r
                    'guidance': '\u5F15\u5BFC\u7CFB\u6570',\r
                    'seed': '\u968F\u673A\u79CD\u5B50'\r
                };\r
                return nameMap[name] || name;\r
            }\r
            \r
            // \u4E0B\u8F7D\u56FE\u50CF\r
            document.getElementById('downloadButton').addEventListener('click', async function() {\r
                const img = document.getElementById('aiImage');\r
                if (!img.src) {\r
                    showStatus('\u6CA1\u6709\u53EF\u4E0B\u8F7D\u7684\u56FE\u50CF', 'error');\r
                    return;\r
                }\r
                \r
                try {\r
                    // \u4ECE\u56FE\u50CF\u6570\u636E\u521B\u5EFAblob\r
                    const response = await fetch(img.src);\r
                    const blob = await response.blob();\r
                    \r
                    // \u521B\u5EFA\u4E0B\u8F7D\u94FE\u63A5\r
                    const url = window.URL.createObjectURL(blob);\r
                    const link = document.createElement('a');\r
                    link.href = url;\r
                    \r
                    // \u751F\u6210\u6587\u4EF6\u540D\r
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');\r
                    const model = document.getElementById('usedModel').textContent || 'ai-image';\r
                    link.download = \`\${model}-\${timestamp}.png\`;\r
                    \r
                    // \u89E6\u53D1\u4E0B\u8F7D\r
                    document.body.appendChild(link);\r
                    link.click();\r
                    \r
                    // \u6E05\u7406\r
                    document.body.removeChild(link);\r
                    window.URL.revokeObjectURL(url);\r
                    \r
                    showStatus('\u56FE\u50CF\u4E0B\u8F7D\u6210\u529F', 'success');\r
                } catch (error) {\r
                    console.error('\u4E0B\u8F7D\u56FE\u50CF\u9519\u8BEF:', error);\r
                    showStatus('\u4E0B\u8F7D\u56FE\u50CF\u5931\u8D25', 'error');\r
                }\r
            });\r
            \r
            // \u63D0\u4EA4\u751F\u6210\u8BF7\u6C42\r
            document.getElementById('submitButton').addEventListener('click', async function() {\r
                // \u663E\u793A\u52A0\u8F7D\u4E2D\u72B6\u6001\r
                const loadingOverlay = document.getElementById('loadingOverlay');\r
                const initialPrompt = document.getElementById('initialPrompt');\r
                const aiImage = document.getElementById('aiImage');\r
                \r
                if (!loadingOverlay || !initialPrompt || !aiImage) {\r
                    console.error('\u5FC5\u8981\u7684DOM\u5143\u7D20\u672A\u627E\u5230');\r
                    return;\r
                }\r
                \r
                // \u9690\u85CF\u521D\u59CB\u63D0\u793A\u548C\u56FE\u50CF\r
                initialPrompt.classList.add('hidden');\r
                aiImage.classList.add('hidden');\r
                loadingOverlay.classList.remove('hidden');\r
                \r
                // \u9690\u85CF\u4E4B\u524D\u7684\u63D0\u793A\u548C\u6309\u94AE\r
                const imageStatus = document.getElementById('imageStatus');\r
                const copyParamsButton = document.getElementById('copyParamsButton');\r
                const downloadButton = document.getElementById('downloadButton');\r
                \r
                if (imageStatus) imageStatus.classList.add('hidden');\r
                if (copyParamsButton) copyParamsButton.classList.add('hidden');\r
                if (downloadButton) downloadButton.classList.add('hidden');\r
                \r
                // \u83B7\u53D6\u53C2\u6570\r
                const params = {\r
                    password: document.getElementById('password')?.value || '',\r
                    prompt: document.getElementById('prompt')?.value || '',\r
                    negative_prompt: document.getElementById('negative_prompt')?.value || '',\r
                    model: document.getElementById('model')?.value,\r
                    width: parseInt(document.getElementById('width')?.value) || 1024,\r
                    height: parseInt(document.getElementById('height')?.value) || 1024,\r
                    num_steps: parseInt(document.getElementById('num_steps')?.value) || 20,\r
                    guidance: parseFloat(document.getElementById('guidance')?.value) || 7.5,\r
                    seed: parseInt(document.getElementById('seed')?.value) || Math.floor(Math.random() * 4294967295)\r
                };\r
                \r
                // \u4FDD\u5B58\u5F53\u524D\u53C2\u6570\r
                currentImageParams = {...params};\r
                \r
                try {\r
                    // \u53D1\u9001\u8BF7\u6C42\r
                    const startTime = performance.now();\r
                    const response = await fetch('/', {\r
                        method: 'POST',\r
                        headers: {\r
                            'Content-Type': 'application/json',\r
                            'Accept': 'image/*'\r
                        },\r
                        body: JSON.stringify(params)\r
                    });\r
                    \r
                    if (!response.ok) {\r
                        const contentType = response.headers.get('content-type');\r
                        if (contentType?.includes('application/json')) {\r
                            const errorData = await response.json();\r
                            throw new Error(errorData.message || '\u751F\u6210\u5931\u8D25');\r
                        } else {\r
                            const errorText = await response.text();\r
                            console.error('\u670D\u52A1\u5668\u9519\u8BEF:', errorText);\r
                            throw new Error('\u751F\u6210\u5931\u8D25');\r
                        }\r
                    }\r
                    \r
                    // \u83B7\u53D6\u56FE\u50CFblob\u6570\u636E\u5E76\u8F6C\u6362\u4E3Abase64\r
                    const imageBlob = await response.blob();\r
                    const base64Image = await blobToBase64(imageBlob);\r
                    const endTime = performance.now();\r
                    const generationTime = ((endTime - startTime) / 1000).toFixed(2);\r
                    \r
                    // \u8BBE\u7F6E\u56FE\u50CF\u4FE1\u606F\u5E76\u663E\u793A\u56FE\u50CF\r
                    aiImage.src = base64Image;\r
                    aiImage.onload = () => {\r
                        // \u56FE\u50CF\u52A0\u8F7D\u5B8C\u6210\u540E\u66F4\u65B0UI\r
                        loadingOverlay.classList.add('hidden');\r
                        aiImage.classList.remove('hidden');\r
                        \r
                        // \u5B89\u5168\u5730\u66F4\u65B0\u4FE1\u606F\u663E\u793A\r
                        const elements = {\r
                            generationTime: document.getElementById('generationTime'),\r
                            usedModel: document.getElementById('usedModel')\r
                        };\r
                        \r
                        if (elements.generationTime) {\r
                            elements.generationTime.textContent = \`\${generationTime}\u79D2\`;\r
                        }\r
                        if (elements.usedModel) {\r
                            elements.usedModel.textContent = getModelNameById(params.model);\r
                        }\r
                        \r
                        // \u66F4\u65B0\u6240\u6709\u53C2\u6570\u9762\u677F\r
                        updateParamsDisplay(params);\r
                        \r
                        // \u663E\u793A\u72B6\u6001\u548C\u64CD\u4F5C\u6309\u94AE\r
                        showStatus('\u751F\u6210\u6210\u529F', 'success');\r
                        if (copyParamsButton) copyParamsButton.classList.remove('hidden');\r
                        if (downloadButton) downloadButton.classList.remove('hidden');\r
                    };\r
                    \r
                } catch (error) {\r
                    console.error('\u751F\u6210\u56FE\u50CF\u9519\u8BEF:', error);\r
                    showStatus(error.message || '\u751F\u6210\u5931\u8D25', 'error');\r
                    // \u663E\u793A\u521D\u59CB\u63D0\u793A\r
                    initialPrompt.classList.remove('hidden');\r
                    aiImage.classList.add('hidden');\r
                } finally {\r
                    loadingOverlay.classList.add('hidden');\r
                }\r
            });\r
            \r
            // \u5C06Blob\u8F6C\u6362\u4E3ABase64\r
            function blobToBase64(blob) {\r
                return new Promise((resolve, reject) => {\r
                    const reader = new FileReader();\r
                    reader.onloadend = () => resolve(reader.result);\r
                    reader.onerror = reject;\r
                    reader.readAsDataURL(blob);\r
                });\r
            }\r
            \r
            // \u901A\u8FC7ID\u83B7\u53D6\u6A21\u578B\u540D\u79F0\r
            function getModelNameById(id) {\r
                const model = availableModels.find(m => m.id === id);\r
                return model ? model.name : id;\r
            }\r
            \r
            // \u66F4\u65B0\u53C2\u6570\u663E\u793A\r
            function updateParamsDisplay(params) {\r
                const allParamsContainer = document.getElementById('allParamsContainer');\r
                const allParamsElement = document.getElementById('allParams');\r
                \r
                if (!allParamsContainer || !allParamsElement) return;\r
                \r
                // \u6E05\u7A7A\u73B0\u6709\u53C2\u6570\r
                allParamsElement.innerHTML = '';\r
                \r
                // \u6DFB\u52A0\u65B0\u53C2\u6570\r
                for (const [key, value] of Object.entries(params)) {\r
                    if (key === 'password') continue; // \u4E0D\u663E\u793A\u5BC6\u7801\r
                    \r
                    const paramName = formatParamName(key);\r
                    const paramValue = value;\r
                    \r
                    // \u521B\u5EFA\u53C2\u6570\u5FBD\u7AE0\r
                    const badge = document.createElement('div');\r
                    badge.className = 'param-badge';\r
                    badge.innerHTML = \`<span class="font-medium">\${paramName}:</span> \${paramValue}\`;\r
                    \r
                    allParamsElement.appendChild(badge);\r
                }\r
                \r
                // \u663E\u793A\u53C2\u6570\u5BB9\u5668\r
                allParamsContainer.classList.remove('hidden');\r
            }\r
            \r
            // \u663E\u793A\u72B6\u6001\u63D0\u793A\r
            function showStatus(message, type = 'info') {\r
                const statusElement = document.getElementById('imageStatus');\r
                if (!statusElement) return;\r
                \r
                // \u8BBE\u7F6E\u6837\u5F0F\r
                statusElement.className = '';\r
                switch (type) {\r
                    case 'success':\r
                        statusElement.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-100');\r
                        break;\r
                    case 'error':\r
                        statusElement.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-100');\r
                        break;\r
                    case 'warning':\r
                        statusElement.classList.add('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900', 'dark:text-yellow-100');\r
                        break;\r
                    default:\r
                        statusElement.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-100');\r
                }\r
                \r
                // \u8BBE\u7F6E\u6D88\u606F\r
                statusElement.textContent = message;\r
                \r
                // \u663E\u793A\r
                statusElement.classList.remove('hidden');\r
                \r
                // 5\u79D2\u540E\u81EA\u52A8\u9690\u85CF\r
                setTimeout(() => {\r
                    statusElement.classList.add('hidden');\r
                }, 5000);\r
            }\r
        });\r
    <\/script>\r
</body>\r
</html>\r
`;

// .tmp/text2img-cloudflare-workers/src/worker.js
var AVAILABLE_MODELS = [
  {
    id: "stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL Base 1.0",
    description: "Stability AI SDXL \u6587\u751F\u56FE\u6A21\u578B",
    key: "@cf/stabilityai/stable-diffusion-xl-base-1.0"
  },
  {
    id: "flux-1-schnell",
    name: "FLUX.1 [schnell]",
    description: "\u7CBE\u786E\u7EC6\u8282\u8868\u73B0\u7684\u9AD8\u6027\u80FD\u6587\u751F\u56FE\u6A21\u578B",
    key: "@cf/black-forest-labs/flux-1-schnell"
  },
  {
    id: "dreamshaper-8-lcm",
    name: "DreamShaper 8 LCM",
    description: "\u589E\u5F3A\u56FE\u50CF\u771F\u5B9E\u611F\u7684 SD \u5FAE\u8C03\u6A21\u578B",
    key: "@cf/lykon/dreamshaper-8-lcm"
  },
  {
    id: "stable-diffusion-xl-lightning",
    name: "Stable Diffusion XL Lightning",
    description: "\u66F4\u52A0\u9AD8\u6548\u7684\u6587\u751F\u56FE\u6A21\u578B",
    key: "@cf/bytedance/stable-diffusion-xl-lightning"
  }
];
var RANDOM_PROMPTS = [
  "cyberpunk cat samurai graphic art, blood splattered, beautiful colors",
  "1girl, solo, outdoors, camping, night, mountains, nature, stars, moon, tent, twin ponytails, green eyes, cheerful, happy, backpack, sleeping bag, camping stove, water bottle, mountain boots, gloves, sweater, hat, flashlight,forest, rocks, river, wood, smoke, shadows, contrast, clear sky, constellations, Milky Way",
  "masterpiece, best quality, amazing quality, very aesthetic, high resolution, ultra-detailed, absurdres, newest, scenery, anime, anime coloring, (dappled sunlight:1.2), rim light, backlit, dramatic shadow, 1girl, long blonde hair, blue eyes, shiny eyes, parted lips, medium breasts, puffy sleeve white dress, forest, flowers, white butterfly, looking at viewer",
  "frost_glass, masterpiece, best quality, absurdres, cute girl wearing red Christmas dress, holding small reindeer, hug, braided ponytail, sidelocks, hairclip, hair ornaments, green eyes, (snowy forest, moonlight, Christmas trees), (sparkles, sparkling clothes), frosted, snow, aurora, moon, night, sharp focus, highly detailed, abstract, flowing",
  "1girl, hatsune miku, white pupils, power elements, microphone, vibrant blue color palette, abstract,abstract background, dreamlike atmosphere, delicate linework, wind-swept hair, energy, masterpiece, best quality, amazing quality",
  "cyberpunk cat(neon lights:1.3) clutter,ultra detailed, ctrash, chaotic, low light, contrast, dark, rain ,at night ,cinematic , dystopic, broken ground, tunnels, skyscrapers",
  "Cyberpunk catgirl with purple hair, wearing leather and latex outfit with pink and purple cheetah print, holding a hand gun, black latex brassiere, glowing blue eyes with purple tech sunglasses, tail, large breasts, glowing techwear clothes, handguns, black leather jacket, tight shiny leather pants, cyberpunk alley background, Cyb3rWar3, Cyberware",
  "a wide aerial view of a floating elven city in the sky, with two elven figures walking side by side across a glowing skybridge, the bridge arching between tall crystal towers, surrounded by clouds and golden light, majestic and serene atmosphere, vivid style, magical fantasy architecture",
  "masterpiece, newest, absurdres,incredibly absurdres, best quality, amazing quality, very aesthetic, 1girl, very long hair, blonde, multi-tied hair, center-flap bangs, sunset, cumulonimbus cloud, old tree,sitting in tree, dark blue track suit, adidas, simple bird",
  "beautiful girl, breasts, curvy, looking down scope, looking away from viewer, laying on the ground, laying ontop of jacket, aiming a sniper rifle, dark braided hair, backwards hat, armor, sleeveless, arm sleeve tattoos, muscle tone, dogtags, sweaty, foreshortening, depth of field, at night, night, alpine, lightly snowing, dusting of snow, Closeup, detailed face, freckles"
];
var PASSWORDS = [];
var worker_default = {
  async fetch(request, env) {
    const originalHost = request.headers.get("host");
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      if (path === "/api/models") {
        return new Response(JSON.stringify(AVAILABLE_MODELS), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      } else if (path === "/api/prompts") {
        return new Response(JSON.stringify(RANDOM_PROMPTS), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      } else if (request.method === "POST") {
        const data = await request.json();
        if (PASSWORDS.length > 0 && (!data.password || !PASSWORDS.includes(data.password))) {
          return new Response(JSON.stringify({ error: "Please enter the correct password" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if ("prompt" in data && "model" in data) {
          const selectedModel = AVAILABLE_MODELS.find((m) => m.id === data.model);
          if (!selectedModel) {
            return new Response(JSON.stringify({ error: "Model is invalid" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          const model = selectedModel.key;
          let inputs = {};
          if (data.model === "flux-1-schnell") {
            let steps = data.num_steps || 6;
            if (steps >= 8) steps = 8;
            else if (steps <= 4) steps = 4;
            inputs = {
              prompt: data.prompt || "cyberpunk cat",
              steps
            };
          } else {
            inputs = {
              prompt: data.prompt || "cyberpunk cat",
              negative_prompt: data.negative_prompt || "",
              height: data.height || 1024,
              width: data.width || 1024,
              num_steps: data.num_steps || 20,
              strength: data.strength || 0.1,
              guidance: data.guidance || 7.5,
              seed: data.seed || parseInt((Math.random() * 1024 * 1024).toString(), 10)
            };
          }
          console.log(`Generating image with ${model} and prompt: ${inputs.prompt.substring(0, 50)}...`);
          try {
            const response = await env.AI.run(model, inputs);
            if (data.model === "flux-1-schnell") {
              let jsonResponse;
              if (typeof response === "object") {
                jsonResponse = response;
              } else {
                try {
                  jsonResponse = JSON.parse(response);
                } catch (e) {
                  console.error("Failed to parse JSON response:", e);
                  return new Response(JSON.stringify({
                    error: "Failed to parse response",
                    details: e.message
                  }), {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                  });
                }
              }
              if (!jsonResponse.image) {
                return new Response(JSON.stringify({
                  error: "Invalid response format",
                  details: "Image data not found in response"
                }), {
                  status: 500,
                  headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
              }
              try {
                const binaryString = atob(jsonResponse.image);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                return new Response(bytes, {
                  headers: {
                    ...corsHeaders,
                    "content-type": "image/png"
                  }
                });
              } catch (e) {
                console.error("Failed to convert base64 to binary:", e);
                return new Response(JSON.stringify({
                  error: "Failed to process image data",
                  details: e.message
                }), {
                  status: 500,
                  headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
              }
            } else {
              return new Response(response, {
                headers: {
                  ...corsHeaders,
                  "content-type": "image/png"
                }
              });
            }
          } catch (aiError) {
            console.error("AI generation error:", aiError);
            return new Response(JSON.stringify({
              error: "Image generation failed",
              details: aiError.message
            }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } else {
          return new Response(JSON.stringify({ error: "Missing required parameter: prompt or model" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      } else if (path.endsWith(".html") || path === "/") {
        return new Response(index_default.replace(/{{host}}/g, originalHost), {
          status: 200,
          headers: {
            ...corsHeaders,
            "content-type": "text/html"
          }
        });
      } else {
        return new Response("Not Found", { status: 404 });
      }
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
export {
  worker_default as default
};
