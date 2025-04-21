# Webpage Code Extractor API

This Node.js application provides two endpoints to fetch and analyze webpage content:

## Endpoints

### 1. `/view`
- **Purpose**: Fetch and display the complete HTML of a webpage
- **Parameter**: `url` (required) - The URL of the webpage to fetch
- **Example**: `http://localhost:3000/iframe?url=https://example.com` (Optional)

### 2. `/source`
- **Purpose**: Extract and combine HTML, CSS, and JavaScript code from a webpage
- **Parameters**:
  - `url` (required) - The URL of the webpage to analyze
  - `source` (optional) - Filter by source type (`html`, `css`, or `js`)
- **Features**:
  - Extracts inline and external CSS
  - Extracts inline and external JavaScript
  - Can return combined code or filtered by type
- **Examples**:
  - All code: `http://localhost:3000/script?url=https://example.com`
  - Only HTML: `http://localhost:3000/script?url=https://example.com&source=
