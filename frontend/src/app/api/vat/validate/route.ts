import { NextRequest, NextResponse } from 'next/server';

/**
 * VAT validation API endpoint
 * This forwards the validation request to our backend API
 */
export async function GET(request: NextRequest) {
  // Get the VAT ID and other parameters from the query
  const { searchParams } = new URL(request.url);
  const vatId = searchParams.get('vatId');
  const countryCode = searchParams.get('countryCode');
  const isEuVat = searchParams.get('isEuVat') === 'true';

  if (!vatId) {
    return NextResponse.json(
      { valid: false, message: 'VAT ID is required' },
      { status: 400 }
    );
  }

  try {
    // In a production environment, we would call our backend service
    // For now, we'll simulate validation with a simple API
    
    // BACKEND_URL should be set in your .env.local file
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    // Forward the request to our backend
    // In production, we would use the actual backend endpoint
    // const response = await fetch(`${backendUrl}/vat/validate?vatId=${vatId}&countryCode=${countryCode}&isEuVat=${isEuVat}`);
    // const data = await response.json();
    // return NextResponse.json(data);
    
    // For demo purposes, we'll simulate the backend response
    // This simulates both the API call and validation logic
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    // Normalize inputs
    const normalizedVatId = vatId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normalizedCountryCode = countryCode?.toUpperCase() || '';
    
    // Basic validation - in production this would be handled by our backend
    if (isEuVat) {
      // EU VAT must start with country code
      if (!normalizedVatId.startsWith(normalizedCountryCode)) {
        return NextResponse.json(
          { valid: false, message: `EU VAT ID must start with country code ${normalizedCountryCode}` },
          { status: 400 }
        );
      }
      
      // EU VAT must be at least 8 characters (2 for country code + min 6 for number)
      if (normalizedVatId.length < 8) {
        return NextResponse.json(
          { valid: false, message: 'EU VAT ID must be at least 8 characters' },
          { status: 400 }
        );
      }
    } else {
      // Local VAT validations vary by country
      // This is a simplified check - would be more comprehensive in production
      if (normalizedVatId.length < 5) {
        return NextResponse.json(
          { valid: false, message: 'VAT ID is too short' },
          { status: 400 }
        );
      }
    }
    
    // For demo purposes, we consider all VAT IDs valid except those containing "INVALID"
    if (normalizedVatId.includes('INVALID')) {
      return NextResponse.json(
        { valid: false, message: 'Invalid VAT ID format or check digits' },
        { status: 400 }
      );
    }
    
    // Success response with simulated company data
    return NextResponse.json({
      valid: true,
      message: 'VAT ID is valid',
      vatDetails: {
        countryCode: normalizedCountryCode,
        vatNumber: isEuVat ? normalizedVatId.substring(2) : normalizedVatId,
        isEuVat,
        name: 'Sample Company Name',
        address: 'Sample Company Address',
      }
    });
  } catch (error) {
    console.error('Error validating VAT ID:', error);
    return NextResponse.json(
      { valid: false, message: 'Error validating VAT ID' },
      { status: 500 }
    );
  }
} 