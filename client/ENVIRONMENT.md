# Environment Configuration

## Required Environment Variables

Create a `.env` file in the client directory with the following variables:

```bash
# Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your `.env` file

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already added to `.gitignore`
- API keys are validated on application start
- All API calls use secure headers and error handling

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API Usage

The application uses the Gemini 2.0 Flash model via REST API:
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- The API key is automatically appended as a query parameter
- Requests include proper headers and error handling
- Fallback questions are provided if the AI service fails
