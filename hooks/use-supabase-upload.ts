import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type FileError, type FileRejection, useDropzone, DropzoneInputProps, DropzoneRootProps } from 'react-dropzone'
import {createClient} from "@/lib/supabase/client";
import { getTimestampedFileName } from '@/lib/utils/file';

const supabase = createClient()

interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
  originalName?: string
}

interface UseSupabaseUploadOptions {
  /**
   * Name of bucket to upload files to in your Supabase project
   */
  bucketName: string
  /**
   * Folder to upload files to in the specified bucket within your Supabase project.
   *
   * Defaults to uploading files to the root of the bucket
   *
   * e.g If specified path is `test`, your file will be uploaded as `test/file_name`
   */
  path?: string
  /**
   * Allowed MIME types for each file upload (e.g `image/png`, `text/html`, etc). Wildcards are also supported (e.g `image/*`).
   *
   * Defaults to allowing uploading of all MIME types.
   */
  allowedMimeTypes?: string[]
  /**
   * Maximum upload size of each file allowed in bytes. (e.g 1000 bytes = 1 KB)
   */
  maxFileSize?: number
  /**
   * Maximum number of files allowed per upload.
   */
  maxFiles?: number
  /**
   * The number of seconds the asset is cached in the browser and in the Supabase CDN.
   *
   * This is set in the Cache-Control: max-age=<seconds> header. Defaults to 3600 seconds.
   */
  cacheControl?: number
  /**
   * When set to true, the file is overwritten if it exists.
   *
   * When set to false, an error is thrown if the object already exists. Defaults to `false`
   */
  upsert?: boolean
}

// Define a more specific return type
interface UseSupabaseUploadReturnSpecific extends Omit<ReturnType<typeof useDropzone>, 'getInputProps' | 'getRootProps'> {
  files: FileWithPreview[];
  successes: string[];
  isSuccess: boolean;
  loading: boolean;
  errors: { name: string; message: string }[];
  onUpload: (filesToProcess: FileWithPreview[]) => Promise<void>; // Modified signature
  reset: () => void;
  maxFileSize?: number;
  maxFiles?: number;
  allowedMimeTypes?: string[];
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  // Exclude setFiles and setErrors if we don't want them exposed
}

