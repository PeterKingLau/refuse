import { PATH_URL } from '@/config/axios/service'

export const FormatDate = (time: String): string => {
  if (time) {
    return time.replace('T', ' ')
  }
  return time
}

export const GetImageURL = (imageURL: string): string => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
}

export const GetVideoURL = (videoURL: string): string => {
  return PATH_URL + '/Common/playVideo?fileName=' + videoURL
}

export const GetInterFaceURL = (InterFaceURL: string): string => {
  return PATH_URL + InterFaceURL
}

export const GetUpLoadExcelURL = (): string => {
  return PATH_URL + '/Common/upLoadExcel'
}
