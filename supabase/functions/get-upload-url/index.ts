// supabase/functions/get-upload-url/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts' // Use an appropriate std version
import { S3Client, PutObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.540.0' // Use latest compatible version
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3.540.0' // Use latest compatible version

// --- Configuration ---
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')
const R2_ENDPOINT_URL = Deno.env.get('R2_ENDPOINT_URL')
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME')
const R2_REGION = Deno.env.get('R2_REGION') || 'auto' // Default to 'auto' if not set

// Check if all required environment variables are set
if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT_URL || !R2_BUCKET_NAME) {
  console.error('Missing required R2 environment variables')
  // Optional: Throw an error during startup if critical vars are missing
  // throw new Error("Missing required R2 environment variables");
}

// CORS Headers - Adjust allowed origins as needed for security
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specify your frontend domain: 'https://your-app.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST for request, OPTIONS for preflight
}

// --- S3 Client Initialization ---
// Ensure endpoint URL format is correct (should not include bucket name)
const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!, // Use non-null assertion or handle potential null
    secretAccessKey: R2_SECRET_ACCESS_KEY!, // Use non-null assertion or handle potential null
  },
  // Important for R2: Avoid path-style access, force virtual hosted-style
  forcePathStyle: false,
})

// --- Edge Function Handler ---
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Ensure environment variables are loaded (runtime check)
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT_URL || !R2_BUCKET_NAME) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing R2 credentials.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
  }

  try {
    // --- Get Parameters from Request ---
    // Expecting JSON body like: { "fileName": "my-image.jpg", "contentType": "image/jpeg" }
    const { fileName, contentType } = await req.json()

    if (!fileName) {
      return new Response(JSON.stringify({ error: 'Missing "fileName" in request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Optional: Add sanitization or validation for fileName here
    // e.g., remove path characters, check length, generate unique ID prefix etc.
    const objectKey = `uploads/${Date.now()}-${fileName}`; // Example: Add a timestamp prefix for uniqueness

    // --- Prepare S3 Command ---
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey, // The desired path and name for the object in R2
      ContentType: contentType, // Optional: If provided by client, helps R2 serve the file correctly
      // You can add other parameters like ACL (though R2 often ignores standard S3 ACLs), Metadata, etc.
      // Metadata: { 'user-id': 'some-user-id' } // Example metadata
    });

    // --- Generate Presigned URL ---
    const expiresInSeconds = 300 // URL valid for 5 minutes
    const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: expiresInSeconds });

    // --- Return Response ---
    return new Response(
      JSON.stringify({
        uploadUrl: signedUrl,
        objectKey: objectKey, // Optionally return the final key used
        method: 'PUT', // Inform client which HTTP method to use
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate upload URL.', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

console.log(`Function "get-upload-url" listening on port specificed by Deno runtime`);