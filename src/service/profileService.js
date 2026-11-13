// AI-assisted: see docs/AI_LOG.md #24
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { uploadToCloudinary } from './cloudinary';
import { buildProfileUpdate } from '../utils/profileForm';

export const saveProfile = async (driver, forms) => {
  const { personalData, vehicleData, docsData } = forms;
  const fileUri = (f) => f?.uri || f;

  const [profilePhoto, vehiclePhoto, licenseFront, licenseBack, soatFile, technoFile] =
    await Promise.all([
      uploadToCloudinary(personalData.profilePhoto),
      uploadToCloudinary(vehicleData.vehiclePhoto),
      uploadToCloudinary(docsData.licenseFront),
      uploadToCloudinary(docsData.licenseBack),
      uploadToCloudinary(fileUri(docsData.soatFile), docsData.soatFile?.isPdf),
      uploadToCloudinary(fileUri(docsData.technoFile), docsData.technoFile?.isPdf),
    ]);

  const update = buildProfileUpdate(
    forms,
    { profilePhoto, vehiclePhoto, licenseFront, licenseBack, soatFile, technoFile },
    driver
  );

  await updateDoc(doc(db, 'drivers', driver.id), {
    ...update,
    profileUpdatedAt: serverTimestamp(),
  });
};