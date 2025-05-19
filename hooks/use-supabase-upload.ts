import { useCallback, useEffect, useMemo, useState ,useRef} from 'react'
import {DropzoneInputProps, DropzoneRootProps, type FileError, type FileRejection, useDropzone} from 'react-dropzone'
import {createClient} from "@/lib/supabase/client";
import { getTimestampedFileName } from '@/lib/utils/file';

const supabase = createClient()

interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
  originalName?: string
}

type UseSupabaseUploadOptions = {
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
  /**
   * Recommended size text to display to the user (e.g., "135 x 40 px")
   */
  recommendedSize?: string
}

// Define a more specific return type
interface UseSupabaseUploadReturnSpecific extends Omit<ReturnType<typeof useDropzone>, 'getInputProps' | 'getRootProps'> {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  successes: string[];
  isSuccess: boolean;
  loading: boolean;
  errors: { name: string; message: string }[];
  onUpload: (filesToProcess: FileWithPreview[]) => Promise<void>; 
  reset: () => void;
  maxFileSize?: number;
  maxFiles?: number;
  allowedMimeTypes?: string[];
  recommendedSize?: string;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
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
    recommendedSize,
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
    if (errors.length === 0 && successes.length === 0) {
      return false
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true
    }
    return false
  }, [errors.length, successes.length, files.length])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          const timestampedName = getTimestampedFileName(file.name);
          const newFile = new File([file], timestampedName, { type: file.type });
          return Object.assign(newFile, {
            preview: URL.createObjectURL(file),
            errors: [],
            originalName: file.name
          }) as FileWithPreview;
        })

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        const newFile = new File([file], file.name, { type: file.type });
        return Object.assign(newFile, {
          preview: URL.createObjectURL(file),
          errors,
          originalName: file.name
        }) as FileWithPreview;
      })

      const newFiles = [...files, ...validFiles, ...invalidFiles]
      setFiles(newFiles)
    },
    [files, setFiles]
  )

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  })

  const onUpload = useCallback(async () => {
    setLoading(true)

    const filesWithErrors = errors.map((x) => x.name)
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(!!path ? `${path}/${file.name}` : file.name, file, {
            cacheControl: cacheControl.toString(),
            upsert,
          })
        if (error) {
          return { name: file.name, message: error.message }
        } else {
          return { name: file.name, message: undefined }
        }
      })
    )

    const responseErrors = responses.filter((x) => x.message !== undefined)
    setErrors(responseErrors)

    const responseSuccesses = responses.filter((x) => x.message === undefined)
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)])
    )
    setSuccesses(newSuccesses)

    setLoading(false)
  }, [files, path, bucketName, errors, successes])

  useEffect(() => {
    if (files.length === 0) {
      setErrors([])
    }

    if (files.length <= maxFiles) {
      let changed = false
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === 'too-many-files')) {
          file.errors = file.errors.filter((e) => e.code !== 'too-many-files')
          changed = true
        }
        return file
      })
      if (changed) {
        setFiles(newFiles)
      }
    }
  }, [files.length, setFiles, maxFiles])

  return {
    files, 
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    onUpload, 
    reset, 
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    recommendedSize,
    ...dropzoneProps,
  }
}

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturnSpecific as UseSupabaseUploadReturn } 
