import KYCProfile from "../../models/KYCProfile.js";

export const createKYC = async (userId, data, files) => {
  const kyc = await KYCProfile.create({
    userId,
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    nationalId: data.nationalId,
    address: data.address,
    country: data.country,

    documentFront: files.documentFront[0].path,
    documentBack: files.documentBack[0].path,
    selfie: files.selfie[0].path,

    kycStatus: "pending"
  });

  return kyc;
};