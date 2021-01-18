import {Photo} from "./usePhotoGallery";

export interface ItemProps {
  _id?: string;
  name: string;
  number: string;
  favourite: boolean;
  dateAdded: Date;
  photo?: Photo;
  position?: {latitude?: number, longitude?: number}
  // text: string;
}
