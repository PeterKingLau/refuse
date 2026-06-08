import Uppy from '@uppy/core'
import XHRUpload from '@uppy/xhr-upload'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'

type UploadResponse = Record<string, any>

const normalizeHeaders = (headers?: UploadRequestOption['headers']) => {
  return Object.fromEntries(Object.entries(headers || {}).filter(([, value]) => value != null && value !== '')) as Record<string, string>
}

const normalizeUploadError = (error: unknown) => {
  if (error instanceof Error) return error
  return new Error(typeof error === 'string' ? error : 'Upload failed')
}

export const uppyUploadRequest = (options: UploadRequestOption<UploadResponse>) => {
  const file = options.file as File
  const uppy = new Uppy<Record<string, unknown>, UploadResponse>({
    autoProceed: false,
    allowMultipleUploadBatches: false
  }).use(XHRUpload, {
    endpoint: options.action,
    method: options.method || 'post',
    fieldName: options.filename || 'file',
    headers: normalizeHeaders(options.headers),
    withCredentials: options.withCredentials,
    responseType: 'json',
    getResponseData: (xhr) => xhr.response || JSON.parse(xhr.responseText || '{}')
  })

  uppy.on('upload-progress', (_file, progress) => {
    const bytesUploaded = progress.bytesUploaded || 0
    const bytesTotal = progress.bytesTotal || 0
    const percent = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0

    options.onProgress?.({ percent })
  })

  try {
    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
      meta: options.data || {}
    })
  } catch (error) {
    options.onError?.(normalizeUploadError(error))
    uppy.destroy()
    return
  }

  uppy
    .upload()
    .then(() => {
      const uploadedFile = uppy.getFiles()[0]
      options.onSuccess?.((uploadedFile?.response?.body || {}) as UploadResponse)
    })
    .catch((error) => {
      options.onError?.(normalizeUploadError(error))
    })
    .finally(() => {
      uppy.destroy()
    })
}
