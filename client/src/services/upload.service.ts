import axiosInstance from "../lib/axios";

const uploadFile = async (formData: FormData) => {
  const response = await axiosInstance.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export { uploadFile };
