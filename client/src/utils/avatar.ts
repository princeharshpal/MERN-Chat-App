export const getAvatarUrl = (profilePic?: string, fullName?: string): string => {
  if (profilePic) return profilePic;
  const name = encodeURIComponent(fullName || "User");
  return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&bold=true&size=128`;
};
