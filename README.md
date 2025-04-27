# Webpage Code Extractor API

This Node.js application provides two endpoints to fetch and analyze webpage content:

## Endpoints

### 1. iFrame (Optional)
- **Purpose**: Fetch and display the complete HTML of a webpage
- **Parameter**: `url` (required) - The URL of the webpage to fetch
- **Example**: `http://localhost:3000/iframe?url=https://example.com` (Optional)

### 2. Source
- **Purpose**: Extract and combine HTML, CSS, and JavaScript code from a webpage
- **Parameters**:
  - `url` (required) - The URL of the webpage to analyze
  - `source` (optional) - Filter by source type (`html`, `css`, or `js`)
- **Features**:
  - Extracts inline and external CSS
  - Extracts inline and external JavaScript
  - Can return combined code or filtered by type
- **Examples**:
  - All code: `http://localhost:3000/source?url=https://example.com`
  - Other: `http://localhost:3000/source?url=https://example.com&source=CSS`
  - Only HTML: `http://localhost:3000/source?url=https://example.com&source=`
