# Integrator Tools

A collection of web development tools for form normalization and text extraction from HTML.

## Features

### Text Extractor
Extract all text content from HTML files and convert it to JSON format. Perfect for:
- Extracting text for translation workflows
- Processing HTML content programmatically
- Maintaining text structure while separating content from markup

### Forms Normalizer
Normalize HTML forms with standardized attributes and hidden fields. Features include:
- Automatic form attribute normalization (action, method)
- Hidden input field management
- Geo and language configuration
- Partner and category settings
- Backlink script integration
- Temp leads script support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/[username]/integrator-tools.git
cd integrator-tools
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Usage

### Text Extractor
1. Paste your HTML content into the input editor
2. Click "Extract" to process the HTML
3. View the extracted text as JSON and the processed HTML with placeholders
4. Edit the translated JSON if needed
5. Click "Apply to HTML" to merge translations back into the HTML

### Forms Normalizer
1. Enter an offer name (e.g., `weightloss_be_leadbit_abslim_student_fr_AB`)
2. Configure Geo, Lang, Partner, and other settings
3. Paste your HTML form code into the input editor
4. Click "Normalize" to process the form
5. Copy the normalized output

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Deployment

This app is configured for GitHub Pages deployment. The app will automatically deploy when you push to the main branch.

For manual deployment:
```bash
npm run deploy
```

## Technologies

- React 19
- Material-UI (MUI)
- CodeMirror
- React Router

## License

MIT

