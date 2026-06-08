import * as requestApi from '@/api/request'

export const FormatDate = (time: String): string => {
  if (time) {
    return time.replace('T', ' ')
  }
  return time
}

export const GetImageURL = (imageURL: string): string => {
  return requestApi.getDownloadPicUrl(imageURL)
}

export const GetVideoURL = (videoURL: string): string => {
  return requestApi.getPlayVideoUrl(videoURL)
}

export const GetInterFaceURL = (InterFaceURL: string): string => {
  return requestApi.getApiUrl(InterFaceURL)
}

export const GetUpLoadExcelURL = (): string => {
  return requestApi.getUploadExcelUrl()
}
