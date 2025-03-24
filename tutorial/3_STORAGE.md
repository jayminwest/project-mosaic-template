# Tutorial 3: File Storage for Your Product

This tutorial guides you through implementing file storage for your Project Mosaic product. We'll set up secure file uploads, configure access controls, and implement automatic cleanup.

## Storage Objectives

- **Secure File Uploads**: Allow users to upload files specific to your product
- **Access Control**: Ensure users can only access their own files
- **Size and Type Limits**: Restrict uploads to appropriate file types and sizes
- **Automatic Cleanup**: Delete files when related records are deleted
- **Preview Capabilities**: Display uploaded files in your UI

## Configure Storage Bucket

The template includes a migration file `supabase/migrations/3_init_storage_schema.sql` that creates a storage bucket with appropriate security policies. You'll need to customize this for your specific product.

1. Review the existing migration:

```sql
-- First, delete the bucket if it exists (for clean resets)
delete from storage.buckets where id = 'product-files';

-- Create a storage bucket for your product
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-files',
  'product-files',
  false, -- private by default for security
  5000000, -- 5MB limit
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    -- Add other file types your product needs
  ]
);

-- Security policies
-- Allow public read access to specific files (if needed)
create policy "Public can view specific files"
  on storage.objects for select
  using (bucket_id = 'product-files' and storage.foldername(name) = 'public');

-- Users can upload their own files
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (
    bucket_id = 'product-files' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own files
create policy "Users can update their own files"
  on storage.objects for update
  using (
    bucket_id = 'product-files'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'product-files'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

2. Customize the bucket name, file size limit, and allowed MIME types for your product

3. Apply the migration:

```sh
supabase db push
```

## Implement File Upload Hook

Create a new hook for file operations in `hooks/useFileStorage.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { useAuth } from "./useAuth";

export function useFileStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // File size limit (should match your bucket configuration)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const uploadFile = async (file: File, itemId: string) => {
    if (!user?.user_id) {
      setError("User not authenticated");
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create a path with user ID and item ID for security
      const filePath = `${user.user_id}/${itemId}/${file.name}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from("product-files")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          duplex: "half",
          headers: {
            "content-length": file.size.toString(),
          },
        });
        
      if (uploadError) throw new Error(uploadError.message);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-files")
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!user?.user_id) {
      setError("User not authenticated");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { error: deleteError } = await supabase.storage
        .from("product-files")
        .remove([filePath]);
        
      if (deleteError) throw new Error(deleteError.message);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    uploadFile,
    deleteFile,
  };
}
```

## Add Automatic File Cleanup

Create a trigger to automatically delete files when related records are deleted:

```sql
-- Add this to a new migration file
CREATE OR REPLACE FUNCTION delete_storage_objects()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete files in the storage bucket
  PERFORM
    supabase_storage.delete_object(
      'product-files',
      OLD.user_id || '/' || OLD.item_id || '/%'
    );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on your product table
CREATE TRIGGER delete_item_files
BEFORE DELETE ON your_product_table
FOR EACH ROW
EXECUTE FUNCTION delete_storage_objects();
```

## Configure Next.js for Remote Images

Update `next.config.mjs` to allow images from your Supabase storage:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
```

## Create File Upload Component

Create a reusable file upload component:

```tsx
// components/FileUpload.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { useFileStorage } from "@/hooks/useFileStorage";
import Image from "next/image";

interface FileUploadProps {
  itemId: string;
  onUploadComplete: (url: string) => void;
  existingFileUrl?: string;
}

export function FileUpload({ itemId, onUploadComplete, existingFileUrl }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingFileUrl || null);
  const { uploadFile, deleteFile, isLoading, error } = useFileStorage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, itemId);
    if (url) {
      setPreview(url);
      onUploadComplete(url);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;
    
    // Extract the path from the URL
    const path = new URL(preview).pathname.split('/').slice(2).join('/');
    const success = await deleteFile(path);
    
    if (success) {
      setPreview(null);
      onUploadComplete('');
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {preview ? (
        <div className="relative">
          <Image 
            src={preview} 
            alt="File preview" 
            width={300} 
            height={200} 
            className="rounded-md object-cover"
          />
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={isLoading}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF (max. 5MB)
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
```

## Testing

Update the storage tests in `tests/integration/3_storage.test.ts` to match your product's requirements:

```typescript
// Example test for a content calendar with image uploads
test("user can upload an image to their content item", async () => {
  // Create a content item
  const { data: item } = await supabase
    .from("content_items")
    .insert({ title: "Test Item with Image", user_id: testUser.id })
    .select()
    .single();
    
  // Upload an image
  const imagePath = "./tests/data/test_image.png";
  const fileBuffer = await fs.readFile(imagePath);
  const fileName = path.basename(imagePath);
  const storagePath = `${testUser.id}/${item.item_id}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from("product-files")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
    });
    
  expect(uploadError).toBeNull();
  
  // Verify the file exists
  const { data: fileList } = await supabase.storage
    .from("product-files")
    .list(`${testUser.id}/${item.item_id}`);
    
  expect(fileList?.length).toBe(1);
  expect(fileList?.[0].name).toBe(fileName);
  
  // Delete the content item
  await supabase
    .from("content_items")
    .delete()
    .eq("item_id", item.item_id);
    
  // Verify the file was automatically deleted
  const { data: emptyList } = await supabase.storage
    .from("product-files")
    .list(`${testUser.id}/${item.item_id}`);
    
  expect(emptyList?.length).toBe(0);
});
```

Run the tests:

```sh
npm test tests/integration/3_storage.test.ts
```

This tutorial provides a foundation for implementing secure file storage in your Project Mosaic product. In the next tutorial, we'll implement AI integration using edge functions.