const useSupabaseUpload = (options: UseSupabaseUploadOptions): UseSupabaseUploadReturnSpecific => {
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = 3600,
    upsert = false,
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  const [successes, setSuccesses] = useState<string[]>([])

  // Re-introduce ref to track latest files state
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Function to revoke preview URLs
  const revokePreviews = useCallback((filesToRevoke: FileWithPreview[]) => {
    filesToRevoke.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, []);

  // Reset function - Make stable by using ref and removing `files` dependency
  const reset = useCallback(() => {
    console.log("[useSupabaseUpload] Resetting state...");
    // Use ref to access current files without adding dependency
    revokePreviews(filesRef.current);
    setFiles([]); // This will trigger the ref update effect
    setErrors([]);
    setSuccesses([]);
    setLoading(false);
  }, [revokePreviews]); // Dependency array is now stable


  const isSuccess = useMemo(() => {
    // Check if all non-errored files are successful
    const filesWithoutErrors = filesRef.current.filter(f => f.errors.length === 0); // Use ref
    if (filesWithoutErrors.length === 0 && errors.length === 0 && successes.length === 0) return false; // Initial state
    if (filesWithoutErrors.length === 0 && errors.length > 0) return false; // Only errors
    if (filesWithoutErrors.length > 0 && successes.length === filesWithoutErrors.length && errors.length === 0) {
        return true;
    }
    return false
  }, [errors, successes, files]) // Keep files dep here for reactivity

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      console.log("[useSupabaseUpload] onDrop triggered.");
      console.log("[useSupabaseUpload] Accepted Files:", acceptedFiles.map(f => f.name));
      console.log("[useSupabaseUpload] Rejected Files:", fileRejections.map(fr => fr.file.name));
      // Log previous state using ref
      console.log("[useSupabaseUpload] Current files state before drop:", filesRef.current.map(f => f.name));

      // Revoke previous previews using ref
      revokePreviews(filesRef.current);

      const mapToFileWithPreview = (file: File, errors: readonly FileError[] = []) => {
        const timestampedName = getTimestampedFileName(file.name);
        const newFile = new File([file], timestampedName, { type: file.type });
        console.log(`[useSupabaseUpload] Mapping file: ${file.name} -> ${timestampedName}`);
        return Object.assign(newFile, {
          preview: URL.createObjectURL(file), 
          errors,
          originalName: file.name
        }) as FileWithPreview;
      };

      let newFiles: FileWithPreview[] = [];

      if (maxFiles === 1) {
        console.log("[useSupabaseUpload] Handling maxFiles = 1. Clearing files first.");
        setFiles([]); // Clear state first
        
        const validFile = acceptedFiles[0] ? mapToFileWithPreview(acceptedFiles[0]) : null;
        const invalidFile = fileRejections[0] ? mapToFileWithPreview(fileRejections[0].file, fileRejections[0].errors) : null;
        newFiles = [validFile || invalidFile].filter(Boolean) as FileWithPreview[];

      } else {
        // Append logic using ref for current state
         const currentOriginalNames = new Set(filesRef.current.map(f => f.originalName));
         const validFilesToAdd = acceptedFiles
           .filter(file => !currentOriginalNames.has(file.name))
           .map(file => mapToFileWithPreview(file));
         const invalidFilesToAdd = fileRejections
           .filter(({ file }) => !currentOriginalNames.has(file.name))
           .map(({ file, errors }) => mapToFileWithPreview(file, errors));
         // Combine with current state from ref
         newFiles = [...filesRef.current, ...validFilesToAdd, ...invalidFilesToAdd];
         if (newFiles.length > maxFiles) {
            newFiles = newFiles.slice(-maxFiles);
         }
      }

      console.log("[useSupabaseUpload] Setting new files state:", newFiles.map(f => ({ name: f.name, original: f.originalName })));
      setFiles(newFiles); // This triggers the ref update effect
      setErrors([]);
      setSuccesses([]);
    },
    [maxFiles, revokePreviews] // Use ref inside, so `files` state not needed as dependency
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  });

  // Modified onUpload to accept files as argument
  const onUpload = useCallback(async (filesToProcess: FileWithPreview[]) => {
    console.log("[useSupabaseUpload] onUpload triggered.");
    console.log("[useSupabaseUpload] Files received by onUpload:", filesToProcess.map(f => ({ name: f.name, original: f.originalName })));

    if (!filesToProcess || filesToProcess.length === 0) {
      console.log("[useSupabaseUpload] No files passed to onUpload.");
      setLoading(false); // Ensure loading is reset if called with no files
      return;
    }

    setLoading(true);
    setErrors([]); 
    setSuccesses([]);

    const filesToUpload = filesToProcess.filter(file => file.errors.length === 0);

    if (filesToUpload.length === 0) {
      console.log("[useSupabaseUpload] No valid files (without errors) passed to onUpload.");
      setLoading(false);
      return; 
    }

    console.log("[useSupabaseUpload] Starting Supabase upload for:", filesToUpload.map(f => f.name));

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
         console.log(`[useSupabaseUpload] Uploading file: ${file.name} (Original: ${file.originalName}) to path: ${path ? `${path}/${file.name}` : file.name}`);
         const { error } = await supabase.storage
           .from(bucketName)
           .upload(!!path ? `${path}/${file.name}` : file.name, file, { 
             cacheControl: cacheControl.toString(),
             upsert,
           });
         if (error) {
           console.error(`[useSupabaseUpload] Upload Error for ${file.name}:`, error);
           return { name: file.name, message: error.message };
         } else {
            console.log(`[useSupabaseUpload] Upload Success for ${file.name}`);
           return { name: file.name, message: undefined };
         }
       })
     );

    const responseErrors = responses.filter((x): x is { name: string; message: string } => x.message !== undefined);
    const responseSuccesses = responses.filter((x) => x.message === undefined);

    console.log("[useSupabaseUpload] Upload finished. Errors:", responseErrors);
    console.log("[useSupabaseUpload] Upload finished. Successes:", responseSuccesses.map(x => x.name));

    // Still set the hook's internal state for consistency
    setErrors(responseErrors);
    setSuccesses(responseSuccesses.map((x) => x.name)); 

    setLoading(false);
  }, [path, bucketName, upsert, cacheControl]); // Removed internal state dependencies


  useEffect(() => {
    // Handle 'too-many-files' error dynamically using current state `files`
    const currentFiles = files; // Use state directly for this UI logic
    if (currentFiles.length === 0) {
      if (errors.length > 0) setErrors([]); // Clear errors if files are cleared
    }
    else if (currentFiles.length > maxFiles) {
      const needsErrorUpdate = currentFiles.some(file => !file.errors.some(e => e.code === 'too-many-files'));
      if (needsErrorUpdate) {
        const newFiles = currentFiles.map((file) => {
          const hasTooManyError = file.errors.some((e) => e.code === 'too-many-files');
          if (!hasTooManyError) {
              return {...file, errors: [...file.errors, {code: 'too-many-files', message: `Maximum number of files is ${maxFiles}`}]};
          }
          return file
        })
        setFiles(newFiles) // Update state with errors
      }
    }
    else if (currentFiles.length <= maxFiles) {
      const needsErrorRemoval = currentFiles.some(file => file.errors.some(e => e.code === 'too-many-files'));
      if (needsErrorRemoval) {
        let changed = false
        const newFiles = currentFiles.map((file) => {
          if (file.errors.some((e) => e.code === 'too-many-files')) {
            file.errors = file.errors.filter((e) => e.code !== 'too-many-files')
            changed = true
          }
          return file
        })
        if (changed) {
          setFiles(newFiles) // Update state with errors removed
        }
      }
    }
  }, [files, maxFiles, errors.length]) // Depend on files and maxFiles for this effect

  // Clean up previews on unmount using ref
  useEffect(() => {
    // Return cleanup function
    return () => {
       console.log("[useSupabaseUpload] Unmounting, revoking previews...");
       // Use ref for cleanup to avoid dependency on `files` state
       revokePreviews(filesRef.current);
    };
  }, [revokePreviews]); // Stable dependency


  return {
    files, 
    successes,
    isSuccess,
    loading,
    errors,
    onUpload, // Now expects files argument
    reset, // Reset function is now stable
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps, // Includes getInputProps and getRootProps
  }
}

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturnSpecific as UseSupabaseUploadReturn } // Export modified type name
